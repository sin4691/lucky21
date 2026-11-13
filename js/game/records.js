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
function recHtml(){const r=loadRec();if(!r.stage)return'';return`<div class="record">${t('ui.recBest')} · ${r.stage>8?`<b>${t('ui.recClear')}</b>`:t('ui.recStage',{n:r.stage})} · ${t('ui.recHand',{n:fmt(r.hand)})}${r.wins?` · ${t('ui.recWins',{n:r.wins})}`:''}${r.endless?` · ${t('ui.recEndless',{n:r.endless})}`:''}</div>`;}
