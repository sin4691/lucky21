// 스테이지 데이터: 목표 점수 곡선, 보스 스테이지, 보스 규칙 10종.
'use strict';

const TARGETS=[30,120,200,350,600,1000,1500,2300];
const BOSS_STAGES=[3,6,8];
// 엔드리스: 8스테이지 이후 목표가 1.6배씩 상승
function targetOf(st){if(st<=8)return TARGETS[st-1];let t=TARGETS[7];for(let i=9;i<=st;i++)t=Math.round(t*1.6/10)*10;return t;}
const isBossStage=st=>st<=8?BOSS_STAGES.includes(st):st%2===0;
const BOSSES=[
  {id:'stiff',name:'냉혈한 딜러',desc:'딜러가 18 이상에서만 스탠드합니다.'},
  {id:'shadow',name:'그림자 궁정',desc:'그림카드(J·Q·K)는 칩을 주지 않습니다.'},
  {id:'thin',name:'얇은 지갑',desc:'남은 횟수가 1 적습니다.'},
  {id:'nobj',name:'블랙잭 금지령',desc:'블랙잭이 일반 승리로 처리됩니다.'},
  {id:'heartseal',name:'봉인된 하트',desc:'하트 카드는 칩을 주지 않고 부적 효과도 발동하지 않습니다.'},
  {id:'smart',name:'영리한 딜러',desc:'딜러가 이미 이기고 있으면 더 이상 카드를 받지 않습니다.'},
  {id:'masked',name:'가면 쓴 딜러',desc:'딜러의 두 카드가 모두 뒤집힌 채로 시작합니다.'},
  {id:'tax',name:'세금 징수원',desc:'질 때마다 골드를 1 빼앗깁니다.'},
  {id:'nodouble',name:'더블 금지',desc:'더블다운을 쓸 수 없습니다.'},
  {id:'halfchip',name:'칩 반토막',desc:'카드에서 나오는 칩이 절반이 됩니다.'},
];
