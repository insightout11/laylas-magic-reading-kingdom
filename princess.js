/* Princess Layla — original full-body dress-up character + castle room. */
'use strict';

const DRESS_COLORS = {
  'dress-pink':    {bod:'#ec4899', skirt:['#f9a8d4','#f472b6'], sash:'#fbbf24'},
  'dress-rainbow': {bod:'#fff7ec', rainbow:true, sash:'#fbbf24'},
  'dress-blue':    {bod:'#3b82f6', skirt:['#bae6fd','#60a5fa'], sash:'#fde68a'},
  'dress-lilac':   {bod:'#8b5cf6', skirt:['#ddd6fe','#a78bfa'], sash:'#fbcfe8'}
};
const CROWN_KIND = {'crown-gold':'gold','crown-tiara':'tiara','crown-flower':'flower'};
const SHOE_COLORS = {'shoes-glass':'#7dd3fc','shoes-ballet':'#f9a8d4'};

function princessSVG(eq){
  eq = eq||{};
  const dress = DRESS_COLORS[eq.dress]||DRESS_COLORS['dress-pink'];
  const crown = CROWN_KIND[eq.crown]||null;
  const shoe = SHOE_COLORS[eq.shoes]||SHOE_COLORS['shoes-ballet'];
  const wings = eq.wings==='wings-fairy';
  const necklace = eq.necklace==='neck-star';
  const skin='#f3c190', hair='#6b4226';
  let s = '<svg class="princess-svg" viewBox="0 0 200 330" aria-label="Princess Layla">';
  if(wings){
    s += '<ellipse cx="52" cy="170" rx="26" ry="58" fill="#fbcfe8" opacity=".85" stroke="#f0abfc" stroke-width="3" transform="rotate(18 52 170)"/>'
       + '<ellipse cx="148" cy="170" rx="26" ry="58" fill="#fbcfe8" opacity=".85" stroke="#f0abfc" stroke-width="3" transform="rotate(-18 148 170)"/>';
  }
  // back hair
  s += '<rect x="58" y="28" width="84" height="92" rx="40" fill="'+hair+'"/>'
     + '<circle cx="50" cy="100" r="17" fill="'+hair+'"/><circle cx="150" cy="100" r="17" fill="'+hair+'"/>';
  // legs + shoes
  s += '<rect x="86" y="248" width="13" height="42" rx="6" fill="'+skin+'"/><rect x="101" y="248" width="13" height="42" rx="6" fill="'+skin+'"/>'
     + '<ellipse cx="92" cy="296" rx="15" ry="9" fill="'+shoe+'" stroke="#fff" stroke-width="3"/>'
     + '<ellipse cx="108" cy="296" rx="15" ry="9" fill="'+shoe+'" stroke="#fff" stroke-width="3"/>';
  // skirt
  if(dress.rainbow){
    const bands=['#f87171','#fb923c','#facc15','#4ade80','#60a5fa','#a78bfa'];
    s += '<path d="M68,158 L132,158 L152,262 L48,262 Z" fill="#fff" stroke="#e9c46a" stroke-width="2"/>';
    bands.forEach((c,i)=>{
      const y0=158+i*17.3, y1=158+(i+1)*17.3;
      const x0=68-(y0-158)*0.19, x1=132+(y0-158)*0.19, x2=132+(y1-158)*0.19, x3=68-(y1-158)*0.19;
      s += '<polygon points="'+x0+','+y0+' '+x1+','+y0+' '+x2+','+y1+' '+x3+','+y1+'" fill="'+c+'" opacity=".92"/>';
    });
  } else {
    s += '<defs><linearGradient id="pdSkirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+dress.skirt[0]+'"/><stop offset="1" stop-color="'+dress.skirt[1]+'"/></linearGradient></defs>'
       + '<path d="M68,158 L132,158 L152,262 L48,262 Z" fill="url(#pdSkirt)" stroke="#fff" stroke-width="3"/>';
  }
  s += '<polygon points="100,232 103,240 111,240 104.5,245 106.5,253 100,248 93.5,253 95.5,245 89,240 97,240" fill="#fff" opacity=".9"/>'
     + '<circle cx="72" cy="220" r="3" fill="#fff" opacity=".9"/><circle cx="128" cy="205" r="3" fill="#fff" opacity=".9"/>';
  // arms (right waving)
  s += '<rect x="52" y="160" width="16" height="52" rx="8" fill="'+skin+'" transform="rotate(12 60 165)"/>'
     + '<rect x="128" y="118" width="16" height="52" rx="8" fill="'+skin+'" transform="rotate(-150 136 140)"/>'
     + '<circle cx="60" cy="158" r="11" fill="'+dress.bod+'"/><circle cx="140" cy="158" r="11" fill="'+dress.bod+'"/>';
  // bodice + sash
  s += '<path d="M82,106 L118,106 L126,160 L74,160 Z" fill="'+dress.bod+'" stroke="#fff" stroke-width="3"/>'
     + '<path d="M74,146 L126,132 L126,142 L74,156 Z" fill="'+dress.sash+'" opacity=".95"/>';
  if(necklace){
    s += '<path d="M88,108 Q100,120 112,108" fill="none" stroke="#fbbf24" stroke-width="3"/>'
       + '<polygon points="100,118 101.5,122 106,122 102.5,125 103.5,129 100,126.5 96.5,129 97.5,125 94,122 98.5,122" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>';
  }
  // head
  s += '<circle cx="100" cy="68" r="33" fill="'+skin+'" stroke="#dfa06f" stroke-width="2"/>'
     + '<circle cx="78" cy="44" r="12" fill="'+hair+'"/><circle cx="100" cy="38" r="12" fill="'+hair+'"/><circle cx="122" cy="44" r="12" fill="'+hair+'"/>'
     + '<ellipse cx="88" cy="66" rx="7" ry="9" fill="#fff"/><ellipse cx="112" cy="66" rx="7" ry="9" fill="#fff"/>'
     + '<circle cx="89" cy="68" r="3.8" fill="#40264f"/><circle cx="111" cy="68" r="3.8" fill="#40264f"/>'
     + '<circle cx="90.2" cy="66.6" r="1.3" fill="#fff"/><circle cx="112.2" cy="66.6" r="1.3" fill="#fff"/>'
     + '<ellipse cx="76" cy="78" rx="5" ry="3.6" fill="#f191a8"/><ellipse cx="124" cy="78" rx="5" ry="3.6" fill="#f191a8"/>'
     + '<path d="M92,84 Q100,91 108,84" fill="none" stroke="#9a3412" stroke-width="2.5" stroke-linecap="round"/>';
  // crowns
  if(crown==='gold'){
    s += '<polygon points="76,36 81,14 90,30 100,10 110,30 119,14 124,36" fill="#fbbf24" stroke="#b45309" stroke-width="2.5"/>'
       + '<circle cx="100" cy="26" r="4" fill="#ec4899"/><circle cx="86" cy="30" r="2.6" fill="#60a5fa"/><circle cx="114" cy="30" r="2.6" fill="#60a5fa"/>';
  } else if(crown==='tiara'){
    s += '<path d="M78,36 Q100,22 122,36 L122,42 Q100,28 78,42 Z" fill="#e9d5ff" stroke="#8b5cf6" stroke-width="2"/>'
       + '<polygon points="100,12 102,18 108,18 103,22 105,28 100,24 95,28 97,22 92,18 98,18" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>';
  } else if(crown==='flower'){
    s += '<g><circle cx="100" cy="22" r="7" fill="#f9a8d4" stroke="#e0448f" stroke-width="2"/><circle cx="88" cy="28" r="6" fill="#fbcfe8" stroke="#e0448f" stroke-width="2"/><circle cx="112" cy="28" r="6" fill="#fbcfe8" stroke="#e0448f" stroke-width="2"/><circle cx="100" cy="26" r="3.4" fill="#fde047"/></g>';
  }
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
+ '<rect class="room-wall-fill" x="0" y="0" width="600" height="360" fill="#f9cfe3"/>'
+ '<rect x="0" y="0" width="600" height="360" fill="#ffffff" opacity=".18"/>'
+ '<rect x="0" y="350" width="600" height="110" fill="#d9a066"/><rect x="0" y="350" width="600" height="12" fill="#b45309" opacity=".5"/>'
+ '<ellipse cx="300" cy="410" rx="170" ry="34" fill="#f9a8d4" stroke="#fff" stroke-width="4"/>'
+ '<g class="room-stars" opacity=".8" fill="#fff"><circle cx="80" cy="60" r="4"/><circle cx="200" cy="40" r="3"/><circle cx="420" cy="50" r="4"/><circle cx="520" cy="90" r="3"/><circle cx="320" cy="80" r="3"/></g>'
+ '<rect x="300" y="26" width="130" height="34" rx="10" fill="#fbbf24" stroke="#fff" stroke-width="3"/>'
+ '<text x="365" y="50" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="22" font-weight="800" fill="#7c2d12" letter-spacing="6">LAYLA</text>'
+ '<g class="room-window"><rect x="36" y="90" width="110" height="130" rx="14" fill="#bae6fd" stroke="#fff" stroke-width="6"/>'
+ '<text x="91" y="165" text-anchor="middle" font-size="52">🌈</text>'
+ '<rect x="86" y="90" width="10" height="130" fill="#fff"/><rect x="36" y="148" width="110" height="10" fill="#fff"/></g>'
+ '<g class="room-wardrobe" data-zone="dress"><rect x="170" y="130" width="120" height="220" rx="12" fill="#b45309" stroke="#7c2d12" stroke-width="4"/>'
+ '<rect x="182" y="142" width="44" height="196" rx="8" fill="#d9a066"/><rect x="234" y="142" width="44" height="196" rx="8" fill="#d9a066"/>'
+ '<circle cx="222" cy="240" r="6" fill="#fbbf24"/><circle cx="238" cy="240" r="6" fill="#fbbf24"/>'
+ '<text x="230" y="120" text-anchor="middle" font-size="34">👗</text></g>'
+ '<g><rect x="430" y="220" width="130" height="130" rx="12" fill="#f3d9c8" stroke="#fff" stroke-width="4"/>'
+ '<ellipse cx="495" cy="220" rx="70" ry="16" fill="#f9a8d4" stroke="#fff" stroke-width="3"/>'
+ '<rect x="445" y="270" width="100" height="60" rx="10" fill="#f472b6"/>'
+ '<circle cx="460" cy="270" r="10" fill="#fff"/><circle cx="530" cy="270" r="10" fill="#fff"/></g>'
+ '<g class="room-shelf" data-zone="crown"><rect x="440" y="120" width="130" height="12" rx="6" fill="#a16207"/>'
+ '<text x="465" y="112" font-size="30">👑</text><text x="505" y="112" font-size="24">👸</text></g>'
+ '<g class="room-chandelier" style="display:none"><rect x="298" y="0" width="4" height="40" fill="#a16207"/>'
+ '<ellipse cx="300" cy="66" rx="34" ry="20" fill="#fde68a" stroke="#f59e0b" stroke-width="3"/>'
+ '<circle cx="282" cy="66" r="5" fill="#fff"/><circle cx="300" cy="70" r="5" fill="#fff"/><circle cx="318" cy="66" r="5" fill="#fff"/></g>'
+ '<g class="room-petzone" data-zone="pet"><ellipse cx="120" cy="400" rx="62" ry="20" fill="#e9d5ff" stroke="#fff" stroke-width="3"/>'
+ '<text class="room-pet-emoji" x="120" y="392" text-anchor="middle" font-size="52">🐱</text>'
+ '<text x="120" y="438" text-anchor="middle" font-size="26">🦴</text></g>'
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
