// 입력 바인딩과 부팅.
'use strict';

/* ---------------- 언어·설정 적용 ---------------- */
localizeData();localizeDom();applySettings();

/* ---------------- input ---------------- */
$('#btnHit').onclick=onHit;$('#btnStand').onclick=onStand;$('#btnDouble').onclick=onDouble;
addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(isPauseOpen())closePause();else if(!$('#confirmWrap').classList.contains('on'))openPause();return;}
  if(isPauseOpen()||$('#overlay').classList.contains('on')||S.coaching)return;
  const k=e.key.toLowerCase();if(k==='h')onHit();else if(k==='s')onStand();else if(k==='d')onDouble();
});
$('#btnDeck').onclick=()=>{if($('#overlay').classList.contains('on'))return;sfx.click();openDeckView(null);};
// 메뉴: PC는 정보칸 아래 ⚙, 모바일은 오른쪽 위 ☰. 둘 다 일시정지 메뉴를 연다
$('#btnPause').onclick=openPause;$('#btnMenu').onclick=e=>{e.stopPropagation();openPause();};
$('#pauseWrap').addEventListener('click',e=>{if(e.target.id==='pauseWrap')closePause();});
// 덱 더미
(()=>{const d=$('#deck');for(let i=0;i<4;i++){const c=backOnly();c.style.transform=`translate(${i*-1.5}px,${i*-1.5}px)`;d.appendChild(c);}})();

document.addEventListener('touchstart',e=>{if(!e.target.closest('.charm,.card'))hideTip();},{passive:true});
addEventListener('scroll',hideTip,{passive:true});
loadArt().then(title);
