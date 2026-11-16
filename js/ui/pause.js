// 일시정지 메뉴: 설정(속도·소리·진동·언어), 규칙·도감·덱, 타이틀로 나가기, 이번 판 포기.
// 화면 위에 따로 뜨는 층(#pauseWrap)이라 상점이나 스테이지 안내 화면을 덮어써도 원래 화면이 그대로 남는다.
'use strict';

const isPauseOpen=()=>$('#pauseWrap').classList.contains('on');
// 진행 중인 판이 있는지 (타이틀·게임 오버·승리 화면에서는 '나가기'가 필요 없음)
const inRun=()=>S&&!S.over;
// 나가도 안전한지: 점수 계산·딜러 차례처럼 진행 중인 동작이 있으면 마지막 저장 이후 결과가 사라지므로 기다린다
const canLeave=()=>!S.dirty&&(!S.busy||$('#overlay').classList.contains('on'));
let pauseTimer=0;

function openPause(){
  if(S&&S.coaching)return;
  sfx.click();$('#side').classList.remove('menu');hideTip();
  renderPause();$('#pauseWrap').classList.add('on');
  clearInterval(pauseTimer);pauseTimer=setInterval(()=>{if(isPauseOpen())refreshLeave();else clearInterval(pauseTimer);},300);
}
function closePause(){$('#pauseWrap').classList.remove('on');clearInterval(pauseTimer);}

function renderPause(){
  const run=inRun(),overlayOn=$('#overlay').classList.contains('on');
  const info=run?`<p class="pz-info">${S.stage>FINAL_STAGE?`∞ · STAGE ${S.stage}`:`STAGE ${S.stage} / ${FINAL_STAGE}`} · ${fmt(S.score)} / ${fmt(S.target)}</p>`:'';
  const vol=Math.round(SETTINGS.vol*100);
  $('#pauseBox').innerHTML=`<div class="sub">PAUSED</div><h2>${t('pause.title')}</h2>${info}
    <button class="btn pz-resume" id="pzResume">▶ ${t('ui.continue')}</button>
    <div class="pz-row"><span>${t('pause.speed')}</span><div class="pz-seg">
      <button data-speed="1" class="${SETTINGS.speed===1?'on':''}">1x</button><button data-speed="2" class="${SETTINGS.speed===2?'on':''}">2x</button></div></div>
    <div class="pz-row"><span>${t('pause.sound')}</span><input type="range" id="pzVol" min="0" max="100" step="5" value="${vol}"><b id="pzVolV">${vol}%</b></div>
    ${canVibrate?`<div class="pz-row"><span>${t('pause.vib')}</span><div class="pz-seg">
      <button data-vib="1" class="${SETTINGS.vib?'on':''}">${t('pause.on')}</button><button data-vib="0" class="${SETTINGS.vib?'':'on'}">${t('pause.off')}</button></div></div>`:''}
    <div class="pz-row"><span>${t('ui.language')}</span><button class="pz-link" id="pzLang">${LANGS.find(l=>l[0]===LANG)[1]} ▸</button></div>
    ${IS_APP&&CLOUD.available?`<div class="pz-row"><span>${t('cloud.label')}</span>${CLOUD.signedIn
      ?`<button class="pz-link" id="pzCloud">${t('cloud.on')} · ${t('cloud.syncNow')} ▸</button>`
      :`<button class="pz-link" id="pzCloud">${t('cloud.signIn')} ▸</button>`}</div>`:''}
    ${adsPrivacyRequired?`<div class="pz-row"><span>${t('ads.privacy')}</span><button class="pz-link" id="pzAdPriv">${t('ads.privacyEdit')} ▸</button></div>`:''}
    ${overlayOn?'':`<div class="pz-btns"><button id="pzRules">${t('ui.rules')}</button><button id="pzCol">${t('ui.collection')}</button>${run?`<button id="pzDeck">${t('ui.myDeck')}</button>`:''}</div>`}
    ${run?`<div class="pz-leave">
      <button class="btn teal" id="pzTitle">${t('pause.toTitle')}</button>
      <button class="btn red" id="pzGiveUp">${t('pause.giveUp')}</button>
      <p class="pz-note" id="pzNote"></p></div>`:''}`;
  $('#pzResume').onclick=()=>{sfx.click();closePause();};
  document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>{SETTINGS.speed=+b.dataset.speed;saveSettings();applySettings();sfx.click();renderPause();});
  document.querySelectorAll('[data-vib]').forEach(b=>b.onclick=()=>{SETTINGS.vib=b.dataset.vib==='1';saveSettings();if(SETTINGS.vib)buzz('medium');sfx.click();renderPause();});
  const v=$('#pzVol');
  v.oninput=()=>{SETTINGS.vol=+v.value/100;$('#pzVolV').textContent=v.value+'%';applySettings();};
  v.onchange=()=>{saveSettings();sfx.click();};
  $('#pzLang').onclick=()=>{sfx.click();closePause();openLangPicker(null);};
  if($('#pzCloud'))$('#pzCloud').onclick=async()=>{sfx.click();
    if(!CLOUD.signedIn)return cloudSignIn().then(renderPause);
    const changed=await cloudSync();if(changed&&!inRun()){closePause();title();}toast(t('cloud.synced'));};
  if($('#pzAdPriv'))$('#pzAdPriv').onclick=()=>{sfx.click();showAdPrivacy();};
  if($('#pzRules')){
    $('#pzRules').onclick=()=>{closePause();openRules();};
    $('#pzCol').onclick=()=>{sfx.click();closePause();openCollection(null);};
    if($('#pzDeck'))$('#pzDeck').onclick=()=>{sfx.click();closePause();openDeckView(null);};
  }
  if(run){
    $('#pzTitle').onclick=()=>{if(!canLeave())return;sfx.click();goTitle();};
    $('#pzGiveUp').onclick=()=>{if(!canLeave())return;sfx.click();
      confirmBox(t('pause.giveUpQ'),t('pause.giveUpText'),t('pause.giveUp'),t('ui.cancel'),()=>{closePause();giveUp();});};
    refreshLeave();
  }
}
function refreshLeave(){
  const n=$('#pzNote');if(!n)return;
  const ok=canLeave();$('#pzTitle').disabled=!ok;$('#pzGiveUp').disabled=!ok;
  n.textContent=!ok?t('pause.wait'):S.demo?t('pause.demoNoSave'):t('pause.saved');
}
// 타이틀로: 마지막 자동 저장 지점이 곧 이어하기 지점이다. 새로고침으로 진행 중인 연출까지 깨끗하게 정리한다.
function goTitle(){
  if(!S.demo&&!loadSave())snapshot('hand');
  location.reload();
}
function giveUp(){
  S.over=true;S.gaveUp=true;hideBanner();
  logStage(false);saveRec(false);statRunEnd('giveup');clearSave();sfx.lose();
  endScreen('giveup');
}
