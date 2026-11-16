// 스테이지 데이터: 목표 점수 곡선, 보스 스테이지, 보스 규칙 10종.
'use strict';

const FINAL_STAGE=12;
// tools/balance/full-run.js 기준: 규칙 기반 봇 클리어율 약 34%
const TARGETS=[30,60,90,130,170,200,240,280,300,350,400,450];
const BOSS_STAGES=[3,6,9,12];
// 무한 모드: 마지막 스테이지 이후 목표가 1.6배씩 상승, 2스테이지마다 보스
function targetOf(st){if(st<=FINAL_STAGE)return TARGETS[st-1];let t=TARGETS[FINAL_STAGE-1];for(let i=FINAL_STAGE+1;i<=st;i++)t=Math.round(t*1.6/10)*10;return t;}
const isBossStage=st=>st<=FINAL_STAGE?BOSS_STAGES.includes(st):st%2===0;
const BOSSES=[
  {id:'stiff'},
  {id:'shadow'},
  {id:'thin'},
  {id:'nobj'},
  {id:'heartseal'},
  {id:'smart'},
  {id:'masked'},
  {id:'tax'},
  {id:'nodouble'},
  {id:'halfchip'},
];
