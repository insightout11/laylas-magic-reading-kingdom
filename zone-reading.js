/* ============================================================
   READING ZONES — Kitten Cottage + Storybook Tower + milestones.
   Loaded after app.js; adds to Games and replaces the older storybook.

   This is the spine of the product: phonemes -> blending -> words ->
   sentences -> stories. Every screen here asks the Reading engine what
   Layla can read and shows only that.
   ============================================================ */
'use strict';

/* ---------------- shared felt props ---------------------------------- */
function cottageDoorFelt(open){
  return feltSVG('0 0 240 260',
      '<ellipse cx="120" cy="246" rx="92" ry="12" fill="'+FELT.shadow+'"/>'
    + '<rect class="pc" x="26" y="70" width="188" height="176" rx="14" fill="'+FELT.cream+'"/>'
    + '<path class="pc" d="M12 74 L120 6 L228 74 z" fill="'+FELT.peach+'"/>'
    + '<rect class="pc" x="70" y="120" width="100" height="126" rx="12" fill="'+FELT.tanD+'"/>'
    + '<g class="door-leaf">'
      + '<rect class="pc" x="74" y="124" width="92" height="122" rx="10" fill="'+FELT.tan+'"/>'
      + '<circle cx="152" cy="188" r="7" fill="'+FELT.butter+'"/>'
      + feltStitch('M86 150 h68 M86 214 h68','rgba(255,255,255,.65)',2.4)
    + '</g>'
    + feltFlower(46,214,15, FELT.pink) + feltFlower(196,216,14, FELT.butter),
    'door-felt', 'data-open="'+(open?'1':'0')+'"');
}
/* Big readable word tiles. Sounds and spellings stay aligned. */
function wordTiles(w, cls){
  let h='<span class="wt-row '+(cls||'')+'">';
  (w.gr||[]).forEach(function(g,i){
    h+='<span class="wt" data-i="'+i+'">'+g+'</span>';
  });
  return h+'</span>';
}

/* ============================================================
   KITTEN COTTAGE — blending and word reading
   ============================================================ */

/* Pick a word for a blending task, preferring ones with real recorded
   whole-word audio so the payoff after the blend is a human voice. */
function pickBlendWord(params){
  params=params||{};
  if(params.word){
    const w=Reading.byText(params.word);
    if(w && Reading.wordReadable(w)) return w;
  }
  const withAudio = Reading.readableWords({audioOnly:true});
  const pool = withAudio.length ? withAudio : Reading.readableWords();
  if(!pool.length) return null;
  /* Favour words that use the sound she is weakest on. */
  const weak = (typeof weakestPhoneme==='function') ? weakestPhoneme() : null;
  const targeted = weak ? pool.filter(function(w){ return w.ph.indexOf(weak)>=0; }) : [];
  const from = (targeted.length && Math.random()<0.6) ? targeted : pool;
  return from[Math.floor(Math.random()*from.length)];
}

/* --- Game 1: Kitten Word Rescue -------------------------------------
   A kitten is shut behind the cottage door. Sound out the word and the
   door opens. Blending is the whole point, so the picture choice comes
   AFTER the blend, never before. */
Games.rescue = function(params){
  params=params||{};
  const area=$('game-area'); area.innerHTML='';
  const w = pickBlendWord(params);
  if(!w) return needGrownup(area);
  Act.describe({type:'blend', targetWord:w.t, targetLabel:w.t,
                targetPhonemes:w.ph, masteryKey:'blend:'+w.t});
  area.dataset.scene='cottage';
  say('sound-it-out', "Let's sound it out!");
  twinkleSay('A kitten is stuck! Sound out the word to open the door. 🐱', {silent:true});

  const scene=document.createElement('div'); scene.className='cottage-scene';
  scene.innerHTML = cottageDoorFelt(false)
    + '<div class="cottage-kitten">'+(typeof petSwatch==='function'?petSwatch('pet-white'):'')+'</div>';
  area.appendChild(scene);

  const stage=document.createElement('div'); stage.className='blend-stage';
  stage.innerHTML = wordTiles(w);
  area.appendChild(stage);
  const tiles = Array.prototype.slice.call(stage.querySelectorAll('.wt'));

  const btnRow=document.createElement('div'); btnRow.className='center';
  btnRow.innerHTML='<button class="big-magic-btn">🔊 Sound it out!</button>';
  area.appendChild(btnRow);
  const answerBox=document.createElement('div'); answerBox.className='center';
  area.appendChild(answerBox);

  let blended=false;
  btnRow.querySelector('button').onclick=()=>{
    if(blended) return;
    AudioSys.ensure();
    AudioSys.playVoice('blend-together', "Now let's blend them together!");
    after(1400, ()=>{
      AudioSys.playWordSlow(w, {
        onPhoneme:(i)=>{
          const el=tiles[i];
          if(el){ el.classList.add('lit'); setTimeout(()=>el.classList.remove('lit'), 520); }
        },
        onBlended:()=>{ stage.classList.add('together'); },
        onDone:()=>{ if(!blended){ blended=true; showChoices(); } }
      });
    });
  };

  function showChoices(){
    btnRow.querySelector('button').textContent='🔊 Hear it again';
    btnRow.querySelector('button').onclick=()=>AudioSys.playWordSlow(w,{});
    setInstruction('Which picture is '+w.t+'?', 'Which picture is '+w.t+'?');
    const others = shuffle(Reading.readableWords().filter(x=>x.t!==w.t)).slice(0,2);
    const ch=document.createElement('div'); ch.className='choices';
    let done=false;
    shuffle([w].concat(others)).forEach(o=>{
      const b=document.createElement('button'); b.className='choice-card pic-card';
      b.innerHTML='<span class="pic-emoji">'+wordArt(o)+'</span>';
      if(o.t===w.t) b.dataset.correct='1';
      b.onclick=()=>{
        if(done) return;
        if(o.t!==w.t){ attemptsThisItem++; gentleNo(b); return; }
        done=true;
        Array.prototype.forEach.call(ch.querySelectorAll('button'), x=>x.disabled=true);
        openDoorAndCelebrate();
      };
      ch.appendChild(b);
    });
    answerBox.innerHTML=''; answerBox.appendChild(ch);
  }

  function openDoorAndCelebrate(){
    scene.classList.add('door-open');
    AudioSys.sfx('meow'); after(400, ()=>AudioSys.sfx('fanfare'));
    if(typeof stickerBurst==='function') after(500, ()=>stickerBurst(scene, 16));
    AudioSys.playVoice('kitten-free', 'You put the sounds together: '+w.t+'!');
    record('blend:'+w.t, firstTryFlag && attemptsThisItem===0);
    noteWordRead(w.t);
    addStars(4); save();
    after(2800, activityDone);
  }
};

/* --- Game 2: Build the Word ------------------------------------------
   Picture first, then build it from tiles. Each tile carries the SOUND
   and the spelling used in THIS word, so 'cat' offers a c for /k/. */
Games.buildWord = function(params){
  params=params||{};
  const area=$('game-area'); area.innerHTML='';
  const w = pickBlendWord(params);
  if(!w) return needGrownup(area);
  const act = Act.describe({
    type:'word', targetWord:w.t, targetLabel:w.t,
    targetPhonemes:w.ph, prompt:'Build the word', masteryKey:'spell:'+w.t
  });
  area.dataset.scene='cottage';
  setInstruction('Build the word.', 'Build the word!');
  twinkleSay('Put the sounds in order! 🧱', {silent:true});

  const pic=document.createElement('div'); pic.className='center word-pic';
  pic.innerHTML=wordArt(w);
  area.appendChild(pic);
  const say2=document.createElement('div'); say2.className='center';
  say2.innerHTML='<button class="magic-btn">🔊 Hear the word</button>';
  say2.querySelector('button').onclick=()=>AudioSys.playWord(w.t);
  area.appendChild(say2);
  after(900, ()=>AudioSys.playWord(w.t));

  const slots=document.createElement('div'); slots.className='slot-row';
  const slotEls=[];
  w.ph.forEach((p,i)=>{
    const s=document.createElement('div'); s.className='slot'+(i===0?' next':'');
    s.dataset.want=p; s.dataset.gr=(w.gr&&w.gr[i])||G(p);
    slots.appendChild(s); slotEls.push(s);
  });
  area.appendChild(slots);

  const own = w.ph.map((p,i)=>({ph:p, gr:(w.gr&&w.gr[i])||G(p)}));
  const extra = shuffle(Reading.readableWords()
      .reduce((acc,x)=>{ x.ph.forEach((p,i)=>{ if(w.ph.indexOf(p)<0) acc.push({ph:p, gr:x.gr[i]}); }); return acc; }, [])
      .filter((v,i,arr)=>arr.findIndex(z=>z.ph===v.ph)===i))
    .slice(0,2);
  const tiles=document.createElement('div'); tiles.className='tile-row';
  let next=0, finished=false;
  shuffle(own.concat(extra)).forEach(ch=>{
    const b=document.createElement('button'); b.className='tile'; b.textContent=ch.gr;
    b.onclick=()=>{
      if(finished || next>=slotEls.length) return;
      const slot=slotEls[next];
      if(ch.ph===slot.dataset.want && ch.gr===slot.dataset.gr){
        slot.textContent=ch.gr; slot.classList.add('filled'); slot.classList.remove('next');
        b.classList.add('used'); AudioSys.playPhoneme(ch.ph);
        next++; if(slotEls[next]) slotEls[next].classList.add('next');
        if(next>=slotEls.length){
          finished=true;
          Array.prototype.forEach.call(tiles.querySelectorAll('.tile'), x=>x.disabled=true);
          noteWordRead(w.t);
          addStars(4); save();
          /* Blend what she built, THEN praise it by name. Praise reads from
             `act`, so it can only ever say this word. */
          Act.finish(act, { animation: ()=>Sound.blend(w, {}), praise: Praise.word });
        }
      } else {
        attemptsThisItem++;
        gentleNo(b, 'We need '+String(slot.dataset.gr).toUpperCase()+'. Listen!');
        AudioSys.playPhoneme(slot.dataset.want);
      }
    };
    tiles.appendChild(b);
  });
  area.appendChild(tiles);
};

/* --- Game 3: Which Word? ---------------------------------------------
   Hear the word, then pick it from three that look alike. Forces her to
   read the difference rather than guess from a picture. */
Games.whichWord = function(params){
  params=params||{};
  const area=$('game-area'); area.innerHTML='';
  const pool = Reading.readableWords();
  if(pool.length < 3) return needGrownup(area);
  const target = pickBlendWord(params) || pool[0];
  /* prefer near-misses: same length, sharing sounds */
  const similar = pool.filter(x=>x.t!==target.t && x.ph.length===target.ph.length)
                      .sort((a,b)=>{
                        const shared=z=>z.ph.filter(p=>target.ph.indexOf(p)>=0).length;
                        return shared(b)-shared(a);
                      });
  const others = (similar.length>=2 ? similar : pool.filter(x=>x.t!==target.t)).slice(0,2);
  Act.describe({type:'read', targetWord:target.t, targetLabel:target.t,
                targetPhonemes:target.ph, masteryKey:'read:'+target.t});
  area.dataset.scene='cottage';
  setInstruction('Which word says it?', 'Listen, then find the word.');
  twinkleSay('Listen carefully, then find the word! 🐱', {silent:true});

  const hear=document.createElement('div'); hear.className='center';
  hear.innerHTML='<button class="big-magic-btn">🔊 Hear the word</button>';
  hear.querySelector('button').onclick=()=>AudioSys.playWord(target.t);
  area.appendChild(hear);
  after(1200, ()=>AudioSys.playWord(target.t));

  const row=document.createElement('div'); row.className='choices';
  let done=false;
  shuffle([target].concat(others)).forEach(o=>{
    const b=document.createElement('button'); b.className='word-card';
    b.innerHTML=wordTiles(o);
    if(o.t===target.t) b.dataset.correct='1';
    b.onclick=()=>{
      if(done) return;
      if(o.t!==target.t){ attemptsThisItem++; gentleNo(b); AudioSys.playWordSlow(o,{}); return; }
      done=true;
      Array.prototype.forEach.call(row.querySelectorAll('.word-card'), x=>x.disabled=true);
      b.classList.add('correct');
      celebrateRight('read:'+target.t, 'Yes! That word is '+target.t+'!');
      noteWordRead(target.t);
      addStars(3); save();
      after(2400, activityDone);
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};

/* --- Game 4: Match Word to Picture ------------------------------------
   The WORD is shown first and the pictures are the answers, so she has to
   decode before she can choose. The reverse would reward picture-guessing. */
Games.matchPicture = function(params){
  params=params||{};
  const area=$('game-area'); area.innerHTML='';
  const pool = Reading.readableWords();
  if(pool.length < 3) return needGrownup(area);
  const target = pickBlendWord(params) || pool[0];
  const others = shuffle(pool.filter(x=>x.t!==target.t)).slice(0,2);
  Act.describe({type:'read', targetWord:target.t, targetLabel:target.t,
                targetPhonemes:target.ph, masteryKey:'read:'+target.t});
  area.dataset.scene='cottage';
  setInstruction('Read it, then find the picture.', 'Read the word, then find its picture.');
  twinkleSay('Read it first — no peeking at the pictures! 😺', {silent:true});

  const card=document.createElement('div'); card.className='center big-word-card';
  card.innerHTML=wordTiles(target,'big');
  area.appendChild(card);

  const help=document.createElement('div'); help.className='center';
  help.innerHTML='<button class="magic-btn secondary">🔊 Sound it out with me</button>';
  help.querySelector('button').onclick=()=>{
    const tiles=Array.prototype.slice.call(card.querySelectorAll('.wt'));
    AudioSys.playWordSlow(target, {onPhoneme:(i)=>{
      const el=tiles[i]; if(el){ el.classList.add('lit'); setTimeout(()=>el.classList.remove('lit'),520); }
    }});
  };
  area.appendChild(help);

  const row=document.createElement('div'); row.className='choices';
  let done=false;
  shuffle([target].concat(others)).forEach(o=>{
    const b=document.createElement('button'); b.className='choice-card pic-card';
    b.innerHTML='<span class="pic-emoji">'+wordArt(o)+'</span>';
    if(o.t===target.t) b.dataset.correct='1';
    b.onclick=()=>{
      if(done) return;
      if(o.t!==target.t){ attemptsThisItem++; gentleNo(b); return; }
      done=true;
      Array.prototype.forEach.call(row.querySelectorAll('button'), x=>x.disabled=true);
      celebrateRight('read:'+target.t, 'Yes! '+target.t+'!');
      noteWordRead(target.t);
      addStars(3); save();
      after(2400, activityDone);
    };
    row.appendChild(b);
  });
  area.appendChild(row);
};

/* Record a word as read, and fire the word milestones. */
function noteWordRead(word){
  if(S.wordsRead.indexOf(word) < 0){ S.wordsRead.push(word); save(); }
  checkMilestones();
}

/* ============================================================
   HEART WORDS — introduced deliberately, never slipped in
   ============================================================ */
function introduceHeartWord(h, done){
  const area=$('game-area'); area.innerHTML='';
  area.dataset.scene='castle';
  setInstruction('A heart word!', 'This is a heart word.');
  const wrap=document.createElement('div'); wrap.className='center heart-word-intro';
  wrap.innerHTML =
      '<div class="hw-heart">💗</div>'
    + '<div class="hw-word">'+h.t+'</div>'
    + '<p class="hw-note">Some words we just <b>remember</b>.<br>This one is a heart word.</p>'
    + '<button class="big-magic-btn">I will remember it! 💖</button>';
  area.appendChild(wrap);
  twinkleSay('This one is a heart word. We keep it in our heart! 💗', {silent:true});
  AudioSys.speak('This word is '+h.t+'. It is a heart word. We just remember it.');
  wrap.querySelector('button').onclick=()=>{
    if((S.heartWords||[]).indexOf(h.t) < 0){ S.heartWords.push(h.t); save(); }
    AudioSys.sfx('sparkle'); sparkles(14);
    if(typeof done==='function') done(); else activityDone();
  };
}
Games.heartWord = function(){
  const h = Reading.nextHeartWord();
  if(!h) return activityDone();
  introduceHeartWord(h);
};

/* ============================================================
   STORYBOOK TOWER — first sentences, then first stories
   Read-it-yourself first. The app never reads the sentence aloud
   unprompted; help is always something Layla chooses to tap.
   ============================================================ */
let storyState = {story:null, page:0};

function openStorybook(){
  showScreen('story');
  AudioSys.setScene('castle');
  const stories = Reading.readableStories();
  const sentences = Reading.readableSentences();

  if(!stories.length && !sentences.length){
    renderStoryLocked();
    return;
  }
  if(stories.length) renderStoryPicker(stories);
  else renderSentencePractice(sentences);
}

function renderStoryLocked(){
  const t=$('story-page-title'), s=$('story-sentence'), a=$('story-art');
  t.textContent='Almost ready!';
  s.innerHTML='<div class="story-locked">Learn a few more sounds and the stories will wake up. 💤</div>';
  a.textContent='📚';
  $('btn-story-hear').classList.add('hidden');
  $('btn-story-read').classList.add('hidden');
  twinkleSay('A few more sounds and we can read a story! 📚', {silent:true});
}

/* Shelf of stories she can actually read, plus loose sentences to practise. */
function renderStoryPicker(stories){
  const t=$('story-page-title'), s=$('story-sentence'), a=$('story-art');
  t.textContent='Choose a story';
  a.textContent='📚';
  $('btn-story-hear').classList.add('hidden');
  $('btn-story-read').classList.add('hidden');
  s.innerHTML='';
  const shelf=document.createElement('div'); shelf.className='story-shelf';
  stories.forEach(st=>{
    const done=(S.storiesRead||[]).indexOf(st.id)>=0;
    const b=document.createElement('button'); b.className='story-card'+(done?' read':'');
    b.innerHTML='<span class="sc-art">'+st.art+'</span><span class="sc-title">'+st.title+'</span>'
      + '<span class="sc-pages">'+st.pages.length+' pages</span>'
      + (done?'<span class="sc-done">⭐ read</span>':'');
    b.onclick=()=>{ AudioSys.sfx('page'); openStory(st); };
    shelf.appendChild(b);
  });
  const practice=document.createElement('button');
  practice.className='story-card practice';
  practice.innerHTML='<span class="sc-art">✨</span><span class="sc-title">Practice sentences</span>';
  practice.onclick=()=>{ AudioSys.sfx('page'); renderSentencePractice(Reading.readableSentences()); };
  shelf.appendChild(practice);
  s.appendChild(shelf);
  twinkleSay('Which story shall we read? 📖', {silent:true});
  AudioSys.playVoice('story-help', 'Read it yourself! Tap a word if you need help.');
}

function openStory(st){
  storyState={story:st, page:0};
  renderStoryPage();
}

/* One sentence per page. Words are tappable; the page is never read to
   her automatically. */
function renderStoryPage(){
  const st=storyState.story;
  const pages=Reading.storyPages(st);
  const sent=pages[storyState.page];
  const titleEl=$('story-page-title'), body=$('story-sentence'), art=$('story-art');
  titleEl.textContent=st.title+' — page '+(storyState.page+1)+' of '+pages.length;
  art.textContent=sent.art||st.art;
  $('btn-story-hear').classList.remove('hidden');
  $('btn-story-read').classList.remove('hidden');
  $('btn-story-read').textContent='🌟 I read it!';
  renderSentenceInto(body, sent);

  $('btn-story-hear').onclick=()=>{ speakSentence(sent); };
  $('btn-story-read').onclick=()=>{
    noteSentenceRead(sent, ()=>{
      if(storyState.page < pages.length-1){
        storyState.page++;
        AudioSys.sfx('page');
        renderStoryPage();
      } else {
        finishStory(st);
      }
    });
  };
  $('story-prev').onclick=()=>{
    if(storyState.page>0){ storyState.page--; AudioSys.sfx('page'); renderStoryPage(); }
    else openStorybook();
  };
  $('story-next').onclick=()=>{
    if(storyState.page < pages.length-1){ storyState.page++; AudioSys.sfx('page'); renderStoryPage(); }
  };
  currentInstruction='Read it yourself. Tap a word if you need help.';
}

/* Loose-sentence practice for before the first story is reachable. */
function renderSentencePractice(sentences){
  if(!sentences.length){ renderStoryLocked(); return; }
  let idx=0;
  const titleEl=$('story-page-title'), body=$('story-sentence'), art=$('story-art');
  function draw(){
    const sent=sentences[idx%sentences.length];
    titleEl.textContent='Read it yourself';
    art.textContent=sent.art||'✨';
    $('btn-story-hear').classList.remove('hidden');
    $('btn-story-read').classList.remove('hidden');
    renderSentenceInto(body, sent);
    $('btn-story-hear').onclick=()=>speakSentence(sent);
    $('btn-story-read').onclick=()=>noteSentenceRead(sent, ()=>{ idx++; AudioSys.sfx('page'); draw(); });
    $('story-prev').onclick=()=>{ idx=(idx+sentences.length-1)%sentences.length; AudioSys.sfx('page'); draw(); };
    $('story-next').onclick=()=>{ idx=(idx+1)%sentences.length; AudioSys.sfx('page'); draw(); };
  }
  draw();
  twinkleSay('Read it yourself! Tap a word if you get stuck. 💖', {silent:true});
}

/* Tap a word: hear it, see it broken into its sounds, and it lights up.
   Heart words say so instead of pretending to be decodable. */
function renderSentenceInto(container, sent){
  container.innerHTML='';
  const words=Reading.sentenceWords(sent);
  words.forEach((w,i)=>{
    const span=document.createElement('span');
    span.className='w'+(w.heart?' heart':'');
    span.textContent = (i===0 ? w.t.charAt(0).toUpperCase()+w.t.slice(1) : w.t)
                     + (i===words.length-1 ? '.' : '');
    span.onclick=(e)=>{
      e.stopPropagation();
      container.querySelectorAll('.w').forEach(x=>x.classList.remove('lit'));
      span.classList.add('lit');
      if(w.heart){
        AudioSys.speak(w.t, {rate:0.75});
        toast('💗 heart word — we just remember it');
      } else {
        AudioSys.playWordSlow(w, {
          onPhoneme:()=>{},
          onBlended:()=>{}
        });
      }
      setTimeout(()=>span.classList.remove('lit'), 2600);
    };
    container.appendChild(span);
    container.appendChild(document.createTextNode(' '));
  });
}
/* Only ever on an explicit tap of "Hear the page". */
function speakSentence(sent){
  const words=Reading.sentenceWords(sent);
  Speech.request(2, 'sentence', 'word', (cancelled, done, track)=>{
    (async ()=>{
      for(let i=0;i<words.length;i++){
        if(cancelled()){ done('cancelled'); return; }
        const w=words[i];
        const custom = w.audio ? await AudioSys.wordRecording(w.t) : null;
        const ok = (custom || w.audio) ? await Speech.playFile(custom||WORD_DIR+w.t+'.mp3', null, track) : false;
        if(!ok) await new Promise(r=>{ AudioSys.speak(w.t,{rate:0.85}); setTimeout(r, 620); });
        await new Promise(r=>setTimeout(r, 90));
      }
      done('done');
    })();
  });
}

function noteSentenceRead(sent, next){
  const first = !(S.sentencesRead||[]).length;
  if((S.sentencesRead||[]).indexOf(sent.id) < 0){ S.sentencesRead.push(sent.id); save(); }
  confettiBlast(); AudioSys.sfx('fanfare'); addStars(5); save();
  if(first){
    /* THE moment. Reserved for genuinely reading a sentence. */
    S.sentenceCelebrated=true; save();
    showMilestone('LAYLA READ A SENTENCE!', Reading.sentenceText(sent),
      'You read a whole sentence all by yourself! This is REAL reading! 🌟',
      {clip:'sentence-win'});
    grantMilestoneReward('crown-gold', 'first-sentence');
    unlockCastleFeature('crown-shelf');
    if(typeof next==='function') after(3200, next);
  } else {
    AudioSys.playVoice('you-did-it', 'You read it! Amazing reading!');
    toast('Amazing reading! 🌟');
    checkMilestones();
    if(typeof next==='function') after(1200, next);
  }
}

function finishStory(st){
  const first = !(S.storiesRead||[]).length;
  if((S.storiesRead||[]).indexOf(st.id) < 0){ S.storiesRead.push(st.id); save(); }
  addStars(10); save();
  if(first){
    /* The biggest moment in the app. */
    showMilestone('LAYLA READ A STORY!', st.title,
      'You read a WHOLE story by yourself. You are a reader! 📖✨',
      {clip:'sentence-win'});
    grantMilestoneReward(st.reward || 'pet-unicorn', 'first-story');
    unlockCastleFeature('pet-room');
  } else {
    showMilestone('Another story read!', st.title, 'You read the whole thing! 📖', {});
    if(st.reward) grantMilestoneReward(st.reward, 'story:'+st.id);
  }
  checkMilestones();
  after(3600, ()=>openStorybook());
}

/* ============================================================
   MILESTONES — one celebration each, recorded permanently
   ============================================================ */
const MILESTONES = [
  {id:'name',        title:'You spelled your name!',   test:()=>((S.mastery['name:build']||{}).p||0)>0,
   word:'LAYLA', text:'L-A-Y-L-A spells Layla. That is YOUR name!', reward:'crown-flower'},
  {id:'sound1',      title:'You learned a sound!',     test:()=>strongSounds().length>=1,
   word:()=>GU(strongSounds()[0]||'s'), text:'You know a magic sound now!', reward:null},
  {id:'sound3',      title:'Three magic sounds!',      test:()=>strongSounds().length>=3,
   word:'3', text:'Three sounds means you can start making words!', reward:'shoes-ballet'},
  {id:'sound6',      title:'Six magic sounds!',        test:()=>strongSounds().length>=6,
   word:'6', text:'Six sounds! You can read lots of words now.', reward:'wall-star'},
  {id:'word1',       title:'You read a word!',         test:()=>S.wordsRead.length>=1,
   word:()=>S.wordsRead[0]||'sat', text:'You put the sounds together all by yourself!', reward:'dress-pink', clip:'you-read-a-word'},
  {id:'word5',       title:'Five words read!',         test:()=>S.wordsRead.length>=5,
   word:'5', text:'Five whole words! You are really reading.', reward:'neck-star'},
  {id:'word10',      title:'Ten words read!',          test:()=>S.wordsRead.length>=10,
   word:'10', text:'TEN words! Your castle is growing.', reward:'wall-pink'},
  {id:'sentence1',   title:'LAYLA READ A SENTENCE!',   test:()=>(S.sentencesRead||[]).length>=1,
   word:'📖', text:'A whole sentence! This is real reading.', reward:'crown-gold', clip:'sentence-win'},
  {id:'sentence5',   title:'Five sentences!',          test:()=>(S.sentencesRead||[]).length>=5,
   word:'5', text:'Five sentences read all by yourself!', reward:'wings-fairy'},
  {id:'story1',      title:'LAYLA READ A STORY!',      test:()=>(S.storiesRead||[]).length>=1,
   word:'📚', text:'You read a whole story. You are a reader!', reward:'pet-unicorn', clip:'sentence-win'}
];

/* Sounds she is genuinely solid on, not merely introduced. */
function strongSounds(){
  return (S.unlocked||[]).filter(id => (S.mastery['sound:'+id]||{score:0}).score > 0.6);
}

function grantMilestoneReward(rewardId, tag){
  if(!rewardId) return;
  if(S.rewards.indexOf(rewardId) < 0){
    /* Route through the chest so the reveal sequence stays the payoff. */
    const r = REWARDS.filter(x=>x.id===rewardId)[0];
    if(r){ after(2600, ()=>{ grantReward(r.id); showReward(r); }); }
  }
}

/* Castle features unlocked by reading, so progress is visible in the world. */
const CASTLE_FEATURES = {
  'vanity':      {need:()=>S.wordsRead.length>=1,               label:'Vanity table'},
  'crown-shelf': {need:()=>(S.sentencesRead||[]).length>=1,     label:'Crown shelf'},
  'pet-room':    {need:()=>(S.storiesRead||[]).length>=1,       label:'Pet cushion'},
  'wallpaper':   {need:()=>S.wordsRead.length>=10,              label:'New wallpaper'},
  'window':      {need:()=>(S.streak||0)>=5,                    label:'Rainbow window'}
};
function unlockCastleFeature(id){
  if(!S.castleUnlocks) S.castleUnlocks=[];
  if(S.castleUnlocks.indexOf(id) < 0){ S.castleUnlocks.push(id); save(); }
}
function refreshCastleUnlocks(){
  Object.keys(CASTLE_FEATURES).forEach(id=>{
    try{ if(CASTLE_FEATURES[id].need()) unlockCastleFeature(id); }catch(e){}
  });
}

/* Milestones are DETECTED here and QUEUED — never shown here.
   Showing one inline is what made building "at" announce "You spelled your
   name!": the celebration ran inside a different activity and took its text
   from global state. Now the text is captured at detection time and the
   modal is only shown between activities, by flushMilestone(). */
function checkMilestones(){
  if(!S.milestones) S.milestones=[];
  refreshCastleUnlocks();

  const dec = decodableWords();
  if(!S.blendingUnlocked && strongSounds().length>=3 && dec.length>=2){ S.blendingUnlocked=true; save(); }
  if(!S.sentenceUnlocked && Reading.readableSentences().length>=1){
    S.sentenceUnlocked=true; save();
    const n=$('story-lock-note'); if(n) n.textContent='Open! 🎉';
  }

  for(let i=0;i<MILESTONES.length;i++){
    const m=MILESTONES[i];
    if(S.milestones.indexOf(m.id) >= 0) continue;
    let hit=false;
    try{ hit=!!m.test(); }catch(e){ hit=false; }
    if(!hit) continue;
    S.milestones.push(m.id);
    S.lastMilestone={id:m.id, title:m.title, at:Date.now()};
    save();
    /* The two headline moments announce themselves from the storybook flow. */
    if(m.id==='sentence1' || m.id==='story1') return;
    /* Freeze the text NOW, while the context that earned it is still true. */
    let word;
    try{ word = (typeof m.word==='function') ? m.word() : m.word; }catch(e){ word=''; }
    Flow.queueMilestone({id:m.id, title:m.title, word:word, text:m.text, clip:m.clip, reward:m.reward});
    return;   // one at a time
  }
}

/* Show one queued milestone, then continue. Called between activities only. */
function flushMilestone(next){
  const m = Flow.nextMilestone();
  if(!m){ if(next) next(); return; }
  Bus.emit('MILESTONE_SHOW', {id:m.id, title:m.title, word:m.word});
  Flow.rewardPending = true;
  showMilestone(m.title, m.word, m.text, m.clip?{clip:m.clip}:{});
  const done = ()=>{
    Flow.rewardPending = false;
    if(m.reward) grantMilestoneReward(m.reward, m.id);
    if(next) Scene.later(200, next, 'afterMilestone');
  };
  /* Advance when SHE dismisses it, or after a generous fallback. */
  const btn=$('btn-milestone-ok');
  if(btn){
    const prev=btn.onclick;
    btn.onclick=()=>{ btn.onclick=prev; if(prev) try{ prev(); }catch(e){} done(); };
  }
  Scene.later(12000, ()=>{ if(Flow.rewardPending) done(); }, 'milestoneFallback');
}

/* Word-level celebration is handled by the milestone table now. */
function maybeWordMilestone(word){ checkMilestones(); }

/* ============================================================
   KITTEN COTTAGE session
   ============================================================ */
function cottageSession(){
  const acts=[];
  const h = Reading.nextHeartWord();
  const dec = Reading.readableWords();

  if(dec.length < 1){
    /* Not enough sounds yet: send her to sound work instead of a dead end. */
    return runSession('Kitten Cottage',[
      {title:'Sound Crystals', run:()=>Games.crystals({focus:S.currentFocus})},
      {title:'Magic Bubbles',  run:()=>Games.bubbles({focus:S.currentFocus, mode:'sound'})}
    ], null);
  }
  acts.push({title:'Help the Kitten', run:()=>Games.rescue()});
  if(dec.length>=3) acts.push({title:'Which Word?', run:()=>Games.whichWord()});
  acts.push({title:'Build the Word', run:()=>Games.buildWord()});
  if(dec.length>=3) acts.push({title:'Find the Picture', run:()=>Games.matchPicture()});
  /* Teach a heart word only when it actually unlocks sentences. */
  if(h && S.wordsRead.length>=2) acts.push({title:'A Heart Word', run:()=>Games.heartWord()});
  runSession('Kitten Cottage', acts, null);
}
