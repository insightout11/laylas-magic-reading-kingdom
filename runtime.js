/* ============================================================
   RUNTIME — deterministic sequencing spine.
   Loaded immediately after app.js, before the zone files.

   WHY THIS EXISTS
   The app was unreliable because feedback, transitions and audio were each
   driven by whatever global happened to be set at the time, and progressed
   on blind timers. Four confirmed root causes:

   1. Milestone celebrations fired from celebrateRight() and took their text
      from GLOBAL state (S.wordsRead[0]) or a permanently-true flag
      (S.mastery['name:build']). So building "at" announced "You spelled your
      name!", and building LAYLA announced "You read a word! at".
   2. Praise strings embedded PHONEMES[id].cue — teacher mnemonics like
      'nnn' / 'ssss' — and sent them to text-to-speech, which reads them out
      as "n n n". Cues are for the parent panel, never for the voice.
   3. Two independent text-to-speech paths existed; one called
      speechSynthesis.speak() directly, bypassing the single-channel queue.
   4. Progression ran on bare setTimeout, so the next activity could start
      talking over the previous one's feedback.

   THE RULES THIS FILE ENFORCES
   - Exactly one authoritative activity object. All feedback derives from it.
   - Every completion carries the activity it belongs to; stale ones are
     dropped, not applied to whatever is on screen now.
   - Every deferred callback carries a scene epoch and dies if the scene moved.
   - One public audio path per sound type, each returning a promise.
   - Nothing auto-advances while speech is playing.
   - The session-complete modal is never on a timer; it asks permission.
   ============================================================ */
'use strict';

/* ============================================================
   BUS — ordered event log. The thing that makes stale state visible.
   ============================================================ */
const Bus = {
  events: [],
  max: 300,
  emit(type, data){
    const e = {
      t: Date.now(),
      clock: new Date().toLocaleTimeString('en-GB'),
      type: type,
      scene: Scene.id,
      epoch: Scene.epoch,
      activityId: (Act.current && Act.current.id) || null,
      target: (Act.current && Act.current.targetLabel) || null,
      data: data || null
    };
    this.events.push(e);
    if(this.events.length > this.max) this.events.shift();
    if(Bus.verbose) try{ console.log('['+e.type+']', e.target||'', e.data||''); }catch(x){}
    return e;
  },
  since(type){
    for(let i=this.events.length-1;i>=0;i--) if(this.events[i].type===type) return this.events[i];
    return null;
  },
  tail(n){ return this.events.slice(-(n||25)); },
  clear(){ this.events.length=0; }
};

/* ============================================================
   SCENE — epoch tokens. Anything deferred must carry one.
   ============================================================ */
const Scene = {
  id: 'boot',
  epoch: 0,
  enter(id){
    this.epoch++;
    this.id = id;
    Bus.emit('SCENE_ENTER', {id:id, epoch:this.epoch});
    Sound.cancelAll('scene:'+id);
    Act.abandon('scene change');
    Flow.reset();
    return this.epoch;
  },
  token(){ return this.epoch; },
  valid(token){ return token === this.epoch; },
  /* Deferred work that dies with its scene. Use INSTEAD of setTimeout. */
  later(ms, fn, label){
    const tok = this.epoch;
    const id = setTimeout(()=>{
      Timers.forget(id);
      if(tok !== Scene.epoch){ Bus.emit('CALLBACK_DROPPED', {label:label||'timer', wasEpoch:tok}); return; }
      try{ fn(); }catch(e){ Bus.emit('ERROR', {where:label||'timer', msg:e.message}); }
    }, ms);
    Timers.track(id);
    return id;
  }
};

/* Every timer we create is tracked so a scene change can clear the lot. */
const Timers = {
  live: new Set(),
  track(id){ this.live.add(id); },
  forget(id){ this.live.delete(id); },
  clearAll(reason){
    let n=0;
    this.live.forEach(id=>{ clearTimeout(id); n++; });
    this.live.clear();
    if(n) Bus.emit('TIMERS_CLEARED', {count:n, reason:reason||''});
  }
};

/* ============================================================
   SOUND — the ONE public audio path. Everything returns a promise so
   callers can await instead of guessing with a delay.
   ============================================================ */
const Sound = {
  /* Wait until the single speech channel is genuinely free. */
  idle(maxMs){
    const limit = maxMs || 8000;
    const started = Date.now();
    return new Promise(resolve=>{
      const tick = ()=>{
        if(typeof Speech==='undefined' || !Speech.isSpeaking()) return resolve(true);
        if(Date.now()-started > limit){
          Bus.emit('SPEECH_WAIT_TIMEOUT', {waited:Date.now()-started});
          return resolve(false);
        }
        setTimeout(tick, 90);
      };
      tick();
    });
  },
  cancelAll(reason){
    try{ Speech.cancel(reason||'cancelAll'); }catch(e){}
    Timers.clearAll(reason);
    Bus.emit('AUDIO_CANCEL', {reason:reason||''});
  },

  /* Spoken instruction / feedback. TTS or a recorded clip, one channel. */
  say(text, opts){
    opts = opts || {};
    Bus.emit('SPEECH_START', {kind:'say', text:String(text).slice(0,60)});
    return new Promise(resolve=>{
      if(!text){ resolve(false); return; }
      Speech.request(opts.prio||3, 'say:'+String(text).slice(0,24), 'tts', (cancelled, done, track)=>{
        Speech._ttsInto(text, opts, track, cancelled, (why)=>{
          done(why);
          Bus.emit('SPEECH_END', {kind:'say', why:why});
          resolve(why==='done');
        });
      });
    });
  },
  /* Pre-recorded character line, falling back to TTS for the same words. */
  clip(key, fallbackText, opts){
    opts = opts || {};
    Bus.emit('SPEECH_START', {kind:'clip', key:key});
    return new Promise(resolve=>{
      Speech.request(opts.prio||3, 'clip:'+key, 'clip', (cancelled, done, track)=>{
        Speech.playFile(VOICE_DIR+key+'.mp3', null, track).then(ok=>{
          if(cancelled()){ done('cancelled'); Bus.emit('SPEECH_END',{kind:'clip',why:'cancelled'}); resolve(false); return; }
          if(ok){ done('done'); Bus.emit('SPEECH_END',{kind:'clip',key:key,why:'done'}); resolve(true); return; }
          done('missing');
          if(fallbackText){ Sound.say(fallbackText, opts).then(resolve); }
          else { Bus.emit('SPEECH_END',{kind:'clip',why:'missing'}); resolve(false); }
        });
      });
    });
  },
  /* An approved phoneme recording. NEVER speech, never a letter name.
     If the asset is unusable this plays a soft cue and resolves false —
     it does not fall back to saying anything. */
  phoneme(id){
    Bus.emit('PHONEME_START', {id:id});
    return new Promise(resolve=>{
      const pid = Phonics.resolve(id);
      if(!pid || !isPhonemeUsable(pid)){
        Bus.emit('PHONEME_BLOCKED', {id:id, reason:'not approved'});
        try{ AudioSys.sfx('boop', 0.35); }catch(e){}
        resolve(false); return;
      }
      try{ showMouthCue(pid); }catch(e){}
      Speech.request(1, 'phoneme:'+pid, 'phoneme', (cancelled, done, track)=>{
        AudioSys.duck(true); AudioSys._ducked=true;
        AudioSys.resolvePhoneme(pid).then(src=>{
          if(cancelled() || !src){
            AudioSys.duck(false); AudioSys._ducked=false; done('cancelled');
            Bus.emit('PHONEME_END',{id:pid,why:'cancelled'}); resolve(false); return;
          }
          Speech.playFile(src, null, track).then(ok=>{
            AudioStat.phoneme[pid] = ok?'ok':'missing';
            AudioSys.duck(false); AudioSys._ducked=false;
            done(ok?'done':'missing');
            Bus.emit('PHONEME_END', {id:pid, ok:ok});
            resolve(ok);
          });
        });
      });
    });
  },
  /* A whole word. Recorded file preferred; TTS only for the word itself. */
  word(text, opts){
    opts = opts || {};
    Bus.emit('WORD_START', {word:text});
    return new Promise(resolve=>{
      Speech.request(2, 'word:'+text, 'word', (cancelled, done, track)=>{
        AudioSys.duck(true); AudioSys._ducked=true;
        Speech.playFile(WORD_DIR+text+'.mp3', null, track).then(ok=>{
          AudioSys.duck(false); AudioSys._ducked=false;
          if(cancelled()){ done('cancelled'); resolve(false); return; }
          done('done');
          Bus.emit('WORD_END', {word:text, recorded:ok});
          if(ok) resolve(true);
          else Sound.say(text, {rate:opts.rate||0.8}).then(resolve);
        });
      });
    });
  },
  /* Blend: each sound, a beat, then the whole word. Resolves when finished. */
  blend(wordObj, hooks){
    hooks = hooks || {};
    Bus.emit('BLEND_START', {word:wordObj.t, phonemes:wordObj.ph});
    return new Promise(resolve=>{
      Speech.request(2, 'blend:'+wordObj.t, 'word', (cancelled, done, track)=>{
        AudioSys.duck(true); AudioSys._ducked=true;
        const finish=(why)=>{
          AudioSys.duck(false); AudioSys._ducked=false;
          done(why); Bus.emit('BLEND_END', {word:wordObj.t, why:why});
          resolve(why==='done');
        };
        (async ()=>{
          for(let i=0;i<wordObj.ph.length;i++){
            if(cancelled()){ finish('cancelled'); return; }
            try{ hooks.onPhoneme && hooks.onPhoneme(i, wordObj.ph[i]); }catch(e){}
            const src = await AudioSys.resolvePhoneme(wordObj.ph[i]);
            if(src) await Speech.playFile(src, null, track);
            await new Promise(r=>setTimeout(r,140));
          }
          if(cancelled()){ finish('cancelled'); return; }
          try{ hooks.onBlended && hooks.onBlended(); }catch(e){}
          await new Promise(r=>setTimeout(r,380));
          if(cancelled()){ finish('cancelled'); return; }
          const okW = await Speech.playFile(WORD_DIR+wordObj.t+'.mp3', null, track);
          if(!okW){
            await new Promise(r=>{ AudioSys.speak(wordObj.t,{rate:0.75}); setTimeout(r,900); });
          }
          finish('done');
        })();
      });
    });
  },
  sfx(name, vol){ try{ AudioSys.sfx(name, vol); }catch(e){} }
};

/* ============================================================
   ACT — the single authoritative activity.
   Nothing else may hold "the current word".
   ============================================================ */
const ActState = {
  IDLE:'IDLE', INSTRUCTION:'INSTRUCTION', WAITING:'WAITING_FOR_INPUT',
  EVALUATING:'EVALUATING', SUCCESS:'SUCCESS_ANIMATION', FEEDBACK:'FEEDBACK',
  COMPLETE:'COMPLETE', READY:'TRANSITION_READY', ABANDONED:'ABANDONED'
};

const Act = {
  current: null,
  _seq: 0,

  /* Begin an activity. The returned object is the ONLY source of truth for
     what this activity is teaching and what it owns. */
  start(spec){
    if(this.current && !this.current.done){
      Bus.emit('ACTIVITY_PREEMPTED', {id:this.current.id, state:this.current.state});
      this.current.done = true;
      this.current.state = ActState.ABANDONED;
    }
    const a = {
      id: 'A'+(++this._seq),
      type: spec.type || 'unknown',
      sceneId: Scene.id,
      epoch: Scene.epoch,
      /* immutable teaching context */
      targetWord: spec.targetWord || null,
      targetLabel: spec.targetLabel || spec.targetWord || null,
      targetPhonemes: (spec.targetPhonemes || []).slice(),
      prompt: spec.prompt || '',
      expectedAnswer: spec.expectedAnswer != null ? spec.expectedAnswer : null,
      masteryKey: spec.masteryKey || null,
      /* praise is a FUNCTION of this activity, so it can never describe
         a different word than the one being taught */
      praiseFn: spec.praise || null,
      /* progress */
      state: ActState.INSTRUCTION,
      attempts: 0,
      firstTry: true,
      done: false,
      startedAt: Date.now()
    };
    this.current = a;
    Bus.emit('ACTIVITY_START', {id:a.id, type:a.type, target:a.targetLabel, phonemes:a.targetPhonemes});
    return a;
  },

  /* Enrich the activity the session already started, rather than starting a
     competing one. A game calls this to declare what it owns; the session
     owns the lifecycle. This is what keeps "one authoritative activity"
     true across all 22 games without each one inventing its own. */
  describe(spec){
    const a = this.current;
    if(!a || a.done) return this.start(spec);
    if(spec.type) a.type = spec.type;
    if(spec.targetWord != null) a.targetWord = spec.targetWord;
    if(spec.targetLabel != null) a.targetLabel = spec.targetLabel;
    if(spec.targetPhonemes) a.targetPhonemes = spec.targetPhonemes.slice();
    if(spec.prompt) a.prompt = spec.prompt;
    if(spec.masteryKey) a.masteryKey = spec.masteryKey;
    if(spec.praise) a.praiseFn = spec.praise;
    a.state = ActState.WAITING;
    Bus.emit('ACTIVITY_DESCRIBE', {id:a.id, type:a.type, target:a.targetLabel, phonemes:a.targetPhonemes});
    return a;
  },

  /* Mark the current activity finished without the full praise sequence —
     used by activityDone() so every path closes the activity exactly once. */
  closeCurrent(reason){
    const a = this.current;
    if(!a || a.done) return false;
    a.done = true;
    a.state = ActState.COMPLETE;
    Bus.emit('ACTIVITY_COMPLETE', {id:a.id, target:a.targetLabel, via:reason||'activityDone'});
    return true;
  },

  /* The ownership guard. Every callback must pass its activity through this
     before it is allowed to speak, praise, reward or transition. */
  owns(a){
    return !!a && !a.done && this.current === a && a.epoch === Scene.epoch;
  },
  setState(a, s){
    if(!this.owns(a)) return false;
    a.state = s;
    Bus.emit('STATE', {id:a.id, state:s});
    Watchdog.poke();
    return true;
  },
  wrongAnswer(a){
    if(!this.owns(a)) return;
    a.attempts++; a.firstTry = false;
    Bus.emit('ANSWER_WRONG', {id:a.id, attempts:a.attempts});
  },
  abandon(reason){
    const a = this.current;
    if(a && !a.done){
      a.done = true; a.state = ActState.ABANDONED;
      Bus.emit('ACTIVITY_ABANDONED', {id:a.id, reason:reason||''});
    }
    this.current = null;
  },

  /* The one way an activity finishes. Sequence is explicit and awaited:
       success animation -> feedback speech -> speech ends -> pause -> next
     No timer forces progression, and the next activity cannot start
     talking over this one. */
  async finish(a, opts){
    opts = opts || {};
    if(!this.owns(a)){
      Bus.emit('STALE_COMPLETION_IGNORED', {id:a?a.id:null, current:this.current?this.current.id:null});
      return false;
    }
    Bus.emit('ANSWER_CORRECT', {id:a.id, target:a.targetLabel});

    /* 1. success animation */
    this.setState(a, ActState.SUCCESS);
    Bus.emit('SUCCESS_ANIMATION_START', {id:a.id});
    try{ Sound.sfx('success'); sparkles(16); twinklePose('happy'); }catch(e){}
    if(opts.animation){ try{ await opts.animation(); }catch(e){} }
    else await new Promise(r=>setTimeout(r, 420));
    if(!this.owns(a)) return false;
    Bus.emit('SUCCESS_ANIMATION_END', {id:a.id});

    /* 2. mastery, recorded against THIS activity's own key */
    if(a.masteryKey){
      try{ record(a.masteryKey, a.firstTry && a.attempts===0); }catch(e){}
    }

    /* 3. feedback — derived from the activity, never from a global */
    this.setState(a, ActState.FEEDBACK);
    Bus.emit('FEEDBACK_START', {id:a.id, target:a.targetLabel});
    /* Praise may be declared at start() or supplied at finish(); the
       call site is free to choose. Honour both, finish() winning, and fall
       back to generic only when neither is given. */
    const praiseFn = opts.praise || a.praiseFn || Praise.generic;
    try{ await praiseFn(a); }
    catch(e){ Bus.emit('ERROR', {where:'praise', msg:e.message}); }
    await Sound.idle();
    if(!this.owns(a)) return false;
    Bus.emit('FEEDBACK_END', {id:a.id});

    /* 4. complete */
    this.setState(a, ActState.COMPLETE);
    a.done = true;
    Bus.emit('ACTIVITY_COMPLETE', {id:a.id, target:a.targetLabel});

    /* 5. a breath, then hand over */
    await new Promise(r=>setTimeout(r, 420));
    if(a.epoch !== Scene.epoch){
      Bus.emit('CALLBACK_DROPPED', {label:'finish/transition', wasEpoch:a.epoch});
      return false;
    }
    a.state = ActState.READY;
    Bus.emit('TRANSITION_START', {id:a.id});
    if(opts.then) { try{ opts.then(); }catch(e){} }
    else { try{ activityDone(); }catch(e){} }
    return true;
  }
};

/* ============================================================
   PRAISE — always about the activity's own target.
   Cue strings ('nnn', 'ssss') are teacher shorthand and are NEVER spoken;
   the sound itself is played instead.
   ============================================================ */
const Praise = {
  async generic(a){
    await Sound.clip('you-did-it', 'You did it!');
  },
  /* "You made the word at!" / "You spelled Layla!" — from a.targetLabel. */
  async word(a){
    await Sound.clip('you-did-it', null, {prio:4});
    await Sound.idle();
    const label = a.targetLabel || a.targetWord;
    if(a.type === 'name'){
      await Sound.clip('name-spelled', 'You spelled '+label+'!', {prio:4});
    } else {
      await Sound.say('You made the word '+label+'!', {prio:4});
    }
  },
  /* Sound praise: say the letter, then PLAY the real phoneme. */
  async sound(a){
    const id = a.targetPhonemes[0];
    if(!id){ await this.generic(a); return; }
    const letter = GU(id);
    const ok = await Sound.clip('yes-'+G(id), null, {prio:4});
    if(!ok) await Sound.say('Yes! '+letter+'!', {prio:4});
    await Sound.idle();
    await new Promise(r=>setTimeout(r, 260));
    await Sound.phoneme(id);
  }
};

/* ============================================================
   FLOW — who is allowed to show the session-complete modal, and when.
   Milestones are QUEUED here and only ever shown between activities, so a
   celebration can never appear in the middle of a different activity and
   describe the wrong thing.
   ============================================================ */
const Flow = {
  narrationPending: false,
  rewardPending: false,
  castleInteractionComplete: true,
  milestoneQueue: [],

  reset(){
    this.narrationPending = false;
    this.rewardPending = false;
    Bus.emit('FLOW_RESET', null);
  },
  queueMilestone(m){
    if(this.milestoneQueue.some(x=>x.id===m.id)) return;
    this.milestoneQueue.push(m);
    Bus.emit('MILESTONE_QUEUED', {id:m.id, title:m.title});
  },
  hasMilestones(){ return this.milestoneQueue.length>0; },
  nextMilestone(){ return this.milestoneQueue.shift() || null; },

  /* Every condition, named, in one place. Nothing else may decide this. */
  canShowSessionComplete(){
    const reasons=[];
    if(Act.current && !Act.current.done) reasons.push('activity '+Act.current.id+' in '+Act.current.state);
    if(this.narrationPending) reasons.push('scene narration playing');
    if(this.rewardPending) reasons.push('reward flow open');
    if(!this.castleInteractionComplete) reasons.push('castle interaction pending');
    if(this.milestoneQueue.length) reasons.push('milestones queued');
    try{ if(Speech.isSpeaking()) reasons.push('speech active'); }catch(e){}
    try{
      if(!document.getElementById('reward-modal').classList.contains('hidden')) reasons.push('reward modal open');
      if(!document.getElementById('milestone-modal').classList.contains('hidden')) reasons.push('milestone modal open');
    }catch(e){}
    if(reasons.length){ Bus.emit('SESSION_MODAL_BLOCKED', {reasons:reasons}); return false; }
    return true;
  },
  /* Wait for the app to become quiet, then run fn. Never forces. */
  whenQuiet(fn, label, tries){
    const tok = Scene.epoch;
    let n = tries==null ? 40 : tries;
    const tick = ()=>{
      if(tok !== Scene.epoch){ Bus.emit('CALLBACK_DROPPED', {label:label||'whenQuiet'}); return; }
      if(this.canShowSessionComplete()){ fn(); return; }
      if(--n <= 0){ Bus.emit('WHEN_QUIET_GAVE_UP', {label:label||''}); return; }
      Scene.later(250, tick, label||'whenQuiet');
    };
    tick();
  }
};

/* ============================================================
   WATCHDOG — dev-only. Never leave a four-year-old on a frozen screen.
   ============================================================ */
const Watchdog = {
  TRANSIENT: [ActState.EVALUATING, ActState.SUCCESS, ActState.FEEDBACK],
  LIMIT_MS: 15000,
  _t: null,
  poke(){
    clearTimeout(this._t);
    const a = Act.current;
    if(!a || a.done) return;
    if(this.TRANSIENT.indexOf(a.state) < 0) return;
    const id=a.id, st=a.state;
    this._t = setTimeout(()=>{
      const cur = Act.current;
      if(!cur || cur.id!==id || cur.done || cur.state!==st) return;
      const report = {
        activityId: id, state: st, scene: Scene.id, epoch: Scene.epoch,
        target: cur.targetLabel,
        pendingAudio: (function(){ try{ return Speech.state(); }catch(e){ return null; } })(),
        liveTimers: Timers.live.size
      };
      Bus.emit('STUCK_STATE', report);
      try{ console.warn('STUCK_STATE', report); }catch(e){}
      /* Recover rather than freeze: release the channel and move on. */
      Sound.cancelAll('watchdog');
      cur.done = true;
      try{ activityDone(); }catch(e){}
    }, this.LIMIT_MS);
  }
};

if(typeof module!=='undefined' && module.exports){
  module.exports = {Bus, Scene, Timers, Sound, Act, ActState, Praise, Flow, Watchdog};
}
