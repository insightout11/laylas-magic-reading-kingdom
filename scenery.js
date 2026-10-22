/* ============================================================
   SCENERY — a full-screen felt world behind every game.
   Loaded after storyroad.js.

   Each game already names its setting (game-area data-scene =
   rainbow, meadow, cottage, castle, stage, garden, sky, mirror). This
   draws a matching felt backdrop across the whole game screen, so the
   activity sits IN a place instead of on a card in empty space.

   Also here, because they are about how play feels rather than what it
   teaches:
   - a star burst from wherever a correct answer appears;
   - a soft pop-in for each new activity.
   Drawn once per scene and cached; nothing here animates with JS.
   ============================================================ */
'use strict';

const Scenery = {
  cache: {},
  current: null,

  hills(c1, c2, c3){
    return '<path class="pc" d="M-20 380 Q180 300 380 360 T780 340 T1020 350 V600 H-20 Z" fill="'+c1+'"/>'
      + '<path class="pc" d="M-20 440 Q240 380 500 430 T1020 420 V600 H-20 Z" fill="'+c2+'"/>'
      + '<path class="pc" d="M-20 510 Q320 470 640 510 T1020 500 V600 H-20 Z" fill="'+c3+'"/>'
      + feltStitch('M-10 448 Q240 388 500 438 T1010 428', 'rgba(255,253,248,.7)', 2.4);
  },
  clouds(){
    return '<g class="sc-cloud sc-cloud-a">'+feltLobe(150,90,58,24,'#FFFDF8')+feltLobe(195,76,40,28,'#FFFDF8')+feltLobe(112,98,34,18,'#FFFDF8')+'</g>'
      + '<g class="sc-cloud sc-cloud-b">'+feltLobe(760,120,48,20,'#FFFDF8')+feltLobe(800,106,32,22,'#FFFDF8')+'</g>';
  },
  flowers(n, y0){
    let s='';
    const cols=[FELT.pink,FELT.lilac,FELT.butter,FELT.white,FELT.peach];
    for(let i=0;i<n;i++){
      const x=(i*97+30)%1000, y=(y0||520)+((i*41)%70);
      s+=feltFlower(x,y,8+(i%3)*3,cols[i%cols.length]);
    }
    return s;
  },
  sky(top, bottom){
    return '<defs><linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="'+top+'"/><stop offset="1" stop-color="'+bottom+'"/></linearGradient></defs>'
      + '<rect width="1000" height="600" fill="url(#sc-sky)"/>';
  },
  sun(x,y){
    return '<g class="sc-sun"><circle cx="'+x+'" cy="'+y+'" r="70" fill="#FFF3C4" opacity=".6"/><circle class="pc" cx="'+x+'" cy="'+y+'" r="48" fill="'+FELT.butter+'"/></g>';
  },
  stars(n){
    let s='<g class="sc-twinkle">';
    for(let i=0;i<n;i++){
      const x=(i*137+60)%1000, y=40+((i*71)%260);
      s+=feltStar(x,y,5+(i%3)*3, i%2?'#FFFDF8':FELT.butter, i*13);
    }
    return s+'</g>';
  },

  draw(scene){
    const F=FELT;
    let s='';
    switch(scene){
      case 'rainbow':
        s = this.sky('#9FD6F2','#F3E3FA') + this.sun(880,90) + this.clouds()
          + '<g fill="none" stroke-linecap="round" opacity=".9">'
          + '<path d="M120 420 A380 300 0 0 1 880 420" stroke="'+F.pinkD+'" stroke-width="34"/>'
          + '<path d="M156 420 A344 266 0 0 1 844 420" stroke="'+F.peach+'" stroke-width="34"/>'
          + '<path d="M192 420 A308 232 0 0 1 808 420" stroke="'+F.butter+'" stroke-width="34"/>'
          + '<path d="M228 420 A272 198 0 0 1 772 420" stroke="'+F.mint+'" stroke-width="34"/>'
          + '<path d="M264 420 A236 164 0 0 1 736 420" stroke="'+F.sky+'" stroke-width="34"/>'
          + '<path d="M300 420 A200 130 0 0 1 700 420" stroke="'+F.lilac+'" stroke-width="34"/></g>'
          + this.hills('#A9DCC0', F.grass, '#B3E09C') + this.flowers(12);
        break;
      case 'meadow':
        s = this.sky('#A8DCF5','#E8F7E1') + this.sun(120,96) + this.clouds()
          + this.hills('#A9DCC0', F.grass, '#B3E09C') + this.flowers(16)
          + '<g class="sc-bfly">'+feltLobe(700,250,12,8,F.pink,-30)+feltLobe(716,250,12,8,F.lilac,30)+'</g>';
        break;
      case 'cottage':
        s = this.sky('#FFD9B8','#FFF4E2') + this.sun(860,110) + this.clouds()
          + this.hills('#C9E6B0', '#A9D88F', '#BFE3A6')
          /* little cottages on the hills */
          + '<g transform="translate(70 300)"><rect class="pc" x="0" y="40" width="90" height="70" rx="8" fill="'+F.cream+'"/><path class="pc" d="M-10 46 L45 0 L100 46 Z" fill="'+F.peachD+'"/><rect x="34" y="70" width="22" height="40" rx="8" fill="'+F.tanD+'"/></g>'
          + '<g transform="translate(840 320) scale(.8)"><rect class="pc" x="0" y="40" width="90" height="70" rx="8" fill="'+F.pinkL+'"/><path class="pc" d="M-10 46 L45 0 L100 46 Z" fill="'+F.lilacD+'"/><rect x="34" y="70" width="22" height="40" rx="8" fill="'+F.tanD+'"/></g>'
          + '<path d="M0 470 H1000" stroke="'+F.tan+'" stroke-width="6"/>'
          + (function(){ let f=''; for(let x=10;x<1000;x+=46) f+='<rect class="pc" x="'+x+'" y="440" width="16" height="50" rx="6" fill="'+F.cream+'"/>'; return f; })()
          + this.flowers(12, 530);
        break;
      case 'castle':
        s = this.sky('#F5C9EC','#FFF0F6') + this.clouds()
          /* towers on both sides */
          + '<g><rect class="pc" x="20" y="200" width="110" height="400" rx="10" fill="'+F.lilacL+'"/><path class="pc" d="M10 206 L75 90 L140 206 Z" fill="'+F.pink+'"/>'
          + '<circle class="pc" cx="75" cy="270" r="18" fill="'+F.skyL+'"/><path d="M75 90 v-40 l34 14 l-34 14" fill="'+F.butter+'"/></g>'
          + '<g><rect class="pc" x="870" y="200" width="110" height="400" rx="10" fill="'+F.lilacL+'"/><path class="pc" d="M860 206 L925 90 L990 206 Z" fill="'+F.pink+'"/>'
          + '<circle class="pc" cx="925" cy="270" r="18" fill="'+F.skyL+'"/><path d="M925 90 v-40 l34 14 l-34 14" fill="'+F.butter+'"/></g>'
          /* bunting */
          + '<path d="M130 120 Q500 220 870 120" fill="none" stroke="'+F.tan+'" stroke-width="3"/>'
          + (function(){ let b=''; const cols=[F.pink,F.butter,F.mint,F.sky,F.lilac]; for(let i=0;i<11;i++){ const t=(i+0.5)/11, x=130+740*t, y=120+100*4*t*(1-t)*0.98; b+='<path class="pc" d="M'+(x-14)+' '+y+' L'+(x+14)+' '+y+' L'+x+' '+(y+30)+' Z" fill="'+cols[i%5]+'"/>'; } return b; })()
          + '<rect x="0" y="520" width="1000" height="80" fill="'+F.pinkL+'"/>' + feltStitch('M0 528 H1000','rgba(255,253,248,.8)',2.4);
        break;
      case 'stage':
        s = '<rect width="1000" height="600" fill="#5B2A86"/>'
          + '<ellipse class="sc-spot" cx="500" cy="520" rx="320" ry="70" fill="#FCE7F3" opacity=".35"/>'
          + '<path d="M500 0 L330 520 L670 520 Z" fill="#FFF7D6" opacity=".14" class="sc-beam"/>'
          + this.stars(14)
          /* curtains */
          + '<path class="pc" d="M0 0 H220 Q170 200 200 420 Q120 520 0 600 Z" fill="#C2185B"/>'
          + '<path class="pc" d="M1000 0 H780 Q830 200 800 420 Q880 520 1000 600 Z" fill="#C2185B"/>'
          + '<path d="M60 0 Q40 260 70 560 M130 0 Q110 240 140 480 M940 0 Q960 260 930 560 M870 0 Q890 240 860 480" stroke="rgba(0,0,0,.15)" stroke-width="10" fill="none"/>'
          + '<path class="pc" d="M0 0 H1000 V60 Q900 110 750 70 Q600 120 500 76 Q400 120 250 70 Q100 110 0 60 Z" fill="#E0457B"/>'
          + '<rect x="0" y="548" width="1000" height="52" fill="#B5838D"/>' + feltStitch('M0 556 H1000','rgba(255,253,248,.5)',2.4);
        break;
      case 'garden':
        s = this.sky('#C5E8F7','#F0FBEA') + this.clouds()
          + this.hills('#A9DCC0', F.grass, '#B3E09C')
          /* toadstools */
          + '<g transform="translate(90 420)"><rect class="pc" x="-10" y="0" width="20" height="56" rx="8" fill="'+F.cream+'"/><path class="pc" d="M-50 6 Q0 -60 50 6 Z" fill="'+F.rose+'"/><circle cx="-18" cy="-12" r="6" fill="#FFFDF8"/><circle cx="14" cy="-20" r="5" fill="#FFFDF8"/></g>'
          + '<g transform="translate(900 440) scale(.8)"><rect class="pc" x="-10" y="0" width="20" height="56" rx="8" fill="'+F.cream+'"/><path class="pc" d="M-50 6 Q0 -60 50 6 Z" fill="'+F.lilacD+'"/><circle cx="-18" cy="-12" r="6" fill="#FFFDF8"/></g>'
          + this.flowers(18)
          + '<g class="sc-fireflies">'+feltStar(260,240,5,F.butter)+feltStar(720,200,4,F.butter)+feltStar(560,300,5,'#FFFDF8')+feltStar(380,170,4,'#FFFDF8')+'</g>';
        break;
      case 'sky':
        s = this.sky('#8FC5EE','#E9E0FB') + this.clouds()
          + '<g class="sc-cloud sc-cloud-b">'+feltLobe(420,500,90,34,'#FFFDF8')+feltLobe(500,480,60,40,'#FFFDF8')+feltLobe(600,505,80,30,'#FFFDF8')+'</g>'
          + this.stars(10)
          + '<path class="pc" d="M860 70 a46 46 0 1 0 40 74 a38 38 0 1 1 -40 -74 Z" fill="'+F.butter+'"/>';
        break;
      case 'mirror':
        s = this.sky('#E9D5FF','#FBE7F3') + this.stars(12)
          + '<ellipse cx="500" cy="300" rx="330" ry="250" fill="none" stroke="'+F.butter+'" stroke-width="30"/>'
          + '<ellipse cx="500" cy="300" rx="330" ry="250" fill="none" stroke="#FFFDF8" stroke-width="4" stroke-dasharray="10 12"/>'
          + feltFlower(500,52,18,F.pink) + feltFlower(176,300,14,F.lilac) + feltFlower(824,300,14,F.lilac);
        break;
      default:
        s = this.sky('#A8DCF5','#F3E8FF') + this.sun(860,100) + this.clouds()
          + this.hills('#A9DCC0', F.grass, '#B3E09C') + this.flowers(10);
    }
    return '<svg class="felt scene-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + FELT_DEFS + s + '</svg>';
  },
  apply(scene){
    scene = scene || 'default';
    if(scene===this.current) return;
    this.current = scene;
    const bd = document.getElementById('scene-backdrop'); if(!bd) return;
    if(!this.cache[scene]) this.cache[scene] = this.draw(scene);
    bd.innerHTML = this.cache[scene];
    bd.dataset.scene = scene;
    const gs = document.getElementById('screen-game');
    if(gs) gs.dataset.scene = scene;
  }
};

(function(){
  try{
    const gs = document.getElementById('screen-game');
    const area = document.getElementById('game-area');
    if(!gs || !area) return;
    if(!document.getElementById('scene-backdrop')){
      const bd = document.createElement('div');
      bd.id = 'scene-backdrop'; bd.className = 'scene-backdrop'; bd.setAttribute('aria-hidden','true');
      gs.insertBefore(bd, gs.firstChild);
    }
    Scenery.apply(area.dataset.scene || 'default');
    let lastBurst = 0;
    new MutationObserver(function(muts){
      muts.forEach(function(m){
        if(m.type==='attributes' && m.target===area && m.attributeName==='data-scene'){
          Scenery.apply(area.dataset.scene || 'default');
        }
        /* a correct answer anywhere in the game: burst from it */
        if(m.type==='attributes' && m.attributeName==='class' && m.target!==area){
          const el = m.target;
          if(el.classList && el.classList.contains('correct') && !el.__burst){
            el.__burst = true;
            const now = Date.now();
            if(now-lastBurst > 250 && typeof stickerBurst==='function'){ lastBurst = now; stickerBurst(el, 12); }
          }
        }
      });
    }).observe(area, {attributes:true, subtree:true, attributeFilter:['data-scene','class']});
  }catch(e){ try{ console.warn('scenery', e); }catch(x){} }
})();

if(typeof module!=='undefined' && module.exports){ module.exports = {Scenery}; }
