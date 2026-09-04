/* ============================================================
   LAYLA'S MAGIC READING KINGDOM — app.js
   Vanilla JS, no build step. Tablet-first.
   Systems: layered Audio (voice clips + human phonemes + TTS fallback),
   Progression, Mastery, 14 games, Castle, Stickers, Storybook, Parents.
   Phonemes are real human recordings (see audio/phonemes/manifest.json).
   There is deliberately NO synthetic phoneme fallback in child mode.
   ============================================================ */
'use strict';

/* ---------------- DATA ---------------- */
/* The phoneme/grapheme model lives in phonics.js (loaded before this file)
   so the app and the build-time importer share ONE definition.
   PHONEME_ORDER holds phonemeIds, not letters: 'k' is one sound spelled
   c / k / ck, and 'th_unvoiced' and 'th_voiced' are two sounds both
   spelled th. Never assume one letter == one sound anywhere below. */
const PHONEME_ORDER = Phonics.ordered().map(function(p){ return p.id; });

/* Letters in Layla's name. RECOGNITION ONLY: the name games never mark a
   phoneme as known and never unlock decoding. Name familiarity and phoneme
   mastery are deliberately separate concepts. */
const FAMILIAR_LETTERS = NAME_LETTERS;

/* Display helpers: the letter(s) Layla actually sees for a sound. Use these
   instead of id.toUpperCase() — a phonemeId like 'a_short' is internal. */
function G(id){ return Phonics.primaryGrapheme(id); }
function GU(id){ return String(G(id)).toUpperCase(); }

/* Runtime view of the catalog, keyed by phonemeId. */
const PHONEMES = Phonics.catalog.reduce(function(m,p){
  m[p.id] = {
    id:p.id, g:p.graphemes[0], graphemes:p.graphemes, ipa:p.ipa,
    cue:p.cue, stretch:p.cue, word:p.word, emoji:p.emoji,
    target:p.target, type:p.type, phase:p.phase, order:p.order,
    kind:'decode'
  };
  return m;
}, {});

/* Words carry BOTH layers. ph[] is the sequence of SOUNDS to play; gr[] is
   the sequence of LETTERS Layla sees. They are parallel arrays, so 'cat' is
   three sounds (k, a_short, t) spelled c-a-t, and 'moon' is m-oo-n. This is
   what lets one sound have several spellings without the games misrepresenting
   either layer. Every word here has a recorded whole-word file in audio/words/. */
const WORDS = [
  {t:'sat',  ph:['s','a_short','t'], gr:['s','a','t'],  emoji:'🪑', art:'sat'},
  {t:'mat',  ph:['m','a_short','t'], gr:['m','a','t'],  emoji:'🧶', art:'mat'},
  {t:'cat',  ph:['k','a_short','t'], gr:['c','a','t'],  emoji:'🐱', art:'cat'},
  {t:'pat',  ph:['p','a_short','t'], gr:['p','a','t'],  emoji:'👋', art:'pat'},
  {t:'tap',  ph:['t','a_short','p'], gr:['t','a','p'],  emoji:'🚰', art:'tap'},
  {t:'map',  ph:['m','a_short','p'], gr:['m','a','p'],  emoji:'🗺️', art:'map'},
  {t:'man',  ph:['m','a_short','n'], gr:['m','a','n'],  emoji:'🤴', art:'man'},
  {t:'pan',  ph:['p','a_short','n'], gr:['p','a','n'],  emoji:'🍳', art:'pan'},
  {t:'gap',  ph:['g','a_short','p'], gr:['g','a','p'],  emoji:'🕳️', art:'gap'},
  {t:'sit',  ph:['s','i_short','t'], gr:['s','i','t'],  emoji:'🪑', art:'sit'},
  {t:'sip',  ph:['s','i_short','p'], gr:['s','i','p'],  emoji:'🥤', art:'sip'},
  {t:'tip',  ph:['t','i_short','p'], gr:['t','i','p'],  emoji:'👆', art:'tip'},
  {t:'tin',  ph:['t','i_short','n'], gr:['t','i','n'],  emoji:'🥫', art:'tin'},
  {t:'pin',  ph:['p','i_short','n'], gr:['p','i','n'],  emoji:'📌', art:'pin'},
  {t:'Sam',  ph:['s','a_short','m'], gr:['S','a','m'],  emoji:'👦', art:'sam', proper:true},
  {t:'cap',  ph:['k','a_short','p'], gr:['c','a','p'],  emoji:'🧢', art:'cap'},
  {t:'can',  ph:['k','a_short','n'], gr:['c','a','n'],  emoji:'🥫', art:'can'},
  {t:'dog',  ph:['d','o_short','g'], gr:['d','o','g'],  emoji:'🐶', art:'dog'},
  {t:'mop',  ph:['m','o_short','p'], gr:['m','o','p'],  emoji:'🧹', art:'mop'},
  {t:'pot',  ph:['p','o_short','t'], gr:['p','o','t'],  emoji:'🍲', art:'pot'},
  {t:'sun',  ph:['s','u_short','n'], gr:['s','u','n'],  emoji:'☀️', art:'sun'},
  {t:'net',  ph:['n','e_short','t'], gr:['n','e','t'],  emoji:'🥅', art:'net'},
  {t:'moon', ph:['m','oo_long','n'], gr:['m','oo','n'], emoji:'🌙', art:'moon'},
  {t:'am',   ph:['a_short','m'],     gr:['a','m'],      emoji:'💖', art:'am'},
  {t:'at',   ph:['a_short','t'],     gr:['a','t'],      emoji:'📍', art:'at'},
  {t:'it',   ph:['i_short','t'],     gr:['i','t'],      emoji:'✨', art:'it'},
  {t:'in',   ph:['i_short','n'],     gr:['i','n'],      emoji:'📥', art:'in'},
  {t:'on',   ph:['o_short','n'],     gr:['o','n'],      emoji:'🔛', art:'on'}
];

const FIRST_SOUND_SETS = [
  {sound:'s', options:[{w:'sun',e:'☀️'},{w:'cat',e:'🐱'},{w:'moon',e:'🌙'}], answer:'sun'},
  {sound:'m', options:[{w:'moon',e:'🌙'},{w:'sun',e:'☀️'},{w:'tap',e:'🚰'}], answer:'moon'},
  {sound:'k', options:[{w:'cat',e:'🐱'},{w:'sun',e:'☀️'},{w:'pin',e:'📌'}], answer:'cat'},
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

/* needs[] lists phonemeIds. A page is only offered when every sound in it is
   human-approved, so a story never asks Layla to decode an unapproved sound. */
const STORY_PAGES = [
  {s:['Sam','sat.'], art:'👦', needs:['s','a_short','m','t']},
  {s:['Sam','sat','on','a','mat.'], art:'🧶', needs:['s','a_short','m','t','o_short','n']},
  {s:['A','cat','sat.'], art:'🐱', needs:['s','a_short','m','t','o_short','n','k']},
  {s:['A','cat','sat','on','a','mat.'], art:'🧶', needs:['s','a_short','m','t','o_short','n','k']}
];

/* ---------------- STATE ---------------- */
const SAVE_KEY = 'layla-kingdom-v1';
function defaultState(){
  return {
    v:2, stars:0, rainbowColors:0,
    firstSessionDone:false, firstSessionStep:0,
    unlocked:['s','a_short','t'],
    /* phonemeApproval[phonemeId] = {st, custom, played, hash}
       hash is the sha256 of the audio file the human actually listened to.
       If the file's bytes change, that one approval lapses — see
       reconcileApprovals(). There is no global "wipe everything" reset. */
    phonemeApproval:{},
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
    const st = Object.assign(base, d, {settings:Object.assign(base.settings, d.settings||{}), equipped:Object.assign(base.equipped, d.equipped||{})});
    return migrateState(st);
  }catch(e){ return defaultState(); }
}
/* v1 saves keyed phonemes by bare letter ('a','i','o','c'). v2 keys them by
   phonemeId ('a_short','i_short','o_short','k'). Remap everything that stored
   a phoneme id; drop anything that no longer resolves. Approvals are remapped
   too, but reconcileApprovals() then re-checks each one against the audio
   file's hash, so a remapped approval only survives if the bytes match. */
function migrateState(st){
  if(st.v >= 2 && !st.approvalBatch) return st;
  const mapId = function(id){ return Phonics.resolve(id); };
  const mapList = function(list){
    const out=[];
    (list||[]).forEach(function(id){ const r=mapId(id); if(r && out.indexOf(r)<0) out.push(r); });
    return out;
  };
  st.unlocked = mapList(st.unlocked);
  if(!st.unlocked.length) st.unlocked = ['s','a_short','t'];
  st.currentFocus = mapId(st.currentFocus) || st.unlocked[0];

  const ap = {};
  Object.keys(st.phonemeApproval||{}).forEach(function(k){
    const r = mapId(k);
    if(r && !ap[r]) ap[r] = st.phonemeApproval[k];
  });
  st.phonemeApproval = ap;

  /* mastery keys look like 'sound:a' / 'letter:c' — remap the id half. */
  const mast = {};
  Object.keys(st.mastery||{}).forEach(function(k){
    const bits = k.split(':');
    if(bits.length===2 && (bits[0]==='sound' || bits[0]==='letter')){
      const r = mapId(bits[1]);
      if(!r) return;
      mast[bits[0]+':'+r] = st.mastery[k];
    } else mast[k] = st.mastery[k];
  });
  st.mastery = mast;

  delete st.approvalBatch;
  st.audioMissing = [];
  st.v = 2;
  return st;
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
  const pool = usablePhonemes(S.unlocked.filter(id=>PHONEMES[id] && PHONEMES[id].kind==='decode'));
  if(!pool.length) return null;
  let worst = pool[0], worstScore = 99;
  pool.forEach(id=>{
    const sc = (S.mastery['sound:'+id]||{score:0.5}).score;
    if(sc < worstScore){ worstScore = sc; worst = id; }
  });
  return worst;
}
function maybeUnlockNext(){
  // unlock next phoneme when current focus is strong (skip unusable ones)
  const idx = PHONEME_ORDER.indexOf(S.currentFocus);
  const m = S.mastery['sound:'+S.currentFocus];
  if(m && m.score > 0.75 && idx >= 0){
    for(let j=idx+1;j<PHONEME_ORDER.length;j++){
      const next = PHONEME_ORDER[j];
      if(!S.unlocked.includes(next) && isPhonemeUsable(next)){
        S.unlocked.push(next);
        S.currentFocus = next;
        save();
        return next;
      }
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
  return WORDS.filter(w => w.ph.every(p=>set.has(p)&&isPhonemeUsable(p)));
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
/* Phoneme asset manifest (built from validated human recordings).
   valid=false (or MISSING) phonemes are NEVER modeled in child mode. */
let PHONEME_MANIFEST = null;
/* ---- HUMAN APPROVAL GATE ----------------------------------------------
   UNREVIEWED | APPROVED | REJECTED | MISSING (persisted per phonemeId).
   NOTHING enters child phonics without a parent listening and approving.
   No code path anywhere marks a sound APPROVED on its own — not the
   importer, not signal analysis, not a "looks fine" heuristic.

   Approval is bound to the audio file's sha256. Re-importing a sound
   changes its bytes, which lapses that one approval back to UNREVIEWED.
   Files whose bytes are unchanged — notably the six approved starter
   recordings — keep their approval across imports. */
const STARTER_PHONEMES = Phonics.inPhase('starter').map(function(p){ return p.id; });
function approvalOf(id){
  id = Phonics.resolve(id) || id;
  if(!S.phonemeApproval) S.phonemeApproval={};
  if(!S.phonemeApproval[id]) S.phonemeApproval[id]={st:'UNREVIEWED', custom:false, played:false, hash:null};
  return S.phonemeApproval[id];
}
function manifestOf(id){
  id = Phonics.resolve(id);
  if(!id || !PHONEME_MANIFEST || !PHONEME_MANIFEST.sounds) return null;
  return PHONEME_MANIFEST.sounds[id] || null;
}
/* The single gate every game must respect. */
function isPhonemeUsable(id){
  id = Phonics.resolve(id);
  if(!id) return false;
  const man = manifestOf(id);
  if(man && man.approvalStatus === 'MISSING') return false;   // no file on disk
  return approvalOf(id).st === 'APPROVED';
}
function usablePhonemes(list){
  return (list||PHONEME_ORDER).map(function(id){ return Phonics.resolve(id); })
    .filter(function(id, i, arr){ return id && arr.indexOf(id)===i && isPhonemeUsable(id); });
}
/* Wrong-answer choices. Spec: gameplay uses ONLY approved sounds, so a
   distractor is drawn from the approved pool too — never from an
   unreviewed one. If there are not enough approved sounds yet, the round
   simply offers fewer choices rather than smuggling one in. */
function distractors(focus, n){
  const pool = shuffle(usablePhonemes(PHONEME_ORDER).filter(function(p){ return p!==focus; }));
  return pool.slice(0, Math.max(0, n||2));
}
function approvalCounts(){
  const c = {APPROVED:0, UNREVIEWED:0, REJECTED:0, MISSING:0};
  PHONEME_ORDER.forEach(function(id){
    const man = manifestOf(id);
    if(man && man.approvalStatus==='MISSING'){ c.MISSING++; return; }
    const st = approvalOf(id).st;
    c[st] = (c[st]||0) + 1;
  });
  return c;
}
/* Re-check every stored approval against the manifest's file hashes.
   - hash matches            -> approval stands
   - hash differs            -> lapses to UNREVIEWED (the bytes changed)
   - approval predates hashes -> adopted ONLY for the locked starter six,
     which the importer provably never rewrites. Everything else from the
     old scheme must be listened to again, because those files used to come
     from a different (rejected) source. */
function reconcileApprovals(){
  if(!PHONEME_MANIFEST || !PHONEME_MANIFEST.sounds) return;
  let lapsed = [], dirty = false;
  Object.keys(S.phonemeApproval||{}).forEach(function(id){
    const a = S.phonemeApproval[id];
    if(!a || a.st!=='APPROVED') return;
    if(a.custom) return;                       // parent's own recording
    const man = PHONEME_MANIFEST.sounds[id];
    if(!man || !man.sha256){ return; }
    if(!a.hash){
      if(man.locked){ a.hash = man.sha256; dirty = true; }   // grandfathered
      else { a.st='UNREVIEWED'; a.played=false; lapsed.push(id); dirty = true; }
      return;
    }
    if(a.hash !== man.sha256){
      a.st='UNREVIEWED'; a.played=false; a.hash=null; lapsed.push(id); dirty = true;
    }
  });
  if(dirty) save();
  if(lapsed.length) try{ Speech.log('audio', 'approval lapsed: '+lapsed.join(',')); }catch(e){}
  return lapsed;
}
function loadPhonemeManifest(){
  try{
    return fetch(PH_DIR+'manifest.json').then(r=>{ if(!r.ok) throw 0; return r.json(); })
    .then(m=>{
      PHONEME_MANIFEST = m;
      try{
        reconcileApprovals();
        const missing = Object.keys(m.sounds||{}).filter(k=>m.sounds[k].approvalStatus==='MISSING');
        if(missing.length){
          const miss=S.audioMissing||(S.audioMissing=[]);
          missing.forEach(b=>{ if(!miss.includes(b)) miss.push(b); });
          save();
        }
        /* Keep the focus on something Layla is actually allowed to hear. */
        if(!isPhonemeUsable(S.currentFocus)){
          const u=usablePhonemes(S.unlocked);
          if(u.length) { S.currentFocus=u[0]; save(); }
        }
        /* The manifest arrives after the first paint; refresh the review
           screen so provenance and hashes are shown rather than "no entry". */
        const scr=$('screen-parent');
        if(scr && scr.classList.contains('active')) renderAudioQA();
      }catch(e){}
      return m;
    }).catch(()=>null);
  }catch(e){ return Promise.resolve(null); }
}
/* Parent-supplied recordings (IndexedDB). A new recording resets approval
   to UNREVIEWED — it must be listened to and approved again. */
const PhonemeDB = {
  _db:null,
  open(){ return new Promise((res,rej)=>{ if(this._db) return res(this._db);
    try{ const rq=indexedDB.open('layla-kingdom',2);
      rq.onupgradeneeded=()=>{ try{rq.result.createObjectStore('phonemes');}catch(e){} try{rq.result.createObjectStore('art');}catch(e){} };
      rq.onsuccess=()=>{ this._db=rq.result; res(rq.result); };
      rq.onerror=()=>rej(rq.error||'db');
    }catch(e){ rej(e); } }); },
  put(id, blob){ return this.open().then(db=>new Promise((res,rej)=>{ try{
      const tx=db.transaction('phonemes','readwrite');
      tx.objectStore('phonemes').put(blob,'custom:'+id);
      tx.oncomplete=()=>res(true); tx.onerror=()=>rej(tx.error);
    }catch(e){ rej(e); } })); },
  get(id){ return this.open().then(db=>new Promise((res)=>{ try{
      const tx=db.transaction('phonemes','readonly');
      const rq=tx.objectStore('phonemes').get('custom:'+id);
      rq.onsuccess=()=>res(rq.result||null); rq.onerror=()=>res(null);
    }catch(e){ res(null); } })).catch(()=>null); }
};
/* A phonemeId is NOT a filename: 'a_short' lives in a.mp3 (the untouched
   starter asset) and 'oo_long' in oo_long.mp3. Always resolve through the
   catalog rather than concatenating the id. */
function phonemeFile(id){
  const e = Phonics.byId[Phonics.resolve(id)];
  return e ? PH_DIR + e.file : null;
}
AudioSys.resolvePhoneme = function(id){
  // Effective asset: parent recording wins; else the bundled human recording.
  const pid = Phonics.resolve(id);
  if(!pid) return Promise.resolve(null);
  return PhonemeDB.get(pid).then(blob=>{
    if(blob){ try{ return URL.createObjectURL(blob); }catch(e){} }
    return phonemeFile(pid);
  });
};
const PHONEME_WORD = Phonics.catalog.reduce(function(m,p){ m[p.id]=p.word; return m; }, {});
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
    S.unlocked.concat(['l']).forEach(id=>{ try{ const a=new Audio(); a.preload='auto'; a.src=phonemeFile(id); a.load(); }catch(e){} });
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
          after(80, ()=> { AudioSys.speak(fallbackText, opts); });
        }
      }
    });
  });
};
/* Phoneme playback: real human asset ONLY (exact .mp3 filename).
   Invalid/missing assets are NEVER modeled: soft cue + parent flag. */
AudioSys.playPhoneme = function(id, opts){
  opts=opts||{};
  showMouthCue(id);
  if(!opts.audit && !isPhonemeUsable(id)){
    AudioSys.sfx('boop', 0.35);
    const miss=S.audioMissing||(S.audioMissing=[]);
    if(!miss.includes(id)){ miss.push(id); save(); }
    return;
  }
  Speech.request(1, 'phoneme:'+id, 'phoneme', (cancelled, done, track)=>{
    AudioSys.duck(true); AudioSys._ducked=true;
    AudioSys.resolvePhoneme(id).then((src)=>{
      if(cancelled()||!src){ AudioSys.duck(false); AudioSys._ducked=false; done('cancelled'); return; }
      Speech.playFile(src, null, track).then((ok)=>{
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
        const src = await AudioSys.resolvePhoneme(wordObj.ph[i]);
        const ok = src ? await Speech.playFile(src, null, trackEl) : false;
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
      if(!okW) after(80, ()=> AudioSys.speak(wordObj.t, {rate:0.7}));
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
      if(!ok) after(80, ()=> AudioSys.speak(word, {rate: slow?0.7:0.92}));
    });
  });
};
/* Specific phonics praise in ONE channel hold: character voice names the
   letter, then the clean isolated phoneme plays — never overlapping. */
AudioSys.praiseSound = function(id){
  if(!isPhonemeUsable(id)){
    // Never model an invalid phoneme: generic celebration only.
    Speech.request(4, 'praise:'+id, 'clip', (cancelled, done, trackEl)=>{
      Speech.playFile(VOICE_DIR+'you-did-it.mp3', null, trackEl).then(()=>{ if(!cancelled()) done('done'); else done('cancelled'); });
    });
    return;
  }
  Speech.request(4, 'praise:'+id, 'clip', (cancelled, done, trackEl)=>{
    Speech.playFile(VOICE_DIR+'yes-'+G(id)+'.mp3', null, trackEl).then((ok)=>{
      AudioStat.voice['yes-'+G(id)] = ok?'ok':'missing';
      if(cancelled()){ done('cancelled'); return; }
      if(!ok){
        /* No recorded "Yes, B!" clip for this sound yet. Do NOT let TTS say
           the letter NAME — in a phonics activity that teaches exactly the
           wrong thing. Use the generic recorded praise, then the real
           human phoneme. Letter names never come from a speech synth. */
        Speech.playFile(VOICE_DIR+'you-did-it.mp3', null, trackEl).then(()=>{
          if(cancelled()){ done('cancelled'); return; }
          done('done');
          after(320, ()=> { AudioSys.playPhoneme(id); });
        });
        return;
      }
      setTimeout(()=>{
        if(cancelled()){ done('cancelled'); return; }
        AudioSys.duck(true); AudioSys._ducked=true;
        AudioSys.resolvePhoneme(id).then((src)=>{
          if(!src){ AudioSys.duck(false); AudioSys._ducked=false; done('missing'); return; }
          Speech.playFile(src, null, trackEl).then((ok2)=>{
          if(ok2) AudioStat.phoneme[id]='ok';
          AudioSys.duck(false); AudioSys._ducked=false;
          done('done');
          });
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
    this._lastStopAt = Date.now();
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
    // Isolation gap: phonemes/words never start on the tail of a stopped
    // sound (covers async pause() + speechSynthesis.cancel() races).
    const gap = (job.kind==='phoneme'||job.kind==='word') ? 160 : 120;
    const sinceStop = Date.now()-(this._lastStopAt||0);
    const wait = Math.max(0, gap-sinceStop);
    const begin=()=>{
      if(this.token!==my) return;
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
    try{ job.starter(()=>this.token!==my, finish, (el)=>{ if(this.cur&&this.cur.seq===job.seq) this.cur.el=el; }); }
    catch(e){ finish('error'); }
    };
    if(wait>0) setTimeout(begin, wait); else begin();
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
    // Chrome/Android race: cancel() then speak() instantly can double-talk.
    // Always cancel first, then wait a beat before speaking.
    try{ speechSynthesis.cancel(); }catch(e){}
    setTimeout(()=>{
      if(cancelled()){ done('cancelled'); return; }
      try{
        const u=new SpeechSynthesisUtterance(text);
      const v=AudioSys.pickVoice(); if(v) u.voice=v;
      u.rate=opts.rate||0.92; u.pitch=opts.pitch||1.05;
      u.volume=Math.max(0,Math.min(1,S.settings.voice));
      u.lang=(v&&v.lang)||'en-US';
      u.onend=()=>done('done'); u.onerror=()=>done('error');
      speechSynthesis.speak(u);
      }catch(e){ done('error'); }
    }, 120);
  }
};
let twinkleMood=null;
function talking(on){
  const a=document.getElementById('twinkle-avatar');
  if(a) a.classList.toggle('talking', !!on);
  try{
    if(on){ if(!twinkleMood) twinklePose('talking'); }
    else { twinkleMood=null; twinklePose(null); }
  }catch(e){}
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
    d.innerHTML='<span class="mouth-face">'+mouth+'</span><span class="mouth-letter">'+GU(id)+'</span>';
    area.appendChild(d);
    setTimeout(()=>{ if(d.parentNode) d.remove(); }, 2200);
  }catch(e){}
}

/* ---------------- UI HELPERS ---------------- */
const $ = id => document.getElementById(id);
/* Scene epoch: every navigation or activity advance bumps a generation.
   after() runs delayed audio/advance callbacks ONLY if their scene is still
   current - killing the classic stale-timer double-talk (e.g. an auto-play
   phoneme firing after the child already left the screen). */
let SceneEpoch = 0, ActivityGen = 0;
function after(ms, fn){
  const e=SceneEpoch, g=ActivityGen;
  setTimeout(()=>{ if(e===SceneEpoch && g===ActivityGen){ try{fn();}catch(err){} } }, ms);
}
function enterLog(name){ try{ Speech.log('scene', name+' e'+SceneEpoch+' g'+ActivityGen); }catch(e){} }
function showScreen(name){
  /* Full-bleed scenes are opt-in per activity; never leak into the next one. */
  try{
    const gs=document.getElementById('screen-game');
    if(gs) gs.classList.remove('screen-full');
    const ga=document.getElementById('game-area');
    if(ga) ga.classList.remove('scene-full');
  }catch(e){}
  SceneEpoch++;
  enterLog('enter:'+name);
  if(typeof Speech!=='undefined') Speech.cancel('navigation:'+name);
  try{ if('speechSynthesis' in window) speechSynthesis.cancel(); }catch(e){}
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active','enter-zoom','enter-door','enter-page'));
  const el = $('screen-'+name);
  el.classList.add('active');
  if(name==='kingdom' && typeof window!=='undefined' && window.__posMarks){
    requestAnimationFrame(()=>{ try{window.__posMarks();}catch(e){} });
    setTimeout(()=>{ try{ if($('screen-kingdom').classList.contains('active')) window.__posMarks(); }catch(e){} }, 350);
  }
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
  twinkleMood=p||null;
  try{
    const m=$('twinkle-mini-cat');
    if(m) m.innerHTML = (typeof twinkleHTML==='function') ? twinkleHTML('mini', p||'idle') : twinkleSVG('mini', p||'idle');
  }catch(e){}
}
/* Major-figure art: one coherent SVG icon set; unknown words get a uniform badge. */
function iconByName(name){
  try{
    if(name==='sun' && typeof sunSVG==='function') return sunSVG();
    if(name==='moon' && typeof moonSVG==='function') return moonSVG();
    if(name==='cat' && typeof kittenSVG==='function') return kittenSVG();
    if(name==='lion' && typeof lionSVG==='function') return lionSVG();
    if(name==='tap' && typeof tapSVG==='function') return tapSVG();
    if(name==='pan' && typeof panSVG==='function') return panSVG();
    if(name==='apple' && typeof appleSVG==='function') return appleSVG();
    if(name==='tin' && typeof tinSVG==='function') return tinSVG();
    if(name==='net' && typeof netSVG==='function') return netSVG();
    if(name==='hat' && typeof hatSVG==='function') return hatSVG();
    if(name==='frog' && typeof frogSVG==='function') return frogSVG();
    if(name==='dog' && typeof dogSVG==='function') return dogSVG();
  }catch(e){}
  return null;
}
function picFor(word, emoji){
  try{
    if(word==='cat'||emoji==='🐱') return kittenSVG();
    const g = iconByName(word);
    if(g) return g;
  }catch(e){}
  return '<span class="word-badge">'+emoji+'</span>';
}
function wordArt(w){ return picFor(w.t, w.emoji); }
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t;} return a; }
function addStars(n){ S.stars+=n; save(); const el=$('star-count'); if(el) el.textContent=S.stars; }

/* Grown-up gate card: shown INSTEAD of any phonics gameplay when no
   human-approved sounds exist yet. Name play always stays available. */
function needGrownup(area){
  area.innerHTML='';
  setInstruction('The sounds are sleeping.', 'The sounds are sleeping. Ask a grown-up to wake them.');
  const wrap=document.createElement('div'); wrap.className='center';
  wrap.innerHTML='<div style="font-size:80px">😴</div>'
    +'<p style="font-weight:800;font-size:20px;max-width:420px">Shh… the magic sounds are sleeping.<br>Ask a grown-up to wake them up! 💤</p>'
    +'<button class="big-magic-btn" id="btn-wake">Grown-up, tap here 💜</button>';
  area.appendChild(wrap);
  twinkleSay('Shh… the sounds are sleeping! 💤', {silent:true});
  wrap.querySelector('#btn-wake').onclick=()=>openGate();
  const nb=document.createElement('button'); nb.className='magic-btn secondary'; nb.textContent='💖 Play with my name instead';
  nb.onclick=()=>Games.findName();
  wrap.appendChild(nb);
  return true;
}
let sessionQueue=[], sessionIdx=0, sessionName='', sessionReward=null, attemptsThisItem=0, firstTryFlag=true;
function runSession(name, activities, reward){
  ActivityGen++; enterLog('session:'+name);
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
  ActivityGen++;
  if(sessionIdx>=sessionQueue.length){ endSession(); return; }
  renderDots();
  attemptsThisItem=0; firstTryFlag=true;
  const act=sessionQueue[sessionIdx];
  $('game-title-pill').textContent=act.title||sessionName;
  /* Full-bleed is opt-in per activity — reset before each one runs. */
  try{
    $('screen-game').classList.remove('screen-full');
    $('game-area').classList.remove('scene-full');
  }catch(e){}
  act.run(act.params||{});
}
function activityDone(){
  sessionIdx++;
  after(900, nextActivity);
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
    setTimeout(()=>{ twinkleSay('New magic sound! '+GU(unlocked)+'! '+PHONEMES[unlocked].emoji); }, 1400);
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
        after(2200, activityDone);
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
          after(2400, activityDone);
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
  const focus = usablePhonemes([params.focus||S.currentFocus])[0] || null;
  const area=$('game-area'); area.innerHTML='';
  if(!focus) return needGrownup(area);
  const mode = params.mode || (Math.random()<0.5?'name':'sound');
  $('game-area').dataset.scene='rainbow';
  const distract = distractors(focus, 2);
  const letters = shuffle([focus].concat(distract));
  if(mode==='sound'){
  say('find-sound', 'Which letter makes this sound?');
  $('game-area').dataset.scene='meadow';
    twinkleSay('Pop the bubble! Listen first! 🫧', {silent:true});
    after(2100, ()=> AudioSys.playPhoneme(focus));
    const replay=document.createElement('div'); replay.className='center';
    replay.innerHTML='<button class="magic-btn">🔊 Hear the sound again</button>';
    replay.querySelector('button').onclick=()=>AudioSys.playPhoneme(focus);
    area.appendChild(replay);
  } else {
    setInstruction('Find '+GU(focus)+'!', 'Find '+GU(focus)+'!');
    twinkleSay('Can you find '+GU(focus)+'? 🫧', {silent:true});
    AudioSys.speak('Find '+GU(focus)+'!');
  }
  const row=document.createElement('div'); row.className='choices';
  letters.forEach(L=>{
    const b=document.createElement('button'); b.className='bubble'; b.textContent=GU(L);
    if(L===focus) b.dataset.correct='1';
    b.style.animationDelay=(Math.random()*1.5)+'s';
    b.onclick=()=>{
      AudioSys.ensure();
      if(L===focus){
        b.classList.add('pop'); AudioSys.sfx('pop');
        after(350, ()=>{
          celebrateRight('letter:'+focus, mode==='sound' ? 'Yes! '+GU(focus)+' makes '+PHONEMES[focus].cue+'!' : 'Yes! That is '+GU(focus)+'!');
          addStars(2);
          const rb=document.createElement('div'); rb.className='rainbow-bar';
          const cols=['#ef4444','#f97316','#facc15','#22c55e','#3b82f6','#8b5cf6','#ec4899'];
          for(let i=0;i<7;i++){const s=document.createElement('div'); s.className='rainbow-seg'; if(i<=S.rainbowColors) s.style.background=cols[i]; rb.appendChild(s);}
          area.appendChild(rb);
          if(S.rainbowColors<6){ S.rainbowColors++; save(); }
          sparkles(18);
        });
      } else gentleNo(b);
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};

/* 5. Unicorn Sound Crystals — the flagship phonics activity.
   Full-bleed felt meadow: no centred white card, no dashboard chrome.
   The unicorn, Twinkle, the flowers and the crystals all live in one
   scene, and the instruction lives in the scene rather than above it. */
Games.crystals = function(params){
  params=params||{};
  const focus=usablePhonemes([params.focus||S.currentFocus])[0] || null;
  const area=$('game-area'); area.innerHTML='';
  if(!focus) return needGrownup(area);
  area.dataset.scene='meadow';
  area.classList.add('scene-full');
  /* Let the scene own the whole screen: no instruction bar, no card. */
  const gs=$('screen-game'); if(gs) gs.classList.add('screen-full');
  say('find-sound', 'Which letter makes this sound?');

  const scene=document.createElement('div'); scene.className='meadow';
  scene.innerHTML = feltMeadowBg();
  area.appendChild(scene);
  try{ if(typeof Art!=='undefined') Art.bg(area, 'bg-meadow'); }catch(e){}

  /* --- cast --- */
  const uni=document.createElement('div'); uni.className='meadow-unicorn unicorn-holder';
  uni.innerHTML = (typeof unicornHTML==='function') ? unicornHTML('idle') : '';
  scene.appendChild(uni);

  const tw=document.createElement('div'); tw.className='meadow-twinkle';
  tw.innerHTML = (typeof twinkleHTML==='function') ? twinkleHTML('meadow','pointing') : '';
  scene.appendChild(tw);

  /* --- the one instruction, as an object in the world --- */
  const orb=document.createElement('button');
  orb.className='hear-orb'; orb.setAttribute('aria-label','Hear the magic sound');
  orb.innerHTML='<span class="orb-ring"></span><span class="orb-note">🔊</span>';
  orb.onclick=()=>{ AudioSys.playPhoneme(focus); orb.classList.remove('ping'); void orb.offsetWidth; orb.classList.add('ping'); };
  scene.appendChild(orb);
  after(1900, ()=>{ if(document.body.contains(orb)){ orb.classList.add('ping'); AudioSys.playPhoneme(focus); } });

  /* --- three sticker gems --- */
  const row=document.createElement('div'); row.className='crystal-row';
  const opts=shuffle([focus].concat(distractors(focus, 2)));
  const gemFills=[[FELT.sky,FELT.skyD],[FELT.lilac,FELT.lilacD],[FELT.pink,FELT.pinkD]];
  opts.forEach((L,i)=>{
    const b=document.createElement('button'); b.className='gem';
    b.style.setProperty('--gd', (i*0.12)+'s');
    b.innerHTML=feltGem(gemFills[i%3][0], gemFills[i%3][1]) + '<span class="gem-letter">'+GU(L)+'</span>';
    if(L===focus) b.dataset.correct='1';
    b.onclick=()=>{
      if(L!==focus){ gentleNo(b); return; }
      row.querySelectorAll('.gem').forEach(g=>{ if(g!==b) g.classList.add('gem-dim'); });
      crystalSuccess(b, uni, tw, focus, L);
    };
    row.appendChild(b);
  });
  scene.appendChild(row);
};

/* The success beat, in the order the spec asks for:
   squash -> pop up -> fly to the unicorn -> horn lights -> unicorn bounces
   -> happy pose -> mane/tail wobble -> sticker stars burst -> Twinkle reacts.
   Everything is easing + overshoot on transforms; no skeletal rig. */
function crystalSuccess(gem, uni, tw, focus, letter){
  AudioSys.sfx('magic');
  gem.classList.add('gem-squash');                                  /* 1 */

  after(140, ()=>{
    gem.classList.remove('gem-squash');
    gem.classList.add('gem-pop');                                   /* 2 */
  });

  after(300, ()=>{                                                  /* 3 */
    try{
      const g=gem.getBoundingClientRect(), u=uni.getBoundingClientRect();
      const fly=document.createElement('div');
      fly.className='gem-fly';
      fly.innerHTML=gem.innerHTML;
      fly.style.left=(g.left+g.width/2)+'px';
      fly.style.top=(g.top+g.height/2)+'px';
      document.body.appendChild(fly);
      gem.classList.add('gem-gone');
      requestAnimationFrame(()=>{ requestAnimationFrame(()=>{
        /* aim at the horn: top-centre of the unicorn box */
        fly.style.left=(u.left+u.width/2)+'px';
        fly.style.top=(u.top+u.height*0.10)+'px';
        fly.style.transform='translate(-50%,-50%) scale(.35) rotate(24deg)';
        fly.style.opacity='0';
      }); });
      setTimeout(()=>{ try{fly.remove();}catch(e){} }, 820);
    }catch(e){}
  });

  after(940, ()=>{                                                  /* 4,5,6,7 */
    uni.classList.add('horn-lit','uni-bounce');
    try{ if(typeof unicornHTML==='function') uni.innerHTML=unicornHTML('happy'); }catch(e){}
    uni.classList.add('mane-wobble');
    AudioSys.sfx('sparkle');
  });

  after(1080, ()=> stickerBurst(uni));                              /* 8 */

  after(1200, ()=>{                                                 /* 9 */
    try{ if(typeof twinkleHTML==='function') tw.innerHTML=twinkleHTML('meadow','happy'); }catch(e){}
    tw.classList.add('tw-cheer');
  });

  celebrateRight('sound:'+focus, 'Yes! '+GU(letter)+' makes '+PHONEMES[focus].cue+'! The unicorn is so happy!');
  addStars(3);
  after(2900, activityDone);
}

/* A burst of felt stars pinned to an element's centre. Pure transform +
   opacity so it stays cheap on a tablet. */
function stickerBurst(anchor, count){
  if(!S.settings.motion) return;
  let host=$('sparkle-layer'); if(!host) return;
  let cx=window.innerWidth/2, cy=window.innerHeight/2;
  try{ const r=anchor.getBoundingClientRect(); cx=r.left+r.width/2; cy=r.top+r.height*0.4; }catch(e){}
  const cols=[FELT.butter, FELT.pink, FELT.mint, FELT.lilac, FELT.white];
  const n=count||14;
  for(let i=0;i<n;i++){
    const a=(Math.PI*2/n)*i + Math.random()*0.4;
    const dist=90+Math.random()*90;
    const s=document.createElement('div');
    s.className='burst-star';
    s.style.left=cx+'px'; s.style.top=cy+'px';
    s.style.setProperty('--dx',(Math.cos(a)*dist).toFixed(0)+'px');
    s.style.setProperty('--dy',(Math.sin(a)*dist).toFixed(0)+'px');
    s.style.setProperty('--rot',((Math.random()*180-90)|0)+'deg');
    s.style.setProperty('--dly',(i*0.018).toFixed(3)+'s');
    s.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true">'+feltStar(20,20,17,cols[i%cols.length])+'</svg>';
    host.appendChild(s);
    setTimeout(()=>{ try{s.remove();}catch(e){} }, 1100);
  }
}

/* Felt gem shape used by the crystals and by the flying copy. */
function feltGem(fill, deep){
  return '<svg class="gem-svg felt" viewBox="0 0 120 148" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + FELT_DEFS
    + '<path class="pc" d="M60 4 L114 46 L94 138 L26 138 L6 46 Z" fill="'+fill+'"/>'
    + '<path d="M60 4 L94 138 L60 138 Z" fill="'+deep+'" opacity=".35"/>'
    + '<path d="M60 4 L26 138 L60 138 Z" fill="#fff" opacity=".22"/>'
    + '<path d="M6 46 L114 46" stroke="#fff" stroke-width="4" opacity=".55"/>'
    + '<path d="M22 62 q10 -14 24 -18" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".75"/>'
    + '</svg>';
}

/* The meadow itself: felt hills, distant castle, clouds, flowers, motes. */
function feltMeadowBg(){
  let s='<svg class="meadow-bg felt" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" '
    + 'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+FELT_DEFS
    + '<defs><linearGradient id="meadow-sky" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0" stop-color="#CDEAFA"/><stop offset=".6" stop-color="#E9E2FB"/>'
    + '<stop offset="1" stop-color="#FBEFDA"/></linearGradient></defs>'
    + '<rect width="1200" height="700" fill="url(#meadow-sky)"/>'
    + '<circle cx="150" cy="110" r="52" fill="'+FELT.butter+'" opacity=".85"/>';
  [[330,90,.85],[700,68,1],[1020,130,.75]].forEach(function(c){
    s+='<g class="cloud" transform="translate('+c[0]+','+c[1]+') scale('+c[2]+')" style="--d:'+(c[2]*8).toFixed(1)+'s">'
      + '<ellipse class="pc" cx="0" cy="0" rx="48" ry="30" fill="'+FELT.white+'"/>'
      + '<ellipse class="pc" cx="42" cy="9" rx="36" ry="23" fill="'+FELT.white+'"/>'
      + '<ellipse class="pc" cx="-40" cy="10" rx="31" ry="20" fill="'+FELT.white+'"/></g>';
  });
  /* distant castle */
  s+='<g opacity=".62" transform="translate(880,300) scale(1.5)">'
    + '<rect class="pc" x="0" y="30" width="18" height="52" rx="6" fill="'+FELT.lilacL+'"/>'
    + '<rect class="pc" x="58" y="30" width="18" height="52" rx="6" fill="'+FELT.lilacL+'"/>'
    + '<rect class="pc" x="20" y="42" width="36" height="40" rx="6" fill="'+FELT.white+'"/>'
    + '<path class="pc" d="M-4 32 L9 8 L22 32 z" fill="'+FELT.pink+'"/>'
    + '<path class="pc" d="M54 32 L67 8 L80 32 z" fill="'+FELT.pink+'"/>'
    + '<path class="pc" d="M16 44 L38 20 L60 44 z" fill="'+FELT.pinkD+'"/></g>';
  /* hills */
  s+='<path class="pc" d="M-20 452 q200 -96 420 -24 q210 68 400 -22 q190 -88 420 12 l0 300 l-1260 0 z" fill="'+FELT.mint+'"/>'
    + '<path class="pc" d="M-20 540 q240 -80 470 -12 q250 62 480 -26 q160 -60 300 6 l0 220 l-1260 0 z" fill="'+FELT.grass+'"/>'
    + feltStitch('M10 558 q230 -66 450 -6 q250 60 470 -24 q150 -54 290 4','rgba(255,255,255,.6)',3);
  /* bushes + flowers */
  [[110,600,1],[360,636,.8],[1090,608,.9]].forEach(function(b){
    s+='<g transform="translate('+b[0]+','+b[1]+') scale('+b[2]+')">'
      + feltLobe(0,0,46,31, FELT.grassD) + feltLobe(-32,9,31,22, FELT.grass) + feltLobe(34,10,29,20, FELT.grass) + '</g>';
  });
  [[60,672,1.1,FELT.pink],[250,694,1,FELT.butter],[470,676,.9,FELT.lilac],
   [980,690,1.05,FELT.pink],[1150,664,.9,FELT.butter]].forEach(function(f){
    s+='<g transform="translate('+f[0]+','+f[1]+') scale('+f[2]+')">'
      + '<path d="M0 34 q-4 -22 0 -34" stroke="'+FELT.grassD+'" stroke-width="5" fill="none" stroke-linecap="round"/>'
      + feltFlower(0,0,20,f[3]) + '</g>';
  });
  /* floating magical motes */
  for(let i=0;i<10;i++){
    const x=110+i*112, y=200+((i*83)%230), sc=(0.45+((i*17)%6)/10).toFixed(2);
    s+='<g class="wsparkle" style="--i:'+i+'" transform="translate('+x+','+y+') scale('+sc+')">'
      + feltStar(0,0,13, FELT.white)+'</g>';
  }
  return s+'</svg>';
}

/* 6. First sound mirror */
Games.firstSound = function(params){
  params=params||{};
  const area=$('game-area'); area.innerHTML='';
  const pool = FIRST_SOUND_SETS.filter(s=>S.unlocked.includes(s.sound)&&isPhonemeUsable(s.sound));
  if(!pool.length) return needGrownup(area);
  const set = pool[Math.floor(Math.random()*pool.length)];
  const sound=set.sound;
  say('first-sound', 'Which picture starts with this sound?');
  $('game-area').dataset.scene='mirror';
  twinkleSay('Look in the magic mirror! 🪞', {silent:true});
  after(2100, ()=> AudioSys.playPhoneme(sound));
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
        after(2300, activityDone);
      } else gentleNo(b, 'Listen again... '+PHONEMES[sound].cue+'... Which picture starts that way?');
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};

/* 7. Rainbow letter match (upper/lower) */
Games.matchCase = function(){
  const area=$('game-area'); area.innerHTML='';
  /* Letter-shape matching still only uses sounds a human has approved, so
     Layla never meets a grapheme the app cannot say out loud. */
  let letters = shuffle(usablePhonemes(S.unlocked)).slice(0,3);
  if(letters.length<2) letters = usablePhonemes(PHONEME_ORDER).slice(0,3);
  if(!letters.length) return needGrownup(area);
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
    b.innerHTML='<span class="big-letter">'+GU(L)+'</span>';
    b.onclick=()=>{
      AudioSys.sfx('flip');
      top.querySelectorAll('.choice-card').forEach(x=>x.style.borderColor='#f0abfc');
      b.style.borderColor='#fbbf24'; selected=L;
      AudioSys.speak('Big '+GU(L)+'.');
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
        AudioSys.sfx('success'); AudioSys.speak('Yes! '+GU(L)+' and '+G(L)+' match!');
        record('case:'+L, firstTryFlag&&attemptsThisItem===0);
        pairs++; addStars(1); sparkles(10);
        selected=null;
        if(pairs>=letters.length){
          if(S.rainbowColors<6){S.rainbowColors++; save();}
          confettiBlast();
          after(1800, activityDone);
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
  if(!w) w = dec.length? dec[Math.floor(Math.random()*dec.length)] : null;
  const area=$('game-area'); area.innerHTML='';
  if(!w || !w.ph.every(isPhonemeUsable)) return needGrownup(area);
  say('sound-it-out', "Let's sound it out!");
  $('game-area').dataset.scene='cottage';
  twinkleSay('A kitten needs us! Sound it out with me! 🐱', {silent:true});
  const wrap=document.createElement('div'); wrap.className='center rescue-scene';
  wrap.innerHTML=((typeof kittenSVG==='function') ? kittenSVG() : '🐱')
    + ((typeof cottageDoorSVG==='function') ? cottageDoorSVG() : '<div style="font-size:44px">🚪</div>');
  area.appendChild(wrap);
  const stage=document.createElement('div'); stage.className='blend-stage';
  /* Show the SPELLING under each sound — 'moon' is m-oo-n, three sounds. */
  w.ph.forEach((p,i)=>{
    const d=document.createElement('div'); d.className='blend-letter';
    d.textContent=(w.gr&&w.gr[i])||G(p); stage.appendChild(d);
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
    after(1500, ()=>{
      AudioSys.playWordSlow(w, {
        onPhoneme:(i)=>{
          const el=stage.children[i];
          if(el){ el.style.transform='scale(1.25)'; el.style.borderColor='#fbbf24'; setTimeout(()=>{el.style.transform='scale(1)';},500); }
        },
        onBlended:()=>showBlendChoices()
      });
    });
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
            after(2600, activityDone);
          } else gentleNo(b);
        };
        ch.appendChild(b);
      });
      blendLabel.appendChild(ch);
  };
  // auto-play once for 4yo
  after(1200, ()=>{ if(document.body.contains(btnRow)) btnRow.querySelector('button').click(); });
};
function maybeWordMilestone(word){
  if(S.wordsCelebrated.includes(word)) return;
  S.wordsCelebrated.push(word); save();
  const dec=decodableWords();
  if(S.wordsRead.length===1 || word==='sat' || word==='cat'){
    after(2600, ()=> showMilestone('You read a word!', word, 'You sounded it out all by yourself! I am SO proud!', {clip:'you-read-a-word'}));
  }
}

/* 9. Word building */
Games.buildWord = function(params){
  params=params||{};
  const dec=decodableWords();
  let w = params.word ? WORDS.find(x=>x.t===params.word) : null;
  if(!w) w = dec.length? dec[Math.floor(Math.random()*dec.length)] : null;
  const area=$('game-area'); area.innerHTML='';
  if(!w || !w.ph.every(isPhonemeUsable)) return needGrownup(area);
  setInstruction('Build the word '+w.t+'.', 'Build the word '+w.t+'.');
  $('game-area').dataset.scene='cottage';
  twinkleSay(w.emoji+' shows '+w.t+'! Can you build it? 🧱', {silent:true});
  AudioSys.playWord(w.t);
  const pic=document.createElement('div'); pic.className='center word-pic'; pic.innerHTML=wordArt(w);
  area.appendChild(pic);
  const slots=document.createElement('div'); slots.className='slot-row';
  const slotEls=[];
  /* A slot wants a SOUND (dataset.want) but shows a SPELLING (dataset.gr). */
  w.ph.forEach((p,i)=>{
    const s=document.createElement('div'); s.className='slot'+(i===0?' next':'');
    s.dataset.want=p; s.dataset.gr=(w.gr&&w.gr[i])||G(p);
    slots.appendChild(s); slotEls.push(s);
  });
  area.appendChild(slots);
  /* Tiles pair the sound with the letters that spell it in THIS word, so
     'cat' offers a c-tile for /k/ while 'kite' would offer a k-tile. */
  const own = w.ph.map((p,i)=>({ph:p, gr:(w.gr&&w.gr[i])||G(p)}));
  const extra = shuffle(usablePhonemes(PHONEME_ORDER).filter(p=>w.ph.indexOf(p)<0))
                  .slice(0,2).map(p=>({ph:p, gr:G(p)}));
  const pool=shuffle(own.concat(extra));
  const tiles=document.createElement('div'); tiles.className='tile-row';
  let next=0;
  pool.forEach(ch=>{
    const b=document.createElement('button'); b.className='tile'; b.textContent=ch.gr;
    b.onclick=()=>{
      if(next>=slotEls.length) return;
      const slot=slotEls[next];
      if(ch.ph===slot.dataset.want && ch.gr===slot.dataset.gr){
        slot.textContent=ch.gr; slot.classList.add('filled'); slot.classList.remove('next');
        b.classList.add('used'); AudioSys.playPhoneme(ch.ph);
        next++; if(slotEls[next]) slotEls[next].classList.add('next');
        if(next>=slotEls.length){
          record('spell:'+w.t, firstTryFlag&&attemptsThisItem===0);
          if(!S.wordsRead.includes(w.t)) S.wordsRead.push(w.t);
          addStars(4); save(); sparkles(20); checkMilestones();
          AudioSys.playWordSlow(w, { onDone:()=>{
            AudioSys.speak('You built '+w.t+'!');
            maybeWordMilestone(w.t);
            after(2600, activityDone);
          }});
        }
      } else { attemptsThisItem++; gentleNo(b, 'Hmm, we need '+String(slot.dataset.gr).toUpperCase()+'. Listen!'); AudioSys.playPhoneme(slot.dataset.want); }
    };
    tiles.appendChild(b);
  });
  area.appendChild(tiles);
};

/* 10. Dress-up challenge */
Games.dressup = function(){
  const area=$('game-area'); area.innerHTML='';
  const dec=decodableWords();
  if(!dec.length) return needGrownup(area);
  const w = dec[Math.floor(Math.random()*dec.length)];
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
        after(2000, ()=>{ grantRandomReward('dressup'); activityDone(); });
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
  const steps = usablePhonemes(S.unlocked.filter(x=>PHONEMES[x]));
  if(!steps.length) return needGrownup(area);
  while(steps.length<3) steps.push(steps[steps.length%steps.length]);
  setInstruction('Tap the sound you hear!', 'Tap the stage tile that makes the sound you hear!');
  twinkleSay('The ballerina needs your ears! 🩰', {silent:true});
  $('game-area').dataset.scene='stage';
  const dancer=document.createElement('div'); dancer.className='ballerina';
  dancer.innerHTML=(typeof ballerinaSVG==='function')?ballerinaSVG():'🩰';
  area.appendChild(dancer);
  let idx=0, target=steps[0];
  const floor=document.createElement('div'); floor.className='ballet-floor';
  steps.forEach(s=>{
    const b=document.createElement('button'); b.className='ballet-tile'; b.textContent=GU(s); b.dataset.s=s;
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
          after(2200, activityDone);
        } else { target=steps[idx]; after(800, ()=>AudioSys.playPhoneme(target)); }
      } else gentleNo(b);
    };
    floor.appendChild(b);
  });
  area.appendChild(floor);
  const hear=document.createElement('div'); hear.className='center';
  hear.innerHTML='<button class="magic-btn">🔊 Hear the step</button>';
  hear.querySelector('button').onclick=()=>AudioSys.playPhoneme(target);
  area.appendChild(hear);
  after(900, ()=> AudioSys.playPhoneme(target));
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
    b.innerHTML='<span class="pic-emoji">'+picFor(w, (set.be[w]||'⭐'))+'</span><span class="pic-word">'+w+'</span>';
    if(set.rhymes.includes(w)) b.dataset.correct='1';
    b.onclick=()=>{
      AudioSys.playWord(w);
      if(set.rhymes.includes(w)){
        b.classList.add('correct'); garden.textContent='🌸🌷🌼';
        celebrateRight('rhyme:'+set.base, 'Yes! '+set.base+' and '+w+' rhyme!'); addStars(3); sparkles(18);
        after(2300, activityDone);
      } else gentleNo(b, 'Do '+set.base+' and '+w+' sound the same at the end? Try again!');
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};

/* 13. Tracing */
Games.trace = function(params){
  params=params||{};
  const L=GU(params.letter||S.currentFocus||'s');
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
  if(!ctx){ btn.onclick=()=>{ addStars(2); after(800, activityDone); }; return; }
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
    after(1800, activityDone);
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
      if(found>=items.length){ addStars(2); after(1500, activityDone); }
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
  let pages = STORY_PAGES.filter((p,i)=> i===0 || (p.needs||[]).every(n=>set.has(n)&&isPhonemeUsable(n)));
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
/* Reward state machine: closed → opening → revealed.
   The item is NEVER shown before the chest opens. */
let rewardState='idle', rewardCurrent=null, castleHighlight=null, rewardAfterCastle=null;
function tabForCat(cat){
  try{ if(CLOSET_TABS.some(t=>t[0]===cat)) return cat; }catch(e){}
  return 'dress';
}
function goCastleWithReward(r){
  $('reward-modal').classList.add('hidden');
  castleHighlight=r.id;
  openCastle();
  setClosetTab(tabForCat(r.cat));
}
/* Reward reveal. The prize is NOT in the DOM while the chest is shut —
   not hidden, not transparent, not present. It is built at reveal time, so
   there is nothing to glimpse, inspect, or flash on a slow frame.
   Beat order: closed -> shake -> pop open -> glow -> item rises -> name
   -> Try It On. */
function showReward(r){
  rewardState='closed'; rewardCurrent=r;
  const ri=$('reward-item'), rn=$('reward-name'), ch=$('reward-chest');
  ri.innerHTML=''; rn.textContent='';
  ri.classList.remove('revealed'); rn.classList.remove('revealed');
  ch.innerHTML=(typeof chestHTML==='function')?chestHTML(false):((typeof chestSVG==='function')?chestSVG(false):'');
  ch.classList.remove('open','shaking','glowing');
  $('btn-reward-open').classList.remove('hidden');
  $('btn-reward-castle').classList.add('hidden');
  $('reward-modal').classList.remove('hidden');
  twinkleSay('Something magical is waiting! Tap the chest! 🎁', {silent:true});
  twinklePose('happy');

  $('btn-reward-open').onclick=()=>{
    if(rewardState!=='closed') return;
    rewardState='opening';
    $('btn-reward-open').classList.add('hidden');
    ch.classList.add('shaking');                                   /* shake */
    AudioSys.sfx('chest');

    after(700, ()=>{
      if(rewardState!=='opening') return;
      /* pop open */
      if(typeof chestHTML==='function') ch.innerHTML=chestHTML(true);
      else if(typeof chestSVG==='function') ch.innerHTML=chestSVG(true);
      ch.classList.remove('shaking');
      ch.classList.add('open','glowing');                          /* glow  */
      AudioSys.sfx('sparkle');
    });

    after(1150, ()=>{
      if(rewardState!=='opening') return;
      /* only NOW does the prize exist */
      ri.innerHTML = (typeof rewardFeltArt==='function') ? rewardFeltArt(r) : '';
      requestAnimationFrame(()=>ri.classList.add('revealed'));     /* rises */
      AudioSys.sfx('fanfare'); confettiBlast();
      if(typeof stickerBurst==='function') stickerBurst(ri, 16); else sparkles(24);
    });

    after(1600, ()=>{
      if(rewardState!=='opening') return;
      rn.textContent=r.name;
      rn.classList.add('revealed');                                /* name  */
      rewardState='revealed';
      AudioSys.playVoice('look-unlocked', 'Look what you unlocked! '+r.name+'!');
      /* auto-equip wearables so "try it on" is instant */
      const slot=r.cat;
      if(slot && S.equipped.hasOwnProperty(slot)){ S.equipped[slot]=r.id; save(); }
      const b=$('btn-reward-castle');
      b.classList.remove('hidden');                                /* CTA   */
      AudioSys.playVoice('try-it-on', "Let's try it on!");
      b.onclick=()=>{
        const r2=rewardCurrent||r, afterFn=rewardAfterCastle;
        rewardAfterCastle=null;
        goCastleWithReward(r2);
        if(afterFn) after(1400, afterFn);
      };
    });
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
    AudioSys.playVoice(opts.clip, title);
    after(2600, ()=> AudioSys.playWord(word));
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
  if(castleHighlight){
    try{
      const tiles=$('closet-grid').querySelectorAll('.closet-item');
      tiles.forEach(t=>{ if(t.classList.contains('equipped')){ t.classList.add('new-glow'); setTimeout(()=>t.classList.remove('new-glow'), 6000); } });
    }catch(e){}
    castleHighlight=null;
  }
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
    /* Trays show the real garment as a felt cut-out, never an emoji.
       Locked slots show a blank felt tag so the tray still reads as a tray. */
    let icon = '<span class="tray-locked">?</span>';
    try{
      if(owned && typeof rewardFeltArt==='function') icon = rewardFeltArt(r);
    }catch(e){}
    d.innerHTML='<span>'+icon+'</span><span class="cname">'+(owned?r.name:'???')+'</span>'+(S.equipped[closetTab]===r.id?'<span class="equip-badge">💖</span>':'');
    d.onclick=()=>{
      if(!owned){ AudioSys.speak('Keep playing adventures to unlock this!'); toast('Play adventures to unlock! 🔒'); return; }
      S.equipped[closetTab]=r.id; save(); renderCloset(); renderRoom();
      const pm=$('princess-mount');
      if(pm && (closetTab==='dress'||closetTab==='crown'||closetTab==='shoes'||closetTab==='wings')){
        pm.classList.remove('spinning','shimmer'); void pm.offsetWidth;
        pm.classList.add('spinning','shimmer');
        setTimeout(()=>pm.classList.remove('spinning','shimmer'), 900);
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
    /* Room props are felt cut-outs, not emoji. Each hook is an empty <g> in
       the room SVG; drop a nested <svg> in and size it by its own viewBox,
       so a swatch can be reused verbatim from the dressing-room trays. */
    const placeIn = (host, art, x, y, w) => {
      if(!host) return;
      host.innerHTML = '';
      if(!art) return;
      host.innerHTML = art;                       // nested <svg> is valid in <g>
      const svg = host.querySelector('svg');
      if(!svg) return;
      const vb = (svg.getAttribute('viewBox')||'0 0 160 120').split(/[\s,]+/).map(Number);
      svg.setAttribute('x', x);
      svg.setAttribute('y', y);
      svg.setAttribute('width', w);
      svg.setAttribute('height', (w * (vb[3]/vb[2])).toFixed(1));
      svg.removeAttribute('class');
    };
    const byId = id => REWARDS.find(r=>r.id===id);
    placeIn(room.querySelector('.room-pet'),        eq.pet    ? rewardFeltArt(byId(eq.pet))    : '', 108, 386,  86);
    placeIn(room.querySelector('.room-window-art'), eq.window ? rewardFeltArt(byId(eq.window)) : '', 352,  78, 156);
    placeIn(room.querySelector('.room-shelf-art'),  eq.crown  ? rewardFeltArt(byId(eq.crown))  : '', 494, 206,  72);
    const dec = room.querySelector('.room-decor');
    if(dec){
      dec.innerHTML='';
      const spots=[[92,54],[726,104],[44,286]];
      REWARDS.filter(r=>r.cat==='decor' && S.rewards.includes(r.id)).slice(0,3).forEach((d,i)=>{
        const g=document.createElementNS('http://www.w3.org/2000/svg','g');
        dec.appendChild(g);
        placeIn(g, rewardFeltArt(d), spots[i][0], spots[i][1], 84);
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
  if(S.sentenceUnlocked||S.wordsRead.length>=3){ story.classList.remove('locked'); story.style.opacity='1'; $('story-lock-note').textContent='🎉'; }
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
  AudioSys.playVoice('hi-layla', 'Hi Layla!');
  after(2600, ()=> AudioSys.speak("I found something magical! That's YOUR name! Layla!"));
  wrap.querySelector('button').onclick=()=>{ AudioSys.sfx('fanfare'); sparkles(20); activityDone(); };
}
function endSession(){
  renderDots();
  const rew=sessionReward;
  if(rew && !S.rewards.includes(rew.id)){
    S.rewards.push(rew.id); save();
    if(!S.firstSessionDone){ S.firstSessionDone=true; save(); }
    showReward(rew);
    rewardAfterCastle=showSessionChoice;
    sessionReward=null;
    logSession();
    return;
  }
  // small reward chance — chain the session choice AFTER the reward is enjoyed
  if(Math.random()<0.5 && sessionName!=='Free play'){
    const locked = REWARDS.filter(r=>!S.rewards.includes(r.id));
    if(locked.length){
      grantRandomReward();
      rewardAfterCastle=showSessionChoice;
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
/* ============ SOUND LIBRARY — bulk human approval ====================
   The parent is the only thing that can put a sound in front of Layla.
   This screen exists to make listening to ~43 recordings quick rather
   than to make approving them quick: there is no "approve all", and a
   row cannot be approved until it has actually been played.

   Layout is one compact row per sound:
       [ai]  /eɪ/ long a as in rain   ▶  ✓  ✗   UNREVIEWED
   with a moving cursor so the parent can work through the list on the
   keyboard alone:
       Space / P  play the current sound
       A          approve   R  reject   U  back to unreviewed
       J / ↓      next      K / ↑  previous
       Enter      approve the current sound and play the next one
   ==================================================================== */
let qaPlayed = {};
let qaRec = null;
let qaFilter = 'all';          // all | UNREVIEWED | APPROVED | REJECTED
let qaCursor = 0;              // index into the currently visible rows
let qaKeysBound = false;

function qaTarget(id){
  const e = Phonics.byId[Phonics.resolve(id)];
  return e ? e.target : '';
}
/* Rows currently shown, in teaching order. */
function qaVisibleIds(){
  return PHONEME_ORDER.filter(function(id){
    if(qaFilter==='all') return true;
    const man = manifestOf(id);
    if(qaFilter==='MISSING') return !!(man && man.approvalStatus==='MISSING');
    return approvalOf(id).st === qaFilter;
  });
}
function qaSetApproval(id, st){
  const a = approvalOf(id);
  if(st==='APPROVED'){
    const man = manifestOf(id);
    if(man && man.approvalStatus==='MISSING'){ toast('No audio file for this sound.'); return false; }
    if(!qaPlayed[id]){ toast('Play it first — listen, then approve. 👂'); return false; }
    a.st='APPROVED';
    a.dev=false;
    /* Bind the approval to the exact bytes that were listened to. */
    a.hash = (man && man.sha256) || null;
  } else {
    a.st = st;
    if(st!=='APPROVED') a.hash = null;
  }
  save();
  return true;
}
function qaPlay(id){
  qaPlayed[id] = true;
  const a = approvalOf(id);
  if(a.custom){
    PhonemeDB.get(id).then(function(blob){
      if(!blob){ AudioSys.playPhoneme(id, {audit:true}); return; }
      try{
        const url=URL.createObjectURL(blob);
        Speech.request(2,'audit-mine:'+id,'word',function(c,done,tr){ Speech.playFile(url,null,tr).then(function(){ done('done'); }); });
      }catch(e){ AudioSys.playPhoneme(id, {audit:true}); }
    });
  } else {
    /* audit:true bypasses the approval gate — this screen is the only
       place an unapproved sound is ever allowed to make a noise. */
    AudioSys.playPhoneme(id, {audit:true});
  }
  qaPaint();
}
function qaMove(delta){
  const ids = qaVisibleIds();
  if(!ids.length) return;
  qaCursor = Math.max(0, Math.min(ids.length-1, qaCursor+delta));
  qaPaint(true);
}
/* Advance after a decision.
   Under a filter like "To review", the row just decided DROPS OUT of the
   list, so the next sound slides into the index the cursor already holds.
   Moving +1 there would silently skip a sound — which is the one thing this
   screen must never do. So only step forward when the list did not shrink. */
function qaAdvanceAfterDecision(){
  const before = qaVisibleIds().length;
  const ids = qaVisibleIds();
  if(qaFilter === 'all'){ qaMove(1); return; }
  if(qaCursor >= ids.length) qaCursor = Math.max(0, ids.length - 1);
  qaPaint(true);
}
function qaCurrentId(){
  const ids = qaVisibleIds();
  return ids[Math.min(qaCursor, ids.length-1)] || null;
}
function qaBindKeys(){
  if(qaKeysBound) return;
  qaKeysBound = true;
  document.addEventListener('keydown', function(ev){
    const scr=$('screen-parent');
    if(!scr || !scr.classList.contains('active')) return;
    const t=ev.target;
    if(t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    const id = qaCurrentId();
    const k = ev.key;
    if(k===' ' || k==='p' || k==='P'){ if(id) qaPlay(id); ev.preventDefault(); return; }
    if(k==='j' || k==='J' || k==='ArrowDown'){ qaMove(1); ev.preventDefault(); return; }
    if(k==='k' || k==='K' || k==='ArrowUp'){ qaMove(-1); ev.preventDefault(); return; }
    if(k==='a' || k==='A'){ if(id && qaSetApproval(id,'APPROVED')) qaPaint(); ev.preventDefault(); return; }
    if(k==='r' || k==='R'){ if(id){ qaSetApproval(id,'REJECTED'); qaPaint(); } ev.preventDefault(); return; }
    if(k==='u' || k==='U'){ if(id){ qaSetApproval(id,'UNREVIEWED'); qaPaint(); } ev.preventDefault(); return; }
    if(k==='Enter'){
      if(id && qaSetApproval(id,'APPROVED')){
        qaAdvanceAfterDecision();
        const nxt=qaCurrentId(); if(nxt && nxt!==id) qaPlay(nxt);
      }
      ev.preventDefault(); return;
    }
  });
}

function renderAudioQA(){
  const box=$('audio-qa'); if(!box) return;
  /* If the manifest has not arrived yet, fetch it — it re-renders on load. */
  if(!PHONEME_MANIFEST){ try{ loadPhonemeManifest(); }catch(e){} }
  qaBindKeys();
  renderAudioDebug();
  box.innerHTML='';

  const counts = approvalCounts();
  const total = PHONEME_ORDER.length;
  const prov = (PHONEME_MANIFEST && PHONEME_MANIFEST._provider) || Phonics.provider;

  /* ---- summary + licence ---- */
  const sum=$('audio-qa-summary');
  if(sum){
    sum.innerHTML =
      '<div class="qa-tally">'
      + '<b>' + counts.APPROVED + '</b> approved · '
      + '<b>' + counts.UNREVIEWED + '</b> to review · '
      + '<b>' + counts.REJECTED + '</b> rejected'
      + (counts.MISSING ? ' · <b style="color:#dc2626">' + counts.MISSING + '</b> missing' : '')
      + ' &nbsp;of ' + total + '</div>'
      + '<div class="qa-note">Only <b>approved</b> sounds ever reach Layla. Nothing here is '
      + 'approved automatically — play it, decide, then tap ✓ or ✗.</div>'
      + '<div class="qa-note qa-keys">Keyboard: <b>Space</b> play · <b>A</b> approve · '
      + '<b>R</b> reject · <b>J/K</b> move · <b>Enter</b> approve &amp; play next</div>'
      + '<div class="qa-note qa-licence">Source: <b>' + prov.provider + '</b> · '
      + prov.license + ' · <a href="' + prov.sourceUrl + '" target="_blank" rel="noopener">repo</a> · '
      + '<a href="' + prov.licenseUrl + '" target="_blank" rel="noopener">licence</a><br>'
      + prov.attribution + ' — redistribution ' + prov.redistribution.split(' (')[0]
      + ', commercial use ' + prov.commercialUse.split(' (')[0] + '.</div>'
      + '<div id="qa-vw" class="qa-note">Checking voice &amp; word clips…</div>';
  }

  /* ---- filter chips ---- */
  const bar=document.createElement('div'); bar.className='qa-filters';
  [['all','All ('+total+')'],
   ['UNREVIEWED','To review ('+counts.UNREVIEWED+')'],
   ['APPROVED','Approved ('+counts.APPROVED+')'],
   ['REJECTED','Rejected ('+counts.REJECTED+')']].forEach(function(f){
    const b=document.createElement('button');
    b.className='qa-filter'+(qaFilter===f[0]?' on':'');
    b.textContent=f[1];
    b.onclick=function(){ qaFilter=f[0]; qaCursor=0; renderAudioQA(); };
    bar.appendChild(b);
  });
  box.appendChild(bar);

  const ids = qaVisibleIds();
  if(!ids.length){
    const empty=document.createElement('div'); empty.className='qa-note';
    empty.textContent='Nothing in this filter.';
    box.appendChild(empty);
    return;
  }
  if(qaCursor >= ids.length) qaCursor = ids.length-1;

  /* ---- rows, grouped by teaching phase ---- */
  let lastPhase=null;
  const list=document.createElement('div'); list.className='qa-list';
  ids.forEach(function(id, idx){
    const entry = Phonics.byId[id];
    const man = manifestOf(id);
    const missing = !!(man && man.approvalStatus==='MISSING');

    if(entry && entry.phase!==lastPhase){
      lastPhase = entry.phase;
      const ph = Phonics.phases.filter(function(x){ return x.id===lastPhase; })[0];
      const h=document.createElement('div'); h.className='qa-phase';
      h.innerHTML='<b>'+(ph?ph.label:lastPhase)+'</b> <span>'+(ph?ph.note:'')+'</span>';
      list.appendChild(h);
    }

    const row=document.createElement('div');
    row.className='qa-line';
    row.dataset.id=id;
    if(idx===qaCursor) row.classList.add('cursor');
    row.onclick=function(ev){
      if(ev.target.closest('button,label')) return;
      qaCursor=idx; qaPaint(true);
    };

    /* grapheme chip — all the spellings this one sound has */
    const gr=document.createElement('span'); gr.className='qa-gr';
    gr.innerHTML = entry.graphemes.map(function(g,i){
      return '<b'+(i===0?' class="pri"':'')+'>'+g+'</b>';
    }).join('<i>/</i>');
    row.appendChild(gr);

    /* phoneme label */
    const lab=document.createElement('span'); lab.className='qa-lab';
    lab.innerHTML='<span class="qa-ipa">/'+entry.ipa+'/</span>'
      + '<span class="qa-pid">'+entry.id+'</span>'
      + '<span class="qa-tgt">'+qaTarget(id)+'</span>';
    row.appendChild(lab);

    /* controls */
    const ctl=document.createElement('span'); ctl.className='qa-ctl';
    const bPlay=document.createElement('button'); bPlay.className='qa-play'; bPlay.textContent='▶';
    bPlay.title='Play this sound';
    bPlay.onclick=function(){ qaCursor=idx; qaPlay(id); };
    const bOk=document.createElement('button'); bOk.className='qa-ok'; bOk.textContent='✓'; bOk.title='Approve (A)';
    bOk.onclick=function(){ qaCursor=idx; if(qaSetApproval(id,'APPROVED')){ if(qaFilter==='all') qaPaint(); else renderAudioQA(); } };
    const bNo=document.createElement('button'); bNo.className='qa-no'; bNo.textContent='✗'; bNo.title='Reject (R)';
    bNo.onclick=function(){ qaCursor=idx; qaSetApproval(id,'REJECTED'); if(qaFilter==='all') qaPaint(); else renderAudioQA(); };
    [bPlay,bOk,bNo].forEach(function(b){ ctl.appendChild(b); });
    row.appendChild(ctl);

    /* status */
    const st=document.createElement('span'); st.className='qa-status';
    row.appendChild(st);

    /* per-row detail drawer: provenance + parent's own recording */
    const more=document.createElement('div'); more.className='qa-more';
    const bRec=document.createElement('button'); bRec.className='qa-mini'; bRec.textContent='● Record';
    const timerEl=document.createElement('span'); timerEl.className='qa-timer';
    bRec.onclick=function(){ qaRecordToggle(id, bRec, timerEl); };
    const bFileL=document.createElement('label'); bFileL.className='qa-file qa-mini'; bFileL.textContent='📁 Replace';
    const bFile=document.createElement('input'); bFile.type='file'; bFile.accept='audio/*'; bFile.style.display='none';
    bFileL.appendChild(bFile);
    bFile.onchange=function(){
      const f=bFile.files && bFile.files[0];
      if(!f) return;
      PhonemeDB.put(id, f).then(function(){
        const a=approvalOf(id); a.st='UNREVIEWED'; a.custom=true; a.played=false; a.hash=null; save();
        qaPlayed[id]=false;
        toast('Saved. Play it, then approve. 📁');
        renderAudioQA();
      }).catch(function(){ toast('Could not save that file.'); });
      bFile.value='';
    };
    const srcTxt=document.createElement('span'); srcTxt.className='qa-src';
    more.appendChild(bRec); more.appendChild(bFileL); more.appendChild(timerEl); more.appendChild(srcTxt);
    row.appendChild(more);

    row._paint=function(){
      const a=approvalOf(id);
      let label, cls;
      if(missing){ label='MISSING FILE'; cls='miss'; }
      else if(a.st==='APPROVED'){ label = a.dev ? '✓ dev-approved (not reviewed)' : '✓ APPROVED'; cls = a.dev?'dev':'ok'; }
      else if(a.st==='REJECTED'){ label='✗ REJECTED'; cls='no'; }
      else { label = qaPlayed[id] ? '◷ heard — decide' : '◷ UNREVIEWED'; cls='un'; }
      if(a.custom) label += ' · your recording';
      st.textContent=label;
      st.className='qa-status s-'+cls;
      row.classList.toggle('is-approved', a.st==='APPROVED' && !missing);
      row.classList.toggle('is-rejected', a.st==='REJECTED');
      row.classList.toggle('is-missing', missing);
      bOk.disabled = missing;
      if(man){
        srcTxt.textContent = man.provider + ' · ' + man.license
          + (man.duration ? ' · ' + man.duration + 's' : '')
          + (man.truePeakDb!=null ? ' · peak ' + Number(man.truePeakDb).toFixed(1) + ' dB' : '')
          + (man.locked ? ' · locked starter asset' : '');
      } else {
        srcTxt.textContent = 'no manifest entry';
      }
    };
    row._paint();
    list.appendChild(row);
  });
  box.appendChild(list);

  /* ---- cursor toolbar ---- */
  const barB=document.createElement('div'); barB.className='qa-toolbar';
  const mk=function(txt, fn, cls){
    const b=document.createElement('button'); b.className='qa-tool '+(cls||''); b.textContent=txt; b.onclick=fn; return b;
  };
  barB.appendChild(mk('▶ Play current', function(){ const id=qaCurrentId(); if(id) qaPlay(id); }));
  barB.appendChild(mk('✓ Approve & next', function(){
    const id=qaCurrentId();
    if(id && qaSetApproval(id,'APPROVED')){
      qaAdvanceAfterDecision();
      const n=qaCurrentId(); if(n && n!==id) qaPlay(n);
    }
  }, 'ok'));
  barB.appendChild(mk('✗ Reject & next', function(){
    const id=qaCurrentId();
    if(id){
      qaSetApproval(id,'REJECTED');
      qaAdvanceAfterDecision();
      const n=qaCurrentId(); if(n && n!==id) qaPlay(n);
    }
  }, 'no'));
  barB.appendChild(mk('▶ Play next', function(){ qaMove(1); const id=qaCurrentId(); if(id) qaPlay(id); }));
  box.appendChild(barB);

  qaPaint(true);

  /* voice + word clip presence (unchanged behaviour, reported compactly) */
  const vps = VOICE_KEYS.map(function(k){ return AudioSys.probe(VOICE_DIR+k+'.mp3').then(function(ok){ AudioStat.voice[k]=ok?'ok':'missing'; return ok; }); });
  const wps = WORD_KEYS.map(function(k){ return AudioSys.probe(WORD_DIR+k+'.mp3').then(function(ok){ AudioStat.word[k]=ok?'ok':'missing'; return ok; }); });
  Promise.all(vps.concat(wps)).then(function(rs){
    const vok = rs.slice(0,vps.length).filter(Boolean).length;
    const wok = rs.slice(vps.length).filter(Boolean).length;
    const el=$('qa-vw');
    if(el) el.innerHTML = 'Twinkle voice clips: <b>'+vok+'/'+VOICE_KEYS.length+'</b> · whole-word clips: <b>'+wok+'/'+WORD_KEYS.length+'</b>'
      + ((vok===VOICE_KEYS.length&&wok===WORD_KEYS.length)?' ✓':' <b style="color:#dc2626">— check files</b>');
    renderParentWarning();
    renderAudioDebug();
  });

  /* file presence for each phoneme */
  PHONEME_ORDER.forEach(function(id){
    const f=phonemeFile(id); if(!f) return;
    AudioSys.probe([f]).then(function(ok){
      AudioStat.phoneme[id]=ok?'ok':'missing';
      if(!ok){
        const miss=S.audioMissing||(S.audioMissing=[]);
        if(miss.indexOf(id)<0){ miss.push(id); save(); }
      }
    });
  });
}
function qaPaint(scroll){
  try{
    const box=$('audio-qa'); if(!box) return;
    const ids=qaVisibleIds();
    Array.prototype.forEach.call(box.querySelectorAll('.qa-line'), function(r,i){
      if(r._paint) r._paint();
      r.classList.toggle('cursor', ids[qaCursor]===r.dataset.id);
    });
    if(scroll){
      const cur=box.querySelector('.qa-line.cursor');
      if(cur && cur.scrollIntoView) cur.scrollIntoView({block:'nearest'});
    }
    const sum=$('audio-qa-summary');
    if(sum){
      const c=approvalCounts();
      const t=sum.querySelector('.qa-tally');
      if(t) t.innerHTML='<b>'+c.APPROVED+'</b> approved · <b>'+c.UNREVIEWED+'</b> to review · <b>'
        +c.REJECTED+'</b> rejected'+(c.MISSING?' · <b style="color:#dc2626">'+c.MISSING+'</b> missing':'')
        +' &nbsp;of '+PHONEME_ORDER.length;
    }
  }catch(e){}
}
function paintQAStatus(){ qaPaint(false); }

function qaRecordToggle(id, btn, timerEl){
  const doneRec=(keep)=>{
    const cur=qaRec; qaRec=null;
    btn.textContent='\u25CF Record'; timerEl.textContent='';
    if(keep && cur && cur.chunks.length){
      setTimeout(()=>{
        try{
          const blob=new Blob(cur.chunks, {type:cur.mime||'audio/webm'});
          PhonemeDB.put(id, blob).then(()=>{
            const a2=approvalOf(id); a2.st='UNREVIEWED'; a2.custom=true; save();
            qaPlayed[id]=false;
            toast('Recording saved. Listen (\u25B6 Mine), then approve.');
            renderAudioQA();
          }).catch(()=>toast('Could not save recording.'));
        }catch(e){ toast('Could not save recording.'); }
      }, 350);
    }
  };
  if(qaRec && qaRec.id===id){ qaRec.stop(true); return; }
  if(qaRec){ try{qaRec.stop(false);}catch(e){} }
  try{
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder==='undefined'){
      toast('Microphone not available here — use \uD83D\uDCC1 file replacement.'); return;
    }
    const mime=['audio/webm','audio/mp4','audio/ogg'].find(m=>{ try{return MediaRecorder.isTypeSupported(m);}catch(e){return false;} })||'';
    navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
      try{
        const rec=new MediaRecorder(stream, mime?{mimeType:mime}:undefined);
        const chunks=[];
        rec.ondataavailable=e=>{ if(e.data && e.data.size) chunks.push(e.data); };
        rec.onstop=()=>{ try{stream.getTracks().forEach(t=>t.stop());}catch(e){} };
        rec.start();
        qaRec={id, rec, chunks, mime, stop:doneRec};
        btn.textContent='\u23F9 Stop'; timerEl.textContent='\u25CF recording… say the sound once, clearly';
      }catch(e){ toast('Recording failed to start.'); }
    }).catch(()=>toast('Microphone blocked. Use \uD83D\uDCC1 file replacement.'));
  }catch(e){ toast('Recording unavailable here.'); }
}
/* ART SLOTS. The felt / sticker / paper-doll SVG art IS the art direction
   now — not a placeholder waiting to be replaced. These slots stay as an
   OPTIONAL override: if a human ever supplies a painted asset for a slot it
   is used instead, otherwise the felt art renders. Status shown in
   Parent > Art. */
const ART_SLOTS = [
  {id:'bg-kingdom', label:'Kingdom backdrop', spec:'1920×1080 JPG/WebP, sky top / land bottom third'},
  {id:'bg-meadow', label:'Unicorn Meadow backdrop', spec:'1920×1080, meadow with space for unicorn center'},
  {id:'bg-bedroom', label:'Princess Bedroom backdrop', spec:'1600×1000, wall top 2/3, floor bottom'},
  {id:'bg-rainbow', label:'Rainbow Road backdrop', spec:'1920×1080'},
  {id:'bg-cottage', label:'Kitten Cottage backdrop', spec:'1920×1080'},
  {id:'twinkle-idle', label:'Twinkle idle', spec:'transparent PNG ~600px, facing front-right'},
  {id:'twinkle-talking', label:'Twinkle talking', spec:'same pose, open mouth'},
  {id:'twinkle-happy', label:'Twinkle happy', spec:'same pose, closed happy eyes'},
  {id:'twinkle-flying', label:'Twinkle flying', spec:'wings up, slight tilt'},
  {id:'twinkle-pointing', label:'Twinkle pointing', spec:'paw extended right'},
  {id:'unicorn-idle', label:'Unicorn idle', spec:'transparent PNG ~900px, side view, facing right'},
  {id:'unicorn-listening', label:'Unicorn listening', spec:'head tilted, ear forward'},
  {id:'unicorn-happy', label:'Unicorn happy', spec:'hop or rear, joyful face'},
  {id:'princess-neutral', label:'Princess neutral', spec:'transparent PNG ~800px full body, arms relaxed'},
  {id:'princess-happy', label:'Princess happy', spec:'same pose, smile + wave'},
  {id:'princess-twirl', label:'Princess twirl', spec:'3 frames or striped dress variant'},
  {id:'obj-crystal', label:'Sound crystal', spec:'transparent ~300px, glowing, space for letter'},
  {id:'obj-chest-closed', label:'Chest closed', spec:'transparent ~500px'},
  {id:'obj-chest-open', label:'Chest open', spec:'same chest, lid open + glow'},
  {id:'obj-dresses', label:'Dress set (4)', spec:'matching princess template'},
  {id:'obj-crowns', label:'Crown set (3)', spec:'matching placement'},
  {id:'obj-shoes', label:'Shoe set (2)', spec:'matching placement'}
];
/* ART RUNTIME: every visual resolves through a named slot.
   Order: parent upload (IndexedDB) > assets/<slot>.webp|png > SVG fallback.
   Children never see missing-art states; parents see exact status. */
const AssetDB = {
  _db:null,
  open(){ return new Promise((res,rej)=>{ if(this._db) return res(this._db);
    try{ const rq=indexedDB.open('layla-kingdom',2);
      rq.onupgradeneeded=()=>{ try{rq.result.createObjectStore('phonemes');}catch(e){} try{rq.result.createObjectStore('art');}catch(e){} };
      rq.onsuccess=()=>{ this._db=rq.result; res(rq.result); };
      rq.onerror=()=>rej(rq.error||'db');
    }catch(e){ rej(e); } }); },
  put(id, blob){ return this.open().then(db=>new Promise((res,rej)=>{ try{
      const tx=db.transaction('art','readwrite');
      tx.objectStore('art').put(blob,'slot:'+id);
      tx.oncomplete=()=>res(true); tx.onerror=()=>rej(tx.error);
    }catch(e){ rej(e); } })); },
  get(id){ return this.open().then(db=>new Promise((res)=>{ try{
      const tx=db.transaction('art','readonly');
      const rq=tx.objectStore('art').get('slot:'+id);
      rq.onsuccess=()=>res(rq.result||null); rq.onerror=()=>res(null);
    }catch(e){ res(null); } })).catch(()=>null); },
  del(id){ return this.open().then(db=>new Promise((res)=>{ try{
      const tx=db.transaction('art','readwrite');
      tx.objectStore('art').delete('slot:'+id);
      tx.oncomplete=()=>res(true); tx.onerror=()=>res(true);
    }catch(e){ res(true); } })).catch(()=>true); }
};
const Art = {
  cache:{},
  probeImg(srcs){
    return new Promise((res)=>{
      if(typeof Image==='undefined'){ res(null); return; }
      const list=srcs.slice();
      const next=()=>{
        if(!list.length){ res(null); return; }
        const s=list.shift();
        try{
          const im=new Image();
          im.onload=()=>res(s); im.onerror=next; im.src=s;
          setTimeout(()=>{ if(im && !im.complete) next(); }, 6000);
        }catch(e){ next(); }
      };
      next();
    });
  },
  load(id){
    if(id in this.cache) return Promise.resolve(this.cache[id]);
    return AssetDB.get(id).then(blob=>{
      if(blob){ try{ const u=URL.createObjectURL(blob); this.cache[id]=u; return u; }catch(e){} }
      return Art.probeImg(['assets/'+id+'.webp','assets/'+id+'.png']).then(u=>{
        this.cache[id]=u; return u;
      });
    });
  },
  preload(ids){ return Promise.all((ids||[]).map(id=>this.load(id).catch(()=>null))); },
  bg(container, slot){
    // Full-bleed illustrated backdrop if supplied; else the SVG scene stays.
    try{
      this.load(slot).then(u=>{
        if(!u || !container || !document.body.contains(container)) return;
        if(container.querySelector(':scope > img.art-bg')) return;
        container.insertAdjacentHTML('afterbegin', '<img class="art-bg" src="'+u+'" alt="">');
        container.classList.add('has-art-bg');
      });
    }catch(e){}
  },
  img(id, cls, fallback){
    const u=this.cache[id];
    if(u) return '<img class="slot-art '+(cls||'')+'" src="'+u+'" alt="" draggable="false">';
    return fallback;
  },
  forget(id){ try{ delete this.cache[id]; }catch(e){} }
};
function renderArtStatus(){
  const box=$('art-status'); if(!box) return;
  box.innerHTML='';
  const note=document.createElement('div');
  note.className='parent-summary';
  note.textContent='The felt/sticker artwork is the finished art direction — nothing here is missing. These slots are an optional override: drop in a transparent PNG/WebP and it replaces the felt art for that slot instantly. The child never sees this panel.';
  box.appendChild(note);
  ART_SLOTS.forEach(s=>{
    const d=document.createElement('div'); d.className='qa-row qa-tall';
    const top=document.createElement('div'); top.className='qa-top';
    const lab=document.createElement('b'); lab.textContent=s.id;
    const st=document.createElement('span'); st.className='qa-st'; st.textContent='…';
    const prev=document.createElement('span'); prev.className='qa-prev';
    top.appendChild(lab); top.appendChild(prev); top.appendChild(st);
    const spec=document.createElement('div'); spec.className='qa-src'; spec.textContent=s.spec||'';
    const ctl=document.createElement('div'); ctl.className='qa-ctl';
    const up=document.createElement('label'); up.className='qa-file'; up.textContent='📁 Upload';
    const fi=document.createElement('input'); fi.type='file'; fi.accept='image/*'; fi.style.display='none';
    up.appendChild(fi);
    const rm=document.createElement('button'); rm.textContent='✕ Remove';
    ctl.appendChild(up); ctl.appendChild(rm);
    d.appendChild(top); d.appendChild(spec); d.appendChild(ctl);
    box.appendChild(d);
    const paint=(url)=>{
      if(url){ st.textContent='🖼️ illustrated ✓'; st.style.color='#16a34a'; prev.innerHTML='<img src="'+url+'" alt="">'; }
      else { st.textContent='⏳ temporary fallback'; st.style.color='#92400e'; prev.innerHTML=''; }
    };
    AssetDB.get(s.id).then(blob=>{
      if(blob){ try{ paint(URL.createObjectURL(blob)); return; }catch(e){} }
      Art.probeImg(['assets/'+s.id+'.webp','assets/'+s.id+'.png']).then(u=>paint(u));
    });
    fi.onchange=()=>{
      const f=fi.files&&fi.files[0]; if(!f) return;
      AssetDB.put(s.id, f).then(()=>{ Art.forget(s.id); renderArtStatus(); toast('Artwork applied! 🎨'); }).catch(()=>toast('Could not save that file.'));
      fi.value='';
    };
    rm.onclick=()=>{ AssetDB.del(s.id).then(()=>{ Art.forget(s.id); renderArtStatus(); }); };
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
  const appr=approvalCounts();
  const rows=[
    ['Sounds approved by you', appr.APPROVED+' / '+PHONEME_ORDER.length+(appr.UNREVIEWED?'  ('+appr.UNREVIEWED+' waiting)':'')],
    ['Sounds introduced to Layla', S.unlocked.length],
    ['Words decoded', S.wordsRead.length],
    ['Current focus', GU(S.currentFocus||'s')+' ('+(PHONEMES[S.currentFocus]?PHONEMES[S.currentFocus].cue:'')+')'],
    ['Reading streak', S.streak+' days'],
    ['Total reading minutes', S.minutes]
  ];
  rows.forEach(([k,v])=>{const d=document.createElement('div'); d.className='prog-row'; d.innerHTML='<span>'+k+'</span><b style="margin-left:auto">'+v+'</b>'; p.appendChild(d);});
  /* Only chart sounds Layla can actually meet: approved, or already
     introduced. Charting all 43 would bury the ones that matter. */
  const charted = PHONEME_ORDER.filter(id=>isPhonemeUsable(id) || S.unlocked.indexOf(id)>=0);
  charted.forEach(id=>{
    const m=S.mastery['sound:'+id];
    const sc=m?m.score:0;
    const d=document.createElement('div'); d.className='prog-row';
    d.innerHTML='<span>'+GU(id)+'</span><div class="prog-bar"><div class="prog-fill" style="width:'+Math.round(sc*100)+'%"></div></div><span>'+(S.unlocked.includes(id)?Math.round(sc*100)+'%':'🔒')+'</span>';
    p.appendChild(d);
  });
  const strong=charted.filter(id=>(S.mastery['sound:'+id]||{score:0}).score>0.6).map(x=>GU(x));
  renderParentWarning();
  try{ renderArtStatus(); }catch(e){}
  const weak=charted.filter(id=>S.unlocked.includes(id)&&(S.mastery['sound:'+id]||{score:0}).score<0.4).map(x=>GU(x));
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
  [['Unlock all approved sounds',()=>{S.unlocked=usablePhonemes(PHONEME_ORDER); if(S.unlocked.length) S.currentFocus=S.unlocked[0]; save(); toast(S.unlocked.length+' approved sounds unlocked.'); renderParent();}],
   ['Trigger blending 🎉',()=>{S.blendingUnlocked=true; save(); showMilestone('You read a word!','sat','You put the sounds together: s-a-t... sat!', {clip:'you-read-a-word'});}],
   ['Trigger sentence 📚',()=>{S.sentenceUnlocked=true; save(); showMilestone('LAYLA READ A SENTENCE!','Sam sat.','You read a whole sentence!', {clip:'sentence-win'});}],
   ['Unlock rewards 🎁',()=>{REWARDS.forEach(r=>{if(!S.rewards.includes(r.id))S.rewards.push(r.id)}); save(); toast('All treasures unlocked!');}],
   ['Jump: bubbles',()=>runSession('Test',[{title:'Bubbles',run:()=>Games.bubbles({})}],null)],
   ['Jump: rescue',()=>runSession('Test',[{title:'Rescue',run:()=>Games.rescue()}],null)],
   ['Jump: build word',()=>runSession('Test',[{title:'Build',run:()=>Games.buildWord()}],null)],
   ['Jump: story',()=>openStorybook()],
   ['Mute music',()=>{S.settings.music=0; save(); AudioSys.applyVolumes(); renderParent();}]
  ].forEach(([label,fn])=>{const b=document.createElement('button'); b.textContent=label; b.onclick=fn; tg.appendChild(b);});
  /* The sound library is the point of this screen, so build it every time. */
  try{ renderAudioQA(); }catch(e){}
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
  try{ if(typeof loadPhonemeManifest==='function') loadPhonemeManifest(); }catch(e){}
  // Dev screenshot hooks (?scene=kingdom|castle|stickers|parent|story&game=crystals&approve=1). Not linked in child UI.
  try{
    const QS = new URLSearchParams(location.search||'');
    /* Screenshot hook ONLY, and deliberately limited to the six starter
       sounds a human has already approved. It never touches a newly imported
       sound, and anything it marks is flagged dev:true so the review screen
       shows it as not-human-reviewed. */
    if(QS.get('approve')==='1'){
      STARTER_PHONEMES.forEach(id=>{ const a=approvalOf(id); if(a.st!=='APPROVED'){ a.st='APPROVED'; a.dev=true; } });
      save();
    }
    const sc = QS.get('scene'), gm = QS.get('game');
    if(gm && Games[gm]){ AudioSys.ensure(); runSession('Shot',[{title:gm, run:()=>Games[gm]({focus:'s'})}],null); return; }
    if(sc==='kingdom'){ showScreen('kingdom'); refreshKingdom(false); return; }
    if(sc==='castle'){ openCastle(); return; }
    if(sc==='stickers'){ showScreen('stickers'); refreshStickers(); return; }
    if(sc==='parent'){ showScreen('parent'); renderParent(); return; }
    if(sc==='story'){ openStorybook(); return; }
  }catch(e){}
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
