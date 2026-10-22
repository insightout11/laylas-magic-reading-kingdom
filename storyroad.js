/* ============================================================
   STORY ROAD — the reading journey.
   Loaded after pets.js. Replaces the Storybook Tower shelf with a
   winding road through six lands, one storybook per stop.

   - A book's land and place come from the newest sound it needs, so the
     road always follows what she has actually learned.
   - A book is READY when every sound in it is approved and introduced.
     Heart words never lock a book: the book teaches them before page 1.
   - A book that needs a sound the family rejected or never recorded is
     left off the road entirely, never shown as a tease.
   - First read of a book: stars, and the pet egg gets warmer. Reading
     every book in a land wakes the land and lays a golden egg.
   ============================================================ */
'use strict';

const StoryRoad = {
  fromAdventure: false,
  _order: null,

  orderOf(id){
    if(!this._order){
      this._order = {};
      Phonics.catalog.forEach(p=>{ this._order[p.id]=p.order; });
    }
    return this._order[id] || 999;
  },
  /* A sound that could ever be heard here: approved, or still waiting to
     be introduced. Rejected or missing sounds can't be, so their books
     stay off the road. */
  possibleSound(id){
    try{ if(isPhonemeUsable(id)) return true; }catch(e){}
    if(!Phonics.byId[id]) return false;
    try{ return approvalOf(id).st !== 'REJECTED' && !!manifestOf(id); }catch(e){ return false; }
  },
  info(st){
    const sounds = [], hearts = [];
    let key = 0;
    Reading.storyPages(st).forEach(sent=>{
      Reading.sentenceWords(sent).forEach(w=>{
        if(!w) return;
        if(w.heart){ if(hearts.indexOf(w.t)<0) hearts.push(w.t); return; }
        w.ph.forEach(p=>{ if(sounds.indexOf(p)<0) sounds.push(p); key=Math.max(key, this.orderOf(p)); });
      });
    });
    const possible = sounds.every(p=>this.possibleSound(p));
    const missing = sounds.filter(p=>!Reading.soundReady(p)).sort((a,b)=>this.orderOf(a)-this.orderOf(b));
    const land = STORY_LANDS.find(l=>key<=l.upto) || STORY_LANDS[STORY_LANDS.length-1];
    return {st, key, land, possible, missing, hearts, read:(S.storiesRead||[]).indexOf(st.id)>=0};
  },
  /* Every book on the road, in road order. */
  books(){
    return STORIES.map((st,i)=>Object.assign(this.info(st), {i}))
      .filter(b=>b.possible)
      .sort((a,b)=> (a.key-b.key) || (a.i-b.i));
  },
  status(b){ return b.read ? 'read' : (b.missing.length ? 'locked' : 'ready'); },
  nextStory(){
    const b = this.books().find(x=>this.status(x)==='ready');
    return b ? b.st : null;
  },
  counts(){
    const all=this.books();
    return {read:all.filter(b=>b.read).length, total:all.length, ready:all.filter(b=>this.status(b)==='ready').length};
  },

  /* ---------------- the road screen ---------------- */
  open(opts){
    opts = opts||{};
    this.fromAdventure = false;
    showScreen('road');
    try{ AudioSys.setScene('castle'); }catch(e){}
    this.render(opts.celebrate);
    const c=this.counts(), next=this.nextStory();
    if(opts.celebrate) return;
    if(next) Sound.say(c.read ? 'The Story Road! A new book is waiting for you!' : 'Welcome to the Story Road! Tap the glowing book to read it!');
    else Sound.say('The Story Road! Learn more sounds to open more books!');
  },
  render(celebrate){
    const road=$('road'); if(!road) return;
    const books=this.books();
    const c=this.counts();
    $('road-count').textContent = c.read+' / '+c.total;
    const next = books.find(b=>this.status(b)==='ready');
    let h='';
    STORY_LANDS.forEach((land, li)=>{
      const lb = books.filter(b=>b.land.id===land.id);
      if(!lb.length) return;
      const done = lb.filter(b=>b.read).length;
      const awake = done===lb.length;
      const open = lb.some(b=>this.status(b)!=='locked');
      const rowH = 132, top = 26;
      const H = top + lb.length*rowH;
      const xs = [30,68,40,72,26,60,44,74];
      const pts = lb.map((b,i)=>[xs[(i+li)%xs.length], top+56+i*rowH]);
      let d = 'M'+pts[0][0]+' 0 L'+pts[0][0]+' '+pts[0][1];
      for(let i=1;i<pts.length;i++){
        const a=pts[i-1], b=pts[i], my=(a[1]+b[1])/2;
        d += ' C'+a[0]+' '+my+' '+b[0]+' '+my+' '+b[0]+' '+b[1];
      }
      d += ' L'+pts[pts.length-1][0]+' '+H;
      h += '<section class="road-land'+(awake?' awake':'')+(open?'':' asleep')+'" data-land="'+land.id+'" '
         + 'style="--c1:'+land.colors[0]+';--c2:'+land.colors[1]+'">'
         + '<div class="land-banner"><span class="lb-emoji">'+land.emoji+'</span><span class="lb-name">'+land.name+'</span>'
         + '<span class="lb-count">'+(awake?'✨ awake!':'⭐ '+done+'/'+lb.length)+'</span></div>'
         + '<div class="land-stops" style="height:'+H+'px">'
         + '<svg class="road-path" viewBox="0 0 100 '+H+'" preserveAspectRatio="none" aria-hidden="true">'
         +   '<path d="'+d+'" class="rp-base" vector-effect="non-scaling-stroke"/>'
         +   '<path d="'+d+'" class="rp-dash" vector-effect="non-scaling-stroke"/></svg>';
      lb.forEach((b,i)=>{
        const st=this.status(b), isNext = next && next.st.id===b.st.id;
        const need = b.missing[0];
        const cls = 'road-book '+st+(isNext?' next':'')+(celebrate===b.st.id?' just-read':'');
        h += '<button class="'+cls+'" data-book="'+b.st.id+'" style="left:'+pts[i][0]+'%;top:'+pts[i][1]+'px">'
           + '<span class="rb-cover">'+bookCoverSVG(land, b.st.art)+'</span>'
           + (st==='read' ? '<span class="rb-star">⭐</span>' : '')
           + (st==='locked' && need ? '<span class="rb-need">🔒 '+(PHONEMES[need]?PHONEMES[need].emoji+' ':'')+'<b>'+G(need)+'</b></span>' : '')
           + (isNext ? '<span class="rb-ribbon">Read me! ✨</span>' : '')
           + '<span class="rb-title">'+b.st.title+'</span></button>';
      });
      h += '</div></section>';
    });
    h += '<div class="road-end">🌈 More books open as you learn new sounds!<br>'
       + '<button class="magic-btn secondary" id="road-practice">✨ Practice sentences</button></div>';
    road.innerHTML = h;
    road.querySelectorAll('.road-book').forEach(btn=>{
      btn.onclick=()=>{
        const b = books.find(x=>x.st.id===btn.dataset.book); if(!b) return;
        const st=this.status(b);
        if(st==='locked'){
          btn.classList.remove('nope'); void btn.offsetWidth; btn.classList.add('nope');
          AudioSys.sfx('boop',0.5);
          const need=b.missing[0];
          (async ()=>{
            await Sound.say('This book is still sleeping. Learn this sound to wake it up!');
            if(need && isPhonemeUsable(need)) await Sound.phoneme(need);
          })();
          return;
        }
        AudioSys.sfx('page');
        this.openBook(b.st);
      };
    });
    const pr=$('road-practice');
    if(pr) pr.onclick=()=>{ AudioSys.sfx('page'); showScreen('story'); renderSentencePractice(Reading.readableSentences()); };
    /* bring the next book (or the one just read) into view */
    const focus = road.querySelector('.road-book.just-read') || road.querySelector('.road-book.next');
    if(focus) requestAnimationFrame(()=>{ try{ focus.scrollIntoView({block:'center', behavior:celebrate?'smooth':'auto'}); }catch(e){} });
    if(celebrate){
      const jr=road.querySelector('.road-book.just-read');
      if(jr && typeof stickerBurst==='function') setTimeout(()=>stickerBurst(jr, 14), 500);
    }
  },

  /* ---------------- reading a book ---------------- */
  openBook(st, opts){
    opts = opts||{};
    this.fromAdventure = !!opts.fromAdventure;
    this._finished = false;
    showScreen('story');
    try{ AudioSys.setScene('castle'); }catch(e){}
    const info = this.info(st);
    const untaught = info.hearts.filter(t=>!Reading.heartReady(t));
    const go = ()=>{ storyState={story:st, page:0}; renderStoryPage(); };
    if(untaught.length) this.teachHearts(untaught, go);
    else go();
  },
  /* A heart word card before page one: see it, hear it, keep it. */
  teachHearts(list, done){
    const t=$('story-page-title'), s=$('story-sentence'), a=$('story-art');
    let i=0;
    const show=()=>{
      if(i>=list.length){ done(); return; }
      const w = Reading.byText(list[i]);
      t.textContent='💗 A heart word for this book!';
      s.innerHTML='<div class="heart-card"><span class="hc-word">'+w.t+'</span><span class="hc-note">We just remember this one!</span></div>';
      a.innerHTML='<div class="page-scene heart-scene"><span class="ps-sticker" style="--d:0s">💗</span></div>';
      $('btn-story-hear').classList.remove('hidden');
      $('btn-story-read').classList.remove('hidden');
      $('btn-story-read').textContent='💗 I know it!';
      $('btn-story-hear').textContent='🔊 Hear it';
      const say=()=>Sound.say('This is a heart word. It says '+w.t+'. '+w.t+'!');
      $('btn-story-hear').onclick=say;
      $('btn-story-read').onclick=()=>{
        if((S.heartWords||[]).indexOf(w.t)<0){ S.heartWords.push(w.t); save(); }
        AudioSys.sfx('sparkle'); sparkles(14);
        i++; show();
      };
      $('story-prev').onclick=()=>this.open();
      $('story-next').onclick=()=>$('btn-story-read').click();
      currentInstruction='This is a heart word. It says '+w.t+'.';
      say();
    };
    show();
  },
  /* The picture on a story page: the land's colours, felt hills and the
     page's stickers, each with its own little bounce. */
  sceneHTML(sent, st){
    const info = this.info(st);
    const land = info.land;
    const art = String((sent && sent.art) || st.art || '📖');
    let parts;
    try{ parts = Array.from(new Intl.Segmenter('en',{granularity:'grapheme'}).segment(art)).map(x=>x.segment); }
    catch(e){ parts = Array.from(art); }
    parts = parts.filter(p=>p.trim());
    let stickers='';
    parts.slice(0,4).forEach((p,i)=>{ stickers+='<span class="ps-sticker" style="--d:'+(i*0.25)+'s">'+p+'</span>'; });
    return '<div class="page-scene" style="--c1:'+land.colors[0]+';--c2:'+land.colors[1]+'">'
      + '<svg class="ps-hills" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">'
      + '<path d="M0 50 Q100 20 200 46 T400 40 V80 H0 Z" fill="#A9DCC0"/>'
      + '<path d="M0 64 Q120 44 240 62 T400 58 V80 H0 Z" fill="#9BD483"/></svg>'
      + '<div class="ps-row">'+stickers+'</div></div>';
  },

  /* ---------------- finishing a book ---------------- */
  finished(st){
    /* One finish per opening: a second tap on "I read it!" during the
       celebration must not count the book again. */
    if(this._finished) return;
    this._finished = true;
    try{ $('btn-story-read').classList.add('hidden'); $('btn-story-hear').classList.add('hidden'); }catch(e){}
    const firstEver = !(S.storiesRead||[]).length;
    const firstTime = (S.storiesRead||[]).indexOf(st.id) < 0;
    if(firstTime){ S.storiesRead.push(st.id); save(); }
    addStars(firstTime ? 15 : 5);
    const fromAdv = this.fromAdventure;
    this.fromAdventure = false;
    if(firstTime && typeof Pets!=='undefined'){ Pets.warm(2); }
    const info = this.info(st);
    const land = info.land;
    const landBooks = this.books().filter(b=>b.land.id===land.id);
    const landAwake = firstTime && landBooks.length>0 && landBooks.every(b=>b.read);
    Bus.emit('STORY_FINISHED', {id:st.id, firstTime:firstTime, landAwake:landAwake});

    const after3 = ()=>{
      if(fromAdv){
        try{ if(typeof Pets!=='undefined') Pets.onActivityDone(); }catch(e){}
        endSession();
      } else {
        this.open({celebrate: firstTime ? st.id : null});
      }
    };
    const wake = ()=>{
      if(!landAwake){ after3(); return; }
      if(typeof Pets!=='undefined') Pets.goldenEgg();
      this.milestone(land.name+' is awake!', land.emoji,
        'You read every book in '+land.name+'! A golden egg is waiting in your pet garden! 🥚✨',
        'Wow! You read every book in '+land.name+'! A golden egg is waiting for you!', after3);
    };
    if(firstEver){
      this.milestone('LAYLA READ A STORY!', st.title, 'You read a WHOLE story by yourself. You are a reader! 📖✨', null, wake, {clip:'sentence-win'});
      try{ unlockCastleFeature('pet-room'); }catch(e){}
    } else if(firstTime){
      this.milestone('A new book read!', st.title, '+15 stars ⭐ and your magic egg got warmer! 🥚',
        'You read '+st.title+'! Fifteen stars, and your egg got warmer!', wake);
    } else {
      this.milestone('You read it again!', st.title, 'Reading it again makes you even stronger! 💪📖',
        'You read it again! Great reading!', after3);
    }
    try{ checkMilestones(); }catch(e){}
  },
  /* One celebration, then `then` when she taps Yay. */
  milestone(title, word, text, speech, then, opts){
    opts = opts||{};
    Flow.rewardPending = true;
    showMilestone(title, word, text, opts.clip?{clip:opts.clip}:{silent:true});
    if(speech) Sound.say(speech);
    const btn=$('btn-milestone-ok');
    let fired=false;
    const go=()=>{
      if(fired) return; fired=true;
      $('milestone-modal').classList.add('hidden');
      Flow.rewardPending = false;
      btn.onclick=()=>$('milestone-modal').classList.add('hidden');
      if(then) Scene.later(250, then, 'storyMilestone');
    };
    btn.onclick=go;
  }
};

/* Felt book cover for a road stop. */
function bookCoverSVG(land, emoji){
  const c = land.colors;
  const cover = {cottage:FELT.peach, meadow:FELT.mint, hills:FELT.grass, bay:FELT.sky, forest:FELT.lilac, castle:FELT.pink}[land.id] || FELT.pink;
  const s = '<ellipse cx="60" cy="112" rx="40" ry="6" fill="'+FELT.shadow+'"/>'
    + '<rect class="pc" x="22" y="14" width="80" height="92" rx="10" fill="#FFFDF8"/>'
    + '<rect class="pc" x="16" y="10" width="80" height="92" rx="10" fill="'+cover+'"/>'
    + '<rect x="16" y="10" width="14" height="92" rx="6" fill="rgba(0,0,0,.12)"/>'
    + feltStitch('M36 18 H88 M36 94 H88', 'rgba(255,253,248,.85)', 2)
    + '<circle class="pc" cx="62" cy="54" r="25" fill="'+c[0]+'"/>'
    + '<text x="62" y="64" text-anchor="middle" font-size="28">'+emoji+'</text>';
  return feltSVG('0 0 120 122', s, 'book-svg');
}

/* ---------------- take over the storybook entry points ---------------- */
openStorybook = function(){ StoryRoad.open(); };
finishStory = function(st){ StoryRoad.finished(st); };
/* story pages get the new picture */
(function(){
  const base = renderStoryPage;
  renderStoryPage = function(){
    base();
    try{ $('btn-story-hear').textContent='🔊 Hear the page'; }catch(e){}
    try{
      const st=storyState.story, sent=Reading.storyPages(st)[storyState.page];
      $('story-art').innerHTML = StoryRoad.sceneHTML(sent, st);
      $('story-prev').onclick=()=>{
        if(storyState.page>0){ storyState.page--; AudioSys.sfx('page'); renderStoryPage(); }
        else StoryRoad.open();
      };
    }catch(e){}
  };
})();

if(typeof module!=='undefined' && module.exports){ module.exports = {StoryRoad}; }
(function(){
  try{
    document.querySelectorAll('.road-hear').forEach(function(b){
      b.onclick=function(){
        const n=StoryRoad.nextStory();
        Sound.say(n ? 'Tap the glowing book to read it! You can do it!' : 'Learn more sounds to wake up more books!');
      };
    });
  }catch(e){}
})();
