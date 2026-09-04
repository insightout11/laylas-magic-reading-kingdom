/* Princess Layla — polished dress-up character + illustrated castle room.
   Original preschool-friendly artwork: layered SVG, no external assets. */
'use strict';

const DRESS_COLORS = {
  'dress-pink':    {bod:'#ec4899', dark:'#be185d', skirt:['#fbcfe8','#f472b6'], sash:'#fbbf24'},
  'dress-rainbow': {bod:'#fff7ec', dark:'#e9c46a', rainbow:true, sash:'#fbbf24'},
  'dress-blue':    {bod:'#3b82f6', dark:'#1d4ed8', skirt:['#bae6fd','#60a5fa'], sash:'#fde68a'},
  'dress-lilac':   {bod:'#8b5cf6', dark:'#6d28d9', skirt:['#ddd6fe','#a78bfa'], sash:'#fbcfe8'}
};
const CROWN_KIND = {'crown-gold':'gold','crown-tiara':'tiara','crown-flower':'flower'};
const SHOE_COLORS = {'shoes-glass':'#7dd3fc','shoes-ballet':'#f9a8d4'};

function princessSVG(eq){
  eq = eq||{};
  const dress = DRESS_COLORS[eq.dress]||DRESS_COLORS['dress-pink'];
  const crown = CROWN_KIND[eq.crown]||null;
  const shoe = SHOE_COLORS[eq.shoes]||SHOE_COLORS['shoes-ballet'];
  const glass = (eq.shoes||'shoes-ballet')==='shoes-glass';
  const wings = eq.wings==='wings-fairy';
  const necklace = eq.necklace==='neck-star';
  const skin='#f6c79b', skinD='#dfa06f', hair='#6b4226', hairD='#4e2f1b';
  let s = '<svg class="princess-svg" viewBox="0 0 200 330" aria-label="Princess Layla">';
  if(wings){
    s += '<g opacity=".92"><ellipse cx="50" cy="172" rx="26" ry="58" fill="#fbcfe8" stroke="#f0abfc" stroke-width="3" transform="rotate(18 50 172)"/>'
       + '<ellipse cx="150" cy="172" rx="26" ry="58" fill="#fbcfe8" stroke="#f0abfc" stroke-width="3" transform="rotate(-18 150 172)"/>'
       + '<path d="M38,150 Q48,170 40,196 M162,150 Q152,170 160,196" stroke="#f0abfc" stroke-width="2" fill="none"/>'
       + '<path d="M34,176 Q46,192 40,214 M166,176 Q154,192 160,214" stroke="#f0abfc" stroke-width="2" fill="none"/>'
       + '<circle cx="44" cy="140" r="2.5" fill="#fff"/><circle cx="156" cy="150" r="2.5" fill="#fff"/></g>';
  }
  // back hair mass with wavy ends
  s += '<path d="M56,40 Q56,18 100,18 Q144,18 144,40 L148,96 Q148,116 134,112 Q136,126 122,122 Q120,134 106,128 L94,128 Q80,134 78,122 Q64,126 66,112 Q52,116 52,96 Z" fill="'+hair+'"/>'
     + '<path d="M70,34 Q100,24 130,34" stroke="'+hairD+'" stroke-width="3" fill="none" opacity=".6"/>';
  // legs
  s += '<rect x="86" y="248" width="13" height="42" rx="6" fill="'+skin+'"/><rect x="101" y="248" width="13" height="42" rx="6" fill="'+skin+'"/>';
  // shoes
  if(glass){
    s += '<ellipse cx="92" cy="296" rx="15" ry="9" fill="'+shoe+'" stroke="#fff" stroke-width="3"/>'
       + '<ellipse cx="108" cy="296" rx="15" ry="9" fill="'+shoe+'" stroke="#fff" stroke-width="3"/>'
       + '<path d="M84,293 L92,299 M100,293 L108,299" stroke="#fff" stroke-width="2.5"/>'
       + '<rect x="98" y="298" width="5" height="10" fill="#bae6fd"/>';
  } else {
    s += '<ellipse cx="92" cy="296" rx="15" ry="9" fill="'+shoe+'" stroke="#fff" stroke-width="3"/>'
       + '<ellipse cx="108" cy="296" rx="15" ry="9" fill="'+shoe+'" stroke="#fff" stroke-width="3"/>'
       + '<path d="M86,284 L98,272 M114,284 L102,272" stroke="#e0448f" stroke-width="2"/>'
       + '<circle cx="92" cy="290" r="2" fill="#fff"/><circle cx="108" cy="290" r="2" fill="#fff"/>';
  }
  // ---- skirts ----
  const hemY = 262;
  if(dress.rainbow){
    const bands=['#f87171','#fb923c','#facc15','#4ade80','#60a5fa','#a78bfa'];
    s += '<path d="M68,158 L132,158 L152,'+hemY+' L48,'+hemY+' Z" fill="#fff"/>';
    bands.forEach((c,i)=>{
      const y0=158+i*17.3, y1=158+(i+1)*17.3;
      const x0=68-(y0-158)*0.19, x1=132+(y0-158)*0.19, x2=132+(y1-158)*0.19, x3=68-(y1-158)*0.19;
      s += '<polygon points="'+x0.toFixed(1)+','+y0.toFixed(1)+' '+x1.toFixed(1)+','+y0.toFixed(1)+' '+x2.toFixed(1)+','+y1.toFixed(1)+' '+x3.toFixed(1)+','+y1.toFixed(1)+'" fill="'+c+'" opacity=".93"/>';
    });
    s += '<path d="M48,'+hemY+' Q60,'+(hemY+8)+' 72,'+hemY+' Q84,'+(hemY+8)+' 96,'+hemY+' Q108,'+(hemY+8)+' 120,'+hemY+' Q132,'+(hemY+8)+' 144,'+hemY+' L152,'+hemY+' L152,'+(hemY-4)+' L48,'+(hemY-4)+' Z" fill="#fff" opacity=".85"/>'
       + '<polygon points="100,200 102,205 107,205 103,208 104.5,213 100,210 95.5,213 97,208 93,205 98,205" fill="#fff"/>'
       + '<circle cx="76" cy="226" r="2.6" fill="#fff"/><circle cx="126" cy="216" r="2.6" fill="#fff"/><circle cx="112" cy="244" r="2.2" fill="#fff"/>'
       + '<path d="M60,170 Q90,190 140,168" stroke="#fff" stroke-width="5" fill="none" opacity=".5"/>';
  } else if(eq.dress==='dress-lilac'){
    s += '<defs><linearGradient id="pdSkirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+dress.skirt[0]+'"/><stop offset="1" stop-color="'+dress.skirt[1]+'"/></linearGradient></defs>'
       + '<path d="M66,158 L134,158 L154,'+hemY+' L46,'+hemY+' Z" fill="url(#pdSkirt)" stroke="#fff" stroke-width="3"/>'
       + '<path d="M62,196 L138,196 L148,236 L52,236 Z" fill="#c4b5fd" opacity=".55"/>'
       + '<path d="M60,226 L140,226 L148,254 L52,254 Z" fill="#ddd6fe" opacity=".7"/>'
       + '<path d="M74,146 L126,132 L126,142 L74,156 Z" fill="'+dress.sash+'" opacity=".95"/>'
       + '<circle cx="70" cy="246" r="2.4" fill="#fff"/><circle cx="92" cy="252" r="2.4" fill="#fff"/><circle cx="114" cy="250" r="2.4" fill="#fff"/><circle cx="132" cy="242" r="2.4" fill="#fff"/>';
  } else if(eq.dress==='dress-blue'){
    s += '<defs><linearGradient id="pdSkirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+dress.skirt[0]+'"/><stop offset="1" stop-color="'+dress.skirt[1]+'"/></linearGradient></defs>'
       + '<path d="M68,158 L132,158 L152,'+hemY+' L48,'+hemY+' Z" fill="url(#pdSkirt)" stroke="#fff" stroke-width="3"/>'
       + '<path d="M84,160 L76,'+hemY+' L96,'+hemY+' L100,160 Z" fill="'+dress.dark+'" opacity=".35"/>'
       + '<path d="M116,160 L124,'+hemY+' L104,'+hemY+' L100,160 Z" fill="'+dress.dark+'" opacity=".35"/>'
       + '<path d="M48,'+hemY+' Q74,'+(hemY-10)+' 100,'+hemY+' Q126,'+(hemY-10)+' 152,'+hemY+' L152,'+(hemY-6)+' L48,'+(hemY-6)+' Z" fill="#eff6ff" opacity=".9"/>'
       + '<circle cx="100" cy="152" r="4.5" fill="'+dress.sash+'" stroke="#fff" stroke-width="2"/>';
  } else { // pink princess gown
    s += '<defs><linearGradient id="pdSkirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+dress.skirt[0]+'"/><stop offset="1" stop-color="'+dress.skirt[1]+'"/></linearGradient></defs>'
       + '<path d="M68,158 L132,158 L152,'+hemY+' L48,'+hemY+' Z" fill="url(#pdSkirt)" stroke="#fff" stroke-width="3"/>'
       + '<path d="M60,190 L140,190 L148,238 L52,238 Z" fill="#fbcfe8" opacity=".65"/>'
       + '<path d="M48,'+hemY+' Q58,'+(hemY+9)+' 68,'+hemY+' Q78,'+(hemY+9)+' 88,'+hemY+' Q98,'+(hemY+9)+' 108,'+hemY+' Q118,'+(hemY+9)+' 128,'+hemY+' Q138,'+(hemY+9)+' 148,'+hemY+' L152,'+hemY+' L152,'+(hemY-5)+' L48,'+(hemY-5)+' Z" fill="#fce7f3"/>'
       + '<g transform="translate(100 162)"><polygon points="0,-8 -7,-1 0,1 -12,3 -6,6 0,4 6,6 12,3 0,1 7,-1" fill="'+dress.sash+'" stroke="#b45309" stroke-width="1.5"/></g>'
       + '<path d="M100,196 c-4,-6 -14,-2 -10,5 l10,8 l10,-8 c4,-7 -6,-11 -10,-5" fill="#fff" opacity=".9"/>'
       + '<circle cx="74" cy="222" r="2.6" fill="#fff"/><circle cx="128" cy="214" r="2.6" fill="#fff"/>';
  }
  // arms: left relaxed, right waving high
  s += '<rect x="52" y="162" width="16" height="50" rx="8" fill="'+skin+'" transform="rotate(10 60 165)"/>'
     + '<circle cx="57" cy="214" r="8" fill="'+skin+'"/>'
     + '<rect x="130" y="112" width="16" height="52" rx="8" fill="'+skin+'" transform="rotate(-155 138 134)"/>'
     + '<circle cx="162" cy="102" r="8" fill="'+skin+'"/>'
     + '<circle cx="60" cy="158" r="12" fill="'+dress.bod+'" stroke="#fff" stroke-width="2"/><circle cx="140" cy="158" r="12" fill="'+dress.bod+'" stroke="#fff" stroke-width="2"/>';
  // bodice with sweetheart neckline + buttons
  s += '<path d="M82,106 Q91,116 100,108 Q109,116 118,106 L126,160 L74,160 Z" fill="'+dress.bod+'" stroke="#fff" stroke-width="3"/>'
     + '<rect x="74" y="150" width="52" height="9" fill="'+dress.dark+'" opacity=".45"/>'
     + '<circle cx="100" cy="122" r="2.2" fill="#fff" opacity=".9"/><circle cx="100" cy="131" r="2.2" fill="#fff" opacity=".9"/><circle cx="100" cy="140" r="2.2" fill="#fff" opacity=".9"/>';
  if(necklace){
    s += '<path d="M88,108 Q100,120 112,108" fill="none" stroke="#fbbf24" stroke-width="3"/>'
       + '<polygon points="100,118 101.5,122 106,122 102.5,125 103.5,129 100,126.5 96.5,129 97.5,125 94,122 98.5,122" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>';
  }
  // head + face
  s += '<circle cx="100" cy="68" r="33" fill="'+skin+'" stroke="'+skinD+'" stroke-width="2"/>'
     + '<path d="M67,62 Q64,84 74,96 Q70,76 74,60 Z" fill="'+hair+'"/>'
     + '<path d="M133,62 Q136,84 126,96 Q130,76 126,60 Z" fill="'+hair+'"/>'
     + '<circle cx="78" cy="44" r="12" fill="'+hair+'"/><circle cx="100" cy="37" r="12" fill="'+hair+'"/><circle cx="122" cy="44" r="12" fill="'+hair+'"/>'
     + '<path d="M70,52 Q80,40 92,48 Q84,44 78,52 Q86,50 92,54 Q82,56 74,58 Z" fill="'+hair+'"/>'
     + '<path d="M108,54 Q114,50 122,52 Q130,44 130,44 Q128,56 118,58 Q110,58 108,54" fill="'+hair+'"/>'
     + '<ellipse cx="88" cy="67" rx="7.5" ry="9.5" fill="#fff"/><ellipse cx="112" cy="67" rx="7.5" ry="9.5" fill="#fff"/>'
     + '<circle cx="89" cy="69" r="4" fill="#40264f"/><circle cx="111" cy="69" r="4" fill="#40264f"/>'
     + '<circle cx="90.4" cy="67.4" r="1.4" fill="#fff"/><circle cx="112.4" cy="67.4" r="1.4" fill="#fff"/>'
     + '<path d="M80,59 L77,56 M118,59 L121,56 M82,58 L80,54 M120,58 L122,54" stroke="'+hairD+'" stroke-width="1.8" stroke-linecap="round"/>'
     + '<path d="M82,52 Q88,49 94,52 M106,52 Q112,49 118,52" stroke="'+hairD+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
     + '<ellipse cx="76" cy="79" rx="5.5" ry="3.8" fill="#f191a8"/><ellipse cx="124" cy="79" rx="5.5" ry="3.8" fill="#f191a8"/>'
     + '<circle cx="74" cy="78" r="1.2" fill="#fff" opacity=".8"/><circle cx="122" cy="78" r="1.2" fill="#fff" opacity=".8"/>'
     + '<path d="M91,85 Q100,93 109,85 Q100,89 91,85" fill="#9a3412"/>'
     + '<path d="M94,87 Q100,91 106,87" fill="none" stroke="#fff" stroke-width="1.4"/>';
  // crowns (seated on fringe, y≈10–40)
  if(crown==='gold'){
    s += '<polygon points="76,36 81,14 90,30 100,10 110,30 119,14 124,36" fill="#fbbf24" stroke="#b45309" stroke-width="2.5"/>'
       + '<rect x="76" y="34" width="48" height="6" rx="3" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>'
       + '<circle cx="100" cy="25" r="4" fill="#ec4899" stroke="#fff" stroke-width="1.5"/><circle cx="86" cy="29" r="2.6" fill="#60a5fa"/><circle cx="114" cy="29" r="2.6" fill="#60a5fa"/>';
  } else if(crown==='tiara'){
    s += '<path d="M78,36 Q100,22 122,36 L122,43 Q100,29 78,43 Z" fill="#e9d5ff" stroke="#8b5cf6" stroke-width="2"/>'
       + '<circle cx="84" cy="36" r="2" fill="#fff"/><circle cx="116" cy="36" r="2" fill="#fff"/>'
       + '<polygon points="100,12 102,18 108,18 103,22 105,28 100,24 95,28 97,22 92,18 98,18" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>';
  } else if(crown==='flower'){
    s += '<g><circle cx="100" cy="20" r="8" fill="#f9a8d4" stroke="#c2185b" stroke-width="2"/><circle cx="87" cy="27" r="7" fill="#fbcfe8" stroke="#c2185b" stroke-width="2"/><circle cx="113" cy="27" r="7" fill="#fbcfe8" stroke="#c2185b" stroke-width="2"/><circle cx="100" cy="34" r="6" fill="#fbcfe8" stroke="#c2185b" stroke-width="2"/><circle cx="100" cy="26" r="4" fill="#fde047" stroke="#b45309"/></g>';
  }
  s += '<path d="M64,50 Q70,58 66,68" stroke="#fff" stroke-width="2.5" fill="none" opacity=".35"/>';
  s += '</svg>';
  return s;
}

function dressSwatch(id){
  const d = DRESS_COLORS[id]||DRESS_COLORS['dress-pink'];
  const skirt = d.rainbow ? '#f9a8d4' : d.skirt[1];
  return '<svg class="swatch" viewBox="0 0 60 70"><path d="M22,6 L38,6 L42,34 L18,34 Z" fill="'+d.bod+'"/>'
    + '<path d="M16,34 L44,34 L52,64 L8,64 Z" fill="'+skirt+'"/>'
    + (d.rainbow?'<path d="M14,44 L46,44 L49,54 L11,54 Z" fill="#60a5fa"/><path d="M12,54 L48,54 L52,64 L8,64 Z" fill="#a78bfa"/>':'')
    + '</svg>';
}
function crownSwatch(id){
  const k = CROWN_KIND[id];
  if(k==='gold') return '<svg class="swatch" viewBox="0 0 60 40"><polygon points="8,34 13,8 22,26 30,4 38,26 47,8 52,34" fill="#fbbf24" stroke="#b45309" stroke-width="2"/></svg>';
  if(k==='tiara') return '<svg class="swatch" viewBox="0 0 60 40"><path d="M8,34 Q30,18 52,34 L52,38 Q30,22 8,38 Z" fill="#e9d5ff" stroke="#8b5cf6" stroke-width="2"/></svg>';
  return '<svg class="swatch" viewBox="0 0 60 40"><circle cx="30" cy="16" r="9" fill="#f9a8d4" stroke="#e0448f" stroke-width="2"/><circle cx="30" cy="16" r="4" fill="#fde047"/></svg>';
}
function shoeSwatch(id){
  const c = SHOE_COLORS[id]||'#f9a8d4';
  return '<svg class="swatch" viewBox="0 0 60 40"><ellipse cx="20" cy="26" rx="13" ry="9" fill="'+c+'" stroke="#fff" stroke-width="2"/><ellipse cx="42" cy="26" rx="13" ry="9" fill="'+c+'" stroke="#fff" stroke-width="2"/></svg>';
}
function wingSwatch(){
  return '<svg class="swatch" viewBox="0 0 60 50"><ellipse cx="20" cy="25" rx="13" ry="20" fill="#fbcfe8" stroke="#f0abfc" stroke-width="2" transform="rotate(20 20 25)"/><ellipse cx="40" cy="25" rx="13" ry="20" fill="#fbcfe8" stroke="#f0abfc" stroke-width="2" transform="rotate(-20 40 25)"/></svg>';
}
function necklaceSwatch(){
  return '<svg class="swatch" viewBox="0 0 60 40"><path d="M14,6 Q30,26 46,6" fill="none" stroke="#fbbf24" stroke-width="3"/><polygon points="30,22 32,27 37,27 33,30 34,35 30,32 26,35 27,30 23,27 28,27" fill="#fbbf24" stroke="#b45309"/></svg>';
}

const ROOM_SVG = ''
+ '<svg class="room-svg" viewBox="0 0 600 460" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'
+ '<rect class="room-wall-fill" x="0" y="0" width="600" height="300" fill="#f9cfe3"/>'
+ '<rect x="0" y="0" width="600" height="300" fill="#ffffff" opacity=".14"/>'
+ '<rect x="0" y="292" width="600" height="16" fill="#fff" opacity=".7"/>'
+ '<rect x="0" y="308" width="600" height="52" fill="#e8a9c6"/>'
+ '<rect x="0" y="350" width="600" height="110" fill="#c98a54"/>'
+ '<g stroke="#a16207" stroke-width="2" opacity=".6"><line x1="0" y1="376" x2="600" y2="376"/><line x1="0" y1="402" x2="600" y2="402"/><line x1="0" y1="428" x2="600" y2="428"/></g>'
+ '<rect x="0" y="350" width="600" height="10" fill="#8a5a2b"/>'
+ '<ellipse cx="300" cy="414" rx="180" ry="34" fill="#f9a8d4" stroke="#fff" stroke-width="4"/>'
+ '<ellipse cx="300" cy="414" rx="140" ry="24" fill="#f472b6" opacity=".5"/>'
+ '<g class="room-stars" opacity=".8" fill="#fff"><circle cx="80" cy="60" r="4"/><circle cx="200" cy="40" r="3"/><circle cx="420" cy="50" r="4"/><circle cx="520" cy="90" r="3"/><circle cx="320" cy="80" r="3"/><polygon points="250,70 251.5,74 256,74 252.5,76.5 253.5,81 250,78.5 246.5,81 247.5,76.5 244,74 248.5,74" /></g>'
+ '<rect x="300" y="22" width="130" height="34" rx="10" fill="#fbbf24" stroke="#fff" stroke-width="3"/>'
+ '<text x="365" y="47" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="22" font-weight="800" fill="#7c2d12" letter-spacing="6">LAYLA</text>'
+ '<polygon points="150,120 260,120 200,330" fill="#fff7d0" opacity=".35"/>'
+ '<g class="room-window"><path d="M36,220 L36,130 Q36,88 78,88 Q120,88 120,130 L120,220 Z" fill="#bae6fd" stroke="#fff" stroke-width="6"/>'
+ '<circle cx="62" cy="120" r="14" fill="#fde047"/><text x="88" y="180" text-anchor="middle" font-size="40">🌈</text>'
+ '<path d="M78,88 L78,220 M36,160 L120,160" stroke="#fff" stroke-width="6"/>'
+ '<path d="M20,86 Q28,140 22,220 L44,220 Q40,140 48,86 Z" fill="#f472b6" stroke="#e0448f" stroke-width="2"/>'
+ '<path d="M136,86 Q128,140 134,220 L112,220 Q116,140 108,86 Z" fill="#f472b6" stroke="#e0448f" stroke-width="2"/>'
+ '<rect x="30" y="216" width="96" height="10" rx="5" fill="#fff"/></g>'
+ '<g><rect x="440" y="232" width="14" height="120" fill="#7c2d12"/><rect x="556" y="232" width="14" height="120" fill="#7c2d12"/>'
+ '<path d="M428,236 Q500,190 572,236 L566,250 Q500,210 434,250 Z" fill="#f9a8d4" stroke="#fff" stroke-width="3"/>'
+ '<rect x="446" y="252" width="108" height="100" rx="12" fill="#f3d9c8" stroke="#fff" stroke-width="4"/>'
+ '<rect x="458" y="296" width="84" height="44" rx="10" fill="#f472b6"/>'
+ '<rect x="458" y="278" width="84" height="22" rx="8" fill="#fff"/>'
+ '<ellipse cx="500" cy="278" rx="30" ry="12" fill="#fff" stroke="#f9a8d4" stroke-width="3"/>'
+ '<path d="M486,296 c-3,-5 -11,-2 -8,4 l8,6 l8,-6 c3,-6 -5,-9 -8,-4" fill="#fff"/></g>'
+ '<g class="room-wardrobe" data-zone="dress">'
+ '<rect x="164" y="118" width="132" height="18" rx="6" fill="#7c2d12"/><circle cx="230" cy="112" r="7" fill="#fbbf24"/>'
+ '<rect x="170" y="136" width="120" height="216" rx="12" fill="#a16207" stroke="#7c2d12" stroke-width="4"/>'
+ '<rect x="182" y="148" width="46" height="192" rx="8" fill="#d9a066"/><rect x="232" y="148" width="46" height="192" rx="8" fill="#d9a066"/>'
+ '<rect x="188" y="156" width="34" height="80" rx="6" fill="#c98a54"/><rect x="238" y="156" width="34" height="80" rx="6" fill="#c98a54"/>'
+ '<rect x="188" y="244" width="34" height="88" rx="6" fill="#c98a54"/><rect x="238" y="244" width="34" height="88" rx="6" fill="#c98a54"/>'
+ '<circle cx="222" cy="244" r="6" fill="#fbbf24" stroke="#7c2d12" stroke-width="2"/><circle cx="238" cy="244" r="6" fill="#fbbf24" stroke="#7c2d12" stroke-width="2"/>'
+ '<path d="M226,340 L230,324 L234,340 Z" fill="#f9a8d4" stroke="#e0448f" stroke-width="2"/></g>'
+ '<g><rect x="316" y="250" width="64" height="12" rx="4" fill="#a16207"/><rect x="322" y="262" width="8" height="88" fill="#7c2d12"/><rect x="366" y="262" width="8" height="88" fill="#7c2d12"/>'
+ '<ellipse cx="348" cy="196" rx="34" ry="44" fill="#e9d5ff" stroke="#fff" stroke-width="5"/>'
+ '<ellipse cx="348" cy="196" rx="26" ry="36" fill="#bae6fd" opacity=".8"/>'
+ '<path d="M330,180 Q340,168 352,176" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>'
+ '<rect x="336" y="240" width="24" height="12" rx="4" fill="#a16207"/>'
+ '<circle cx="348" cy="150" r="6" fill="#fbbf24"/></g>'
+ '<g class="room-shelf" data-zone="crown"><rect x="436" y="122" width="138" height="12" rx="6" fill="#a16207"/>'
+ '<polygon points="452,120 456,104 461,116 466,102 471,116 476,104 480,120" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>'
+ '<path d="M496,120 Q510,110 524,120 L524,123 Q510,113 496,123 Z" fill="#e9d5ff" stroke="#8b5cf6" stroke-width="2"/>'
+ '<g><circle cx="548" cy="112" r="7" fill="#f9a8d4" stroke="#c2185b" stroke-width="2"/><circle cx="548" cy="112" r="3" fill="#fde047"/></g></g>'
+ '<g class="room-chandelier" style="display:none"><rect x="298" y="0" width="4" height="40" fill="#a16207"/>'
+ '<ellipse cx="300" cy="66" rx="34" ry="20" fill="#fde68a" stroke="#f59e0b" stroke-width="3"/>'
+ '<ellipse cx="300" cy="66" rx="48" ry="30" fill="#fef9c3" opacity=".3"/>'
+ '<circle cx="282" cy="66" r="5" fill="#fff"/><circle cx="300" cy="70" r="5" fill="#fff"/><circle cx="318" cy="66" r="5" fill="#fff"/></g>'
+ '<g class="room-petzone" data-zone="pet"><ellipse cx="112" cy="402" rx="62" ry="20" fill="#e9d5ff" stroke="#fff" stroke-width="3"/>'
+ '<text class="room-pet-emoji" x="112" y="394" text-anchor="middle" font-size="52">🐱</text>'
+ '<ellipse cx="178" cy="420" rx="17" ry="9" fill="#60a5fa" stroke="#fff" stroke-width="3"/><ellipse cx="178" cy="418" rx="11" ry="5" fill="#fbbf24"/></g>'
+ '<g class="room-decor"></g>'
+ '</svg>';

function mountCastleRoom(){
  const room = document.getElementById('castle-room');
  if(!room) return;
  if(!room.querySelector('.room-svg')){
    room.innerHTML = ROOM_SVG + '<div id="princess-mount" aria-label="Princess Layla"></div>';
    room.querySelectorAll('[data-zone]').forEach(z=>{
      z.addEventListener('click', ()=>{
        const tab = z.getAttribute('data-zone');
        if(typeof setClosetTab==='function') setClosetTab(tab==='dress'?'dress':tab==='crown'?'crown':'pet');
      });
    });
  }
}

/* ------- emoji-audit replacement characters ------- */
function kittenSVG(){
  return '<svg class="kitten-svg" viewBox="0 0 140 130" aria-hidden="true">'
  + '<ellipse cx="70" cy="118" rx="42" ry="9" fill="#000" opacity=".08"/>'
  + '<path d="M104,96 Q126,90 120,68 Q118,60 112,64 Q116,78 100,82 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2.5"/>'
  + '<ellipse cx="66" cy="92" rx="30" ry="26" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2.5"/>'
  + '<ellipse cx="52" cy="114" rx="9" ry="7" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/><ellipse cx="80" cy="114" rx="9" ry="7" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>'
  + '<polygon points="44,52 40,26 60,40" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2.5"/>'
  + '<polygon points="88,52 92,26 72,40" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2.5"/>'
  + '<polygon points="45,46 43,33 53,39" fill="#f9a8d4"/><polygon points="87,46 89,33 79,39" fill="#f9a8d4"/>'
  + '<circle cx="66" cy="70" r="26" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2.5"/>'
  + '<polygon points="66,8 68.5,14 75,14 70,18 71.5,24 66,20.5 60.5,24 62,18 57,14 63.5,14" fill="#fbbf24"/>'
  + '<ellipse cx="56" cy="68" rx="6" ry="7.5" fill="#fff" stroke="#cbd5e1"/>'
  + '<ellipse cx="76" cy="68" rx="6" ry="7.5" fill="#fff" stroke="#cbd5e1"/>'
  + '<circle cx="57" cy="70" r="3.2" fill="#334155"/><circle cx="75" cy="70" r="3.2" fill="#334155"/>'
  + '<circle cx="58" cy="69" r="1.1" fill="#fff"/><circle cx="76" cy="69" r="1.1" fill="#fff"/>'
  + '<ellipse cx="47" cy="78" rx="4.5" ry="3" fill="#f9a8d4"/><ellipse cx="85" cy="78" rx="4.5" ry="3" fill="#f9a8d4"/>'
  + '<polygon points="63,77 69,77 66,80" fill="#f472b6"/>'
  + '<path d="M66,80 Q66,83 62.5,83 M66,80 Q66,83 69.5,83" stroke="#64748b" stroke-width="1.4" fill="none"/>'
  + '<path d="M40,72 L28,70 M41,77 L29,78 M92,72 L104,70 M91,77 L103,78" stroke="#94a3b8" stroke-width="1.4"/>'
  + '<path d="M60,42 c-3,-5 -11,-2 -8,4 l8,6 l8,-6 c3,-6 -5,-9 -8,-4" fill="#f472b6"/>'
  + '</svg>';
}
function chestSVG(open){
  return '<svg class="chest-svg" viewBox="0 0 160 130" aria-hidden="true">'
  + '<ellipse cx="80" cy="118" rx="60" ry="9" fill="#000" opacity=".1"/>'
  + '<g transform="rotate('+(open?'-24':'0')+' 30 52)"><path d="M18,58 L18,38 Q18,14 80,14 Q142,14 142,38 L142,58 Z" fill="#a16207" stroke="#7c2d12" stroke-width="4"/>'
  + '<rect x="18" y="44" width="124" height="14" fill="#854d0e"/></g>'
  + '<rect x="18" y="58" width="124" height="56" rx="8" fill="#b45309" stroke="#7c2d12" stroke-width="4"/>'
  + '<rect x="72" y="58" width="16" height="56" fill="#fbbf24" opacity=".85"/>'
  + '<rect x="66" y="52" width="28" height="26" rx="6" fill="#fbbf24" stroke="#7c2d12" stroke-width="3"/>'
  + (open?'<circle cx="80" cy="65" r="6" fill="#312e81"/>':'<circle cx="80" cy="65" r="5" fill="#312e81"/>')
  + (open?'<g><polygon points="80,6 82,11 87,11 83,14 84,19 80,16 76,19 77,14 73,11 78,11" fill="#fde047"/><circle cx="56" cy="18" r="3" fill="#fff"/><circle cx="104" cy="16" r="3" fill="#fff"/></g>':'')
  + '</svg>';
}
function ballerinaSVG(){
  return '<svg class="ballerina-svg" viewBox="0 0 120 190" aria-hidden="true">'
  + '<ellipse cx="60" cy="180" rx="34" ry="7" fill="#000" opacity=".1"/>'
  + '<circle cx="60" cy="26" r="14" fill="#f6c79b" stroke="#dfa06f" stroke-width="2"/>'
  + '<circle cx="70" cy="14" r="7" fill="#6b4226"/><circle cx="60" cy="20" r="9" fill="#6b4226"/>'
  + '<circle cx="55" cy="26" r="1.8" fill="#40264f"/><circle cx="65" cy="26" r="1.8" fill="#40264f"/>'
  + '<path d="M56,32 Q60,35 64,32" stroke="#9a3412" stroke-width="1.6" fill="none"/>'
  + '<ellipse cx="52" cy="30" rx="3" ry="2" fill="#f191a8"/><ellipse cx="68" cy="30" rx="3" ry="2" fill="#f191a8"/>'
  + '<path d="M52,44 Q40,60 34,78 M68,44 Q80,60 86,78" stroke="#f6c79b" stroke-width="9" stroke-linecap="round" fill="none"/>'
  + '<circle cx="33" cy="80" r="5" fill="#f6c79b"/><circle cx="87" cy="80" r="5" fill="#f6c79b"/>'
  + '<path d="M50,42 L70,42 L74,92 L46,92 Z" fill="#c4b5fd" stroke="#8b5cf6" stroke-width="2.5"/>'
  + '<path d="M46,92 L74,92 L96,112 L24,112 Z" fill="#ddd6fe" stroke="#a78bfa" stroke-width="2.5"/>'
  + '<path d="M52,112 L44,172 M68,112 L76,172" stroke="#f6c79b" stroke-width="9" stroke-linecap="round"/>'
  + '<ellipse cx="43" cy="176" rx="8" ry="4.5" fill="#f9a8d4"/><ellipse cx="77" cy="176" rx="8" ry="4.5" fill="#f9a8d4"/>'
  + '</svg>';
}
function sproutSVG(){
  return '<svg class="sprout-svg" viewBox="0 0 80 80" aria-hidden="true">'
  + '<ellipse cx="40" cy="66" rx="24" ry="8" fill="#a16207"/>'
  + '<path d="M40,66 L40,36" stroke="#16a34a" stroke-width="5" stroke-linecap="round"/>'
  + '<path d="M40,48 Q26,44 20,30 Q36,30 40,44" fill="#4ade80" stroke="#16a34a" stroke-width="2"/>'
  + '<path d="M40,42 Q54,38 60,24 Q44,24 40,38" fill="#86efac" stroke="#16a34a" stroke-width="2"/>'
  + '</svg>';
}
