/* ============================================================
   LAYLA'S MAGIC READING KINGDOM — app.js
   Vanilla JS, no build step. Tablet-first.
   Systems: Audio (speak + pure phoneme synth), Progression,
   Mastery, 14 games, Castle, Stickers, Storybook, Parents.
   Phoneme mp3s can replace synth by adding:
     audio/phonemes/<id>.mp3  (auto-detected, no code change)
   ============================================================ */
'use strict';

/* ---------------- DATA ---------------- */
const PHONEME_ORDER = ['s','a','t','p','i','n','m','d','g','o','c','k'];
const FAMILIAR_LETTERS = ['l','a','y']; // Layla's name, recognition only

const PHONEMES = {
  s:{g:'s', cue:'ssss', stretch:'ssssss', word:'sun', emoji:'☀️', kind:'decode'},
  a:{g:'a', cue:'a as in apple', stretch:'aaa', word:'apple', emoji:'🍎', kind:'decode'},
  t:{g:'t', cue:'t', stretch:'t', word:'tap', emoji:'👆', kind:'decode'},
  p:{g:'p', cue:'p', stretch:'p', word:'pan', emoji:'🍳', kind:'decode'},
  i:{g:'i', cue:'i as in igloo', stretch:'iii', word:'igloo', emoji:'🧊', kind:'decode'},
  n:{g:'n', cue:'nnn', stretch:'nnnn', word:'net', emoji:'🥅', kind:'decode'},
  m:{g:'m', cue:'mmmm', stretch:'mmmm', word:'moon', emoji:'🌙', kind:'decode'},
  d:{g:'d', cue:'d', stretch:'d', word:'dog', emoji:'🐶', kind:'decode'},
  g:{g:'g', cue:'g', stretch:'g', word:'gap', emoji:'🕳️', kind:'decode'},
  o:{g:'o', cue:'o as in otter', stretch:'ooo', word:'otter', emoji:'🦦', kind:'decode'},
  c:{g:'c', cue:'k', stretch:'k', word:'cat', emoji:'🐱', kind:'decode'},
  k:{g:'k', cue:'k', stretch:'k', word:'kite', emoji:'🪁', kind:'decode'},
  l:{g:'l', cue:'lll', stretch:'llll', word:'lion', emoji:'🦁', kind:'familiar'},
  y:{g:'y', cue:'y', stretch:'yyy', word:'yo-yo', emoji:'🪀', kind:'familiar'}
};

const WORDS = [
  {t:'sat', ph:['s','a','t'], emoji:'🪑', art:'sat'},
  {t:'mat', ph:['m','a','t'], emoji:'🧶', art:'mat'},
  {t:'cat', ph:['c','a','t'], emoji:'🐱', art:'cat'},
  {t:'pat', ph:['p','a','t'], emoji:'👋', art:'pat'},
  {t:'tap', ph:['t','a','p'], emoji:'🚰', art:'tap'},
  {t:'map', ph:['m','a','p'], emoji:'🗺️', art:'map'},
  {t:'man', ph:['m','a','n'], emoji:'🤴', art:'man'},
  {t:'pan', ph:['p','a','n'], emoji:'🍳', art:'pan'},
  {t:'sit', ph:['s','i','t'], emoji:'🪑', art:'sit'},
  {t:'sip', ph:['s','i','p'], emoji:'🥤', art:'sip'},
  {t:'tip', ph:['t','i','p'], emoji:'👆', art:'tip'},
  {t:'tin', ph:['t','i','n'], emoji:'🥫', art:'tin'},
  {t:'pin', ph:['p','i','n'], emoji:'📌', art:'pin'},
  {t:'Sam', ph:['s','a','m'], emoji:'👦', art:'sam', proper:true},
  {t:'cap', ph:['c','a','p'], emoji:'🧢', art:'cap'},
  {t:'can', ph:['c','a','n'], emoji:'🥫', art:'can'},
  {t:'dog', ph:['d','o','g'], emoji:'🐶', art:'dog'},
  {t:'mop', ph:['m','o','p'], emoji:'🧹', art:'mop'},
  {t:'pot', ph:['p','o','t'], emoji:'🍲', art:'pot'},
  {t:'am', ph:['a','m'], emoji:'💖', art:'am'},
  {t:'at', ph:['a','t'], emoji:'📍', art:'at'},
  {t:'it', ph:['i','t'], emoji:'✨', art:'it'},
  {t:'in', ph:['i','n'], emoji:'📥', art:'in'},
  {t:'on', ph:['o','n'], emoji:'🔛', art:'on'}
];

const FIRST_SOUND_SETS = [
  {sound:'s', options:[{w:'sun',e:'☀️'},{w:'cat',e:'🐱'},{w:'moon',e:'🌙'}], answer:'sun'},
  {sound:'l', options:[{w:'lion',e:'🦁'},{w:'sun',e:'☀️'},{w:'moon',e:'🌙'}], answer:'lion', familiar:true},
  {sound:'m', options:[{w:'moon',e:'🌙'},{w:'sun',e:'☀️'},{w:'tap',e:'🚰'}], answer:'moon'},
  {sound:'c', options:[{w:'cat',e:'🐱'},{w:'sun',e:'☀️'},{w:'pin',e:'📌'}], answer:'cat'},
  {sound:'p', options:[{w:'pan',e:'🍳'},{w:'moon',e:'🌙'},{w:'sun',e:'☀️'}], answer:'pan'},
  {sound:'a', options:[{w:'apple',e:'🍎'},{w:'moon',e:'🌙'},{w:'tin',e:'🥫'}], answer:'apple'},
  {sound:'t', options:[{w:'tap',e:'🚰'},{w:'moon',e:'🌙'},{w:'sun',e:'☀️'}], answer:'tap'}
];

const REWARDS = [
  {id:'dress-rainbow', cat:'dress', emoji:'👗', name:'Sparkly Rainbow Dress', rarity:'special'},
  {id:'dress-pink', cat:'dress', emoji:'👚', name:'Pink Princess Dress', rarity:'common'},
  {id:'dress-blue', cat:'dress', emoji:'👘', name:'Blue Ballet Dress', rarity:'common'},
  {id:'dress-lilac', cat:'dress', emoji:'🥻', name:'Lilac Twirl Dress', rarity:'common'},
  {id:'crown-gold', cat:'crown', emoji:'👑', name:'Golden Crown', rarity:'special'},
  {id:'crown-tiara', cat:'crown', emoji:'👸', name:'Sparkle Tiara', rarity:'common'},
  {id:'crown-flower', cat:'crown', emoji:'🌸', name:'Flower Crown', rarity:'common'},
  {id:'shoes-glass', cat:'shoes', emoji:'👠', name:'Glass Slippers', rarity:'special'},
  {id:'shoes-ballet', cat:'shoes', emoji:'🩰', name:'Ballet Slippers', rarity:'common'},
  {id:'wings-fairy', cat:'wings', emoji:'🧚', name:'Fairy Wings', rarity:'special'},
  {id:'neck-star', cat:'necklace', emoji:'📿', name:'Star Necklace', rarity:'common'},
  {id:'pet-white', cat:'pet', emoji:'🐱', name:'Snowy the Kitten', rarity:'common'},
  {id:'pet-orange', cat:'pet', emoji:'🐈', name:'Pumpkin the Kitten', rarity:'common'},
  {id:'pet-unicorn', cat:'pet', emoji:'🦄', name:'Tiny Rainbow Unicorn', rarity:'rare'},
  {id:'pet-moon', cat:'pet', emoji:'🐴', name:'Moon Unicorn', rarity:'rare'},
  {id:'wall-pink', cat:'wallpaper', emoji:'🌸', name:'Rose Wallpaper', rarity:'common'},
  {id:'wall-star', cat:'wallpaper', emoji:'🌟', name:'Starry Wallpaper', rarity:'rare'},
  {id:'bed-royal', cat:'furniture', emoji:'🛏️', name:'Royal Bed', rarity:'common'},
  {id:'lamp-chandelier', cat:'furniture', emoji:'💡', name:'Crystal Chandelier', rarity:'rare'},
  {id:'window-rainbow', cat:'window', emoji:'🌈', name:'Rainbow Window', rarity:'special'},
  {id:'decor-flowers', cat:'decor', emoji:'💐', name:'Magic Flowers', rarity:'common'},
  {id:'decor-painting', cat:'decor', emoji:'🖼️', name:'Unicorn Painting', rarity:'common'},
  {id:'decor-throne', cat:'decor', emoji:'🪑', name:'Tiny Throne', rarity:'rare'}
];

const PRINCESS_LOOK = {
  'pink':'👸', 'dress-pink':'👸', 'dress-rainbow':'🤴',
  'dress-blue':'👱‍♀️', 'dress-lilac':'👩‍🦰'
};

const STORY_PAGES = [
  {s:['Sam','sat.'], art:'👦', needs:['s','a','m','t']},
  {s:['Sam','sat','on','a','mat.'], art:'🧶', needs:['s','a','m','t','o','n']},
  {s:['A','cat','sat.'], art:'🐱', needs:['s','a','m','t','o','n','c']},
  {s:['A','cat','sat','on','a','mat.'], art:'🧶', needs:['s','a','m','t','o','n','c']}
];

/* ---------------- STATE ---------------- */
const SAVE_KEY = 'layla-kingdom-v1';
function defaultState(){
  return {
    v:1, stars:0, rainbowColors:0,
    firstSessionDone:false, firstSessionStep:0,
    unlocked:['s','a','t'],
    mastery:{}, wordsRead:[], wordsCelebrated:[],
    rewards:['dress-pink'], stickers:['layla-name'],
    equipped:{dress:'dress-pink', crown:'crown-flower', shoes:'shoes-ballet', pet:'pet-white', wallpaper:'wall-pink', furniture:'bed-royal', window:'window-rainbow', decor:'decor-flowers', wings:null, necklace:null},
    sessions:[], minutes:0, lastPlayDate:null, streak:0,
    blendingUnlocked:false, sentenceUnlocked:false, sentenceCelebrated:false, blendingCelebrated:false,
    currentFocus:'s',
    settings:{voice:1, music:0.35, sfx:1, autoplay:true, motion:true}
  };
}
let S = load();
function load(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return defaultState();
    const d = JSON.parse(raw);
    const base = defaultState();
    return Object.assign(base, d, {settings:Object.assign(base.settings, d.settings||{}), equipped:Object.assign(base.equipped, d.equipped||{})});
  }catch(e){ return defaultState(); }
}
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }catch(e){} }
function resetAll(){ S = defaultState(); save(); refreshAll(); toast('A brand-new kingdom! 🌈'); }

/* Mastery */
function masteryOf(skill){
  if(!S.mastery[skill]) S.mastery[skill] = {p:0, ok:0, att:0, recent:[], score:0, last:0};
  return S.mastery[skill];
}
function record(skill, firstTry){
  const m = masteryOf(skill);
  m.p++; m.att++;
  if(firstTry) m.ok++;
  m.recent.push(firstTry?1:0);
  if(m.recent.length>6) m.recent.shift();
  const acc = m.recent.reduce((a,b)=>a+b,0)/m.recent.length;
  m.score = Math.min(1, (m.ok/Math.max(1,m.att))*0.5 + acc*0.5 + Math.min(0.2, m.p*0.02));
  m.last = Date.now();
  save();
}
function weakestPhoneme(){
  const pool = S.unlocked.filter(id=>PHONEMES[id] && PHONEMES[id].kind==='decode');
  if(!pool.length) return 's';
  let worst = pool[0], worstScore = 99;
  pool.forEach(id=>{
    const sc = (S.mastery['sound:'+id]||{score:0.5}).score;
    if(sc < worstScore){ worstScore = sc; worst = id; }
  });
  return worst;
}
function maybeUnlockNext(){
  // unlock next phoneme when current focus is strong
  const idx = PHONEME_ORDER.indexOf(S.currentFocus);
  const m = S.mastery['sound:'+S.currentFocus];
  if(m && m.score > 0.75 && idx >= 0 && idx+1 < PHONEME_ORDER.length){
    const next = PHONEME_ORDER[idx+1];
    if(!S.unlocked.includes(next)){
      S.unlocked.push(next);
      S.currentFocus = next;
      save();
      return next;
    }
  }
  // rotate focus to weakest if current mastered
  const w = weakestPhoneme();
  if(w !== S.currentFocus && (S.mastery['sound:'+S.currentFocus]||{score:0}).score > 0.6){
    S.currentFocus = w; save();
  }
  return null;
}
function decodableWords(){
  const set = new Set(S.unlocked);
  return WORDS.filter(w => w.ph.every(p=>set.has(p)));
}

/* ---------------- AUDIO ---------------- */
const AudioSys = {
  ctx:null, musicGain:null, musicTimer:null, musicOn:false, ducked:false,
  ensure(){
    if(!this.ctx){
      try{ this.ctx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ this.ctx=null; }
      if(this.ctx){
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = S.settings.music * 0.5;
        this.musicGain.connect(this.ctx.destination);
      }
    }
    if(this.ctx && this.ctx.state==='suspended') this.ctx.resume().catch(()=>{});
    return this.ctx;
  },
  pickVoice(){
    try{
      const vs = speechSynthesis.getVoices();
      if(!vs.length) return null;
      const pref = vs.find(v=>/female|samantha|zira|jenny|aria|google uk english female/i.test(v.name))
        || vs.find(v=>v.lang && v.lang.toLowerCase().startsWith('en'))
        || vs[0];
      return pref;
    }catch(e){ return null; }
  },
  speak(text, opts){
    opts = opts||{};
    try{
      if(!('speechSynthesis' in window)) return;
      if(!opts.force && !opts.important && S.settings.voice<=0) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = this.pickVoice();
      if(v) u.voice = v;
      u.rate = opts.rate || 0.95;
      u.pitch = opts.pitch || 1.15;
      u.volume = Math.max(0, Math.min(1, S.settings.voice));
      u.lang = (v&&v.lang)||'en-US';
      talking(true);
      u.onend = ()=>talking(false);
      u.onerror = ()=>talking(false);
      speechSynthesis.speak(u);
    }catch(e){ talking(false); }
  },
  stopSpeak(){ try{ speechSynthesis.cancel(); }catch(e){} talking(false); },
  /* Pure phoneme synth — replaceable by audio/phonemes/<id>.mp3 */
  playPhoneme(id){
    showMouthCue(id);
    // Try mp3 override silently; fall back to WebAudio synth (exactly once).
    let settled = false;
    const fallback = ()=>{ if(!settled){ settled = true; this.synthPhoneme(id); } };
    try{
      const a = new Audio('audio/phonemes/'+id+'.mp3');
      a.volume = Math.max(0, Math.min(1, S.settings.voice));
      a.oncanplaythrough = ()=>{ if(settled) return; settled = true; this.duck(true); a.play().catch(()=>this.synthPhoneme(id)); a.onended=()=>{this.duck(false);}; setTimeout(()=>this.duck(false), 2500); };
      a.onerror = fallback;
      setTimeout(fallback, 400);
      return;
    }catch(e){ fallback(); }
  },
  synthPhoneme(id){
    const ctx = this.ensure(); if(!ctx) return;
    this.duck(true);
    const t = ctx.currentTime;
    const out = ctx.createGain(); out.gain.value = 0.9 * Math.max(0.15,S.settings.voice);
    out.connect(ctx.destination);
    const P = PHONEMES[id]; const g = P?P.g:id;
    const noiseBuf = ()=>{
      const b = ctx.createBuffer(1, ctx.sampleRate*1.2, ctx.sampleRate);
      const d = b.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
      return b;
    };
    if(g==='s'){
      const src=ctx.createBufferSource(); src.buffer=noiseBuf();
      const f=ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=5500;
      const e=ctx.createGain(); e.gain.setValueAtTime(0.001,t); e.gain.exponentialRampToValueAtTime(0.7,t+0.08); e.gain.setValueAtTime(0.7,t+0.9); e.gain.exponentialRampToValueAtTime(0.001,t+1.15);
      src.connect(f); f.connect(e); e.connect(out); src.start(t); src.stop(t+1.2);
    } else if(g==='m'||g==='n'){
      const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=(g==='m'?170:220);
      const o2=ctx.createOscillator(); o2.type='triangle'; o2.frequency.value=(g==='m'?340:440);
      const gg=ctx.createGain(); gg.gain.value=0.4;
      const e=ctx.createGain(); e.gain.setValueAtTime(0.001,t); e.gain.exponentialRampToValueAtTime(0.9,t+0.1); e.gain.setValueAtTime(0.9,t+0.6); e.gain.exponentialRampToValueAtTime(0.001,t+0.85);
      o.connect(gg); o2.connect(gg); gg.connect(e); e.connect(out);
      o.start(t); o2.start(t); o.stop(t+0.9); o2.stop(t+0.9);
    } else if(g==='l'){
      const o=ctx.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(220,t); o.frequency.linearRampToValueAtTime(180,t+0.5);
      const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=900; f.Q.value=4;
      const e=ctx.createGain(); e.gain.setValueAtTime(0.001,t); e.gain.exponentialRampToValueAtTime(0.6,t+0.08); e.gain.exponentialRampToValueAtTime(0.001,t+0.7);
      o.connect(f); f.connect(e); e.connect(out); o.start(t); o.stop(t+0.75);
    } else if('aeiou'.includes(g)){
      const base = {a:260, e:300, i:350, o:240, u:220}[g]||280;
      const o=ctx.createOscillator(); o.type='sawtooth'; o.frequency.value=base;
      const f1=ctx.createBiquadFilter(); f1.type='bandpass';
      f1.frequency.value = g==='a'?750 : g==='i'?450 : g==='o'?550 : 650; f1.Q.value=5;
      const f2=ctx.createBiquadFilter(); f2.type='bandpass';
      f2.frequency.value = g==='a'?1700 : g==='i'?2100 : g==='o'?1000 : 1400; f2.Q.value=6;
      const e=ctx.createGain(); e.gain.setValueAtTime(0.001,t); e.gain.exponentialRampToValueAtTime(0.8,t+0.08); e.gain.setValueAtTime(0.8,t+0.45); e.gain.exponentialRampToValueAtTime(0.001,t+0.65);
      o.connect(f1); o.connect(f2); f1.connect(e); f2.connect(e); e.connect(out);
      o.start(t); o.stop(t+0.7);
    } else {
      // stops: t,p,d,g,k,c,b — short burst + tiny vowel tail so it is hearable but not "tee"
      const src=ctx.createBufferSource(); src.buffer=noiseBuf();
      const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=(g==='t'||g==='k'||g==='c')?3000:1200; f.Q.value=1.2;
      const e=ctx.createGain(); e.gain.setValueAtTime(0.9,t); e.gain.exponentialRampToValueAtTime(0.001,t+0.14);
      src.connect(f); f.connect(e); e.connect(out); src.start(t); src.stop(t+0.2);
      const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=300;
      const e2=ctx.createGain(); e2.gain.setValueAtTime(0.001,t+0.1); e2.gain.exponentialRampToValueAtTime(0.35,t+0.14); e2.gain.exponentialRampToValueAtTime(0.001,t+0.3);
      o.connect(e2); e2.connect(out); o.start(t+0.1); o.stop(t+0.35);
    }
    // sparkle tail
    this.sfx('twinkle', 0.25, 0.35);
    setTimeout(()=>this.duck(false), 1100);
  },
  playWordSlow(wordObj){
    // phonemes individually then blended — the flagship blending audio
    const phs = wordObj.ph;
    this.duck(true);
    phs.forEach((p,i)=> setTimeout(()=>this.synthPhoneme(p), i*950));
    setTimeout(()=>{ this.speak(wordObj.t, {rate:0.7}); }, phs.length*950+150);
    setTimeout(()=>this.duck(false), phs.length*950+1800);
  },
  sfx(name, vol, delay){
    try{
      if(S.settings.sfx<=0) return;
      const ctx=this.ensure(); if(!ctx) return;
      const t=ctx.currentTime+(delay||0);
      const v=(vol==null?0.8:vol)*S.settings.sfx;
      const mk=(freq,dur,type,when,slide)=>{
        const o=ctx.createOscillator(); o.type=type||'sine'; o.frequency.setValueAtTime(freq,t+(when||0));
        if(slide) o.frequency.exponentialRampToValueAtTime(slide,t+(when||0)+dur);
        const g=ctx.createGain(); g.gain.setValueAtTime(0.001,t+(when||0));
        g.gain.exponentialRampToValueAtTime(v*0.5,t+(when||0)+0.02);
        g.gain.exponentialRampToValueAtTime(0.001,t+(when||0)+dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(t+(when||0)); o.stop(t+(when||0)+dur+0.05);
      };
      if(name==='pop') mk(600,0.15,'square',0,900);
      else if(name==='sparkle'){ mk(1200,0.3,'sine',0,2400); mk(1600,0.35,'sine',0.08,3200); }
      else if(name==='success'){ mk(523,0.2,'triangle',0); mk(659,0.2,'triangle',0.12); mk(784,0.35,'triangle',0.24); }
      else if(name==='fanfare'){ [523,659,784,1047,784,1047].forEach((f,i)=>mk(f,0.25,'triangle',i*0.14)); }
      else if(name==='chest'){ mk(300,0.3,'triangle',0,600); mk(600,0.4,'sine',0.2,1200); }
      else if(name==='soft'){ mk(400,0.25,'sine',0,300); }
      else if(name==='meow'){ mk(700,0.18,'sawtooth',0,1000); mk(1000,0.25,'sawtooth',0.16,600); }
      else if(name==='magic'){ mk(800,0.4,'sine',0,1600); mk(1200,0.4,'sine',0.1,2000); }
      else if(name==='twinkle'){ mk(2000,0.25,'sine',0,3000); }
      else if(name==='flip'){ mk(500,0.12,'triangle',0,700); }
    }catch(e){}
  },
  duck(on){
    try{
      if(!this.ctx||!this.musicGain) return;
      const t=this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(t);
      this.musicGain.gain.setTargetAtTime(on? S.settings.music*0.08 : S.settings.music*0.5, t, 0.15);
    }catch(e){}
  },
  startMusic(){
    if(this.musicOn) return; this.musicOn=true;
    this.ensure(); if(!this.ctx){return;}
    const melody=[523,587,659,784,880,784,659,587,523,0,440,494,523,587,659,0];
    let i=0;
    const step=()=>{
      if(!this.musicOn) return;
      try{
        if(S.settings.music>0 && this.ctx){
          const n=melody[i%melody.length];
          if(n){
            const o=this.ctx.createOscillator(); o.type='sine'; o.frequency.value=n;
            const g=this.ctx.createGain();
            const t=this.ctx.currentTime;
            g.gain.setValueAtTime(0.001,t); g.gain.exponentialRampToValueAtTime(0.16,t+0.05); g.gain.exponentialRampToValueAtTime(0.001,t+0.7);
            o.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t+0.75);
          }
        }
      }catch(e){}
      i++;
      this.musicTimer=setTimeout(step, 460);
    };
    step();
  },
  stopMusic(){ this.musicOn=false; if(this.musicTimer) clearTimeout(this.musicTimer); },
  applyVolumes(){
    if(this.musicGain&&this.ctx) this.musicGain.gain.value=S.settings.music*0.5;
  }
};
function talking(on){
  const a=document.getElementById('twinkle-avatar');
  if(a) a.classList.toggle('talking', !!on);
}
/* Mouth-shape cue: shows Layla HOW the sound is made (teeth/lips/open).
   Purely visual support for the phoneme audio — not a replacement for it. */
function showMouthCue(id){
  try{
    const area=document.getElementById('game-area');
    if(!area || !document.body.contains(area)) return;
    const old=document.getElementById('mouth-cue');
    if(old) old.remove();
    const g=(PHONEMES[id]||{}).g||id;
    const mouth = (g==='s')?'😁' : (g==='m'||g==='n')?'😗' : ('aeiou'.includes(g))?'😮' : (g==='l')?'😛' : '😯';
    const d=document.createElement('div');
    d.id='mouth-cue'; d.className='mouth-cue';
    d.innerHTML='<span class="mouth-face">'+mouth+'</span><span class="mouth-letter">'+String(id).toUpperCase()+'</span>';
    area.appendChild(d);
    setTimeout(()=>{ if(d.parentNode) d.remove(); }, 2200);
  }catch(e){}
}

/* ---------------- UI HELPERS ---------------- */
const $ = id => document.getElementById(id);
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $('screen-'+name).classList.add('active');
  window.scrollTo(0,0);
}
function toast(msg){
  const t=$('toast'); t.textContent=msg; t.classList.remove('hidden');
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.add('hidden'),2200);
}
function sparkles(n, big){
  if(!S.settings.motion) return;
  const layer=$('sparkle-layer');
  const em=['✨','💖','⭐','🌟','💜','🌈'];
  for(let i=0;i<(n||14);i++){
    const s=document.createElement('div'); s.className='sparkle';
    s.textContent=em[Math.floor(Math.random()*em.length)];
    s.style.left=(10+Math.random()*80)+'vw';
    s.style.top=(20+Math.random()*60)+'vh';
    s.style.fontSize=((big?26:14)+Math.random()*22)+'px';
    layer.appendChild(s);
    setTimeout(()=>s.remove(),1700);
  }
}
function confettiBlast(){
  if(!S.settings.motion) return;
  const layer=$('confetti-layer');
  const em=['🌸','⭐','💖','🌈','✨','👑','🦄'];
  for(let i=0;i<50;i++){
    const s=document.createElement('div'); s.className='confetti';
    s.textContent=em[Math.floor(Math.random()*em.length)];
    s.style.left=(Math.random()*100)+'vw';
    s.style.fontSize=(16+Math.random()*22)+'px';
    s.style.animationDuration=(2+Math.random()*2)+'s';
    layer.appendChild(s);
    setTimeout(()=>s.remove(),4500);
  }
}
let currentInstruction='';
function setInstruction(text, speakText){
  currentInstruction = speakText||text;
  $('instruction-text').textContent=text;
  if(S.settings.autoplay) AudioSys.speak(currentInstruction);
}
function hearInstruction(){ if(currentInstruction) AudioSys.speak(currentInstruction); }
function twinkleSay(text, opts){
  $('twinkle-speech').textContent=text;
  $('twinkle-mini-text').textContent=text;
  if(S.settings.autoplay||(opts&&opts.force)) AudioSys.speak(text, opts);
  else currentInstruction=text;
}
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t;} return a; }
function addStars(n){ S.stars+=n; save(); const el=$('star-count'); if(el) el.textContent=S.stars; }

/* Session engine */
let sessionQueue=[], sessionIdx=0, sessionName='', sessionReward=null, attemptsThisItem=0, firstTryFlag=true;
function runSession(name, activities, reward){
  sessionQueue=activities; sessionIdx=0; sessionName=name; sessionReward=reward||null;
  showScreen('game');
  nextActivity();
}
function renderDots(){
  const d=$('game-dots'); d.innerHTML='';
  sessionQueue.forEach((_,i)=>{
    const s=document.createElement('div'); s.className='dot'+(i<sessionIdx?' done':i===sessionIdx?' now':'');
    d.appendChild(s);
  });
}
function nextActivity(){
  if(sessionIdx>=sessionQueue.length){ endSession(); return; }
  renderDots();
  attemptsThisItem=0; firstTryFlag=true;
  const act=sessionQueue[sessionIdx];
  $('game-title-pill').textContent=act.title||sessionName;
  act.run(act.params||{});
}
function activityDone(){
  sessionIdx++;
  setTimeout(nextActivity, 900);
}
function gentleNo(cardEl, retrySpeech){
  attemptsThisItem++;
  if(cardEl){ cardEl.classList.remove('gentle-no'); void cardEl.offsetWidth; cardEl.classList.add('gentle-no'); }
  AudioSys.sfx('soft');
  const msgs=["Oops! Listen again. 💜", "Good try! Let's hear it again. 🌟", "Almost! One more listen. 💖"];
  const m = retrySpeech || msgs[Math.min(attemptsThisItem-1, msgs.length-1)];
  AudioSys.speak(m);
  if(cardEl) setTimeout(()=>cardEl.classList.remove('gentle-no'),600);
  if(attemptsThisItem>=2){
    // scaffold: glow the right answer subtly
    document.querySelectorAll('[data-correct="1"]').forEach(el=>{
      el.style.boxShadow='0 0 18px #fbbf24'; el.style.borderColor='#fbbf24';
    });
  }
  if(attemptsThisItem>=3) firstTryFlag=false;
}
function celebrateRight(skillId, praise){
  AudioSys.sfx('success');
  sparkles(16);
  if(skillId) record(skillId, firstTryFlag && attemptsThisItem===0);
  if(praise) AudioSys.speak(praise);
  const unlocked = maybeUnlockNext();
  if(unlocked && PHONEMES[unlocked]){
    setTimeout(()=>{ twinkleSay('New magic sound! '+unlocked.toUpperCase()+'! '+PHONEMES[unlocked].emoji); }, 1400);
  }
  checkMilestones();
}
function checkMilestones(){
  const dec = decodableWords();
  if(!S.blendingUnlocked && S.unlocked.length>=3 && dec.length>=2){
    S.blendingUnlocked=true; save();
  }
  if(dec.length>=3 && S.wordsRead.length>=3 && !S.sentenceUnlocked){
    S.sentenceUnlocked=true; save();
    const n=$('story-lock-note'); if(n) n.textContent='Open! 🎉';
  }
}

/* ---------------- GAMES ---------------- */
const Games = {};

/* 1. Find name */
Games.findName = function(){
  const area=$('game-area'); area.innerHTML='';
  setInstruction('Can you find Layla?', 'Can you find Layla?');
  twinkleSay("Can you find Layla? That's YOUR name! 💖");
  const wrap=document.createElement('div'); wrap.className='choices center';
  const row=document.createElement('div'); row.className='choices';
  const opts=shuffle(['LAYLA','MAYA','LUCY']);
  opts.forEach(n=>{
    const b=document.createElement('button'); b.className='choice-card heart-card';
    b.innerHTML='💗<br>'+n;
    if(n==='LAYLA') b.dataset.correct='1';
    b.onclick=()=>{
      AudioSys.ensure();
      if(n==='LAYLA'){
        b.classList.add('correct'); AudioSys.sfx('fanfare'); confettiBlast();
        AudioSys.speak("Yes! That's YOUR name! Layla! You are already a reader!");
        record('name:find', firstTryFlag&&attemptsThisItem===0);
        addStars(3); awardSticker('layla-name', true);
        setTimeout(activityDone, 2200);
      } else gentleNo(b, 'Good looking! But where is Layla? Listen... Can you find Layla?');
    };
    row.appendChild(b);
  });
  wrap.appendChild(row); area.appendChild(wrap);
};

/* 2. Build name — tap-to-place (drag optional, forgiving) */
Games.buildName = function(){
  const area=$('game-area'); area.innerHTML='';
  setInstruction('Drag the letters to spell LAYLA.', 'Drag the letters to spell Layla. L. A. Y. L. A.');
  twinkleSay("Let's build YOUR name! L. A. Y. L. A.! 💖");
  const target=['L','A','Y','L','A'];
  const slots=document.createElement('div'); slots.className='slot-row';
  const tiles=document.createElement('div'); tiles.className='tile-row';
  const slotEls=[];
  target.forEach((ch,i)=>{
    const s=document.createElement('div'); s.className='slot'+(i===0?' next':'');
    s.dataset.want=ch; s.dataset.i=i; slots.appendChild(s); slotEls.push(s);
  });
  let next=0;
  const tileOrder=shuffle(target.map((c,i)=>({c, key:i})));
  tileOrder.forEach(t=>{
    const b=document.createElement('button'); b.className='tile'; b.textContent=t.c;
    b.onclick=()=>{
      AudioSys.ensure();
      if(next>=5) return;
      const slot=slotEls[next];
      if(t.c===slot.dataset.want){
        slot.textContent=t.c; slot.classList.add('filled'); b.classList.add('used');
        AudioSys.sfx('pop'); AudioSys.speak(t.c==='A'?'a':t.c==='Y'?'y':t.c==='L'?'l':t.c);
        slot.classList.remove('next'); next++;
        if(slotEls[next]) slotEls[next].classList.add('next');
        if(next>=5){
          AudioSys.sfx('fanfare'); confettiBlast();
          AudioSys.speak('Layla! You spelled your name! Amazing!');
          record('name:build', firstTryFlag&&attemptsThisItem===0);
          addStars(4);
          setTimeout(activityDone, 2400);
        }
      } else {
        attemptsThisItem++; gentleNo(b,'That letter goes somewhere else. Try a '+slot.dataset.want+'!');
      }
    };
    tiles.appendChild(b);
  });
  // HTML5 drag support (desktop nicety, tap works everywhere)
  tiles.querySelectorAll('.tile').forEach(tile=>{
    tile.draggable=true;
    tile.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',tile.textContent); tile._drag=tile;});
  });
  slotEls.forEach(slot=>{
    slot.addEventListener('dragover',e=>e.preventDefault());
    slot.addEventListener('drop',e=>{
      e.preventDefault();
      const ch=e.dataTransfer.getData('text/plain');
      const avail=[...tiles.querySelectorAll('.tile:not(.used)')].find(x=>x.textContent===ch);
      if(avail) avail.click();
    });
  });
  area.appendChild(slots); area.appendChild(tiles);
  const hint=document.createElement('div'); hint.className='center';
  hint.innerHTML='<button class="magic-btn" id="say-name">🔊 Hear my name</button>';
  area.appendChild(hint);
  hint.querySelector('#say-name').onclick=()=>AudioSys.speak('Layla. L. A. Y. L. A.');
};

/* 3. Missing letter of name */
Games.missingLetter = function(){
  const area=$('game-area'); area.innerHTML='';
  setInstruction('Which letter is missing? L A _ L A', 'Which letter is missing? L. A. ... L. A. ?');
  twinkleSay('Oh no! A letter floated away! Which one? 💜');
  const row=document.createElement('div'); row.className='slot-row';
  ['L','A','?','L','A'].forEach(c=>{const d=document.createElement('div'); d.className='slot'+(c==='?'?' next':' filled'); d.textContent=c==='?'?'✨':c; row.appendChild(d);});
  area.appendChild(row);
  const ch=document.createElement('div'); ch.className='choices';
  shuffle(['Y','M','T']).forEach(L=>{
    const b=document.createElement('button'); b.className='choice-card'; b.innerHTML='<span class="big-letter">'+L+'</span>';
    if(L==='Y') b.dataset.correct='1';
    b.onclick=()=>{
      if(L==='Y'){ b.classList.add('correct'); celebrateRight('name:missing','Yes! Y! L. A. Y. L. A.! Layla!'); addStars(2); setTimeout(activityDone,2000); }
      else gentleNo(b);
    };
    ch.appendChild(b);
  });
  area.appendChild(ch);
};

/* 4. Magic letter bubbles */
Games.bubbles = function(params){
  params=params||{};
  const focus = params.focus || S.currentFocus;
  const area=$('game-area'); area.innerHTML='';
  const mode = params.mode || (Math.random()<0.5?'name':'sound');
  const distract = shuffle(PHONEME_ORDER.filter(p=>p!==focus)).slice(0,2);
  const letters = shuffle([focus].concat(distract));
  if(mode==='sound'){
    setInstruction('Find the letter that makes '+PHONEMES[focus].cue+'.', 'Find the letter that makes '+PHONEMES[focus].cue+'.');
    twinkleSay('Pop the bubble with '+PHONEMES[focus].cue+'! 🫧');
    setTimeout(()=>AudioSys.playPhoneme(focus), 700);
    const replay=document.createElement('div'); replay.className='center';
    replay.innerHTML='<button class="magic-btn">🔊 Hear the sound again</button>';
    replay.querySelector('button').onclick=()=>AudioSys.playPhoneme(focus);
    area.appendChild(replay);
  } else {
    setInstruction('Find '+focus.toUpperCase()+'!', 'Find '+focus.toUpperCase()+'!');
    twinkleSay('Can you find '+focus.toUpperCase()+'? 🫧');
  }
  const row=document.createElement('div'); row.className='choices';
  letters.forEach(L=>{
    const b=document.createElement('button'); b.className='bubble'; b.textContent=L.toUpperCase();
    if(L===focus) b.dataset.correct='1';
    b.style.animationDelay=(Math.random()*1.5)+'s';
    b.onclick=()=>{
      AudioSys.ensure();
      if(L===focus){
        b.classList.add('pop'); AudioSys.sfx('pop');
        setTimeout(()=>{
          celebrateRight('letter:'+focus, mode==='sound' ? 'Yes! '+focus.toUpperCase()+' makes '+PHONEMES[focus].cue+'!' : 'Yes! That is '+focus.toUpperCase()+'!');
          addStars(2);
          const rb=document.createElement('div'); rb.className='rainbow-bar';
          const cols=['#ef4444','#f97316','#facc15','#22c55e','#3b82f6','#8b5cf6','#ec4899'];
          for(let i=0;i<7;i++){const s=document.createElement('div'); s.className='rainbow-seg'; if(i<=S.rainbowColors) s.style.background=cols[i]; rb.appendChild(s);}
          area.appendChild(rb);
          if(S.rainbowColors<6){ S.rainbowColors++; save(); }
          sparkles(18);
          setTimeout(activityDone, 2200);
        },350);
      } else gentleNo(b);
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};

/* 5. Unicorn sound crystals */
Games.crystals = function(params){
  params=params||{};
  const focus=params.focus||S.currentFocus;
  const area=$('game-area'); area.innerHTML='';
  setInstruction('Listen. Which letter makes this sound?', 'Listen. Which letter makes this sound?');
  twinkleSay('The unicorn lost her sound crystal! Listen! 🦄💎');
  const uni=document.createElement('div'); uni.className='center'; uni.style.fontSize='90px'; uni.textContent='🦄';
  area.appendChild(uni);
  const hear=document.createElement('div'); hear.className='center';
  hear.innerHTML='<button class="big-magic-btn">🔊 Hear the magic sound</button>';
  hear.querySelector('button').onclick=()=>AudioSys.playPhoneme(focus);
  area.appendChild(hear);
  setTimeout(()=>AudioSys.playPhoneme(focus), 800);
  const row=document.createElement('div'); row.className='choices';
  const opts=shuffle([focus].concat(shuffle(PHONEME_ORDER.filter(p=>p!==focus)).slice(0,2)));
  const colors=['linear-gradient(180deg,#67e8f9,#3b82f6)','linear-gradient(180deg,#f0abfc,#8b5cf6)','linear-gradient(180deg,#fda4af,#ec4899)'];
  opts.forEach((L,i)=>{
    const b=document.createElement('button'); b.className='crystal'; b.style.background=colors[i%3]; b.textContent=L.toUpperCase();
    if(L===focus) b.dataset.correct='1';
    b.onclick=()=>{
      if(L===focus){
        b.style.transform='translateY(-30px) scale(1.2)'; AudioSys.sfx('magic');
        uni.textContent='🦄✨'; uni.style.transform='scale(1.15)';
        celebrateRight('sound:'+focus, 'Yes! '+L.toUpperCase()+' makes '+PHONEMES[focus].cue+'! The unicorn is so happy!');
        addStars(3);
        sparkles(20);
        setTimeout(activityDone, 2400);
      } else gentleNo(b);
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};

/* 6. First sound mirror */
Games.firstSound = function(params){
  params=params||{};
  const area=$('game-area'); area.innerHTML='';
  const pool = FIRST_SOUND_SETS.filter(s=>s.familiar || S.unlocked.includes(s.sound));
  const set = pool.length? pool[Math.floor(Math.random()*pool.length)] : FIRST_SOUND_SETS[0];
  const sound=set.sound;
  setInstruction('Which one starts with '+PHONEMES[sound].cue+'?', 'Which one starts with '+PHONEMES[sound].cue+'?');
  twinkleSay('Look in the magic mirror! Which one starts with '+PHONEMES[sound].cue+'? 🪞');
  setTimeout(()=>AudioSys.playPhoneme(sound), 700);
  const hear=document.createElement('div'); hear.className='center';
  hear.innerHTML='<button class="magic-btn">🔊 Hear '+PHONEMES[sound].cue+'</button>';
  hear.querySelector('button').onclick=()=>AudioSys.playPhoneme(sound);
  area.appendChild(hear);
  const row=document.createElement('div'); row.className='choices';
  shuffle(set.options).forEach(o=>{
    const b=document.createElement('button'); b.className='choice-card pic-card';
    b.innerHTML='<span class="pic-emoji">'+o.e+'</span><span class="pic-word">'+o.w+'</span>';
    if(o.w===set.answer) b.dataset.correct='1';
    b.onclick=()=>{
      if(o.w===set.answer){
        b.classList.add('correct'); AudioSys.sfx('fanfare');
        AudioSys.speak(set.answer+'! '+set.answer+' starts with '+PHONEMES[sound].cue+'!');
        celebrateRight('first:'+sound, null); addStars(3); sparkles(20);
        setTimeout(activityDone, 2300);
      } else gentleNo(b, 'Listen again... '+PHONEMES[sound].cue+'... Which picture starts that way?');
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};

/* 7. Rainbow letter match (upper/lower) */
Games.matchCase = function(){
  const area=$('game-area'); area.innerHTML='';
  const letters = shuffle(S.unlocked.filter(x=>PHONEMES[x]).slice(0,3));
  while(letters.length<3){ const c=PHONEME_ORDER.find(p=>!letters.includes(p)); letters.push(c); }
  setInstruction('Match BIG and little letters!', 'Match the big letter with its little letter friend!');
  twinkleSay('Each pair brings back a rainbow color! 🌈');
  let pairs=0;
  const top=document.createElement('div'); top.className='choices';
  const bot=document.createElement('div'); bot.className='choices';
  let selected=null;
  letters.forEach(L=>{
    const b=document.createElement('button'); b.className='choice-card'; b.dataset.up=L;
    b.innerHTML='<span class="big-letter">'+L.toUpperCase()+'</span>';
    b.onclick=()=>{
      AudioSys.sfx('flip');
      top.querySelectorAll('.choice-card').forEach(x=>x.style.borderColor='#f0abfc');
      b.style.borderColor='#fbbf24'; selected=L;
      AudioSys.speak('Big '+L.toUpperCase()+'. Find little '+L+'.');
    };
    top.appendChild(b);
  });
  shuffle(letters).forEach(L=>{
    const b=document.createElement('button'); b.className='choice-card'; b.dataset.low=L;
    b.innerHTML='<span class="big-letter">'+L.toLowerCase()+'</span>';
    b.onclick=()=>{
      if(!selected){ AudioSys.speak('First tap a BIG letter!'); return; }
      if(L===selected){
        b.classList.add('correct');
        const up=top.querySelector('[data-up="'+L+'"]'); if(up) up.classList.add('correct');
        AudioSys.sfx('success'); AudioSys.speak('Yes! '+L.toUpperCase()+' and '+L.toLowerCase()+' match!');
        record('case:'+L, firstTryFlag&&attemptsThisItem===0);
        pairs++; addStars(1); sparkles(10);
        selected=null;
        if(pairs>=letters.length){
          if(S.rainbowColors<6){S.rainbowColors++; save();}
          confettiBlast();
          setTimeout(activityDone, 1800);
        }
      } else { attemptsThisItem++; gentleNo(b,'Those are not the same letter friends. Try again!'); }
    };
    bot.appendChild(b);
  });
  area.appendChild(top); area.appendChild(bot);
  const rb=document.createElement('div'); rb.className='rainbow-bar';
  const cols=['#ef4444','#f97316','#facc15','#22c55e','#3b82f6','#8b5cf6','#ec4899'];
  for(let i=0;i<7;i++){const s=document.createElement('div'); s.className='rainbow-seg'; if(i<S.rainbowColors) s.style.background=cols[i]; rb.appendChild(s);}
  area.appendChild(rb);
};

/* 8. Kitten word rescue (guided blending) */
Games.rescue = function(params){
  params=params||{};
  const dec=decodableWords();
  let w = params.word ? WORDS.find(x=>x.t===params.word) : null;
  if(!w) w = dec.length? dec[Math.floor(Math.random()*dec.length)] : WORDS[0];
  const area=$('game-area'); area.innerHTML='';
  setInstruction("Let's sound it out!", "Let's sound it out!");
  twinkleSay('A kitten needs us! Sound it out with me! 🐱');
  const wrap=document.createElement('div'); wrap.className='center';
  wrap.innerHTML='<div style="font-size:80px">🐱</div><div style="font-size:40px">🚪🔒</div>';
  area.appendChild(wrap);
  const stage=document.createElement('div'); stage.className='blend-stage';
  w.ph.forEach(p=>{
    const d=document.createElement('div'); d.className='blend-letter'; d.textContent=p; stage.appendChild(d);
  });
  area.appendChild(stage);
  const btnRow=document.createElement('div'); btnRow.className='center';
  btnRow.innerHTML='<button class="big-magic-btn">🔊 Sound it out!</button>';
  area.appendChild(btnRow);
  const blendLabel=document.createElement('div'); blendLabel.className='center';
  area.appendChild(blendLabel);
  btnRow.querySelector('button').onclick=()=>{
    AudioSys.ensure();
    const letters=[...stage.children];
    letters.forEach((el,i)=> setTimeout(()=>{ AudioSys.playPhoneme(w.ph[i]); el.style.transform='scale(1.25)'; el.style.borderColor='#fbbf24'; setTimeout(()=>el.style.transform='scale(1)',500); }, i*1000));
    setTimeout(()=>{
      letters.forEach(el=>el.classList.add('together'));
      stage.style.gap='2px';
      AudioSys.speak(w.t, {rate:0.75});
      const bw=document.createElement('div'); bw.className='blend-word'; bw.textContent=w.t+'! '+w.emoji;
      blendLabel.innerHTML=''; blendLabel.appendChild(bw);
      // picture choice to confirm
      const ch=document.createElement('div'); ch.className='choices';
      const right=w;
      const others=shuffle(WORDS.filter(x=>x.t!==w.t)).slice(0,2);
      shuffle([right].concat(others)).forEach(o=>{
        const b=document.createElement('button'); b.className='choice-card pic-card';
        b.innerHTML='<span class="pic-emoji">'+o.emoji+'</span><span class="pic-word">'+o.t+'</span>';
        if(o.t===w.t) b.dataset.correct='1';
        b.onclick=()=>{
          if(o.t===w.t){
            b.classList.add('correct');
            wrap.innerHTML='<div style="font-size:90px">🐱💨💖</div><div>Kitty is free!</div>';
            AudioSys.sfx('meow'); setTimeout(()=>AudioSys.sfx('fanfare'),400);
            AudioSys.speak('You put the sounds together: '+w.t+'! The kitten is free!');
            record('blend:'+w.t, firstTryFlag&&attemptsThisItem===0);
            if(!S.wordsRead.includes(w.t)) S.wordsRead.push(w.t);
            addStars(4); save(); sparkles(22); checkMilestones();
            maybeWordMilestone(w.t);
            setTimeout(activityDone, 2600);
          } else gentleNo(b);
        };
        ch.appendChild(b);
      });
      blendLabel.appendChild(ch);
    }, w.ph.length*1000+400);
  };
  // auto-play once for 4yo
  setTimeout(()=>{ if(document.body.contains(btnRow)) btnRow.querySelector('button').click(); }, 1200);
};
function maybeWordMilestone(word){
  if(S.wordsCelebrated.includes(word)) return;
  S.wordsCelebrated.push(word); save();
  const dec=decodableWords();
  if(S.wordsRead.length===1 || word==='sat' || word==='cat'){
    setTimeout(()=>showMilestone('You read a word!', word, 'You sounded it out all by yourself! I am SO proud!'), 2600);
  }
}

/* 9. Word building */
Games.buildWord = function(params){
  params=params||{};
  const dec=decodableWords();
  let w = params.word ? WORDS.find(x=>x.t===params.word) : null;
  if(!w) w = dec.length? dec[Math.floor(Math.random()*dec.length)] : WORDS[0];
  const area=$('game-area'); area.innerHTML='';
  setInstruction('Build the word '+w.t+'.', 'Build the word '+w.t+'.');
  twinkleSay(w.emoji+' shows '+w.t+'! Can you build it? 🧱');
  AudioSys.speak(w.t);
  const pic=document.createElement('div'); pic.className='center'; pic.style.fontSize='84px'; pic.textContent=w.emoji;
  area.appendChild(pic);
  const slots=document.createElement('div'); slots.className='slot-row';
  const slotEls=[];
  w.ph.forEach((p,i)=>{
    const s=document.createElement('div'); s.className='slot'+(i===0?' next':''); s.dataset.want=p; slots.appendChild(s); slotEls.push(s);
  });
  area.appendChild(slots);
  const pool=shuffle(w.ph.concat(shuffle(PHONEME_ORDER.filter(p=>!w.ph.includes(p))).slice(0,2)));
  const tiles=document.createElement('div'); tiles.className='tile-row';
  let next=0;
  pool.forEach(ch=>{
    const b=document.createElement('button'); b.className='tile'; b.textContent=ch;
    b.onclick=()=>{
      if(next>=slotEls.length) return;
      const slot=slotEls[next];
      if(ch===slot.dataset.want){
        slot.textContent=ch; slot.classList.add('filled'); slot.classList.remove('next');
        b.classList.add('used'); AudioSys.playPhoneme(ch);
        next++; if(slotEls[next]) slotEls[next].classList.add('next');
        if(next>=slotEls.length){
          AudioSys.playWordSlow(w);
          record('spell:'+w.t, firstTryFlag&&attemptsThisItem===0);
          if(!S.wordsRead.includes(w.t)) S.wordsRead.push(w.t);
          addStars(4); save(); sparkles(20); checkMilestones();
          setTimeout(()=>{ AudioSys.speak('You built '+w.t+'!'); }, w.ph.length*950+1900);
          maybeWordMilestone(w.t);
          setTimeout(activityDone, w.ph.length*950+3400);
        }
      } else { attemptsThisItem++; gentleNo(b, 'Hmm, we need '+slot.dataset.want+'. Listen!'); AudioSys.playPhoneme(slot.dataset.want); }
    };
    tiles.appendChild(b);
  });
  area.appendChild(tiles);
};

/* 10. Dress-up challenge */
Games.dressup = function(){
  const area=$('game-area'); area.innerHTML='';
  const dec=decodableWords(); const w = dec.length?dec[Math.floor(Math.random()*dec.length)]:WORDS[2];
  setInstruction('Which word says '+w.t+'?', 'Which word says '+w.t+'?');
  twinkleSay('Answer to win a princess treasure! 👗');
  AudioSys.speak(w.t);
  const row=document.createElement('div'); row.className='choices';
  shuffle([w].concat(shuffle(WORDS.filter(x=>x.t!==w.t)).slice(0,2))).forEach(o=>{
    const b=document.createElement('button'); b.className='choice-card';
    b.innerHTML='<span style="font-family:Andika;font-size:44px;color:#5b2a6e">'+o.t+'</span><span class="pic-emoji" style="font-size:40px">'+o.emoji+'</span>';
    if(o.t===w.t) b.dataset.correct='1';
    b.onclick=()=>{
      const wordEl=b.querySelector('span');
      AudioSys.speak(o.t, {rate:0.8});
      if(o.t===w.t){
        b.classList.add('correct');
        celebrateRight('sight:'+w.t, 'Yes! That says '+w.t+'!');
        addStars(3);
        setTimeout(()=>{ grantRandomReward('dressup'); activityDone(); }, 2000);
      } else gentleNo(b, 'Sound it out slowly... which one says '+w.t+'?');
    };
    row.appendChild(b);
  });
  area.appendChild(row);
  const p=document.createElement('div'); p.className='center'; p.style.fontSize='90px'; p.textContent='👸';
  area.appendChild(p);
};

/* 11. Ballet sound steps */
Games.ballet = function(){
  const area=$('game-area'); area.innerHTML='';
  const steps = shuffle(S.unlocked.filter(x=>PHONEMES[x]).slice(0,3));
  while(steps.length<3) steps.push(PHONEME_ORDER[steps.length%PHONEME_ORDER.length]);
  setInstruction('Tap the sound you hear!', 'Tap the stage tile that makes the sound you hear!');
  twinkleSay('The ballerina needs your ears! 🩰');
  const dancer=document.createElement('div'); dancer.className='ballerina'; dancer.textContent='🩰';
  area.appendChild(dancer);
  let idx=0, target=steps[0];
  const floor=document.createElement('div'); floor.className='ballet-floor';
  steps.forEach(s=>{
    const b=document.createElement('button'); b.className='ballet-tile'; b.textContent=s.toUpperCase(); b.dataset.s=s;
    b.onclick=()=>{
      if(s===target){
        b.style.background='linear-gradient(180deg,#fef3c7,#fcd34d)'; AudioSys.sfx('success');
        dancer.textContent=['🩰','💃','👯','🦢'][idx%4];
        dancer.style.transform='rotate('+(idx*20)+'deg)';
        AudioSys.speak('Beautiful step!');
        record('ballet:'+s, firstTryFlag&&attemptsThisItem===0);
        idx++;
        if(idx>=steps.length){
          dancer.textContent='💃✨'; confettiBlast();
          AudioSys.speak('Bravo! Beautiful dancing!');
          addStars(3);
          setTimeout(activityDone, 2200);
        } else { target=steps[idx]; setTimeout(()=>AudioSys.playPhoneme(target), 800); }
      } else gentleNo(b);
    };
    floor.appendChild(b);
  });
  area.appendChild(floor);
  const hear=document.createElement('div'); hear.className='center';
  hear.innerHTML='<button class="magic-btn">🔊 Hear the step</button>';
  hear.querySelector('button').onclick=()=>AudioSys.playPhoneme(target);
  area.appendChild(hear);
  setTimeout(()=>AudioSys.playPhoneme(target), 900);
};

/* 12. Rhyme garden */
Games.rhyme = function(){
  const area=$('game-area'); area.innerHTML='';
  const sets=[{base:'cat', rhymes:['hat'], others:['dog','sun'], be:{hat:'🎩',dog:'🐶',sun:'☀️'}},{base:'dog', rhymes:['frog'], others:['cat','moon'], be:{frog:'🐸',cat:'🐱',moon:'🌙'}},{base:'pin', rhymes:['tin'], others:['map','sun'], be:{tin:'🥫',map:'🗺️',sun:'☀️'}}];
  const set=sets[Math.floor(Math.random()*sets.length)];
  setInstruction('What rhymes with '+set.base+'?', 'What rhymes with '+set.base+'? '+set.base+'... '+set.rhymes[0]+'!');
  twinkleSay(set.base+' needs a rhyming flower friend! 🌸');
  AudioSys.speak(set.base);
  const garden=document.createElement('div'); garden.className='center'; garden.style.fontSize='60px'; garden.textContent='🌱';
  area.appendChild(garden);
  const row=document.createElement('div'); row.className='choices';
  shuffle(set.rhymes.concat(set.others)).forEach(w=>{
    const b=document.createElement('button'); b.className='choice-card pic-card';
    b.innerHTML='<span class="pic-emoji">'+(set.be[w]||'⭐')+'</span><span class="pic-word">'+w+'</span>';
    if(set.rhymes.includes(w)) b.dataset.correct='1';
    b.onclick=()=>{
      AudioSys.speak(w, {rate:0.85});
      if(set.rhymes.includes(w)){
        b.classList.add('correct'); garden.textContent='🌸🌷🌼';
        celebrateRight('rhyme:'+set.base, 'Yes! '+set.base+' and '+w+' rhyme!'); addStars(3); sparkles(18);
        setTimeout(activityDone, 2300);
      } else gentleNo(b, 'Do '+set.base+' and '+w+' sound the same at the end? Try again!');
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};

/* 13. Tracing */
Games.trace = function(params){
  params=params||{};
  const L=(params.letter||S.currentFocus||'s').toUpperCase();
  const area=$('game-area'); area.innerHTML='';
  setInstruction('Trace the sparkly '+L+'!', 'Trace the letter '+L+' with your finger!');
  twinkleSay('Slow and sparkly! Trace '+L+'! ✨');
  const wrap=document.createElement('div'); wrap.className='trace-wrap';
  const cv=document.createElement('canvas'); cv.id='trace-canvas'; cv.width=320; cv.height=380;
  wrap.appendChild(cv);
  const btn=document.createElement('button'); btn.className='magic-btn'; btn.textContent='🌟 I did it!';
  wrap.appendChild(btn);
  area.appendChild(wrap);
  const ctx=cv.getContext('2d');
  if(!ctx){ btn.onclick=()=>{ addStars(2); setTimeout(activityDone, 800); }; return; }
  ctx.lineWidth=26; ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle='#e9d5ff';
  ctx.font='700 300px Andika, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.strokeText(L, 160, 200);
  ctx.fillStyle='#8b5cf6'; ctx.font='700 300px Andika, sans-serif';
  // dotted guide: draw letter faintly
  ctx.globalAlpha=0.25; ctx.fillText(L,160,200); ctx.globalAlpha=1;
  // start dot
  ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(90,90,16,0,7); ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='800 20px Quicksand'; ctx.fillText('▶',90,91);
  let drawing=false, covered=0;
  const trail=[];
  function pos(e){
    const r=cv.getBoundingClientRect();
    const p=(e.touches&&e.touches[0])||e;
    return {x:(p.clientX-r.left)*(cv.width/r.width), y:(p.clientY-r.top)*(cv.height/r.height)};
  }
  cv.addEventListener('pointerdown',e=>{drawing=true; trail.length=0; AudioSys.ensure();});
  window.addEventListener('pointerup',()=>drawing=false);
  cv.addEventListener('pointermove',e=>{
    if(!drawing) return; e.preventDefault();
    const p=pos(e); trail.push(p); covered++;
    ctx.strokeStyle='#ec4899';
    if(trail.length>1){
      ctx.beginPath(); ctx.moveTo(trail[trail.length-2].x,trail[trail.length-2].y); ctx.lineTo(p.x,p.y); ctx.stroke();
    }
    // sparkle dot
    ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(p.x,p.y,6,0,7); ctx.fill();
    if(covered%40===0) AudioSys.sfx('twinkle',0.3);
  });
  btn.onclick=()=>{
    AudioSys.sfx('fanfare'); sparkles(18);
    AudioSys.speak('Beautiful tracing! That is '+L+'!');
    record('trace:'+L.toLowerCase(), true); addStars(2);
    setTimeout(activityDone, 1800);
  };
};

/* 14. Rainbow painter (delight) */
Games.painter = function(){
  const area=$('game-area'); area.innerHTML='';
  setInstruction('Paint the magic picture!', 'Tap the hidden pictures to paint them! Tap the sun!');
  twinkleSay('Just for fun! Paint whatever you love! 🎨');
  const grid=document.createElement('div'); grid.className='paint-grid';
  const items=[['☀️','sun'],['🌈','rainbow'],['🦄','unicorn'],['🐱','kitten'],['👑','crown'],['🌸','flower']];
  let found=0;
  items.forEach(([e,w])=>{
    const b=document.createElement('button'); b.className='paint-card'; b.textContent='✨';
    b.onclick=()=>{
      if(b.classList.contains('found')) return;
      b.classList.add('found'); b.textContent=e; AudioSys.sfx('sparkle');
      AudioSys.speak(w+'!');
      found++; sparkles(6);
      if(found>=items.length){ addStars(2); setTimeout(activityDone, 1500); }
    };
    grid.appendChild(b);
  });
  area.appendChild(grid);
  const note=document.createElement('div'); note.className='center'; note.style.marginTop='10px';
  note.innerHTML='<i>Can you find the things beginning with /c/? (crown, cat...) — just for fun! 💜</i>';
  area.appendChild(note);
};

/* 15. Storybook reading (also a screen) */
function openStorybook(){
  showScreen('story');
  let page=0;
  // Only show pages whose sounds Layla has unlocked (plus the first page always).
  const set = new Set(S.unlocked);
  let pages = STORY_PAGES.filter((p,i)=> i===0 || (p.needs||[]).every(n=>set.has(n)));
  if(!pages.length) pages = STORY_PAGES.slice(0,1);
  function render(){
    const P=pages[page%pages.length];
    $('story-page-title').textContent='Read it yourself — page '+(page%pages.length+1);
    const sent=$('story-sentence'); sent.innerHTML='';
    P.s.forEach(word=>{
      const clean=word.replace('.','');
      const s=document.createElement('span'); s.className='w'; s.textContent=word;
      s.onclick=(e)=>{ e.stopPropagation(); AudioSys.speak(clean,{rate:0.8}); };
      sent.appendChild(s); sent.appendChild(document.createTextNode(' '));
    });
    $('story-art').textContent = P.art || '🐱';
    currentInstruction='Read it yourself. Tap a word if you need help.';
  }
  $('story-prev').onclick=()=>{page=(page+pages.length-1)%pages.length; render(); AudioSys.sfx('flip');};
  $('story-next').onclick=()=>{page=(page+1)%pages.length; render(); AudioSys.sfx('flip');};
  $('btn-story-hear').onclick=()=>{
    const P=pages[page%pages.length];
    AudioSys.speak(P.s.join(' '),{rate:0.8});
  };
  $('btn-story-read').onclick=()=>{
    const P=pages[page%pages.length];
    confettiBlast(); AudioSys.sfx('fanfare');
    S.wordsRead.push('sentence:'+(page%pages.length));
    addStars(5); save();
    if(!S.sentenceCelebrated){
      S.sentenceCelebrated=true; save();
      showMilestone('LAYLA READ A SENTENCE!', P.s.join(' '), 'You read a whole sentence! This is REAL reading! 🌟');
      grantReward('crown-gold');
    } else {
      AudioSys.speak('You read it! Amazing reading!');
      toast('Amazing reading! 🌟');
    }
  };
  render();
  AudioSys.speak('Read it yourself! Tap a word if you need help.');
}

/* ---------------- REWARDS / CASTLE / STICKERS ---------------- */
function grantReward(id){
  const r=REWARDS.find(x=>x.id===id);
  if(!r) return;
  if(S.rewards.includes(id)){ addStars(2); return; }
  S.rewards.push(id); save();
  showReward(r);
}
function grantRandomReward(context){
  const locked=REWARDS.filter(r=>!S.rewards.includes(r.id));
  const pick = locked.length? locked[Math.floor(Math.random()*Math.min(4,locked.length))] : REWARDS[Math.floor(Math.random()*REWARDS.length)];
  // bias: first dressup reward = rainbow dress if not owned
  let r=pick;
  if(!S.rewards.includes('dress-rainbow') && (context==='first-session'||Math.random()<0.4)) r=REWARDS.find(x=>x.id==='dress-rainbow');
  if(!S.rewards.includes(r.id)){ S.rewards.push(r.id); save(); }
  awardSticker('star-'+r.id, true);
  showReward(r);
}
function showReward(r){
  $('reward-item').textContent=r.emoji;
  $('reward-name').textContent=r.name;
  $('reward-chest').textContent='🎁';
  $('reward-chest').classList.remove('open');
  $('btn-reward-open').classList.remove('hidden');
  $('btn-reward-castle').classList.add('hidden');
  $('reward-modal').classList.remove('hidden');
  AudioSys.sfx('chest');
  twinkleSay('You earned something! Open it! 🎁');
  $('btn-reward-open').onclick=()=>{
    $('reward-chest').textContent='✨'; $('reward-chest').classList.add('open');
    AudioSys.sfx('fanfare'); confettiBlast(); sparkles(24);
    AudioSys.speak('You earned '+r.name+'! Beautiful!');
    // auto-equip wearable
    const slot = r.cat==='dress'?'dress':r.cat==='crown'?'crown':r.cat==='shoes'?'shoes':r.cat==='pet'?'pet':r.cat==='wallpaper'?'wallpaper':r.cat==='furniture'?'furniture':r.cat==='window'?'window':r.cat==='decor'?'decor':r.cat;
    if(slot && S.equipped.hasOwnProperty(slot)){ S.equipped[slot]=r.id; save(); }
    $('btn-reward-open').classList.add('hidden');
    const b=$('btn-reward-castle'); b.classList.remove('hidden');
    b.onclick=()=>{ $('reward-modal').classList.add('hidden'); openCastle(); };
  };
}
function awardSticker(id, silent){
  if(S.stickers.includes(id)) return;
  S.stickers.push(id); save(); refreshStickers();
  if(!silent){ toast('New sticker! ⭐'); AudioSys.sfx('sparkle'); }
}
function showMilestone(title, word, text){
  $('milestone-title').textContent=title;
  $('milestone-word').textContent=word;
  $('milestone-text').textContent=text;
  $('milestone-modal').classList.remove('hidden');
  confettiBlast(); sparkles(30,true); AudioSys.sfx('fanfare');
  AudioSys.speak(title+' '+word+'! '+text);
  addStars(5);
}
$('btn-milestone-ok').onclick=()=>$('milestone-modal').classList.add('hidden');

const CLOSET_TABS=[['dress','👗 Dresses'],['crown','👑 Crowns'],['shoes','👠 Shoes'],['pet','🐱 Pets'],['wallpaper','🌸 Room'],['furniture','🛏️ Furniture'],['window','🌈 Window'],['decor','💐 Decor'],['wings','🧚 Wings']];
let closetTab='dress';
function openCastle(){
  showScreen('castle');
  renderClosetTabs(); renderCloset(); renderRoom();
  AudioSys.speak('Welcome to your castle, Layla!');
}
function renderClosetTabs(){
  const t=$('closet-tabs'); t.innerHTML='';
  CLOSET_TABS.forEach(([id,label])=>{
    const b=document.createElement('button'); b.className='closet-tab'+(id===closetTab?' active':'');
    b.textContent=label; b.onclick=()=>{closetTab=id; renderClosetTabs(); renderCloset(); AudioSys.sfx('flip');};
    t.appendChild(b);
  });
}
function renderCloset(){
  const g=$('closet-grid'); g.innerHTML='';
  REWARDS.filter(r=>r.cat===closetTab).forEach(r=>{
    const owned=S.rewards.includes(r.id);
    const d=document.createElement('button'); d.className='closet-item'+(owned?'':' locked')+(S.equipped[closetTab]===r.id?' equipped':'');
    d.innerHTML='<span>'+(owned?r.emoji:'🔒')+'</span><span class="cname">'+r.name+'</span>'+(S.equipped[closetTab]===r.id?'<span class="equip-badge">💖</span>':'');
    d.onclick=()=>{
      if(!owned){ AudioSys.speak('Keep playing adventures to unlock this!'); toast('Play adventures to unlock! 🔒'); return; }
      S.equipped[closetTab]=r.id; save(); renderCloset(); renderRoom();
      AudioSys.sfx('sparkle'); sparkles(10);
      AudioSys.speak(r.name+'! Beautiful choice!');
    };
    g.appendChild(d);
  });
  if(!g.children.length) g.innerHTML='<p>No treasures here yet. Play adventures! 🌟</p>';
}
function renderRoom(){
  const eq=S.equipped;
  const dress=REWARDS.find(r=>r.id===eq.dress);
  const crown=REWARDS.find(r=>r.id===eq.crown);
  const pet=REWARDS.find(r=>r.id===eq.pet);
  const win=REWARDS.find(r=>r.id===eq.window);
  const furn=REWARDS.find(r=>r.id===eq.furniture);
  const decor=REWARDS.filter(r=>r.cat==='decor'&&S.rewards.includes(r.id)).slice(0,3);
  $('castle-princess').textContent = dress ? dress.emoji : '👸';
  $('castle-princess').title = (crown?crown.emoji+' ':'')+(dress?dress.name:'');
  $('castle-pet').textContent = pet?pet.emoji:'🐱';
  $('castle-window').textContent = win?win.emoji:'🌈';
  $('castle-furniture').textContent = furn?furn.emoji:'🛏️';
  const wall = REWARDS.find(r=>r.id===eq.wallpaper);
  $('room-wall').style.background = wall&&wall.id==='wall-star' ? 'radial-gradient(circle,#fff7,_#c4b5fd)' : wall&&wall.id==='wall-pink' ? 'linear-gradient(180deg,#fce7f3,#fbcfe8)' : '#f3e8ff';
  const dr=$('castle-decor-row'); dr.innerHTML='';
  decor.forEach(d=>{const s=document.createElement('span'); s.textContent=d.emoji; dr.appendChild(s);});
  if(crown && S.rewards.includes(crown.id)){
    // show crown floating above princess
    $('castle-princess').textContent = (crown.emoji==='🌸'?'👩‍🦰':dress?dress.emoji:'👸');
  }
}
function refreshStickers(){
  const book=$('sticker-book'); if(!book) return; book.innerHTML='';
  const all=[
    {id:'layla-name', e:'💖', n:'I found my name!'},
    {id:'sound-s', e:'☀️', n:'S says ssss'},
    {id:'sound-a', e:'🍎', n:'A says a'},
    {id:'sound-t', e:'👆', n:'T says t'},
    {id:'sound-m', e:'🌙', n:'M says mmmm'},
    {id:'word-sat', e:'🪑', n:'I read SAT'},
    {id:'word-cat', e:'🐱', n:'I read CAT'},
    {id:'word-mat', e:'🧶', n:'I read MAT'},
    {id:'rainbow', e:'🌈', n:'Rainbow helper'},
    {id:'unicorn', e:'🦄', n:'Unicorn friend'},
    {id:'kitten', e:'🐱', n:'Kitten rescuer'},
    {id:'princess', e:'👑', n:'Castle star'},
    {id:'story', e:'📚', n:'Sentence reader!'}
  ];
  // dynamic: mark earned based on mastery/words
  const earned=new Set(S.stickers);
  if((S.mastery['sound:s']||{score:0}).score>0.4) earned.add('sound-s');
  if((S.mastery['sound:a']||{score:0}).score>0.4) earned.add('sound-a');
  if((S.mastery['sound:t']||{score:0}).score>0.4) earned.add('sound-t');
  if((S.mastery['sound:m']||{score:0}).score>0.4) earned.add('sound-m');
  S.wordsRead.forEach(w=>{ if(w==='sat')earned.add('word-sat'); if(w==='cat')earned.add('word-cat'); if(w==='mat')earned.add('word-mat'); });
  if(S.rainbowColors>=3) earned.add('rainbow');
  if(S.wordsRead.length>=1) earned.add('kitten');
  if(S.rewards.length>=3) earned.add('princess');
  if(S.sentenceCelebrated) earned.add('story');
  all.forEach(s=>{
    const has=earned.has(s.id);
    const d=document.createElement('div'); d.className='sticker'+(has?'':' locked');
    d.innerHTML='<div class="s-emoji">'+(has?s.e:'🔒')+'</div><div class="s-name">'+s.n+'</div>';
    book.appendChild(d);
  });
}

/* ---------------- KINGDOM / FLOWS ---------------- */
let kingdomFirstPaint = true;
function refreshKingdom(){
  $('star-count').textContent=S.stars;
  const prog=(list)=>{ const s=list.filter(id=>(S.mastery['sound:'+id]||{score:0}).score>0.5).length; return s+'/'+list.length+' ✨'; };
  $('prog-rainbow').textContent=prog(['s','a','l','y']);
  $('prog-unicorn').textContent=prog(S.unlocked);
  $('prog-kitten').textContent=S.wordsRead.length+' words 💖';
  document.querySelectorAll('.landmark').forEach(l=>l.classList.remove('recommended'));
  // recommend: first session -> castle plaque? then weakest area
  let rec='land-rainbow';
  if(!S.firstSessionDone) rec='land-castle';
  else if(S.wordsRead.length>=2) rec='land-kitten';
  else if((S.mastery['sound:'+S.currentFocus]||{score:0}).score<0.5) rec='land-unicorn';
  const el=document.getElementById(rec); if(el) el.classList.add('recommended');
  const msgs={
    'land-castle':"Layla! I found something magical in your castle! Come see! 💖",
    'land-rainbow':"The rainbow lost its colors! Can you help? 🌈",
    'land-unicorn':"A unicorn needs a sound crystal! Can you hear "+(PHONEMES[S.currentFocus]?PHONEMES[S.currentFocus].cue:'ssss')+"? 🦄",
    'land-kitten':"A kitten is stuck! Let's sound out a word! 🐱"
  };
  const label={ 'land-castle':'castle','land-rainbow':'rainbow','land-unicorn':'unicorn','land-kitten':'kitten' }[rec];
  const msg = msgs[rec]||'Where shall we go today? 💖';
  if(kingdomFirstPaint){ $('twinkle-speech').textContent=msg; $('twinkle-mini-text').textContent=msg; kingdomFirstPaint=false; }
  else twinkleSay(msg);
  // story unlock visual
  const story=document.getElementById('land-story');
  if(S.sentenceUnlocked||S.wordsRead.length>=3){ story.classList.remove('locked'); story.style.opacity='1'; $('story-lock-note').textContent='Open! 🎉'; }
}
function refreshAll(){ refreshKingdom(); refreshStickers(); renderRoom(); const sc=$('star-count'); if(sc) sc.textContent=S.stars; }

/* First flagship session per spec */
function firstSession(){
  S.firstSessionStep=0;
  runSession('Layla\'s First Magic', [
    {title:'That\'s YOUR name!', run:()=>namePlaqueIntro()},
    {title:'Find Layla', run:()=>Games.findName()},
    {title:'Build Your Name', run:()=>Games.buildName()},
    {title:'Unicorn Sound Crystals', run:()=>Games.crystals({focus:'s'})},
    {title:'Magic Mirror', run:()=>Games.firstSound()}
  ], REWARDS.find(r=>r.id==='dress-rainbow'));
}
function namePlaqueIntro(){
  const area=$('game-area'); area.innerHTML='';
  setInstruction("That's YOUR name!", "That's YOUR name! Layla!");
  const wrap=document.createElement('div'); wrap.className='center';
  wrap.innerHTML='<div class="name-plaque" style="position:static;transform:none;font-size:54px;letter-spacing:8px;">LAYLA 👑</div><div style="font-size:90px">🐱👑</div><p style="font-weight:800;font-size:20px;">Twinkle found your name on the castle door!<br>You are <b>already</b> a reader! 💖</p><button class="big-magic-btn">Yay! 💖</button>';
  area.appendChild(wrap);
  twinkleSay("Hi Layla! I found something magical! That's YOUR name!");
  AudioSys.speak("Hi Layla! I found something magical! That's YOUR name! Layla!");
  wrap.querySelector('button').onclick=()=>{ AudioSys.sfx('fanfare'); sparkles(20); activityDone(); };
}
function endSession(){
  renderDots();
  const rew=sessionReward;
  if(rew && !S.rewards.includes(rew.id)){
    S.rewards.push(rew.id); save();
    if(!S.firstSessionDone){ S.firstSessionDone=true; save(); }
    showReward(rew);
    const b=$('btn-reward-castle');
    const old=b.onclick;
    b.onclick=()=>{ $('reward-modal').classList.add('hidden'); openCastle(); setTimeout(showSessionChoice, 1200); };
    // also auto show choice after closing via X? keep simple
    setTimeout(()=>{ if($('reward-modal').classList.contains('hidden')) showSessionChoice(); }, 8000);
    sessionReward=null;
    logSession();
    return;
  }
  // small reward chance — chain the session choice AFTER the reward is enjoyed
  if(Math.random()<0.5 && sessionName!=='Free play'){
    const locked = REWARDS.filter(r=>!S.rewards.includes(r.id));
    if(locked.length){
      grantRandomReward();
      const b=$('btn-reward-castle');
      b.onclick=()=>{ $('reward-modal').classList.add('hidden'); openCastle(); setTimeout(showSessionChoice, 1500); };
      logSession();
      return;
    }
  }
  if(!S.firstSessionDone){ S.firstSessionDone=true; save(); }
  logSession();
  showSessionChoice();
}
function logSession(){
  const today=new Date().toDateString();
  if(S.lastPlayDate!==today){ S.streak=(S.lastPlayDate&& (Date.now()-new Date(S.lastPlayDate).getTime())<86400000*2)?S.streak+1:1; S.lastPlayDate=today; }
  S.sessions.push({d:Date.now(), name:sessionName, stars:S.stars});
  if(S.sessions.length>30) S.sessions.shift();
  S.minutes+=6; save(); refreshKingdom();
}
function showSessionChoice(){
  $('session-title').textContent='Beautiful playing! 🌈';
  $('session-text').textContent='You helped the kingdom AND learned reading magic!';
  $('session-modal').classList.remove('hidden');
  AudioSys.speak('You helped the rainbow AND learned a new sound! Want another adventure?');
}
$('btn-again').onclick=()=>{ $('session-modal').classList.add('hidden'); adventure(); };
$('btn-to-castle').onclick=()=>{ $('session-modal').classList.add('hidden'); openCastle(); };

function adventure(){
  // 5-min loop: warm-up + current sound + review + blending + reward
  const focus=S.currentFocus;
  const review=weakestPhoneme();
  const dec=decodableWords();
  const acts=[];
  acts.push({title:'Warm-up Bubbles', run:()=>Games.bubbles({focus:review, mode:'name'})});
  acts.push({title:'Unicorn Sound Crystals', run:()=>Games.crystals({focus})});
  acts.push({title:'Magic Mirror', run:()=>Games.firstSound()});
  if(dec.length>=2 && (S.blendingUnlocked||S.unlocked.length>=3)){
    acts.push({title:'Help the Kitten', run:()=>Games.rescue()});
  } else {
    acts.push({title:'Rainbow Match', run:()=>Games.matchCase()});
  }
  runSession('Magical Adventure', acts, null);
  // sessionReward: surprise
  sessionReward = Math.random()<0.6 ? REWARDS.filter(r=>!S.rewards.includes(r.id))[0]||null : null;
}

/* ---------------- LAND ROUTING ---------------- */
document.querySelectorAll('.landmark').forEach(l=>{
  l.addEventListener('click',()=>{
    AudioSys.ensure(); AudioSys.startMusic();
    const land=l.dataset.land;
    if(l.classList.contains('locked')){
      if(land==='story' && (S.sentenceUnlocked||S.wordsRead.length>=3)){ openStorybook(); return; }
      AudioSys.speak('This land is still sleeping. Keep reading to wake it up!');
      toast('🔒 Keep playing to unlock this magic!');
      return;
    }
    if(land==='rainbow'){
      const opts=Math.random();
      if(opts<0.4) runSession('Rainbow Road',[{title:'Magic Letter Bubbles',run:()=>Games.bubbles({focus:S.currentFocus})},{title:'Rainbow Letter Match',run:()=>Games.matchCase()}], null);
      else if(opts<0.7) runSession('Rainbow Road',[{title:'Find Your Letter',run:()=>Games.bubbles({focus:weakestPhoneme(),mode:'sound'})},{title:'Trace the Magic',run:()=>Games.trace({letter:S.currentFocus})}], null);
      else runSession('Rainbow Road',[{title:'Build Your Name',run:()=>Games.buildName()},{title:'Missing Letter',run:()=>Games.missingLetter()}], null);
    }
    else if(land==='unicorn') runSession('Unicorn Meadow',[{title:'Unicorn Sound Crystals',run:()=>Games.crystals({focus:S.currentFocus})},{title:'First Sound Mirror',run:()=>Games.firstSound()},{title:'Ballet Sound Steps',run:()=>Games.ballet()}], null);
    else if(land==='kitten'){
      if(!S.blendingUnlocked && S.unlocked.length<3){
        // gentle on-ramp
        runSession('Kitten Cottage',[{title:'Unicorn Sound Crystals',run:()=>Games.crystals({focus:'s'})},{title:'Help the Kitten',run:()=>Games.rescue({word:'sat'})}], null);
      } else runSession('Kitten Cottage',[{title:'Help the Kitten',run:()=>Games.rescue()},{title:'Word Building',run:()=>Games.buildWord()}], null);
    }
    else if(land==='castle') openCastle();
    else if(land==='ballet') runSession('Ballet Stage',[{title:'Ballet Sound Steps',run:()=>Games.ballet()},{title:'Rhyme Garden',run:()=>Games.rhyme()}], null);
    else if(land==='story') openStorybook();
    else if(land==='fairy') runSession('Fairy Garden',[{title:'Rhyme Garden',run:()=>Games.rhyme()},{title:'Rainbow Painter',run:()=>Games.painter()}], null);
  });
});

/* ---------------- NAV ---------------- */
function goKingdom(){ AudioSys.stopSpeak(); showScreen('kingdom'); refreshKingdom(); }
$('btn-kingdom').onclick=goKingdom;
document.querySelectorAll('.back-to-kingdom').forEach(b=>b.onclick=goKingdom);
$('nav-home').onclick=goKingdom;
$('nav-castle').onclick=openCastle; $('nav-castle-top').onclick=openCastle;
$('nav-stickers').onclick=()=>{showScreen('stickers'); refreshStickers(); AudioSys.speak('Your sticker book! You earned so many!');};
$('nav-stickers-top').onclick=()=>{showScreen('stickers'); refreshStickers();};
$('btn-hear').onclick=hearInstruction; $('btn-hear2').onclick=hearInstruction;
$('btn-replay-twinkle').onclick=()=>{ const t=$('twinkle-speech').textContent; if(t) AudioSys.speak(t); };
document.querySelectorAll('.castle-hear').forEach(b=>b.onclick=()=>AudioSys.speak('Welcome to your castle, Layla! Tap something to try it on!'));
document.querySelectorAll('.sticker-hear').forEach(b=>b.onclick=()=>AudioSys.speak('Your sticker book!'));
document.querySelectorAll('.story-hear').forEach(b=>b.onclick=()=>AudioSys.speak(currentInstruction));
$('btn-start-magic').onclick=()=>{
  AudioSys.ensure(); AudioSys.startMusic();
  if(!S.firstSessionDone){ firstSession(); }
  else { showScreen('kingdom'); refreshKingdom(); }
};
$('btn-continue').onclick=()=>{ AudioSys.ensure(); AudioSys.startMusic(); goKingdom(); };

/* Parent gate (hold 3s) */
let holdTimer=null, holdStart=0;
function openGate(){ $('parent-gate').classList.remove('hidden'); $('hold-fill').style.width='0'; }
function closeGate(){ $('parent-gate').classList.add('hidden'); if(holdTimer) cancelAnimationFrame(holdTimer); holdTimer=null; }
$('nav-parents').onclick=openGate; $('nav-parent-top').onclick=openGate;
$('gate-cancel').onclick=closeGate;
const holdBtn=$('hold-to-enter');
function holdLoop(){
  const p=Math.min(1,(Date.now()-holdStart)/3000);
  $('hold-fill').style.width=(p*100)+'%';
  if(p>=1){ closeGate(); openParent(); return; }
  holdTimer=requestAnimationFrame(holdLoop);
}
holdBtn.addEventListener('pointerdown',()=>{holdStart=Date.now(); holdLoop();});
['pointerup','pointerleave','pointercancel'].forEach(ev=>holdBtn.addEventListener(ev,()=>{ if(holdTimer) cancelAnimationFrame(holdTimer); holdTimer=null; $('hold-fill').style.width='0'; }));
function openParent(){
  showScreen('parent'); renderParent();
}
$('btn-parent-close').onclick=goKingdom;
function renderParent(){
  const p=$('parent-progress'); p.innerHTML='';
  const rows=[
    ['Sounds introduced', S.unlocked.length+' / '+PHONEME_ORDER.length],
    ['Words decoded', S.wordsRead.length],
    ['Current focus', (S.currentFocus||'s').toUpperCase()+' ('+(PHONEMES[S.currentFocus]?PHONEMES[S.currentFocus].cue:'')+')'],
    ['Reading streak', S.streak+' days'],
    ['Total reading minutes', S.minutes]
  ];
  rows.forEach(([k,v])=>{const d=document.createElement('div'); d.className='prog-row'; d.innerHTML='<span>'+k+'</span><b style="margin-left:auto">'+v+'</b>'; p.appendChild(d);});
  PHONEME_ORDER.forEach(id=>{
    const m=S.mastery['sound:'+id];
    const sc=m?m.score:0;
    const d=document.createElement('div'); d.className='prog-row';
    d.innerHTML='<span>'+id.toUpperCase()+'</span><div class="prog-bar"><div class="prog-fill" style="width:'+Math.round(sc*100)+'%"></div></div><span>'+(S.unlocked.includes(id)?Math.round(sc*100)+'%':'🔒')+'</span>';
    p.appendChild(d);
  });
  const strong=PHONEME_ORDER.filter(id=>(S.mastery['sound:'+id]||{score:0}).score>0.6).map(x=>x.toUpperCase());
  const weak=PHONEME_ORDER.filter(id=>S.unlocked.includes(id)&&(S.mastery['sound:'+id]||{score:0}).score<0.4).map(x=>x.toUpperCase());
  $('parent-summary').innerHTML=
    (strong.length?'<div>✅ Layla confidently recognizes <b>'+strong.join(', ')+'</b>.</div>':'<div>🌱 Layla is just beginning — lots of gentle review.</div>')+
    (S.wordsRead.length?'<div>📖 She is beginning to blend sounds into words ('+S.wordsRead.slice(-4).join(', ')+').</div>':'<div>📖 Blending will unlock once a few sounds feel strong.</div>')+
    (weak.length?'<div>💜 Needs a little more play with <b>'+weak.join(', ')+'</b> — the app will repeat these gently.</div>':'<div>🌟 No weak sounds right now!</div>');
  // settings
  $('set-voice').value=S.settings.voice*100;
  $('set-music').value=S.settings.music*100;
  $('set-sfx').value=S.settings.sfx*100;
  $('set-autoplay').checked=S.settings.autoplay;
  $('set-motion').checked=S.settings.motion;
  // practice grid
  const pg=$('practice-grid'); pg.innerHTML='';
  [['Her name',()=>runSession('Her Name',[{title:'Find Layla',run:()=>Games.findName()},{title:'Build Your Name',run:()=>Games.buildName()}],null)],
   ['Sound S',()=>runSession('Practice S',[{title:'Crystals',run:()=>Games.crystals({focus:'s'})},{title:'Bubbles',run:()=>Games.bubbles({focus:'s'})}],null)],
   ['Sound M',()=>runSession('Practice M',[{title:'Crystals',run:()=>Games.crystals({focus:'m'})},{title:'Mirror',run:()=>Games.firstSound()}],null)],
   ['Blending',()=>runSession('Blending',[{title:'Help the Kitten',run:()=>Games.rescue()},{title:'Word Building',run:()=>Games.buildWord()}],null)],
   ['Rhyme',()=>runSession('Rhyme',[{title:'Rhyme Garden',run:()=>Games.rhyme()}],null)],
   ['Story',()=>openStorybook()]
  ].forEach(([label,fn])=>{const b=document.createElement('button'); b.textContent=label; b.onclick=()=>{showScreen('game'); fn();}; pg.appendChild(b);});
  const tg=$('test-grid'); tg.innerHTML='';
  [['Unlock all sounds',()=>{S.unlocked=PHONEME_ORDER.slice(); S.currentFocus='m'; save(); toast('All sounds unlocked!'); renderParent();}],
   ['Trigger blending 🎉',()=>{S.blendingUnlocked=true; save(); showMilestone('You read a word!','sat','You put the sounds together: s-a-t... sat!');}],
   ['Trigger sentence 📚',()=>{S.sentenceUnlocked=true; save(); showMilestone('LAYLA READ A SENTENCE!','Sam sat.','You read a whole sentence!');}],
   ['Unlock rewards 🎁',()=>{REWARDS.forEach(r=>{if(!S.rewards.includes(r.id))S.rewards.push(r.id)}); save(); toast('All treasures unlocked!');}],
   ['Jump: bubbles',()=>runSession('Test',[{title:'Bubbles',run:()=>Games.bubbles({})}],null)],
   ['Jump: rescue',()=>runSession('Test',[{title:'Rescue',run:()=>Games.rescue()}],null)],
   ['Jump: build word',()=>runSession('Test',[{title:'Build',run:()=>Games.buildWord()}],null)],
   ['Jump: story',()=>openStorybook()],
   ['Mute music',()=>{S.settings.music=0; save(); AudioSys.applyVolumes(); renderParent();}]
  ].forEach(([label,fn])=>{const b=document.createElement('button'); b.textContent=label; b.onclick=fn; tg.appendChild(b);});
}
document.addEventListener('input',e=>{
  if(e.target.id==='set-voice'){S.settings.voice=e.target.value/100; save();}
  if(e.target.id==='set-music'){S.settings.music=e.target.value/100; save(); AudioSys.applyVolumes();}
  if(e.target.id==='set-sfx'){S.settings.sfx=e.target.value/100; save();}
});
document.addEventListener('change',e=>{
  if(e.target.id==='set-autoplay'){S.settings.autoplay=e.target.checked; save();}
  if(e.target.id==='set-motion'){S.settings.motion=e.target.checked; save();}
});
$('btn-reset').onclick=()=>{ if(confirm('Start the kingdom over?')) resetAll(); };

/* ---------------- INIT ---------------- */
function init(){
  try{ if('speechSynthesis' in window) speechSynthesis.getVoices(); }catch(e){}
  try{ if('speechSynthesis' in window) speechSynthesis.onvoiceschanged=()=>{}; }catch(e){}
  AudioSys.applyVolumes();
  refreshAll();
  if(S.stars>0 || S.firstSessionDone){
    $('btn-continue').classList.remove('hidden');
    $('welcome-back').classList.remove('hidden');
    $('welcome-back').textContent='';
    showScreen('splash');
  } else showScreen('splash');
  // unlock ballet/fairy as playable teasers (locked visual but tappable for fun after progress)
  const bal=$('land-ballet'), fai=$('land-fairy');
  if(S.wordsRead.length>=1){ bal.classList.remove('locked'); }
  if(S.wordsRead.length>=4){ fai.classList.remove('locked'); }
  document.addEventListener('pointerdown', function once(){
    AudioSys.ensure();
    document.removeEventListener('pointerdown', once);
  });
  // captions for testing: log instructions
  console.log('%cLayla\'s Magic Reading Kingdom ready 🌈','color:#a855f7;font-size:14px');
}
document.addEventListener('DOMContentLoaded', init);
