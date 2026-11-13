// 판을 넘어 유지되는 진행도: 발견한 부적·트릭·보스, 달성한 업적, 누적 보스 클리어.
// 데모 모드에서는 기록하지 않는다.
'use strict';

const META_KEY='lucky21.meta';
function loadMeta(){
  let m=null;try{m=JSON.parse(localStorage.getItem(META_KEY));}catch(e){}
  m=Object.assign({charms:[],tricks:[],bosses:[],achs:[],bossClears:0},m||{});
  // 이 기능이 생기기 전에 남긴 최고 기록으로도 소급 해금
  const r=loadRec();if(r.stage>=4&&!m.achs.includes('reach4'))m.achs.push('reach4');
  if(r.hand>=1000&&!m.achs.includes('hand1000'))m.achs.push('hand1000');
  return m;
}
let META=loadMeta();
function saveMeta(){try{localStorage.setItem(META_KEY,JSON.stringify(META));}catch(e){}}
const recordOn=()=>S&&!S.demo;

function discover(kind,id){
  if(!recordOn()||!id)return;
  const list=META[kind];if(list.includes(id))return;
  list.push(id);saveMeta();
}
const isDeckUnlocked=d=>!d.unlock||META.achs.includes(d.unlock);
const isCharmUnlocked=id=>!LOCKED_CHARMS.includes(id)||ACHIEVEMENTS.some(a=>a.reward.charm===id&&META.achs.includes(a.id));

// 게임 중 이벤트마다 호출 → 새로 달성한 업적이 있으면 알림
function achEvent(ev,d={}){
  if(!recordOn())return;
  if(ev==='bossClear'){META.bossClears++;saveMeta();}
  for(const a of ACHIEVEMENTS){
    if(META.achs.includes(a.id))continue;
    let ok=false;try{ok=a.check(ev,d,S,META);}catch(e){}
    if(ok){META.achs.push(a.id);saveMeta();announceUnlock(a);}
  }
}
function rewardText(a){
  if(a.reward.deck)return t('ui.rewardDeck',{name:DECKS.find(d=>d.id===a.reward.deck).name});
  return t('ui.rewardCharm',{name:CHARMS.find(c=>c.id===a.reward.charm).name});
}
function announceUnlock(a){
  const el=document.createElement('div');el.className='unlock';
  el.innerHTML=`<span class="k">${t('ui.achDone',{name:a.name})}</span><b>${t('ui.unlocked',{what:rewardText(a)})}</b>`;
  document.body.appendChild(el);sfx.gold();
  requestAnimationFrame(()=>el.classList.add('on'));
  setTimeout(()=>{el.classList.remove('on');setTimeout(()=>el.remove(),400);},3200);
}
