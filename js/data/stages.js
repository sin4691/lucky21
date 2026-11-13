// 스테이지 데이터: 목표 점수 곡선, 보스 스테이지, 보스 규칙 10종.
'use strict';

const TARGETS=[30,120,200,350,600,1000,1500,2300];
const BOSS_STAGES=[3,6,8];
// 엔드리스: 8스테이지 이후 목표가 1.6배씩 상승
function targetOf(st){if(st<=8)return TARGETS[st-1];let t=TARGETS[7];for(let i=9;i<=st;i++)t=Math.round(t*1.6/10)*10;return t;}
const isBossStage=st=>st<=8?BOSS_STAGES.includes(st):st%2===0;
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
