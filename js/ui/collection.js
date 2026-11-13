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
      <div class="od">${open?d.desc:t('col.lockedCond',{cond:ach.desc})}</div>
      <button class="btn small"${open?'':' disabled'}>${open?t('col.startWith'):t('col.locked')}</button></div>`;
  }).join('');
  openPanel(`<div class="sub">NEW RUN</div><h2>${t('col.deckTitle')}</h2>
    <p style="font-size:13px">${t('col.deckNote')}${sv?` <b style="color:var(--mult)">${t('col.deckWarn')}</b>`:''}</p>
    <div class="offers decks">${tiles}</div>
    <div class="actions"><button class="btn small teal" id="deckBack">${t('col.back')}</button></div>`,'decksel');
  document.querySelectorAll('.deck-tile').forEach(t=>{
    const d=DECKS.find(x=>x.id===t.dataset.id);
    const art=t.querySelector('.deck-art');art.appendChild(deckCardEl(d));
    if(!isDeckUnlocked(d)){art.insertAdjacentHTML('beforeend',`<span class="lock">${window.t('col.locked')}</span>`);return;}
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
  d.innerHTML=`<div class="glyph">${locked?'✕':'?'}</div><div class="cname">${locked?t('col.locked'):t('col.unknown')}</div>`;
  return d;
}
// 탭 3개(업적 / 부적 / 트릭·보스)로 나눠 모바일에서도 한 화면에 들어가게 한다
function openCollection(back,tab='ach'){
  const m=META,nCh=m.charms.length,nTr=m.tricks.length,nBo=m.bosses.length;
  const tabs=[['ach',t('col.tabAch',{a:m.achs.length,b:ACHIEVEMENTS.length})],['charm',t('col.tabCharm',{a:nCh,b:CHARMS.length})],['etc',t('col.tabEtc',{a:nTr+nBo,b:TRICKS.length+BOSSES.length})]]
    .map(([id,label])=>`<button class="col-tab${id===tab?' on':''}" data-tab="${id}">${label}</button>`).join('');
  let body='';
  if(tab==='ach'){
    body=`<div class="achs">${ACHIEVEMENTS.map(a=>{
      const done=m.achs.includes(a.id);
      return`<div class="ach${done?' done':''}"><span class="mark">${done?'✓':''}</span><div><b>${a.name}</b><span>${a.desc}</span></div><em>${rewardText(a)}</em></div>`;
    }).join('')}</div>`;
  }else if(tab==='charm'){
    body=`<div class="col-grid" id="colCharms"></div><p class="col-note">${t('col.charmNote')}</p>`;
  }else{
    body=`<div class="sec">${t('col.tricks')}</div><div class="col-grid" id="colTricks"></div>
      <div class="sec">${t('col.bosses')}</div><div class="bosses">${BOSSES.map(b=>m.bosses.includes(b.id)
        ?`<div class="boss-row"><b>${b.name}</b><span>${b.desc}</span></div>`
        :`<div class="boss-row unknown"><b>???</b><span>${t('col.unmet')}</span></div>`).join('')}</div>`;
  }
  openPanel(`<div class="sub">COLLECTION</div><h2>${t('col.title')}</h2>
    <div class="col-tabs">${tabs}</div>${body}
    <div class="actions"><span class="col-note">${t('col.demoNote')}</span><button class="btn small" id="colClose">${t('ui.close')}</button></div>`,'collection');
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
