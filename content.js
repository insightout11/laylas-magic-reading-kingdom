/* ============================================================
   CONTENT + DECODABILITY ENGINE
   Loaded after phonics.js, before app.js.

   THE ONE RULE THIS FILE ENFORCES
   Layla is never shown a word she cannot sound out. A word is readable
   only when every sound in it is BOTH approved by a parent AND already
   introduced to her. Sentences are readable only when every word is;
   stories only when every sentence is. Nothing downstream — no game, no
   story page, no praise example — is allowed to guess at this.

   Words carry two parallel layers, same as in phonics.js:
       ph[]  the SOUNDS, in order, used for blending audio
       gr[]  the LETTERS she sees, aligned 1:1 with ph[]
   So 'cat' is three sounds (k, a_short, t) spelled c-a-t, and 'ship' is
   three sounds (sh, i_short, p) spelled sh-i-p.

   HEART WORDS are the small set of high-frequency words that are not yet
   fully decodable ("a", "the"). They are gated differently: not on their
   phonemes, but on having been explicitly introduced. tricky[] marks which
   grapheme index is the part you "learn by heart" rather than sound out.

   audio:true means audio/words/<word>.mp3 exists. Blending games prefer
   those so the whole-word playback after the blend is a real recording.
   ============================================================ */
'use strict';

/* ---------------- HEART WORDS ---------------------------------------
   Deliberately tiny. Added only because sentences are lifeless without
   them. Each is introduced explicitly, never silently dropped into text. */
const HEART_WORDS = [
  {t:'a',   ph:['u_short'],            gr:['a'],        tricky:[0], heart:true, audio:false,
   note:'Says "uh" here, not its letter name.'},
  {t:'the', ph:['th_voiced','u_short'],gr:['th','e'],   tricky:[1], heart:true, audio:false,
   note:'The e says "uh".'},
  {t:'I',   ph:['igh'],                gr:['I'],        tricky:[0], heart:true, audio:false, proper:true,
   note:'One letter, says its own name.'},
  {t:'is',  ph:['i_short','z'],        gr:['i','s'],    tricky:[1], heart:true, audio:false,
   note:'The s buzzes like a z.'},
  {t:'to',  ph:['t','oo_long'],        gr:['t','o'],    tricky:[1], heart:true, audio:false,
   note:'The o says "oo".'},
  {t:'my',  ph:['m','igh'],            gr:['m','y'],    tricky:[1], heart:true, audio:false,
   note:'The y says "eye".'}
];

/* ---------------- DECODABLE WORD BANK --------------------------------
   Ordered roughly by the phonics phase that unlocks each one. Every entry
   is fully decodable: no silent letters, no irregular parts.
   `audio:true` = a recorded whole-word file already exists. */
const WORDS = [
  /* --- readable with the starter six (s a t p i n) --- */
  {t:'at',   ph:['a_short','t'],            gr:['a','t'],       emoji:'📍', art:'at',   audio:true},
  {t:'it',   ph:['i_short','t'],            gr:['i','t'],       emoji:'✨', art:'it',   audio:true},
  {t:'in',   ph:['i_short','n'],            gr:['i','n'],       emoji:'📥', art:'in',   audio:true},
  {t:'sat',  ph:['s','a_short','t'],        gr:['s','a','t'],   emoji:'🪑', art:'sat',  audio:true},
  {t:'pat',  ph:['p','a_short','t'],        gr:['p','a','t'],   emoji:'👋', art:'pat',  audio:true},
  {t:'tap',  ph:['t','a_short','p'],        gr:['t','a','p'],   emoji:'🚰', art:'tap',  audio:true},
  {t:'pan',  ph:['p','a_short','n'],        gr:['p','a','n'],   emoji:'🍳', art:'pan',  audio:true},
  {t:'sit',  ph:['s','i_short','t'],        gr:['s','i','t'],   emoji:'🪑', art:'sit',  audio:true},
  {t:'sip',  ph:['s','i_short','p'],        gr:['s','i','p'],   emoji:'🥤', art:'sip',  audio:true},
  {t:'tip',  ph:['t','i_short','p'],        gr:['t','i','p'],   emoji:'👆', art:'tip',  audio:true},
  {t:'tin',  ph:['t','i_short','n'],        gr:['t','i','n'],   emoji:'🥫', art:'tin',  audio:true},
  {t:'pin',  ph:['p','i_short','n'],        gr:['p','i','n'],   emoji:'📌', art:'pin',  audio:true},
  {t:'nap',  ph:['n','a_short','p'],        gr:['n','a','p'],   emoji:'😴', art:'nap',  audio:false},

  /* --- + m --- */
  {t:'am',   ph:['a_short','m'],            gr:['a','m'],       emoji:'💖', art:'am',   audio:true},
  {t:'mat',  ph:['m','a_short','t'],        gr:['m','a','t'],   emoji:'🧶', art:'mat',  audio:true},
  {t:'map',  ph:['m','a_short','p'],        gr:['m','a','p'],   emoji:'🗺️', art:'map',  audio:true},
  {t:'man',  ph:['m','a_short','n'],        gr:['m','a','n'],   emoji:'🤴', art:'man',  audio:true},
  {t:'Sam',  ph:['s','a_short','m'],        gr:['S','a','m'],   emoji:'👦', art:'sam',  audio:true, proper:true},

  /* --- + d, g, o, c/k --- */
  {t:'on',   ph:['o_short','n'],            gr:['o','n'],       emoji:'🔛', art:'on',   audio:true},
  {t:'cat',  ph:['k','a_short','t'],        gr:['c','a','t'],   emoji:'🐱', art:'cat',  audio:true},
  {t:'can',  ph:['k','a_short','n'],        gr:['c','a','n'],   emoji:'🥫', art:'can',  audio:true},
  {t:'cap',  ph:['k','a_short','p'],        gr:['c','a','p'],   emoji:'🧢', art:'cap',  audio:true},
  {t:'dog',  ph:['d','o_short','g'],        gr:['d','o','g'],   emoji:'🐶', art:'dog',  audio:true},
  {t:'mop',  ph:['m','o_short','p'],        gr:['m','o','p'],   emoji:'🧹', art:'mop',  audio:true},
  {t:'pot',  ph:['p','o_short','t'],        gr:['p','o','t'],   emoji:'🍲', art:'pot',  audio:true},
  {t:'gap',  ph:['g','a_short','p'],        gr:['g','a','p'],   emoji:'🕳️', art:'gap',  audio:true},
  {t:'dot',  ph:['d','o_short','t'],        gr:['d','o','t'],   emoji:'⚫', art:'dot',  audio:false},
  {t:'cot',  ph:['k','o_short','t'],        gr:['c','o','t'],   emoji:'🛏️', art:'cot',  audio:false},
  {t:'dad',  ph:['d','a_short','d'],        gr:['d','a','d'],   emoji:'👨', art:'dad',  audio:false},
  {t:'mad',  ph:['m','a_short','d'],        gr:['m','a','d'],   emoji:'😠', art:'mad',  audio:false},
  {t:'sad',  ph:['s','a_short','d'],        gr:['s','a','d'],   emoji:'😢', art:'sad',  audio:false},
  {t:'top',  ph:['t','o_short','p'],        gr:['t','o','p'],   emoji:'🔝', art:'top',  audio:false},
  {t:'pig',  ph:['p','i_short','g'],        gr:['p','i','g'],   emoji:'🐷', art:'pig',  audio:false},
  {t:'dig',  ph:['d','i_short','g'],        gr:['d','i','g'],   emoji:'⛏️', art:'dig',  audio:false},
  {t:'kit',  ph:['k','i_short','t'],        gr:['k','i','t'],   emoji:'🎒', art:'kit',  audio:false},

  /* --- + e, r, h, b, f, l, u --- */
  {t:'sun',  ph:['s','u_short','n'],        gr:['s','u','n'],   emoji:'☀️', art:'sun',  audio:true},
  {t:'net',  ph:['n','e_short','t'],        gr:['n','e','t'],   emoji:'🥅', art:'net',  audio:true},
  {t:'bed',  ph:['b','e_short','d'],        gr:['b','e','d'],   emoji:'🛏️', art:'bed',  audio:false},
  {t:'hen',  ph:['h','e_short','n'],        gr:['h','e','n'],   emoji:'🐔', art:'hen',  audio:false},
  {t:'red',  ph:['r','e_short','d'],        gr:['r','e','d'],   emoji:'🔴', art:'red',  audio:false},
  {t:'ten',  ph:['t','e_short','n'],        gr:['t','e','n'],   emoji:'🔟', art:'ten',  audio:false},
  {t:'pet',  ph:['p','e_short','t'],        gr:['p','e','t'],   emoji:'🐾', art:'pet',  audio:false},
  {t:'hat',  ph:['h','a_short','t'],        gr:['h','a','t'],   emoji:'👒', art:'hat',  audio:false},
  {t:'bat',  ph:['b','a_short','t'],        gr:['b','a','t'],   emoji:'🦇', art:'bat',  audio:false},
  {t:'bag',  ph:['b','a_short','g'],        gr:['b','a','g'],   emoji:'👜', art:'bag',  audio:false},
  {t:'fan',  ph:['f','a_short','n'],        gr:['f','a','n'],   emoji:'🪭', art:'fan',  audio:false},
  {t:'log',  ph:['l','o_short','g'],        gr:['l','o','g'],   emoji:'🪵', art:'log',  audio:false},
  {t:'leg',  ph:['l','e_short','g'],        gr:['l','e','g'],   emoji:'🦵', art:'leg',  audio:false},
  {t:'lip',  ph:['l','i_short','p'],        gr:['l','i','p'],   emoji:'👄', art:'lip',  audio:false},
  {t:'bug',  ph:['b','u_short','g'],        gr:['b','u','g'],   emoji:'🐛', art:'bug',  audio:false},
  {t:'rug',  ph:['r','u_short','g'],        gr:['r','u','g'],   emoji:'🧶', art:'rug',  audio:false},
  {t:'hug',  ph:['h','u_short','g'],        gr:['h','u','g'],   emoji:'🤗', art:'hug',  audio:false},
  {t:'cup',  ph:['k','u_short','p'],        gr:['c','u','p'],   emoji:'🥤', art:'cup',  audio:false},
  {t:'bun',  ph:['b','u_short','n'],        gr:['b','u','n'],   emoji:'🍞', art:'bun',  audio:false},
  {t:'run',  ph:['r','u_short','n'],        gr:['r','u','n'],   emoji:'🏃', art:'run',  audio:false},
  {t:'fun',  ph:['f','u_short','n'],        gr:['f','u','n'],   emoji:'🎉', art:'fun',  audio:false},
  {t:'rat',  ph:['r','a_short','t'],        gr:['r','a','t'],   emoji:'🐀', art:'rat',  audio:false},

  /* --- digraphs --- */
  {t:'ship', ph:['sh','i_short','p'],       gr:['sh','i','p'],  emoji:'🚢', art:'ship', audio:false},
  {t:'shop', ph:['sh','o_short','p'],       gr:['sh','o','p'],  emoji:'🏪', art:'shop', audio:false},
  {t:'fish', ph:['f','i_short','sh'],       gr:['f','i','sh'],  emoji:'🐟', art:'fish', audio:false},
  {t:'chip', ph:['ch','i_short','p'],       gr:['ch','i','p'],  emoji:'🥔', art:'chip', audio:false},
  {t:'chat', ph:['ch','a_short','t'],       gr:['ch','a','t'],  emoji:'💬', art:'chat', audio:false},
  {t:'thin', ph:['th_unvoiced','i_short','n'], gr:['th','i','n'], emoji:'📏', art:'thin', audio:false},
  {t:'ring', ph:['r','i_short','ng'],       gr:['r','i','ng'],  emoji:'💍', art:'ring', audio:false},
  {t:'king', ph:['k','i_short','ng'],       gr:['k','i','ng'],  emoji:'🤴', art:'king', audio:false},
  {t:'sock', ph:['s','o_short','k'],        gr:['s','o','ck'],  emoji:'🧦', art:'sock', audio:false},
  {t:'duck', ph:['d','u_short','k'],        gr:['d','u','ck'],  emoji:'🦆', art:'duck', audio:false},
  {t:'quit', ph:['qu','i_short','t'],       gr:['qu','i','t'],  emoji:'🛑', art:'quit', audio:false},

  /* --- vowel graphemes --- */
  {t:'moon', ph:['m','oo_long','n'],        gr:['m','oo','n'],  emoji:'🌙', art:'moon', audio:true},
  {t:'rain', ph:['r','ai','n'],             gr:['r','ai','n'],  emoji:'🌧️', art:'rain', audio:false},
  {t:'tail', ph:['t','ai','l'],             gr:['t','ai','l'],  emoji:'🐈', art:'tail', audio:false},
  {t:'feet', ph:['f','ee','t'],             gr:['f','ee','t'],  emoji:'🦶', art:'feet', audio:false},
  {t:'boat', ph:['b','oa','t'],             gr:['b','oa','t'],  emoji:'⛵', art:'boat', audio:false},
  {t:'book', ph:['b','oo_short','k'],       gr:['b','oo','k'],  emoji:'📖', art:'book', audio:false},
  {t:'star', ph:['s','t','ar'],             gr:['s','t','ar'],  emoji:'⭐', art:'star', audio:false},
  {t:'horn', ph:['h','or','n'],             gr:['h','or','n'],  emoji:'📯', art:'horn', audio:false},
  {t:'bird', ph:['b','er','d'],             gr:['b','ir','d'],  emoji:'🐦', art:'bird', audio:false},
  {t:'cow',  ph:['k','ow'],                 gr:['c','ow'],      emoji:'🐄', art:'cow',  audio:false},
  {t:'coin', ph:['k','oi','n'],             gr:['c','oi','n'],  emoji:'🪙', art:'coin', audio:false},
  {t:'hair', ph:['h','air'],                gr:['h','air'],     emoji:'💇', art:'hair', audio:false},
  {t:'deer', ph:['d','ear'],                gr:['d','eer'],     emoji:'🦌', art:'deer', audio:false}
];

/* ---------------- SENTENCES -----------------------------------------
   Each is a list of tokens. A token is a word from WORDS or HEART_WORDS.
   Kept short and genuinely readable; theme never overrides decodability. */
const SENTENCES = [
  {id:'s1',  w:['Sam','sat'],                  art:'👦', scene:'cottage'},
  {id:'s2',  w:['a','cat','sat'],              art:'🐱', scene:'cottage'},
  {id:'s3',  w:['Sam','sat','on','a','mat'],   art:'🧶', scene:'cottage'},
  {id:'s4',  w:['a','cat','sat','on','a','mat'], art:'🐱', scene:'cottage'},
  {id:'s5',  w:['a','cat','can','nap'],        art:'😴', scene:'cottage'},
  {id:'s6',  w:['the','cat','is','sad'],       art:'😢', scene:'cottage'},
  {id:'s7',  w:['I','can','pat','the','cat'],  art:'👋', scene:'cottage'},
  {id:'s8',  w:['the','dog','sat','on','the','rug'], art:'🐶', scene:'cottage'},
  {id:'s9',  w:['a','pig','can','dig'],        art:'🐷', scene:'meadow'},
  {id:'s10', w:['the','hen','is','red'],       art:'🐔', scene:'meadow'},
  {id:'s11', w:['I','can','hug','my','cat'],   art:'🤗', scene:'cottage'},
  {id:'s12', w:['the','fish','is','in','the','net'], art:'🐟', scene:'meadow'},
  {id:'s13', w:['a','ship','can','tip'],       art:'🚢', scene:'meadow'},
  {id:'s14', w:['the','moon','is','in','the','sky'], art:'🌙', scene:'sky', needs:['oo_long']}
];

/* ---------------- STORIES --------------------------------------------
   3-5 pages, one sentence per page. A story is offered only when EVERY
   page is readable, so finishing one is always a real reading act. */
const STORIES = [
  {id:'st1', title:'The Cat on the Mat', art:'🐱',
   pages:['s1','s2','s3','s4'],
   reward:'pet-white'},
  {id:'st2', title:'Sad Cat, Glad Cat', art:'💖',
   pages:['s6','s7','s11'],
   reward:'dress-lilac'},
  {id:'st3', title:'The Dog and the Rug', art:'🐶',
   pages:['s8','s9','s10'],
   reward:'decor-painting'}
];

/* ---------------- RHYME + SYLLABLE DATA ------------------------------
   Used by Ballet Stage and Fairy Garden. Rhyme families reference words
   in the bank, so a rhyme round is still gated on decodability. */
const RHYME_FAMILIES = [
  {rime:'at',  words:['cat','sat','mat','pat','hat','bat','rat']},
  {rime:'ap',  words:['tap','map','cap','gap','nap']},
  {rime:'in',  words:['pin','tin','in','win']},
  {rime:'ig',  words:['pig','dig','big']},
  {rime:'og',  words:['dog','log']},
  {rime:'ug',  words:['bug','rug','hug']},
  {rime:'un',  words:['sun','bun','run','fun']},
  {rime:'ed',  words:['bed','red']},
  {rime:'op',  words:['mop','top','shop']},
  {rime:'ot',  words:['pot','dot','cot']}
];
/* Spoken-only words for syllable clapping. These are HEARD, never read,
   so they are exempt from decodability — they exercise the ear, not the eye. */
const SYLLABLE_WORDS = [
  {t:'cat', n:1, emoji:'🐱'},      {t:'kitten', n:2, emoji:'🐈'},
  {t:'rainbow', n:2, emoji:'🌈'},  {t:'princess', n:2, emoji:'👸'},
  {t:'unicorn', n:3, emoji:'🦄'},  {t:'ballet', n:2, emoji:'🩰'},
  {t:'castle', n:2, emoji:'🏰'},   {t:'butterfly', n:3, emoji:'🦋'},
  {t:'star', n:1, emoji:'⭐'},     {t:'flower', n:2, emoji:'🌸'},
  {t:'crown', n:1, emoji:'👑'},    {t:'magical', n:3, emoji:'✨'}
];

/* ============================================================
   THE ENGINE
   Everything child-facing asks these questions and nothing else.
   ============================================================ */
const Reading = {
  /* Every word the app knows, decodable and heart alike. */
  all: function(){ return WORDS.concat(HEART_WORDS); },
  byText: function(t){
    const all=this.all();
    for(let i=0;i<all.length;i++) if(all[i].t===t) return all[i];
    return null;
  },

  /* A sound counts only when a parent APPROVED it and the app has
     INTRODUCED it. Approval alone is not permission to use it. */
  soundReady: function(id){
    return (typeof isPhonemeUsable==='function' ? isPhonemeUsable(id) : false)
        && (S.unlocked || []).indexOf(id) >= 0;
  },

  /* Heart words are gated on being taught, not on their phonemes —
     that is what makes them heart words. */
  heartReady: function(t){ return (S.heartWords || []).indexOf(t) >= 0; },

  wordReadable: function(w){
    if(!w) return false;
    if(w.heart) return this.heartReady(w.t);
    for(let i=0;i<w.ph.length;i++) if(!this.soundReady(w.ph[i])) return false;
    return true;
  },
  /* Which sounds in this word Layla is still missing — powers the parent
     view and decides which heart word to introduce next. */
  missingSounds: function(w){
    if(!w || w.heart) return [];
    const out=[];
    w.ph.forEach(p=>{ if(!this.soundReady(p) && out.indexOf(p)<0) out.push(p); });
    return out;
  },

  readableWords: function(opts){
    opts = opts || {};
    const self=this;
    let list = WORDS.filter(function(w){ return self.wordReadable(w); });
    if(opts.audioOnly) list = list.filter(function(w){ return w.audio; });
    if(opts.length) list = list.filter(function(w){ return w.ph.length===opts.length; });
    return list;
  },

  /* --- sentences --- */
  sentenceWords: function(sent){
    const self=this;
    return sent.w.map(function(t){ return self.byText(t); });
  },
  sentenceReadable: function(sent){
    const ws=this.sentenceWords(sent);
    for(let i=0;i<ws.length;i++) if(!this.wordReadable(ws[i])) return false;
    return true;
  },
  readableSentences: function(){
    const self=this;
    return SENTENCES.filter(function(s){ return self.sentenceReadable(s); });
  },
  sentenceText: function(sent){
    return sent.w.join(' ').replace(/^./, function(c){ return c.toUpperCase(); }) + '.';
  },

  /* --- stories --- */
  storyPages: function(story){
    return story.pages.map(function(id){
      for(let i=0;i<SENTENCES.length;i++) if(SENTENCES[i].id===id) return SENTENCES[i];
      return null;
    }).filter(Boolean);
  },
  storyReadable: function(story){
    const ps=this.storyPages(story);
    if(ps.length !== story.pages.length) return false;
    for(let i=0;i<ps.length;i++) if(!this.sentenceReadable(ps[i])) return false;
    return true;
  },
  readableStories: function(){
    const self=this;
    return STORIES.filter(function(s){ return self.storyReadable(s); });
  },

  /* The next heart word worth teaching: the one that unblocks the most
     sentences Layla could otherwise almost read. */
  nextHeartWord: function(){
    const self=this;
    const untaught = HEART_WORDS.filter(function(h){ return !self.heartReady(h.t); });
    if(!untaught.length) return null;
    let best=null, bestScore=-1;
    untaught.forEach(function(h){
      let score=0;
      SENTENCES.forEach(function(sent){
        if(sent.w.indexOf(h.t) < 0) return;
        /* would this sentence become readable if we taught just this word? */
        const blockers = self.sentenceWords(sent).filter(function(w){
          return w && !self.wordReadable(w) && w.t !== h.t;
        });
        if(!blockers.length) score++;
      });
      if(score > bestScore){ bestScore=score; best=h; }
    });
    return bestScore > 0 ? best : null;
  },

  /* --- rhyme --- */
  rhymesFor: function(word){
    const self=this;
    for(let i=0;i<RHYME_FAMILIES.length;i++){
      const f=RHYME_FAMILIES[i];
      if(f.words.indexOf(word) >= 0){
        return f.words.filter(function(w){
          return w!==word && self.wordReadable(self.byText(w));
        });
      }
    }
    return [];
  },
  /* A readable word that does NOT rhyme with `word` — the odd one out. */
  nonRhymeFor: function(word){
    const self=this;
    const rhymes=this.rhymesFor(word).concat([word]);
    const pool=this.readableWords().filter(function(w){ return rhymes.indexOf(w.t) < 0; });
    return pool.length ? pool[Math.floor(Math.random()*pool.length)] : null;
  },
  rhymeRound: function(){
    const self=this;
    const usable = RHYME_FAMILIES.filter(function(f){
      return f.words.filter(function(w){ return self.wordReadable(self.byText(w)); }).length >= 2;
    });
    if(!usable.length) return null;
    const fam = usable[Math.floor(Math.random()*usable.length)];
    const inFam = fam.words.filter(function(w){ return self.wordReadable(self.byText(w)); });
    const target = inFam[0], match = inFam[1];
    const odd = this.nonRhymeFor(target);
    if(!odd) return null;
    return {target:this.byText(target), match:this.byText(match), odd:odd};
  }
};

if(typeof module!=='undefined' && module.exports){
  module.exports = {WORDS, HEART_WORDS, SENTENCES, STORIES, RHYME_FAMILIES, SYLLABLE_WORDS, Reading};
}
