// 아트 에셋 로딩: ART_FILES에 등록된 이미지만 불러오고, 없으면 코드로 그린 기본 모양을 쓴다.
'use strict';

/* =========================================================
   ART HOOK — GPT 이미지가 준비되면 USE_ART=true 로 바꾸고
   assets/ 폴더에 파일명 규칙대로 넣으면 자동 교체됩니다.
   ========================================================= */
const USE_ART = true;
// 준비된 에셋만 나열 (없는 파일을 요청하지 않도록)
const ART_FILES = { cardBack:null, table:null, charms:['heart','seven','piggy','charlie','diamond','club','spade','face','ace','exact','coward','collector','curse','doubler','insure','pushmaster','grow','streak','even','odd','xray','house','last','loser','ashes','gambler','slim','magician','soft','lowball','dealerup','goldfinger','glassheart','usury','rich','bigdeck','firsthand','mirror','flush'], tricks:['peek','ten','swap','mulligan','stall'] };
const ART = { cardBack:null, table:null, charms:{}, tricks:{} };
function loadImg(src){return new Promise(r=>{if(!src)return r(null);const i=new Image();i.onload=()=>r(src);i.onerror=()=>r(null);i.src=src;});}
async function loadArt(){
  if(!USE_ART) return;
  ART.cardBack = await loadImg(ART_FILES.cardBack);
  ART.table = await loadImg(ART_FILES.table);
  await Promise.all(ART_FILES.charms.map(async id=>{ART.charms[id]=await loadImg(`assets/charms/${id}.webp`);}));
  await Promise.all(ART_FILES.tricks.map(async id=>{ART.tricks[id]=await loadImg(`assets/tricks/${id}.webp`);}));
  if(ART.table){const t=$('#table');t.classList.add('art');t.style.backgroundImage=`url(${ART.table})`;}
  if(ART.cardBack){document.querySelectorAll('#deck .back').forEach(b=>{b.classList.add('art');b.style.backgroundImage=`url(${ART.cardBack})`;});}
}
