// 시작 덱 선택 화면과 도감(업적·덱·부적·트릭·보스) 화면.
'use strict';

/* ---------------- deck select ---------------- */
function deckCardEl(d){
  const c=cardEl({...d.sample,id:-1},false);c.style.pointerEvents='none';return c;
}
function openDeckSelect(sv){
  const tiles=DECKS.map(d=>{
    const open=isDeckUnlocked(d);
    const ach=d.unlock&&ACHIEVEMENTS.find(a=>a.id===d.unlock);
    return`<div class="offer deck-tile${open?'':' locked'}" data-id="${d.id}">
      <div class="deck-art"></div>
      <div class="on">${d.name}</div>
      <div class="od">${open?d.desc:`잠김 · ${ach.desc}`}</div>
      <button class="btn small"${open?'':' disabled'}>${open?'이 덱으로 시작':'잠김'}</button></div>`;
  }).join('');
  openPanel(`<div class="sub">NEW RUN</div><h2>시작 덱 선택</h2>
    <p style="font-size:13px">덱마다 시작 조건이 달라요. 업적을 달성하면 새 덱이 풀려요.${sv?' <b style="color:var(--mult)">새로 시작하면 이어하던 판은 지워져요.</b>':''}</p>
    <div class="offers decks">${tiles}</div>
    <div class="actions"><button class="btn small teal" id="deckBack">뒤로</button></div>`,'decksel');
  document.querySelectorAll('.deck-tile').forEach(t=>{
    const d=DECKS.find(x=>x.id===t.dataset.id);
    const art=t.querySelector('.deck-art');art.appendChild(deckCardEl(d));
    if(!isDeckUnlocked(d)){art.insertAdjacentHTML('beforeend','<span class="lock">잠김</span>');return;}
    t.querySelector('button').onclick=()=>{
      sfx.click();if(sv)clearSave();
      newRun();S.deckId=d.id;d.apply(S);
      S.charms.forEach(c=>discover('charms',c.id));
      renderCharms();renderSide();closePanel();startStage();
    };
  });
  $('#deckBack').onclick=()=>{sfx.click();title();};
}

/* ---------------- collection (도감) ---------------- */
function unknownCharmEl(locked){
  const d=document.createElement('div');d.className='charm unknown';
  d.innerHTML=`<div class="glyph">${locked?'✕':'?'}</div><div class="cname">${locked?'잠김':'미발견'}</div>`;
  return d;
}
// 탭 3개(업적 / 부적 / 트릭·보스)로 나눠 모바일에서도 한 화면에 들어가게 한다
function openCollection(back,tab='ach'){
  const m=META,nCh=m.charms.length,nTr=m.tricks.length,nBo=m.bosses.length;
  const tabs=[['ach',`업적 ${m.achs.length}/${ACHIEVEMENTS.length}`],['charm',`부적 ${nCh}/${CHARMS.length}`],['etc',`트릭·보스 ${nTr+nBo}/${TRICKS.length+BOSSES.length}`]]
    .map(([id,label])=>`<button class="col-tab${id===tab?' on':''}" data-tab="${id}">${label}</button>`).join('');
  let body='';
  if(tab==='ach'){
    body=`<div class="achs">${ACHIEVEMENTS.map(a=>{
      const done=m.achs.includes(a.id);
      return`<div class="ach${done?' done':''}"><span class="mark">${done?'✓':''}</span><div><b>${a.name}</b><span>${a.desc}</span></div><em>${rewardText(a)}</em></div>`;
    }).join('')}</div>`;
  }else if(tab==='charm'){
    body=`<div class="col-grid" id="colCharms"></div><p class="col-note">부적은 한 번 구매하면 발견돼요. ✕는 업적으로 해금해야 상점에 나와요.</p>`;
  }else{
    body=`<div class="sec">트릭 카드</div><div class="col-grid" id="colTricks"></div>
      <div class="sec">보스</div><div class="bosses">${BOSSES.map(b=>m.bosses.includes(b.id)
        ?`<div class="boss-row"><b>${b.name}</b><span>${b.desc}</span></div>`
        :`<div class="boss-row unknown"><b>???</b><span>아직 만나지 못한 보스</span></div>`).join('')}</div>`;
  }
  openPanel(`<div class="sub">COLLECTION</div><h2>도감</h2>
    <div class="col-tabs">${tabs}</div>${body}
    <div class="actions"><span class="col-note">데모 모드는 기록되지 않아요.</span><button class="btn small" id="colClose">닫기</button></div>`,'collection');
  document.querySelectorAll('.col-tab').forEach(t=>t.onclick=()=>{if(t.dataset.tab===tab)return;sfx.click();hideTip();openCollection(back,t.dataset.tab);});
  const cg=$('#colCharms');
  if(cg)for(const c of CHARMS){
    if(m.charms.includes(c.id))cg.appendChild(charmEl(makeCharm(c)));
    else cg.appendChild(unknownCharmEl(!isCharmUnlocked(c.id)));
  }
  const tg=$('#colTricks');
  if(tg)for(const t of TRICKS){
    if(m.tricks.includes(t.id))tg.appendChild(trickEl(t));
    else{const d=document.createElement('div');d.className='trick unknown';d.innerHTML='<div class="glyph">?</div>';tg.appendChild(d);}
  }
  $('#colClose').onclick=()=>{sfx.click();hideTip();if(back)back();else closePanel();};
}
