/* Twinkle the winged kitten + Magic Kingdom world scene (SVG). */
'use strict';

function twinkleSVG(cls){
  return '<svg class="twinkle-svg '+(cls||'')+'" viewBox="0 0 120 120" aria-hidden="true">'
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
  + '<ellipse cx="49" cy="70" rx="7.5" ry="9.5" fill="#fff"/>'
  + '<ellipse cx="71" cy="70" rx="7.5" ry="9.5" fill="#fff"/>'
  + '<circle cx="50" cy="72" r="4" fill="#40264f"/><circle cx="70" cy="72" r="4" fill="#40264f"/>'
  + '<circle cx="51.5" cy="70.5" r="1.4" fill="#fff"/><circle cx="71.5" cy="70.5" r="1.4" fill="#fff"/>'
  + '<ellipse cx="40" cy="82" rx="5" ry="3.6" fill="#f9a8d4" opacity=".85"/>'
  + '<ellipse cx="80" cy="82" rx="5" ry="3.6" fill="#f9a8d4" opacity=".85"/>'
  + '<polygon points="57,80 63,80 60,83.5" fill="#f472b6"/>'
  + '<path d="M60,83.5 Q60,87 56,87 M60,83.5 Q60,87 64,87" fill="none" stroke="#a16207" stroke-width="1.6" stroke-linecap="round"/>'
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
+ '<circle cx="150" cy="110" r="115" fill="url(#sunGlow)"/><circle cx="150" cy="110" r="44" fill="#fde047" stroke="#fff" stroke-width="6"/>'
+ '<g fill="#ffffff" opacity=".92"><ellipse class="cloud c1" cx="420" cy="110" rx="70" ry="26"/><ellipse class="cloud c1" cx="470" cy="100" rx="50" ry="22"/>'
+ '<ellipse class="cloud c2" cx="830" cy="80" rx="80" ry="28"/><ellipse class="cloud c2" cx="890" cy="70" rx="52" ry="22"/>'
+ '<ellipse class="cloud c3" cx="1060" cy="170" rx="60" ry="22"/></g>'
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
+ '<g class="flower-sway" font-size="26" text-anchor="middle"><text x="700" y="640">🌷</text><text x="760" y="660">🌸</text><text x="990" y="650">🌷</text><text x="940" y="668">🌼</text></g></g>'
+ '<g><ellipse cx="480" cy="660" rx="150" ry="42" fill="#a7f3d0"/>'
+ '<g class="flower-sway f2" font-size="26" text-anchor="middle"><text x="420" y="665">🌸</text><text x="480" y="678">🍄</text><text x="540" y="665">🌷</text></g></g>'
+ '<g><rect x="90" y="560" width="16" height="60" fill="#a16207"/><ellipse class="tree-sway" cx="98" cy="545" rx="34" ry="30" fill="#22c55e" stroke="#15803d" stroke-width="3"/>'
+ '<rect x="1090" y="540" width="16" height="60" fill="#a16207"/><ellipse class="tree-sway f2" cx="1098" cy="525" rx="34" ry="30" fill="#22c55e" stroke="#15803d" stroke-width="3"/></g>'
+ '<ellipse class="mist" cx="1030" cy="400" rx="120" ry="70" fill="url(#mist)"/>'
+ '<ellipse class="mist m2" cx="845" cy="330" rx="95" ry="85" fill="url(#mist)"/>'
+ '<ellipse class="mist m3" cx="480" cy="650" rx="130" ry="50" fill="url(#mist)"/>'
+ '</svg>'
+ '<div class="twinkle-fly" id="twinkle-fly" aria-hidden="true"></div>'
+ '<div class="butterfly bf1" aria-hidden="true">🦋</div>'
+ '<div class="butterfly bf2" aria-hidden="true">🦋</div>';

function initWorld(){
  const map = document.getElementById('kingdom-map');
  if(map && !map.querySelector('.world-svg')){
    map.insertAdjacentHTML('afterbegin', WORLD_SCENE);
  }
  const fly = document.getElementById('twinkle-fly');
  if(fly) fly.innerHTML = twinkleSVG('fly');
  const av = document.getElementById('twinkle-avatar');
  if(av) av.innerHTML = twinkleSVG('guide');
  const mini = document.getElementById('twinkle-mini-cat');
  if(mini) mini.innerHTML = twinkleSVG('mini');
  const sp = document.getElementById('splash-twinkle');
  if(sp) sp.innerHTML = twinkleSVG('splash');
}
