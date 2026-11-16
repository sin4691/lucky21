// 밸런스 시뮬레이터 공통부: 애니메이션 없이 한 핸드를 끝까지 진행하고 점수를 계산한다.
// 게임의 점수 규칙(js/game/flow.js의 scoreHand)과 같은 순서: 카드 칩 → 강화 → 카드별 부적 → 핸드 부적 → 더블.
// 플레이 전략은 기본 전략: 10·11 더블, 하드 17 / 소프트 19 스탠드, 딜러 2~6이면 13부터 스탠드.
var hasCharm=id=>S.charms.some(c=>c.id===id);
function makeC(d){return {...d,val:0};}
function playHand(S){
  if(S.draw.length<8){S.draw=shuffle(S.myDeck.map(c=>({...c})));}
  if(S.shoe.length<10)S.shoe=newDeck();
  const P=[S.draw.pop(),S.draw.pop()],D=[S.shoe.pop(),S.shoe.pop()];
  let doubled=false,res=null;
  const up=rankVal(D[0]);
  const pt=()=>total(P);
  if(pt().t===21&&P.length===2)res='bj';
  if(!res){
    const p=pt();
    if((p.t===10||p.t===11)&&up<=9&&!(S.boss&&S.boss.id==='nodouble')){doubled=true;P.push(S.draw.pop());}
    else{
      while(true){const q=pt();
        if(q.t>21)break;
        if(P.length>=5&&hasCharm('charlie')){res='charlie';break;}
        if(q.t>=17&&!q.soft)break;if(q.soft&&q.t>=19)break;if(q.t>=13&&up<=6&&!q.soft)break;
        P.push(S.draw.length?S.draw.pop():(S.draw=shuffle(S.myDeck.map(c=>({...c}))),S.draw.pop()));
      }
    }
    if(!res){
      if(pt().t>21)res='bust';
      else{while(total(D).t<17)D.push(S.shoe.pop());
        const d=total(D).t,p=pt().t;
        res=d>21?'dealerbust':p>d?'win':p===d?'push':'lose';}
    }
  }
  if(res==='bust'&&hasCharm('insure')&&!S.insuranceUsed){S.insuranceUsed=true;res='push';}
  if(res==='push'&&hasCharm('pushmaster'))res='win';
  const win=WIN_SET.has(res),push=res==='push';
  if(win)S.streak++;else if(!push)S.streak=0;
  const x={result:res,cards:P,dealer:D,total:total(P).t,dealerTotal:total(D).t,doubled,lastHand:S.handsLeft===1,handsLeft:S.handsLeft,streak:S.streak,soft:total(P).soft&&total(P).t<=21,firstHand:S.handNo===0};
  let chips=0,mult=0,gold=0;
  const ap=e=>{if(!e)return;if(e.chips)chips+=e.chips;if(e.mult)mult+=e.mult;if(e.xmult)mult*=e.xmult;if(e.gold)gold+=e.gold;};
  if(!win&&!push){for(const c of S.charms)if(c.onLose)ap(c.onLose(x,c));return {pts:Math.floor(chips*mult),gold,win};}
  chips=0;mult=res==='bj'?4:win?2:1;
  for(const c of P){chips+=chipValue(c);
    if(win){if(c.enh==='gold')mult+=4;else if(c.enh==='gem')chips+=30;else if(c.enh==='glass')mult*=2;
      for(const ch of S.charms)if(ch.perCard)ap(ch.perCard(c,x,ch));}}
  if(win)for(const ch of S.charms)if(ch.onHand)ap(ch.onHand(x,ch));
  if(doubled)mult*=2;
  return {pts:Math.floor(chips*mult),gold,win};
}
// 스테이지 1개를 여러 번 돌려 핸드당 평균 점수·골드
function runSet(charmIds,N,deckFn,hands=6){
  let pts=0,gold=0,n=0,wins=0;
  for(let r=0;r<N;r++){
    S={myDeck:deckFn?deckFn():newDeck(),draw:[],shoe:newDeck(),charms:charmIds.map(id=>makeC(CHARMS.find(c=>c.id===id))),gold:8,streak:0,handNo:0,handsLeft:hands,insuranceUsed:false,boss:null};
    S.draw=shuffle(S.myDeck.map(c=>({...c})));
    for(let h=0;h<hands;h++){S.handsLeft=hands-h;S.handNo=h;const o=playHand(S);pts+=o.pts;gold+=o.gold;wins+=o.win;n++;}
    for(const c of S.charms)if(c.id==='piggy')gold+=3;
  }
  return {ppH:pts/n,gpH:gold/n,wr:wins/n};
}
// 부적이 원하는 카드를 넣은 '지원받은 덱' (상점 맞춤 진열을 몇 번 거친 상태 가정)
function supportedDeck(w){
  const d=newDeck();
  if(!w)return d;
  if(w.s||w.flush){const s=w.s||'♥';let n=0;for(const c of d)if(c.s==='♣'&&n<13){c.s=s;n++;}return d;}
  if(w.enh){let n=0;for(const c of shuffle([...d]))if(n<8){c.enh=w.enh;n++;}return d;}
  if(w.r){for(let i=0;i<8;i++)d.push(mkCard(w.r[i%w.r.length],SUITS[i%4]));return d;}
  if(w.slim){d.splice(0,8);return d;}
  if(w.any){for(let i=0;i<8;i++)d.push(mkCard(RANKS[i],SUITS[i%4]));return d;}
  return d;
}
function measure(N){
  const base=runSet([],N);
  const out={base,charms:{}};
  for(const c of CHARMS){const m=runSet([c.id],Math.floor(N/5));let sup=null;
    if(c.want){const dk=()=>supportedDeck(c.want);const b2=runSet([],Math.floor(N/5),dk),m2=runSet([c.id],Math.floor(N/5),dk);sup=m2.ppH/b2.ppH;}
    out.charms[c.id]={rar:c.rar,price:c.price,ppH:m.ppH,gain:m.ppH/base.ppH,sup,gpH:m.gpH,wr:m.wr};}
  return out;
}
