// 스테이지 클리어 보상과 상점 (부적·카드·강화·제거·트릭 카드).
'use strict';

/* ---------------- stage clear / shop ---------------- */
async function stageClear(){
  hideBanner();sfx.big();burst(innerWidth/2,innerHeight*.4,90,['#e8c46a','#fff3c4','#7fe0d4','#ff8a5c'],11);shake(true);
  await sleep(500);
  if(S.stage===8&&!S.endless)return victory();
  if(S.boss)achEvent('bossClear');
  const cap=hasCharm('usury')||S.richDeck?10:5;
  const rows=[[S.boss?'보스 클리어':'스테이지 클리어',S.boss?6:4],[`남은 횟수 ${S.handsLeft}`,S.handsLeft],[`이자 (5골드당 1, 최대 ${cap})`,Math.min(cap,Math.floor(S.gold/5))]];
  if(hasCharm('piggy'))rows.push(['돼지 저금통',3]);
  const sum=rows.reduce((a,r)=>a+r[1],0);
  openPanel(`<div class="sub">STAGE ${S.stage} CLEAR</div><h2>${fmt(S.score)} / ${fmt(S.target)}</h2>
    <div class="reward">${rows.map(r=>`<div class="ln"><span>${r[0]}</span><b>+${r[1]}G</b></div>`).join('')}
    <div class="ln sum"><span>합계</span><b>+${sum}G</b></div></div>
    <div class="actions"><button class="btn" id="toShop" disabled>상점으로</button></div>`);
  const lns=[...document.querySelectorAll('.reward .ln')];
  for(const l of lns){await sleep(220);l.classList.add('on');sfx.gold();}
  S.gold+=sum;renderSide();
  if(!(S.stage===8&&!S.endless))snapshot('clear');
  const btn=$('#toShop');btn.disabled=false;btn.onclick=()=>{sfx.click();openShop();};
}
function rollOffers(){
  const pool=CHARMS.filter(c=>!hasCharm(c.id)&&(S.demo||isCharmUnlocked(c.id)));const out=[];
  const w={1:6,2:3,3:1};
  while(out.length<3&&pool.length){
    const tot=pool.reduce((a,c)=>a+w[c.rar],0);let r=Math.random()*tot;
    const i=pool.findIndex(c=>(r-=w[c.rar])<0);out.push(pool.splice(i<0?0:i,1)[0]);
  }
  return out.map(d=>({def:d,sold:false}));
}
function rollCardOffers(){
  const out=[];
  for(let i=0;i<2;i++){
    const enh=Math.random()<.55?rnd(ENH_KEYS):null;
    const card=mkCard(rnd(RANKS),rnd(SUITS),enh);
    out.push({kind:'card',card,price:enh?4:2,sold:false});
  }
  out.push({kind:'enh',enh:rnd(ENH_KEYS),price:4,sold:false});
  out.push({kind:'remove',price:4,sold:false});
  return out;
}
function rollTrickOffers(){return shuffle([...TRICKS]).slice(0,2).map(t=>({t,sold:false}));}
function openShop(){
  S.stage++;S.nextBoss=pickBoss(S.stage);S.rerollCost=2;S.offers=rollOffers();S.cardOffers=rollCardOffers();S.trickOffers=rollTrickOffers();renderShop();
}
function renderShop(){
  const nb=S.nextBoss;
  openPanel(`<div class="shop-head"><div><div class="sub">SHOP</div><h2>상점</h2></div><div class="purse">${S.gold}G</div></div>
    <div class="sec">부적 · ${S.charms.length}/5</div>
    <div class="offers" id="offers"></div>
    <div class="actions" style="justify-content:flex-start;margin-top:0"><button class="btn teal small" id="reroll">부적 새로고침 ${S.rerollCost}G</button></div>
    <div class="splitrow"><div><div class="sec">카드 · 내 덱 ${S.myDeck.length}장 <button class="linkbtn" id="shopDeck" style="margin-left:8px">덱 보기</button></div>
    <div class="cardoffers" id="cardOffers"></div></div>
    <div><div class="sec">트릭 카드 · 1회용 · 보유 ${S.tricks.length}/2</div>
    <div class="cardoffers" id="trickOffers"></div></div></div>
    <hr><div class="k">보유 부적 · 판매하면 구매가의 절반을 돌려받아요</div>
    <div class="owned" id="owned"></div><hr>
    <div class="next">다음 · <b>스테이지 ${S.stage}</b> · 목표 <b class="gold">${fmt(targetOf(S.stage))}</b>${nb?` · <span class="bn">보스: ${nb.name}</span> — ${nb.desc}`:''}</div>
    <div class="actions"><button class="btn" id="nextStage">다음 스테이지 →</button></div>`,'shopv');
  const box=$('#offers');
  S.offers.forEach(o=>{
    const d=o.def;const div=document.createElement('div');div.className='offer'+(o.sold?' sold':'');
    div.appendChild(charmEl(makeCharm(d),true));
    div.insertAdjacentHTML('beforeend',`<div class="rar r${d.rar}">${RAR_NAME[d.rar]}</div><div class="on">${d.name}</div><div class="od">${d.desc.replace('{v}',0)}</div>`);
    const b=document.createElement('button');b.className='btn small';b.textContent=o.sold?'구매 완료':`구매 ${d.price}G`;
    b.disabled=o.sold||S.gold<d.price||S.charms.length>=5;
    b.onclick=()=>{S.gold-=d.price;S.charms.push(makeCharm(d));discover('charms',d.id);o.sold=true;sfx.buy();const c=center(b);burst(c.x,c.y,30);renderCharms();renderSide();renderShop();};
    div.appendChild(b);box.appendChild(div);
  });
  const cbox=$('#cardOffers');
  S.cardOffers.forEach(o=>{
    const div=document.createElement('div');div.className='offer'+(o.sold?' sold':'');
    let title,desc,label;
    if(o.kind==='card'){
      div.appendChild(cardEl(o.card,false));
      title=`${o.card.s}${o.card.r}${o.card.enh?' · '+ENH[o.card.enh].name:''}`;
      desc=o.card.enh?ENH[o.card.enh].desc:'덱에 카드 1장 추가 (영구)';label=`추가 ${o.price}G`;
    }else if(o.kind==='enh'){
      div.insertAdjacentHTML('beforeend',`<div class="svc-icon">${ENH[o.enh].tag}</div>`);
      title=`${ENH[o.enh].name} 강화권`;desc=`덱의 카드 1장에 영구 부여: ${ENH[o.enh].desc}`;label=`사용 ${o.price}G`;
    }else{
      div.insertAdjacentHTML('beforeend',`<div class="svc-icon">✂</div>`);
      title='카드 제거';desc='덱에서 카드를 최대 3장 영구히 없앱니다 (최소 20장)';label=`제거 ${o.price}G`;
    }
    div.insertAdjacentHTML('beforeend',`<div class="on">${title}</div><div class="od">${desc}</div>`);
    const b=document.createElement('button');b.className='btn small';b.textContent=o.sold?'완료':label;
    b.disabled=o.sold||S.gold<o.price||(o.kind==='remove'&&S.myDeck.length<=20);
    b.onclick=()=>{
      if(o.kind==='card'){S.gold-=o.price;S.myDeck.push(o.card);o.sold=true;sfx.buy();toast(`${o.card.s}${o.card.r} 카드를 덱에 넣었습니다`);renderSide();renderShop();}
      else if(o.kind==='enh'){
        openPicker(`${ENH[o.enh].name} 강화할 카드 선택`,'이미 강화된 카드를 고르면 덮어씁니다.',c=>{S.gold-=o.price;c.enh=o.enh;o.sold=true;sfx.buy();toast(`${c.s}${c.r} → ${ENH[o.enh].name} 카드`);renderSide();renderShop();});
      }else{
        const max=Math.min(3,S.myDeck.length-20);
        openMultiPicker('제거할 카드 선택',`최대 ${max}장까지 고를 수 있어요. 덱이 얇아질수록 원하는 카드가 자주 나옵니다.`,max,'제거하기',cs=>{
          const ids=new Set(cs.map(c=>c.id));S.gold-=o.price;S.myDeck=S.myDeck.filter(x=>!ids.has(x.id));o.sold=true;sfx.buy();
          toast(`${cs.map(c=>c.s+c.r).join(', ')} 카드를 제거했습니다`);renderSide();renderShop();});
      }
    };
    div.appendChild(b);cbox.appendChild(div);
  });
  const tbox=$('#trickOffers');
  S.trickOffers.forEach(o=>{
    const t=o.t,div=document.createElement('div');div.className='offer'+(o.sold?' sold':'');
    div.appendChild(trickEl(t));
    div.insertAdjacentHTML('beforeend',`<div class="on">${t.name}</div><div class="od">${t.desc}</div>`);
    const b=document.createElement('button');b.className='btn small';b.textContent=o.sold?'완료':`구매 ${t.price}G`;
    b.disabled=o.sold||S.gold<t.price||S.tricks.length>=2;
    b.onclick=()=>{S.gold-=t.price;S.tricks.push(t);discover('tricks',t.id);o.sold=true;sfx.buy();renderCharms();renderSide();renderShop();};
    div.appendChild(b);tbox.appendChild(div);
  });
  const own=$('#owned');
  if(!S.charms.length)own.innerHTML='<span class="k" style="font-weight:400">아직 없음</span>';
  S.charms.forEach((ch,i)=>{
    const it=document.createElement('div');it.className='it';it.appendChild(charmEl(ch));
    const b=document.createElement('button');const back=Math.floor(ch.price/2);b.textContent=`판매 +${back}G`;
    b.onclick=()=>{S.gold+=back;S.charms.splice(i,1);hideTip();sfx.gold();renderCharms();renderSide();renderShop();};
    it.appendChild(b);own.appendChild(it);
  });
  const rr=$('#reroll');rr.disabled=S.gold<S.rerollCost;
  rr.onclick=()=>{S.gold-=S.rerollCost;S.rerollCost++;S.offers=rollOffers();sfx.click();renderSide();renderShop();};
  $('#shopDeck').onclick=()=>{sfx.click();openDeckView(renderShop);};
  snapshot('shop');
  $('#nextStage').onclick=()=>{sfx.click();hideTip();closePanel();startStage();};
  if(tutOn()&&!S.tutSeen.shop)setTimeout(()=>tutStep('shop',[
    {target:'#offers',title:'부적: 점수 공식을 바꾸는 장비',html:`부적은 최대 5개까지 장착해요. <span class="c">+칩</span>, <span class="m">+배수</span>, <span class="m">×배수</span>를 더해 줘요. 발동은 <b>왼쪽부터</b>라, 게임 화면에서 드래그해 순서를 바꿀 수 있어요.`},
    {target:'#cardOffers',title:'카드: 내 덱을 직접 만들기',html:`카드를 <b>추가·강화·제거</b>해서 덱을 바꿔요. 하트를 늘리면 하트 부적이 강해지고, 낮은 카드를 빼면 큰 숫자가 자주 나와요. 덱이 바뀌면 버스트 확률도 바뀌어요.`},
    {target:'#nextStage',title:'준비되면 다음 스테이지로',html:`남은 골드는 들고 가요. <b>5골드마다 이자 1골드</b>가 붙으니 아끼는 것도 전략이에요. 보스 스테이지는 미리 규칙이 표시돼요.`},
  ]),350);
}
