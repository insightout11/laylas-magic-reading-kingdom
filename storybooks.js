/* ============================================================
   STORYBOOKS — the Story Road library.
   Loaded right after content.js, before app.js.

   Adds words, heart words and 30 storybooks to the banks in content.js.
   The rules there still hold, and Reading enforces them:
   - every decodable word lists its sounds (ph) and letters (gr) 1:1;
   - a page is only readable when every word on it is;
   - a book that needs a sound the family has rejected or never recorded
     (th, the "u" in cup) is simply not on the road.

   Books are written as plain text so they are easy to read and extend:
     ['Kit can nap on a mat', '😴🧶']   -> sentence + picture stickers
   A trailing ! or ? is kept as the sentence's end mark.
   ============================================================ */
'use strict';

/* ---------------- more decodable words -------------------------------
   word | sounds | letters | picture.  Sounds are phoneme ids from
   phonics.js; letters are what she sees, aligned one-to-one. */
const MORE_WORDS = `
and|a_short n d|a n d|➕
an|a_short n|a n|1️⃣
did|d i_short d|d i d|✅
kid|k i_short d|k i d|🧒
dip|d i_short p|d i p|🥣
pad|p a_short d|p a d|📒
nod|n o_short d|n o d|🙂
mom|m o_short m|m o m|👩
Kit|k i_short t|K i t|🐱|proper
Meg|m e_short g|M e g|👧|proper
Max|m a_short x|M a x|🐕|proper
naps|n a_short p s|n a p s|😴
gets|g e_short t s|g e t s|🙌
sits|s i_short t s|s i t s|🪑
glad|g l a_short d|g l a d|😊
eggs|e_short g z|e gg s|🥚
nest|n e_short s t|n e s t|🪺
has|h a_short z|h a s|🤲
lost|l o_short s t|l o s t|❓
doll|d o_short l|d o ll|🪆
frog|f r o_short g|f r o g|🐸
pond|p o_short n d|p o n d|🏞️
fell|f e_short l|f e ll|💫
gift|g i_short f t|g i f t|🎁
pink|p i_short ng k|p i n k|🩷
tent|t e_short n t|t e n t|⛺
best|b e_short s t|b e s t|🏅
soft|s o_short f t|s o f t|☁️
help|h e_short l p|h e l p|🆘
hand|h a_short n d|h a n d|✋
sand|s a_short n d|s a n d|🏖️
milk|m i_short l k|m i l k|🥛
lamp|l a_short m p|l a m p|🪔
flag|f l a_short g|f l a g|🚩
flip|f l i_short p|f l i p|🤸
clap|k l a_short p|c l a p|👏
spin|s p i_short n|s p i n|🌀
spot|s p o_short t|s p o t|🔴
stop|s t o_short p|s t o p|🛑
step|s t e_short p|s t e p|👣
trip|t r i_short p|t r i p|🧳
drop|d r o_short p|d r o p|💧
crab|k r a_short b|c r a b|🦀
grin|g r i_short n|g r i n|😁
fox|f o_short x|f o x|🦊
box|b o_short x|b o x|📦
six|s i_short x|s i x|6️⃣
mix|m i_short x|m i x|🥣
mess|m e_short s|m e ss|🤪
vet|v e_short t|v e t|🩺
sick|s i_short k|s i ck|🤒
pill|p i_short l|p i ll|💊
jog|j o_short g|j o g|🏃
yes|y e_short s|y e s|✅
zig|z i_short g|z i g|⚡
zag|z a_short g|z a g|⚡
wet|w e_short t|w e t|💦
web|w e_short b|w e b|🕸️
quilt|qu i_short l t|qu i l t|🛏️
wish|w i_short sh|w i sh|🌠
shell|sh e_short l|sh e ll|🐚
fast|f a_short s t|f a s t|💨
back|b a_short k|b a ck|🔙
chop|ch o_short p|ch o p|🪓
chin|ch i_short n|ch i n|🙂
long|l o_short ng|l o ng|📏
snail|s n ai l|s n ai l|🐌
trail|t r ai l|t r ai l|🥾
slow|s l oa|s l ow|🐢
play|p l ai|p l ay|🎈
wait|w ai t|w ai t|⏳
paint|p ai n t|p ai n t|🎨
queen|qu ee n|qu ee n|👸
bee|b ee|b ee|🐝
tree|t r ee|t r ee|🌳
see|s ee|s ee|👀
green|g r ee n|g r ee n|💚
leaf|l ee f|l ea f|🍃
dream|d r ee m|d r ea m|💭
sleep|s l ee p|s l ee p|😴
sheep|sh ee p|sh ee p|🐑
bright|b r igh t|b r igh t|✨
sky|s k igh|s k y|🌌
fly|f l igh|f l y|🦋
tight|t igh t|t igh t|🤗
high|h igh|h igh|⬆️
goat|g oa t|g oa t|🐐
road|r oa d|r oa d|🛣️
toad|t oa d|t oa d|🐸
float|f l oa t|f l oa t|🛟
zoom|z oo_long m|z oo m|🚀
cool|k oo_long l|c oo l|😎
pool|p oo_long l|p oo l|🏊
moo|m oo_long|m oo|🐮
zoo|z oo_long|z oo|🦁
food|f oo_long d|f oo d|🍎
good|g oo_short d|g oo d|👍
cook|k oo_short k|c oo k|👩‍🍳
his|h i_short z|h i s|👦
jam|j a_short m|j a m|🍓
lick|l i_short k|l i ck|👅
kids|k i_short d z|k i d s|🧒
zip|z i_short p|z i p|🤐
yell|y e_short l|y e ll|📣
wood|w oo_short d|w oo d|🪵
dark|d ar k|d ar k|🌑
park|p ar k|p ar k|🛝
far|f ar|f ar|🔭
spark|s p ar k|s p ar k|✨
barn|b ar n|b ar n|🛖
farm|f ar m|f ar m|🚜
for|f or|f or|🎁
corn|k or n|c or n|🌽
storm|s t or m|s t or m|⛈️
fork|f or k|f or k|🍴
girl|g er l|g ir l|👧
turn|t er n|t ur n|🔄
fern|f er n|f er n|🌿
brown|b r ow n|b r ow n|🤎
now|n ow|n ow|⏰
wow|w ow|w ow|😮
down|d ow n|d ow n|⬇️
town|t ow n|t ow n|🏘️
crown|k r ow n|c r ow n|👑
owl|ow l|ow l|🦉
toy|t oi|t oy|🧸
boy|b oi|b oy|👦
joy|j oi|j oy|😊
oil|oi l|oi l|🫒
join|j oi n|j oi n|🤝
ear|ear|ear|👂
hear|h ear|h ear|👂
dear|d ear|d ear|💌
ears|ear z|ear s|👂
chair|ch air|ch air|🪑
fair|f air|f air|🎡
pair|p air|p air|🍐
`;

/* ---------------- more heart words -----------------------------------
   High-frequency words she cannot sound out with her set yet. A story
   that uses one teaches it on the spot, before page one. */
const MORE_HEART_WORDS = [
  {t:'he',   ph:['h','ee'],                  gr:['h','e'],       tricky:[1], note:'The e says its name, "ee".'},
  {t:'we',   ph:['w','ee'],                  gr:['w','e'],       tricky:[1], note:'The e says its name, "ee".'},
  {t:'me',   ph:['m','ee'],                  gr:['m','e'],       tricky:[1], note:'The e says its name, "ee".'},
  {t:'be',   ph:['b','ee'],                  gr:['b','e'],       tricky:[1], note:'The e says its name, "ee".'},
  {t:'she',  ph:['sh','ee'],                 gr:['sh','e'],      tricky:[1], note:'The e says its name, "ee".'},
  {t:'go',   ph:['g','oa'],                  gr:['g','o'],       tricky:[1], note:'The o says its name.'},
  {t:'no',   ph:['n','oa'],                  gr:['n','o'],       tricky:[1], note:'The o says its name.'},
  {t:'so',   ph:['s','oa'],                  gr:['s','o'],       tricky:[1], note:'The o says its name.'},
  {t:'do',   ph:['d','oo_long'],             gr:['d','o'],       tricky:[1], note:'The o says "oo".'},
  {t:'was',  ph:['w','o_short','z'],         gr:['w','a','s'],   tricky:[1,2], note:'The a says "o" and the s buzzes.'},
  {t:'you',  ph:['y','oo_long'],             gr:['y','ou'],      tricky:[1], note:'The ou says "oo".'},
  {t:'said', ph:['s','e_short','d'],         gr:['s','ai','d'],  tricky:[1], note:'The ai says "e" here.'},
  {t:'of',   ph:['o_short','v'],             gr:['o','f'],       tricky:[1], note:'The f says "v".'},
  {t:'are',  ph:['ar'],                      gr:['are'],         tricky:[0], note:'Just says "ar".'},
  {t:'with', ph:['w','i_short','th_voiced'], gr:['w','i','th'],  tricky:[2], note:'Tongue out for th!'},
  {t:'this', ph:['th_voiced','i_short','s'], gr:['th','i','s'],  tricky:[0], note:'Tongue out for th!'}
];

/* ---------------- the books ------------------------------------------
   Six lands along the Story Road. A book's land is decided by the
   newest sound it needs, so the road always matches what she has
   learned — this list only sets the order inside a land. */
const STORY_LANDS = [
  {id:'cottage', name:'Kitten Cottage',   emoji:'🐱', upto:11, colors:['#FFE9CE','#FCCFE0']},
  {id:'meadow',  name:'Unicorn Meadow',   emoji:'🦄', upto:18, colors:['#DCF3E4','#CDE9F8']},
  {id:'hills',   name:'Dragon Hills',     emoji:'🐉', upto:24, colors:['#E4F5D4','#FBE9B7']},
  {id:'bay',     name:'Mermaid Bay',      emoji:'🧜‍♀️', upto:30, colors:['#CDE9F8','#DCD3FA']},
  {id:'forest',  name:'Fairy Forest',     emoji:'🧚', upto:36, colors:['#E7DDFB','#D7F0E0']},
  {id:'castle',  name:'Starlight Castle', emoji:'🏰', upto:99, colors:['#FCE1EC','#FFF3C4']}
];

const STORY_BOOKS = [
  {id:'b01', title:'Kit the Cat', art:'🐱', pages:[
    ['my cat is Kit','🐱'], ['Kit can nap on a mat','😴🧶'], ['Kit can dig in a pot','🪴'], ['I pat Kit','👋🐱']]},
  {id:'b02', title:'The Map', art:'🗺️', pages:[
    ['Sam got a map','🗺️'], ['a dot is on the map','📍'], ['Sam and dad dig at the dot','⛏️'],
    ['Sam got a tin!','🥫✨'], ['a cat pin is in the tin','📌🐱']]},
  {id:'b03', title:'Dad and the Dog', art:'🐶', pages:[
    ['dad and a dog sit','👨🐶'], ['the dog can dig','⛏️🐶'], ['dad can mop','🧹'], ['the dog and dad nap','😴']]},
  {id:'b04', title:'Tap Tap Tap', art:'🍳', pages:[
    ['the kid can tap a pan','🧒🍳'], ['tap tap tap!','🥁'], ['mom can tap a pot','👩🍲'], ['the kid and mom nap','😴']]},

  {id:'b05', title:'The Red Hen', art:'🐔', pages:[
    ['a red hen sat on a nest','🐔🪺'], ['the hen sat and sat','🥚'], ['pop pop pop!','🐣🐣🐣'], ['the hen is glad','🐔💖']]},
  {id:'b06', title:'Meg and the Doll', art:'🪆', pages:[
    ['Meg had a doll','👧🪆'], ['the doll is lost','😢'], ['Meg ran to the bed','🛏️'],
    ['the doll is on the bed!','🪆🛏️'], ['Meg is glad','👧💖']]},
  {id:'b07', title:'Frog on a Log', art:'🐸', pages:[
    ['a frog sat on a log','🐸🪵'], ['the frog can hop','🐸'], ['hop hop hop!','💫'],
    ['the frog fell in the pond','💦'], ['the frog sat in the pond','🐸🏞️']]},
  {id:'b08', title:'The Red Hat', art:'👒', pages:[
    ['dad got a gift','👨🎁'], ['it is in a big red bag','👜'], ['it is a hat!','👒'], ['a red hat!','❤️👒'], ['I am glad','😊']]},
  {id:'b09', title:'The Pink Tent', art:'⛺', pages:[
    ['Meg and Sam had a tent','⛺'], ['the tent is pink','🩷⛺'], ['the tent is on a hill','⛰️'], ['Meg and Sam nap in the tent','😴']]},
  {id:'b10', title:'Help the Crab', art:'🦀', pages:[
    ['a crab is on the sand','🦀🏖️'], ['the crab can not get off the rock','🪨'], ['help help!','🆘'],
    ['Sam can help the crab','👦🦀'], ['the crab can spin and clap','👏']]},

  {id:'b11', title:'The Fox and the Box', art:'🦊', pages:[
    ['a fox sat in a box','🦊📦'], ['the box is big','📦'], ['the fox can hop on the box','🦊'],
    ['the fox fell off the box!','💫'], ['the fox is a mess','🤪']]},
  {id:'b12', title:'The Vet', art:'🩺', pages:[
    ['a pet dog is sick','🐶🤒'], ['the vet can help','🩺'], ['the vet gets a pill','💊'],
    ['the dog is well','🐶💖'], ['yes the dog can jog!','🏃']]},
  {id:'b13', title:'Max Got Wet', art:'🐕', pages:[
    ['Max is a big dog','🐕'], ['Max can zig and zag','⚡'], ['Max ran in the pond','💦'],
    ['Max got wet!','🐕💦'], ['yes Max is a wet dog','😂']]},
  {id:'b14', title:'The Quilt', art:'🛏️', pages:[
    ['mom has a quilt','👩🛏️'], ['the quilt is red and pink','🩷'], ['Kit naps on the quilt','🐱😴'], ['the quilt is soft','☁️']]},

  {id:'b31', title:'Jam!', art:'🍓', pages:[
    ['mom has a jam pot','👩🍓'], ['the jam is red','❤️'], ['Kit got jam on his leg','🐱'],
    ['Kit can lick it','👅'], ['mom and Kit grin','😁']]},
  {id:'b32', title:'Six in a Van', art:'🚐', pages:[
    ['six kids in a van','🚐'], ['the van is red','❤️🚐'], ['the van can zip','💨'],
    ['zig zag zip!','⚡'], ['the kids can yell yes!','📣'], ['the van gets to the pond','🏞️']]},
  {id:'b15', title:'The Fish Wish', art:'🐟', pages:[
    ['a pink fish can swim','🐟'], ['the fish has a wish','🌠'], ['I wish I had a shell','🐚'],
    ['a crab got the fish a shell','🦀🐚'], ['the fish can sing a song','🎵']]},
  {id:'b16', title:'The King and the Ring', art:'🤴', pages:[
    ['the king has a ring','🤴💍'], ['the ring is lost','😢'], ['a chick has the ring!','🐤💍'], ['the king and the chick sing','🎵']]},
  {id:'b17', title:'The Red Ship', art:'🚢', pages:[
    ['a red ship is fast','🚢💨'], ['the ship is on a trip','🗺️'], ['a fish can flip','🐟'],
    ['a crab can clap','🦀👏'], ['the ship got back','⚓']]},

  {id:'b18', title:'The Snail Trail', art:'🐌', pages:[
    ['a snail is on a trail','🐌'], ['the snail is slow','🐢'], ['rain rain!','🌧️'], ['the snail is glad in the rain','🐌🌧️']]},
  {id:'b19', title:'The Queen Bee', art:'🐝', pages:[
    ['a queen bee is in a tree','🐝🌳'], ['the bee can see a green leaf','🍃'], ['the bee has a dream','💭'], ['the queen bee can sleep','😴']]},
  {id:'b20', title:'Night Light', art:'🌙', pages:[
    ['it is night','🌃'], ['the moon is bright','🌙'], ['I can see a light in the sky','✨'], ['I sleep tight','😴']]},
  {id:'b21', title:'Goat and Toad', art:'🐐', pages:[
    ['a goat has a boat','🐐⛵'], ['a toad is on the road','🐸🛣️'], ['the toad can hop in the boat','🐸⛵'],
    ['the boat can float','🌊'], ['the goat and the toad play','🎉']]},
  {id:'b22', title:'Zoom to the Moon', art:'🚀', pages:[
    ['we zoom to the moon','🚀🌙'], ['the moon is cool','😎'], ['look at the moon pool!','👀'], ['soon we go back','🏠']]},
  {id:'b23', title:'A Good Book', art:'📖', pages:[
    ['look at my book','📖'], ['it is a good book','👍'], ['a cook is in the book','👩‍🍳'],
    ['the cook has food','🍎'], ['the food is good!','😋']]},

  {id:'b24', title:'Star Park', art:'⭐', pages:[
    ['it is dark in the park','🌑🛝'], ['a star is far','⭐'], ['I see a spark','✨'], ['the star is for me','⭐💖']]},
  {id:'b25', title:'The Brown Cow', art:'🐄', pages:[
    ['a brown cow is in a barn','🐄🛖'], ['the cow can moo','🐮'], ['the cow is on the farm','🚜'], ['wow a cow!','😮']]},
  {id:'b26', title:'The Lost Crown', art:'👑', pages:[
    ['the queen has a crown','👸👑'], ['the crown fell down','⬇️'], ['a girl got the crown','👧👑'],
    ['the queen is glad','👸💖'], ['the queen and the girl sing','🎵']]},
  {id:'b27', title:'The Toy Box', art:'🧸', pages:[
    ['a boy has a toy box','👦📦'], ['a coin is in the box','🪙'], ['a girl can join in','👧'], ['it is a joy!','😊']]},
  {id:'b28', title:'The Fair Chair', art:'🪑', pages:[
    ['her hair is long','💇‍♀️'], ['she sits on a chair','🪑'], ['the chair is at the fair','🎡'],
    ['a deer is near the chair','🦌'], ['the deer has big ears','👂']]},
  {id:'b29', title:'The Owl', art:'🦉', pages:[
    ['an owl is in a tree','🦉🌳'], ['the owl can see in the dark','🌑'], ['the owl can look down','⬇️'], ['the owl can fly','🦉✨']]},
  {id:'b30', title:'The Storm', art:'⛈️', pages:[
    ['a storm is near','⛈️'], ['rain rain!','🌧️'], ['we sit in the barn','🛖'], ['the storm is far now','🌈'], ['it is a good day','☀️']]}
];

/* ---------------- merge into the banks -------------------------------- */
(function(){
  const have = {};
  WORDS.concat(HEART_WORDS).forEach(function(w){ have[w.t]=true; });
  MORE_WORDS.trim().split('\n').forEach(function(line){
    const f = line.split('|');
    const t = f[0].trim();
    if(have[t]) return;
    const w = {t:t, ph:f[1].trim().split(/\s+/), gr:f[2].trim().split(/\s+/), emoji:(f[3]||'').trim(), art:t.toLowerCase(), audio:false};
    if(f[4] && f[4].trim()==='proper') w.proper = true;
    WORDS.push(w); have[t]=true;
  });
  MORE_HEART_WORDS.forEach(function(h){
    if(have[h.t]) return;
    HEART_WORDS.push(Object.assign({heart:true, audio:false}, h)); have[h.t]=true;
  });

  /* each page becomes a SENTENCE, each book a STORY */
  STORY_BOOKS.forEach(function(b){
    const ids=[];
    b.pages.forEach(function(pg, i){
      let text = pg[0].trim(), end = '.';
      const m = text.match(/[!?]$/);
      if(m){ end = m[0]; text = text.slice(0,-1).trim(); }
      const id = b.id+'p'+(i+1);
      SENTENCES.push({id:id, w:text.split(/\s+/), art:pg[1]||b.art, end:end, book:b.id});
      ids.push(id);
    });
    STORIES.push({id:b.id, title:b.title, art:b.art, pages:ids, road:true});
  });

  /* rhyme families for the new words (Ballet Stage, Fairy Garden) */
  const addFam = function(rime, words){
    const f = RHYME_FAMILIES.find(function(x){ return x.rime===rime; });
    if(f) words.forEach(function(w){ if(f.words.indexOf(w)<0) f.words.push(w); });
    else RHYME_FAMILIES.push({rime:rime, words:words.slice()});
  };
  addFam('og',['frog','jog']); addFam('ip',['dip','flip','trip']); addFam('op',['stop','drop','chop']);
  addFam('ox',['fox','box']); addFam('ix',['six','mix']); addFam('est',['nest','best']);
  addFam('and',['and','hand','sand']); addFam('ee',['bee','see','tree']);
  addFam('ail',['snail','trail','mail','tail']); addFam('oat',['goat','boat','coat','float']);
  addFam('ark',['dark','park','spark']); addFam('own',['down','town','crown','brown']);
  addFam('oy',['toy','boy','joy']); addFam('ool',['cool','pool']);
  addFam('ight',['light','night','bright','tight']); addFam('ing',['king','ring','sing','wing']);
  addFam('air',['hair','chair','fair','pair']); addFam('ear',['near','ear','hear','dear']);
  addFam('ell',['fell','shell']); addFam('et',['wet','vet']);
})();

if(typeof module!=='undefined' && module.exports){
  module.exports = {STORY_BOOKS, STORY_LANDS, MORE_HEART_WORDS};
}
