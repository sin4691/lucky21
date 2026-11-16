// 웹 체험판 / 앱 정식판 구분.
// 같은 코드로 웹(깃허브 사이트)과 안드로이드 앱을 만들고, 웹에서는 일정 스테이지까지만 할 수 있다.
'use strict';

const IS_APP=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const TRIAL_LAST_STAGE=4;   // 웹 체험판: 4스테이지(첫 보스 다음)까지
const PLAY_URL='https://play.google.com/store/apps/details?id=com.sin4691.lucky21';
const isTrial=()=>!IS_APP;

// 스테이지 클리어 직후 호출. 체험판 끝이면 true를 돌려주고 안내 화면을 띄운다.
function trialEndCheck(){
  if(!isTrial()||S.endless||S.stage<TRIAL_LAST_STAGE)return false;
  S.over=true;saveRec(false);statRunEnd('lose');clearSave();
  openPanel(`<div class="sub">WEB TRIAL</div><h1>${t('trial.title')}</h1>
    <p>${t('trial.text',{n:TRIAL_LAST_STAGE,total:FINAL_STAGE})}</p>
    ${summaryHtml()}
    <div class="actions"><button class="btn teal" id="again">${t('end.again')}</button>
      <a class="btn" id="getApp" href="${PLAY_URL}" target="_blank" rel="noopener">${t('trial.getApp')}<small>GOOGLE PLAY</small></a></div>`,'end');
  $('#again').onclick=()=>{sfx.click();title();};
  return true;
}
