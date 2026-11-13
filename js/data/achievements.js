// 업적 7종. 달성하면 덱이나 부적이 해금된다.
// check(ev, d, S, meta): 게임 중 이벤트가 생길 때마다 호출. true를 돌려주면 달성.
//   ev 종류: 'stage'(스테이지 시작), 'hand'(핸드 점수 확정 {pts,result,cards}), 'gold', 'bossClear'
'use strict';

const ACHIEVEMENTS=[
  {id:'reach4',reward:{deck:'highroller'},
   check:(ev,d,S)=>ev==='stage'&&S.stage>=4},
  {id:'hand1000',reward:{deck:'gilded'},
   check:(ev,d)=>ev==='hand'&&d.pts>=1000},
  {id:'gold25',reward:{deck:'rich'},
   check:(ev,d,S)=>ev==='gold'&&S.gold>=25},
  {id:'bj3',reward:{charm:'exact'},
   check:(ev,d,S)=>ev==='hand'&&d.result==='bj'&&(S.bjCount||0)>=3},
  {id:'five',reward:{charm:'charlie'},
   check:(ev,d)=>ev==='hand'&&d.win&&d.cards.length>=5},
  {id:'flush3',reward:{charm:'flush'},
   check:(ev,d)=>ev==='hand'&&d.win&&d.cards.length>=3&&d.cards.every(c=>c.s===d.cards[0].s)},
  {id:'boss3',reward:{charm:'magician'},
   check:(ev,d,S,meta)=>ev==='bossClear'&&meta.bossClears>=3},
];
// 업적으로만 풀리는 부적 (해금 전에는 상점에 나오지 않음)
const LOCKED_CHARMS=ACHIEVEMENTS.filter(a=>a.reward.charm).map(a=>a.reward.charm);
