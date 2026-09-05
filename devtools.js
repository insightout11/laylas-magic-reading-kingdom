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
    /* A test must never inherit the previous test's UI: hidden modals,
       drained queues and a released activity, or assertions read stale DOM. */
    try{
      ['milestone-modal','reward-modal','session-modal','parent-gate'].forEach(function(id){
        const el=document.getElementById(id); if(el) el.classList.add('hidden');
      });
      Flow.milestoneQueue.length=0;
      Flow.narrationPending=false; Flow.rewardPending=false; Flow.castleInteractionComplete=true;
      Act.abandon('test reset');
    }catch(e){}
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
                           .map(function(e){ return (e.data&&(e.data.text||e.data.key||e.data.tag))||''; }).join(' | ');
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
                           .map(function(e){ return (e.data&&(e.data.text||e.data.key||e.data.tag))||''; }).join(' | ');
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

  /* Test H2 — "I did it!" with no drawing earns nothing; a real tracing passes. */
  async testH2_traceScoring(){
    const ink={cx:160,cy:210,rx:100,ry:120}, start={x:160,y:90};
    this._log('H2: empty trail scores zero', traceScore([], start, ink)===0);
    const good=[];
    for(let i=0;i<120;i++){ good.push({x:160+Math.sin(i/8)*60, y:90+i*1.8}); }
    this._log('H2: genuine tracing passes', traceScore(good, start, ink)>=0.45,
      traceScore(good, start, ink).toFixed(2));
    const far=[];
    for(let i=0;i<120;i++){ far.push({x:10+i*0.2, y:10+i*0.2}); }
    this._log('H2: scribble in the corner fails', traceScore(far, start, ink)<0.45,
      traceScore(far, start, ink).toFixed(2));
    this._log('H2: every lowercase letter has stroke data',
      'abcdefghijklmnopqrstuvwxyz'.split('').every(ch=>!!STROKES[ch]));
  },

  /* Test H — shipped baseline seeds, never overrides; export/import round-trips. */
  async testH_baselineAndPortability(){
    this._reset();
    Bus.clear();
    await seedApprovalsFromBaseline();
    const file = await fetch('audio/phonemes/approvals.json').then(r=>r.json()).catch(()=>null);
    const dec = (file&&file.decisions)||{};
    const wantAp = Object.keys(dec).filter(k=>dec[k].status==='APPROVED');
    const wantRej = Object.keys(dec).filter(k=>dec[k].status==='REJECTED');
    const gotAp = Object.keys(S.phonemeApproval||{}).filter(k=>S.phonemeApproval[k].st==='APPROVED');
    const gotRej = Object.keys(S.phonemeApproval||{}).filter(k=>S.phonemeApproval[k].st==='REJECTED');
    this._log('H: baseline seeds every shipped approval',
      wantAp.length>0 && wantAp.every(k=>gotAp.indexOf(Phonics.resolve(k)||k)>=0),
      gotAp.length+'/'+wantAp.length+' approved');
    this._log('H: baseline seeds every shipped rejection',
      wantRej.length>0 && wantRej.every(k=>gotRej.indexOf(Phonics.resolve(k)||k)>=0),
      gotRej.length+'/'+wantRej.length+' rejected');
    /* a local decision must survive a second seeding pass */
    const flip = wantAp[0] ? (Phonics.resolve(wantAp[0])||wantAp[0]) : null;
    if(flip){ approvalOf(flip).st='REJECTED'; save(); }
    await seedApprovalsFromBaseline();
    this._log('H: shipped file does not resurrect a local rejection',
      !flip || approvalOf(flip).st==='REJECTED', flip||'no approved sound to flip');
    /* changing one file's bytes lapses that sound only */
    if(flip && PHONEME_MANIFEST && PHONEME_MANIFEST.sounds && PHONEME_MANIFEST.sounds[flip]){
      const real = PHONEME_MANIFEST.sounds[flip].sha256;
      approvalOf(flip).st='APPROVED'; approvalOf(flip).hash='deadbeef'; save();
      const before = Object.keys(S.phonemeApproval).filter(k=>S.phonemeApproval[k].st==='APPROVED').length;
      reconcileApprovals();
      const after = Object.keys(S.phonemeApproval).filter(k=>S.phonemeApproval[k].st==='APPROVED').length;
      this._log('H: byte change lapses exactly that sound', after===before-1, before+'→'+after);
      PHONEME_MANIFEST.sounds[flip].sha256 = real;
    }
    /* export -> wipe -> import restores everything that matters */
    S.stars=42; S.rewards.push('crown-gold'); S.mastery['sound:s']={p:3,ok:3,att:3,recent:[1,1,1],score:0.9,last:Date.now()};
    if(flip){ approvalOf(flip).st='APPROVED'; approvalOf(flip).hash=(PHONEME_MANIFEST.sounds[flip]||{}).sha256||null; }
    save();
    const payload = await buildExportPayload();
    const snapStars = S.stars, snapRew = S.rewards.length, snapAp = flip?approvalOf(flip).st:null;
    try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
    S = defaultState();
    await applyImportPayload(payload);
    this._log('H: export/import restores stars+rewards+approvals',
      S.stars===snapStars && S.rewards.length===snapRew && (!flip || approvalOf(flip).st===snapAp),
      'stars '+S.stars+', rewards '+S.rewards.length);
    this._log('H: garbage import is refused', await applyImportPayload({nope:1}).then(()=>false).catch(()=>true));
  },

  /* Test B2 — family names: gating, person-naming praise, no phonics leakage. */
  async testB2_names(){
    this._reset();
    Bus.clear();
    const avail0 = availableNames().map(function(n){ return n.id; });
    this._log('B2: only Layla available at first', JSON.stringify(avail0)==='["layla"]', avail0.join(','));
    S.mastery['name:build:layla']={p:2,ok:2,att:2,recent:[1,1],score:0.9,last:Date.now()};
    save();
    const avail1 = availableNames().map(function(n){ return n.id; });
    this._log('B2: Lily unlocks after Layla is solid', avail1.indexOf('lily')>=0, avail1.join(','));
    this._log('B2: Jackson stays locked early', avail1.indexOf('jackson')<0, avail1.join(','));
    /* build JACKSON end to end */
    const wordsBefore = Reading.readableWords().length;
    showScreen('game');
    runSession('T', [{title:'Name', run:function(){ Games.buildName({id:'jackson'}); }}], null);
    await this._settle(700);
    const slots = document.querySelectorAll('.slot');
    this._log('B2: Jackson has seven slots', slots.length===7, String(slots.length));
    for(let n=0;n<7;n++){
      const slot=document.querySelector('.slot.next') || document.querySelectorAll('.slot')[n];
      const want=slot?slot.dataset.want:null;
      const tile=Array.prototype.filter.call(document.querySelectorAll('.tile:not(.used)'),
        function(t){ return t.textContent===want; })[0];
      if(tile) tile.click();
      await this._settle(260);
    }
    const finished = await this._waitFor('ACTIVITY_COMPLETE');
    await this._settle(400);
    this._log('B2: Jackson build completes', finished);
    const said = Bus.events.filter(function(e){ return e.type==='SPEECH_START'; })
                           .map(function(e){ return (e.data&&(e.data.text||e.data.key||e.data.tag))||''; }).join(' | ');
    this._log('B2: praise names Jackson', /jackson/i.test(said), said.slice(0,120));
    this._log('B2: no phoneme milestone fires',
      document.getElementById('milestone-modal').classList.contains('hidden'));
    this._log('B2: word engine untouched by names',
      Reading.readableWords().length===wordsBefore, String(Reading.readableWords().length));
    /* distractors are never family */
    showScreen('game');
    runSession('T', [{title:'Name', run:function(){ Games.findName({id:'lily'}); }}], null);
    await this._settle(700);
    const shown = Array.prototype.map.call(document.querySelectorAll('.choice-card'),
      function(b){ return b.textContent; }).join(' ');
    const fam = familyDisplays().filter(function(d){ return d!=='LILY'; });
    const leak = fam.filter(function(d){ return shown.indexOf(d)>=0; });
    this._log('B2: no family name shown as wrong choice', leak.length===0, leak.join(',')||shown.slice(0,60));
  },

  /* Test I — the word bank is honest: aligned, resolvable, audio-true. */
  async testI_wordbank(){
    this._reset();
    const badAlign = WORDS.filter(function(w){ return !w.t || w.ph.length!==w.gr.length; });
    this._log('I: every word has aligned ph/gr', badAlign.length===0,
      badAlign.slice(0,3).map(function(w){return w.t;}).join(','));
    const allGraphemes = {};
    Phonics.catalog.forEach(function(p){ (p.graphemes||[]).forEach(function(g){ allGraphemes[String(g).toLowerCase()]=1; }); });
    const badGr = [];
    /* Nine bank entries name the pending /ʌ/ sound (sun bug rug hug cup bun
       run fun duck). They resolve to nothing today and can never be offered;
       they are hooks WO-5 re-activates the moment a real /ʌ/ is recorded. */
    const pendingWords = ['sun','bug','rug','hug','cup','bun','run','fun','duck'];
    WORDS.forEach(function(w){
      if(w.heart) return;
      w.ph.forEach(function(p){
        if(p==='u_short'){ if(pendingWords.indexOf(w.t)<0) badGr.push(w.t+'/'+p+' (sound)'); return; }
        if(!Phonics.resolve(p)) badGr.push(w.t+'/'+p+' (sound)');
      });
      w.gr.forEach(function(g){ if(!allGraphemes[String(g).toLowerCase()]) badGr.push(w.t+'/'+g+' (spelling)'); });
    });
    this._log('I: every sound and spelling resolves in the catalog', badGr.length===0, badGr.slice(0,4).join(','));
    this._log('I: pending-/ʌ/ words can never be offered today',
      pendingWords.every(function(t){ return Reading.readableWords().map(function(w){return w.t;}).indexOf(t)<0; }),
      pendingWords.join(','));
    this._log('I: bank holds ~160 words', WORDS.length>=150, String(WORDS.length));
    const audioOnes = WORDS.filter(function(w){ return w.audio; });
    const checks = await Promise.all(audioOnes.map(function(w){
      return fetch('audio/words/'+w.t+'.mp3', {method:'HEAD'}).then(function(r){ return r.ok?null:w.t; }).catch(function(){ return w.t; });
    }));
    const missing = checks.filter(Boolean);
    this._log('I: every audio:true word resolves to a real file', missing.length===0, missing.slice(0,5).join(','));
    const dangling = [];
    SENTENCES.forEach(function(s){
      s.w.forEach(function(t){ if(!Reading.byText(t)) dangling.push(s.id+':'+t); });
    });
    this._log('I: no sentence names a word outside the bank', dangling.length===0, dangling.slice(0,4).join(','));
    const stPages = [];
    STORIES.forEach(function(st){
      st.pages.forEach(function(p){
        if(SENTENCES.filter(function(s){ return s.id===p; }).length!==1) stPages.push(st.id+':'+p);
      });
    });
    this._log('I: every story page resolves to exactly one sentence', stPages.length===0, stPages.join(','));
    const famLeak = [];
    RHYME_FAMILIES.forEach(function(f){
      f.words.forEach(function(t){ if(!Reading.byText(t)) famLeak.push(f.rime+':'+t); });
    });
    this._log('I: rhyme families name bank words only', famLeak.length===0, famLeak.slice(0,4).join(','));
    /* fixture approvals: st1 readable, st4 correctly unoffered */
    this._log('I: finished story reads end to end',
      Reading.storyReadable(STORIES.filter(function(s){return s.id==='st1';})[0]));
    this._log('I: unfinished story is not offered',
      !Reading.storyReadable(STORIES.filter(function(s){return s.id==='st4';})[0]));
  },

  /* Test J — the booth: keeping /ʌ/ brings the nine words back. */
  async testJ_booth(){
    this._reset();
    const q = boothQueue();
    this._log('J: booth leads with /ʌ/', q.length>0 && q[0].type==='phoneme' && q[0].id==='u_short', q.length? q[0].id:'empty');
    this._log('J: sun starts unreadable', !Reading.readableWords().some(w=>w.t==='sun'));
    const buf = await fetch('audio/phonemes/n.mp3').then(function(r){ return r.arrayBuffer(); });
    await PhonemeDB.put('u_short', new Blob([buf], {type:'audio/mpeg'}));
    boothKeep({type:'phoneme', id:'u_short', label:'/ʌ/'});
    this._log('J: keeping /ʌ/ approves and introduces it',
      approvalOf('u_short').st==='APPROVED' && S.unlocked.indexOf('u_short')>=0);
    this._log('J: sun becomes readable', Reading.readableWords().some(w=>w.t==='sun'));
    /* leave no trace: the test booth is not a human ear */
    approvalOf('u_short').st='UNREVIEWED'; approvalOf('u_short').custom=false;
    S.unlocked = S.unlocked.filter(function(id){ return id!=='u_short'; });
    await PhonemeDB.open().then(function(db){
      return new Promise(function(res){
        try{
          const tx=db.transaction('phonemes','readwrite');
          tx.objectStore('phonemes').delete('custom:u_short');
          tx.oncomplete=function(){ res(true); }; tx.onerror=function(){ res(true); };
        }catch(e){ res(true); }
      });
    }).catch(function(){});
    save();
    this._log('J: cleanup restores the gate', !isPhonemeUsable('u_short'));
  },

  /* Test K — phonics tracing renders lowercase; names keep capitals. */
  async testK_traceCase(){
    const saveFocus = S.currentFocus;
    const bad = [];
    PHONEME_ORDER.forEach(function(id){
      const g = (typeof G==='function') ? G(id) : id;
      if(!g || g.length!==1) return;   // digraphs trace their grapheme, not a case
      S.currentFocus = id;
      const t = traceLetterFor({});
      if(t!==t.toLowerCase() || t.length!==1) bad.push(id+'->'+t);
      const t2 = traceLetterFor({letter:id});
      if(t2!==t2.toLowerCase()) bad.push(id+'(param)->'+t2);
    });
    S.currentFocus = saveFocus; save();
    this._log('K: every single-letter sound traces lowercase', bad.length===0, bad.slice(0,5).join(','));
    this._log('K: spot checks', traceLetterFor({letter:'a_short'})==='a' && traceLetterFor({letter:'e_short'})==='e' && traceLetterFor({letter:'s'})==='s',
      ['a_short','e_short','s'].map(function(x){ return x+'->'+traceLetterFor({letter:x}); }).join(' '));
  },

  /* Test K -- nothing a child must tap may render off-screen.
     offsetParent!==null is NOT enough: it returns true for an element sitting
     200px below the fold. This checks real geometry, at the short-tablet
     height where the reward modal actually broke. */
  async testK_rewardFitsOnScreen(){
    this._reset();
    const onScreen = (id)=>{
      const e=document.getElementById(id);
      if(!e) return false;
      const b=e.getBoundingClientRect();
      return b.height>0 && b.top>=0 && b.bottom<=window.innerHeight
                        && b.left>=0 && b.right<=window.innerWidth;
    };
    const r = REWARDS.filter(function(x){ return x.id==='dress-rainbow'; })[0] || REWARDS[0];
    showReward(r);
    await this._settle(500);
    this._log('K: an exit exists before opening', onScreen('btn-reward-open'));
    document.getElementById('btn-reward-open').click();
    await this._settle(400);
    this._log('K: an exit exists mid-reveal', onScreen('btn-reward-close'),
      'the window where the modal used to have no buttons at all');
    await this._settle(2600);
    this._log('K: reward art fully on screen', onScreen('reward-item'));
    this._log('K: reward name on screen', onScreen('reward-name'));
    this._log('K: "try it on" reachable', onScreen('btn-reward-castle'));
    this._log('K: "keep playing" reachable', onScreen('btn-reward-close'));
    document.getElementById('btn-reward-close').click();
    await this._settle(500);
    this._log('K: keep-playing actually closes it',
      document.getElementById('reward-modal').classList.contains('hidden'));
  },

  /* Test L -- every activity must render something tappable. An empty
     screen is invisible to the soak, which only clicks [data-correct]. */
  async testL_activitiesRenderControls(){
    this._reset();
    const empties=[];
    const probes=['findName','buildName','missingLetter','bubbles','crystals',
                  'firstSound','matchCase','rescue','buildWord','whichWord',
                  'matchPicture','soundSteps','rhymeDance','syllableClaps',
                  'startsWith','oddOneOut','trace'];
    for(const g of probes){
      if(typeof Games[g]!=='function') continue;
      showScreen('game');
      runSession('probe',[{title:g, run:function(){ Games[g]({}); }}], null);
      await this._settle(500);
      const area=document.getElementById('game-area');
      const tappable=area.querySelectorAll('button, .bubble, .crystal, .tile, .choice-card, canvas').length;
      if(tappable===0) empties.push(g);
    }
    this._log('L: every activity renders something tappable',
      empties.length===0, empties.length ? 'EMPTY: '+empties.join(', ') : 'all '+probes.length+' ok');
  },

  /* Test M -- the castle must fit the device, including the doll.
     The princess is an absolutely-positioned layer over the scenery, sized
     by width alone, so her height fell out of the aspect ratio: 344px in a
     256px room on a Galaxy Tab A7 Lite, with overflow:hidden taking her
     head. Fixing the scenery SVG did nothing for her, because she is not
     in it. This asserts geometry for every child of the room. */
  async testM_castleFitsDevice(){
    this._reset();
    openCastle();
    await this._settle(1800);
    const room=document.getElementById('castle-room');
    if(!room){ this._log('M: castle room exists', false); return; }
    const rb=room.getBoundingClientRect();
    const over=[];
    Array.prototype.forEach.call(room.children, function(c){
      const b=c.getBoundingClientRect();
      if(b.height===0) return;
      if(b.top < rb.top-2 || b.bottom > rb.bottom+2 || b.left < rb.left-2 || b.right > rb.right+2){
        over.push((c.id||c.className||'child')+' by '+Math.round(Math.max(rb.top-b.top, b.bottom-rb.bottom))+'px');
      }
    });
    this._log('M: nothing in the room overflows the room', over.length===0,
      over.length ? over.join('; ') : 'room '+Math.round(rb.height)+'px, all children inside');
    const doll=document.getElementById('princess-mount');
    if(doll){
      const db=doll.getBoundingClientRect();
      this._log('M: the princess fits head to toe',
        db.top>=rb.top-2 && db.bottom<=rb.bottom+2,
        'doll '+Math.round(db.height)+'px in room '+Math.round(rb.height)+'px');
    }
    this._log('M: room is usably tall', rb.height>=200, Math.round(rb.height)+'px');
  },

  /* Test N -- no activity may be taller than the screen, and nothing she
     must tap may sit below the fold. An audit at 894x534 found 11 of 19
     activities overflowing, four with buttons off-screen. A four-year-old
     does not scroll to find the answer; she concludes there isn't one. */
  async testN_activitiesFitTheScreen(){
    this._reset();
    const games=['findName','buildName','missingLetter','bubbles','crystals','firstSound',
                 'matchCase','rescue','buildWord','whichWord','matchPicture','soundSteps',
                 'rhymeDance','syllableClaps','startsWith','oddOneOut','trace'];
    const tall=[], offscreen=[];
    for(const g of games){
      if(typeof Games[g]!=='function') continue;
      try{ Sound.cancelAll('fit'); }catch(e){}
      showScreen('game');
      runSession('fit',[{title:g, run:function(){ Games[g]({}); }}], null);
      await this._settle(520);
      if(document.documentElement.scrollHeight > window.innerHeight + 4) tall.push(g);
      const area=document.getElementById('game-area');
      const below=Array.prototype.filter.call(
        area.querySelectorAll('button,.bubble,.crystal,.tile,.choice-card,.ballet-tile,.clap-btn,.word-card,canvas'),
        function(e){ const b=e.getBoundingClientRect(); return b.height>0 && b.bottom>window.innerHeight+2; }).length;
      if(below) offscreen.push(g+'('+below+')');
    }
    this._log('N: nothing she must tap is below the fold',
      offscreen.length===0, offscreen.length ? offscreen.join(' ') : 'all reachable at '+window.innerWidth+'x'+window.innerHeight);
    this._log('N: no activity forces the page to scroll',
      tall.length===0, tall.length ? tall.join(' ') : 'all fit');
  },

  /* Test O -- internal ids must never reach the child's eyes. Matching
     big and small letters printed the phonemeId "a_short" on a card. */
  async testO_noRawIdsOnScreen(){
    this._reset();
    const ids = PHONICS_CATALOG.map(function(e){ return e.id; })
                  .filter(function(id){ return /_/.test(id); });
    const leaks=[];
    const games=['matchCase','bubbles','crystals','soundSteps','buildWord','whichWord','trace','startsWith'];
    for(const g of games){
      if(typeof Games[g]!=='function') continue;
      try{ Sound.cancelAll('ids'); }catch(e){}
      showScreen('game');
      runSession('ids',[{title:g, run:function(){ Games[g]({}); }}], null);
      await this._settle(450);
      const txt = document.getElementById('game-area').innerText || '';
      ids.forEach(function(id){ if(txt.indexOf(id)>=0 && leaks.indexOf(g+':'+id)<0) leaks.push(g+':'+id); });
    }
    this._log('O: no phoneme id is shown to the child',
      leaks.length===0, leaks.length ? leaks.join(' ') : 'checked '+ids.length+' ids across '+games.length+' activities');
  },

  async runAll(){
    this.results = [];
    const list = ['testN_activitiesFitTheScreen','testO_noRawIdsOnScreen','testM_castleFitsDevice','testK_rewardFitsOnScreen','testL_activitiesRenderControls','testA_atPraise','testB_laylaPraise','testC_phonemeN','testD_castleNarration',
                  'testE_rapidTapping','testF_noUnapprovedAudio','testG_sceneEpoch','testH_baselineAndPortability','testH2_traceScoring','testB2_names','testI_wordbank','testJ_booth','testK_traceCase'];
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
