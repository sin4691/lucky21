// 부적 데이터 39종. perCard(카드마다)/onHand(핸드마다)/onLose(졌을 때) 훅이 {chips|mult|xmult|gold}를 돌려준다.
'use strict';

const RAR_NAME={1:'COMMON',2:'UNCOMMON',3:'RARE'};
// 이름(name)과 설명(desc)은 언어별 파일(js/i18n/*.js)에 있고, localizeData()가 채운다.
// perCard(card, ctx, self) / onHand(ctx, self) → {chips|mult|xmult|gold} | falsy
const CHARMS=[
  // ---- 일반: 문양·숫자 (맞는 카드가 덱에 많을수록 강해짐) ----
  {id:'heart',glyph:'♥',rar:1,price:4,want:{s:'♥'},perCard:c=>c.s==='♥'&&{mult:3}},
  {id:'diamond',glyph:'♦',rar:1,price:4,want:{s:'♦'},perCard:c=>c.s==='♦'&&{chips:25}},
  {id:'club',glyph:'♣',rar:1,price:4,want:{s:'♣'},perCard:c=>c.s==='♣'&&{gold:2}},
  {id:'face',glyph:'K',rar:1,price:4,want:{r:['J','Q','K']},perCard:c=>isFace(c)&&{chips:25}},
  {id:'seven',glyph:'7',rar:1,price:4,want:{r:['7']},perCard:c=>c.r==='7'&&{mult:7}},
  {id:'lowball',glyph:'⌄',rar:1,price:4,want:{r:['2','3','4','5']},perCard:c=>['2','3','4','5'].includes(c.r)&&{chips:20}},
  // ---- 일반: 손패 조건 ----
  {id:'coward',glyph:'≤17',rar:1,price:4,onHand:x=>x.total<=17&&{mult:8}},
  {id:'collector',glyph:'≡',rar:1,price:4,want:{r:['2','3','4']},onHand:x=>({chips:6*x.cards.length})},
  {id:'streak',glyph:'≫',rar:1,price:4,onHand:x=>x.streak>0&&{mult:Math.min(8,x.streak)}},
  {id:'even',glyph:'2n',rar:1,price:4,onHand:x=>x.total%2===0&&{chips:40}},
  {id:'odd',glyph:'2n+1',rar:1,price:4,onHand:x=>x.total%2===1&&{mult:3}},
  {id:'house',glyph:'⌂',rar:1,price:4,onHand:x=>({chips:x.dealerTotal})},
  {id:'dealerup',glyph:'◐',rar:1,price:4,onHand:x=>{const u=rankVal(x.dealer[0]);return u>=2&&u<=6&&{mult:4};}},
  {id:'rich',glyph:'$',rar:1,price:4,onHand:x=>S.gold>=5&&{mult:Math.floor(S.gold/5)}},
  {id:'bigdeck',glyph:'▤',rar:1,price:4,want:{any:true},onHand:x=>S.myDeck.length>44&&{chips:(S.myDeck.length-44)*2}},
  {id:'firsthand',glyph:'Ⅰ',rar:1,price:4,onHand:x=>x.firstHand&&{xmult:4}},
  // ---- 일반: 돈·보조 ----
  {id:'piggy',glyph:'¤',rar:1,price:4},
  {id:'loser',glyph:'♔',rar:1,price:4,onLose:x=>({gold:2})},
  {id:'xray',glyph:'◉',rar:1,price:4,onHand:x=>x.result==='dealerbust'&&{mult:3}},
  {id:'insure',glyph:'☂',rar:1,price:4},
  {id:'pushmaster',glyph:'=',rar:1,price:4},
  {id:'ashes',glyph:'♨',rar:1,price:4,want:{s:'♥'},onLose:x=>{if(x.result!=='bust')return false;const c=x.cards.filter(c=>c.s==='♥').reduce((a,c)=>a+chipValue(c),0);return c>0&&{chips:c,mult:4};}},
  // ---- 고급 ----
  {id:'spade',glyph:'♠',rar:2,price:6,want:{s:'♠'},perCard:c=>c.s==='♠'&&{xmult:1.6}},
  {id:'ace',glyph:'A',rar:2,price:6,want:{r:['A']},perCard:c=>c.r==='A'&&{xmult:2}},
  {id:'grow',glyph:'↑',rar:2,price:6,onHand:(x,me)=>{me.val+=1;return{mult:me.val};}},
  {id:'gambler',glyph:'⚀',rar:2,price:6,onLose:(x,me)=>{if(x.result==='bust'){me.val+=3;return{note:t('ch.gambler.note',{v:me.val})};}return false;},onHand:(x,me)=>me.val>0&&{mult:me.val}},
  {id:'curse',glyph:'☠',rar:2,price:6,onHand:x=>x.result==='dealerbust'&&{xmult:3.5}},
  {id:'doubler',glyph:'×2',rar:2,price:6,onHand:x=>x.doubled&&{xmult:5}},
  {id:'soft',glyph:'≀',rar:2,price:6,want:{r:['A']},onHand:x=>x.soft&&{xmult:3.5}},
  {id:'mirror',glyph:'⧉',rar:2,price:6,onHand:x=>{const m={};for(const c of x.cards){const v=rankVal(c);m[v]=(m[v]||0)+1;}return Object.values(m).some(v=>v>=2)&&{xmult:4};}},
  {id:'slim',glyph:'≈',rar:2,price:6,want:{slim:true},onHand:x=>S.myDeck.length<=46&&{mult:4}},
  {id:'last',glyph:'Ω',rar:2,price:6,onHand:x=>x.handsLeft<=2&&{xmult:3.5}},
  {id:'goldfinger',glyph:'✦',rar:2,price:6,want:{enh:'gold'},perCard:c=>c.enh==='gold'&&{xmult:2.5}},
  {id:'glassheart',glyph:'◇',rar:1,price:4,want:{enh:'glass'}},
  {id:'usury',glyph:'%',rar:1,price:4},
  {id:'magician',glyph:'♧',rar:1,price:4},
  // ---- 희귀 ----
  {id:'exact',glyph:'21',rar:3,price:8,onHand:x=>x.total===21&&{xmult:x.cards.length>=3?8:5}},
  {id:'charlie',glyph:'5',rar:3,price:8,want:{r:['2','3','4']},onHand:x=>x.cards.length>=3&&{xmult:x.result==='charlie'?8:x.cards.length>=4?5:3}},
  {id:'flush',glyph:'♤♡',rar:3,price:8,want:{flush:true},onHand:x=>x.cards.length>=2&&x.cards.every(c=>c.s===x.cards[0].s)&&{xmult:x.cards.length>=3?12:6}},
];
