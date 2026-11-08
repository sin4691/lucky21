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
  if(S&&S.coaching){$('#coachOk')&&$('#coachOk').click();return;}
  if($('#overlay').classList.contains('on')){
    // 닫기·취소가 있는 창(규칙, 덱 보기, 카드 선택)은 그 창만 닫는다
    const closer=$('#cl')||$('#deckClose')||$('#pickCancel');
    if(closer){closer.click();return;}
  }
  const saved=S&&!S.demo&&loadSave();
  confirmBox('게임을 종료할까요?',S&&S.demo?'데모 모드는 저장되지 않아요.':saved?'진행 상황은 저장돼 있어요. 다시 켜면 타이틀에서 이어할 수 있어요.':'',
    '종료','계속하기',()=>{if(CapApp&&CapApp.exitApp)CapApp.exitApp();});
}
if(CapApp&&CapApp.addListener)CapApp.addListener('backButton',onBack);
