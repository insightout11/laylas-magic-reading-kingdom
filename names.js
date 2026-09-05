/* ============================================================
   NAMES — the family. Letter RECOGNITION only, deliberately walled off
   from phonics: Reading never reads this file, no name letter unlocks a
   phoneme for decoding, and no name game ever models a letter sound.
   (Letter NAMES spoken while spelling are fine — that is spelling aloud,
   not phonics instruction.)

   introduceInOrder: Layla -> Lily -> Mommy/Daddy -> Jackson/Lintang.
   A name unlocks when every name of the previous order is solid, where
   solid = at least one completed build (mastery name:build:<id>, p>0).
   ============================================================ */
'use strict';

const NAMES = [
  {id:'layla',   display:'LAYLA',   spoken:'Layla',   letters:['L','A','Y','L','A'],       who:'herself',       emoji:'👧', order:0},
  {id:'lily',    display:'LILY',    spoken:'Lily',    letters:['L','I','L','Y'],             who:'her middle name', emoji:'🌸', order:1},
  {id:'mommy',   display:'MOMMY',   spoken:'Mommy',   letters:['M','O','M','M','Y'],         who:'her mommy',     emoji:'👩', order:2},
  {id:'daddy',   display:'DADDY',   spoken:'Daddy',   letters:['D','A','D','D','Y'],         who:'her daddy',     emoji:'👨', order:2},
  {id:'jackson', display:'JACKSON', spoken:'Jackson', letters:['J','A','C','K','S','O','N'], who:'her brother',   emoji:'👦', order:3},
  {id:'lintang', display:'LINTANG', spoken:'Lintang', letters:['L','I','N','T','A','N','G'], who:'Lintang',       emoji:'🧒', order:3}
];
/* Distractors are NEVER family names: a wrong tap must never show a real
   person's name as the incorrect choice. */
const DISTRACTOR_NAMES = ['MAYA','LUCY','SOFIA','EMMA','MIA','NOAH','RUBY','FINN'];

function nameById(id){
  for(let i=0;i<NAMES.length;i++) if(NAMES[i].id===id) return NAMES[i];
  return NAMES[0];
}
function familyDisplays(){
  return NAMES.map(function(n){ return n.display; });
}
/* Solid = she has completed at least one build of it. */
function nameSolid(id){
  try{ return (((S.mastery||{})['name:build:'+id])||{p:0}).p>0; }
  catch(e){ return false; }
}
function availableNames(){
  return NAMES.filter(function(n){
    if(n.order===0) return true;
    return NAMES.filter(function(m){ return m.order===n.order-1; })
               .every(function(m){ return nameSolid(m.id); });
  });
}
/* The name she should practise now: first available one that is not solid. */
function currentName(){
  const av = availableNames();
  for(let i=0;i<av.length;i++) if(!nameSolid(av[i].id)) return av[i];
  return av[av.length-1] || NAMES[0];
}
function isNameDistractorOk(display){
  return DISTRACTOR_NAMES.indexOf(display)>=0;
}
