/* ============================================================
   PHONICS MODEL — phonemes, graphemes, progression.
   Single source of truth for BOTH the app (classic <script>) and the
   build-time importer (tools/import-phonics.cjs via require()).

   Design rule (per spec): the SOUND is the unit, not the letter.
   One phonemeId may be spelled by several graphemes:
       k   -> c, k, ck
       er  -> er, ir, ur
       ai  -> ai, ay, a-e
   ...and one grapheme may spell several phonemes:
       th  -> th_unvoiced (thin) AND th_voiced (this)
       oo  -> oo_short (book)   AND oo_long (moon)
   Nothing in this file asserts that an asset SOUNDS correct. Approval is
   a human act recorded in save state (see approvalOf / APPROVAL).
   ============================================================ */
'use strict';

/* Provider of the entire library. One coherent instructional source. */
const PHONICS_PROVIDER = {
  id: 's5s5-phonics',
  provider: 's5s5/phonics — instructional phonics recordings (native speaker)',
  author: 'Xiaochao Liu',
  license: 'MIT',
  licenseUrl: 'https://github.com/s5s5/phonics/blob/main/LICENSE',
  sourceUrl: 'https://github.com/s5s5/phonics',
  rawBase: 'https://raw.githubusercontent.com/s5s5/phonics/main/public/sound/',
  attribution: 'Phonics audio by Xiaochao Liu (s5s5/phonics), MIT License',
  redistribution: 'permitted (MIT — copy, modify, merge, publish, distribute, sublicense)',
  commercialUse: 'permitted (MIT)',
  attributionRequired: true,
  notes: 'Single speaker, single recording environment, purpose-recorded for phonics instruction. Chosen because it is the same source that produced the approved s/a/t/p/i/n assets.'
};

/* Approval states. Only APPROVED may enter child gameplay. */
const APPROVAL = { UNREVIEWED:'UNREVIEWED', APPROVED:'APPROVED', REJECTED:'REJECTED', MISSING:'MISSING' };

/* Teaching phases. A phase decides WHEN a sound is offered; approval — not
   phase — is what actually gates gameplay. */
const PHONICS_PHASES = [
  {id:'starter',  label:'Starter sounds',      note:'The approved baseline. Never re-imported.'},
  {id:'single-a', label:'Next single letters', note:'Completes the CVC decoding core.'},
  {id:'single-b', label:'Remaining letters',   note:'Finishes the alphabet.'},
  {id:'digraph',  label:'Consonant digraphs',  note:'Two letters, one sound.'},
  {id:'vowel',    label:'Vowel graphemes',     note:'Long vowels and r-controlled vowels.'}
];

/* src  = filename inside the provider's public/sound/ directory (IPA-named)
   file = filename we store under audio/phonemes/
   The six starter entries keep their ORIGINAL filenames and bytes. */
const PHONICS_CATALOG = [
  /* ---- PHASE: starter (LOCKED — already human-approved) ---- */
  {id:'s',       ipa:'s',      src:'s.mp3',      file:'s.mp3', phase:'starter', order:1, type:'consonant', graphemes:['s','ss'], word:'sun',   emoji:'☀️', cue:'ssss', target:'sustained /s/ as in sun', locked:true},
  {id:'a_short', ipa:'æ', src:'æ.mp3', file:'a.mp3', phase:'starter', order:2, type:'vowel',     graphemes:['a'],      word:'apple', emoji:'🍎', cue:'a as in apple', target:'short a as in sat', locked:true},
  {id:'t',       ipa:'t',      src:'t.mp3',      file:'t.mp3', phase:'starter', order:3, type:'consonant', graphemes:['t','tt'], word:'tap',   emoji:'👆', cue:'t', target:'brief /t/ — no added vowel', locked:true},
  {id:'p',       ipa:'p',      src:'p.mp3',      file:'p.mp3', phase:'starter', order:4, type:'consonant', graphemes:['p','pp'], word:'pan',   emoji:'🍳', cue:'p', target:'brief /p/ — no added vowel', locked:true},
  {id:'i_short', ipa:'ɪ', src:'ɪ.mp3', file:'i.mp3', phase:'starter', order:5, type:'vowel',     graphemes:['i'],      word:'igloo', emoji:'🧊', cue:'i as in igloo', target:'short i as in sit', locked:true},
  {id:'n',       ipa:'n',      src:'n.mp3',      file:'n.mp3', phase:'starter', order:6, type:'consonant', graphemes:['n','nn'], word:'net',   emoji:'🥅', cue:'nnn', target:'sustained /n/', locked:true},

  /* ---- PHASE: single-a (spec Phase A) ---- */
  {id:'m',       ipa:'m',      src:'m.mp3',      file:'m.mp3',       phase:'single-a', order:7,  type:'consonant', graphemes:['m','mm'],      word:'moon',  emoji:'🌙', cue:'mmmm', target:'sustained /m/'},
  {id:'d',       ipa:'d',      src:'d.mp3',      file:'d.mp3',       phase:'single-a', order:8,  type:'consonant', graphemes:['d','dd'],      word:'dog',   emoji:'🐶', cue:'d', target:'brief /d/ — no added vowel'},
  {id:'g',       ipa:'ɡ', src:'ɡ.mp3', file:'g.mp3',       phase:'single-a', order:9,  type:'consonant', graphemes:['g','gg'],      word:'gap',   emoji:'🕳️', cue:'g', target:'brief /g/ — no added vowel'},
  {id:'o_short', ipa:'ɑ', src:'ɑ.mp3', file:'o_short.mp3', phase:'single-a', order:10, type:'vowel',     graphemes:['o'],           word:'otter', emoji:'🦦', cue:'o as in otter', target:'short o as in hot'},
  {id:'k',       ipa:'k',      src:'k.mp3',      file:'k.mp3',       phase:'single-a', order:11, type:'consonant', graphemes:['c','k','ck'],  word:'cat',   emoji:'🐱', cue:'k', target:'brief /k/ as in cat, kite, duck'},
  {id:'e_short', ipa:'ɛ', src:'ɛ.mp3', file:'e_short.mp3', phase:'single-a', order:12, type:'vowel',     graphemes:['e'],           word:'egg',   emoji:'🥚', cue:'e as in egg', target:'short e as in bed'},
  {id:'r',       ipa:'ɹ', src:'ɹ.mp3', file:'r.mp3',       phase:'single-a', order:13, type:'consonant', graphemes:['r','rr'],      word:'rain',  emoji:'🌧️', cue:'rrr', target:'/r/ as in rain'},
  {id:'h',       ipa:'h',      src:'h.mp3',      file:'h.mp3',       phase:'single-a', order:14, type:'consonant', graphemes:['h'],           word:'hat',   emoji:'👒', cue:'h', target:'breathy /h/ as in hat'},
  {id:'b',       ipa:'b',      src:'b.mp3',      file:'b.mp3',       phase:'single-a', order:15, type:'consonant', graphemes:['b','bb'],      word:'bed',   emoji:'🛏️', cue:'b', target:'brief /b/ — no added vowel'},
  {id:'f',       ipa:'f',      src:'f.mp3',      file:'f.mp3',       phase:'single-a', order:16, type:'consonant', graphemes:['f','ff','ph'], word:'fan',   emoji:'🪭', cue:'ffff', target:'sustained /f/'},
  {id:'l',       ipa:'ɫ', src:'ɫ.mp3', file:'l.mp3',       phase:'single-a', order:17, type:'consonant', graphemes:['l','ll'],      word:'lion',  emoji:'🦁', cue:'llll', target:'sustained /l/'},
  {id:'u_short', ipa:'ə', src:'ə.mp3', file:'u_short.mp3', phase:'single-a', order:18, type:'vowel',     graphemes:['u'],           word:'up',    emoji:'⬆️', cue:'u as in up', target:'short u as in cup'},

  /* ---- PHASE: single-b (completes the alphabet) ---- */
  {id:'j', ipa:'dʒ', src:'dʒ.mp3', file:'j.mp3', phase:'single-b', order:19, type:'consonant', graphemes:['j','ge','dge'], word:'jam',   emoji:'🍓', cue:'j',   target:'/j/ as in jam'},
  {id:'v', ipa:'v',       src:'v.mp3',       file:'v.mp3', phase:'single-b', order:20, type:'consonant', graphemes:['v','ve'],       word:'van',   emoji:'🚐', cue:'vvv', target:'sustained /v/'},
  {id:'w', ipa:'w',       src:'w.mp3',       file:'w.mp3', phase:'single-b', order:21, type:'consonant', graphemes:['w'],            word:'wing',  emoji:'🪽', cue:'w',   target:'/w/ as in wing'},
  {id:'y', ipa:'j',       src:'j.mp3',       file:'y.mp3', phase:'single-b', order:22, type:'consonant', graphemes:['y'],            word:'yo-yo', emoji:'🪀', cue:'y',   target:'/y/ as in yes'},
  {id:'z', ipa:'z',       src:'z.mp3',       file:'z.mp3', phase:'single-b', order:23, type:'consonant', graphemes:['z','zz'],       word:'zip',   emoji:'🤐', cue:'zzz', target:'sustained /z/'},
  {id:'x', ipa:'ks',      src:'ks.mp3',      file:'x.mp3', phase:'single-b', order:24, type:'consonant', graphemes:['x'],            word:'fox',   emoji:'🦊', cue:'ks',  target:'/ks/ as in fox'},

  /* ---- PHASE: digraph ---- */
  {id:'sh', ipa:'ʃ',      src:'ʃ.mp3',      file:'sh.mp3', phase:'digraph', order:25, type:'digraph', graphemes:['sh'],        word:'ship',  emoji:'🚢', cue:'shhh', target:'sustained /sh/'},
  {id:'ch', ipa:'tʃ',     src:'tʃ.mp3',     file:'ch.mp3', phase:'digraph', order:26, type:'digraph', graphemes:['ch','tch'],  word:'chip',  emoji:'🥔', cue:'ch',   target:'/ch/ as in chip'},
  {id:'th_unvoiced', ipa:'θ', src:'θ.mp3', file:'th_unvoiced.mp3', phase:'digraph', order:27, type:'digraph', graphemes:['th'], word:'thumb', emoji:'👍', cue:'th (quiet)', target:'UNVOICED /th/ as in thumb — no buzz in the throat'},
  {id:'th_voiced',   ipa:'ð', src:'ð.mp3', file:'th_voiced.mp3',   phase:'digraph', order:28, type:'digraph', graphemes:['th'], word:'this',  emoji:'👉', cue:'th (buzzy)', target:'VOICED /th/ as in this — buzzy'},
  {id:'ng', ipa:'ŋ', src:'ŋ.mp3', file:'ng.mp3', phase:'digraph', order:29, type:'digraph', graphemes:['ng'],  word:'ring',  emoji:'💍', cue:'ng', target:'/ng/ as in ring'},
  {id:'qu', ipa:'kw',     src:'kw.mp3',     file:'qu.mp3', phase:'digraph', order:30, type:'digraph', graphemes:['qu'],  word:'queen', emoji:'👑', cue:'kw', target:'/kw/ as in queen'},

  /* ---- PHASE: vowel graphemes ---- */
  {id:'ai',  ipa:'eɪ',      src:'eɪ.mp3',      file:'ai.mp3',       phase:'vowel', order:31, type:'vowel-team', graphemes:['ai','ay','a-e'],      word:'rain',  emoji:'🌧️', cue:'ay',  target:'long a as in rain'},
  {id:'ee',  ipa:'iː',      src:'i.mp3',            file:'ee.mp3',       phase:'vowel', order:32, type:'vowel-team', graphemes:['ee','ea','e-e'],      word:'bee',   emoji:'🐝', cue:'ee',  target:'long e as in bee'},
  {id:'igh', ipa:'aɪ',      src:'aɪ.mp3',      file:'igh.mp3',      phase:'vowel', order:33, type:'vowel-team', graphemes:['igh','ie','i-e','y'], word:'light', emoji:'💡', cue:'igh', target:'long i as in light'},
  {id:'oa',  ipa:'oʊ',      src:'oʊ.mp3',      file:'oa.mp3',       phase:'vowel', order:34, type:'vowel-team', graphemes:['oa','ow','o-e'],      word:'boat',  emoji:'⛵', cue:'oa', target:'long o as in boat'},
  {id:'oo_short', ipa:'ʊ',  src:'ʊ.mp3',       file:'oo_short.mp3', phase:'vowel', order:35, type:'vowel-team', graphemes:['oo','u'],             word:'book',  emoji:'📖', cue:'oo (short)', target:'SHORT oo as in book — NOT moon'},
  {id:'oo_long',  ipa:'uː', src:'u.mp3',            file:'oo_long.mp3',  phase:'vowel', order:36, type:'vowel-team', graphemes:['oo','ue','u-e'],      word:'moon',  emoji:'🌙', cue:'oo (long)',  target:'LONG oo as in moon — NOT book'},
  {id:'ar',  ipa:'ɑɹ', src:'ɑɹ.mp3', file:'ar.mp3',       phase:'vowel', order:37, type:'vowel-team', graphemes:['ar'],                 word:'star',  emoji:'⭐', cue:'ar', target:'r-controlled /ar/ as in star'},
  {id:'or',  ipa:'ɔɹ', src:'ɔɹ.mp3', file:'or.mp3',       phase:'vowel', order:38, type:'vowel-team', graphemes:['or','ore','oar'],     word:'horn',  emoji:'📯', cue:'or', target:'r-controlled /or/ as in horn'},
  /* er / ir / ur are ONE sound with three spellings. Deliberately one
     phonemeId: the spec asks for phoneme-first modelling, and the provider
     ships a single recording for it. */
  {id:'er',  ipa:'ɝ',       src:'ɝ.mp3',       file:'er.mp3',       phase:'vowel', order:39, type:'vowel-team', graphemes:['er','ir','ur'],       word:'bird',  emoji:'🐦', cue:'er', target:'r-controlled /er/ — spelled er, ir or ur'},
  {id:'ow',  ipa:'aʊ',      src:'aʊ.mp3',      file:'ow.mp3',       phase:'vowel', order:40, type:'vowel-team', graphemes:['ow','ou'],            word:'cow',   emoji:'🐄', cue:'ow', target:'/ow/ as in cow'},
  {id:'oi',  ipa:'ɔɪ', src:'ɔɪ.mp3', file:'oi.mp3',       phase:'vowel', order:41, type:'vowel-team', graphemes:['oi','oy'],            word:'coin',  emoji:'🪙', cue:'oi', target:'/oi/ as in coin'},
  {id:'ear', ipa:'ɪɹ', src:'ɪɹ.mp3', file:'ear.mp3',      phase:'vowel', order:42, type:'vowel-team', graphemes:['ear','eer'],          word:'deer',  emoji:'🦌', cue:'ear', target:'/ear/ as in deer'},
  {id:'air', ipa:'ɛɹ', src:'ɛɹ.mp3', file:'air.mp3',      phase:'vowel', order:43, type:'vowel-team', graphemes:['air','are'],          word:'chair', emoji:'🪑', cue:'air', target:'/air/ as in chair'}
];

/* Old save states (and the previous code) used bare letters as phoneme ids.
   Migration map: legacy id -> current phonemeId. */
const PHONEME_ID_ALIASES = {a:'a_short', i:'i_short', o:'o_short', e:'e_short', u:'u_short', c:'k'};

/* Letters in Layla's name. Name RECOGNITION only — deliberately NOT the same
   concept as phoneme mastery, and it unlocks nothing for decoding. */
const NAME_LETTERS = ['l','a','y'];

const Phonics = {
  catalog: PHONICS_CATALOG,
  provider: PHONICS_PROVIDER,
  phases: PHONICS_PHASES,
  byId: PHONICS_CATALOG.reduce(function(m,p){ m[p.id]=p; return m; }, {}),
  /* Resolve a legacy or current id to a current phonemeId, or null. */
  resolve: function(id){
    if(id==null) return null;
    if(this.byId[id]) return id;
    var a = PHONEME_ID_ALIASES[id];
    return (a && this.byId[a]) ? a : null;
  },
  /* Every phonemeId a grapheme can spell (e.g. 'th' -> two sounds). */
  soundsFor: function(grapheme){
    return PHONICS_CATALOG.filter(function(p){ return p.graphemes.indexOf(grapheme)>=0; })
                          .map(function(p){ return p.id; });
  },
  /* The grapheme shown to the child for a sound; first is the default. */
  primaryGrapheme: function(id){
    var p = this.byId[this.resolve(id)];
    return p ? p.graphemes[0] : String(id);
  },
  ordered: function(){ return PHONICS_CATALOG.slice().sort(function(a,b){ return a.order-b.order; }); },
  inPhase: function(phase){ return PHONICS_CATALOG.filter(function(p){ return p.phase===phase; }); },
  ids: function(){ return PHONICS_CATALOG.map(function(p){ return p.id; }); }
};

if(typeof module!=='undefined' && module.exports){
  module.exports = {PHONICS_CATALOG, PHONICS_PROVIDER, PHONICS_PHASES, PHONEME_ID_ALIASES, NAME_LETTERS, APPROVAL, Phonics};
}
