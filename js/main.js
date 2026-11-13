// 입력 바인딩과 부팅.
'use strict';

/* ---------------- 언어 적용 ---------------- */
localizeData();localizeDom();

/* ---------------- input ---------------- */
$('#btnHit').onclick=onHit;$('#btnStand').onclick=onStand;$('#btnDouble').onclick=onDouble;
addEventListener('keydown',e=>{
  if($('#overlay').classList.contains('on')||S.coaching)return;
  const k=e.key.toLowerCase();if(k==='h')onHit();else if(k==='s')onStand();else if(k==='d')onDouble();
});
$('#btnSpeed').onclick=()=>{SPEED=SPEED===1?.5:1;$('#btnSpeed').textContent=SPEED===1?t('ui.speed1'):t('ui.speed2');};
$('#btnMute').onclick=()=>{muted=!muted;$('#btnMute').textContent=muted?t('ui.soundOff'):t('ui.soundOn');};
$('#btnDeck').onclick=()=>{if($('#overlay').classList.contains('on'))return;sfx.click();openDeckView(null);};
$('#btnCol').onclick=()=>{if($('#overlay').classList.contains('on')||(S&&S.busy&&S.player.length))return;sfx.click();openCollection(null);};
$('#btnHelp').onclick=()=>{
  if($('#overlay').classList.contains('on'))return;
  openPanel(`<h2>${t('ui.rules')}</h2>${rulesHtml()}<div class="actions"><button class="btn teal small" id="tutAgain">${t('ui.tutAgain')}</button><button class="btn" id="cl">${t('ui.close')}</button></div>`);$('#cl').onclick=closePanel;
  $('#tutAgain').onclick=()=>{setTutDone(false);S.tut=!S.demo;S.tutSeen={};closePanel();toast(S.demo?t('ui.tutDemoToast'):t('ui.tutAgainToast'));};
};
$('#btnLang').onclick=()=>{if($('#overlay').classList.contains('on')||(S&&S.busy&&S.player.length))return;sfx.click();openLangPicker(null);};
// 모바일 메뉴(☰): 덱 정보와 도구 버튼을 접어 둔다. 바깥을 누르거나 화면을 여는 버튼을 누르면 닫힘
$('#btnMenu').onclick=e=>{e.stopPropagation();sfx.click();$('#side').classList.toggle('menu');};
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#sideMore,#btnMenu'))$('#side').classList.remove('menu');});
['#btnDeck','#btnCol','#btnHelp','#btnLang'].forEach(id=>$(id).addEventListener('click',()=>$('#side').classList.remove('menu')));
// 덱 더미
(()=>{const d=$('#deck');for(let i=0;i<4;i++){const c=backOnly();c.style.transform=`translate(${i*-1.5}px,${i*-1.5}px)`;d.appendChild(c);}})();

document.addEventListener('touchstart',e=>{if(!e.target.closest('.charm,.card'))hideTip();},{passive:true});
addEventListener('scroll',hideTip,{passive:true});
loadArt().then(title);
