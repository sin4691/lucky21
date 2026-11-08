// 진행 중인 판 체크포인트 저장·복원 (핸드 사이, 스테이지 클리어, 상점).
'use strict';

/* ---------------- run save (checkpoint) ----------------
   폰에서는 앱이 언제든 종료될 수 있어서, 아래 시점마다 판 전체를 저장한다.
   - 'hand' : 스테이지 시작 직후, 그리고 핸드와 핸드 사이
   - 'clear': 스테이지 클리어 보상을 받은 직후
   - 'shop' : 상점 화면 (구매할 때마다 갱신)
   핸드 도중에 꺼지면 그 핸드 시작 전으로 돌아간다. 덱 순서도 저장하므로 같은 카드가 나온다. */
const SAVE_KEY='lucky21.save';
const plainCard=c=>({r:c.r,s:c.s,enh:c.enh||null,id:c.id});
function snapshot(phase){
  if(!S||S.demo)return;
  const pend=S.player.filter(c=>!c.broken);
  const d={v:1,phase,at:Date.now(),
    stage:S.stage,gold:S.gold,streak:S.streak,bestHand:S.bestHand,usedBoss:S.usedBoss,endless:S.endless,
    tut:S.tut,tutSeen:S.tutSeen,
    charms:S.charms.map(c=>({id:c.id,val:c.val})),tricks:S.tricks.map(t=>t.id),
    myDeck:S.myDeck.map(plainCard),
    boss:S.boss?.id||null,nextBoss:S.nextBoss?.id||null,
    score:S.score,target:S.target,handsLeft:S.handsLeft,handNo:S.handNo,insuranceUsed:!!S.insuranceUsed,
    draw:S.draw.map(plainCard),discard:[...S.discard,...(phase==='hand'?pend:[])].map(plainCard),shoe:S.shoe.map(plainCard),
    rerollCost:S.rerollCost,
    offers:(S.offers||[]).map(o=>({id:o.def.id,sold:o.sold})),
    cardOffers:(S.cardOffers||[]).map(o=>({...o,card:o.card?plainCard(o.card):undefined})),
    trickOffers:(S.trickOffers||[]).map(o=>({id:o.t.id,sold:o.sold})),
  };
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(d));}catch(e){}
}
function loadSave(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));return d&&d.v===1?d:null;}catch(e){return null;}}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}
function restore(d){
  newRun();
  const byId=new Map();const card=c=>{if(byId.has(c.id))return byId.get(c.id);const x={...c};byId.set(c.id,x);return x;};
  Object.assign(S,{stage:d.stage,gold:d.gold,streak:d.streak,bestHand:d.bestHand,usedBoss:d.usedBoss||[],endless:d.endless,
    tut:d.tut,tutSeen:d.tutSeen||{},score:d.score,target:d.target,handsLeft:d.handsLeft,handNo:d.handNo||0,insuranceUsed:d.insuranceUsed,
    rerollCost:d.rerollCost||2});
  S.charms=d.charms.map(c=>{const def=CHARMS.find(x=>x.id===c.id);return def&&{...makeCharm(def),val:c.val||0};}).filter(Boolean);
  S.tricks=d.tricks.map(id=>TRICKS.find(t=>t.id===id)).filter(Boolean);
  S.myDeck=d.myDeck.map(card);S.draw=d.draw.map(card);S.discard=d.discard.map(card);S.shoe=d.shoe.map(c=>({...c}));
  S.boss=BOSSES.find(b=>b.id===d.boss)||null;S.nextBoss=BOSSES.find(b=>b.id===d.nextBoss)||null;
  S.offers=d.offers.map(o=>({def:CHARMS.find(c=>c.id===o.id),sold:o.sold})).filter(o=>o.def);
  S.cardOffers=d.cardOffers.map(o=>({...o,card:o.card?{...o.card}:undefined}));
  S.trickOffers=d.trickOffers.map(o=>({t:TRICKS.find(t=>t.id===o.id),sold:o.sold})).filter(o=>o.t);
  let mx=0;for(const c of [...S.myDeck,...S.draw,...S.discard,...S.shoe,...S.cardOffers.map(o=>o.card).filter(Boolean)])mx=Math.max(mx,c.id);UID=mx+1;
  S.player=[];S.dealer=[];S.pEls=[];S.dEls=[];S.busy=true;
}
function resumeRun(){
  const d=loadSave();if(!d){title();return;}
  restore(d);renderSide();renderCharms();setCM(0,0);
  $('#pHand').innerHTML='';$('#dHand').innerHTML='';$('#pTot').textContent='';$('#dTot').textContent='';
  if(d.phase==='shop'){renderShop();return;}
  if(d.phase==='clear'){openShop();return;}
  const bossHtml=S.boss?`<div class="next" style="margin-top:12px"><span class="bn">보스 · ${S.boss.name}</span><br>${S.boss.desc}</div>`:'';
  openPanel(`<div class="sub">CONTINUE · ${S.stage>8?`ENDLESS STAGE ${S.stage}`:`STAGE ${S.stage} / 8`}</div><h2>이어하기</h2>
    <p>점수 <b class="gold">${fmt(S.score)}</b> / ${fmt(S.target)} · 남은 핸드 <b>${S.handsLeft}</b> · 골드 <b class="gold">${S.gold}G</b></p>${bossHtml}
    <div class="actions"><button class="btn" id="goStage">계속하기</button></div>`);
  $('#goStage').onclick=()=>{sfx.click();closePanel();startHand();};
}
