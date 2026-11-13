// 시작 덱 5종. 새 게임을 시작할 때 고른다. apply(S)가 런 상태를 덱에 맞게 바꾼다.
// unlock: 해금에 필요한 업적 id (null이면 처음부터 사용 가능)
'use strict';

const DECKS=[
  {id:'classic',sample:{r:'A',s:'♠'},unlock:null,
   apply:S=>{}},
  {id:'hearts',sample:{r:'K',s:'♥'},unlock:null,
   apply:S=>{S.myDeck.forEach(c=>{if(c.s==='♣')c.s='♥';});S.gold=3;S.charms.push(makeCharm(CHARMS.find(c=>c.id==='heart')));}},
  {id:'highroller',sample:{r:'10',s:'♦'},unlock:'reach4',
   apply:S=>{S.myDeck=S.myDeck.filter(c=>!['2','3','4','5'].includes(c.r));}},
  {id:'gilded',sample:{r:'Q',s:'♦',enh:'gold'},unlock:'hand1000',
   apply:S=>{shuffle([...S.myDeck]).slice(0,10).forEach(c=>c.enh='gold');S.gold=0;}},
  {id:'rich',sample:{r:'J',s:'♣'},unlock:'gold25',
   apply:S=>{S.gold=18;S.handMod=-1;S.richDeck=true;}},
];
