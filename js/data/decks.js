// 시작 덱 5종. 새 게임을 시작할 때 고른다. apply(S)가 런 상태를 덱에 맞게 바꾼다.
// unlock: 해금에 필요한 업적 id (null이면 처음부터 사용 가능)
'use strict';

const DECKS=[
  {id:'classic',name:'클래식',sample:{r:'A',s:'♠'},unlock:null,
   desc:'표준 52장. 골드 6으로 시작해요.',
   apply:S=>{}},
  {id:'hearts',name:'붉은 연정',sample:{r:'K',s:'♥'},unlock:null,
   desc:'클로버가 전부 하트로 바뀐 덱. 하트 26장 + 부적 "붉은 심장"을 들고 시작해요. 대신 골드 3.',
   apply:S=>{S.myDeck.forEach(c=>{if(c.s==='♣')c.s='♥';});S.gold=3;S.charms.push(makeCharm(CHARMS.find(c=>c.id==='heart')));}},
  {id:'highroller',name:'하이롤러',sample:{r:'10',s:'♦'},unlock:'reach4',
   desc:'2~5가 없는 36장. 블랙잭이 자주 나오지만 버스트 위험도 커요.',
   apply:S=>{S.myDeck=S.myDeck.filter(c=>!['2','3','4','5'].includes(c.r));}},
  {id:'gilded',name:'금박',sample:{r:'Q',s:'♦',enh:'gold'},unlock:'hand1000',
   desc:'무작위 10장이 금박 카드(이기면 배수 +4). 대신 골드 0으로 시작해요.',
   apply:S=>{shuffle([...S.myDeck]).slice(0,10).forEach(c=>c.enh='gold');S.gold=0;}},
  {id:'rich',name:'부자',sample:{r:'J',s:'♣'},unlock:'gold25',
   desc:'골드 18로 시작하고 이자 한도가 10이에요. 대신 스테이지마다 남은 횟수가 1 적어요.',
   apply:S=>{S.gold=18;S.handMod=-1;S.richDeck=true;}},
];
