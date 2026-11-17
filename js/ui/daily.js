// 일일 도전: 날짜로 고정한 난수로 하루 한 판, 모두가 같은 덱 순서·상점·보스를 받는다.
// 기록은 기기에 오늘 날짜 것만 남긴다 (도달 스테이지·최고 핸드·도전 횟수).
'use strict';

const DAILY_KEY='lucky21.daily';
const todayStr=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function loadDaily(){try{const r=JSON.parse(localStorage.getItem(DAILY_KEY)||'null');return r&&r.date===todayStr()?r:null;}catch(e){return null;}}

// 판이 끝날 때(statRunEnd) 호출. first: 이 판의 첫 기록인지 (무한 모드에서 두 번 세지 않게)
function dailyResult(kind,first){
  if(!S||!S.daily)return;
  let r=null;try{r=JSON.parse(localStorage.getItem(DAILY_KEY)||'null');}catch(e){}
  if(!r||r.date!==S.daily)r={date:S.daily,stage:0,hand:0,tries:0,cleared:false};
  if(first)r.tries++;
  r.stage=Math.max(r.stage,Math.min(S.stage,FINAL_STAGE));
  r.hand=Math.max(r.hand,S.bestHand||0);
  if(kind==='clear')r.cleared=true;
  try{localStorage.setItem(DAILY_KEY,JSON.stringify(r));}catch(e){}
}
function dailySubText(){
  const r=loadDaily();
  if(!r)return t('title.dailySub');
  return r.cleared?t('title.dailyClear'):t('title.dailyBest',{n:r.stage});
}
function setLogoBadge(){
  const badge=S&&S.demo?'<span class="demo-badge">DEMO</span>':S&&S.daily?'<span class="demo-badge daily-badge">DAILY</span>':'';
  $('.logo').innerHTML=`LUCKY 21${badge}<small>BLACKJACK ROGUELIKE</small>`;
}
function startDaily(){
  const go=()=>{
    const d=todayStr();
    seedRng('lucky21-daily-'+d);
    newRun();S.daily=d;
    renderSide();renderCharms();setLogoBadge();startStage();
  };
  if(loadSave())confirmBox(t('title.daily'),t('daily.overwrite'),t('title.daily'),t('ui.cancel'),()=>{$('#confirmWrap').classList.remove('on');go();});
  else go();
}
