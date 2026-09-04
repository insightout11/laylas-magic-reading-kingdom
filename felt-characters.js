/* ============================================================
   FELT CHARACTERS + KINGDOM SCENE
   Loaded AFTER characters.js so these function declarations replace the
   older pseudo-storybook drawings. The old file still supplies the small
   word-picture icons, which are unchanged.

   Every character here is built from stacked felt pieces with die-cut
   sticker borders (.pc) and visible stitching (.st). Anatomy is
   deliberately simplified: a big round head, a compact body, stubby legs.
   The cuteness comes from the toy-ness, not from anatomical accuracy.
   ============================================================ */
'use strict';

/* ---------------- UNICORN — plush felt toy ---------------------------
   Poses are the SAME shapes with swapped eyes plus a CSS transform, so a
   pose change is a cheap innerHTML swap, never a rig. */
function unicornSVG(mood){
  const happy = (mood==='happy');
  const listen = (mood==='listening');
  const eyes = happy
    ? feltEye(132,116,12,'happy') + feltEye(188,116,12,'happy')
    : feltEye(132,116,12) + feltEye(188,116,12);

  /* Mane lobes fan out from BEHIND the head so the head silhouette stays
     clean; the horn is drawn on top of all of them so it always reads. */
  const mane = ''
    + feltLobe( 92,  86, 30, 34, FELT.lilac, -18)
    + feltLobe(228,  86, 30, 34, FELT.mint,   18)
    + feltLobe( 84, 128, 27, 31, FELT.pink,  -12)
    + feltLobe(236, 128, 27, 31, FELT.butter, 12)
    + feltLobe(160,  44, 46, 26, FELT.pink,    0)
    + feltLobe(124,  56, 26, 23, FELT.lilac, -22)
    + feltLobe(196,  56, 26, 23, FELT.mint,   22);

  const inner = ''
  + '<ellipse cx="160" cy="302" rx="88" ry="13" fill="'+FELT.shadow+'"/>'
  + '<g class="uni-body">'
    /* back legs */
    + '<rect class="pc" x="100" y="248" width="30" height="54" rx="15" fill="'+FELT.peach+'"/>'
    + '<rect class="pc" x="190" y="248" width="30" height="54" rx="15" fill="'+FELT.peach+'"/>'
    /* tail: layered lobes */
    + '<g class="uni-tail">'
      + feltLobe(256,216,21,31, FELT.mint,  24)
      + feltLobe(266,236,18,26, FELT.lilac, 30)
      + feltLobe(272,256,15,21, FELT.pink,  36)
    + '</g>'
    /* body — sits low and wide so it is not swallowed by the head */
    + '<ellipse class="pc" cx="160" cy="236" rx="78" ry="56" fill="'+FELT.cream+'"/>'
    + '<ellipse cx="160" cy="252" rx="50" ry="34" fill="'+FELT.pinkL+'" opacity=".6"/>'
    + feltStitch('M104 240 q56 32 112 0', 'rgba(158,116,172,.45)', 2.4)
    /* front legs + hooves */
    + '<rect class="pc" x="120" y="258" width="32" height="50" rx="16" fill="'+FELT.cream+'"/>'
    + '<rect class="pc" x="170" y="258" width="32" height="50" rx="16" fill="'+FELT.cream+'"/>'
    + '<rect class="pc" x="120" y="288" width="32" height="20" rx="10" fill="'+FELT.lilacD+'"/>'
    + '<rect class="pc" x="170" y="288" width="32" height="20" rx="10" fill="'+FELT.lilacD+'"/>'
  + '</g>'
  + '<g class="uni-head">'
    /* ears behind the head */
    + '<path class="pc" d="M114 78 q-16 -32 4 -38 q16 -4 21 32 z" fill="'+FELT.cream+'"/>'
    + '<path class="pc" d="M206 78 q16 -32 -4 -38 q-16 -4 -21 32 z" fill="'+FELT.cream+'"/>'
    + '<path d="M118 72 q-9 -20 2 -24 q9 -2 12 20 z" fill="'+FELT.pinkL+'"/>'
    + '<path d="M202 72 q9 -20 -2 -24 q-9 -2 -12 20 z" fill="'+FELT.pinkL+'"/>'
    + '<g class="uni-mane">'+mane+'</g>'
    /* head */
    + '<circle class="pc" cx="160" cy="118" r="66" fill="'+FELT.cream+'"/>'
    + '<ellipse class="pc" cx="160" cy="150" rx="43" ry="31" fill="'+FELT.white+'"/>'
    + feltCheek(112,140,21) + feltCheek(208,140,21)
    + eyes
    + '<ellipse cx="148" cy="144" rx="4" ry="5" fill="'+FELT.plum+'" opacity=".6"/>'
    + '<ellipse cx="172" cy="144" rx="4" ry="5" fill="'+FELT.plum+'" opacity=".6"/>'
    + '<path d="M149 162 q11 10 22 0" fill="none" stroke="'+FELT.plum+'" stroke-width="3.6" stroke-linecap="round"/>'
    /* horn LAST so nothing can hide it — the spec asks for a clear horn */
    + '<g class="uni-horn">'
      + '<path class="pc" d="M160 2 L184 68 L136 68 Z" fill="url(#felt-horn)" stroke-width="7"/>'
      + '<path d="M144 58 L176 58 M148 44 L172 44 M152 30 L168 30 M155 18 L165 18" '
        + 'stroke="'+FELT.butterD+'" stroke-width="5" stroke-linecap="round" opacity=".85"/>'
      + '<circle class="horn-spark" cx="160" cy="8" r="7" fill="'+FELT.butter+'" opacity="0"/>'
    + '</g>'
  + '</g>';

  return feltSVG('-6 -6 332 332', inner, 'unicorn-felt',
    'data-pose="'+(happy?'happy':(listen?'listening':'idle'))+'"');
}
function unicornHeadSVG(){
  /* Small head-only mark for the meadow signpost. */
  return '<g transform="translate(2,4) scale(0.92)">'
    + '<path class="pc" d="M18 22 q-6 -12 2 -14 q7 -2 8 12 z" fill="'+FELT.cream+'"/>'
    + '<path class="pc" d="M46 22 q6 -12 -2 -14 q-7 -2 -8 12 z" fill="'+FELT.cream+'"/>'
    + '<path class="pc" d="M32 2 L39 20 L25 20 Z" fill="'+FELT.butter+'"/>'
    + '<ellipse class="pc" cx="20" cy="22" rx="10" ry="11" fill="'+FELT.lilac+'"/>'
    + '<ellipse class="pc" cx="44" cy="22" rx="10" ry="11" fill="'+FELT.mint+'"/>'
    + '<circle class="pc" cx="32" cy="36" r="20" fill="'+FELT.cream+'"/>'
    + '<ellipse cx="32" cy="46" rx="12" ry="9" fill="'+FELT.white+'"/>'
    + '<circle cx="25" cy="35" r="3.4" fill="'+FELT.ink+'"/><circle cx="39" cy="35" r="3.4" fill="'+FELT.ink+'"/>'
    + feltCheek(21,42,6) + feltCheek(43,42,6)
    + '</g>';
}

/* ---------------- TWINKLE — plush winged kitten ----------------------
   Poses: idle | talking | happy | flying | pointing. Same body, swapped
   mouth/eyes/paw, plus a CSS class for the motion. No emoji anywhere. */
function twinkleSVG(cls, pose){
  pose = pose || 'idle';
  const talking = pose==='talking';
  const happy   = pose==='happy';
  const flying  = pose==='flying';
  const pointing= pose==='pointing';

  const eyes = happy
    ? feltEye(78,96,10,'happy') + feltEye(122,96,10,'happy')
    : feltEye(78,96,10) + feltEye(122,96,10);

  const mouth = talking
    ? '<ellipse cx="100" cy="122" rx="11" ry="13" fill="'+FELT.plum+'"/>'
      + '<ellipse cx="100" cy="128" rx="7" ry="6" fill="'+FELT.rose+'"/>'
    : '<path d="M90 118 q10 10 20 0" fill="none" stroke="'+FELT.plum+'" stroke-width="3.4" stroke-linecap="round"/>'
      + '<path d="M100 112 l0 6" stroke="'+FELT.plum+'" stroke-width="3" stroke-linecap="round"/>';

  const paw = pointing
    ? '<g class="tw-point"><ellipse class="pc" cx="158" cy="168" rx="17" ry="14" fill="'+FELT.white+'"/>'
      + '<circle cx="164" cy="164" r="3.2" fill="'+FELT.pinkD+'" opacity=".6"/></g>'
    : '<ellipse class="pc" cx="140" cy="182" rx="16" ry="13" fill="'+FELT.white+'"/>';

  const inner = ''
  + '<ellipse cx="100" cy="214" rx="52" ry="9" fill="'+FELT.shadow+'" class="tw-shadow"/>'
  /* wings behind everything */
  + '<g class="tw-wings">'
    + '<path class="pc" d="M62 108 q-46 -34 -40 6 q4 34 40 20 z" fill="'+FELT.skyL+'"/>'
    + '<path class="pc" d="M138 108 q46 -34 40 6 q-4 34 -40 20 z" fill="'+FELT.skyL+'"/>'
    + '<path d="M34 100 q10 14 22 20 M30 116 q14 8 26 12" stroke="'+FELT.sky+'" stroke-width="3" fill="none" stroke-linecap="round"/>'
    + '<path d="M166 100 q-10 14 -22 20 M170 116 q-14 8 -26 12" stroke="'+FELT.sky+'" stroke-width="3" fill="none" stroke-linecap="round"/>'
  + '</g>'
  /* body */
  + '<ellipse class="pc" cx="100" cy="168" rx="46" ry="44" fill="'+FELT.lilacL+'"/>'
  + '<ellipse cx="100" cy="180" rx="26" ry="24" fill="'+FELT.white+'" opacity=".75"/>'
  + feltStitch('M64 170 q36 26 72 0', 'rgba(169,140,224,.5)', 2.2)
  + '<ellipse class="pc" cx="60" cy="182" rx="16" ry="13" fill="'+FELT.white+'"/>'
  + paw
  /* tail */
  + '<path class="pc tw-tail" d="M144 190 q40 6 34 -30 q-3 -14 -14 -10 q-8 4 -3 14 q6 14 -20 14 z" fill="'+FELT.lilacL+'"/>'
  /* head */
  + '<g class="tw-head">'
    + '<path class="pc" d="M62 68 q-6 -34 8 -34 q12 0 22 26 z" fill="'+FELT.lilacL+'"/>'
    + '<path class="pc" d="M138 68 q6 -34 -8 -34 q-12 0 -22 26 z" fill="'+FELT.lilacL+'"/>'
    + '<path d="M70 62 q-3 -18 4 -20 q6 0 12 16 z" fill="'+FELT.pinkL+'"/>'
    + '<path d="M130 62 q3 -18 -4 -20 q-6 0 -12 16 z" fill="'+FELT.pinkL+'"/>'
    + '<circle class="pc" cx="100" cy="96" r="52" fill="'+FELT.lilacL+'"/>'
    + '<ellipse cx="100" cy="116" rx="30" ry="22" fill="'+FELT.white+'" opacity=".85"/>'
    + feltCheek(70,114,15) + feltCheek(130,114,15)
    + eyes
    + mouth
    /* whiskers */
    + '<g stroke="'+FELT.plum+'" stroke-width="2.4" stroke-linecap="round" opacity=".55" fill="none">'
      + '<path d="M58 112 l-18 -5 M58 120 l-19 4"/>'
      + '<path d="M142 112 l18 -5 M142 120 l19 4"/>'
    + '</g>'
    /* little felt crown */
    + '<path class="pc" d="M78 50 l6 -20 l8 12 l8 -18 l8 18 l8 -12 l6 20 z" fill="'+FELT.butter+'"/>'
    + '<circle cx="100" cy="40" r="3.6" fill="'+FELT.rose+'"/>'
  + '</g>';

  return feltSVG('0 0 200 224', inner, 'twinkle-felt '+(cls||''),
    'data-pose="'+pose+'"'+(flying?' data-fly="1"':''));
}

/* ---------------- REWARD CHEST ---------------------------------------
   Closed state hides the contents completely — the reward is never in the
   DOM before the reveal (see showReward). */
function chestSVG(open){
  /* Open state: the lid tips BACK behind the box (drawn first, so the box
     overlaps it) and a dark opening appears at the rim. Swinging a thin
     dome far enough to clear the box just reads as a floating crescent. */
  const lidShape = ''
    + '<path class="pc" d="M46 116 q94 -76 188 0 z" fill="'+FELT.tanD+'"/>'
    + '<path d="M46 116 q94 -76 188 0" fill="none" stroke="'+FELT.butter+'" stroke-width="7" stroke-linecap="round"/>'
    + feltStitch('M64 104 q76 -50 152 0', 'rgba(255,255,255,.6)', 2.2);

  const inner = ''
  + '<ellipse cx="140" cy="226" rx="92" ry="14" fill="'+FELT.shadow+'"/>'
  /* lid behind the box when open, on top of it when closed */
  + (open
      ? '<g class="chest-lid" transform="rotate(-34 52 114) translate(0,-16)">'+lidShape+'</g>'
      : '')
  + (open ? '<ellipse cx="140" cy="116" rx="80" ry="24" fill="'+FELT.plum+'"/>'
          + '<ellipse cx="140" cy="112" rx="66" ry="18" fill="'+FELT.butter+'" filter="url(#felt-glow)" opacity=".95"/>' : '')
  /* box */
  + '<rect class="pc" x="46" y="112" width="188" height="106" rx="18" fill="'+FELT.tan+'"/>'
  + '<rect x="46" y="150" width="188" height="20" fill="'+FELT.butterD+'" opacity=".85"/>'
  + feltStitch('M60 200 h160', 'rgba(255,255,255,.7)', 2.4)
  /* corner studs */
  + '<circle cx="64" cy="130" r="5" fill="'+FELT.butter+'"/><circle cx="216" cy="130" r="5" fill="'+FELT.butter+'"/>'
  + '<circle cx="64" cy="204" r="5" fill="'+FELT.butter+'"/><circle cx="216" cy="204" r="5" fill="'+FELT.butter+'"/>'
  + (open ? '' : '<g class="chest-lid">'+lidShape+'</g>')
  /* clasp */
  + '<rect class="pc" x="124" y="140" width="32" height="34" rx="9" fill="'+FELT.butter+'"/>'
  + '<circle cx="140" cy="157" r="6" fill="'+FELT.tanD+'"/>';
  return feltSVG('0 0 280 250', inner, 'chest-felt', 'data-open="'+(open?'1':'0')+'"');
}

/* ---------------- KINGDOM — one full-bleed felt playset ---------------
   Three depth layers (bg / mid / fg). The landmarks themselves live in the
   HTML as buttons so they stay tappable and labelled; this is the scenery
   they sit inside. No cards, no panels — the world IS the menu. */
function feltWorldScene(){
  let sky='', hills='', mid='', fg='';

  /* --- background: sky, sun, clouds, far hills, distant towers --- */
  sky = '<rect width="1200" height="700" fill="url(#sky-grad)"/>'
      + '<circle cx="1044" cy="92" r="86" fill="'+FELT.butter+'" opacity=".30"/>'
      + '<circle class="pc" cx="1044" cy="92" r="52" fill="'+FELT.butter+'"/>';
  /* clouds */
  [[130,110,1],[380,72,.8],[700,120,.9],[930,180,.6],[240,210,.55]].forEach(function(c){
    const x=c[0], y=c[1], s=c[2];
    sky += '<g class="cloud" filter="url(#felt-soft)" transform="translate('+x+','+y+') scale('+s+')" style="--d:'+(s*7).toFixed(1)+'s">'
      + '<ellipse class="pc" cx="0"  cy="0"  rx="46" ry="30" fill="'+FELT.white+'"/>'
      + '<ellipse class="pc" cx="42" cy="8"  rx="36" ry="24" fill="'+FELT.white+'"/>'
      + '<ellipse class="pc" cx="-40" cy="10" rx="32" ry="21" fill="'+FELT.white+'"/>'
      + '</g>';
  });
  /* Far hills. Everything decorative stays inside x 120..1080 — the scene
     is drawn with preserveAspectRatio="slice", so the outer ~90px on each
     side is cropped away on a 4:3 tablet. */
  hills = '<path class="pc" d="M-20 430 q180 -74 360 -18 q30 9 58 14 l0 320 l-418 0 z" fill="'+FELT.mintD+'" opacity=".7"/>'
    + '<path class="pc" d="M700 448 q180 -96 360 -20 q90 34 160 12 l0 300 l-520 0 z" fill="'+FELT.mintD+'" opacity=".7"/>'
    + '<path class="pc" d="M-20 470 q160 -110 340 -34 q170 72 330 -22 q180 -104 380 10 q90 28 190 6 l0 300 l-1240 0 z" fill="'+FELT.mint+'"/>'
    /* a felt treeline gives the middle band something to be */
    + feltTreeline()
    + '<path class="pc" d="M-20 540 q220 -76 440 -14 q240 66 470 -22 q170 -64 330 4 l0 220 l-1240 0 z" fill="'+FELT.grass+'"/>'
    + feltStitch('M120 556 q180 -52 360 -4 q240 62 420 -20 q100 -36 180 0', 'rgba(255,255,255,.62)', 3);

  /* --- midground: river, rainbow arc behind the road, tree line --- */
  mid = '<path class="pc" d="M-20 690 q180 -60 300 -6 q120 46 260 4 q140 -42 300 8 q120 40 380 -14 l0 60 l-1240 0 z" fill="'+FELT.skyL+'" opacity=".9"/>';
  /* felt bushes */
  [[70,600,1],[300,640,.85],[560,612,.7],[820,646,.9],[1130,606,.8]].forEach(function(b){
    mid += '<g transform="translate('+b[0]+','+b[1]+') scale('+b[2]+')">'
      + feltLobe(0,0,44,30, FELT.grassD)
      + feltLobe(-30,8,30,22, FELT.grass)
      + feltLobe(32,10,28,20, FELT.grass)
      + '</g>';
  });

  /* --- foreground: flowers, stepping stones, butterflies, sparkles ---
     Kept above y=670 so the blooms are never sliced off by the bottom. */
  [[150,650,1.1,FELT.pink],[250,668,1,FELT.butter],[420,656,.9,FELT.lilac],
   [640,670,1.05,FELT.pink],[880,652,.95,FELT.butter],[1010,666,1.1,FELT.lilac]].forEach(function(f){
    fg += '<g transform="translate('+f[0]+','+f[1]+') scale('+f[2]+')">'
       + '<path d="M0 34 q-4 -22 0 -34" stroke="'+FELT.grassD+'" stroke-width="5" fill="none" stroke-linecap="round"/>'
       + feltFlower(0,0,20,f[3]) + '</g>';
  });
  /* stepping stones leading toward the castle */
  [[470,676,26],[540,660,22],[610,646,19],[672,634,16]].forEach(function(s){
    fg += '<ellipse class="pc" cx="'+s[0]+'" cy="'+s[1]+'" rx="'+s[2]+'" ry="'+(s[2]*0.55)+'" fill="'+FELT.lilacL+'"/>';
  });
  /* butterflies */
  [[250,470,1,'a'],[900,430,.85,'b'],[610,380,.7,'c']].forEach(function(b){
    fg += '<g class="butterfly bf-'+b[3]+'" transform="translate('+b[0]+','+b[1]+') scale('+b[2]+')">'
       + '<ellipse class="pc" cx="-10" cy="-4" rx="12" ry="9" fill="'+FELT.pink+'"/>'
       + '<ellipse class="pc" cx="10"  cy="-4" rx="12" ry="9" fill="'+FELT.butter+'"/>'
       + '<rect x="-2" y="-8" width="4" height="16" rx="2" fill="'+FELT.plum+'"/></g>';
  });
  /* drifting sparkles */
  for(let i=0;i<12;i++){
    const x=80+i*95, y=250+((i*67)%260), s=(0.5+((i*13)%7)/10).toFixed(2);
    fg += '<g class="wsparkle" style="--i:'+i+'" transform="translate('+x+','+y+') scale('+s+')">'
       + feltStar(0,0,11, FELT.white) + '</g>';
  }

  return '<svg class="world-svg felt" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" '
    + 'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + FELT_DEFS
    + '<defs><linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="#9CD3F0"/><stop offset=".48" stop-color="#CFC4F3"/>'
      + '<stop offset="1" stop-color="#FAC9DF"/></linearGradient></defs>'
    + '<g class="w-bg">'+sky+hills+'</g>'
    + '<g class="w-mid">'+mid+'</g>'
    + '<g class="w-fg">'+fg+'</g>'
    + '</svg>';
}

/* A row of felt trees along the hill line, so the middle of the screen has
   something to be instead of empty gradient. Cheap: three lobes and a trunk. */
function feltTreeline(){
  const trees = [[168,452,.78],[262,470,.62],[392,436,.9],[520,462,.66],
                 [666,444,.84],[786,468,.6],[906,440,.88],[1032,462,.7]];
  let s = '<g class="treeline">';
  trees.forEach(function(t){
    const x=t[0], y=t[1], k=t[2];
    const crown = (x % 3 < 1) ? FELT.mintD : FELT.grassD;
    s += '<g transform="translate('+x+','+y+') scale('+k+')">'
       + '<rect class="pc" x="-9" y="6" width="18" height="52" rx="8" fill="'+FELT.tanD+'"/>'
       + feltLobe(0,-24,42,34, crown)
       + feltLobe(-24,0,30,24, crown)
       + feltLobe(26,2,28,22, crown)
       + feltLobe(-6,-40,24,18, FELT.grass)
       + '</g>';
  });
  return s + '</g>';
}

/* Landmarks as felt OBJECTS in the world — never icons inside white boxes. */
function markIcon(land){
  const open='<svg class="mark-svg felt" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+FELT_DEFS;
  const close='</svg>';

  if(land==='castle'){
    return open
      + '<ellipse cx="60" cy="110" rx="46" ry="8" fill="'+FELT.shadow+'"/>'
      /* side towers */
      + '<rect class="pc" x="10" y="46" width="24" height="60" rx="7" fill="'+FELT.lilacL+'"/>'
      + '<rect class="pc" x="86" y="46" width="24" height="60" rx="7" fill="'+FELT.lilacL+'"/>'
      + '<path class="pc" d="M6 48 L22 20 L38 48 z" fill="'+FELT.pink+'"/>'
      + '<path class="pc" d="M82 48 L98 20 L114 48 z" fill="'+FELT.pink+'"/>'
      /* keep */
      + '<rect class="pc" x="32" y="58" width="56" height="48" rx="8" fill="'+FELT.white+'"/>'
      + '<path class="pc" d="M28 60 L60 24 L92 60 z" fill="'+FELT.pinkD+'"/>'
      + '<rect class="pc" x="50" y="80" width="20" height="26" rx="9" fill="'+FELT.lilacD+'"/>'
      + '<circle cx="65" cy="94" r="2.4" fill="'+FELT.butter+'"/>'
      + '<circle class="pc" cx="42" cy="70" r="5" fill="'+FELT.skyL+'"/>'
      + '<circle class="pc" cx="78" cy="70" r="5" fill="'+FELT.skyL+'"/>'
      /* flags */
      + '<path d="M22 20 l0 -12 l12 5 l-12 5" fill="'+FELT.butter+'"/>'
      + '<path d="M98 20 l0 -12 l12 5 l-12 5" fill="'+FELT.butter+'"/>'
      + feltStar(60,16,7,FELT.butter)
      + close;
  }
  if(land==='rainbow'){
    return open
      + '<g fill="none" stroke-linecap="round">'
      + '<path d="M12 100 A48 48 0 0 1 108 100" stroke="'+FELT.pinkD+'" stroke-width="13"/>'
      + '<path d="M25 100 A35 35 0 0 1 95 100" stroke="'+FELT.butter+'" stroke-width="13"/>'
      + '<path d="M38 100 A22 22 0 0 1 82 100" stroke="'+FELT.mint+'" stroke-width="13"/>'
      + '<path d="M51 100 A9 9 0 0 1 69 100" stroke="'+FELT.sky+'" stroke-width="12"/>'
      + '</g>'
      + '<ellipse class="pc" cx="14" cy="102" rx="16" ry="11" fill="'+FELT.white+'"/>'
      + '<ellipse class="pc" cx="106" cy="102" rx="16" ry="11" fill="'+FELT.white+'"/>'
      + feltStar(60,26,9,FELT.butter)
      + close;
  }
  if(land==='unicorn'){
    return open
      + '<ellipse cx="60" cy="108" rx="42" ry="8" fill="'+FELT.shadow+'"/>'
      + feltLobe(20,96,20,13, FELT.grassD) + feltLobe(100,96,20,13, FELT.grassD)
      + '<g transform="translate(30,26) scale(0.95)">'+unicornHeadSVG()+'</g>'
      + feltFlower(16,80,11, FELT.pink) + feltFlower(104,82,11, FELT.butter)
      + feltStar(96,26,8, FELT.butter) + feltStar(24,20,6, FELT.lilac)
      + close;
  }
  if(land==='kitten'){
    return open
      + '<ellipse cx="60" cy="110" rx="44" ry="8" fill="'+FELT.shadow+'"/>'
      + '<rect class="pc" x="22" y="58" width="76" height="48" rx="10" fill="'+FELT.cream+'"/>'
      + '<path class="pc" d="M14 60 L60 22 L106 60 z" fill="'+FELT.peach+'"/>'
      + '<path d="M22 56 h76" stroke="'+FELT.peachD+'" stroke-width="4" stroke-linecap="round"/>'
      + '<rect class="pc" x="50" y="78" width="20" height="28" rx="8" fill="'+FELT.tanD+'"/>'
      + '<circle class="pc" cx="34" cy="74" r="7" fill="'+FELT.skyL+'"/>'
      + '<circle class="pc" cx="86" cy="74" r="7" fill="'+FELT.skyL+'"/>'
      /* kitten peeping over the sill */
      + '<circle class="pc" cx="86" cy="62" r="11" fill="'+FELT.white+'"/>'
      + '<path class="pc" d="M78 56 l-2 -9 l8 4 z" fill="'+FELT.white+'"/>'
      + '<path class="pc" d="M94 56 l2 -9 l-8 4 z" fill="'+FELT.white+'"/>'
      + '<circle cx="82" cy="62" r="1.9" fill="'+FELT.ink+'"/><circle cx="90" cy="62" r="1.9" fill="'+FELT.ink+'"/>'
      /* paw-print path */
      + '<g fill="'+FELT.pinkL+'"><ellipse cx="20" cy="112" rx="5" ry="4"/><ellipse cx="36" cy="116" rx="5" ry="4"/>'
      + '<ellipse cx="52" cy="112" rx="5" ry="4"/></g>'
      + close;
  }
  if(land==='ballet'){
    return open
      + '<ellipse cx="60" cy="110" rx="44" ry="8" fill="'+FELT.shadow+'"/>'
      + '<rect class="pc" x="14" y="96" width="92" height="14" rx="6" fill="'+FELT.tan+'"/>'
      /* paper-theatre curtains */
      + '<path class="pc" d="M10 30 h100 l-8 16 h-84 z" fill="'+FELT.butter+'"/>'
      + '<path class="pc" d="M14 44 q14 30 6 52 l-22 0 l0 -52 z" fill="'+FELT.pinkD+'"/>'
      + '<path class="pc" d="M106 44 q-14 30 -6 52 l22 0 l0 -52 z" fill="'+FELT.pinkD+'"/>'
      + '<ellipse class="pc" cx="60" cy="74" rx="17" ry="20" fill="'+FELT.pinkL+'"/>'
      + '<circle class="pc" cx="60" cy="56" r="10" fill="'+FELT.cream+'"/>'
      + feltStar(60,24,8, FELT.butter)
      + close;
  }
  if(land==='story'){
    return open
      + '<ellipse cx="60" cy="110" rx="42" ry="8" fill="'+FELT.shadow+'"/>'
      /* stacked books tower */
      + '<rect class="pc" x="18" y="88" width="84" height="18" rx="5" fill="'+FELT.lilacD+'"/>'
      + '<rect class="pc" x="24" y="70" width="72" height="18" rx="5" fill="'+FELT.mint+'"/>'
      + '<rect class="pc" x="20" y="52" width="80" height="18" rx="5" fill="'+FELT.pink+'"/>'
      + '<rect class="pc" x="28" y="34" width="64" height="18" rx="5" fill="'+FELT.butter+'"/>'
      + '<g fill="'+FELT.white+'" opacity=".8"><rect x="24" y="94" width="10" height="6" rx="3"/>'
      + '<rect x="30" y="76" width="10" height="6" rx="3"/><rect x="26" y="58" width="10" height="6" rx="3"/>'
      + '<rect x="34" y="40" width="10" height="6" rx="3"/></g>'
      + feltStar(60,20,10, FELT.butter)
      + close;
  }
  if(land==='fairy'){
    return open
      + '<ellipse cx="60" cy="110" rx="42" ry="8" fill="'+FELT.shadow+'"/>'
      /* glowing mushrooms + oversized flower */
      + '<rect class="pc" x="24" y="80" width="14" height="26" rx="7" fill="'+FELT.cream+'"/>'
      + '<ellipse class="pc" cx="31" cy="78" rx="22" ry="15" fill="'+FELT.rose+'"/>'
      + '<circle cx="24" cy="74" r="3.4" fill="'+FELT.white+'"/><circle cx="38" cy="79" r="3" fill="'+FELT.white+'"/>'
      + '<rect class="pc" x="82" y="88" width="11" height="20" rx="5" fill="'+FELT.cream+'"/>'
      + '<ellipse class="pc" cx="87" cy="86" rx="17" ry="11" fill="'+FELT.lilacD+'"/>'
      + '<path d="M62 96 q-4 -26 0 -40" stroke="'+FELT.grassD+'" stroke-width="6" fill="none" stroke-linecap="round"/>'
      + feltFlower(62,42,24, FELT.butter, FELT.peach)
      + feltStar(100,34,8, FELT.butter) + feltStar(20,40,6, FELT.mint)
      + close;
  }
  return null;
}

/* Rebuild the kingdom scenery + mount Twinkle in her slots. */
function initWorld(){
  const map = document.getElementById('kingdom-map');
  if(map){
    const old = map.querySelector('.world-svg');
    if(old) old.remove();
    map.insertAdjacentHTML('afterbegin', feltWorldScene());
  }
  const slots = [['twinkle-fly','fly','flying'], ['twinkle-avatar','guide','idle'],
                 ['twinkle-mini-cat','mini','idle'], ['splash-twinkle','splash','idle']];
  slots.forEach(function(s){
    const el = document.getElementById(s[0]);
    if(el) el.innerHTML = twinkleHTML(s[1], s[2]);
  });
  try{
    if(typeof Art!=='undefined'){
      Art.preload(['twinkle-idle','twinkle-talking','twinkle-happy','twinkle-flying','twinkle-pointing','bg-kingdom']).then(function(){
        try{
          if(Art.cache['bg-kingdom'] && map && !map.querySelector('.world-bg-art')){
            map.insertAdjacentHTML('afterbegin', '<img class="world-bg-art" src="'+Art.cache['bg-kingdom']+'" alt="">');
            map.classList.add('has-art-bg');
          }
          slots.forEach(function(s){
            const el=document.getElementById(s[0]); if(el) el.innerHTML=twinkleHTML(s[1], s[2]);
          });
        }catch(e){}
      });
    }
  }catch(e){}
  /* Landmarks are placed as a PERCENTAGE of the visible world, not in scene
     coordinates. The backdrop uses preserveAspectRatio="slice", so scene
     coordinates get cropped differently on every tablet and a landmark at
     the edge could end up off-screen. Percentages cannot. */
  try{
    if(!window.__posMarks){
      window.__posMarks=function(){
        try{
          const map2=document.getElementById('kingdom-map');
          if(!map2) return;
          map2.querySelectorAll('.scene-mark').forEach(function(m){
            const px=parseFloat(m.getAttribute('data-px')), py=parseFloat(m.getAttribute('data-py'));
            if(isNaN(px)||isNaN(py)) return;
            m.style.left=px+'%'; m.style.top=py+'%';
          });
        }catch(err){}
      };
      window.addEventListener('resize', window.__posMarks);
      window.addEventListener('orientationchange', function(){ setTimeout(window.__posMarks, 120); });
    }
    window.__posMarks();
    if(map) map.querySelectorAll('.scene-mark').forEach(function(m){
      const e = m.querySelector('.land-emoji');
      const ic = markIcon(m.getAttribute('data-land'));
      if(e && ic) e.innerHTML = ic;
    });
  }catch(err){}
}
