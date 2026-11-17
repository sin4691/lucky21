// 설정(속도·소리 크기·진동)과 누적 통계. 둘 다 기기에 저장한다.
'use strict';

/* ---------------- 설정 ---------------- */
const SET_KEY='lucky21.settings';
const SETTINGS=(()=>{const d={speed:1,vol:.8,vib:true};try{return {...d,...JSON.parse(localStorage.getItem(SET_KEY)||'{}')};}catch(e){return d;}})();
function saveSettings(){try{localStorage.setItem(SET_KEY,JSON.stringify(SETTINGS));}catch(e){}}
function applySettings(){SPEED=SETTINGS.speed===2?.5:1;VOL=SETTINGS.vol;}

/* ---------------- 진동 ----------------
   앱에서는 Capacitor Haptics 플러그인, 브라우저에서는 navigator.vibrate(지원하는 기기만). */
const Haptics=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Haptics;
const canVibrate=!!Haptics||typeof navigator.vibrate==='function';
function buzz(kind){
  if(!SETTINGS.vib||!canVibrate)return;
  try{
    if(Haptics){
      if(kind==='success'||kind==='error')Haptics.notification({type:kind==='success'?'SUCCESS':'ERROR'});
      else Haptics.impact({style:{light:'LIGHT',medium:'MEDIUM',heavy:'HEAVY'}[kind]||'LIGHT'});
    }else navigator.vibrate({light:15,medium:30,heavy:60,success:[20,40,40],error:[60,40,60]}[kind]||15);
  }catch(e){}
}

/* ---------------- 누적 통계 (데모 모드는 기록하지 않음) ---------------- */
const STATS_KEY='lucky21.stats';
const STATS=(()=>{const d={runs:0,clears:0,giveups:0,hands:0,wins:0,bjs:0,busts:0,bestHand:0,bestStage:0,bestEndless:0,totalScore:0};
  try{return {...d,...JSON.parse(localStorage.getItem(STATS_KEY)||'{}')};}catch(e){return d;}})();
function saveStats(){try{localStorage.setItem(STATS_KEY,JSON.stringify(STATS));}catch(e){}cloudPush();}
function statHand(result,pts){
  if(!S||S.demo)return;
  STATS.hands++;if(WIN_SET.has(result))STATS.wins++;if(result==='bj')STATS.bjs++;if(result==='bust')STATS.busts++;
  STATS.totalScore+=pts;STATS.bestHand=Math.max(STATS.bestHand,pts);saveStats();
}
function statRunEnd(kind){ // kind: 'clear' | 'lose' | 'giveup'
  if(!S||S.demo)return;
  if(S.daily)dailyResult(kind,!S.counted);
  if(!S.counted){S.counted=true;STATS.runs++;if(kind==='clear')STATS.clears++;if(kind==='giveup')STATS.giveups++;}
  STATS.bestStage=Math.max(STATS.bestStage,Math.min(S.stage,FINAL_STAGE));
  if(S.endless)STATS.bestEndless=Math.max(STATS.bestEndless,S.stage);
  saveStats();
}
