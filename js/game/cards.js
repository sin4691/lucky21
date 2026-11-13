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
  gold:{tag:'金'},
  glass:{tag:'琉'},
  gem:{tag:'寶'},
  lucky:{tag:'福'},
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

const WIN_SET=new Set(['bj','win','dealerbust','charlie']);
