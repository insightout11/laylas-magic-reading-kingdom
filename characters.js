/* Twinkle the winged kitten + Magic Kingdom world scene (SVG). */
'use strict';

function twinkleSVG(cls, pose){
  pose = pose||'idle';
  return '<svg class="twinkle-svg '+(cls||'')+' pose-'+pose+'" viewBox="0 0 120 120" aria-hidden="true">'
  + '<circle cx="60" cy="62" r="52" fill="#fbcfe8" opacity=".45"/>'
  + '<ellipse class="tw-wing-l" cx="22" cy="58" rx="16" ry="30" fill="#f0abfc" stroke="#c084fc" stroke-width="3" transform="rotate(24 22 58)"/>'
  + '<ellipse class="tw-wing-r" cx="98" cy="58" rx="16" ry="30" fill="#f0abfc" stroke="#c084fc" stroke-width="3" transform="rotate(-24 98 58)"/>'
  + '<path d="M92,100 Q110,96 106,78 Q104,70 98,74 Q102,84 90,88 Z" fill="#fffaf3" stroke="#f0d9c8" stroke-width="2"/>'
  + '<ellipse cx="60" cy="96" rx="20" ry="15" fill="#fffaf3" stroke="#f0d9c8" stroke-width="2"/>'
  + '<ellipse cx="52" cy="109" rx="6" ry="4.5" fill="#f9d9e8"/><ellipse cx="68" cy="109" rx="6" ry="4.5" fill="#f9d9e8"/>'
  + '<polygon points="38,52 34,28 52,40" fill="#fffaf3" stroke="#f0d9c8" stroke-width="2"/>'
  + '<polygon points="82,52 86,28 68,40" fill="#fffaf3" stroke="#f0d9c8" stroke-width="2"/>'
  + '<polygon points="39,46 37,34 47,40" fill="#f9a8d4"/><polygon points="81,46 83,34 73,40" fill="#f9a8d4"/>'
  + '<circle cx="60" cy="72" r="30" fill="#fffaf3" stroke="#f0d9c8" stroke-width="2"/>'
  + '<polygon points="60,30 63,37 71,37 64.5,42 66.5,49 60,45 53.5,49 55.5,42 49,37 57,37" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>'
  + (pose==='happy'
    ? '<path d="M42,71 Q49,64 56,71" fill="none" stroke="#40264f" stroke-width="3" stroke-linecap="round"/>'
      + '<path d="M64,71 Q71,64 78,71" fill="none" stroke="#40264f" stroke-width="3" stroke-linecap="round"/>'
    : '<ellipse cx="49" cy="70" rx="7.5" ry="9.5" fill="#fff"/>'
      + '<ellipse cx="71" cy="70" rx="7.5" ry="9.5" fill="#fff"/>'
      + '<circle cx="'+(pose==='point'?'52':'50')+'" cy="72" r="4" fill="#40264f"/>'
      + '<circle cx="'+(pose==='point'?'72':'70')+'" cy="72" r="4" fill="#40264f"/>'
      + '<circle cx="51.5" cy="70.5" r="1.4" fill="#fff"/><circle cx="71.5" cy="70.5" r="1.4" fill="#fff"/>')
  + '<ellipse cx="40" cy="82" rx="5" ry="3.6" fill="#f9a8d4" opacity=".85"/>'
  + '<ellipse cx="80" cy="82" rx="5" ry="3.6" fill="#f9a8d4" opacity=".85"/>'
  + '<polygon points="57,80 63,80 60,83.5" fill="#f472b6"/>'
  + (pose==='happy'
    ? '<ellipse cx="60" cy="88" rx="5" ry="4" fill="#9a3412"/>'
    : '<path d="M60,83.5 Q60,87 56,87 M60,83.5 Q60,87 64,87" fill="none" stroke="#a16207" stroke-width="1.6" stroke-linecap="round"/>')
  + (pose==='point' ? '<ellipse cx="96" cy="92" rx="8" ry="6" fill="#fffaf3" stroke="#f0d9c8" stroke-width="2"/>' : '')
  + (pose==='fly' ? '<path d="M14,84 L2,80 M16,96 L4,96" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>' : '')
  + '</svg>';
}

const WORLD_SCENE = ''
+ '<svg class="world-svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
+ '<defs>'
+ '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8d8ff"/><stop offset=".55" stop-color="#d9c8ff"/><stop offset="1" stop-color="#ffd9ec"/></linearGradient>'
+ '<radialGradient id="sunGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7c2"/><stop offset=".6" stop-color="#fde68a" stop-opacity=".8"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>'
+ '<linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9a5f5"/><stop offset="1" stop-color="#d9cdfc"/></linearGradient>'
+ '<linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fe3a8"/><stop offset="1" stop-color="#54bd7f"/></linearGradient>'
+ '<linearGradient id="riverG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6ec6f5"/><stop offset=".5" stop-color="#c4e9fd"/><stop offset="1" stop-color="#6ec6f5"/></linearGradient>'
+ '<linearGradient id="towerRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f9a8d4"/><stop offset="1" stop-color="#d63d86"/></linearGradient>'
+ '<linearGradient id="towerWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7ec"/><stop offset="1" stop-color="#f0d3bf"/></linearGradient>'
+ '<radialGradient id="mist" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ded8ff" stop-opacity=".95"/><stop offset="1" stop-color="#ded8ff" stop-opacity="0"/></radialGradient>'
+ '</defs>'
+ '<rect width="1200" height="700" fill="url(#sky)"/>'
+ '<circle cx="150" cy="110" r="115" fill="url(#sunGlow)"/>'
+ '<g class="sun-rays" stroke="#fde047" stroke-width="7" stroke-linecap="round" opacity=".65">'
+ '<line x1="150" y1="38" x2="150" y2="16"/><line x1="150" y1="182" x2="150" y2="204"/>'
+ '<line x1="78" y1="110" x2="56" y2="110"/><line x1="222" y1="110" x2="244" y2="110"/>'
+ '<line x1="99" y1="59" x2="83" y2="43"/><line x1="201" y1="161" x2="217" y2="177"/>'
+ '<line x1="201" y1="59" x2="217" y2="43"/><line x1="99" y1="161" x2="83" y2="177"/></g>'
+ '<circle cx="150" cy="110" r="44" fill="#fde047" stroke="#fff" stroke-width="6"/>'
+ '<g fill="#ffffff" opacity=".92"><ellipse class="cloud c1" cx="420" cy="110" rx="70" ry="26"/><ellipse class="cloud c1" cx="470" cy="100" rx="50" ry="22"/>'
+ '<ellipse class="cloud c2" cx="830" cy="80" rx="80" ry="28"/><ellipse class="cloud c2" cx="890" cy="70" rx="52" ry="22"/>'
+ '<ellipse class="cloud c3" cx="1060" cy="170" rx="60" ry="22"/></g>'
+ '<g opacity=".75"><polygon points="560,330 660,180 760,330" fill="#b9a5f5"/><polygon points="660,180 690,230 630,230" fill="#fff" opacity=".8"/>'
+ '<polygon points="880,330 960,210 1040,330" fill="#c4b0f2"/><polygon points="960,210 984,252 936,252" fill="#fff" opacity=".8"/>'
+ '<g opacity=".65"><rect x="368" y="300" width="26" height="60" fill="#e8dcc8"/><polygon points="364,300 381,272 398,300" fill="#f9a8d4"/>'
+ '<rect x="992" y="300" width="24" height="56" fill="#e8dcc8"/><polygon points="988,300 1004,276 1020,300" fill="#a78bfa"/></g></g>'
+ '<ellipse cx="180" cy="440" rx="260" ry="120" fill="url(#hillFar)"/><ellipse cx="1020" cy="430" rx="280" ry="130" fill="url(#hillFar)"/>'
+ '<ellipse cx="600" cy="480" rx="430" ry="130" fill="url(#hillFar)" opacity=".7"/>'
+ '<g class="rainbow-shimmer" opacity=".9" fill="none" stroke-width="13">'
+ '<path d="M40,470 A170,170 0 0 1 380,470" stroke="#f87171"/><path d="M55,470 A155,155 0 0 1 365,470" stroke="#fb923c"/>'
+ '<path d="M70,470 A140,140 0 0 1 350,470" stroke="#facc15"/><path d="M85,470 A125,125 0 0 1 335,470" stroke="#4ade80"/>'
+ '<path d="M100,470 A110,110 0 0 1 320,470" stroke="#60a5fa"/><path d="M115,470 A95,95 0 0 1 305,470" stroke="#a78bfa"/></g>'
+ '<path d="M520,700 C560,600 480,560 540,480 C600,400 560,340 620,300" fill="none" stroke="url(#riverG)" stroke-width="34" stroke-linecap="round" opacity=".9"/>'
+ '<g fill="none" stroke="#f5dfa8" stroke-width="20" stroke-linecap="round" opacity=".95">'
+ '<path class="path-glow" d="M210,640 C300,600 340,560 420,540 C520,515 560,470 600,430"/>'
+ '<path class="path-glow" d="M600,430 C660,470 720,500 800,520 C880,542 920,580 950,630"/>'
+ '<path class="path-glow" d="M420,540 C380,580 340,610 330,660"/></g>'
+ '<g fill="#fff" opacity=".9"><g transform="translate(392 588)"><ellipse cx="0" cy="3" rx="7" ry="5.5"/><circle cx="-8" cy="-5" r="3"/><circle cx="0" cy="-7" r="3"/><circle cx="8" cy="-5" r="3"/></g>'
+ '<g transform="translate(368 614) rotate(-12)"><ellipse cx="0" cy="3" rx="7" ry="5.5"/><circle cx="-8" cy="-5" r="3"/><circle cx="0" cy="-7" r="3"/><circle cx="8" cy="-5" r="3"/></g>'
+ '<g transform="translate(348 640) rotate(-8)"><ellipse cx="0" cy="3" rx="7" ry="5.5"/><circle cx="-8" cy="-5" r="3"/><circle cx="0" cy="-7" r="3"/><circle cx="8" cy="-5" r="3"/></g></g>'
+ '<g><rect x="520" y="300" width="170" height="150" rx="10" fill="url(#towerWall)" stroke="#fff" stroke-width="4"/>'
+ '<rect x="470" y="250" width="70" height="200" rx="8" fill="url(#towerWall)" stroke="#fff" stroke-width="4"/>'
+ '<rect x="670" y="250" width="70" height="200" rx="8" fill="url(#towerWall)" stroke="#fff" stroke-width="4"/>'
+ '<polygon points="470,250 505,170 540,250" fill="url(#towerRoof)" stroke="#fff" stroke-width="4"/>'
+ '<polygon points="670,250 705,170 740,250" fill="url(#towerRoof)" stroke="#fff" stroke-width="4"/>'
+ '<polygon points="520,300 605,210 690,300" fill="url(#towerRoof)" stroke="#fff" stroke-width="4"/>'
+ '<rect x="585" y="360" width="40" height="90" rx="18" fill="#8b5cf6" stroke="#fbbf24" stroke-width="5"/>'
+ '<g fill="#8fd0f5" stroke="#fff" stroke-width="3"><rect x="480" y="290" width="26" height="40" rx="12"/><rect x="704" y="290" width="26" height="40" rx="12"/>'
+ '<rect x="560" y="320" width="24" height="34" rx="11"/><rect x="622" y="320" width="24" height="34" rx="11"/></g>'
+ '<g class="flag-wave"><polygon points="505,170 545,178 505,190" fill="#fbbf24"/><rect x="502" y="150" width="5" height="42" fill="#a78bfa"/></g>'
+ '<g class="flag-wave f2"><polygon points="705,170 745,178 705,190" fill="#f472b6"/><rect x="702" y="150" width="5" height="42" fill="#a78bfa"/></g></g>'
+ '<g opacity=".95"><rect x="800" y="230" width="90" height="220" rx="12" fill="url(#towerWall)" stroke="#fff" stroke-width="4"/>'
+ '<polygon points="792,232 845,140 898,232" fill="#8b5cf6" stroke="#fff" stroke-width="4"/>'
+ '<circle cx="845" cy="200" r="14" fill="#fde047" stroke="#fff" stroke-width="3"/>'
+ '<rect x="828" y="330" width="34" height="60" rx="15" fill="#8b5cf6"/>'
+ '<rect x="818" y="270" width="54" height="20" rx="6" fill="#8fd0f5" stroke="#fff" stroke-width="3"/></g>'
+ '<g><rect x="200" y="520" width="170" height="110" rx="12" fill="#ffe9c9" stroke="#fff" stroke-width="5"/>'
+ '<polygon points="185,522 285,440 385,522" fill="#d63d86" stroke="#fff" stroke-width="5"/>'
+ '<rect x="265" y="560" width="44" height="70" rx="20" fill="#a16207"/><circle cx="287" cy="595" r="5" fill="#fbbf24"/>'
+ '<rect x="215" y="545" width="44" height="40" rx="8" fill="#bae6fd" stroke="#fff" stroke-width="4"/>'
+ '<g class="kitty-blink"><circle cx="237" cy="562" r="12" fill="#fff"/><circle cx="233" cy="562" r="3.4" fill="#334155"/><circle cx="241" cy="562" r="3.4" fill="#334155"/></g>'
+ '<rect x="345" y="560" width="16" height="70" fill="#a16207"/><ellipse class="tree-sway" cx="353" cy="540" rx="30" ry="26" fill="#4ade80" stroke="#16a34a" stroke-width="3"/></g>'
+ '<g><ellipse cx="1030" cy="470" rx="120" ry="46" fill="url(#hillNear)"/>'
+ '<rect x="950" y="360" width="160" height="26" rx="8" fill="#a16207"/><rect x="958" y="386" width="10" height="60" fill="#854d0e"/><rect x="1092" y="386" width="10" height="60" fill="#854d0e"/>'
+ '<path d="M942,362 L958,300 L974,362 Z" fill="#d63d86"/><path d="M1056,362 L1072,300 L1088,362 Z" fill="#d63d86"/>'
+ '<path d="M950,310 L1110,310 L1096,286 L964,286 Z" fill="#fbbf24" stroke="#fff" stroke-width="3"/></g>'
+ '<g><ellipse cx="850" cy="630" rx="220" ry="60" fill="url(#hillNear)"/>'
+ '<ellipse cx="905" cy="652" rx="52" ry="15" fill="#7dd3fc" stroke="#fff" stroke-width="4"/>'
+ '<path d="M875,650 Q895,645 915,649" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>'
+ '<g class="flower-sway" font-size="26" text-anchor="middle"><text x="700" y="640">🌷</text><text x="760" y="660">🌸</text><text x="990" y="650">🌷</text><text x="940" y="668">🌼</text></g></g>'
+ '<g><ellipse cx="480" cy="660" rx="150" ry="42" fill="#a7f3d0"/>'
+ '<g class="flower-sway f2" font-size="26" text-anchor="middle"><text x="420" y="665">🌸</text><text x="480" y="678">🍄</text><text x="540" y="665">🌷</text></g></g>'
+ '<g><rect x="90" y="560" width="16" height="60" fill="#a16207"/><ellipse class="tree-sway" cx="98" cy="545" rx="34" ry="30" fill="#22c55e" stroke="#15803d" stroke-width="3"/>'
+ '<rect x="1090" y="540" width="16" height="60" fill="#a16207"/><ellipse class="tree-sway f2" cx="1098" cy="525" rx="34" ry="30" fill="#22c55e" stroke="#15803d" stroke-width="3"/></g>'
+ '<ellipse class="mist" cx="1030" cy="400" rx="120" ry="70" fill="url(#mist)"/>'
+ '<ellipse class="mist m2" cx="845" cy="330" rx="95" ry="85" fill="url(#mist)"/>'
+ '<ellipse class="mist m3" cx="480" cy="650" rx="130" ry="50" fill="url(#mist)"/>'
+ '<g fill="#3d9e63"><path d="M0,700 Q25,630 50,700 Z"/><path d="M90,700 Q115,640 140,700 Z"/><path d="M1060,700 Q1085,640 1110,700 Z"/><path d="M1150,700 Q1175,645 1200,700 Z"/></g>'
+ '<g><rect x="58" y="636" width="7" height="40" fill="#16a34a"/><g fill="#f472b6"><ellipse cx="61" cy="618" rx="9" ry="14"/><ellipse cx="61" cy="648" rx="9" ry="14"/><ellipse cx="46" cy="633" rx="14" ry="9"/><ellipse cx="76" cy="633" rx="14" ry="9"/></g><circle cx="61" cy="633" r="8" fill="#fde047"/></g>'
+ '<g><rect x="1130" y="640" width="7" height="40" fill="#16a34a"/><g fill="#c4b5fd"><ellipse cx="1133" cy="622" rx="9" ry="14"/><ellipse cx="1133" cy="652" rx="9" ry="14"/><ellipse cx="1118" cy="637" rx="14" ry="9"/><ellipse cx="1148" cy="637" rx="14" ry="9"/></g><circle cx="1133" cy="637" r="8" fill="#fff"/></g>'
+ '<g fill="#fef9c7"><circle class="firefly" cx="300" cy="560" r="5"/><circle class="firefly" cx="520" cy="600" r="4" style="animation-delay:1s"/><circle class="firefly" cx="700" cy="540" r="5" style="animation-delay:2s"/><circle class="firefly" cx="940" cy="560" r="4" style="animation-delay:.5s"/><circle class="firefly" cx="220" cy="640" r="4" style="animation-delay:1.6s"/><circle class="firefly" cx="1080" cy="600" r="5" style="animation-delay:2.4s"/></g>'
+ '</svg>'
+ '<div class="twinkle-fly" id="twinkle-fly" aria-hidden="true"></div>'
+ '<div class="butterfly bf1" aria-hidden="true">🦋</div>'
+ '<div class="butterfly bf2" aria-hidden="true">🦋</div>';

function sunSVG(){
  return '<svg class="obj-svg" viewBox="0 0 80 80" aria-hidden="true">'
  + '<circle cx="40" cy="40" r="26" fill="#fde047" stroke="#f59e0b" stroke-width="3"/>'
  + '<g stroke="#f59e0b" stroke-width="4" stroke-linecap="round">'
  + '<line x1="40" y1="4" x2="40" y2="12"/><line x1="40" y1="68" x2="40" y2="76"/>'
  + '<line x1="4" y1="40" x2="12" y2="40"/><line x1="68" y1="40" x2="76" y2="40"/>'
  + '<line x1="15" y1="15" x2="20" y2="20"/><line x1="60" y1="60" x2="65" y2="65"/>'
  + '<line x1="65" y1="15" x2="60" y2="20"/><line x1="20" y1="60" x2="15" y2="65"/></g>'
  + '<circle cx="33" cy="38" r="3" fill="#92400e"/><circle cx="47" cy="38" r="3" fill="#92400e"/>'
  + '<path d="M32,47 Q40,53 48,47" stroke="#92400e" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
  + '<ellipse cx="28" cy="44" rx="4" ry="2.6" fill="#fda4af"/><ellipse cx="52" cy="44" rx="4" ry="2.6" fill="#fda4af"/>'
  + '</svg>';
}
function moonSVG(){
  return '<svg class="obj-svg" viewBox="0 0 80 80" aria-hidden="true">'
  + '<path d="M52,8 Q30,20 30,42 Q30,64 52,74 Q40,76 30,70 Q14,61 14,42 Q14,23 30,14 Q40,8 52,8 Z" fill="#fde68a" stroke="#f59e0b" stroke-width="3"/>'
  + '<circle cx="34" cy="38" r="2.6" fill="#92400e"/><path d="M30,48 Q35,51 40,48" stroke="#92400e" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
  + '<polygon points="60,18 61.5,22 66,22 62.5,24.5 63.5,29 60,26.5 56.5,29 57.5,24.5 54,22 58.5,22" fill="#fff"/>'
  + '</svg>';
}
function initWorld(){
  const map = document.getElementById('kingdom-map');
  if(map && !map.querySelector('.world-svg')){
    map.insertAdjacentHTML('afterbegin', WORLD_SCENE);
  }
  const fly = document.getElementById('twinkle-fly');
  if(fly) fly.innerHTML = twinkleSVG('fly', 'fly');
  const av = document.getElementById('twinkle-avatar');
  if(av) av.innerHTML = twinkleSVG('guide');
  const mini = document.getElementById('twinkle-mini-cat');
  if(mini) mini.innerHTML = twinkleSVG('mini');
  const sp = document.getElementById('splash-twinkle');
  if(sp) sp.innerHTML = twinkleSVG('splash');
  try{
    map.querySelectorAll('.scene-mark').forEach(m=>{
      const e = m.querySelector('.land-emoji');
      const ic = markIcon(m.getAttribute('data-land'));
      if(e && ic) e.innerHTML = ic;
    });
  }catch(err){}
}

/* Original mini landmark icons — no emoji carries the home identity. */
function markIcon(land){
  const open = '<svg class="mark-svg" viewBox="0 0 64 64" aria-hidden="true">';
  if(land==='rainbow') return open+'<g fill="none" stroke-width="7"><path d="M8,50 A24,24 0 0 1 56,50" stroke="#f87171"/><path d="M15,50 A17,17 0 0 1 49,50" stroke="#facc15"/><path d="M22,50 A10,10 0 0 1 42,50" stroke="#60a5fa"/></g><circle cx="10" cy="50" r="6" fill="#fff"/><circle cx="54" cy="50" r="6" fill="#fff"/></svg>';
  if(land==='castle') return open+'<rect x="14" y="28" width="36" height="24" rx="3" fill="#fff7ec" stroke="#c084fc" stroke-width="3"/><rect x="8" y="20" width="12" height="32" fill="#fff7ec" stroke="#c084fc" stroke-width="3"/><rect x="44" y="20" width="12" height="32" fill="#fff7ec" stroke="#c084fc" stroke-width="3"/><polygon points="8,20 14,8 20,20" fill="#f472b6"/><polygon points="44,20 50,8 56,20" fill="#f472b6"/><polygon points="14,28 32,10 50,28" fill="#f9a8d4" stroke="#c084fc" stroke-width="2"/><rect x="28" y="38" width="8" height="14" rx="3" fill="#8b5cf6"/></svg>';
  if(land==='kitten') return open+'<rect x="12" y="28" width="40" height="24" rx="4" fill="#ffe9c9" stroke="#a16207" stroke-width="3"/><polygon points="8,30 32,12 56,30" fill="#e0448f"/><circle cx="32" cy="40" r="10" fill="#fff"/><circle cx="28.5" cy="39" r="2.4" fill="#334155"/><circle cx="35.5" cy="39" r="2.4" fill="#334155"/><polygon points="24,33 23,27 28,30" fill="#fff" stroke="#94a3b8"/><polygon points="40,33 41,27 36,30" fill="#fff" stroke="#94a3b8"/></svg>';
  if(land==='unicorn') return open+unicornHeadSVG()+ '</svg>';
  if(land==='ballet') return open+'<rect x="10" y="44" width="44" height="8" rx="3" fill="#a16207"/><path d="M8,44 L14,16 L20,44 Z" fill="#e0448f"/><path d="M44,44 L50,16 L56,44 Z" fill="#e0448f"/><path d="M12,20 L52,20 L48,10 L16,10 Z" fill="#fbbf24"/><circle cx="32" cy="36" r="7" fill="#fbcfe8"/><path d="M32,29 L32,43 M27,34 L37,34" stroke="#8b5cf6" stroke-width="2"/></svg>';
  if(land==='story') return open+'<rect x="14" y="14" width="36" height="40" rx="4" fill="#8b5cf6"/><rect x="14" y="14" width="8" height="40" fill="#6d28d9"/><rect x="26" y="22" width="20" height="4" rx="2" fill="#fde68a"/><rect x="26" y="30" width="20" height="4" rx="2" fill="#e9d5ff"/><rect x="26" y="38" width="14" height="4" rx="2" fill="#e9d5ff"/><polygon points="50,6 51.5,10 56,10 52.5,12.5 53.5,17 50,14.5 46.5,17 47.5,12.5 44,10 48.5,10" fill="#fbbf24"/></svg>';
  if(land==='fairy') return open+'<circle cx="32" cy="40" r="6" fill="#fde047"/><g fill="#f9a8d4"><ellipse cx="32" cy="28" rx="6" ry="9"/><ellipse cx="32" cy="52" rx="6" ry="9"/><ellipse cx="20" cy="40" rx="9" ry="6"/><ellipse cx="44" cy="40" rx="9" ry="6"/></g><circle cx="32" cy="40" r="5" fill="#f59e0b"/><path d="M32,52 L32,60 M32,56 L26,52 M32,56 L38,52" stroke="#16a34a" stroke-width="2.5"/></svg>';
  return null;
}
function unicornHeadSVG(){
  return '<ellipse cx="30" cy="30" rx="10" ry="16" fill="#c4b5fd" transform="rotate(20 30 30)"/>'
  + '<ellipse cx="26" cy="42" rx="13" ry="15" fill="#ffffff" stroke="#e9d5ff" stroke-width="2"/>'
  + '<ellipse cx="40" cy="40" rx="11" ry="13" fill="#ffffff" stroke="#e9d5ff" stroke-width="2"/>'
  + '<polygon points="20,30 14,14 26,24" fill="#fff" stroke="#e9d5ff" stroke-width="2"/>'
  + '<polygon points="30,22 34,6 38,22" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>'
  + '<circle cx="44" cy="38" r="3" fill="#40264f"/><circle cx="45" cy="37" r="1" fill="#fff"/>'
  + '<ellipse cx="50" cy="46" rx="2.5" ry="2" fill="#f9a8d4"/>';
}
function unicornSVG(){
  return '<svg class="unicorn-svg" viewBox="0 0 200 170" aria-hidden="true">'
  + '<ellipse cx="100" cy="152" rx="70" ry="12" fill="#bbf7d0"/>'
  + '<path class="uni-tail" d="M40,90 Q18,100 26,128 Q30,138 36,130 Q30,112 46,104 Z" fill="#c4b5fd" stroke="#8b5cf6" stroke-width="2"/>'
  + '<rect x="66" y="108" width="11" height="40" rx="5" fill="#fff" stroke="#e9d5ff" stroke-width="2"/><rect x="86" y="108" width="11" height="40" rx="5" fill="#fff" stroke="#e9d5ff" stroke-width="2"/>'
  + '<rect x="118" y="108" width="11" height="40" rx="5" fill="#f5f0ff" stroke="#e9d5ff" stroke-width="2"/><rect x="136" y="108" width="11" height="40" rx="5" fill="#f5f0ff" stroke="#e9d5ff" stroke-width="2"/>'
  + '<ellipse cx="102" cy="92" rx="52" ry="32" fill="#ffffff" stroke="#e9d5ff" stroke-width="3"/>'
  + '<path d="M140,80 Q160,60 158,36 Q157,28 150,32 Q146,52 134,66 Z" fill="#fff" stroke="#e9d5ff" stroke-width="3"/>'
  + '<ellipse cx="162" cy="34" rx="15" ry="13" fill="#fff" stroke="#e9d5ff" stroke-width="2"/>'
  + '<polygon points="152,26 148,12 158,20" fill="#fff" stroke="#e9d5ff" stroke-width="2"/>'
  + '<polygon points="160,20 166,2 170,20" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>'
  + '<path d="M146,30 Q140,44 144,58 Q138,44 132,40 Q138,30 146,30" fill="#f0abfc"/>'
  + '<path d="M156,26 Q162,38 160,52 Q156,40 150,36 Q154,30 156,26" fill="#a78bfa"/>'
  + '<circle cx="165" cy="33" r="3" fill="#40264f"/><circle cx="166" cy="32" r="1" fill="#fff"/>'
  + '<ellipse cx="171" cy="40" rx="2.6" ry="2" fill="#f9a8d4"/>'
  + '<polygon points="100,46 102,52 108,52 103,56 105,62 100,58 95,62 97,56 92,52 98,52" fill="#fde047"/>'
  + '</svg>';
}
function cottageDoorSVG(){
  return '<svg class="door-svg" viewBox="0 0 120 150" aria-hidden="true">'
  + '<rect x="20" y="10" width="80" height="130" rx="38" fill="#a16207" stroke="#fbbf24" stroke-width="5"/>'
  + '<rect x="32" y="24" width="56" height="104" rx="28" fill="#854d0e"/>'
  + '<circle cx="82" cy="86" r="8" fill="#fbbf24" stroke="#fff" stroke-width="3"/>'
  + '<rect x="52" y="60" width="16" height="24" rx="8" fill="#312e81"/>'
  + '<polygon points="60,44 61.5,48 66,48 62.5,51 63.5,55 60,52.5 56.5,55 57.5,51 54,48 58.5,48" fill="#fde047"/>'
  + '</svg>';
}
