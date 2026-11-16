// 판 전체 봇: 측정된 부적 세기(charm-power.json)를 보고 사고, 맞춤 카드를 사고, 낮은 카드를 정리한다.
var CAP=[];var HANDS=6;
var UTIL={piggy:1.3,loser:1.2,club:1.2,usury:1.15,magician:1.05,insure:1.15,pushmaster:1.1,glassheart:1.0};
function val(d){const s=SOLO[d.id];return Math.max(s.gain,s.sup||0,UTIL[d.id]||0);}
function wantedCard2(w){
  if(w.s)return mkCard(rnd(RANKS),w.s);
  if(w.r)return mkCard(rnd(w.r),rnd(SUITS));
  if(w.flush){const n={};for(const c of S.myDeck)n[c.s]=(n[c.s]||0)+1;const s=Object.keys(n).sort((a,b)=>n[b]-n[a])[0];return mkCard(rnd(RANKS),s);}
  if(w.enh)return mkCard(rnd(RANKS),rnd(SUITS),w.enh);return null;}
function shop(){
  const pool=CHARMS.filter(c=>!S.charms.some(x=>x.id===c.id));const w={1:6,2:3,3:1};const offers=[];
  const roll=()=>{offers.length=0;const p=[...pool];while(offers.length<3&&p.length){const tot=p.reduce((a,c)=>a+w[c.rar],0);let r=Math.random()*tot;const i=p.findIndex(c=>(r-=w[c.rar])<0);offers.push(p.splice(i<0?0:i,1)[0]);}};
  roll();
  for(let pass=0;pass<2;pass++){
    for(const d of offers.sort((a,b)=>val(b)-val(a))){
      if(S.gold<d.price||S.charms.some(c=>c.id===d.id))continue;
      if(S.charms.length<5){S.gold-=d.price;S.charms.push(makeC(d));continue;}
      const worst=[...S.charms].sort((a,b)=>val(a)-val(b))[0];
      if(val(d)>val(worst)+0.4){S.charms=S.charms.filter(c=>c!==worst);S.gold+=Math.floor(worst.price/2);S.gold-=d.price;S.charms.push(makeC(d));}
    }
    if(pass===0&&S.gold>=14){S.gold-=2;roll();}else break;
  }
  // 카드: 상점과 같은 규칙으로 맞춤 카드를 진열하고, 맞는 카드만 산다
  const wants=S.charms.filter(c=>c.want&&!c.want.slim&&!c.want.any).map(c=>c.want);
  for(let i=0;i<3;i++){
    let card=null,match=false;
    if(wants.length&&Math.random()<.7){card=wantedCard2(rnd(wants));match=!!card;}
    if(!card){const e=Math.random()<.45?rnd(ENH_KEYS):null;card=mkCard(rnd(RANKS),rnd(SUITS),e);}
    const price=card.enh?4:2;
    if((match||card.enh==='gold'||card.enh==='glass')&&S.gold>=price+3){S.gold-=price;S.myDeck.push(card);}
  }
  // 제거: 부적과 상관없는 낮은 카드 정리
  if(S.gold>=8&&S.myDeck.length>40){const keep=c=>wants.some(w=>(w.s&&c.s===w.s)||(w.r&&w.r.includes(c.r)));const low=S.myDeck.filter(c=>['2','3','4'].includes(c.r)&&!keep(c)).slice(0,3);
    if(low.length){S.gold-=4;S.myDeck=S.myDeck.filter(c=>!low.includes(c));}}
  // 강화권
  if(S.gold>=10){const tgt=S.myDeck.find(c=>!c.enh&&rankVal(c)===10);if(tgt){S.gold-=4;tgt.enh=rnd(['gold','glass','gem']);}}
}
function oneRun(){
  S={myDeck:newDeck(),draw:[],shoe:newDeck(),charms:[],gold:6,streak:0,handNo:0,handsLeft:HANDS,insuranceUsed:false,boss:null};
  for(let st=1;st<=FINAL_STAGE;st++){
    const target=targetOf(st),boss=isBossStage(st);
    S.draw=shuffle(S.myDeck.map(c=>({...c})));S.shoe=newDeck();S.insuranceUsed=false;
    let score=0,h=0,full=0,done=-1;
    // 보스 규칙은 개별로 넣지 않고 점수 20% 감소로 근사
    for(h=0;h<HANDS;h++){S.handsLeft=HANDS-h;S.handNo=h;const o=playHand(S);const p=o.pts*(boss?0.8:1);full+=p;if(done<0){score+=p;S.gold+=o.gold;if(score>=target)done=h;}}
    (CAP[st]=CAP[st]||[]).push(full);
    if(done>=0)h=done;
    if(score<target)return st;
    const left=HANDS-h-1;
    S.gold+=(boss?6:4)+left+Math.min(S.charms.some(c=>c.id==='usury')?10:5,Math.floor(S.gold/5))+(S.charms.some(c=>c.id==='piggy')?3:0);
    if(st<FINAL_STAGE)shop();
  }
  return FINAL_STAGE+1;
}
function runMany(N){const reach=new Array(FINAL_STAGE+2).fill(0);for(let i=0;i<N;i++)reach[oneRun()]++;
  const surv=[];let alive=N;for(let st=1;st<=FINAL_STAGE;st++){surv.push(+(alive/N).toFixed(2));alive-=reach[st];}
  const capacity=CAP.slice(1).map(a=>{a.sort((x,y)=>x-y);return [5,10,25,50].map(q=>Math.round(a[Math.floor(a.length*q/100)]));});
  return {clear:reach[FINAL_STAGE+1]/N,survive:surv,targets:TARGETS,capacity};}
