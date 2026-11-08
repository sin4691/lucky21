// 게임 진행: 스테이지·핸드·히트/스탠드/더블·딜러 턴·트릭 카드·점수 계산 시퀀스.
'use strict';

/* ---------------- flow ---------------- */
function startStage(){
  S.boss=S.nextBoss;S.target=targetOf(S.stage);S.handNo=0;
  if(hasCharm('magician')&&S.tricks.length<2){const t=rnd(TRICKS);S.tricks.push(t);setTimeout(()=>toast(`마술사의 모자: ${t.name} 획득`),300);}
  S.handsLeft=5-(S.boss?.id==='thin'?1:0);S.score=0;S.draw=shuffle([...S.myDeck]);S.discard=[];S.shoe=newDeck();S.insuranceUsed=false;
  S.player=[];S.dealer=[];S.pEls=[];S.dEls=[];
  $('#pHand').innerHTML='';$('#dHand').innerHTML='';$('#pTot').textContent='';$('#dTot').textContent='';
  renderSide();renderCharms();setCM(0,0);
  const bossHtml=S.boss?`<div class="next" style="margin-top:12px"><span class="bn">보스 · ${S.boss.name}</span><br>${S.boss.desc}</div>`:'';
  openPanel(`<div class="sub">${S.stage>8?`ENDLESS · STAGE ${S.stage}`:`STAGE ${S.stage} / 8`}</div><h2>${S.boss?'보스 스테이지':'스테이지 '+S.stage}</h2>
    <p>핸드 <b>${S.handsLeft}</b>번 안에 <b class="gold">${fmt(S.target)}</b>점을 넘기세요.</p>${bossHtml}
    <div class="actions"><button class="btn" id="goStage">딜 시작</button></div>`);
  $('#goStage').onclick=()=>{sfx.click();sfx.shuffle();closePanel();startHand();};
  snapshot('hand');
}
async function startHand(){
  S.busy=true;updateButtons();hideBanner();
  S.discard.push(...S.player.filter(c=>!c.broken));
  await clearTable();
  S.player=[];S.dealer=[];S.pEls=[];S.dEls=[];S.doubled=false;S.holeRevealed=false;pitch=0;
  setCM(0,0);updateTotals();
  if(S.shoe.length<10)S.shoe=newDeck();
  await deal('p');await deal('d',S.boss?.id==='masked');await deal('p');await deal('d',true);
  const p=total(S.player).t,d=total(S.dealer).t;
  if(p===21)return finish(d===21?'push':'bj');
  if(d===21)return finish('lose');
  S.busy=false;updateButtons();
  await tutStep('play',[
    {target:['#pHand','#bustP'],title:'목표: 딜러보다 21에 가깝게',html:`내 카드 합이 <b>21을 넘으면 버스트</b>로 바로 져요. 아래 <b>버스트 확률</b>은 남은 내 덱을 기준으로 다음 카드에 21을 넘을 확률이에요.`},
    {target:['#dHand','#dTot'],title:'딜러는 규칙대로만 움직여요',html:`딜러는 카드 1장을 숨기고 시작해서, <b>17 이상이 될 때까지</b> 무조건 카드를 받아요. 딜러가 21을 넘기면 내가 이겨요.`},
    {target:'#controls',title:'이번 판은 직접 결정하세요',html:`<b>히트</b>: 한 장 더 받기 · <b>스탠드</b>: 지금 합으로 승부 · <b>더블</b>: 첫 두 장일 때 딱 한 장만 더 받고, 이기면 점수 2배. 키보드 H / S / D도 돼요.`},
  ]);
}
async function onHit(){
  if(S.busy||S.coaching)return;S.busy=true;updateButtons();sfx.click();
  await deal('p');return afterPlayerDraw();
}
async function onStand(){if(S.busy||S.coaching)return;S.busy=true;updateButtons();sfx.click();dealerTurn();}
async function onDouble(){
  if(S.busy||S.coaching||S.player.length!==2||S.boss?.id==='nodouble')return;S.busy=true;S.doubled=true;updateButtons();
  pop($('#btnDouble'),'더블다운!','xmult',-10);sfx.xmult();
  await deal('p');
  if(total(S.player).t>21)return finish('bust');
  dealerTurn();
}
async function dealerTurn(){
  await reveal();
  const standAt=S.boss?.id==='stiff'?18:17;
  const pt=total(S.player).t;
  while(total(S.dealer).t<standAt){
    if(S.boss?.id==='smart'&&total(S.dealer).t>pt)break;
    await sleep(200);await deal('d');
  }
  const p=total(S.player).t,d=total(S.dealer).t;
  if(d>21)return finish('dealerbust');
  finish(p>d?'win':p<d?'lose':'push');
}
async function useTrick(i){
  const t=S.tricks[i];if(!t||S.coaching||$('#overlay').classList.contains('on'))return;
  const myTurn=!S.busy&&S.player.length>=2;
  const el=document.querySelector(`#charmBar .trick[data-id="${t.id}"]`);
  const consume=msg=>{S.tricks.splice(i,1);hideTip();renderCharms();sfx.buy();if(el)pop(el,msg,'info');};
  if(t.id==='stall'){if(S.busy&&S.player.length){toast('핸드가 끝난 뒤에 쓸 수 있어요');return;}S.handsLeft++;renderSide();consume('핸드 +1');return;}
  if(!myTurn){toast('내 차례(히트/스탠드 선택 중)에 쓸 수 있어요');return;}
  if(!S.draw.length){S.draw=shuffle(S.discard);S.discard=[];}
  if(t.id==='peek'){S.peek=true;consume('다음 카드 공개');updateButtons();return;}
  if(t.id==='ten'){
    const idx=S.draw.findIndex(c=>rankVal(c)===10);
    if(idx<0){toast('남은 덱에 10계열 카드가 없어요');return;}
    const [c]=S.draw.splice(idx,1);S.draw.push(c);S.peek=true;consume('다음 카드 = 10');updateButtons();return;
  }
  if(t.id==='mulligan'){
    if(S.player.length!==2){toast('첫 두 장일 때만 쓸 수 있어요');return;}
    consume('다시 딜');S.busy=true;updateButtons();startHand();return;
  }
  if(t.id==='swap'){
    consume('바꿔치기');S.busy=true;updateButtons();
    const c=S.player.pop(),cel=S.pEls.pop();S.discard.push(c);
    cel.classList.add('leave');await sleep(280);cel.remove();updateTotals();
    await deal('p');return afterPlayerDraw();
  }
}
async function afterPlayerDraw(){
  const t=total(S.player).t;
  if(t>21)return finish('bust');
  if(hasCharm('charlie')&&S.player.length>=5){await charmFlash('charlie','찰리!');return finish('charlie');}
  if(t===21)return dealerTurn();
  S.busy=false;updateButtons();
}
async function charmFlash(id,text){
  const el=document.querySelector(`#charmBar .charm[data-id="${id}"]`);if(!el)return;
  el.classList.remove('trig');void el.offsetWidth;el.classList.add('trig');pop(el,text,'info',-6);sfx.gold();await sleep(520);
}
function showBanner(result){
  const b=$('#banner');b.className='';b.querySelector('.res').textContent=RESULT_TXT[result];b.querySelector('.pts').textContent='';
  void b.offsetWidth;b.classList.add('on',WIN_SET.has(result)?'win':result==='push'?'push':'lose');
}
function hideBanner(){$('#banner').classList.remove('on');}

async function finish(result){
  S.busy=true;updateButtons();
  await reveal();
  if(result==='bust'&&hasCharm('insure')&&!S.insuranceUsed){S.insuranceUsed=true;showBanner('bust');await charmFlash('insure','보험 발동!');result='push';}
  if(result==='push'&&hasCharm('pushmaster')){showBanner('push');await charmFlash('pushmaster','푸시 → 승리');result='win';}
  if(result==='bj'&&S.boss?.id==='nobj'){showBanner('bj');await sleep(400);toast('블랙잭 금지령: 일반 승리로 처리');result='win';}
  showBanner(result);
  if(WIN_SET.has(result)){S.streak++;}else if(result!=='push'){S.streak=0;}
  if(result==='bj')burst(innerWidth/2,innerHeight/2,50,['#e8c46a','#fff','#7fe0d4'],8);
  await scoreHand(result);
  S.handsLeft--;S.handNo++;renderSide();
  const box=$('#cmWrap').closest('.box');
  await tutStep('score',[
    {target:box,title:'점수 = 칩 × 배수',html:WIN_SET.has(result)||result==='push'
      ?`이기면 <span class="c">칩</span>(내 카드 숫자의 합 + 기본 칩)에 <span class="m">배수</span>를 곱한 만큼 점수가 들어와요. 블랙잭은 기본값이 훨씬 커요.`
      :`졌을 땐 점수가 없어요. 이기면 <span class="c">칩</span>(내 카드 숫자의 합 + 기본 칩)에 <span class="m">배수</span>를 곱한 만큼 점수가 들어와요.`},
    {target:'.scorebox',title:'핸드 안에 목표 점수 넘기기',html:`스테이지마다 <b>핸드 ${S.boss?.id==='thin'?4:5}번</b>이 주어져요. 그 안에 목표 점수를 넘기면 클리어하고, 남은 핸드는 골드로 바뀌어요.`},
  ]);
  await sleep(650);
  if(S.score>=S.target)return stageClear();
  if(S.handsLeft<=0)return gameOver();
  snapshot('hand');
  startHand();
}

function trigCharm(id){const el=document.querySelector(`#charmBar .charm[data-id="${id}"]`);if(el){el.classList.remove('trig');void el.offsetWidth;el.classList.add('trig');}return el;}
async function scoreHand(result){
  const win=WIN_SET.has(result),push=result==='push';
  let chips=0,mult=0;
  const ctx={result,cards:S.player,dealer:S.dealer,total:total(S.player).t,dealerTotal:total(S.dealer).t,doubled:S.doubled,lastHand:S.handsLeft===1,streak:S.streak,soft:total(S.player).soft&&total(S.player).t<=21,firstHand:S.handNo===0};
  const apply=(e,el)=>{
    if(e.chips){chips+=e.chips;pop(el,`+${e.chips}`,'chip');sfx.chip();}
    if(e.mult){mult+=e.mult;pop(el,`+${e.mult} 배수`,'mult');sfx.mult();}
    if(e.xmult){mult*=e.xmult;pop(el,`×${e.xmult}`,'xmult');sfx.xmult();shake(false);}
    if(e.gold){S.gold+=e.gold;pop(el,`+${e.gold}G`,'gold',-26);sfx.gold();renderSide();}
    if(e.note){pop(el,e.note,'info',-26);sfx.gold();}
    setCM(chips,mult);
  };

  // ---- 패배 루트 ----
  if(!win&&!push){
    sfx.lose();shake(false);setCM(0,0);await sleep(350);
    if(S.boss?.id==='tax'&&S.gold>0){S.gold--;pop($('#goldV'),'-1G 세금','mult');renderSide();await sleep(300);}
    for(const ch of S.charms){
      if(!ch.onLose)continue;const e=ch.onLose(ctx,ch);if(!e)continue;
      apply(e,trigCharm(ch.id)||$('#cmM'));await sleep(380);
    }
    if(chips*mult>0)return award(chips,mult);
    await sleep(250);return 0;
  }

  if(result==='bj'){chips=25;mult=4;}else if(win){chips=10;mult=2;}else{chips=0;mult=1;}
  setCM(chips,mult);await sleep(380);
  // 1) 카드별: 칩 → 강화 → 부적
  for(let i=0;i<S.player.length;i++){
    const c=S.player[i],el=S.pEls[i];
    el.classList.add('lift');
    const v=chipValue(c);chips+=v;pop(el,`+${v}`,'chip');sfx.chip();setCM(chips,mult);
    await sleep(230);
    const sealed=S.boss?.id==='heartseal'&&c.s==='♥';
    if(win&&!sealed){
      if(c.enh==='gold'){apply({mult:4},el);await sleep(280);}
      else if(c.enh==='gem'){apply({chips:30},el);await sleep(280);}
      else if(c.enh==='glass'){apply({xmult:2},el);await sleep(280);if(Math.random()<.25&&!hasCharm('glassheart'))c.broken=true;}
      else if(c.enh==='lucky'){
        let hit=false;
        if(Math.random()<.2){apply({mult:20},el);hit=true;await sleep(280);}
        if(Math.random()<.15){apply({gold:4},el);hit=true;await sleep(280);}
        if(hit){const p=center(el);burst(p.x,p.top,18,['#7fd47f','#d6ffd0','#e8c46a'],5);}
      }
      for(const ch of S.charms){
        if(!ch.perCard)continue;const e=ch.perCard(c,ctx,ch);if(!e)continue;
        trigCharm(ch.id);apply(e,el);await sleep(300);
      }
    }
    el.classList.remove('lift');
  }
  // 2) 핸드 전체 부적
  if(win){
    for(const ch of S.charms){
      if(!ch.onHand)continue;const e=ch.onHand(ctx,ch);if(!e)continue;
      apply(e,trigCharm(ch.id)||$('#cmM'));await sleep(360);
    }
  }
  // 3) 더블
  if(S.doubled){mult*=2;pop($('#cmM'),'더블 ×2','xmult');sfx.xmult();setCM(chips,mult);await sleep(380);}
  // 4) 유리 파괴
  const broken=S.player.map((c,i)=>[c,S.pEls[i]]).filter(([c])=>c.broken);
  for(const [c,el] of broken){
    S.myDeck=S.myDeck.filter(x=>x.id!==c.id);
    const p=center(el);burst(p.x,p.y,40,['#dff6ff','#9fd8ea','#ffffff'],7);noise(.25,.25,5000);
    pop(el,'유리 카드 파괴','info',-20);el.classList.add('shatter');await sleep(420);
  }
  return award(chips,mult);
}
async function award(chips,mult){
  const pts=Math.floor(chips*mult);
  const heat=pts/S.target;
  $('#cmWrap').classList.toggle('hot',heat>.5);
  const b=$('#banner');b.querySelector('.pts').textContent='+'+fmt(pts);
  if(heat>.6){sfx.big();shake(true);const c=center(b);burst(c.x,c.y,70,['#e8c46a','#fff3c4','#ff8a5c','#ffd36b'],10);}
  else{sfx.win();const c=center(b);burst(c.x,c.y,26);}
  await sleep(300);
  await flyDots(b,$('#scoreV'),Math.min(18,6+Math.floor(heat*12)));
  const from=S.score;S.score+=pts;S.bestHand=Math.max(S.bestHand,pts);
  bump($('#scoreV'));await countTo($('#scoreV'),from,S.score,500);
  renderSide();
  setTimeout(()=>$('#cmWrap').classList.remove('hot'),900);
  return pts;
}
