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
function openCollection(back){
  const m=META,nCh=m.charms.length,nTr=m.tricks.length,nBo=m.bosses.length;
  const achRows=ACHIEVEMENTS.map(a=>{
    const done=m.achs.includes(a.id);
    return`<div class="ach${done?' done':''}"><span class="mark">${done?'✓':''}</span><div><b>${a.name}</b><span>${a.desc}</span></div><em>${rewardText(a)}</em></div>`;
  }).join('');
  const bossRows=BOSSES.map(b=>m.bosses.includes(b.id)
    ?`<div class="boss-row"><b>${b.name}</b><span>${b.desc}</span></div>`
    :`<div class="boss-row unknown"><b>???</b><span>아직 만나지 못한 보스</span></div>`).join('');
  openPanel(`<div class="sub">COLLECTION</div><h2>도감</h2>
    <div class="sec">업적 · ${m.achs.length}/${ACHIEVEMENTS.length}</div><div class="achs">${achRows}</div>
    <div class="sec">부적 · 발견 ${nCh}/${CHARMS.length}</div><div class="col-grid" id="colCharms"></div>
    <div class="sec">트릭 카드 · 발견 ${nTr}/${TRICKS.length}</div><div class="col-grid" id="colTricks"></div>
    <div class="sec">보스 · 만남 ${nBo}/${BOSSES.length}</div><div class="bosses">${bossRows}</div>
    <p style="font-size:12px;color:var(--muted)">부적과 트릭 카드는 한 번 구매하면 발견돼요. 데모 모드에서는 기록되지 않아요.</p>
    <div class="actions"><button class="btn small" id="colClose">닫기</button></div>`,'collection');
  const cg=$('#colCharms');
  for(const c of CHARMS){
    if(m.charms.includes(c.id))cg.appendChild(charmEl(makeCharm(c)));
    else cg.appendChild(unknownCharmEl(!isCharmUnlocked(c.id)));
  }
  const tg=$('#colTricks');
  for(const t of TRICKS){
    if(m.tricks.includes(t.id))tg.appendChild(trickEl(t));
    else{const d=document.createElement('div');d.className='trick unknown';d.innerHTML='<div class="glyph">?</div>';tg.appendChild(d);}
  }
  $('#colClose').onclick=()=>{sfx.click();hideTip();if(back)back();else closePanel();};
}
