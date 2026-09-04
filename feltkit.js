/* ============================================================
   FELTKIT — the shared vocabulary for the felt / sticker / paper-doll world.

   ART DIRECTION (locked): every child-facing thing is a piece of coloured
   felt or a die-cut sticker, laid on top of other pieces. The style leans
   INTO simple shapes rather than hiding them — a unicorn should read as a
   deliberately cute felt toy, never as a failed realistic unicorn.

   How a "felt piece" is made, cheaply:
   - .pc  gets a thick white stroke drawn UNDERNEATH its fill via
          paint-order:stroke. One element, and you get the die-cut sticker
          border for free — no duplicated shapes, no extra nodes.
   - .st  is a dashed overlay path: the stitching.
   - #felt-edge is ONE turbulence filter that roughens outlines just enough
     to read as cut felt. Applied to small character groups only, never to
     a full-screen background, because displacement maps are the expensive
     thing on a tablet.

   Everything here is plain strings so it costs nothing to build and can be
   dropped into innerHTML. Shapes are reused through <use> where repeated.
   ============================================================ */
'use strict';

const FELT = {
  /* Felt, not pastel wash: these are saturated enough to hold their shape
     against a white sticker border at tablet brightness. */
  cream:'#FFE9CE', white:'#FFFDF8', shadow:'rgba(112,74,132,.26)',
  pink:'#F7A6C4',  pinkD:'#DE749C',  pinkL:'#FCCFE0',
  lilac:'#BCA3EE', lilacD:'#9670D9', lilacL:'#DED0FA',
  mint:'#7ECFAB',  mintD:'#57B48C',
  butter:'#FBD881',butterD:'#EDB63E',
  peach:'#FFB98D', peachD:'#E8905F',
  sky:'#8FCEEC',   skyD:'#5FADD4',  skyL:'#CDE9F8',
  grass:'#9BD483', grassD:'#6FB457',
  tan:'#D49A6A',   tanD:'#AE744A',
  plum:'#6E4E7C',  ink:'#4E3859',
  rose:'#F27A8D'
};

/* Defs shared by every felt SVG. Injected once per SVG root. */
const FELT_DEFS = ''
+ '<defs>'
+   '<filter id="felt-edge" x="-12%" y="-12%" width="124%" height="124%">'
+     '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/>'
+     '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>'
+   '</filter>'
+   '<filter id="felt-soft" x="-25%" y="-25%" width="150%" height="160%">'
+     '<feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#7a5c86" flood-opacity="0.22"/>'
+   '</filter>'
+   '<filter id="felt-lift" x="-30%" y="-30%" width="160%" height="170%">'
+     '<feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#7a5c86" flood-opacity="0.26"/>'
+   '</filter>'
+   '<filter id="felt-glow" x="-60%" y="-60%" width="220%" height="220%">'
+     '<feGaussianBlur stdDeviation="6" result="b"/>'
+     '<feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>'
+   '</filter>'
+   '<linearGradient id="felt-horn" x1="0" y1="1" x2="0" y2="0">'
+     '<stop offset="0" stop-color="'+FELT.butterD+'"/><stop offset="1" stop-color="'+FELT.cream+'"/>'
+   '</linearGradient>'
+   '<radialGradient id="felt-cheek">'
+     '<stop offset="0" stop-color="'+FELT.rose+'" stop-opacity=".75"/>'
+     '<stop offset="1" stop-color="'+FELT.rose+'" stop-opacity="0"/>'
+   '</radialGradient>'
+ '</defs>';

/* Wrap markup in a felt SVG root. `extra` lets a caller add classes/attrs. */
function feltSVG(viewBox, inner, cls, extra){
  return '<svg class="felt '+(cls||'')+'" viewBox="'+viewBox+'" '
    + 'xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" '
    + 'aria-hidden="true" focusable="false" '+(extra||'')+'>'
    + FELT_DEFS + inner + '</svg>';
}

/* ---- small reusable pieces ------------------------------------------- */

/* Sticker star — the burst particle and the reward accent. */
function feltStar(cx, cy, r, fill, rot){
  const pts=[];
  for(let i=0;i<10;i++){
    const rr = i%2 ? r*0.44 : r;
    const a = (Math.PI/5)*i - Math.PI/2;
    pts.push((cx+Math.cos(a)*rr).toFixed(1)+','+(cy+Math.sin(a)*rr).toFixed(1));
  }
  return '<polygon class="pc" points="'+pts.join(' ')+'" fill="'+(fill||FELT.butter)+'"'
    + (rot?' transform="rotate('+rot+' '+cx+' '+cy+')"':'')+'/>';
}
/* Felt flower — five rounded petals plus a button centre. */
function feltFlower(cx, cy, r, petal, heart){
  let s='<g class="felt-flower">';
  for(let i=0;i<5;i++){
    const a=(Math.PI*2/5)*i - Math.PI/2;
    s+='<circle class="pc" cx="'+(cx+Math.cos(a)*r*0.62).toFixed(1)+'" cy="'+(cy+Math.sin(a)*r*0.62).toFixed(1)
      +'" r="'+(r*0.52).toFixed(1)+'" fill="'+(petal||FELT.pink)+'"/>';
  }
  s+='<circle class="pc" cx="'+cx+'" cy="'+cy+'" r="'+(r*0.34).toFixed(1)+'" fill="'+(heart||FELT.butter)+'"/>';
  s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.13).toFixed(1)+'" fill="'+FELT.butterD+'" opacity=".7"/>';
  return s+'</g>';
}
/* A rounded felt hill/lobe — the workhorse for scenery and manes. */
function feltLobe(cx, cy, rx, ry, fill, rot){
  return '<ellipse class="pc" cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'"'
    + (rot?' transform="rotate('+rot+' '+cx+' '+cy+')"':'')+'/>';
}
/* Friendly eye. open | happy (closed arc) | wink */
function feltEye(cx, cy, r, kind){
  if(kind==='happy'){
    return '<path class="eye-line" d="M'+(cx-r)+' '+cy+' q '+r+' '+(-r*1.25)+' '+(r*2)+' 0" '
      + 'fill="none" stroke="'+FELT.ink+'" stroke-width="'+(r*0.55).toFixed(1)+'" stroke-linecap="round"/>';
  }
  return '<g><ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(r*0.82).toFixed(1)+'" ry="'+r+'" fill="'+FELT.ink+'"/>'
    + '<circle cx="'+(cx+r*0.30).toFixed(1)+'" cy="'+(cy-r*0.34).toFixed(1)+'" r="'+(r*0.30).toFixed(1)+'" fill="'+FELT.white+'"/>'
    + '<circle cx="'+(cx-r*0.28).toFixed(1)+'" cy="'+(cy+r*0.34).toFixed(1)+'" r="'+(r*0.15).toFixed(1)+'" fill="'+FELT.white+'" opacity=".7"/></g>';
}
function feltCheek(cx, cy, r){
  return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="url(#felt-cheek)"/>';
}
/* Dashed stitch run along an arbitrary path. */
function feltStitch(d, color, w){
  return '<path class="st" d="'+d+'" fill="none" stroke="'+(color||'rgba(255,255,255,.8)')
    + '" stroke-width="'+(w||2)+'" stroke-dasharray="5 5" stroke-linecap="round"/>';
}

if(typeof module!=='undefined' && module.exports){
  module.exports = {FELT, FELT_DEFS, feltSVG, feltStar, feltFlower, feltLobe, feltEye, feltCheek, feltStitch};
}
