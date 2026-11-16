// 보상형 광고 (앱 전용, @capacitor-community/admob).
// 광고는 플레이어가 고를 때만 나온다: ① 탈락 직전 "광고 보고 1번 더"(한 판에 1번) ② 상점 무료 새로고침(상점마다 1번).
// 지금은 구글이 제공하는 테스트 광고 ID다. 출시 전에 AdMob에서 만든 ID로 바꾼다 (app/README.md 참고).
'use strict';

const ADS_CONFIG={
  rewardedId:'ca-app-pub-3940256099942544/5224354917', // ← AdMob 보상형 광고 단위 ID로 교체
  testing:true,                                         // ← 출시 빌드에서는 false
};
const AdMob=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.AdMob;
let adsReady=false,adsPrivacyRequired=false;

// 앱 시작 시: 초기화 → 유럽 등 동의가 필요한 지역이면 동의 창 표시
async function initAds(){
  if(!IS_APP||!AdMob)return;
  try{
    await AdMob.initialize({initializeForTesting:ADS_CONFIG.testing});
    try{
      const info=await AdMob.requestConsentInfo();
      if(info.isConsentFormAvailable&&info.status==='REQUIRED')await AdMob.showConsentForm();
      const after=await AdMob.requestConsentInfo();
      adsPrivacyRequired=!!after.privacyOptionsRequirementStatus&&after.privacyOptionsRequirementStatus==='REQUIRED';
    }catch(e){}
    adsReady=true;
  }catch(e){adsReady=false;}
}
const canShowAds=()=>IS_APP&&adsReady&&!S.demo;

// 광고를 끝까지 보면 true. 실패하거나 중간에 닫으면 false.
async function showRewarded(){
  if(!canShowAds())return false;
  try{
    await AdMob.prepareRewardVideoAd({adId:ADS_CONFIG.rewardedId,isTesting:ADS_CONFIG.testing});
    const reward=await AdMob.showRewardVideoAd();
    return !!reward;
  }catch(e){toast(t('ads.failed'));return false;}
}
function showAdPrivacy(){if(AdMob&&AdMob.showPrivacyOptionsForm)AdMob.showPrivacyOptionsForm().catch(()=>{});}

// ① 마지막 기회: 남은 횟수 0에서 목표 미달이면, 한 판에 1번 광고를 보고 1번 더 할 수 있다
function lastChance(){
  if(!canShowAds()||S.revived)return gameOver();
  S.busy=true;snapshot('hand'); // 여기서 앱을 꺼도 같은 선택지로 돌아온다 (마지막 핸드를 다시 하는 일 없음)
  openPanel(`<div class="sub">LAST CHANCE</div><h2>${t('ads.lastTitle')}</h2>
    <p>${t('ads.lastText',{score:fmt(S.score),target:fmt(S.target)})}</p>
    <div class="actions"><button class="btn red small" id="adNo">${t('ads.giveUp')}</button><button class="btn teal" id="adYes">▶ ${t('ads.watchPlay')}<small>AD</small></button></div>`);
  $('#adNo').onclick=()=>{sfx.click();closePanel();gameOver();};
  $('#adYes').onclick=async()=>{
    sfx.click();$('#adYes').disabled=true;
    const ok=await showRewarded();
    if(!ok){$('#adYes').disabled=false;return;}
    S.revived=true;S.handsLeft=1;closePanel();renderSide();snapshot('hand');startHand();
  };
}
