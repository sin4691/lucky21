// 공용 유틸: DOM 선택, 대기(속도 배율 적용), 숫자 포맷, 셔플.
'use strict';

/* ---------------- utils ---------------- */
const $=s=>document.querySelector(s);
let SPEED=1;
const sleep=ms=>new Promise(r=>setTimeout(r,ms*SPEED));
const fmt=n=>Math.floor(n).toLocaleString('ko-KR');
const fmtM=m=>Number.isInteger(m)?String(m):(Math.round(m*10)/10).toString();
const rnd=a=>a[Math.random()*a.length|0];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
