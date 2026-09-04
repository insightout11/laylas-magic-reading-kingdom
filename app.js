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
  stopSpeak(){ Speech.cancel('stopSpeak'); },
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

/* ============ LAYERED REAL-AUDIO SYSTEM (polish pass) ============
   LEVEL 1 — pre-generated audio: Twinkle voice clips (audio/voice/),
   phoneme recordings (audio/phonemes/ .mp3 neural / .wav DSP),
   whole-word audio (audio/words/).
   LEVEL 2 — improved browser TTS fallback for dynamic text ONLY.
   Phonemes NEVER fall back to synth or letter-name TTS in child mode;
   a missing asset plays a soft neutral cue and is flagged for parents. */
const VOICE_DIR = 'audio/voice/';
const WORD_DIR = 'audio/words/';
const PH_DIR = 'audio/phonemes/';
const PHONEME_WORD = {s:'sun',a:'apple',t:'tap',p:'pan',i:'igloo',n:'net',m:'moon',d:'dog',g:'gap',o:'otter',c:'cat',k:'kite',l:'lion'};
const AudioStat = { phoneme:{}, voice:{}, word:{} }; // 'ok' | 'missing'
AudioSys._lastSpeak = { text:'', t:0 };
AudioSys._scene = 'kingdom';

/* NOTE: all playback goes through Speech (single channel). There is no
   direct Audio() playback and no speechSynthesis.speak() outside Speech. */
AudioSys.probe = function(srcs){
  // Silent existence check (no playback) across fallback extensions.
  const list = (Array.isArray(srcs)?srcs:[srcs]).slice();
  return new Promise((resolve)=>{
    const next=()=>{
      if(!list.length){ resolve(false); return; }
      const src=list.shift();
      try{
        const el = new Audio();
        let done=false;
        el.oncanplaythrough=()=>{ if(!done){done=true; resolve(true);} };
        el.onerror=()=>{ if(!done){done=true; next();} };
        el.src=src; el.load();
        setTimeout(()=>{ if(!done){done=true; next();} }, 5000);
      }catch(e){ next(); }
    };
    next();
  });
};
AudioSys.warm = function(){
  // Preload the sounds the next minutes will need (call after user gesture).
  try{
    S.unlocked.concat(['l']).forEach(id=>{ const a=new Audio(); a.preload='auto'; a.src=PH_DIR+id+'.mp3'; a.load(); const b=new Audio(); b.preload='auto'; b.src=PH_DIR+id+'.wav'; b.load(); });
    ['you-did-it','oops','good-try','sound-it-out','blend-together','kitten-free'].forEach(k=>{ const a=new Audio(); a.preload='auto'; a.src=VOICE_DIR+k+'.mp3'; a.load(); });
  }catch(e){}
};
AudioSys.pickVoice = function(){
  try{
    const vs = speechSynthesis.getVoices();
    if(!vs.length) return null;
    const by = (re)=>vs.find(v=>re.test(v.name)) || vs.find(v=>v.lang && re.test(v.lang));
    return by(/google us english/i)
      || vs.find(v=>/natural|neural|online/i.test(v.name) && /^en/i.test(v.lang||''))
      || by(/samantha|zira|jenny|aria|sonia|natasha/i)
      || vs.find(v=>v.lang && v.lang.toLowerCase().startsWith('en'))
      || vs[0];
  }catch(e){ return null; }
};
AudioSys.speak = function(text, opts){
  opts = opts||{};
  if(!('speechSynthesis' in window)) return;
  if(!opts.force && S.settings.voice<=0) return;
  Speech.request(opts.prio||3, 'tts:'+String(text).slice(0,26), 'tts', (cancelled, done, trackEl)=>{
    Speech._ttsInto(text, opts, trackEl, cancelled, done);
  });
};
/* Twinkle character voice clip; falls back to improved TTS for the text. */
AudioSys.playVoice = function(key, fallbackText, opts){
  opts = opts||{};
  const prio = opts.prio || (opts.feedback ? 4 : 3);
  Speech.request(prio, 'voice:'+key, 'clip', (cancelled, done, track)=>{
    if(S.settings.voice<=0 && !opts.force){ done('muted'); return; }
    Speech.playFile(VOICE_DIR+key+'.mp3', null, track).then((ok)=>{
      AudioStat.voice[key] = ok?'ok':'missing';
      if(cancelled()){ done('cancelled'); return; }
      done(ok?'done':'missing');
      if(!ok){
        const miss = S.audioMissingVoice||(S.audioMissingVoice=[]);
        if(!miss.includes(key)){ miss.push(key); save(); }
        if(fallbackText && (S.settings.autoplay||opts.force)){
          setTimeout(()=>{ AudioSys.speak(fallbackText, opts); }, 80);
        }
      }
    });
  });
};
/* Phoneme playback: real asset ONLY (exact .mp3 filename). No synth, no letter names. */
AudioSys.playPhoneme = function(id){
  showMouthCue(id);
  Speech.request(1, 'phoneme:'+id, 'phoneme', (cancelled, done, track)=>{
    AudioSys.duck(true); AudioSys._ducked=true;
    Speech.playFile(PH_DIR+id+'.mp3', null, track).then((ok)=>{
      AudioStat.phoneme[id] = ok?'ok':'missing';
      if(!ok){
        AudioSys.sfx('boop', 0.35);
        const miss = S.audioMissing||(S.audioMissing=[]);
        if(!miss.includes(id)){ miss.push(id); save(); }
      }
      AudioSys.duck(false); AudioSys._ducked=false;
      done(ok?'done':'missing');
    });
  });
};
/* Whole-word audio after clean sequential phonemes (no letter names).
   Sequenced on ended-events (never fixed overlaps); holds the channel so
   nothing can talk over the blend. hooks: onPhoneme(i), onBlended(). */
AudioSys.playWordSlow = function(wordObj, hooks){
  hooks = hooks||{};
  Speech.request(2, 'blend:'+wordObj.t, 'word', (cancelled, done, trackEl)=>{
    AudioSys.duck(true); AudioSys._ducked=true;
    const finish=(why)=>{ AudioSys.duck(false); AudioSys._ducked=false; done(why); };
    (async ()=>{
      for(let i=0;i<wordObj.ph.length;i++){
        if(cancelled()){ finish('cancelled'); return; }
        try{ hooks.onPhoneme && hooks.onPhoneme(i, wordObj.ph[i]); }catch(e){}
        const ok = await Speech.playFile(PH_DIR+wordObj.ph[i]+'.mp3', null, trackEl);
        if(ok) AudioStat.phoneme[wordObj.ph[i]]='ok';
        else{
          AudioStat.phoneme[wordObj.ph[i]] = AudioStat.phoneme[wordObj.ph[i]]||'missing';
          const miss=S.audioMissing||(S.audioMissing=[]);
          if(!miss.includes(wordObj.ph[i])){ miss.push(wordObj.ph[i]); save(); }
        }
        await new Promise(r=>setTimeout(r,140));
      }
      if(cancelled()){ finish('cancelled'); return; }
      try{ hooks.onBlended && hooks.onBlended(); }catch(e){}
      await new Promise(r=>setTimeout(r,400));
      if(cancelled()){ finish('cancelled'); return; }
      const okW = await Speech.playFile(WORD_DIR+wordObj.t+'.mp3', null, trackEl);
      AudioStat.word[wordObj.t] = okW?'ok':'missing';
      finish('done');
      try{ hooks.onDone && hooks.onDone(!okW); }catch(e){}
      if(!okW) setTimeout(()=>AudioSys.speak(wordObj.t, {rate:0.7}), 80);
    })();
  });
};
AudioSys.playWord = function(word, slow){
  const track = WORDS.some(w=>w.t===word);
  Speech.request(2, 'word:'+word, 'word', (cancelled, done, trackEl)=>{
    AudioSys.duck(true); AudioSys._ducked=true;
    Speech.playFile(WORD_DIR+word+'.mp3', null, trackEl).then((ok)=>{
      if(track) AudioStat.word[word] = ok?'ok':'missing';
      AudioSys.duck(false); AudioSys._ducked=false;
      if(cancelled()){ done('cancelled'); return; }
      done('done');
      if(!ok) setTimeout(()=>AudioSys.speak(word, {rate: slow?0.7:0.92}), 80);
    });
  });
};
/* Specific phonics praise in ONE channel hold: character voice names the
   letter, then the clean isolated phoneme plays — never overlapping. */
AudioSys.praiseSound = function(id){
  Speech.request(4, 'praise:'+id, 'clip', (cancelled, done, trackEl)=>{
    Speech.playFile(VOICE_DIR+'yes-'+id+'.mp3', null, trackEl).then((ok)=>{
      AudioStat.voice['yes-'+id] = ok?'ok':'missing';
      if(cancelled()){ done('cancelled'); return; }
      if(!ok){
        done('missing');
        setTimeout(()=>AudioSys.speak('Yes! '+String(id).toUpperCase()+'!', {prio:4}), 80);
        setTimeout(()=>{ AudioSys.playPhoneme(id); }, 1400);
        return;
      }
      setTimeout(()=>{
        if(cancelled()){ done('cancelled'); return; }
        AudioSys.duck(true); AudioSys._ducked=true;
        Speech.playFile(PH_DIR+id+'.mp3', null, trackEl).then((ok2)=>{
          if(ok2) AudioStat.phoneme[id]='ok';
          AudioSys.duck(false); AudioSys._ducked=false;
          done('done');
        });
      }, 500);
    });
  });
};
/* Gentle scene music: different skies for different lands. */
const MUSIC_SCENES = {
  kingdom:{notes:[523,587,659,784,880,784,659,587,523,0,440,494,523,587,659,0], step:460},
  meadow:{notes:[659,784,880,1047,880,784,659,587,659,0,784,880,1047,1175,1047,0], step:420},
  castle:{notes:[523,523,587,659,659,587,523,494,440,440,494,523,523,0,0,0], step:520},
  cottage:{notes:[440,523,587,523,440,392,440,0,440,523,659,587,523,0,0,0], step:480},
  ballet:{notes:[659,0,784,0,880,0,784,0,659,0,587,0,523,0,0,0], step:430}
};
AudioSys.setScene = function(s){ AudioSys._scene = MUSIC_SCENES[s]?s:'kingdom'; };
AudioSys.startMusic = function(){
  if(AudioSys.musicOn) return; AudioSys.musicOn=true;
  AudioSys.ensure(); if(!AudioSys.ctx){return;}
  let i=0;
  const stepFn=()=>{
    if(!AudioSys.musicOn) return;
    try{
      const sc = MUSIC_SCENES[AudioSys._scene]||MUSIC_SCENES.kingdom;
      if(S.settings.music>0 && AudioSys.ctx){
        const n=sc.notes[i%sc.notes.length];
        if(n){
          const o=AudioSys.ctx.createOscillator(); o.type='sine'; o.frequency.value=n;
          const g=AudioSys.ctx.createGain();
          const t=AudioSys.ctx.currentTime;
          g.gain.setValueAtTime(0.001,t); g.gain.exponentialRampToValueAtTime(0.16,t+0.05); g.gain.exponentialRampToValueAtTime(0.001,t+0.7);
          o.connect(g); g.connect(AudioSys.musicGain); o.start(t); o.stop(t+0.75);
        }
      }
      i++;
      AudioSys.musicTimer=setTimeout(stepFn, (MUSIC_SCENES[AudioSys._scene]||MUSIC_SCENES.kingdom).step);
    }catch(e){ i++; AudioSys.musicTimer=setTimeout(stepFn, 460); }
  };
  stepFn();
};
/* Extra gentle SFX: boop (neutral), page, door, spin. */
(function(){
  const prev = AudioSys.sfx.bind(AudioSys);
  AudioSys.sfx = function(name, vol, delay){
    if(name!=='boop' && name!=='page' && name!=='door' && name!=='spin') return prev(name, vol, delay);
    try{
      if(S.settings.sfx<=0) return;
      const ctx=AudioSys.ensure(); if(!ctx) return;
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
      if(name==='boop') mk(320,0.18,'sine',0,210);
      else if(name==='page'){ mk(900,0.07,'triangle',0); mk(1350,0.1,'triangle',0.07); }
      else if(name==='door'){ mk(150,0.3,'sine',0,90); mk(420,0.25,'triangle',0.06,680); }
      else if(name==='spin'){ [660,880,1100,1320,1560].forEach((f,i)=>mk(f,0.14,'triangle',i*0.09)); }
    }catch(e){}
  };
})();
/* Say: instruction-bar speech that prefers the Twinkle voice clip. */
let currentClip = null;
function say(clip, text, speakText){
  currentInstruction = speakText||text;
  $('instruction-text').textContent = text;
  currentClip = clip||null;
  twinklePose(null);
  if(clip){ AudioSys.playVoice(clip, currentInstruction); }
  else if(S.settings.autoplay) AudioSys.speak(currentInstruction);
}

/* ============ SPEECH MANAGER — strict single audio channel ============
   Priority: 1 phoneme > 2 word/blend > 3 instruction > 4 feedback.
   - Exactly ONE of {voice clip, TTS, phoneme, word} ever sounds.
   - Higher priority preempts; equal replaces; lower queues (max 1).
   - Same-tag replays within 400ms are dropped (replay-button debounce).
   - Speech.cancel() on navigation clears channel + queue.
   - All events logged for the Test Mode audio debug panel. */
const Speech = {
  cur:null, queued:null, token:0,
  _lastTag:'', _lastTime:0, logBuf:[],
  log(ev, detail){ try{ this.logBuf.push({t:new Date().toLocaleTimeString('en-GB'), ev, detail:String(detail||'').slice(0,90)}); if(this.logBuf.length>24) this.logBuf.shift(); }catch(e){} },
  isSpeaking(){ return !!this.cur; },
  state(){
    try{ return { speaking:!!this.cur, kind:this.cur&&this.cur.kind, tag:this.cur&&this.cur.tag, queued:!!this.queued, music:!!AudioSys.musicOn, scene:AudioSys._scene, ducked:!!AudioSys._ducked }; }
    catch(e){ return { speaking:!!this.cur }; }
  },
  _stopCur(reason){
    const c=this.cur; this.cur=null; if(!c) return;
    try{
      if(c.kind==='tts'){ try{ speechSynthesis.cancel(); }catch(e){} }
      else if(c.el){ try{ c.el.onended=null; c.el.onerror=null; c.el.pause(); }catch(e){} }
    }catch(e){}
    talking(false);
    this.log('stop', (c.tag||c.kind)+' ← '+reason);
  },
  cancel(reason){ this.token++; this.queued=null; this._stopCur(reason||'cancel'); this.log('cancel', reason||''); },
  clear(){ this.queued=null; },
  request(prio, tag, kind, starter){
    const now=Date.now(), key=tag||kind;
    if((kind==='clip'||kind==='tts') && key===this._lastTag && now-this._lastTime<400){ this.log('debounced', key); return; }
    this._lastTag=key; this._lastTime=now;
    const job={prio, tag, kind, starter};
    if(!this.cur){ this._run(job); return; }
    if(prio<this.cur.prio){ this.log('preempt', this.cur.tag+' → '+tag); this._stopCur('preempt'); this._run(job); }
    else if(prio===this.cur.prio){ this._stopCur('replace'); this._run(job); }
    else { this.queued=job; this.log('queued', tag); }
  },
  _run(job){
    const my=++this.token;
    job.seq=(this._seq=(this._seq||0)+1);
    this.cur={prio:job.prio, tag:job.tag, kind:job.kind, el:null, seq:job.seq};
    talking(true);
    this.log('start', job.tag+' ['+job.kind+' p'+job.prio+']');
    let finished=false;
    const finish=(why)=>{
      if(finished) return; finished=true;
      // Only release the channel if WE still hold it (stale starters from
      // preempted jobs must never clear a newer job, even with equal tags).
      if(this.cur && this.cur.seq===job.seq){ this.cur=null; talking(false); }
      this.log('end', job.tag+(why?' ← '+why:''));
      const q=this.queued; this.queued=null;
      if(q && this.token===my) this._run(q);
    };
    try{ job.starter(()=>this.token!==my, finish, (el)=>{ if(this.cur&&this.cur.tag===job.tag) this.cur.el=el; }); }
    catch(e){ finish('error'); }
  },
  playFile(src, volume, track){
    // Resolves true when the file finished audibly, false if missing/blocked.
    return new Promise((resolve)=>{
      let done=false;
      const fin=(v)=>{ if(!done){done=true; resolve(v);} };
      try{
        const el=new Audio(); el.preload='auto';
        el.volume=Math.max(0,Math.min(1,volume==null?S.settings.voice:volume));
        el.onended=()=>fin(true); el.onerror=()=>fin(false);
        if(track) track(el);
        el.src=src; el.load();
        const pr=el.play(); if(pr&&pr.catch) pr.catch(()=>fin(false));
        setTimeout(()=>fin(false), 9000);
      }catch(e){ fin(false); }
    });
  },
  _ttsInto(text, opts, trackEl, cancelled, done){
    try{ speechSynthesis.cancel(); }catch(e){}
    try{
      const u=new SpeechSynthesisUtterance(text);
      const v=AudioSys.pickVoice(); if(v) u.voice=v;
      u.rate=opts.rate||0.92; u.pitch=opts.pitch||1.05;
      u.volume=Math.max(0,Math.min(1,S.settings.voice));
      u.lang=(v&&v.lang)||'en-US';
      u.onend=()=>done('done'); u.onerror=()=>done('error');
      speechSynthesis.speak(u);
    }catch(e){ done('error'); }
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
  if(typeof Speech!=='undefined') Speech.cancel('navigation:'+name);
  try{ if('speechSynthesis' in window) speechSynthesis.cancel(); }catch(e){}
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active','enter-zoom','enter-door','enter-page'));
  const el = $('screen-'+name);
  el.classList.add('active');
  const fx = name==='game'?'enter-zoom':name==='castle'?'enter-door':name==='story'?'enter-page':null;
  if(fx){ void el.offsetWidth; el.classList.add(fx); }
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
function hearInstruction(){
  if(currentClip){ AudioSys.playVoice(currentClip, currentInstruction); }
  else if(currentInstruction) AudioSys.speak(currentInstruction);
}
function twinkleSay(text, opts){
  opts = opts||{};
  $('twinkle-speech').textContent=text;
  $('twinkle-mini-text').textContent=text;
  twinklePose(opts.pose||null);
  if(opts.silent) return;
  if(opts.clip){ if(S.settings.autoplay||opts.force) AudioSys.playVoice(opts.clip, text, opts); else currentInstruction=text; }
  else if(S.settings.autoplay||opts.force) AudioSys.speak(text, opts);
  else currentInstruction=text;
}
function twinklePose(p){
  try{
    const m=$('twinkle-mini-cat');
    if(m && typeof twinkleSVG==='function') m.innerHTML=twinkleSVG('mini', p||'idle');
  }catch(e){}
}
/* Major-figure art: illustrated SVG where it exists, emoji only for tiny objects. */
function picFor(word, emoji){
  try{
    if(word==='cat'||emoji==='🐱') return kittenSVG();
    if((word==='sun'||emoji==='☀️') && typeof sunSVG==='function') return sunSVG();
    if((word==='moon'||emoji==='🌙') && typeof moonSVG==='function') return moonSVG();
  }catch(e){}
  return emoji;
}
function wordArt(w){ return picFor(w.t, w.emoji); }
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
  AudioSys.sfx('boop', 0.5);
  const clip = attemptsThisItem%2 ? 'oops' : 'good-try';
  const m = retrySpeech || (clip==='oops' ? 'Oops! Listen again.' : "Good try! Let's hear it one more time.");
  AudioSys.playVoice(clip, m);
  twinklePose('point');
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
  twinklePose('happy');
  if(skillId) record(skillId, firstTryFlag && attemptsThisItem===0);
  if(skillId && /^(sound|letter):/.test(skillId)){
    AudioSys.praiseSound(skillId.split(':')[1]);
  } else if(praise && S.settings.autoplay){
    // One feedback job: character voice celebrates, then the specific
    // teaching point follows on the same channel — never overlapping.
    Speech.request(4, 'praise-words', 'clip', (cancelled, done, trackEl)=>{
      Speech.playFile(VOICE_DIR+'you-did-it.mp3', null, trackEl).then(()=>{
        if(cancelled()){ done('cancelled'); return; }
        setTimeout(()=>{
          if(cancelled()){ done('cancelled'); return; }
          Speech._ttsInto(praise, {}, trackEl, cancelled, done);
        }, 900);
      });
    });
  } else if(praise && !S.settings.autoplay){
    currentInstruction = praise;
  }
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
  say('find-your-name', 'Can you find Layla?');
  $('game-area').dataset.scene='castle';
  twinkleSay('Can you find Layla? 💖', {silent:true});
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
  twinkleSay("Let's build YOUR name! L. A. Y. L. A.! 💖", {silent:true});
  AudioSys.playVoice('build-name', 'Drag the letters to spell Layla.');
  $('game-area').dataset.scene='castle';
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
          AudioSys.playVoice('name-spelled', 'Layla! You spelled your name! Amazing!');
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
  twinkleSay('A letter floated away! Which one is missing? 💜', {silent:true});
  AudioSys.playVoice('missing-letter', 'Which letter is missing?');
  $('game-area').dataset.scene='castle';
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
  $('game-area').dataset.scene='rainbow';
  const distract = shuffle(PHONEME_ORDER.filter(p=>p!==focus)).slice(0,2);
  const letters = shuffle([focus].concat(distract));
  if(mode==='sound'){
  say('find-sound', 'Which letter makes this sound?');
  $('game-area').dataset.scene='meadow';
    twinkleSay('Pop the bubble! Listen first! 🫧', {silent:true});
    setTimeout(()=>AudioSys.playPhoneme(focus), 2100);
    const replay=document.createElement('div'); replay.className='center';
    replay.innerHTML='<button class="magic-btn">🔊 Hear the sound again</button>';
    replay.querySelector('button').onclick=()=>AudioSys.playPhoneme(focus);
    area.appendChild(replay);
  } else {
    setInstruction('Find '+focus.toUpperCase()+'!', 'Find '+focus.toUpperCase()+'!');
    twinkleSay('Can you find '+focus.toUpperCase()+'? 🫧', {silent:true});
    AudioSys.speak('Find '+focus.toUpperCase()+'!');
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
  say('find-sound', 'Which letter makes this sound?');
  twinkleSay('The unicorn lost her sound crystal! Listen! 🦄💎', {silent:true});
  const uni=document.createElement('div'); uni.className='center unicorn-holder';
  uni.innerHTML = (typeof unicornSVG==='function') ? unicornSVG() : '<div style="font-size:90px">🦄</div>';
  area.appendChild(uni);
  const hear=document.createElement('div'); hear.className='center';
  hear.innerHTML='<button class="big-magic-btn">🔊 Hear the magic sound</button>';
  hear.querySelector('button').onclick=()=>AudioSys.playPhoneme(focus);
  area.appendChild(hear);
  setTimeout(()=>AudioSys.playPhoneme(focus), 2200);
  const row=document.createElement('div'); row.className='choices';
  const opts=shuffle([focus].concat(shuffle(PHONEME_ORDER.filter(p=>p!==focus)).slice(0,2)));
  const colors=['linear-gradient(180deg,#67e8f9,#3b82f6)','linear-gradient(180deg,#f0abfc,#8b5cf6)','linear-gradient(180deg,#fda4af,#ec4899)'];
  opts.forEach((L,i)=>{
    const b=document.createElement('button'); b.className='crystal'; b.style.background=colors[i%3]; b.textContent=L.toUpperCase();
    if(L===focus) b.dataset.correct='1';
    b.onclick=()=>{
      if(L===focus){
        b.style.transform='translateY(-30px) scale(1.2)'; AudioSys.sfx('magic');
        uni.classList.add('happy');
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
  say('first-sound', 'Which picture starts with this sound?');
  $('game-area').dataset.scene='mirror';
  twinkleSay('Look in the magic mirror! 🪞', {silent:true});
  setTimeout(()=>AudioSys.playPhoneme(sound), 2100);
  const hear=document.createElement('div'); hear.className='center';
  hear.innerHTML='<button class="magic-btn">🔊 Hear '+PHONEMES[sound].cue+'</button>';
  hear.querySelector('button').onclick=()=>AudioSys.playPhoneme(sound);
  area.appendChild(hear);
  const row=document.createElement('div'); row.className='choices mirror-frame';
  shuffle(set.options).forEach(o=>{
    const b=document.createElement('button'); b.className='choice-card pic-card';
    b.innerHTML='<span class="pic-emoji">'+picFor(o.w, o.e)+'</span><span class="pic-word">'+o.w+'</span>';
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
  twinkleSay('Each pair brings back a rainbow color! 🌈', {silent:true});
  AudioSys.playVoice('match-letters', 'Match the big letter with its little letter friend!');
  $('game-area').dataset.scene='rainbow';
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
      AudioSys.speak('Big '+L.toUpperCase()+'.');
    };
    top.appendChild(b);
  });
  shuffle(letters).forEach(L=>{
    const b=document.createElement('button'); b.className='choice-card'; b.dataset.low=L;
    b.innerHTML='<span class="big-letter">'+L.toLowerCase()+'</span>';
    b.onclick=()=>{
      if(!selected){ AudioSys.playVoice('big-first', 'First tap a BIG letter!'); return; }
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
  say('sound-it-out', "Let's sound it out!");
  $('game-area').dataset.scene='cottage';
  twinkleSay('A kitten needs us! Sound it out with me! 🐱', {silent:true});
  const wrap=document.createElement('div'); wrap.className='center rescue-scene';
  wrap.innerHTML=((typeof kittenSVG==='function') ? kittenSVG() : '🐱')
    + ((typeof cottageDoorSVG==='function') ? cottageDoorSVG() : '<div style="font-size:44px">🚪</div>');
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
    AudioSys.playVoice('blend-together', "Now let's blend them together!");
    setTimeout(()=>{
      AudioSys.playWordSlow(w, {
        onPhoneme:(i)=>{
          const el=stage.children[i];
          if(el){ el.style.transform='scale(1.25)'; el.style.borderColor='#fbbf24'; setTimeout(()=>{el.style.transform='scale(1)';},500); }
        },
        onBlended:()=>showBlendChoices()
      });
    }, 1500);
  };
  function showBlendChoices(){
    const letters=[...stage.children];
    letters.forEach(el=>el.classList.add('together'));
    stage.style.gap='2px';
    const bw=document.createElement('div'); bw.className='blend-word'; bw.innerHTML=w.t+'! '+wordArt(w);
    blendLabel.innerHTML=''; blendLabel.appendChild(bw);
      // picture choice to confirm
      const ch=document.createElement('div'); ch.className='choices';
      const right=w;
      const others=shuffle(WORDS.filter(x=>x.t!==w.t)).slice(0,2);
      shuffle([right].concat(others)).forEach(o=>{
        const b=document.createElement('button'); b.className='choice-card pic-card';
        b.innerHTML='<span class="pic-emoji">'+wordArt(o)+'</span><span class="pic-word">'+o.t+'</span>';
        if(o.t===w.t) b.dataset.correct='1';
        b.onclick=()=>{
          if(o.t===w.t){
            b.classList.add('correct');
            wrap.innerHTML=((typeof kittenSVG==='function') ? kittenSVG() : '🐱')+'<div>Kitty is free! 💖</div>';
            AudioSys.sfx('meow'); setTimeout(()=>AudioSys.sfx('fanfare'),400);
            AudioSys.playVoice('kitten-free', 'You put the sounds together: '+w.t+'!');
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
  };
  // auto-play once for 4yo
  setTimeout(()=>{ if(document.body.contains(btnRow)) btnRow.querySelector('button').click(); }, 1200);
};
function maybeWordMilestone(word){
  if(S.wordsCelebrated.includes(word)) return;
  S.wordsCelebrated.push(word); save();
  const dec=decodableWords();
  if(S.wordsRead.length===1 || word==='sat' || word==='cat'){
    setTimeout(()=>showMilestone('You read a word!', word, 'You sounded it out all by yourself! I am SO proud!', {clip:'you-read-a-word'}), 2600);
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
  $('game-area').dataset.scene='cottage';
  twinkleSay(w.emoji+' shows '+w.t+'! Can you build it? 🧱', {silent:true});
  AudioSys.playWord(w.t);
  const pic=document.createElement('div'); pic.className='center word-pic'; pic.innerHTML=wordArt(w);
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
          record('spell:'+w.t, firstTryFlag&&attemptsThisItem===0);
          if(!S.wordsRead.includes(w.t)) S.wordsRead.push(w.t);
          addStars(4); save(); sparkles(20); checkMilestones();
          AudioSys.playWordSlow(w, { onDone:()=>{
            AudioSys.speak('You built '+w.t+'!');
            maybeWordMilestone(w.t);
            setTimeout(activityDone, 2600);
          }});
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
  $('game-area').dataset.scene='castle';
  twinkleSay('Answer to win a princess treasure! 👗', {silent:true});
  AudioSys.playWord(w.t);
  const row=document.createElement('div'); row.className='choices';
  shuffle([w].concat(shuffle(WORDS.filter(x=>x.t!==w.t)).slice(0,2))).forEach(o=>{
    const b=document.createElement('button'); b.className='choice-card';
    b.innerHTML='<span style="font-family:Andika;font-size:44px;color:#5b2a6e">'+o.t+'</span><span class="pic-emoji" style="font-size:40px">'+wordArt(o)+'</span>';
    if(o.t===w.t) b.dataset.correct='1';
    b.onclick=()=>{
      AudioSys.playWord(o.t);
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
  const p=document.createElement('div'); p.className='center dressup-princess';
  p.innerHTML=(typeof princessSVG==='function')?princessSVG(S.equipped):'👸';
  area.appendChild(p);
};

/* 11. Ballet sound steps */
Games.ballet = function(){
  const area=$('game-area'); area.innerHTML='';
  const steps = shuffle(S.unlocked.filter(x=>PHONEMES[x]).slice(0,3));
  while(steps.length<3) steps.push(PHONEME_ORDER[steps.length%PHONEME_ORDER.length]);
  setInstruction('Tap the sound you hear!', 'Tap the stage tile that makes the sound you hear!');
  twinkleSay('The ballerina needs your ears! 🩰', {silent:true});
  $('game-area').dataset.scene='stage';
  const dancer=document.createElement('div'); dancer.className='ballerina';
  dancer.innerHTML=(typeof ballerinaSVG==='function')?ballerinaSVG():'🩰';
  area.appendChild(dancer);
  let idx=0, target=steps[0];
  const floor=document.createElement('div'); floor.className='ballet-floor';
  steps.forEach(s=>{
    const b=document.createElement('button'); b.className='ballet-tile'; b.textContent=s.toUpperCase(); b.dataset.s=s;
    b.onclick=()=>{
      if(s===target){
        b.style.background='linear-gradient(180deg,#fef3c7,#fcd34d)'; AudioSys.sfx('success');
        dancer.classList.remove('twirl'); void dancer.offsetWidth; dancer.classList.add('twirl');
        dancer.style.transform='rotate('+(idx*20)+'deg)';
        AudioSys.playVoice('beautiful', 'Beautiful step!');
        record('ballet:'+s, firstTryFlag&&attemptsThisItem===0);
        idx++;
        if(idx>=steps.length){
          dancer.classList.add('finale'); confettiBlast();
          AudioSys.playVoice('bravo', 'Bravo! Beautiful dancing!');
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
  twinkleSay('Which one rhymes? 🌸', {silent:true});
  AudioSys.playVoice('rhyme-ask', 'Which one rhymes with '+set.base+'?');
  $('game-area').dataset.scene='garden';
  const garden=document.createElement('div'); garden.className='center garden-bed';
  garden.innerHTML=(typeof sproutSVG==='function')?sproutSVG():'🌱';
  area.appendChild(garden);
  const row=document.createElement('div'); row.className='choices';
  shuffle(set.rhymes.concat(set.others)).forEach(w=>{
    const b=document.createElement('button'); b.className='choice-card pic-card';
    b.innerHTML='<span class="pic-emoji">'+(set.be[w]||'⭐')+'</span><span class="pic-word">'+w+'</span>';
    if(set.rhymes.includes(w)) b.dataset.correct='1';
    b.onclick=()=>{
      AudioSys.playWord(w);
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
  twinkleSay('Slow and sparkly! ✨', {silent:true});
  AudioSys.playVoice('trace-ask', 'Trace the sparkly letter '+L+'!');
  $('game-area').dataset.scene='sky';
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
  twinkleSay('Just for fun! 🎨', {silent:true});
  AudioSys.playVoice('paint-fun', 'Paint whatever you love!');
  $('game-area').dataset.scene='garden';
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
  $('story-prev').onclick=()=>{page=(page+pages.length-1)%pages.length; render(); AudioSys.sfx('page');};
  $('story-next').onclick=()=>{page=(page+1)%pages.length; render(); AudioSys.sfx('page');};
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
      showMilestone('LAYLA READ A SENTENCE!', P.s.join(' '), 'You read a whole sentence! This is REAL reading! 🌟', {clip:'sentence-win'});
      grantReward('crown-gold');
    } else {
      AudioSys.speak('You read it! Amazing reading!');
      toast('Amazing reading! 🌟');
    }
  };
  render();
  AudioSys.playVoice('story-help', 'Read it yourself! Tap a word if you need help.');
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
  $('reward-chest').innerHTML=(typeof chestSVG==='function')?chestSVG(false):'🎁';
  $('reward-chest').classList.remove('open');
  $('btn-reward-open').classList.remove('hidden');
  $('btn-reward-castle').classList.add('hidden');
  $('reward-modal').classList.remove('hidden');
  AudioSys.sfx('chest');
  twinkleSay('You earned something! Open it! 🎁', {silent:true});
  AudioSys.playVoice('look-unlocked', 'Look what you unlocked!');
  twinklePose('happy');
  $('btn-reward-open').onclick=()=>{
    if(typeof chestSVG==='function'){ $('reward-chest').innerHTML=chestSVG(true); }
    else $('reward-chest').textContent='✨';
    $('reward-chest').classList.add('open');
    AudioSys.sfx('fanfare'); confettiBlast(); sparkles(24);
    AudioSys.speak('You earned '+r.name+'! Beautiful!');
    // auto-equip wearable
    const slot = r.cat==='dress'?'dress':r.cat==='crown'?'crown':r.cat==='shoes'?'shoes':r.cat==='pet'?'pet':r.cat==='wallpaper'?'wallpaper':r.cat==='furniture'?'furniture':r.cat==='window'?'window':r.cat==='decor'?'decor':r.cat;
    if(slot && S.equipped.hasOwnProperty(slot)){ S.equipped[slot]=r.id; save(); }
    $('btn-reward-open').classList.add('hidden');
    const b=$('btn-reward-castle'); b.classList.remove('hidden');
    AudioSys.playVoice('try-it-on', "Let's try it on!");
    b.onclick=()=>{ $('reward-modal').classList.add('hidden'); openCastle(); };
  };
}
function awardSticker(id, silent){
  if(S.stickers.includes(id)) return;
  S.stickers.push(id); save(); refreshStickers();
  if(!silent){ toast('New sticker! ⭐'); AudioSys.sfx('sparkle'); }
}
function showMilestone(title, word, text, opts){
  opts = opts||{};
  $('milestone-title').textContent=title;
  $('milestone-word').textContent=word;
  $('milestone-text').textContent=text;
  $('milestone-modal').classList.remove('hidden');
  twinklePose('happy');
  confettiBlast(); sparkles(30,true); AudioSys.sfx('fanfare');
  if(opts.clip){
    AudioSys.playVoice(opts.clip, title).then(()=>setTimeout(()=>AudioSys.playWord(word), 1200));
  } else {
    AudioSys.speak(title+' '+word+'! '+text);
  }
  addStars(5);
}
$('btn-milestone-ok').onclick=()=>$('milestone-modal').classList.add('hidden');

const CLOSET_TABS=[['dress','👗 Dresses'],['crown','👑 Crowns'],['shoes','👠 Shoes'],['wings','🪽 Wings'],['necklace','⭐ Charms'],['pet','🐱 Pets'],['wallpaper','🌸 Room'],['furniture','🛏️ Furniture'],['window','🌈 Window'],['decor','💐 Decor']];
let closetTab='dress';
function setClosetTab(t){ closetTab=t; renderClosetTabs(); renderCloset(); AudioSys.sfx('flip'); }
function openCastle(){
  showScreen('castle');
  AudioSys.setScene('castle');
  AudioSys.sfx('door');
  if(typeof mountCastleRoom==='function') mountCastleRoom();
  renderClosetTabs(); renderCloset(); renderRoom();
  AudioSys.playVoice('castle-hello', 'Welcome to your castle, Layla!');
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
    let icon = owned?r.emoji:'🔒';
    try{
      if(owned && typeof dressSwatch==='function'){
        if(r.cat==='dress') icon=dressSwatch(r.id);
        else if(r.cat==='crown') icon=crownSwatch(r.id);
        else if(r.cat==='shoes') icon=shoeSwatch(r.id);
        else if(r.cat==='wings') icon=wingSwatch();
        else if(r.cat==='necklace') icon=necklaceSwatch();
      }
    }catch(e){}
    d.innerHTML='<span>'+icon+'</span><span class="cname">'+r.name+'</span>'+(S.equipped[closetTab]===r.id?'<span class="equip-badge">💖</span>':'');
    d.onclick=()=>{
      if(!owned){ AudioSys.speak('Keep playing adventures to unlock this!'); toast('Play adventures to unlock! 🔒'); return; }
      S.equipped[closetTab]=r.id; save(); renderCloset(); renderRoom();
      const pm=$('princess-mount');
      if(pm && (closetTab==='dress'||closetTab==='crown'||closetTab==='shoes'||closetTab==='wings')){
        pm.classList.remove('spinning'); void pm.offsetWidth; pm.classList.add('spinning');
        setTimeout(()=>pm.classList.remove('spinning'), 900);
      }
      AudioSys.sfx('sparkle'); sparkles(10);
      if(closetTab==='dress') AudioSys.sfx('spin', 0.7, 0.2);
      AudioSys.playVoice('beautiful', r.name+'! Beautiful choice!');
    };
    g.appendChild(d);
  });
  if(!g.children.length) g.innerHTML='<p>No treasures here yet. Play adventures! 🌟</p>';
}
function renderRoom(){
  const eq=S.equipped;
  const mount=$('princess-mount');
  if(mount && typeof princessSVG==='function') mount.innerHTML = princessSVG(eq);
  const room=$('castle-room');
  if(room){
    const wall = room.querySelector('.room-wall-fill');
    if(wall) wall.setAttribute('fill', eq.wallpaper==='wall-star' ? '#3b2a63' : '#f9cfe3');
    const stars = room.querySelector('.room-stars');
    if(stars) stars.setAttribute('opacity', eq.wallpaper==='wall-star' ? '1' : '.55');
    const ch = room.querySelector('.room-chandelier');
    if(ch) ch.style.display = eq.furniture==='lamp-chandelier' ? '' : 'none';
    const pet = room.querySelector('.room-pet-emoji');
    if(pet){
      const p = REWARDS.find(r=>r.id===eq.pet);
      pet.textContent = p?p.emoji:'🐱';
    }
    const win = room.querySelector('.room-window text');
    if(win){
      const w = REWARDS.find(r=>r.id===eq.window);
      win.textContent = w ? w.emoji : '🌈';
    }
    const dec = room.querySelector('.room-decor');
    if(dec){
      dec.innerHTML='';
      const owned = REWARDS.filter(r=>r.cat==='decor'&&S.rewards.includes(r.id)).slice(0,3);
      const spots=[[330,300],[370,320],[290,320]];
      owned.forEach((d,i)=>{
        const t=document.createElementNS ? document.createElementNS('http://www.w3.org/2000/svg','text') : document.createElement('span');
        if(t.setAttribute){ t.setAttribute('x',spots[i][0]); t.setAttribute('y',spots[i][1]); t.setAttribute('font-size','34'); t.textContent=d.emoji; dec.appendChild(t); }
      });
    }
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
let speakKingdom = false;
function refreshKingdom(speak){
  speakKingdom = !!speak;
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
  const clip = { 'land-castle':'go-castle', 'land-rainbow':'rainbow-help', 'land-unicorn':'unicorn-help', 'land-kitten':'kitten-stuck' }[rec] || null;
  if(kingdomFirstPaint){ $('twinkle-speech').textContent=msg; $('twinkle-mini-text').textContent=msg; kingdomFirstPaint=false; }
  else if(speakKingdom){ twinkleSay(msg, {clip, silent:!clip}); }
  else { $('twinkle-speech').textContent=msg; $('twinkle-mini-text').textContent=msg; }
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
  twinkleSay("Hi Layla! I found something magical! That's YOUR name!", {silent:true});
  AudioSys.playVoice('hi-layla', 'Hi Layla!').then(()=>{
    setTimeout(()=>AudioSys.speak("I found something magical! That's YOUR name! Layla!"), 700);
  });
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
  AudioSys.playVoice('another-adventure', 'You helped the rainbow AND learned a new sound! Want another adventure?');
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
    AudioSys.ensure(); AudioSys.startMusic(); AudioSys.warm();
    const land=l.dataset.land;
    AudioSys.setScene({rainbow:'kingdom', unicorn:'meadow', kitten:'cottage', castle:'castle', ballet:'ballet', story:'castle', fairy:'meadow'}[land]||'kingdom');
    if(l.classList.contains('locked')){
      if(land==='story' && (S.sentenceUnlocked||S.wordsRead.length>=3)){ openStorybook(); return; }
      AudioSys.playVoice('land-sleeping', 'This land is still sleeping. Keep reading to wake it up!');
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
function goKingdom(){ AudioSys.stopSpeak(); AudioSys.setScene('kingdom'); showScreen('kingdom'); refreshKingdom(true); }
$('btn-kingdom').onclick=goKingdom;
document.querySelectorAll('.back-to-kingdom').forEach(b=>b.onclick=goKingdom);
$('nav-home').onclick=goKingdom;
$('nav-castle').onclick=openCastle; $('nav-castle-top').onclick=openCastle;
$('nav-stickers').onclick=()=>{showScreen('stickers'); refreshStickers(); AudioSys.playVoice('sticker-hello', 'Your sticker book! You earned so many!');};
$('nav-stickers-top').onclick=()=>{showScreen('stickers'); refreshStickers();};
$('btn-hear').onclick=hearInstruction; $('btn-hear2').onclick=hearInstruction;
$('btn-replay-twinkle').onclick=()=>{ const t=$('twinkle-speech').textContent; if(t) AudioSys.speak(t); };
document.querySelectorAll('.castle-hear').forEach(b=>b.onclick=()=>AudioSys.speak('Welcome to your castle, Layla! Tap something to try it on!'));
document.querySelectorAll('.sticker-hear').forEach(b=>b.onclick=()=>AudioSys.speak('Your sticker book!'));
document.querySelectorAll('.story-hear').forEach(b=>b.onclick=()=>AudioSys.speak(currentInstruction));
$('btn-start-magic').onclick=()=>{
  AudioSys.ensure(); AudioSys.startMusic(); AudioSys.setScene('kingdom'); AudioSys.warm();
  if(!S.firstSessionDone){ firstSession(); }
  else { showScreen('kingdom'); refreshKingdom(true); }
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
const VOICE_KEYS = ['hi-layla','welcome-back','found-name','find-your-name','build-name','missing-letter','listen-carefully','hear-again','find-sound','first-sound','match-letters','sound-it-out','blend-together','you-did-it','you-read-a-word','sentence-win','look-unlocked','unicorn-help','go-castle','try-it-on','beautiful','bravo','oops','good-try','another-adventure','kitten-free','new-sound','rhyme-ask','trace-ask','paint-fun','story-help','castle-hello','sticker-hello','land-sleeping','big-first','name-spelled','rainbow-help','kitten-stuck','yes-s','yes-a','yes-t','yes-p','yes-i','yes-n','yes-m','yes-d','yes-g','yes-o','yes-c','yes-k'];
const WORD_KEYS = ['sun','apple','tap','pan','igloo','net','moon','dog','gap','otter','cat','kite','sat','mat','pat','tip','sip','man','tin','pin','Sam','can','cap','mop','pot','am','at','it','in','on','sit','map'];
AudioSys._inspectCache={};
AudioSys.inspect = function(src){
  // Decode the real file: reports true duration + peak level for QA.
  if(AudioSys._inspectCache[src]) return Promise.resolve(AudioSys._inspectCache[src]);
  return new Promise((resolve)=>{
    const done=(v)=>{ AudioSys._inspectCache[src]=v; resolve(v); };
    try{
      fetch(src).then(r=>{ if(!r.ok) throw 0; return r.arrayBuffer(); })
      .then(ab=>{
        const AC = window.AudioContext||window.webkitAudioContext;
        if(!AC) throw 0;
        try{ AudioSys._inspectCtx = AudioSys._inspectCtx || new AC(); }
        catch(e){ throw 0; }
        return AudioSys._inspectCtx.decodeAudioData(ab);
      }).then(buf=>{
        const d=buf.getChannelData(0); let peak=0;
        for(let i=0;i<d.length;i+=7){ const a=Math.abs(d[i]); if(a>peak) peak=a; }
        done({ok:true, dur:buf.duration, peak});
      }).catch(()=>done({ok:false}));
    }catch(e){ done({ok:false}); }
  });
};
function renderAudioQA(){
  const box=$('audio-qa'); if(!box) return;
  renderAudioDebug();
  const ids = PHONEME_ORDER.concat(['l']);
  box.innerHTML='';
  const sum=$('audio-qa-summary');
  sum.textContent='Checking phonemes…';
  let done=0;
  ids.forEach(id=>{
    const row=document.createElement('div'); row.className='qa-row';
    const ex = PHONEME_WORD[id]||'';
    const em = PHONEMES[id]?PHONEMES[id].emoji:'💜';
    const lab=document.createElement('b'); lab.textContent=id.toUpperCase()+' '+em;
    const b1=document.createElement('button'); b1.textContent='▶ sound'; b1.onclick=()=>AudioSys.playPhoneme(id);
    const st=document.createElement('span'); st.className='qa-st'; st.textContent='…';
    row.appendChild(lab); row.appendChild(b1);
    if(ex && id!=='l'){
      const b2=document.createElement('button'); b2.textContent='▶ '+ex;
      b2.onclick=()=>AudioSys.playWord(ex);
      row.appendChild(b2);
    }
    row.appendChild(st);
    box.appendChild(row);
    AudioSys.probe([PH_DIR+id+'.mp3']).then((ok)=>{
      AudioStat.phoneme[id]=ok?'ok':'missing';
      if(!ok){ st.textContent='MISSING ✗'; st.style.color='#dc2626'; }
      else{
        st.textContent='found…'; st.style.color='#92400e';
        AudioSys.inspect(PH_DIR+id+'.mp3').then((info)=>{
          if(!info.ok){ st.textContent='unverified'; st.style.color='#92400e'; }
          else{
            const ready = info.dur>0.05 && info.dur<3.0 && info.peak>0.05;
            st.textContent=(ready?'READY ✓ ':'DO NOT USE ✗ ')+info.dur.toFixed(2)+'s · '+Math.round(info.peak*100)+'%';
            st.style.color= ready?'#16a34a':'#dc2626';
            if(!ready){ const miss=S.audioMissing||(S.audioMissing=[]); if(!miss.includes(id)){miss.push(id); save();} }
          }
        });
      }
      done++;
      if(done>=ids.length){
        const miss = ids.filter(x=>AudioStat.phoneme[x]==='missing');
        S.audioMissing = miss; save();
        sum.innerHTML = 'Phonemes: <b>'+(ids.length-miss.length)+'/'+ids.length+' real audio '+(miss.length?'':'✓')+'</b>'
          + (miss.length? ' — missing: <b style="color:#dc2626">'+miss.join(', ').toUpperCase()+'</b>':'')
          + '<br><span id="qa-vw">Checking voice & words…</span>';
        const vps = VOICE_KEYS.map(k=>AudioSys.probe(VOICE_DIR+k+'.mp3').then(ok=>{AudioStat.voice[k]=ok?'ok':'missing'; return ok; }));
        const wps = WORD_KEYS.map(k=>AudioSys.probe(WORD_DIR+k+'.mp3').then(ok=>{AudioStat.word[k]=ok?'ok':'missing'; return ok; }));
        Promise.all(vps.concat(wps)).then((rs)=>{
          const vok = rs.slice(0,vps.length).filter(Boolean).length;
          const wok = rs.slice(vps.length).filter(Boolean).length;
          const el=$('qa-vw');
          if(el) el.innerHTML = 'Voice clips: <b>'+vok+'/'+VOICE_KEYS.length+'</b> · Words: <b>'+wok+'/'+WORD_KEYS.length+'</b>'
            + ((vok===VOICE_KEYS.length&&wok===WORD_KEYS.length)?' ✓':' <b style="color:#dc2626">— check files</b>');
          renderParentWarning();
          renderAudioDebug();
        });
      }
    });
  });
}
function renderAudioDebug(){
  const box=$('audio-debug'); if(!box || typeof Speech==='undefined') return;
  const s=Speech.state();
  let h='SPEECH: '+(s.speaking?(s.kind+' :: '+s.tag):'idle');
  h+='\nQUEUE: '+(s.queued?'1 waiting':'empty');
  h+='\nMUSIC: '+(s.music?('on · '+s.scene):'off')+' · DUCKED: '+(s.ducked?'yes':'no');
  h+='\n--- last events ---';
  Speech.logBuf.slice(-12).forEach(e=>{ h+='\n'+e.t+'  '+e.ev+'  '+e.detail; });
  box.textContent=h;
}
function renderParentWarning(){
  const p=$('parent-progress'); if(!p) return;
  let w=$('audio-warn');
  const miss=(S.audioMissing||[]).concat(Object.keys(AudioStat.voice).filter(k=>AudioStat.voice[k]==='missing')).concat(Object.keys(AudioStat.word).filter(k=>AudioStat.word[k]==='missing'));
  if(!miss.length){ if(w) w.remove(); return; }
  if(!w){ w=document.createElement('div'); w.id='audio-warn'; w.className='audio-warn'; p.prepend(w); }
  w.innerHTML='⚠️ Missing audio: <b>'+miss.slice(0,8).join(', ')+(miss.length>8?'…':'')+'</b> — Layla will hear a soft neutral sound there. Re-run “Check all sounds”.';
}
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
  renderParentWarning();
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
   ['Trigger blending 🎉',()=>{S.blendingUnlocked=true; save(); showMilestone('You read a word!','sat','You put the sounds together: s-a-t... sat!', {clip:'you-read-a-word'});}],
   ['Trigger sentence 📚',()=>{S.sentenceUnlocked=true; save(); showMilestone('LAYLA READ A SENTENCE!','Sam sat.','You read a whole sentence!', {clip:'sentence-win'});}],
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
$('btn-audio-qa').onclick=()=>{ renderAudioQA(); toast('Checking every sound… 🔊'); };

/* ---------------- INIT ---------------- */
function init(){
  try{ if('speechSynthesis' in window) speechSynthesis.getVoices(); }catch(e){}
  try{ if('speechSynthesis' in window) speechSynthesis.onvoiceschanged=()=>{}; }catch(e){}
  try{ if(typeof initWorld==='function') initWorld(); }catch(e){}
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
