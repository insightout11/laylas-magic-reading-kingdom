/* ============================================================
   PLAY ZONES — Ballet Stage + Fairy Garden.
   Loaded after zone-reading.js.

   These are the LISTENING and ORAL-LANGUAGE zones. They deliberately sit
   beside the core phonics sequence rather than inside it: rhyme, syllables
   and sound discrimination build the ear, while Kitten Cottage and the
   Storybook build the eye. Nothing here invents content — every written
   word still comes through the Reading engine, so an unapproved sound
   cannot leak in. Syllable clapping is the one exception and it is
   audio-only by design: those words are heard, never read.
   ============================================================ */
'use strict';

/* ---------------- felt ballerina ------------------------------------- */
function ballerinaFelt(pose){
  const arms = pose==='up'
    ? '<path class="pc" d="M104 150 q-34 -46 -20 -70 q6 -10 16 -2 q10 8 14 62 z" fill="'+DOLL.skin+'"/>'
      + '<path class="pc" d="M156 150 q34 -46 20 -70 q-6 -10 -16 -2 q-10 8 -14 62 z" fill="'+DOLL.skin+'"/>'
    : '<path class="pc" d="M104 150 q-40 20 -46 52 q-2 12 10 12 q10 0 14 -12 q8 -28 30 -38 z" fill="'+DOLL.skin+'"/>'
      + '<path class="pc" d="M156 150 q40 20 46 52 q2 12 -10 12 q-10 0 -14 -12 q-8 -28 -30 -38 z" fill="'+DOLL.skin+'"/>';
  const legs = pose==='point'
    ? '<rect class="pc" x="122" y="244" width="17" height="86" rx="8" fill="'+DOLL.skin+'" transform="rotate(-16 130 244)"/>'
      + '<rect class="pc" x="143" y="244" width="17" height="86" rx="8" fill="'+DOLL.skin+'" transform="rotate(22 151 244)"/>'
    : '<rect class="pc" x="122" y="244" width="17" height="86" rx="8" fill="'+DOLL.skin+'"/>'
      + '<rect class="pc" x="143" y="244" width="17" height="86" rx="8" fill="'+DOLL.skin+'"/>';
  return feltSVG('0 0 264 360',
      '<ellipse cx="132" cy="344" rx="70" ry="11" fill="'+FELT.shadow+'"/>'
    + legs
    + '<ellipse class="pc" cx="130" cy="330" rx="17" ry="11" fill="'+FELT.pink+'"/>'
    + '<ellipse class="pc" cx="156" cy="330" rx="17" ry="11" fill="'+FELT.pink+'"/>'
    + arms
    + '<rect class="pc" x="106" y="140" width="52" height="96" rx="22" fill="'+FELT.lilacD+'"/>'
    + '<ellipse class="pc" cx="132" cy="248" rx="76" ry="28" fill="'+FELT.lilac+'"/>'
    + '<ellipse class="pc" cx="132" cy="238" rx="60" ry="22" fill="'+FELT.lilacL+'"/>'
    + '<ellipse class="pc" cx="132" cy="230" rx="44" ry="16" fill="'+FELT.white+'"/>'
    + '<ellipse class="pc" cx="132" cy="100" rx="52" ry="54" fill="'+DOLL.hair+'"/>'
    + '<circle class="pc" cx="132" cy="92" r="40" fill="'+DOLL.skin+'"/>'
    + '<path class="pc" d="M92 84 q6 -38 40 -38 q34 0 40 38 q-20 -16 -40 -16 q-20 0 -40 16 z" fill="'+DOLL.hairD+'"/>'
    + '<circle class="pc" cx="132" cy="46" r="16" fill="'+DOLL.hair+'"/>'
    + feltCheek(108,104,13) + feltCheek(156,104,13)
    + feltEye(117,90,8) + feltEye(147,90,8)
    + '<path d="M124 110 q8 8 16 0" fill="none" stroke="'+FELT.plum+'" stroke-width="3" stroke-linecap="round"/>'
    + feltFlower(100,60,13, FELT.pink),
    'ballerina-felt', 'data-pose="'+(pose||'idle')+'"');
}

/* A row of dance moves earned this round. Filling it is the reward. */
function danceTrack(count, total){
  let h='<div class="dance-track">';
  for(let i=0;i<total;i++){
    h += '<span class="dance-step'+(i<count?' on':'')+'">'+(i<count?'🩰':'·')+'</span>';
  }
  return h+'</div>';
}

/* ============================================================
   BALLET STAGE
   ============================================================ */

/* --- Sound Steps: hear a sound, step on the matching letter ---------- */
Games.soundSteps = function(params){
  params=params||{};
  const area=$('game-area'); area.innerHTML='';
  const pool = usablePhonemes(S.unlocked);
  if(pool.length < 2) return needGrownup(area);
  area.dataset.scene='stage';
  const TOTAL = Math.min(4, pool.length);
  let got=0, target=null;

  say('find-sound','Which letter makes this sound?');
  twinkleSay('Step on the sound you hear! 🩰', {silent:true});

  const stage=document.createElement('div'); stage.className='ballet-stage-wrap';
  stage.innerHTML='<div class="ballerina-holder">'+ballerinaFelt('idle')+'</div>'
    + '<div class="dance-track-holder">'+danceTrack(0,TOTAL)+'</div>';
  area.appendChild(stage);

  const hear=document.createElement('div'); hear.className='center';
  hear.innerHTML='<button class="magic-btn">🔊 Hear the sound</button>';
  hear.querySelector('button').onclick=()=>{ if(target) AudioSys.playPhoneme(target); };
  area.appendChild(hear);

  const floor=document.createElement('div'); floor.className='ballet-floor';
  area.appendChild(floor);

  function round(){
    floor.innerHTML='';
    const choices = shuffle(pool).slice(0, Math.min(3, pool.length));
    target = choices[Math.floor(Math.random()*choices.length)];
    after(700, ()=>AudioSys.playPhoneme(target));
    let locked=false;
    choices.forEach(id=>{
      const b=document.createElement('button'); b.className='ballet-tile'; b.textContent=GU(id);
      if(id===target) b.dataset.correct='1';
      b.onclick=()=>{
        if(locked) return;
        if(id!==target){ attemptsThisItem++; gentleNo(b); AudioSys.playPhoneme(target); return; }
        locked=true;
        b.classList.add('stepped');
        AudioSys.sfx('pop');
        record('sound:'+target, firstTryFlag && attemptsThisItem===0);
        got++;
        stage.querySelector('.dance-track-holder').innerHTML=danceTrack(got,TOTAL);
        const holder=stage.querySelector('.ballerina-holder');
        holder.innerHTML=ballerinaFelt(got%2 ? 'up':'point');
        holder.classList.remove('move'); void holder.offsetWidth; holder.classList.add('move');
        addStars(1);
        if(got>=TOTAL) after(900, finale); else after(1100, round);
      };
      floor.appendChild(b);
    });
  }
  function finale(){
    floor.innerHTML='';
    hear.innerHTML='';
    setInstruction('Watch her dance!', 'Watch her dance!');
    const holder=stage.querySelector('.ballerina-holder');
    holder.classList.add('finale');
    AudioSys.sfx('fanfare');
    /* perform the sequence she earned, one move per beat */
    let i=0;
    const seq=['up','point','up','idle'];
    const t=setInterval(()=>{
      holder.innerHTML=ballerinaFelt(seq[i%seq.length]);
      holder.classList.remove('move'); void holder.offsetWidth; holder.classList.add('move');
      AudioSys.sfx('sparkle', 0.5);
      i++;
      if(i>=TOTAL+2){ clearInterval(t); }
    }, 620);
    if(typeof stickerBurst==='function') after(900, ()=>stickerBurst(holder, 14));
    addStars(3); save();
    after(2600, ()=>{ clearInterval(t); activityDone(); });
  }
  round();
};
/* keep the old name working wherever it is still referenced */
Games.ballet = Games.soundSteps;

/* --- Rhyme Dance: which one rhymes? ---------------------------------- */
Games.rhymeDance = function(){
  const area=$('game-area'); area.innerHTML='';
  const r = Reading.rhymeRound();
  if(!r) return needGrownup(area);
  area.dataset.scene='stage';
  setInstruction('Which one rhymes with '+r.target.t+'?', 'Which word rhymes with '+r.target.t+'?');
  twinkleSay('Rhyming words dance together! 🩰', {silent:true});

  const stage=document.createElement('div'); stage.className='ballet-stage-wrap';
  stage.innerHTML='<div class="ballerina-holder">'+ballerinaFelt('idle')+'</div>';
  area.appendChild(stage);

  const tcard=document.createElement('div'); tcard.className='center rhyme-target';
  tcard.innerHTML='<span class="rt-label">rhymes with</span>'+wordTiles(r.target,'big')
    + '<div class="rt-pic">'+wordArt(r.target)+'</div>';
  area.appendChild(tcard);
  after(800, ()=>AudioSys.playWord(r.target.t));

  const row=document.createElement('div'); row.className='choices';
  let done=false;
  shuffle([r.match, r.odd]).forEach(o=>{
    const b=document.createElement('button'); b.className='word-card';
    b.innerHTML=wordTiles(o)+'<div class="wc-pic">'+wordArt(o)+'</div>';
    if(o.t===r.match.t) b.dataset.correct='1';
    b.onclick=()=>{
      if(done) return;
      AudioSys.playWord(o.t);
      if(o.t!==r.match.t){ attemptsThisItem++; gentleNo(b); return; }
      done=true;
      Array.prototype.forEach.call(row.querySelectorAll('.word-card'), x=>x.disabled=true);
      b.classList.add('correct');
      const holder=stage.querySelector('.ballerina-holder');
      holder.innerHTML=ballerinaFelt('up'); holder.classList.add('move','finale');
      record('rhyme', firstTryFlag && attemptsThisItem===0);
      celebrateRight(null, r.target.t+' and '+r.match.t+' rhyme!');
      addStars(3); save();
      after(2400, activityDone);
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};

/* --- Syllable Claps: hear a word, clap its beats ---------------------
   Audio-only on purpose. These words are HEARD, never shown as text to
   decode, so they are exempt from the decodability rule. */
Games.syllableClaps = function(){
  const area=$('game-area'); area.innerHTML='';
  area.dataset.scene='stage';
  const w = SYLLABLE_WORDS[Math.floor(Math.random()*SYLLABLE_WORDS.length)];
  setInstruction('How many claps?', 'How many claps?');
  twinkleSay('Clap the beats with me! 👏', {silent:true});

  const stage=document.createElement('div'); stage.className='center clap-scene';
  stage.innerHTML='<div class="clap-pic">'+w.emoji+'</div>'
    + '<button class="magic-btn">🔊 Hear the word</button>'
    + '<div class="clap-dots"></div>';
  area.appendChild(stage);

  const speakIt=()=>{
    AudioSys.speak(w.t, {rate:0.75});
    /* show the beat visually as it is said */
    const dots=stage.querySelector('.clap-dots');
    dots.innerHTML='';
    for(let i=0;i<w.n;i++){
      const d=document.createElement('span'); d.className='clap-dot';
      d.style.animationDelay=(i*0.42)+'s';
      dots.appendChild(d);
    }
  };
  stage.querySelector('button').onclick=speakIt;
  after(900, speakIt);

  const row=document.createElement('div'); row.className='choices';
  let done=false;
  [1,2,3].forEach(n=>{
    const b=document.createElement('button'); b.className='clap-btn';
    b.innerHTML='<span class="cb-n">'+n+'</span><span class="cb-h">'+'👏'.repeat(n)+'</span>';
    if(n===w.n) b.dataset.correct='1';
    b.onclick=()=>{
      if(done) return;
      if(n!==w.n){ attemptsThisItem++; gentleNo(b); speakIt(); return; }
      done=true;
      Array.prototype.forEach.call(row.querySelectorAll('.clap-btn'), x=>x.disabled=true);
      b.classList.add('correct');
      record('syllables', firstTryFlag && attemptsThisItem===0);
      celebrateRight(null, w.t+' has '+w.n+(w.n===1?' clap!':' claps!'));
      addStars(2); save();
      after(2200, activityDone);
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};

/* ============================================================
   FAIRY GARDEN — lighter oral-language play.
   A flower grows for every correct answer; the garden persists.
   ============================================================ */
function gardenRow(){
  const n = Math.min(12, S.gardenFlowers||0);
  let h='<div class="garden-row">';
  for(let i=0;i<12;i++){
    h += i<n
      ? '<span class="gf grown">'+feltSVG('0 0 60 60', feltFlower(30,30,22,[FELT.pink,FELT.butter,FELT.lilac,FELT.mint][i%4]),'gf-svg')+'</span>'
      : '<span class="gf seed">·</span>';
  }
  return h+'</div>';
}
function growFlower(host){
  S.gardenFlowers=(S.gardenFlowers||0)+1; save();
  if(host){ host.innerHTML=gardenRow(); const last=host.querySelector('.gf.grown:last-of-type'); if(last) last.classList.add('pop-in'); }
  AudioSys.sfx('sparkle');
}

/* --- Which picture starts with this sound? --------------------------- */
Games.startsWith = function(){
  const area=$('game-area'); area.innerHTML='';
  const words = Reading.readableWords();
  if(words.length < 3) return needGrownup(area);
  /* choose a target sound that at least one readable word starts with */
  const byFirst = {};
  words.forEach(w=>{ (byFirst[w.ph[0]] = byFirst[w.ph[0]] || []).push(w); });
  const starts = Object.keys(byFirst).filter(p=>isPhonemeUsable(p));
  if(!starts.length) return needGrownup(area);
  const sound = starts[Math.floor(Math.random()*starts.length)];
  const target = byFirst[sound][Math.floor(Math.random()*byFirst[sound].length)];
  const others = shuffle(words.filter(w=>w.ph[0]!==sound)).slice(0,2);
  if(others.length<2) return needGrownup(area);

  area.dataset.scene='garden';
  setInstruction('Which one starts with this sound?', 'Which picture starts with this sound?');
  twinkleSay('Listen! Which one starts that way? 🌸', {silent:true});

  const garden=document.createElement('div'); garden.className='garden-holder';
  garden.innerHTML=gardenRow();
  area.appendChild(garden);

  const hear=document.createElement('div'); hear.className='center';
  hear.innerHTML='<button class="magic-btn">🔊 Hear the sound</button>';
  hear.querySelector('button').onclick=()=>AudioSys.playPhoneme(sound);
  area.appendChild(hear);
  after(900, ()=>AudioSys.playPhoneme(sound));

  const row=document.createElement('div'); row.className='choices';
  let done=false;
  shuffle([target].concat(others)).forEach(o=>{
    const b=document.createElement('button'); b.className='choice-card pic-card';
    b.innerHTML='<span class="pic-emoji">'+wordArt(o)+'</span><span class="pic-word">'+o.t+'</span>';
    if(o.t===target.t) b.dataset.correct='1';
    b.onclick=()=>{
      if(done) return;
      if(o.t!==target.t){ attemptsThisItem++; gentleNo(b); AudioSys.playPhoneme(sound); return; }
      done=true;
      Array.prototype.forEach.call(row.querySelectorAll('button'), x=>x.disabled=true);
      growFlower(garden);
      celebrateRight('sound:'+sound, target.t+' starts with '+PHONEMES[sound].cue+'!');
      addStars(2); save();
      after(2400, activityDone);
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};

/* --- Odd one out: which word sounds different? ----------------------- */
Games.oddOneOut = function(){
  const area=$('game-area'); area.innerHTML='';
  const r = Reading.rhymeRound();
  if(!r) return needGrownup(area);
  area.dataset.scene='garden';
  setInstruction('Which one sounds different?', 'Which word sounds different?');
  twinkleSay('Two of these rhyme. One does not! 🌼', {silent:true});

  const garden=document.createElement('div'); garden.className='garden-holder';
  garden.innerHTML=gardenRow();
  area.appendChild(garden);

  const row=document.createElement('div'); row.className='choices';
  let done=false;
  shuffle([r.target, r.match, r.odd]).forEach(o=>{
    const b=document.createElement('button'); b.className='word-card';
    b.innerHTML=wordTiles(o)+'<div class="wc-pic">'+wordArt(o)+'</div>';
    if(o.t===r.odd.t) b.dataset.correct='1';
    b.onclick=()=>{
      if(done) return;
      AudioSys.playWord(o.t);
      if(o.t!==r.odd.t){ attemptsThisItem++; gentleNo(b); return; }
      done=true;
      Array.prototype.forEach.call(row.querySelectorAll('.word-card'), x=>x.disabled=true);
      b.classList.add('correct');
      growFlower(garden);
      record('rhyme', firstTryFlag && attemptsThisItem===0);
      celebrateRight(null, r.target.t+' and '+r.match.t+' rhyme — '+r.odd.t+' does not!');
      addStars(2); save();
      after(2600, activityDone);
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};
/* the old name used by existing routing */
Games.rhyme = Games.rhymeDance;

/* ---------------- zone sessions -------------------------------------- */
function balletSession(){
  const acts=[{title:'Sound Steps', run:()=>Games.soundSteps()}];
  if(Reading.rhymeRound()) acts.push({title:'Rhyme Dance', run:()=>Games.rhymeDance()});
  acts.push({title:'Clap the Beats', run:()=>Games.syllableClaps()});
  runSession('Ballet Stage', acts, null);
}
function fairySession(){
  const acts=[];
  if(Reading.readableWords().length>=3) acts.push({title:'Sound Garden', run:()=>Games.startsWith()});
  if(Reading.rhymeRound()) acts.push({title:'Odd One Out', run:()=>Games.oddOneOut()});
  acts.push({title:'Clap the Beats', run:()=>Games.syllableClaps()});
  if(!acts.length) acts.push({title:'Clap the Beats', run:()=>Games.syllableClaps()});
  runSession('Fairy Garden', acts, null);
}
