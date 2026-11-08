// 입력 바인딩과 부팅.
'use strict';

/* ---------------- input ---------------- */
$('#btnHit').onclick=onHit;$('#btnStand').onclick=onStand;$('#btnDouble').onclick=onDouble;
addEventListener('keydown',e=>{
  if($('#overlay').classList.contains('on')||S.coaching)return;
  const k=e.key.toLowerCase();if(k==='h')onHit();else if(k==='s')onStand();else if(k==='d')onDouble();
});
$('#btnSpeed').onclick=()=>{SPEED=SPEED===1?.5:1;$('#btnSpeed').textContent=SPEED===1?'속도 1x':'속도 2x';};
$('#btnMute').onclick=()=>{muted=!muted;$('#btnMute').textContent=muted?'소리 끔':'소리 켬';};
$('#btnDeck').onclick=()=>{if($('#overlay').classList.contains('on'))return;sfx.click();openDeckView(null);};
$('#btnHelp').onclick=()=>{
  if($('#overlay').classList.contains('on'))return;
  openPanel(`<h2>규칙</h2>${rulesHtml()}<div class="actions"><button class="btn teal small" id="tutAgain">튜토리얼 다시 보기</button><button class="btn" id="cl">닫기</button></div>`);$('#cl').onclick=closePanel;
  $('#tutAgain').onclick=()=>{setTutDone(false);S.tut=!S.demo;S.tutSeen={};closePanel();toast(S.demo?'데모 모드에서는 튜토리얼이 나오지 않아요':'다음 핸드부터 튜토리얼이 다시 나와요');};
};
// 덱 더미
(()=>{const d=$('#deck');for(let i=0;i<4;i++){const c=backOnly();c.style.transform=`translate(${i*-1.5}px,${i*-1.5}px)`;d.appendChild(c);}})();

document.addEventListener('touchstart',e=>{if(!e.target.closest('.charm,.card'))hideTip();},{passive:true});
addEventListener('scroll',hideTip,{passive:true});
loadArt().then(title);
