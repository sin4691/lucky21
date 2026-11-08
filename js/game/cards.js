// 블랙잭 규칙: 덱, 카드 값, 합계(소프트 에이스), 칩 값, 카드 강화, 결과 종류.
'use strict';

/* ---------------- cards ---------------- */
const SUITS=['♠','♥','♦','♣'],RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const isRed=c=>c.s==='♥'||c.s==='♦';
const isFace=c=>c.r==='J'||c.r==='Q'||c.r==='K';
let UID=0;
const mkCard=(r,s,enh=null)=>({r,s,enh,id:UID++});
function newDeck(){const d=[];for(const s of SUITS)for(const r of RANKS)d.push(mkCard(r,s));return shuffle(d);}
const SUIT_ORDER={'♠':0,'♥':1,'♦':2,'♣':3},RANK_ORDER=Object.fromEntries(RANKS.map((r,i)=>[r,i]));
const sortCards=a=>[...a].sort((x,y)=>SUIT_ORDER[x.s]-SUIT_ORDER[y.s]||RANK_ORDER[x.r]-RANK_ORDER[y.r]);
const ENH={
  gold:{name:'금박',tag:'金',desc:'이긴 핸드에서 배수 +4'},
  glass:{name:'유리',tag:'琉',desc:'이긴 핸드에서 배수 ×2, 25% 확률로 깨짐'},
  gem:{name:'보석',tag:'寶',desc:'이긴 핸드에서 칩 +30'},
  lucky:{name:'행운',tag:'福',desc:'이긴 핸드에서 20% 확률 배수 +20, 15% 확률 골드 +4'},
};
const ENH_KEYS=Object.keys(ENH);
function rankVal(c){if(c.r==='A')return 11;if(isFace(c))return 10;return +c.r;}
function total(cards){let t=0,a=0;for(const c of cards){t+=rankVal(c);if(c.r==='A')a++;}while(t>21&&a){t-=10;a--;}return{t,soft:a>0};}
function chipValue(c){
  if(S.boss?.id==='shadow'&&isFace(c))return 0;
  if(S.boss?.id==='heartseal'&&c.s==='♥')return 0;
  if(S.boss?.id==='halfchip')return Math.floor(rankVal(c)/2);
  return rankVal(c);
}

const RESULT_TXT={bj:'블랙잭!',win:'승리',dealerbust:'딜러 버스트!',charlie:'다섯 장 찰리!',push:'푸시',lose:'패배',bust:'버스트'};
const WIN_SET=new Set(['bj','win','dealerbust','charlie']);
