/* ============================================================
   PROGRESS — adaptive practice, parent insight, targeted practice.
   Loaded last. Deterministic: no model, no randomness beyond tie-breaks.

   The rule for what Layla sees next is simple and inspectable:
     weak skills come back often, strong skills thin out but never vanish,
     and a brand-new sound gets the most repetition of all.
   ============================================================ */
'use strict';

/* ---------------- mastery helpers ------------------------------------ */
function skillOf(key){ return S.mastery[key] || {p:0, ok:0, att:0, recent:[], score:0, last:0}; }
function soundScore(id){ return skillOf('sound:'+id).score; }

/* Lower = more urgent. New sounds sort first, then weak, then stale. */
function practiceUrgency(id){
  const m = skillOf('sound:'+id);
  if(!m.p) return -1;                              // never practised -> top
  const staleDays = m.last ? (Date.now()-m.last)/86400000 : 99;
  return m.score - Math.min(0.25, staleDays*0.05); // decay pulls stale down
}
/* The sounds Layla should see this session, most urgent first. */
function practiceQueue(){
  return usablePhonemes(S.unlocked).slice().sort((a,b)=>practiceUrgency(a)-practiceUrgency(b));
}
function weakestPhoneme(){
  const q=practiceQueue();
  return q.length ? q[0] : null;
}
/* A sound she is solid on — used for the confidence-building warm-up.
   Must be one she has ACTUALLY practised: opening a session with a sound
   she has never met would defeat the point of a warm-up. */
function strongestPhoneme(){
  const practised = usablePhonemes(S.unlocked).filter(id=>skillOf('sound:'+id).p>0);
  if(practised.length) return practised.sort((a,b)=>soundScore(b)-soundScore(a))[0];
  const q=practiceQueue();
  return q.length ? q[0] : null;   // nothing practised yet — anything is new
}

/* Where she is in the journey. Drives which games a session can use. */
function readingStage(){
  const words = Reading.readableWords().length;
  const sounds = usablePhonemes(S.unlocked).length;
  if((S.storiesRead||[]).length) return 'stories';
  if((S.sentencesRead||[]).length) return 'sentences';
  if(S.wordsRead.length >= 3) return 'words';
  if(words >= 1 && sounds >= 3) return 'blending';
  if(sounds >= 1) return 'sounds';
  return 'name';
}

/* ---------------- the session builder --------------------------------
   Fixed shape, 5-8 minutes: warm-up, current sound, review, a reading
   task, then the reward. Deliberately finite -- no endless loop. */
function adventure(){
  const stage = readingStage();
  const focus = S.currentFocus;
  const review = weakestPhoneme();
  const warm = strongestPhoneme() || focus;
  const acts = [];

  /* 1. familiar warm-up: something she already knows, to start on a win */
  if(stage==='name' || !warm){
    acts.push({title:'Find Your Name', run:()=>Games.findName()});
  } else {
    acts.push({title:'Warm-up Bubbles', run:()=>Games.bubbles({focus:warm, mode:'name'})});
  }

  /* 2. the current sound */
  if(focus && isPhonemeUsable(focus)){
    acts.push({title:'Sound Crystals', run:()=>Games.crystals({focus})});
  }

  /* 2b. trace the letter just heard, so the hand reinforces the ear.
     Single lowercase letters only — that is what she reads. */
  if(focus && isPhonemeUsable(focus)){
    const gl=GU(focus).toLowerCase();
    if(gl.length===1 && typeof STROKES!=='undefined' && STROKES[gl]){
      acts.push({title:'Trace '+gl, run:()=>Games.trace({letter:gl})});
    }
  }

  /* 3. review of the weakest thing, in a DIFFERENT game so it is not
        the same question twice */
  if(review && review!==focus){
    acts.push({title:'Sound Steps', run:()=>Games.soundSteps({focus:review})});
  } else if(Reading.readableWords().length>=3){
    acts.push({title:'Sound Garden', run:()=>Games.startsWith()});
  }

  /* 4. the reading task — always the most advanced thing she can do */
  if(stage==='stories' || stage==='sentences'){
    acts.push({title:'Read a Story', run:()=>{ activityDone(); after(400, openStorybook); }});
  } else if(stage==='words'){
    acts.push({title:'Which Word?', run:()=>Games.whichWord()});
    acts.push({title:'Help the Kitten', run:()=>Games.rescue()});
  } else if(stage==='blending'){
    acts.push({title:'Help the Kitten', run:()=>Games.rescue()});
  } else {
    acts.push({title:'Magic Mirror', run:()=>Games.firstSound()});
  }

  /* Teach a heart word only when it is the last thing blocking sentences. */
  const h = Reading.nextHeartWord();
  if(h && S.wordsRead.length>=2 && stage!=='name'){
    acts.splice(acts.length-1, 0, {title:'A Heart Word', run:()=>Games.heartWord()});
  }

  runSession('Magical Adventure', acts, null);
  sessionReward = REWARDS.filter(r=>S.rewards.indexOf(r.id)<0)[0] || null;
}

/* ============================================================
   PARENT — plain language only. No scores, no phoneme ids, no jargon.
   ============================================================ */
function plainSummary(){
  const lines=[];
  const strong = usablePhonemes(S.unlocked).filter(id=>soundScore(id)>0.6);
  const weak   = usablePhonemes(S.unlocked).filter(id=>soundScore(id)<0.4 && skillOf('sound:'+id).p>0);
  const stage  = readingStage();
  const words  = S.wordsRead.length;
  const sents  = (S.sentencesRead||[]).length;
  const stories= (S.storiesRead||[]).length;

  const stageLine = {
    name:      'Layla is learning to recognise her own name.',
    sounds:    'Layla is learning individual letter sounds.',
    blending:  'Layla is beginning to blend sounds into words.',
    words:     'Layla is reading short words on her own.',
    sentences: 'Layla is reading whole sentences.',
    stories:   'Layla is reading short stories by herself.'
  }[stage];
  lines.push(stageLine);

  if(strong.length) lines.push('She confidently knows ' + strong.map(GU).join(', ') + '.');
  if(words) lines.push('She can now read ' + words + (words===1?' word':' words') + ' independently.');
  if(sents) lines.push('She has read ' + sents + (sents===1?' sentence':' sentences') + '.');
  if(stories) lines.push('She has finished ' + stories + (stories===1?' story':' stories') + '.');
  if(weak.length) lines.push('She needs more practice with ' + weak.map(GU).join(' and ') + ' — these will come back more often.');
  else if(strong.length) lines.push('No weak sounds right now.');

  if(S.lastMilestone && S.lastMilestone.title){
    const days = Math.floor((Date.now()-S.lastMilestone.at)/86400000);
    lines.push('Most recent milestone: ' + S.lastMilestone.title.replace(/!$/,'') +
               (days<=0 ? ' — today.' : days===1 ? ' — yesterday.' : ' — ' + days + ' days ago.'));
  }
  return lines;
}

function renderParentInsights(){
  const box=$('parent-insights'); if(!box) return;
  const appr = (typeof approvalCounts==='function') ? approvalCounts() : {APPROVED:0};
  const strong = usablePhonemes(S.unlocked).filter(id=>soundScore(id)>0.6);
  const hardest = practiceQueue().filter(id=>skillOf('sound:'+id).p>0).slice(0,3);

  const stats = [
    ['Sounds you approved',   appr.APPROVED + ' of ' + PHONEME_ORDER.length],
    ['Sounds introduced',     (S.unlocked||[]).length],
    ['Sounds she knows well', strong.length],
    ['Words read',            S.wordsRead.length],
    ['Sentences read',        (S.sentencesRead||[]).length],
    ['Stories finished',      (S.storiesRead||[]).length],
    ['Heart words learned',   (S.heartWords||[]).length],
    ['Reading minutes',       S.minutes||0],
    ['Days in a row',         (S.streak||0)]
  ];
  let h = '<div class="pi-stats">';
  stats.forEach(function(r){ h += '<div class="pi-stat"><b>'+r[1]+'</b><span>'+r[0]+'</span></div>'; });
  h += '</div>';

  h += '<div class="pi-say"><h4>What to tell Layla</h4>';
  plainSummary().forEach(function(l){ h += '<p>'+l+'</p>'; });
  h += '</div>';

  if(hardest.length){
    h += '<div class="pi-hard"><h4>Hardest sounds right now</h4><div class="pi-chips">';
    hardest.forEach(function(id){
      h += '<span class="pi-chip">'+GU(id)+'<i>'+(Phonics.byId[id]?Phonics.byId[id].target:'')+'</i></span>';
    });
    h += '</div></div>';
  }

  const ms=(S.milestones||[]);
  if(ms.length){
    h += '<div class="pi-miles"><h4>Milestones reached</h4><ul>';
    MILESTONES.forEach(function(m){
      if(ms.indexOf(m.id)>=0) h += '<li>✅ '+m.title.replace(/!$/,'')+'</li>';
    });
    h += '</ul></div>';
  }

  const recent=(S.sessions||[]).slice(-5).reverse();
  if(recent.length){
    h += '<div class="pi-sessions"><h4>Recent play</h4><ul>';
    recent.forEach(function(s){
      const d=new Date(s.d||Date.now());
      h += '<li>'+d.toLocaleDateString()+' '+d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
         + ' — '+(s.name||'session')+'</li>';
    });
    h += '</ul></div>';
  }
  box.innerHTML=h;
}

/* ---------------- parent practice mode -------------------------------
   Short targeted sessions built ONLY from approved, introduced content. */
function renderParentPractice(){
  const box=$('parent-practice'); if(!box) return;
  box.innerHTML='';
  const note=document.createElement('p'); note.className='qa-note';
  note.textContent='Launches a 2–5 minute session using only sounds you have approved.';
  box.appendChild(note);

  const grid=document.createElement('div'); grid.className='practice-grid';

  /* one button per approved+introduced sound */
  const sounds=usablePhonemes(S.unlocked);
  sounds.forEach(function(id){
    const b=document.createElement('button');
    b.textContent='Sound '+GU(id);
    b.onclick=function(){
      showScreen('game');
      runSession('Practice '+GU(id), [
        {title:'Sound Crystals', run:()=>Games.crystals({focus:id})},
        {title:'Sound Steps',    run:()=>Games.soundSteps({focus:id})},
        {title:'Magic Bubbles',  run:()=>Games.bubbles({focus:id, mode:'sound'})}
      ], null);
    };
    grid.appendChild(b);
  });

  const skills=[
    ['Blending', ()=>Reading.readableWords().length>=1, ()=>[
      {title:'Help the Kitten', run:()=>Games.rescue()},
      {title:'Build the Word',  run:()=>Games.buildWord()}
    ]],
    ['CVC words', ()=>Reading.readableWords().length>=3, ()=>[
      {title:'Which Word?',      run:()=>Games.whichWord()},
      {title:'Find the Picture', run:()=>Games.matchPicture()}
    ]],
    ['Sentences', ()=>Reading.readableSentences().length>=1, null],
    ['Rhyming',   ()=>!!Reading.rhymeRound(), ()=>[
      {title:'Rhyme Dance', run:()=>Games.rhymeDance()},
      {title:'Odd One Out', run:()=>Games.oddOneOut()}
    ]],
    ['Syllables', ()=>true, ()=>[
      {title:'Clap the Beats', run:()=>Games.syllableClaps()},
      {title:'Clap the Beats', run:()=>Games.syllableClaps()}
    ]]
  ];
  skills.forEach(function(sk){
    const b=document.createElement('button');
    const ready = (function(){ try{ return sk[1](); }catch(e){ return false; } })();
    b.textContent = sk[0] + (ready ? '' : ' 🔒');
    b.disabled = !ready;
    b.onclick=function(){
      if(sk[0]==='Sentences'){ openStorybook(); return; }
      showScreen('game');
      runSession('Practice: '+sk[0], sk[2](), null);
    };
    grid.appendChild(b);
  });
  box.appendChild(grid);
}
