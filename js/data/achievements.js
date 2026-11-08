// 업적 7종. 달성하면 덱이나 부적이 해금된다.
// check(ev, d, S, meta): 게임 중 이벤트가 생길 때마다 호출. true를 돌려주면 달성.
//   ev 종류: 'stage'(스테이지 시작), 'hand'(핸드 점수 확정 {pts,result,cards}), 'gold', 'bossClear'
'use strict';

const ACHIEVEMENTS=[
  {id:'reach4',name:'중반 진입',desc:'스테이지 4에 도달하기',reward:{deck:'highroller'},
   check:(ev,d,S)=>ev==='stage'&&S.stage>=4},
  {id:'hand1000',name:'천 점짜리 손',desc:'한 핸드에서 1,000점 이상 얻기',reward:{deck:'gilded'},
   check:(ev,d)=>ev==='hand'&&d.pts>=1000},
  {id:'gold25',name:'두둑한 지갑',desc:'골드를 25 이상 모으기',reward:{deck:'rich'},
   check:(ev,d,S)=>ev==='gold'&&S.gold>=25},
  {id:'bj3',name:'블랙잭 세 번',desc:'한 판에서 블랙잭 3번 내기',reward:{charm:'exact'},
   check:(ev,d,S)=>ev==='hand'&&d.result==='bj'&&(S.bjCount||0)>=3},
  {id:'five',name:'다섯 장의 승리',desc:'카드 5장 이상으로 이기기',reward:{charm:'charlie'},
   check:(ev,d)=>ev==='hand'&&d.win&&d.cards.length>=5},
  {id:'flush3',name:'한 가지 색',desc:'카드 3장 이상이 모두 같은 문양으로 이기기',reward:{charm:'flush'},
   check:(ev,d)=>ev==='hand'&&d.win&&d.cards.length>=3&&d.cards.every(c=>c.s===d.cards[0].s)},
  {id:'boss3',name:'보스 사냥꾼',desc:'보스 스테이지를 누적 3번 클리어하기',reward:{charm:'magician'},
   check:(ev,d,S,meta)=>ev==='bossClear'&&meta.bossClears>=3},
];
// 업적으로만 풀리는 부적 (해금 전에는 상점에 나오지 않음)
const LOCKED_CHARMS=ACHIEVEMENTS.filter(a=>a.reward.charm).map(a=>a.reward.charm);
