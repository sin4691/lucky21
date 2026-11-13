// 스테이지 클리어 보상과 상점 (부적·카드·강화·제거·트릭 카드).
'use strict';

/* ---------------- stage clear / shop ---------------- */
async function stageClear(){
  hideBanner();sfx.big();burst(innerWidth/2,innerHeight*.4,90,['#e8c46a','#fff3c4','#7fe0d4','#ff8a5c'],11);shake(true);
  await sleep(500);
  if(S.stage===8&&!S.endless)return victory();
  if(S.boss)achEvent('bossClear');
  const cap=hasCharm('usury')||S.richDeck?10:5;
  const rows=[[S.boss?t('shop.bossClear'):t('shop.stageClear'),S.boss?6:4],[t('shop.handsLeft',{n:S.handsLeft}),S.handsLeft],[t('shop.interest',{cap}),Math.min(cap,Math.floor(S.gold/5))]];
  if(hasCharm('piggy'))rows.push([CHARMS.find(c=>c.id==='piggy').name,3]);
  const sum=rows.reduce((a,r)=>a+r[1],0);
  openPanel(`<div class="sub">STAGE ${S.stage} CLEAR</div><h2>${fmt(S.score)} / ${fmt(S.target)}</h2>
    <div class="reward">${rows.map(r=>`<div class="ln"><span>${r[0]}</span><b>+${r[1]}G</b></div>`).join('')}
    <div class="ln sum"><span>${t('shop.total')}</span><b>+${sum}G</b></div></div>
    <div class="actions"><button class="btn" id="toShop" disabled>${t('shop.toShop')}</button></div>`);
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
  openPanel(`<div class="shop-head"><div><div class="sub">SHOP</div><h2>${t('shop.title')}</h2></div><div class="purse">${S.gold}G</div></div>
    <div class="sec">${t('shop.charms',{n:S.charms.length})}</div>
    <div class="offers" id="offers"></div>
    <div class="actions" style="justify-content:flex-start;margin-top:0"><button class="btn teal small" id="reroll">${t('shop.reroll',{cost:S.rerollCost})}</button></div>
    <div class="splitrow"><div><div class="sec">${t('shop.cards',{n:S.myDeck.length})} <button class="linkbtn" id="shopDeck" style="margin-left:8px">${t('ui.viewDeck')}</button></div>
    <div class="cardoffers" id="cardOffers"></div></div>
    <div><div class="sec">${t('shop.tricks',{n:S.tricks.length})}</div>
    <div class="cardoffers" id="trickOffers"></div></div></div>
    <hr><div class="k">${t('shop.owned')}</div>
    <div class="owned" id="owned"></div><hr>
    <div class="next">${t('shop.next',{n:S.stage,target:fmt(targetOf(S.stage))})}${nb?` · <span class="bn">${t('shop.nextBoss',{name:nb.name})}</span> — ${nb.desc}`:''}</div>
    <div class="actions"><button class="btn" id="nextStage">${t('shop.nextStage')}</button></div>`,'shopv');
  const box=$('#offers');
  S.offers.forEach(o=>{
    const d=o.def;const div=document.createElement('div');div.className='offer'+(o.sold?' sold':'');
    div.appendChild(charmEl(makeCharm(d),true));
    div.insertAdjacentHTML('beforeend',`<div class="rar r${d.rar}">${RAR_NAME[d.rar]}</div><div class="on">${d.name}</div><div class="od">${d.desc.replace('{v}',0)}</div>`);
    const b=document.createElement('button');b.className='btn small';b.textContent=o.sold?t('shop.sold'):t('shop.buy',{p:d.price});
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
      desc=o.card.enh?ENH[o.card.enh].desc:t('shop.addCard');label=t('shop.add',{p:o.price});
    }else if(o.kind==='enh'){
      div.insertAdjacentHTML('beforeend',`<div class="svc-icon">${ENH[o.enh].tag}</div>`);
      title=t('shop.enhTicket',{name:ENH[o.enh].name});desc=t('shop.enhDesc',{desc:ENH[o.enh].desc});label=t('shop.use',{p:o.price});
    }else{
      div.insertAdjacentHTML('beforeend',`<div class="svc-icon">✂</div>`);
      title=t('shop.remove');desc=t('shop.removeDesc');label=t('shop.removeBtn',{p:o.price});
    }
    div.insertAdjacentHTML('beforeend',`<div class="on">${title}</div><div class="od">${desc}</div>`);
    const b=document.createElement('button');b.className='btn small';b.textContent=o.sold?t('shop.done'):label;
    b.disabled=o.sold||S.gold<o.price||(o.kind==='remove'&&S.myDeck.length<=20);
    b.onclick=()=>{
      if(o.kind==='card'){S.gold-=o.price;S.myDeck.push(o.card);o.sold=true;sfx.buy();toast(t('shop.added',{card:o.card.s+o.card.r}));renderSide();renderShop();}
      else if(o.kind==='enh'){
        openPicker(t('shop.pickEnh',{name:ENH[o.enh].name}),t('shop.pickEnhNote'),c=>{S.gold-=o.price;c.enh=o.enh;o.sold=true;sfx.buy();toast(t('shop.enhanced',{card:c.s+c.r,name:ENH[o.enh].name}));renderSide();renderShop();});
      }else{
        const max=Math.min(3,S.myDeck.length-20);
        openMultiPicker(t('shop.pickRemove'),t('shop.pickRemoveNote',{max}),max,t('shop.removeOk'),cs=>{
          const ids=new Set(cs.map(c=>c.id));S.gold-=o.price;S.myDeck=S.myDeck.filter(x=>!ids.has(x.id));o.sold=true;sfx.buy();
          toast(t('shop.removed',{cards:cs.map(c=>c.s+c.r).join(', ')}));renderSide();renderShop();});
      }
    };
    div.appendChild(b);cbox.appendChild(div);
  });
  const tbox=$('#trickOffers');
  S.trickOffers.forEach(o=>{
    const t=o.t,div=document.createElement('div');div.className='offer'+(o.sold?' sold':'');
    div.appendChild(trickEl(t));
    div.insertAdjacentHTML('beforeend',`<div class="on">${t.name}</div><div class="od">${t.desc}</div>`);
    const b=document.createElement('button');b.className='btn small';b.textContent=o.sold?window.t('shop.done'):window.t('shop.buy',{p:t.price});
    b.disabled=o.sold||S.gold<t.price||S.tricks.length>=2;
    b.onclick=()=>{S.gold-=t.price;S.tricks.push(t);discover('tricks',t.id);o.sold=true;sfx.buy();renderCharms();renderSide();renderShop();};
    div.appendChild(b);tbox.appendChild(div);
  });
  const own=$('#owned');
  if(!S.charms.length)own.innerHTML=`<span class="k" style="font-weight:400">${t('shop.noneYet')}</span>`;
  S.charms.forEach((ch,i)=>{
    const it=document.createElement('div');it.className='it';it.appendChild(charmEl(ch));
    const b=document.createElement('button');const back=Math.floor(ch.price/2);b.textContent=t('shop.sell',{g:back});
    b.onclick=()=>{S.gold+=back;S.charms.splice(i,1);hideTip();sfx.gold();renderCharms();renderSide();renderShop();};
    it.appendChild(b);own.appendChild(it);
  });
  const rr=$('#reroll');rr.disabled=S.gold<S.rerollCost;
  rr.onclick=()=>{S.gold-=S.rerollCost;S.rerollCost++;S.offers=rollOffers();sfx.click();renderSide();renderShop();};
  $('#shopDeck').onclick=()=>{sfx.click();openDeckView(renderShop);};
  snapshot('shop');
  $('#nextStage').onclick=()=>{sfx.click();hideTip();closePanel();startStage();};
  if(tutOn()&&!S.tutSeen.shop)setTimeout(()=>tutStep('shop',[
    {target:'#offers',title:t('tut.shopCharmT'),html:t('tut.shopCharm')},
    {target:'#cardOffers',title:t('tut.shopCardT'),html:t('tut.shopCard')},
    {target:'#nextStage',title:t('tut.shopNextT'),html:t('tut.shopNext')},
  ]),350);
}
