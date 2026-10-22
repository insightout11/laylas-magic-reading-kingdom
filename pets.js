/* ============================================================
   MAGIC PETS — eggs that hatch from reading, pets that grow up, and a
   garden to keep them in. Loaded after progress.js.

   The loop, in one breath:
     every finished activity warms the egg in the nest and gives the
     youngest pet a heart; a warm egg hatches at the end of a session;
     stars buy treats that help pets grow; daily and encore chests bring
     garden treasures. There are 12 kinds of pet in 3 colours, plus a
     golden version of each — 48 to collect before anything repeats.

   Rules kept from the rest of the app:
   - nothing here touches phonics, approvals or mastery;
   - everything spoken is a whole sentence, never a letter name;
   - all art is felt (feltkit.js), drawn in code, no image files.
   ============================================================ */
'use strict';

/* ---------------- species ------------------------------------------------
   colors: [body, accent] per variant. Order is the hatch order, so the
   first eggs are the ones a four-year-old most wants. */
const PET_SPECIES = [
  {id:'unicorn', name:'unicorn', ears:'pony',  tail:'mane', extra:'horn',   colors:[['#FFFDF8','#BCA3EE'],['#FCCFE0','#8FCEEC'],['#CDE9F8','#F7A6C4']]},
  {id:'kitten',  name:'kitten',  ears:'cat',   tail:'curl', extra:'whisk',  colors:[['#FFE9CE','#F7A6C4'],['#DED0FA','#9670D9'],['#FFB98D','#FFE9CE']]},
  {id:'bunny',   name:'bunny',   ears:'bunny', tail:'puff', extra:'teeth',  colors:[['#FFFDF8','#FCCFE0'],['#CDE9F8','#F7A6C4'],['#FBD881','#FFB98D']]},
  {id:'dragon',  name:'dragon',  ears:'horns', tail:'dragon',extra:'wings', colors:[['#7ECFAB','#FBD881'],['#BCA3EE','#FCCFE0'],['#F7A6C4','#FBD881']]},
  {id:'puppy',   name:'puppy',   ears:'flop',  tail:'wag',  extra:'muzzle', colors:[['#D49A6A','#AE744A'],['#FFE9CE','#D49A6A'],['#FCCFE0','#DE749C']]},
  {id:'pegasus', name:'flying pony', ears:'pony', tail:'mane', extra:'feathers', colors:[['#FFFDF8','#F7A6C4'],['#DED0FA','#FBD881'],['#CDE9F8','#BCA3EE']]},
  {id:'fox',     name:'fox',     ears:'fox',   tail:'fluff',extra:'muzzle', colors:[['#FFB98D','#FFFDF8'],['#BCA3EE','#FFFDF8'],['#8FCEEC','#FFFDF8']]},
  {id:'panda',   name:'panda',   ears:'round', tail:'puff', extra:'patches',colors:[['#FFFDF8','#6E4E7C'],['#FCCFE0','#6E4E7C'],['#CDE9F8','#9670D9']]},
  {id:'owl',     name:'owl',     ears:'tufts', tail:'none', extra:'beak',   colors:[['#D49A6A','#FFE9CE'],['#BCA3EE','#DED0FA'],['#8FCEEC','#CDE9F8']]},
  {id:'bear',    name:'teddy bear', ears:'round', tail:'puff', extra:'muzzle', colors:[['#D49A6A','#FFE9CE'],['#F7A6C4','#FCCFE0'],['#FBD881','#FFE9CE']]},
  {id:'duck',    name:'duckling',ears:'tuft',  tail:'none', extra:'bill',   colors:[['#FBD881','#FFB98D'],['#FFFDF8','#FFB98D'],['#FCCFE0','#FFB98D']]},
  {id:'mouse',   name:'mouse',   ears:'mouse', tail:'string',extra:'whisk', colors:[['#D9D2E3','#F7A6C4'],['#FFE9CE','#F7A6C4'],['#7ECFAB','#FCCFE0']]}
];
const PET_GOLD = ['#FBD881','#EDB63E'];
const PET_NAMES = ['Sparkle','Biscuit','Poppy','Bubbles','Clover','Mochi','Pebble','Daisy','Peaches',
  'Marshmallow','Cupcake','Buttons','Snowball','Jellybean','Cocoa','Honey','Maple','Luna','Rosie',
  'Bluebell','Muffin','Noodle','Pudding','Sunny','Willow','Pancake','Tulip','Fizz','Glimmer','Hazel',
  'Kiwi','Lolly','Minty','Nutmeg','Opal','Pickle','Toffee','Velvet','Waffles','Yoyo','Zuzu','Blossom',
  'Coco','Dotty','Frosty','Ivy','Jazzy','Lulu','Misty','Nova','Olive','Peanut','Ruby','Sugar',
  'Snuggles','Petal','Sprinkles','Wiggles','Gumdrop','Bramble'];
const PET_STAGE_NAMES = ['baby','little','grown-up'];

/* ---------------- garden treasures -------------------------------------
   Won from daily and encore chests. Each has a fixed spot in the garden
   (x%, y%) so the garden fills in like a picture, never a pile. */
const GARDEN_ITEMS = [
  {id:'g-tulips',   e:'🌷', n:'Tulip Patch',      x:8,  y:84},
  {id:'g-mushroom', e:'🍄', n:'Magic Mushroom',   x:22, y:63},
  {id:'g-sunflower',e:'🌻', n:'Happy Sunflower',  x:4,  y:62},
  {id:'g-fountain', e:'⛲', n:'Sparkle Fountain', x:50, y:57},
  {id:'g-house',    e:'🏡', n:'Cosy Pet House',   x:15, y:52},
  {id:'g-rainbow',  e:'🌈', n:'Garden Rainbow',   x:80, y:20},
  {id:'g-butterfly',e:'🦋', n:'Butterfly Friends',x:30, y:30},
  {id:'g-balloons', e:'🎈', n:'Party Balloons',   x:66, y:28},
  {id:'g-cherry',   e:'🌸', n:'Cherry Blossom',   x:88, y:54},
  {id:'g-lily',     e:'🪷', n:'Lily Pond',        x:70, y:88},
  {id:'g-carousel', e:'🎠', n:'Tiny Carousel',    x:33, y:56},
  {id:'g-picnic',   e:'🧺', n:'Picnic Basket',    x:24, y:90},
  {id:'g-cake',     e:'🍰', n:'Birthday Cake',    x:42, y:92},
  {id:'g-kite',     e:'🪁', n:'Flying Kite',      x:46, y:18},
  {id:'g-slide',    e:'🛝', n:'Pet Slide',        x:62, y:56},
  {id:'g-strawb',   e:'🍓', n:'Strawberry Patch', x:56, y:94},
  {id:'g-carrot',   e:'🥕', n:'Carrot Patch',     x:89, y:66},
  {id:'g-teddy',    e:'🧸', n:'Cuddly Teddy',     x:97, y:76},
  {id:'g-lavender', e:'🪻', n:'Lavender',         x:12, y:72},
  {id:'g-ladybug',  e:'🐞', n:'Ladybug Friend',   x:76, y:70},
  {id:'g-tent',     e:'🎪', n:'Circus Tent',      x:76, y:50},
  {id:'g-castle',   e:'🏰', n:'Little Castle',    x:94, y:38},
  {id:'g-moon',     e:'🌙', n:'Moon Lamp',        x:14, y:16},
  {id:'g-bubbles',  e:'🫧', n:'Bubble Machine',   x:38, y:74},
  {id:'g-daisy',    e:'🌼', n:'Daisy Chain',      x:62, y:76},
  {id:'g-hibiscus', e:'🌺', n:'Tropical Flower',  x:2,  y:92},
  {id:'g-tree',     e:'🌳', n:'Big Shady Tree',   x:6,  y:40},
  {id:'g-gift',     e:'🎁', n:'Surprise Present', x:50, y:80},
  {id:'g-star',     e:'🌟', n:'Wishing Star',     x:58, y:12},
  {id:'g-bow',      e:'🎀', n:'Giant Bow',        x:26, y:72}
];

/* ---------------- felt drawing ----------------------------------------- */
function _pc(tag, attrs, fill){
  let s='<'+tag+' class="pc"';
  Object.keys(attrs).forEach(function(k){ s+=' '+k+'="'+attrs[k]+'"'; });
  return s+' fill="'+fill+'"/>';
}
function _ell(cx,cy,rx,ry,fill,rot){ return feltLobe(cx,cy,rx,ry,fill,rot); }
function _tri(d, fill){ return '<path class="pc" d="'+d+'" fill="'+fill+'" stroke-linejoin="round"/>'; }
function _mirror(d){
  /* mirror an absolute "M x y L x y ..." path around x=60 */
  return d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, function(m,x,y){ return (120-parseFloat(x))+' '+y; });
}
function _feltStroke(d, color, w){
  return '<path d="'+d+'" fill="none" stroke="#FFFDF8" stroke-width="'+(w+5)+'" stroke-linecap="round"/>'
       + '<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+w+'" stroke-linecap="round"/>';
}

/* A pet, as a felt SVG. opts: {mood:'happy'|'open', bare:true (no svg root)} */
function petSVG(pet, opts){
  opts = opts||{};
  const sp = PET_SPECIES.find(function(s){ return s.id===pet.sp; }) || PET_SPECIES[0];
  const col = pet.gold ? PET_GOLD : sp.colors[pet.v||0];
  const body = col[0], acc = col[1];
  const light = '#FFFDF8';
  const stage = Pets.stage(pet);
  const mood = opts.mood || 'open';
  let back='', mid='', front='';

  /* --- tail & wings (behind) --- */
  if(sp.tail==='curl') back += _feltStroke('M80 108 q24 -2 20 -26 q-2 -10 -10 -5', body, 8);
  if(sp.tail==='string') back += _feltStroke('M80 110 q22 4 24 -10 q2 -12 -8 -12', acc, 4);
  if(sp.tail==='puff') back += _pc('circle',{cx:84,cy:108,r:8}, sp.id==='panda'?light:light);
  if(sp.tail==='fluff') back += _ell(92,98,16,9,body,-35) + _ell(103,88,7,5,light,-35);
  if(sp.tail==='wag') back += '<g class="pet-wag">'+_ell(86,96,5,11,body,35)+'</g>';
  if(sp.tail==='mane') back += _ell(88,104,8,12,acc,-30) + _ell(94,112,6,9,acc,-10);
  if(sp.tail==='dragon') back += _tri('M78 108 L108 100 L100 116 Z', body) + _tri('M104 96 L114 98 L108 106 Z', acc);
  if(sp.extra==='wings'){
    back += _tri('M40 92 L12 70 L18 86 L8 92 L22 100 L36 104 Z', acc);
    back += _tri(_mirror('M40 92 L12 70 L18 86 L8 92 L22 100 L36 104 Z'), acc);
  }
  if(sp.extra==='feathers'){
    back += '<g class="pet-flap">'+_ell(28,82,14,8,light,-30)+_ell(24,92,13,7,light,-15)+_ell(26,101,11,6,acc,0)+'</g>';
    back += '<g class="pet-flap pet-flap-r">'+_ell(92,82,14,8,light,30)+_ell(96,92,13,7,light,15)+_ell(94,101,11,6,acc,0)+'</g>';
  }

  /* --- body --- */
  mid += _ell(60,100,25,20,body);
  mid += _ell(60,104,15,12, sp.id==='duck'||sp.id==='owl' ? acc : light);
  if(sp.id==='dragon'){
    mid += '<path d="M50 99 h20 M51 105 h18 M53 111 h14" stroke="'+FELT.butterD+'" stroke-width="2" stroke-linecap="round" opacity=".6"/>';
  }
  if(sp.extra==='beak' || sp.extra==='bill'){
    mid += _ell(37,98,7,13,acc,18) + _ell(83,98,7,13,acc,-18);
  } else {
    mid += _ell(40,103,6,8,body,20) + _ell(80,103,6,8,body,-20);
  }
  const foot = sp.id==='duck' ? FELT.peach : body;
  mid += _ell(48,118,8,5,foot) + _ell(72,118,8,5,foot);
  if(sp.id==='panda'){ mid += _ell(48,118,8,5,acc) + _ell(72,118,8,5,acc); }

  /* --- ears (behind head) --- */
  let ears='';
  if(sp.ears==='cat'){
    ears += _tri('M33 46 L36 16 L56 32 Z', body) + _tri('M38 38 L39 24 L49 32 Z', acc);
    ears += _tri(_mirror('M33 46 L36 16 L56 32 Z'), body) + _tri(_mirror('M38 38 L39 24 L49 32 Z'), acc);
  }
  if(sp.ears==='fox'){
    ears += _tri('M30 50 L30 8 L58 30 Z', body) + _tri('M35 40 L35 18 L50 31 Z', light);
    ears += _tri(_mirror('M30 50 L30 8 L58 30 Z'), body) + _tri(_mirror('M35 40 L35 18 L50 31 Z'), light);
  }
  if(sp.ears==='bunny'){
    ears += '<g class="pet-ear-l">'+_ell(46,12,8,24,body,-12)+_ell(46,14,4,16,acc,-12)+'</g>';
    ears += '<g class="pet-ear-r">'+_ell(74,12,8,24,body,12)+_ell(74,14,4,16,acc,12)+'</g>';
  }
  if(sp.ears==='round'){
    const ec = sp.id==='panda' ? acc : body;
    ears += _pc('circle',{cx:35,cy:32,r:11},ec) + _pc('circle',{cx:85,cy:32,r:11},ec);
    if(sp.id!=='panda') ears += '<circle cx="35" cy="32" r="5.5" fill="'+acc+'"/><circle cx="85" cy="32" r="5.5" fill="'+acc+'"/>';
  }
  if(sp.ears==='mouse'){
    ears += _pc('circle',{cx:30,cy:34,r:16},body) + _pc('circle',{cx:90,cy:34,r:16},body);
    ears += '<circle cx="30" cy="34" r="9" fill="'+acc+'"/><circle cx="90" cy="34" r="9" fill="'+acc+'"/>';
  }
  if(sp.ears==='pony'){
    ears += _tri('M38 38 L40 16 L54 30 Z', body) + _tri(_mirror('M38 38 L40 16 L54 30 Z'), body);
  }
  if(sp.ears==='tufts'){
    ears += _tri('M32 40 L28 14 L50 30 Z', body) + _tri(_mirror('M32 40 L28 14 L50 30 Z'), body);
  }
  if(sp.ears==='horns'){
    ears += _tri('M42 34 L36 12 L52 28 Z', FELT.butter) + _tri(_mirror('M42 34 L36 12 L52 28 Z'), FELT.butter);
  }

  /* --- head --- */
  let head = _pc('circle',{cx:60,cy:58,r:30},body);
  if(sp.ears==='flop'){
    head += '<g class="pet-ear-l">'+_ell(32,56,9,19,acc,18)+'</g><g class="pet-ear-r">'+_ell(88,56,9,19,acc,-18)+'</g>';
  }
  if(sp.extra==='horn' || sp.tail==='mane'){
    head += _ell(44,34,13,9,acc,-28) + _ell(36,46,8,11,acc,-10) + _ell(58,31,11,7,acc,8);
  }
  /* the horn goes on last so a baby's shell hat never hides it */
  let horn='';
  if(sp.extra==='horn'){
    horn = '<path class="pc" d="M53 32 L60 3 L67 32 Z" fill="'+FELT.butter+'" stroke-linejoin="round"/>'
         + '<path d="M55 25 L65 22 M56 18 L64 15 M58 11 L62 9" stroke="'+FELT.butterD+'" stroke-width="2" stroke-linecap="round"/>';
  }
  if(sp.ears==='tuft') head += _ell(56,29,4,7,body,-25) + _ell(63,28,4,8,body,15);
  if(sp.id==='dragon'){
    head += _tri('M56 30 L60 22 L64 30 Z', acc);
  }
  if(sp.id==='owl'){
    head += _pc('circle',{cx:47,cy:58,r:12},acc) + _pc('circle',{cx:73,cy:58,r:12},acc);
  }
  if(sp.extra==='muzzle' || sp.id==='fox'){
    head += _ell(60,69,13,9, sp.id==='puppy' ? light : (sp.id==='fox'?light:acc));
  }
  if(sp.extra==='patches'){
    head += _ell(47,58,8,10,acc,-25) + _ell(73,58,8,10,acc,25);
  }

  /* --- face --- */
  let face='<g class="pet-eyes">';
  if(sp.extra==='patches'){
    face += '<circle cx="48" cy="57" r="4.6" fill="#FFFDF8"/><circle cx="72" cy="57" r="4.6" fill="#FFFDF8"/>'
          + '<circle cx="48.6" cy="57.4" r="2.8" fill="'+FELT.ink+'"/><circle cx="72.6" cy="57.4" r="2.8" fill="'+FELT.ink+'"/>';
  } else {
    face += feltEye(47,57,5.4,mood) + feltEye(73,57,5.4,mood);
  }
  face += '</g>';
  face += feltCheek(41,67,7) + feltCheek(79,67,7);
  if(sp.extra==='beak'){
    face += _tri('M55 64 L65 64 L60 73 Z', FELT.butterD);
  } else if(sp.extra==='bill'){
    face += _ell(60,68,11,5.5,FELT.peach) + '<path d="M52 68 h16" stroke="'+FELT.peachD+'" stroke-width="1.5" stroke-linecap="round"/>';
  } else {
    const nose = (sp.id==='kitten'||sp.id==='bunny'||sp.id==='mouse'||sp.id==='unicorn'||sp.id==='pegasus') ? FELT.pinkD : FELT.ink;
    face += _ell(60,64,3.6,2.6,nose);
    face += '<path d="M54 69 q3 4 6 0 q3 4 6 0" fill="none" stroke="'+FELT.ink+'" stroke-width="1.8" stroke-linecap="round"/>';
    if(sp.extra==='teeth') face += '<rect x="57.6" y="70.5" width="4.8" height="4" rx="1" fill="#FFFDF8" stroke="'+FELT.ink+'" stroke-width=".8"/>';
    if(sp.extra==='whisk'){
      face += '<path d="M40 63 l-12 -2 M40 67 l-12 2 M80 63 l12 -2 M80 67 l12 2" stroke="'+FELT.ink+'" stroke-width="1.2" stroke-linecap="round" opacity=".55"/>';
    }
  }

  /* --- grows-up accessories --- */
  let hat='';
  if(stage===0){
    /* still wearing a bit of the shell */
    hat += '<g transform="translate(-6 4) rotate(-22 46 30)">'
         + '<path class="pc" d="M30 34 L34 24 L39 31 L44 22 L49 31 L54 23 L58 34 Q44 28 30 34 Z" fill="'+(pet.gold?'#FFF1C2':'#FFF6E8')+'" stroke-linejoin="round"/>'
         + '<circle cx="40" cy="31" r="1.8" fill="'+acc+'"/><circle cx="50" cy="30" r="1.5" fill="'+acc+'"/></g>';
  } else if(stage===1){
    hat += '<g transform="translate(78 30) rotate(14)">'
         + _tri('M0 0 L-11 -7 L-11 7 Z', FELT.pink) + _tri('M0 0 L11 -7 L11 7 Z', FELT.pink)
         + _pc('circle',{cx:0,cy:0,r:3.6},FELT.pinkD) + '</g>';
  } else {
    hat += '<g transform="translate(74 26) rotate(16)">'
         + '<path class="pc" d="M-13 6 L-13 -8 L-6 -1 L0 -11 L6 -1 L13 -8 L13 6 Z" fill="'+FELT.butter+'" stroke-linejoin="round"/>'
         + '<circle cx="0" cy="1" r="2.4" fill="'+FELT.pinkD+'"/><circle cx="-8" cy="2" r="1.6" fill="'+FELT.sky+'"/><circle cx="8" cy="2" r="1.6" fill="'+FELT.mint+'"/></g>';
  }
  let sparkle='';
  if(pet.gold){
    sparkle += '<g class="pet-gold-sparkle">'+feltStar(14,30,6,'#FFFDF8')+feltStar(106,46,5,FELT.butter)+feltStar(100,12,4,'#FFFDF8')+'</g>';
  }

  const inner = '<ellipse cx="60" cy="124" rx="32" ry="5" fill="'+FELT.shadow+'"/>'
    + '<g class="pet-art">'+back+mid+ears+head+face+hat+horn+'</g>'+sparkle;
  if(opts.bare) return inner;
  return feltSVG('0 -10 120 140', inner, 'pet-svg');
}

/* A felt egg. spots tint hints at what is inside. cracks 0-3. */
function eggSVG(egg, cracks){
  const sp = PET_SPECIES.find(function(s){ return s.id===egg.sp; }) || PET_SPECIES[0];
  const col = egg.gold ? PET_GOLD : sp.colors[egg.v||0];
  const shell = egg.gold ? '#FFF1C2' : '#FFF6E8';
  let s = '<ellipse cx="60" cy="124" rx="30" ry="5" fill="'+FELT.shadow+'"/>'
    + '<path class="pc" d="M60 14 C86 14 100 58 100 82 C100 106 82 120 60 120 C38 120 20 106 20 82 C20 58 34 14 60 14 Z" fill="'+shell+'"/>'
    + _pc('circle',{cx:44,cy:54,r:8},col[1]) + _pc('circle',{cx:74,cy:40,r:6},col[0]==='#FFFDF8'?col[1]:col[0])
    + _pc('circle',{cx:80,cy:78,r:10},col[1]) + _pc('circle',{cx:42,cy:94,r:7},col[0]==='#FFFDF8'?col[1]:col[0])
    + _pc('circle',{cx:62,cy:104,r:5},col[1])
    + feltStitch('M28 76 Q60 66 92 76', 'rgba(222,116,156,.45)', 2);
  if(egg.gold) s += feltStar(60,70,9,'#FFFDF8');
  const c = cracks||0;
  if(c>=1) s += '<path d="M40 64 l8 6 l-4 7 l9 5" fill="none" stroke="'+FELT.ink+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
  if(c>=2) s += '<path d="M78 56 l-6 8 l7 5 l-6 9" fill="none" stroke="'+FELT.ink+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
  if(c>=3) s += '<path d="M24 82 l12 -4 l8 6 l10 -6 l10 6 l10 -6 l10 6 l12 -4" fill="none" stroke="'+FELT.ink+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
  return feltSVG('0 -10 120 140', s, 'egg-svg');
}

/* Felt nest with the egg sitting in it — the map landmark and garden nest. */
function nestSVG(egg, ready){
  let s = '<ellipse cx="60" cy="112" rx="46" ry="7" fill="'+FELT.shadow+'"/>';
  if(egg){
    s += '<g class="nest-egg'+(ready?' ready':'')+'"><g transform="translate(30 34) scale(.5)">'
       + eggSVG(egg,0).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'') + '</g></g>';
  }
  s += _ell(60,98,44,16,FELT.tan) + _ell(60,92,36,9,FELT.tanD)
     + '<path d="M22 96 q14 8 30 2 M50 104 q16 6 34 -2 M70 96 q14 6 26 -2" stroke="'+FELT.tanD+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
     + feltStitch('M20 100 Q60 116 100 100', 'rgba(255,253,248,.75)', 2)
     + feltFlower(22,88,8,FELT.pink) + feltFlower(98,90,7,FELT.lilac);
  return feltSVG('0 0 120 124', s, 'nest-svg');
}

/* ---------------- the model -------------------------------------------- */
const Pets = {
  STAGE_LOVE: [0, 8, 20],   // love needed for baby, little, grown-up
  EGG_NEED: 8,              // finished activities to hatch an egg
  FIRST_EGG_NEED: 4,        // the first egg hatches quickly
  TREAT_COST: 5,            // stars per treat
  TREAT_LOVE: 2,
  TREATS: [{e:'🍓',n:'strawberry'},{e:'🧁',n:'cupcake'},{e:'🍪',n:'cookie'},{e:'🥕',n:'carrot'},{e:'🍎',n:'apple'},{e:'🍯',n:'honey'}],
  selected: null,

  ensure(){
    if(!Array.isArray(S.pets)) S.pets = [];
    if(!Array.isArray(S.garden)) S.garden = [];
    if(!S.egg || !S.egg.sp) S.egg = this.newEgg();
  },
  today(){ return new Date().toDateString(); },
  species(id){ return PET_SPECIES.find(function(s){ return s.id===id; }) || PET_SPECIES[0]; },
  stage(pet){
    const l = pet.love||0;
    return l>=this.STAGE_LOVE[2] ? 2 : l>=this.STAGE_LOVE[1] ? 1 : 0;
  },
  title(pet){
    return (pet.gold?'golden ':'')+this.species(pet.sp).name;
  },
  owned(sp, v, gold){
    return (S.pets||[]).some(function(p){ return p.sp===sp && (p.v||0)===v && !!p.gold===!!gold; });
  },
  /* Hatch order: every species once, then second colours, then third,
     then golden. 48 distinct pets before anything repeats. */
  nextSpec(){
    const tiers=[[0,false],[1,false],[2,false],[0,true]];
    for(let t=0;t<tiers.length;t++){
      for(let i=0;i<PET_SPECIES.length;i++){
        const sp=PET_SPECIES[i].id, v=tiers[t][0], gold=tiers[t][1];
        if(!this.owned(sp,v,gold)) return {sp:sp, v:v, gold:gold};
      }
    }
    const r=PET_SPECIES[Math.floor(Math.random()*PET_SPECIES.length)];
    return {sp:r.id, v:Math.floor(Math.random()*3), gold:Math.random()<0.25};
  },
  newEgg(){
    const spec = this.nextSpec();
    const first = !(S.pets && S.pets.length);
    return {sp:spec.sp, v:spec.v, gold:spec.gold, warmth:0, need:first?this.FIRST_EGG_NEED:this.EGG_NEED};
  },
  pickName(){
    const used = (S.pets||[]).map(function(p){ return p.name; });
    const free = PET_NAMES.filter(function(n){ return used.indexOf(n)<0; });
    const pool = free.length ? free : PET_NAMES;
    return pool[Math.floor(Math.random()*pool.length)];
  },
  /* The pet that gets a heart from each activity: the youngest still growing. */
  buddy(){
    const growing = (S.pets||[]).filter(p=>this.stage(p)<2);
    return growing.length ? growing[growing.length-1] : null;
  },
  hatchReady(){ this.ensure(); return S.egg.warmth >= S.egg.need; },
  /* Reading a new storybook warms the egg too. */
  warm(n){
    this.ensure();
    S.egg.warmth = Math.min(S.egg.need, S.egg.warmth + (n||1));
    save(); this.renderChip(true);
    try{ refreshPetMark(); }catch(e){}
  },
  /* A land woke up: the egg in the nest turns golden and is ready to hatch. */
  goldenEgg(){
    this.ensure();
    const sp = PET_SPECIES.find(s=>!this.owned(s.id,0,true)) || PET_SPECIES[Math.floor(Math.random()*PET_SPECIES.length)];
    S.egg = {sp:sp.id, v:0, gold:true, warmth:this.EGG_NEED, need:this.EGG_NEED};
    save();
    try{ refreshPetMark(); }catch(e){}
  },
  eggLeft(){ this.ensure(); return Math.max(0, S.egg.need - S.egg.warmth); },

  /* Called once per finished activity (from activityDone). */
  onActivityDone(){
    this.ensure();
    if(S.egg.warmth < S.egg.need) S.egg.warmth++;
    const b = this.buddy();
    let grew = null;
    if(b){
      const before = this.stage(b);
      b.love = (b.love||0) + 1;
      if(this.stage(b) > before) grew = b;
    }
    save();
    this.renderChip(true);
    if(grew){
      try{ toast('💖 '+grew.name+' grew bigger!'); AudioSys.sfx('sparkle'); }catch(e){}
    }
  },
  hatch(){
    this.ensure();
    const e = S.egg;
    const pet = {id:'p'+Date.now().toString(36)+Math.floor(Math.random()*999), sp:e.sp, v:e.v, gold:!!e.gold,
                 name:this.pickName(), love:0, born:Date.now()};
    S.pets.push(pet);
    S.egg = this.newEgg();
    save();
    Bus.emit('PET_HATCHED', {sp:pet.sp, name:pet.name});
    return pet;
  },
  feed(pet){
    if(S.stars < this.TREAT_COST) return {ok:false, why:'stars'};
    S.stars -= this.TREAT_COST;
    const before = this.stage(pet);
    if(before < 2) pet.love = (pet.love||0) + this.TREAT_LOVE;
    pet.treats = (pet.treats||0)+1;
    save();
    const el=$('star-count'); if(el) el.textContent=S.stars;
    return {ok:true, grew:this.stage(pet)>before, stage:this.stage(pet)};
  },
  loveToNext(pet){
    const st=this.stage(pet);
    if(st>=2) return 0;
    return this.STAGE_LOVE[st+1] - (pet.love||0);
  },

  /* ---- garden treasures ---- */
  nextGardenItem(){
    this.ensure();
    return GARDEN_ITEMS.find(function(g){ return S.garden.indexOf(g.id)<0; }) || null;
  },
  /* Claim the next treasure and describe it for the chest. */
  claimGardenPrize(extraStars){
    const g = this.nextGardenItem();
    if(!g) return null;
    S.garden.push(g.id); save();
    return {emoji:g.e, name:g.n, banner:'A treasure for your pet garden! 🌷',
            voice:'A new treasure for your pet garden!', say:'A '+g.n+' for your pet garden!',
            stars:extraStars||3,
            cta:{label:'See my garden! 🐾', go:function(){ Pets.open({highlight:g.id}); }}};
  },
  dailyReady(){ this.ensure(); return S.lastDaily !== this.today(); },
  /* Daily treasure: once per day, the first finished adventure. */
  dailyPrize(){
    S.lastDaily = this.today();
    const g = this.claimGardenPrize(10);
    if(g){ g.banner = 'Today\'s magic treasure! 🌞'; g.say = 'Today\'s treasure! A '+g.name+' for your pet garden! And ten stars for treats!'; return g; }
    /* Garden is full: warm the egg instead. */
    S.egg.warmth = Math.min(S.egg.need, S.egg.warmth + 4); save();
    return {emoji:'🔥', name:'Cosy egg blanket!', banner:'Today\'s magic treasure! 🌞',
            say:'A cosy blanket for your egg! It is nearly ready to hatch!', stars:10,
            cta:{label:'See my egg! 🥚', go:function(){ Pets.open(); }}};
  },
  showDailyChest(){ save(); showEncoreReward(this.dailyPrize()); },

  /* ---- egg progress chip in the game bar ---- */
  renderChip(pulse){
    const chip = document.getElementById('egg-chip');
    if(!chip) return;
    this.ensure();
    const e=S.egg, pct=Math.round(100*Math.min(1,e.warmth/e.need));
    chip.innerHTML = '<span class="egg-chip-art">'+eggSVG(e,0)+'</span>'
      + '<span class="egg-chip-bar"><span style="width:'+pct+'%"></span></span>';
    chip.classList.toggle('ready', e.warmth>=e.need);
    chip.title = e.warmth>=e.need ? 'Your egg is ready to hatch!' : (e.need-e.warmth)+' more games to hatch';
    if(pulse){ chip.classList.remove('pulse'); void chip.offsetWidth; chip.classList.add('pulse'); }
  },

  /* ---- the hatching moment ----------------------------------------- */
  hatchCeremony(done){
    this.ensure();
    const modal=$('hatch-modal'), stage=$('hatch-stage'), nameEl=$('hatch-name');
    const hello=$('btn-hatch-hello'), banner=$('hatch-banner');
    const egg = Object.assign({}, S.egg);
    let taps=0, finished=false, pet=null;
    Flow.rewardPending = true;
    modal.classList.remove('hidden');
    modal.querySelector('.hatch-card').classList.remove('hatched');
    banner.textContent = 'Your egg is wiggling! 🥚';
    nameEl.textContent=''; nameEl.classList.remove('revealed');
    hello.classList.add('hidden');
    stage.innerHTML = '<div class="hatch-rays" aria-hidden="true"></div><button class="hatch-egg wobble" id="hatch-egg" aria-label="Tap the egg">'+eggSVG(egg,0)+'</button>'
                    + '<div class="hatch-hint">👆 Tap tap tap!</div>';
    Sound.say('Your egg is wiggling! Tap it to help it hatch!');
    const finish=()=>{
      if(finished) return; finished=true;
      modal.classList.add('hidden');
      Flow.rewardPending = false;
      Bus.emit('HATCH_DISMISSED', {sp:egg.sp});
      if(done) Scene.later(250, done, 'afterHatch');
    };
    hello.onclick = ()=>{
      AudioSys.sfx('sparkle');
      finish();
    };
    $('hatch-egg').onclick = ()=>{
      if(pet) return;
      taps++;
      const btn=$('hatch-egg');
      AudioSys.sfx(taps<3?'pop':'chest');
      if(taps<3){
        btn.innerHTML = eggSVG(egg, taps);
        btn.classList.remove('wobble','jolt'); void btn.offsetWidth; btn.classList.add('jolt');
        if(typeof stickerBurst==='function') stickerBurst(btn, 6);
        return;
      }
      btn.innerHTML = eggSVG(egg, 3);
      btn.classList.remove('wobble','jolt'); void btn.offsetWidth; btn.classList.add('bursting');
      pet = Pets.hatch();
      after(650, ()=>{
        modal.querySelector('.hatch-card').classList.add('hatched');
        stage.querySelector('.hatch-hint').textContent='';
        btn.outerHTML = '<div class="hatch-pet">'+petSVG(pet,{mood:'happy'})+'</div>';
        AudioSys.sfx('fanfare'); confettiBlast();
        const hp=stage.querySelector('.hatch-pet');
        if(typeof stickerBurst==='function') stickerBurst(hp, 18); else sparkles(24);
        banner.textContent = 'It hatched! 🎉';
        nameEl.innerHTML = 'A baby '+Pets.title(pet)+'!<br><b>'+pet.name+'</b>';
        nameEl.classList.add('revealed');
        hello.textContent = 'Hello, '+pet.name+'! 💖';
        hello.classList.remove('hidden');
        Sound.say('It hatched! It is a baby '+Pets.title(pet)+'! Say hello to '+pet.name+'!');
        Pets.renderChip(false);
      });
    };
  },

  /* ---- the garden screen ------------------------------------------- */
  open(opts){
    opts=opts||{};
    this.ensure();
    try{ $('reward-modal').classList.add('hidden'); }catch(e){}
    showScreen('pets');
    try{ AudioSys.setScene('meadow'); }catch(e){}
    this.renderGarden(opts.highlight);
    const n=S.pets.length;
    if(this.hatchReady()){
      this.select(null);
      Sound.say('Your egg is ready! Tap the nest to hatch it!');
    } else if(!n){
      this.select(null);
      Sound.say('Welcome to your pet garden! Play games to keep your egg warm. Then it will hatch!');
    } else {
      this.select(this.selected && S.pets.find(p=>p.id===this.selected) ? this.selected : S.pets[n-1].id, true);
      Sound.say('Welcome to your pet garden! Tap a pet to play!');
    }
  },
  /* The garden shows the selected pet plus the newest few; the rest wait
     in the pet book so the scene never turns into a crowd. */
  gardenPets(){
    const list = S.pets.slice(-7);
    const sel = S.pets.find(p=>p.id===this.selected);
    if(sel && list.indexOf(sel)<0) list.unshift(sel);
    return list;
  },
  renderGarden(highlight){
    const garden=$('pet-garden'); if(!garden) return;
    const bg=$('garden-bg');
    if(bg && !bg.firstChild) bg.innerHTML = gardenBackdropSVG();
    /* treasures */
    const deco=$('garden-decor'); deco.innerHTML='';
    GARDEN_ITEMS.forEach(function(g){
      if(S.garden.indexOf(g.id)<0) return;
      const d=document.createElement('div');
      d.className='garden-item'+(g.id===highlight?' new-item':'');
      d.style.left=g.x+'%'; d.style.top=g.y+'%';
      d.style.zIndex = 2+Math.round(g.y);
      d.textContent=g.e; d.title=g.n;
      d.onclick=function(){ d.classList.remove('boing'); void d.offsetWidth; d.classList.add('boing'); AudioSys.sfx('pop'); };
      deco.appendChild(d);
    });
    /* pets: spread across the meadow */
    const host=$('garden-pets'); host.innerHTML='';
    const list=this.gardenPets();
    const spots=[[30,70],[56,74],[72,62],[42,62],[84,78],[20,80],[64,86],[36,86]];
    list.forEach((p,i)=>{
      const st=this.stage(p);
      const el=document.createElement('button');
      el.className='garden-pet stage-'+st+(p.id===this.selected?' selected':'');
      el.dataset.pet=p.id;
      const sp=spots[i%spots.length];
      el.style.left=sp[0]+'%'; el.style.top=sp[1]+'%';
      el.style.zIndex = 10+sp[1];
      el.style.setProperty('--range', (18+((i*37)%30))+'px');
      el.style.setProperty('--dur', (4.5+((i*1.3)%3)).toFixed(1)+'s');
      el.style.setProperty('--hop', (0.9+((i*0.17)%0.5)).toFixed(2)+'s');
      el.setAttribute('aria-label', p.name);
      el.innerHTML='<span class="pet-roam"><span class="pet-body">'+petSVG(p)+'</span></span>';
      el.onclick=()=>this.tapPet(p.id);
      host.appendChild(el);
    });
    /* nest */
    const nest=$('garden-nest');
    nest.innerHTML = nestSVG(S.egg, this.hatchReady())
      + '<span class="nest-label">'+(this.hatchReady()?'Ready to hatch! ✨':'🥚 '+this.eggLeft()+' more games')+'</span>';
    nest.classList.toggle('ready', this.hatchReady());
    nest.classList.toggle('solo', !S.pets.length);
    nest.onclick=()=>{
      if(this.hatchReady()){
        this.hatchCeremony(()=>{ const p=S.pets[S.pets.length-1]; this.selected=p?p.id:null; this.renderGarden(); this.select(this.selected,true); });
      } else {
        this.select(null);
        Sound.say('Your magic egg! Play '+this.eggLeft()+' more games to hatch it!');
        const n=nest.querySelector('.nest-egg'); if(n){ n.classList.remove('wiggle'); void n.getBoundingClientRect(); n.classList.add('wiggle'); }
      }
    };
    $('garden-stars').textContent = S.stars;
    this.renderBook();
  },
  renderBook(){
    const book=$('pet-book'); if(!book) return;
    const total = PET_SPECIES.length*4;
    let h='<div class="pet-book-title">My Pets <b>'+S.pets.length+'</b> / '+total+'</div><div class="pet-book-row">';
    S.pets.slice().reverse().forEach(p=>{
      h+='<button class="pet-card'+(p.id===this.selected?' on':'')+'" data-pet="'+p.id+'">'+petSVG(p)+'<span>'+p.name+'</span></button>';
    });
    const left = PET_SPECIES.filter(s=>!S.pets.some(p=>p.sp===s.id)).length;
    if(left) h+='<div class="pet-card mystery"><span class="q">?</span><span>'+left+' more kinds to find!</span></div>';
    h+='</div>';
    book.innerHTML=h;
    book.querySelectorAll('button.pet-card').forEach(b=>{
      b.onclick=()=>{
        const id=b.dataset.pet;
        const inGarden = !!document.querySelector('.garden-pet[data-pet="'+id+'"]');
        this.selected=id;
        if(!inGarden) this.renderGarden();
        this.tapPet(id);
      };
    });
  },
  tapPet(id){
    const pet=S.pets.find(p=>p.id===id); if(!pet) return;
    this.select(id);
    const el=document.querySelector('.garden-pet[data-pet="'+id+'"]');
    if(el){
      el.classList.remove('joy'); void el.offsetWidth; el.classList.add('joy');
      this.hearts(el, 5);
    }
    AudioSys.sfx('pop');
    const lines=['Hi Layla! I am '+pet.name+'!', pet.name+' loves you!', 'Yay! '+pet.name+' wants to play!', pet.name+' is so happy to see you!'];
    Sound.say(lines[Math.floor(Math.random()*lines.length)]);
  },
  hearts(anchor, n){
    if(!S.settings.motion) return;
    const host=$('sparkle-layer'); if(!host) return;
    let cx=window.innerWidth/2, cy=window.innerHeight/2;
    try{ const r=anchor.getBoundingClientRect(); cx=r.left+r.width/2; cy=r.top+r.height*0.3; }catch(e){}
    for(let i=0;i<(n||5);i++){
      const h=document.createElement('div'); h.className='float-heart';
      h.textContent=['💖','💜','💗','✨'][i%4];
      h.style.left=(cx+(Math.random()*80-40))+'px'; h.style.top=cy+'px';
      h.style.animationDelay=(i*0.08)+'s';
      host.appendChild(h);
      setTimeout(()=>{ try{h.remove();}catch(e){} }, 1600);
    }
  },
  select(id, quiet){
    this.selected=id;
    document.querySelectorAll('.garden-pet').forEach(el=>el.classList.toggle('selected', el.dataset.pet===id));
    document.querySelectorAll('.pet-card').forEach(el=>el.classList.toggle('on', el.dataset.pet===id));
    const panel=$('pet-panel'); if(!panel) return;
    const pet=S.pets.find(p=>p.id===id);
    if(!pet){
      const e=S.egg, ready=this.hatchReady();
      const pct=Math.round(100*Math.min(1,e.warmth/e.need));
      panel.innerHTML='<div class="pp-portrait egg">'+eggSVG(e,0)+'</div>'
        +'<div class="pp-info"><div class="pp-name">Magic Egg</div>'
        +'<div class="pp-stage">'+(ready?'Ready to hatch! Tap the nest! ✨':'Play '+this.eggLeft()+' more games to hatch it!')+'</div>'
        +'<div class="pp-bar warm"><span style="width:'+pct+'%"></span></div></div>';
      return;
    }
    const st=this.stage(pet), need=this.loveToNext(pet);
    const lo=this.STAGE_LOVE[st], hi=st<2?this.STAGE_LOVE[st+1]:lo;
    const pct = st>=2 ? 100 : Math.round(100*((pet.love||0)-lo)/(hi-lo));
    const treat=this.TREATS[(pet.treats||0)%this.TREATS.length];
    panel.innerHTML='<div class="pp-portrait">'+petSVG(pet)+'</div>'
      +'<div class="pp-info"><div class="pp-name">'+pet.name+'</div>'
      +'<div class="pp-stage">'+(st>=2?'All grown up! 👑':'A '+PET_STAGE_NAMES[st]+' '+this.title(pet))+'</div>'
      +'<div class="pp-bar"><span style="width:'+pct+'%"></span></div>'
      +'<div class="pp-note">'+(st>=2?'Grown-up '+this.title(pet)+' 💖':'💖 '+need+' more love to grow')+'</div></div>'
      +'<div class="pp-actions"><button class="magic-btn secondary pp-treat">'+treat.e+' Treat <small>⭐'+this.TREAT_COST+'</small></button>'
      +'<button class="magic-btn pp-hi">🔊 Hi!</button></div>';
    panel.querySelector('.pp-treat').onclick=()=>this.giveTreat(pet.id);
    panel.querySelector('.pp-hi').onclick=()=>this.tapPet(pet.id);
    if(!quiet){ const port=panel.querySelector('.pp-portrait'); if(port){ port.classList.remove('boing'); void port.offsetWidth; port.classList.add('boing'); } }
  },
  giveTreat(id){
    const pet=S.pets.find(p=>p.id===id); if(!pet) return;
    const treat=this.TREATS[(pet.treats||0)%this.TREATS.length];
    const r=this.feed(pet);
    if(!r.ok){
      AudioSys.sfx('boop',0.5);
      toast('Play a game to earn more stars! ⭐');
      Sound.say('We need more stars for treats! Let\'s play a game to earn some!');
      return;
    }
    $('garden-stars').textContent=S.stars;
    const el=document.querySelector('.garden-pet[data-pet="'+id+'"]');
    if(el){
      const t=document.createElement('div'); t.className='treat-fly'; t.textContent=treat.e;
      el.appendChild(t); setTimeout(()=>{ try{t.remove();}catch(e){} }, 1000);
      el.classList.remove('munch','joy'); void el.offsetWidth; el.classList.add('munch');
      this.hearts(el, 4);
    }
    AudioSys.sfx('sparkle');
    if(r.grew){
      Scene.later(700, ()=>{
        this.renderGarden(); this.select(id, true);
        const el2=document.querySelector('.garden-pet[data-pet="'+id+'"]');
        if(el2){ el2.classList.add('grow-up'); if(typeof stickerBurst==='function') stickerBurst(el2, 14); }
        confettiBlast(); AudioSys.sfx('fanfare');
        Sound.say(r.stage>=2 ? 'Wow! '+pet.name+' is all grown up! Look at that crown!' : pet.name+' grew bigger! Yummy '+treat.n+'!');
      }, 'petGrow');
    } else {
      Scene.later(650, ()=>this.select(id, true), 'petSelect');
      Sound.say(this.stage(pet)>=2 ? 'Yummy '+treat.n+'! '+pet.name+' does a happy dance!' : 'Yummy '+treat.n+'! '+pet.name+' loves it!');
    }
  }
};

/* Felt meadow for the garden: sky, sun, clouds, rolling hills. Drawn once. */
function gardenBackdropSVG(){
  let s='<defs><linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1">'
    +'<stop offset="0" stop-color="#9FD6F2"/><stop offset=".55" stop-color="#D9CCF6"/><stop offset="1" stop-color="#FBE1EE"/></linearGradient></defs>'
    +'<rect width="1000" height="600" fill="url(#gsky)"/>'
    +'<g class="g-sun"><circle cx="880" cy="90" r="74" fill="#FFF3C4" opacity=".6"/><circle class="pc" cx="880" cy="90" r="52" fill="'+FELT.butter+'"/></g>'
    +'<g class="g-cloud g-cloud-a">'+feltLobe(170,90,60,26,'#FFFDF8')+feltLobe(215,76,42,30,'#FFFDF8')+feltLobe(130,98,36,20,'#FFFDF8')+'</g>'
    +'<g class="g-cloud g-cloud-b">'+feltLobe(560,60,50,22,'#FFFDF8')+feltLobe(600,48,34,24,'#FFFDF8')+'</g>'
    +'<path class="pc" d="M-20 300 Q160 200 340 280 T700 260 T1020 270 V600 H-20 Z" fill="#A9DCC0"/>'
    +'<path class="pc" d="M-20 360 Q220 280 460 350 T1020 330 V600 H-20 Z" fill="'+FELT.grass+'"/>'
    +'<path class="pc" d="M-20 450 Q300 400 620 450 T1020 440 V600 H-20 Z" fill="#B3E09C"/>'
    + feltStitch('M-10 368 Q220 290 460 358 T1010 338', 'rgba(255,253,248,.7)', 2.4)
    + feltStitch('M-10 458 Q300 410 620 458 T1010 448', 'rgba(255,253,248,.6)', 2.4);
  for(let i=0;i<14;i++){
    const x=(i*73+40)%1000, y=480+((i*37)%100);
    s+=feltFlower(x,y,7+(i%3)*2,[FELT.pink,FELT.lilac,FELT.butter,FELT.white][i%4]);
  }
  return '<svg class="felt garden-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+FELT_DEFS+s+'</svg>';
}

/* ---------------- wiring ------------------------------------------------ */
(function(){
  try{
    Pets.ensure(); save();
    const go=function(){ AudioSys.ensure(); AudioSys.startMusic(); Pets.open(); };
    const mark=document.getElementById('land-pets');
    if(mark){
      const e=mark.querySelector('.land-emoji');
      if(e) e.innerHTML = nestSVG(S.egg, Pets.hatchReady()).replace('class="felt nest-svg"','class="felt nest-svg mark-svg"');
    }
    const top=document.getElementById('nav-pets-top'); if(top) top.onclick=go;
    const sb=document.getElementById('btn-to-pets');
    if(sb) sb.onclick=function(){ $('session-modal').classList.add('hidden'); Pets.open(); };
    document.querySelectorAll('.pets-hear').forEach(function(b){
      b.onclick=function(){ Sound.say('Your pet garden! Tap a pet to play. Treats help them grow!'); };
    });
  }catch(e){ try{ console.warn('pets init', e); }catch(x){} }
})();
/* Keep the map nest in step with the egg. */
function refreshPetMark(){
  try{
    Pets.ensure();
    const mark=document.getElementById('land-pets'); if(!mark) return;
    const e=mark.querySelector('.land-emoji');
    if(e) e.innerHTML = nestSVG(S.egg, Pets.hatchReady()).replace('class="felt nest-svg"','class="felt nest-svg mark-svg"');
    mark.classList.toggle('egg-ready', Pets.hatchReady());
  }catch(err){}
}

if(typeof module!=='undefined' && module.exports){
  module.exports = {Pets, PET_SPECIES, GARDEN_ITEMS, petSVG, eggSVG};
}
