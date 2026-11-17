// 공용 유틸: DOM 선택, 대기(속도 배율 적용), 숫자 포맷, 셔플.
'use strict';

/* ---------------- utils ---------------- */
const $=s=>document.querySelector(s);
let SPEED=1;
const sleep=ms=>new Promise(r=>setTimeout(r,ms*SPEED));
const fmt=n=>Math.floor(n).toLocaleString(typeof LANG==='undefined'?'ko-KR':LANG==='zh-Hant'?'zh-TW':LANG);
const fmtM=m=>Number.isInteger(m)?String(m):(Math.round(m*10)/10).toString();
// 게임 진행용 난수 (덱 섞기·상점·보스·강화 확률). 평소엔 Math.random,
// 일일 도전에서는 날짜로 고정한 난수라 모두가 같은 판을 받는다. 연출(파티클 등)은 이걸 쓰지 않는다.
const RNG={seeded:false,s:0};
function rand(){
  if(!RNG.seeded)return Math.random();
  let t=RNG.s=(RNG.s+0x6D2B79F5)|0;           // mulberry32
  t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);
  return((t^t>>>14)>>>0)/4294967296;
}
function seedRng(str){let h=2166136261;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}RNG.seeded=true;RNG.s=h|0;}
function unseedRng(){RNG.seeded=false;}
const rnd=a=>a[rand()*a.length|0];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
