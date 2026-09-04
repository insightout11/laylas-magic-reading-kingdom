/* ============================================================
   PRINCESS LAYLA — paper-doll character system + dollhouse bedroom.
   Loaded after princess.js; these declarations replace the older ones.

   PAPER-DOLL CONTRACT
   The base doll never changes: same body, same pose, same face, drawn in a
   fixed 300x480 space. Outfit pieces are separate felt cut-outs that snap
   to published anchor points, so any dress lines up with any crown and any
   shoes without per-combination fixes.

       head centre   150, 96      crown seat    150, 52
       shoulders     150, 152     neckline      150, 166
       waist         150, 248     hem range     y 300 - 400
       feet          126/174, 424 wing pivot    150, 196

   Add a dress by adding one entry to DRESS_FELT that draws between the
   shoulders and the hem. Nothing else needs to know about it.
   ============================================================ */
'use strict';

const DOLL = {
  skin:'#F7D9C4', skinD:'#E5BBA0',
  hair:'#7C4A32', hairD:'#5E3623', hairL:'#9C6244'
};

/* ---- outfit pieces --------------------------------------------------
   Each returns felt markup in doll space. Silhouettes are deliberately
   distinct so the reward reads as a different dress from across the room. */
const DRESS_FELT = {
  /* Sparkly Rainbow — a bell skirt built from overlapping ruffle tiers.
     Tiers are drawn WIDEST FIRST so each higher layer overlaps the one
     below; that overlap is what makes it read as one skirt rather than a
     stack of separate bowls. */
  'dress-rainbow': function(){
    /* A solid bell first, so the gaps between ruffles are skirt rather than
       background — without it the tiers read as a stack of flat discs. */
    let s = '<path class="pc" d="M114 244 q36 -14 72 0 q34 92 42 166 '
          + 'q-78 26 -156 0 q8 -74 42 -166 z" fill="'+FELT.pinkL+'"/>';
    const tiers = [
      [404, 114, FELT.pink], [360, 99, FELT.butter], [320, 84, FELT.mint],
      [284, 69, FELT.sky],   [252, 54, FELT.lilac]
    ];
    tiers.forEach(function(t){
      const y=t[0], w=t[1], c=t[2];
      /* wide lens: gentle arc on top, scalloped swing on the bottom */
      s += '<path class="pc" d="M'+(150-w)+' '+y+' Q150 '+(y-28)+' '+(150+w)+' '+y
         + ' Q150 '+(y+36)+' '+(150-w)+' '+y+' Z" fill="'+c+'"/>';
    });
    /* fitted bodice with straps, over the top tier, gold sash at the waist */
    s += '<path class="pc" d="M120 158 q30 -14 60 0 l6 88 q-36 12 -72 0 z" fill="'+FELT.white+'"/>'
       + '<path d="M130 156 q6 -18 20 -18 q14 0 20 18" fill="none" stroke="'+FELT.white+'" stroke-width="9" stroke-linecap="round"/>'
       + '<path d="M116 242 q34 12 68 0" fill="none" stroke="'+FELT.butter+'" stroke-width="12" stroke-linecap="round"/>'
       + '<path d="M128 182 q22 10 44 0" fill="none" stroke="'+FELT.pinkL+'" stroke-width="5" stroke-linecap="round"/>';
    s += feltStar(150,206,11, FELT.butter) + feltStar(108,272,9, FELT.white)
       + feltStar(192,308,10, FELT.white) + feltStar(124,352,9, FELT.butter)
       + feltStar(180,392,9, FELT.white) + feltStar(150,336,8, FELT.white);
    return s;
  },
  /* Pink Princess — soft smooth gown, waist bow, heart trim. */
  'dress-pink': function(){
    return '<path class="pc" d="M118 152 q32 -12 64 0 l4 60 q-36 12 -72 0 z" fill="'+FELT.pinkD+'"/>'
      + '<path class="pc" d="M114 244 q36 -14 72 0 q30 88 34 148 q-70 24 -140 0 q4 -60 34 -148 z" fill="'+FELT.pink+'"/>'
      + '<path d="M84 380 q66 20 132 0" fill="none" stroke="'+FELT.pinkL+'" stroke-width="12" stroke-linecap="round"/>'
      + feltStitch('M96 340 q54 16 108 0','rgba(255,255,255,.85)',3)
      /* waist bow */
      + '<g><path class="pc" d="M150 248 l-30 -12 l0 26 z" fill="'+FELT.butter+'"/>'
      + '<path class="pc" d="M150 248 l30 -12 l0 26 z" fill="'+FELT.butter+'"/>'
      + '<circle class="pc" cx="150" cy="248" r="10" fill="'+FELT.butterD+'"/></g>'
      /* hearts */
      + '<g fill="'+FELT.white+'" opacity=".9">'
      + '<path d="M118 300 a7 7 0 0 1 12 0 a7 7 0 0 1 12 0 q0 10 -12 18 q-12 -8 -12 -18 z" transform="translate(-8,0)"/>'
      + '<path d="M172 330 a6 6 0 0 1 10 0 a6 6 0 0 1 10 0 q0 9 -10 15 q-10 -6 -10 -15 z"/>'
      + '</g>';
  },
  /* Lilac Twirl — ballet leotard + wide layered tutu, sparkle trim. */
  'dress-lilac': function(){
    return '<path class="pc" d="M120 152 q30 -12 60 0 l2 92 q-32 10 -64 0 z" fill="'+FELT.lilacD+'"/>'
      + '<ellipse class="pc" cx="150" cy="264" rx="94" ry="34" fill="'+FELT.lilac+'"/>'
      + '<ellipse class="pc" cx="150" cy="252" rx="78" ry="28" fill="'+FELT.lilacL+'"/>'
      + '<ellipse class="pc" cx="150" cy="242" rx="60" ry="22" fill="'+FELT.white+'"/>'
      + '<path d="M62 268 q88 26 176 0" fill="none" stroke="'+FELT.butter+'" stroke-width="5" stroke-dasharray="3 7" stroke-linecap="round"/>'
      + '<path d="M120 200 q30 10 60 0" fill="none" stroke="'+FELT.butter+'" stroke-width="4" stroke-linecap="round"/>'
      + feltStar(150,176,10, FELT.butter) + feltStar(96,246,8, FELT.white) + feltStar(206,250,8, FELT.white);
  },
  /* Blue Ballet — simple mid gown with a sash. */
  'dress-blue': function(){
    return '<path class="pc" d="M118 152 q32 -12 64 0 l4 58 q-36 12 -72 0 z" fill="'+FELT.skyD+'"/>'
      + '<path class="pc" d="M116 242 q34 -14 68 0 q26 76 30 130 q-64 22 -128 0 q4 -54 30 -130 z" fill="'+FELT.sky+'"/>'
      + '<path d="M118 250 q32 12 64 0" fill="none" stroke="'+FELT.butter+'" stroke-width="10" stroke-linecap="round"/>'
      + feltStitch('M104 330 q46 14 92 0','rgba(255,255,255,.8)',3);
  }
};
const CROWN_FELT = {
  'crown-gold': function(){
    return '<g class="doll-crown"><path class="pc" d="M112 52 l6 -30 l12 16 l14 -24 l14 24 l12 -16 l6 30 z" fill="'+FELT.butter+'"/>'
      + '<circle cx="150" cy="34" r="5" fill="'+FELT.rose+'"/>'
      + '<circle cx="126" cy="44" r="3.6" fill="'+FELT.mint+'"/><circle cx="174" cy="44" r="3.6" fill="'+FELT.sky+'"/></g>';
  },
  'crown-tiara': function(){
    return '<g class="doll-crown"><path class="pc" d="M116 54 q34 -26 68 0 z" fill="'+FELT.lilacL+'"/>'
      + '<path class="pc" d="M150 22 l9 20 l-18 0 z" fill="'+FELT.butter+'"/>'
      + '<circle cx="128" cy="44" r="4.4" fill="'+FELT.pink+'"/><circle cx="172" cy="44" r="4.4" fill="'+FELT.pink+'"/></g>';
  },
  'crown-flower': function(){
    return '<g class="doll-crown">'+feltFlower(120,48,14, FELT.pink)+feltFlower(150,40,15, FELT.butter)
      + feltFlower(180,48,14, FELT.lilac)+'</g>';
  }
};
const SHOE_FELT = {
  'shoes-glass': FELT.skyL,
  'shoes-ballet': FELT.pink
};

function princessSVG(eq){
  eq = eq || {};
  const dressFn = DRESS_FELT[eq.dress] || DRESS_FELT['dress-pink'];
  const crownFn = CROWN_FELT[eq.crown] || null;
  const shoeCol = SHOE_FELT[eq.shoes] || SHOE_FELT['shoes-ballet'];
  const wings   = eq.wings === 'wings-fairy';
  const neck    = !!eq.necklace;

  const inner = ''
  + '<ellipse cx="150" cy="452" rx="80" ry="12" fill="'+FELT.shadow+'"/>'
  /* wings sit behind the doll, pivoting at 150,196 */
  + (wings ? '<g class="doll-wings">'
      + '<path class="pc" d="M118 196 q-70 -54 -66 10 q-2 56 66 22 z" fill="'+FELT.skyL+'" opacity=".92"/>'
      + '<path class="pc" d="M182 196 q70 -54 66 10 q2 56 -66 22 z" fill="'+FELT.skyL+'" opacity=".92"/>'
      + '</g>' : '')
  /* --- base doll: legs, shoes, arms, torso --- */
  + '<g class="doll-base">'
    + '<rect class="pc" x="132" y="330" width="18" height="98" rx="9" fill="'+DOLL.skin+'"/>'
    + '<rect class="pc" x="152" y="330" width="18" height="98" rx="9" fill="'+DOLL.skin+'"/>'
    + '<ellipse class="pc" cx="132" cy="432" rx="20" ry="13" fill="'+shoeCol+'"/>'
    + '<ellipse class="pc" cx="168" cy="432" rx="20" ry="13" fill="'+shoeCol+'"/>'
    + '<path class="pc" d="M112 158 q-18 44 -14 92 q1 12 14 10 q10 -2 8 -12 q-4 -42 10 -78 z" fill="'+DOLL.skin+'"/>'
    + '<path class="pc" d="M188 158 q18 44 14 92 q-1 12 -14 10 q-10 -2 -8 -12 q4 -42 -10 -78 z" fill="'+DOLL.skin+'"/>'
    + '<rect class="pc" x="120" y="150" width="60" height="106" rx="24" fill="'+DOLL.skin+'"/>'
  + '</g>'
  /* --- outfit --- */
  + '<g class="doll-dress">' + dressFn() + '</g>'
  + (neck ? '<g class="doll-neck"><path d="M132 168 q18 18 36 0" fill="none" stroke="'+FELT.butter+'" stroke-width="4"/>'
      + feltStar(150,180,9, FELT.butter)+'</g>' : '')
  /* --- head: hair behind, face, hair in front --- */
  + '<g class="doll-head">'
    + '<ellipse class="pc" cx="150" cy="112" rx="62" ry="66" fill="'+DOLL.hair+'"/>'
    + '<ellipse class="pc" cx="96"  cy="164" rx="22" ry="46" fill="'+DOLL.hairL+'"/>'
    + '<ellipse class="pc" cx="204" cy="164" rx="22" ry="46" fill="'+DOLL.hairL+'"/>'
    + '<circle class="pc" cx="150" cy="96" r="48" fill="'+DOLL.skin+'"/>'
    /* fringe */
    + '<path class="pc" d="M102 88 q6 -46 48 -46 q42 0 48 46 q-24 -20 -48 -20 q-24 0 -48 20 z" fill="'+DOLL.hairD+'"/>'
    + feltCheek(122,110,15) + feltCheek(178,110,15)
    + feltEye(132,94,9) + feltEye(168,94,9)
    + '<path d="M141 116 q9 9 18 0" fill="none" stroke="'+FELT.plum+'" stroke-width="3.4" stroke-linecap="round"/>'
    + '<ellipse cx="150" cy="106" rx="3" ry="2.4" fill="'+DOLL.skinD+'"/>'
  + '</g>'
  + (crownFn ? crownFn() : '');

  return feltSVG('0 0 300 480', inner, 'princess-felt');
}

/* Swatches for the dressing-room trays — the actual garment, shrunk. */
function swatchWrap(inner, vb){
  return '<svg class="felt swatch-felt" viewBox="'+(vb||'0 0 300 480')+'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+FELT_DEFS+inner+'</svg>';
}
function dressSwatch(id){
  const fn = DRESS_FELT[id] || DRESS_FELT['dress-pink'];
  return swatchWrap('<g transform="translate(0,-120)">'+fn()+'</g>', '30 20 240 300');
}
function crownSwatch(id){
  const fn = CROWN_FELT[id] || CROWN_FELT['crown-flower'];
  return swatchWrap(fn(), '100 14 100 56');
}
function shoeSwatch(id){
  const c = SHOE_FELT[id] || SHOE_FELT['shoes-ballet'];
  return swatchWrap('<ellipse class="pc" cx="70" cy="40" rx="26" ry="17" fill="'+c+'"/>'
    + '<ellipse class="pc" cx="130" cy="40" rx="26" ry="17" fill="'+c+'"/>', '30 10 140 60');
}
function wingSwatch(){
  return swatchWrap('<path class="pc" d="M100 60 q-70 -54 -66 10 q-2 56 66 22 z" fill="'+FELT.skyL+'"/>'
    + '<path class="pc" d="M100 60 q70 -54 66 10 q2 56 -66 22 z" fill="'+FELT.skyL+'"/>', '20 0 160 110');
}
function necklaceSwatch(){
  return swatchWrap('<path d="M40 20 q60 60 120 0" fill="none" stroke="'+FELT.butter+'" stroke-width="7"/>'
    + feltStar(100,58,22, FELT.butter), '20 0 160 100');
}
/* Pets and room props also get felt art instead of emoji. */
function petSwatch(id){
  /* 'Snowy' is a white kitten, but pure white on a pale cushion reads as a
     blob — cream keeps her white-ish and still visible. */
  const coat = id==='pet-orange' ? FELT.peach
             : id==='pet-unicorn' ? FELT.pinkL
             : id==='pet-moon' ? FELT.lilacL
             : FELT.cream;
  const horn = (id==='pet-unicorn' || id==='pet-moon');
  return swatchWrap(
      '<ellipse cx="100" cy="132" rx="44" ry="9" fill="'+FELT.shadow+'"/>'
    + '<ellipse class="pc" cx="100" cy="104" rx="40" ry="31" fill="'+coat+'"/>'
    + '<ellipse cx="100" cy="112" rx="22" ry="19" fill="'+FELT.white+'" opacity=".7"/>'
    /* tail */
    + '<path class="pc" d="M138 112 q30 4 26 -24 q-2 -11 -11 -8 q-7 3 -2 11 q4 11 -15 11 z" fill="'+coat+'"/>'
    /* ears: tall triangles clearly clear of the head circle */
    + '<path class="pc" d="M70 44 l-6 -34 l30 20 z" fill="'+coat+'"/>'
    + '<path class="pc" d="M130 44 l6 -34 l-30 20 z" fill="'+coat+'"/>'
    + '<path d="M74 40 l-3 -19 l16 11 z" fill="'+FELT.pinkL+'"/>'
    + '<path d="M126 40 l3 -19 l-16 11 z" fill="'+FELT.pinkL+'"/>'
    + (horn ? '<path class="pc" d="M100 2 l11 32 l-22 0 z" fill="'+FELT.butter+'"/>' : '')
    + '<circle class="pc" cx="100" cy="62" r="34" fill="'+coat+'"/>'
    + feltCheek(76,74,12) + feltCheek(124,74,12)
    + feltEye(88,58,7.5) + feltEye(112,58,7.5)
    + '<path d="M100 70 l-4 5 l8 0 z" fill="'+FELT.rose+'"/>'
    + '<path d="M92 80 q8 7 16 0" fill="none" stroke="'+FELT.plum+'" stroke-width="2.6" stroke-linecap="round"/>'
    + '<g stroke="'+FELT.plum+'" stroke-width="2" stroke-linecap="round" opacity=".5" fill="none">'
    + '<path d="M68 74 l-14 -4 M68 80 l-14 3 M132 74 l14 -4 M132 80 l14 3"/></g>',
    '40 -6 120 152');
}

/* Room props and every other reward, as felt stickers instead of emoji.
   One entry point so the chest, the trays and the room all agree. */
function rewardFeltArt(r){
  if(!r) return '';
  try{
    if(r.cat==='dress')    return dressSwatch(r.id);
    if(r.cat==='crown')    return crownSwatch(r.id);
    if(r.cat==='shoes')    return shoeSwatch(r.id);
    if(r.cat==='wings')    return wingSwatch();
    if(r.cat==='necklace') return necklaceSwatch();
    if(r.cat==='pet')      return petSwatch(r.id);
    if(r.cat==='wallpaper'){
      const base = r.id==='wall-star' ? FELT.lilacD : FELT.pinkL;
      return swatchWrap('<rect class="pc" x="16" y="16" width="128" height="98" rx="14" fill="'+base+'"/>'
        + feltStar(52,52,13, FELT.white) + feltStar(104,80,11, FELT.white) + feltStar(84,40,9, FELT.butter),
        '0 0 160 130');
    }
    if(r.cat==='window'){
      return swatchWrap('<rect class="pc" x="18" y="16" width="124" height="96" rx="14" fill="'+FELT.skyL+'"/>'
        + '<g fill="none" stroke-linecap="round">'
        + '<path d="M30 104 A50 50 0 0 1 130 104" stroke="'+FELT.pinkD+'" stroke-width="11"/>'
        + '<path d="M42 104 A38 38 0 0 1 118 104" stroke="'+FELT.butter+'" stroke-width="11"/>'
        + '<path d="M54 104 A26 26 0 0 1 106 104" stroke="'+FELT.mint+'" stroke-width="11"/></g>'
        + '<rect x="76" y="16" width="8" height="96" fill="'+FELT.white+'"/>', '0 0 160 130');
    }
    if(r.cat==='furniture'){
      if(r.id==='lamp-chandelier'){
        return swatchWrap('<path d="M80 6 v22" stroke="'+FELT.butterD+'" stroke-width="5"/>'
          + '<path class="pc" d="M30 66 q50 -46 100 0 q-50 24 -100 0 z" fill="'+FELT.butter+'"/>'
          + '<circle cx="50" cy="80" r="9" fill="'+FELT.white+'"/><circle cx="80" cy="90" r="10" fill="'+FELT.white+'"/>'
          + '<circle cx="110" cy="80" r="9" fill="'+FELT.white+'"/>', '0 0 160 110');
      }
      return swatchWrap('<rect class="pc" x="20" y="56" width="120" height="46" rx="12" fill="'+FELT.tanD+'"/>'
        + '<rect class="pc" x="20" y="44" width="120" height="26" rx="12" fill="'+FELT.pink+'"/>'
        + '<rect class="pc" x="30" y="30" width="44" height="26" rx="11" fill="'+FELT.white+'"/>', '0 0 160 116');
    }
    if(r.cat==='decor'){
      if(r.id==='decor-throne')
        return swatchWrap('<rect class="pc" x="46" y="52" width="68" height="56" rx="10" fill="'+FELT.lilacD+'"/>'
          + '<path class="pc" d="M46 56 q34 -46 68 0 z" fill="'+FELT.pinkD+'"/>' + feltStar(80,30,11, FELT.butter), '0 0 160 120');
      if(r.id==='decor-painting')
        return swatchWrap('<rect class="pc" x="20" y="18" width="120" height="90" rx="10" fill="'+FELT.butter+'"/>'
          + '<rect class="pc" x="32" y="30" width="96" height="66" rx="6" fill="'+FELT.skyL+'"/>'
          + '<g transform="translate(44,34) scale(0.72)">'+unicornHeadSVG()+'</g>', '0 0 160 126');
      return swatchWrap(feltFlower(56,66,26, FELT.pink) + feltFlower(104,58,24, FELT.butter)
        + feltFlower(80,92,20, FELT.lilac)
        + '<path class="pc" d="M50 92 q30 26 60 0 l-8 34 q-22 8 -44 0 z" fill="'+FELT.mint+'"/>', '0 0 160 140');
    }
  }catch(e){}
  return swatchWrap(feltStar(80,60,44, FELT.butter), '0 0 160 120');
}

/* ---------------- DOLLHOUSE BEDROOM ---------------------------------
   The room fills the screen and reads as a playset: wardrobe, bed, vanity
   with mirror, rug, crown shelf, pet cushion, window, wall decorations.
   Hook classes are kept identical to the old room so renderRoom() keeps
   working: .room-wall-fill .room-stars .room-chandelier .room-pet
   .room-window .room-decor and the [data-zone] tap targets. */
function feltRoomSVG(){
  /* A little breathing room around the furniture: the extra viewBox margin
     stops a wide tablet from cropping into the wardrobe and the bed. */
  return '<svg class="room-svg felt" viewBox="-70 -40 1040 620" preserveAspectRatio="xMidYMax slice" '
    + 'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
  + FELT_DEFS
  /* wall + floor */
  + '<rect class="room-wall-fill" x="-90" y="-60" width="1180" height="452" fill="'+FELT.pinkL+'"/>'
  + '<g class="room-stars" opacity=".55">'
    + feltStar(120,70,10, FELT.white) + feltStar(320,42,8, FELT.white)
    + feltStar(560,80,11, FELT.white) + feltStar(790,50,9, FELT.white)
    + feltStar(680,150,7, FELT.white) + feltStar(210,160,8, FELT.white)
  + '</g>'
  + '<rect x="-90" y="392" width="1180" height="230" fill="'+FELT.tan+'"/>'
  + '<path d="M-90 392 h1180" stroke="'+FELT.tanD+'" stroke-width="6"/>'
  + '<g stroke="'+FELT.tanD+'" stroke-width="2.5" opacity=".5">'
    + '<path d="M-60 392 v230 M100 392 v230 M260 392 v230 M420 392 v230 M580 392 v230 M740 392 v230 M900 392 v230"/></g>'
  /* rug */
  + '<ellipse class="pc" cx="450" cy="486" rx="250" ry="58" fill="'+FELT.lilacL+'"/>'
  + '<ellipse class="pc" cx="450" cy="486" rx="186" ry="42" fill="'+FELT.white+'"/>'
  + '<ellipse cx="450" cy="486" rx="120" ry="26" fill="'+FELT.pinkL+'"/>'
  /* window with felt curtains */
  + '<g class="room-window" data-zone="window">'
    + '<rect class="pc" x="330" y="60" width="200" height="150" rx="16" fill="'+FELT.skyL+'"/>'
    + '<path class="pc" d="M330 176 q50 -30 100 -6 q50 24 100 -4 l0 44 l-200 0 z" fill="'+FELT.mint+'"/>'
    + '<rect x="424" y="60" width="12" height="150" fill="'+FELT.white+'"/>'
    + '<rect x="330" y="128" width="200" height="12" fill="'+FELT.white+'"/>'
    + '<path class="pc" d="M312 48 q28 100 6 168 l-38 0 l0 -168 z" fill="'+FELT.pinkD+'"/>'
    + '<path class="pc" d="M548 48 q-28 100 -6 168 l38 0 l0 -168 z" fill="'+FELT.pinkD+'"/>'
    + '<rect class="pc" x="268" y="38" width="324" height="16" rx="8" fill="'+FELT.butter+'"/>'
    + '<g class="room-window-art"></g>'
  + '</g>'
  /* wardrobe (dress tray) */
  + '<g data-zone="dress" class="room-hot">'
    + '<rect class="pc" x="42" y="150" width="196" height="278" rx="16" fill="'+FELT.lilacD+'"/>'
    + '<rect class="pc" x="56" y="166" width="80" height="246" rx="10" fill="'+FELT.lilacL+'"/>'
    + '<rect class="pc" x="144" y="166" width="80" height="246" rx="10" fill="'+FELT.lilacL+'"/>'
    + '<circle cx="130" cy="290" r="7" fill="'+FELT.butter+'"/><circle cx="152" cy="290" r="7" fill="'+FELT.butter+'"/>'
    + '<path class="pc" d="M36 150 q104 -44 208 0 z" fill="'+FELT.lilac+'"/>'
    + feltStar(140,132,13, FELT.butter)
    + feltStitch('M70 200 q30 14 56 0','rgba(255,255,255,.7)',2.4)
  + '</g>'
  /* bed */
  + '<g class="room-bed">'
    + '<rect class="pc" x="628" y="300" width="238" height="112" rx="18" fill="'+FELT.tanD+'"/>'
    + '<rect class="pc" x="628" y="284" width="238" height="52" rx="18" fill="'+FELT.pink+'"/>'
    + '<rect class="pc" x="838" y="220" width="34" height="180" rx="14" fill="'+FELT.tanD+'"/>'
    + '<rect class="pc" x="616" y="200" width="34" height="200" rx="14" fill="'+FELT.tanD+'"/>'
    + '<rect class="pc" x="648" y="256" width="86" height="52" rx="18" fill="'+FELT.white+'"/>'
    + feltStitch('M660 340 q100 24 196 0','rgba(255,255,255,.8)',3)
    + '<path class="pc" d="M596 168 q76 -52 152 0 q-8 26 -76 26 q-68 0 -76 -26 z" fill="'+FELT.pinkD+'"/>'
    + '<path class="pc" d="M600 176 q-14 84 4 130 l-26 0 q-12 -80 0 -130 z" fill="'+FELT.pinkL+'" opacity=".9"/>'
    + '<path class="pc" d="M744 176 q14 84 -4 130 l26 0 q12 -80 0 -130 z" fill="'+FELT.pinkL+'" opacity=".9"/>'
  + '</g>'
  /* vanity + mirror */
  + '<g data-zone="crown" class="room-hot">'
    + '<rect class="pc" x="270" y="330" width="150" height="86" rx="12" fill="'+FELT.tanD+'"/>'
    + '<ellipse class="pc" cx="345" cy="270" rx="62" ry="74" fill="'+FELT.butter+'"/>'
    + '<ellipse class="pc" cx="345" cy="270" rx="48" ry="60" fill="'+FELT.skyL+'"/>'
    + '<path d="M320 240 q22 -16 44 4" stroke="'+FELT.white+'" stroke-width="9" fill="none" stroke-linecap="round" opacity=".9"/>'
    + '<circle cx="300" cy="360" r="8" fill="'+FELT.butter+'"/><circle cx="390" cy="360" r="8" fill="'+FELT.butter+'"/>'
  + '</g>'
  /* crown shelf */
  + '<g class="room-shelf">'
    + '<rect class="pc" x="470" y="252" width="120" height="14" rx="7" fill="'+FELT.tanD+'"/>'
    + '<g class="room-shelf-art"></g>'
  + '</g>'
  /* pet cushion */
  + '<g data-zone="pet" class="room-hot">'
    + '<ellipse class="pc" cx="150" cy="470" rx="76" ry="32" fill="'+FELT.mint+'"/>'
    + '<ellipse class="pc" cx="150" cy="462" rx="58" ry="23" fill="'+FELT.white+'" opacity=".8"/>'
    + '<g class="room-pet"></g>'
  + '</g>'
  /* chandelier (furniture reward) */
  + '<g class="room-chandelier" style="display:none">'
    + '<path d="M450 0 v34" stroke="'+FELT.butterD+'" stroke-width="5"/>'
    + '<path class="pc" d="M398 66 q52 -46 104 0 q-52 24 -104 0 z" fill="'+FELT.butter+'"/>'
    + '<circle cx="418" cy="80" r="8" fill="'+FELT.white+'"/><circle cx="450" cy="88" r="9" fill="'+FELT.white+'"/>'
    + '<circle cx="482" cy="80" r="8" fill="'+FELT.white+'"/>'
  + '</g>'
  /* wall decorations */
  + '<g class="room-decor"></g>'
  + '</svg>';
}
function mountCastleRoom(){
  const room = document.getElementById('castle-room');
  if(!room) return;
  try{ if(typeof Art!=='undefined') Art.bg(room, 'bg-bedroom'); }catch(e){}
  if(!room.querySelector('.room-svg')){
    room.innerHTML = feltRoomSVG() + '<div id="princess-mount" aria-label="Princess Layla"></div>';
    room.querySelectorAll('[data-zone]').forEach(function(z){
      z.addEventListener('click', function(){
        const tab = z.getAttribute('data-zone');
        if(typeof setClosetTab==='function'){
          setClosetTab(tab==='dress' ? 'dress' : (tab==='crown' ? 'crown' : (tab==='window' ? 'window' : 'pet')));
        }
      });
    });
  }
}
