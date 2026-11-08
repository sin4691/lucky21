// 최고 기록 저장 (localStorage).
'use strict';

/* ---------------- records (localStorage) ---------------- */
function loadRec(){try{return JSON.parse(localStorage.getItem('lucky21.rec'))||{stage:0,hand:0,wins:0};}catch(e){return{stage:0,hand:0,wins:0};}}
function saveRec(won){
  if(S.demo)return;
  const r=loadRec();r.stage=Math.max(r.stage,won||S.endless?9:S.stage);r.hand=Math.max(r.hand,S.bestHand);if(won)r.wins++;
  if(S.endless)r.endless=Math.max(r.endless||0,S.stage);
  try{localStorage.setItem('lucky21.rec',JSON.stringify(r));}catch(e){}
}
function recHtml(){const r=loadRec();if(!r.stage)return'';return`<div class="record">최고 기록 · ${r.stage>8?'<b>클리어</b>':`스테이지 <b>${r.stage}</b>`} · 최고 핸드 <b>${fmt(r.hand)}</b>${r.wins?` · 클리어 <b>${r.wins}</b>회`:''}${r.endless?` · 엔드리스 <b>${r.endless}</b>스테이지`:''}</div>`;}
