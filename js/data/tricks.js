// 트릭 카드(1회용) 5종 정의.
'use strict';

const TRICKS=[
  {id:'peek',name:'점쟁이의 눈',glyph:'◎',price:2,desc:'내 덱의 다음 카드를 미리 봅니다. 내 차례에 사용'},
  {id:'ten',name:'손님 대접',glyph:'10',price:3,desc:'다음에 뽑을 카드를 10계열로 바꿔 놓습니다. 내 차례에 사용'},
  {id:'swap',name:'바꿔치기',glyph:'⇄',price:3,desc:'손패의 마지막 카드를 버리고 새로 뽑습니다. 내 차례에 사용'},
  {id:'mulligan',name:'다시 딜',glyph:'↺',price:3,desc:'첫 두 장일 때 이번 핸드를 무르고 다시 받습니다 (핸드 소모 없음)'},
  {id:'stall',name:'시간 벌기',glyph:'+1',price:4,desc:'이번 스테이지의 남은 핸드 +1'},
];
