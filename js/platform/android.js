// 확인창과 안드로이드 뒤로가기 처리 (Capacitor App 플러그인이 있을 때만).
'use strict';

/* ---------------- confirm + android back button ---------------- */
function confirmBox(title,text,yes,no,onYes){
  $('#cTitle').textContent=title;$('#cText').textContent=text;$('#cYes').textContent=yes;$('#cNo').textContent=no;
  $('#confirmWrap').classList.add('on');
  $('#cNo').onclick=()=>{sfx.click();$('#confirmWrap').classList.remove('on');};
  $('#cYes').onclick=()=>{$('#confirmWrap').classList.remove('on');onYes();};
}
const CapApp=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;
function onBack(){
  if($('#confirmWrap').classList.contains('on')){$('#cNo').click();return;}
  if(isPauseOpen()){closePause();return;}
  if(S&&S.coaching){$('#coachOk')&&$('#coachOk').click();return;}
  if($('#overlay').classList.contains('on')){
    // 닫기·취소가 있는 창(규칙, 덱 보기, 카드 선택, 도감)은 그 창만 닫는다
    const closer=$('#cl')||$('#deckClose')||$('#pickCancel')||$('#colClose')||$('#langClose')||$('#deckBack');
    if(closer){closer.click();return;}
  }
  // 판 진행 중이면 일시정지 메뉴, 타이틀·결과 화면이면 앱 종료 확인
  if(inRun()){openPause();return;}
  confirmBox(t('ui.exitQ'),'',t('ui.exit'),t('ui.cancel'),()=>{if(CapApp&&CapApp.exitApp)CapApp.exitApp();});
}
if(CapApp&&CapApp.addListener)CapApp.addListener('backButton',onBack);
