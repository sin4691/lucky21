// 런 상태(S) 생성과 보스 선택.
'use strict';

/* ---------------- state ---------------- */
let S=null;
function newRun(){
  S={tut:!tutDone(),tutSeen:{},coaching:false,tricks:[],endless:false,stage:1,gold:6,charms:[],streak:0,bestHand:0,usedBoss:[],busy:true,
     player:[],dealer:[],pEls:[],dEls:[],myDeck:newDeck(),draw:[],discard:[],shoe:[],score:0,target:0,handsLeft:0,boss:null,nextBoss:null};
  S.nextBoss=pickBoss(1);
}
function pickBoss(stage){
  if(!isBossStage(stage))return null;
  const pool=BOSSES.filter(b=>!S.usedBoss.includes(b.id));
  const b=rnd(pool.length?pool:BOSSES);S.usedBoss.push(b.id);return b;
}
const hasCharm=id=>S.charms.some(c=>c.id===id);
function makeCharm(def){return{...def,val:0};}
