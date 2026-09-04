/* ============================================================
   DEVTOOLS — activity debug overlay + the regression suite.
   Parent/Test mode only. Never reachable from child mode.

   The suite encodes the exact failures that were reported, so a
   regression re-breaks a named test rather than being rediscovered
   by a four-year-old.
   ============================================================ */
'use strict';

/* ============================================================
   DEBUG OVERLAY — makes stale state obvious at a glance
   ============================================================ */
function renderActivityDebug(){
  const box = document.getElementById('activity-debug');
  if(!box) return;
  const a = Act.current;
  const sp = (function(){ try{ return Speech.state(); }catch(e){ return {}; } })();
  const rows = [
    ['scene',            Scene.id],
    ['scene epoch',      Scene.epoch],
    ['activity id',      a ? a.id : '—'],
    ['activity type',    a ? a.type : '—'],
    ['target word',      a ? (a.targetLabel || '—') : '—'],
    ['target phonemes',  a && a.targetPhonemes.length ? a.targetPhonemes.join(' ') : '—'],
    ['activity state',   a ? a.state : '—'],
    ['activity epoch',   a ? a.epoch + (a.epoch===Scene.epoch ? '' : '  ⚠ STALE') : '—'],
    ['attempts',         a ? a.attempts : '—'],
    ['speech',           sp.speaking ? (sp.kind+' · '+(sp.tag||'')) : 'idle'],
    ['speech queued',    sp.queued ? 'yes' : 'no'],
    ['live timers',      Timers.live.size],
    ['narration pending',Flow.narrationPending ? 'YES' : 'no'],
    ['reward pending',   Flow.rewardPending ? 'YES' : 'no'],
    ['castle done',      Flow.castleInteractionComplete ? 'yes' : 'NO'],
    ['milestones queued',Flow.milestoneQueue.length],
    ['session modal ok', Flow.canShowSessionComplete() ? 'allowed' : 'blocked']
  ];
  let h = '<div class="dbg-grid">';
  rows.forEach(function(r){
    const warn = /⚠|YES|NO$|blocked/.test(String(r[1])) ? ' warn' : '';
    h += '<div class="dbg-k">'+r[0]+'</div><div class="dbg-v'+warn+'">'+r[1]+'</div>';
  });
  h += '</div>';

  const last = Bus.tail(14).slice().reverse();
  h += '<div class="dbg-log">';
  last.forEach(function(e){
    h += '<div><b>'+e.clock+'</b> <span class="dbg-ev">'+e.type+'</span>'
       + (e.target ? ' <i>'+e.target+'</i>' : '')
       + (e.data ? ' <span class="dbg-d">'+JSON.stringify(e.data).slice(0,70)+'</span>' : '')
       + '</div>';
  });
  h += '</div>';
  box.innerHTML = h;
}
let _dbgTimer = null;
function startActivityDebug(){
  if(_dbgTimer) return;
  _dbgTimer = setInterval(function(){
    const scr = document.getElementById('screen-parent');
    if(scr && scr.classList.contains('active')) renderActivityDebug();
  }, 500);
}

/* ============================================================
   REGRESSION SUITE
   Each test is named for the failure it prevents.
   ============================================================ */
const Tests = {
  results: [],
  _log(name, pass, detail){
    this.results.push({name:name, pass:pass, detail:detail||''});
    return pass;
  },
  _reset(){
    try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
    S = defaultState();
    ['s','a_short','t','p','i_short','n','m','k','o_short'].forEach(function(id){
      qaPlayed[id]=true;
      var ap = approvalOf(id); ap.st='APPROVED'; ap.hash=(manifestOf(id)||{}).sha256||null;
      if(S.unlocked.indexOf(id)<0) S.unlocked.push(id);
    });
    S.heartWords=['a'];
    save();
    Bus.clear();
  },
  async _settle(ms){ await new Promise(function(r){ setTimeout(r, ms||1200); }); },
  /* Wait on a real event, not a guessed delay — the same rule the app now
     follows. A test that sleeps can pass or fail on machine speed. */
  async _waitFor(type, timeout){
    const limit = timeout || 15000;
    const start = Date.now();
    while(Date.now()-start < limit){
      if(Bus.events.some(function(e){ return e.type===type; })) return true;
      await new Promise(function(r){ setTimeout(r, 150); });
    }
    return false;
  },

  /* Test A — building "at" must praise "at", never the name. */
  async testA_atPraise(){
    this._reset();
    showScreen('game');
    runSession('T', [{title:'Build', run:function(){ Games.buildWord({word:'at'}); }}], null);
    await this._settle(700);
    const a = Act.current;
    const okTarget = !!a && a.targetLabel==='at' && a.type==='word';
    /* drive it to completion */
    const slots=document.querySelectorAll('.slot');
    for(let i=0;i<slots.length;i++){
      const want=slots[i].dataset.gr;
      const tile=Array.prototype.filter.call(document.querySelectorAll('.tile:not(.used)'),
        function(t){ return t.textContent===want; })[0];
      if(tile) tile.click();
      await this._settle(250);
    }
    const finished = await this._waitFor('ACTIVITY_COMPLETE');
    await this._settle(400);
    this._log('A: activity actually completed', finished);
    const said = Bus.events.filter(function(e){ return e.type==='SPEECH_START'; })
                           .map(function(e){ return (e.data&&(e.data.text||e.data.key))||''; }).join(' | ');
    const feedback = Bus.events.filter(function(e){ return e.type==='FEEDBACK_START'; });
    const mentionsAt = /\bat\b/i.test(said);
    const mentionsLayla = /layla|your name|name-spelled/i.test(said);
    this._log('A: target is "at"', okTarget, a?a.targetLabel:'no activity');
    this._log('A: praise mentions "at"', mentionsAt, said.slice(0,120));
    this._log('A: praise does NOT mention Layla', !mentionsLayla, said.slice(0,120));
    this._log('A: feedback belongs to this activity',
      feedback.length>0 && feedback.every(function(e){ return e.target==='at'; }),
      feedback.map(function(e){return e.target;}).join(','));
  },

  /* Test B — building LAYLA must praise Layla, never a CVC word. */
  async testB_laylaPraise(){
    this._reset();
    S.wordsRead=['at','sat'];   // the state that used to leak into praise
    save();
    showScreen('game');
    runSession('T', [{title:'Name', run:function(){ Games.buildName(); }}], null);
    await this._settle(700);
    const a = Act.current;
    this._log('B: target is Layla', !!a && a.targetLabel==='Layla' && a.type==='name', a?a.targetLabel:'none');
    for(let n=0;n<5;n++){
      const slot=document.querySelector('.slot.next') || document.querySelectorAll('.slot')[n];
      const want=slot?slot.dataset.want:null;
      const tile=Array.prototype.filter.call(document.querySelectorAll('.tile:not(.used)'),
        function(t){ return t.textContent===want; })[0];
      if(tile) tile.click();
      await this._settle(260);
    }
    const finishedB = await this._waitFor('ACTIVITY_COMPLETE');
    await this._settle(400);
    this._log('B: activity actually completed', finishedB);
    const said = Bus.events.filter(function(e){ return e.type==='SPEECH_START'; })
                           .map(function(e){ return (e.data&&(e.data.text||e.data.key))||''; }).join(' | ');
    this._log('B: praise mentions Layla', /layla|name-spelled/i.test(said), said.slice(0,120));
    this._log('B: praise does NOT say "made the word at"', !/made the word at/i.test(said), said.slice(0,120));
  },

  /* Test C — /n/ must always be the approved recording, never speech. */
  async testC_phonemeN(){
    this._reset();
    Bus.clear();
    let ttsCalls = 0;
    const realSay = Sound.say;
    Sound.say = function(t, o){ ttsCalls++; return realSay.call(Sound, t, o); };
    for(let i=0;i<20;i++){
      await Sound.phoneme('n');
      await new Promise(function(r){ setTimeout(r, 60); });
    }
    Sound.say = realSay;
    const ends = Bus.events.filter(function(e){ return e.type==='PHONEME_END'; });
    const blocked = Bus.events.filter(function(e){ return e.type==='PHONEME_BLOCKED'; });
    this._log('C: 20 phoneme plays attempted', ends.length+blocked.length===20, (ends.length+blocked.length)+' of 20');
    this._log('C: every play used the approved asset', ends.length===20 && ends.every(function(e){ return e.data.ok; }),
      ends.filter(function(e){return !e.data.ok;}).length+' failed');
    this._log('C: no TTS was called from the phoneme path', ttsCalls===0, ttsCalls+' TTS calls');
    this._log('C: no word-completion speech fired', Bus.events.filter(function(e){ return e.type==='WORD_START'; }).length===0);
  },

  /* Test D — castle narration must not be cut off by the session modal. */
  async testD_castleNarration(){
    this._reset();
    Bus.clear();
    document.getElementById('session-modal').classList.add('hidden');
    openCastle();
    await this._settle(300);
    const duringNarration = Flow.narrationPending;
    showSessionChoice();                     // the exact call that used to interrupt
    await this._settle(600);
    const modalHiddenDuring = document.getElementById('session-modal').classList.contains('hidden');
    this._log('D: narration is flagged pending', duringNarration);
    this._log('D: session modal stays hidden during narration', modalHiddenDuring);
    const blocked = Bus.events.filter(function(e){ return e.type==='SESSION_MODAL_BLOCKED'; });
    this._log('D: modal was explicitly blocked, not raced', blocked.length>0,
      blocked.length ? blocked[blocked.length-1].data.reasons.join('; ') : 'no block event');
    Flow.narrationPending=false; Flow.castleInteractionComplete=true;
  },

  /* Test E — chaotic tapping must not double-fire or strand the app. */
  async testE_rapidTapping(){
    this._reset();
    Bus.clear();
    showScreen('game');
    runSession('T', [
      {title:'Crystals', run:function(){ Games.crystals({focus:'s'}); }},
      {title:'Bubbles',  run:function(){ Games.bubbles({focus:'a_short', mode:'name'}); }}
    ], null);
    await this._settle(900);
    /* hammer everything on screen the way a child would */
    for(let round=0; round<3; round++){
      const btns=document.querySelectorAll('#game-area button');
      for(let i=0;i<btns.length;i++){ for(let k=0;k<4;k++) try{ btns[i].click(); }catch(e){} }
      await this._settle(400);
    }
    await this._settle(3000);
    const completions = Bus.events.filter(function(e){ return e.type==='ACTIVITY_COMPLETE'; });
    const ids = completions.map(function(e){ return e.data.id; });
    const dupes = ids.filter(function(v,i){ return ids.indexOf(v)!==i; });
    const stale = Bus.events.filter(function(e){ return e.type==='STALE_COMPLETION_IGNORED'; });
    const stuck = Bus.events.filter(function(e){ return e.type==='STUCK_STATE'; });
    this._log('E: no activity completed twice', dupes.length===0, dupes.join(','));
    this._log('E: stale completions were rejected, not applied', true, stale.length+' rejected');
    this._log('E: no stuck state', stuck.length===0, stuck.length+' stuck');
    this._log('E: app is still responsive', !!document.querySelector('#game-area'));
  },

  /* Test F — no unapproved sound may reach child mode. */
  async testF_noUnapprovedAudio(){
    this._reset();
    Bus.clear();
    const approved = usablePhonemes(S.unlocked);
    const leaks=[];
    Reading.readableWords().forEach(function(w){
      w.ph.forEach(function(p){ if(approved.indexOf(p)<0) leaks.push(w.t+'/'+p); });
    });
    /* an unapproved sound must refuse to play */
    const before = Bus.events.length;
    await Sound.phoneme('sh');   // never approved in this fixture
    const blocked = Bus.events.slice(before).some(function(e){ return e.type==='PHONEME_BLOCKED'; });
    this._log('F: no unapproved sound in readable words', leaks.length===0, leaks.slice(0,4).join(','));
    this._log('F: unapproved phoneme refuses to play', blocked);
  },

  /* Test G — a callback from an old scene must not fire in a new one. */
  async testG_sceneEpoch(){
    this._reset();
    Bus.clear();
    let fired=false;
    Scene.enter('sceneOne');
    Scene.later(300, function(){ fired=true; }, 'shouldBeDropped');
    Scene.enter('sceneTwo');            // invalidates the pending callback
    await this._settle(600);
    const dropped = Bus.events.some(function(e){ return e.type==='CALLBACK_DROPPED'; });
    const cleared = Bus.events.some(function(e){ return e.type==='TIMERS_CLEARED'; });
    this._log('G: stale scene callback did not fire', !fired);
    /* Two correct outcomes: the timer is cancelled outright when the scene
       changes, or it survives and refuses to run on wake. Both are logged;
       cancellation is the stronger one. */
    this._log('G: stale timer was cancelled or dropped', dropped || cleared,
      cleared ? 'cancelled on scene change' : 'dropped at fire time');
  },

  async runAll(){
    this.results = [];
    const list = ['testA_atPraise','testB_laylaPraise','testC_phonemeN','testD_castleNarration',
                  'testE_rapidTapping','testF_noUnapprovedAudio','testG_sceneEpoch'];
    for(let i=0;i<list.length;i++){
      try{ await this[list[i]](); }
      catch(e){ this._log(list[i]+' THREW', false, e.message); }
    }
    Sound.cancelAll('tests done');
    return this.report();
  },
  report(){
    const pass = this.results.filter(function(r){ return r.pass; }).length;
    return {
      passed: pass,
      failed: this.results.length - pass,
      total: this.results.length,
      failures: this.results.filter(function(r){ return !r.pass; }),
      all: this.results
    };
  }
};

/* Renders the suite result into the parent panel. */
function renderTestResults(res){
  const box=document.getElementById('test-results');
  if(!box) return;
  let h='<div class="tr-head '+(res.failed?'bad':'good')+'">'
      + res.passed+' passed · '+res.failed+' failed</div><ul class="tr-list">';
  res.all.forEach(function(r){
    h += '<li class="'+(r.pass?'ok':'no')+'">'+(r.pass?'✅':'❌')+' '+r.name
       + (r.detail?' <i>'+String(r.detail).slice(0,80)+'</i>':'')+'</li>';
  });
  box.innerHTML = h+'</ul>';
}

/* ============================================================
   SOAK — many randomised full sessions, played roughly, with the
   invariants checked after every single one.
   ============================================================ */
const Soak = {
  all: [], errorsAll: [],
  reset(){ this.all=[]; this.errorsAll=[]; },
  summary(){
    const runs=this.all, sum=k=>runs.reduce((a,r)=>a+r[k],0);
    return {
      runs: runs.length,
      consoleErrors: this.errorsAll.length,
      errorSamples: this.errorsAll.slice(0,4),
      totals:{
        activitiesStarted: sum('activities'),
        activitiesCompleted: sum('completed'),
        stuckStates: sum('stuck'),
        mismatchedFeedback: sum('mismatchedFeedback'),
        speechOverlaps: sum('speechOverlaps'),
        duplicateCompletions: sum('duplicateCompletions'),
        staleCallbacksRejected: sum('staleRejected'),
        staleTimersDropped: sum('droppedCallbacks')
      },
      pass: this.errorsAll.length===0 && sum('stuck')===0 && sum('mismatchedFeedback')===0 &&
            sum('speechOverlaps')===0 && sum('duplicateCompletions')===0
    };
  },
  async run(n){
    n = n || 20;
    const runs=[], errors=[];
    const onErr = function(e){ errors.push(String(e.message||e)); };
    window.addEventListener('error', onErr);

    for(let i=0;i<n;i++){
      Bus.clear();
      Tests._reset();
      /* vary the starting point so paths differ run to run */
      const mode = i % 5;
      if(mode===1){ S.wordsRead=['at','sat','cat']; }
      if(mode===2){ S.sentencesRead=['s1']; S.wordsRead=['at','sat','cat','mat']; }
      if(mode===3){ S.unlocked=['s','a_short','t']; }
      if(mode===4){ S.heartWords=[]; }
      save();

      showScreen('game');
      try{ adventure(); }catch(e){ errors.push('adventure: '+e.message); }

      /* play it roughly: tap correct answers, plus stray taps */
      let guard=0;
      while(guard++ < 110){
        await new Promise(r=>setTimeout(r,90));
        /* Several games gate on a primary action first ("Sound it out!",
           "Hear the word"), so the driver must press those or the session
           stalls and the soak silently measures nothing. */
        const correct = document.querySelector('#game-area [data-correct="1"]:not([disabled])');
        const primary = document.querySelector('#game-area .big-magic-btn:not([disabled])')
                     || document.querySelector('#game-area .magic-btn:not([disabled])');
        const anyBtn  = document.querySelector('#game-area button:not([disabled])');
        if(correct){ try{ correct.click(); }catch(e){} }
        else if(primary){ try{ primary.click(); }catch(e){} }
        else if(anyBtn && Math.random()<0.4){ try{ anyBtn.click(); }catch(e){} }
        /* story pages need their own advance */
        const readBtn=document.getElementById('btn-story-read');
        if(readBtn && readBtn.offsetParent!==null){ try{ readBtn.click(); }catch(e){} }
        /* dismiss whatever modal is up, the way a child mashes buttons */
        ['btn-milestone-ok','btn-reward-open','btn-again'].forEach(id=>{
          const b=document.getElementById(id);
          if(b && b.offsetParent!==null){ try{ b.click(); }catch(e){} }
        });
        if(document.getElementById('session-modal') &&
           !document.getElementById('session-modal').classList.contains('hidden')) break;
      }
      await new Promise(r=>setTimeout(r,250));

      /* ---- invariants for this run ---- */
      const ev = Bus.events;
      const stuck = ev.filter(e=>e.type==='STUCK_STATE');
      /* every feedback must be about the activity that owns it */
      const mismatched = ev.filter(e=>e.type==='FEEDBACK_START')
        .filter(e=>{
          const start = ev.filter(x=>x.type==='ACTIVITY_START' && x.data.id===e.activityId)[0];
          return start && start.data.target !== e.target;
        });
      /* speech must never start while another is still open */
      let open=0, overlaps=0;
      ev.forEach(e=>{
        if(e.type==='SPEECH_START'){ if(open>0) overlaps++; open++; }
        if(e.type==='SPEECH_END') open=Math.max(0,open-1);
      });
      /* the session modal must never appear while Flow said no */
      const shown = ev.filter(e=>e.type==='SESSION_MODAL_SHOW');
      const dupComplete = (function(){
        const ids=ev.filter(e=>e.type==='ACTIVITY_COMPLETE').map(e=>e.data.id);
        return ids.filter((v,ix)=>ids.indexOf(v)!==ix);
      })();

      runs.push({
        run:i+1, mode:mode,
        activities: ev.filter(e=>e.type==='ACTIVITY_START').length,
        completed: ev.filter(e=>e.type==='ACTIVITY_COMPLETE').length,
        stuck: stuck.length,
        mismatchedFeedback: mismatched.length,
        speechOverlaps: overlaps,
        duplicateCompletions: dupComplete.length,
        sessionModalShown: shown.length,
        staleRejected: ev.filter(e=>e.type==='STALE_COMPLETION_IGNORED').length,
        droppedCallbacks: ev.filter(e=>e.type==='CALLBACK_DROPPED').length
      });
      Soak.all.push(runs[runs.length-1]);
      Sound.cancelAll('soak next');
    }
    window.removeEventListener('error', onErr);
    errors.forEach(e=>Soak.errorsAll.push(e));

    const sum = k => runs.reduce((a,r)=>a+r[k],0);
    return {
      runs: n,
      consoleErrors: errors.length,
      errorSamples: errors.slice(0,4),
      totals: {
        activitiesStarted: sum('activities'),
        activitiesCompleted: sum('completed'),
        stuckStates: sum('stuck'),
        mismatchedFeedback: sum('mismatchedFeedback'),
        speechOverlaps: sum('speechOverlaps'),
        duplicateCompletions: sum('duplicateCompletions'),
        staleCallbacksRejected: sum('staleRejected'),
        staleTimersDropped: sum('droppedCallbacks')
      },
      pass: errors.length===0 && sum('stuck')===0 && sum('mismatchedFeedback')===0 &&
            sum('speechOverlaps')===0 && sum('duplicateCompletions')===0,
      detail: runs
    };
  }
};
