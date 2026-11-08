// 덱 보기와 카드 선택(단일/여러 장) 화면.
'use strict';

/* ---------------- deck view / picker ---------------- */
function deckGrid(cards,{pick,dim}={}){
  const g=document.createElement('div');g.className='deckgrid mini'+(pick?' pick':'');
  for(const suit of SUITS){
    const row=document.createElement('div');row.className='drow';
    sortCards(cards.filter(c=>c.s===suit)).forEach(c=>{const el=cardEl(c,false);if(dim&&dim(c))el.classList.add('used');if(pick)el.onclick=()=>{hideTip();pick(c);};row.appendChild(el);});
    if(row.children.length)g.appendChild(row);
  }
  return g;
}
function deckSummary(){
  const d=S.myDeck,n=k=>d.filter(k).length;
  return `전체 ${d.length}장 · ♠${n(c=>c.s==='♠')} ♥${n(c=>c.s==='♥')} ♦${n(c=>c.s==='♦')} ♣${n(c=>c.s==='♣')} · 10계열 ${n(c=>rankVal(c)===10)} · A ${n(c=>c.r==='A')} · 강화 ${n(c=>c.enh)}`;
}
function openMultiPicker(title,hint,max,okLabel,onConfirm){
  const picked=new Map();
  openPanel(`<div class="sub">MY DECK</div><h2>${title}</h2><p>${hint}</p><div class="k">${deckSummary()}</div><div id="gridHost"></div>
    <div class="actions"><span class="k" id="pickCount" style="margin-right:auto">선택 0 / ${max}</span><button class="btn small teal" id="pickCancel">취소</button><button class="btn small" id="pickOk" disabled>${okLabel}</button></div>`,'picker');
  const grid=deckGrid(S.myDeck,{pick:()=>{}});$('#gridHost').appendChild(grid);
  // deckGrid가 문양별로 정렬해서 그리므로 같은 순서로 카드와 요소를 짝지음
  const order=SUITS.flatMap(su=>sortCards(S.myDeck.filter(c=>c.s===su)));
  [...grid.querySelectorAll('.card')].forEach((el,i)=>{
    const c=order[i];
    el.onclick=()=>{
      hideTip();
      if(picked.has(c.id)){picked.delete(c.id);el.classList.remove('picked');}
      else{if(picked.size>=max){toast(`최대 ${max}장까지 고를 수 있어요`);return;}picked.set(c.id,c);el.classList.add('picked');}
      sfx.click();$('#pickCount').textContent=`선택 ${picked.size} / ${max}`;$('#pickOk').disabled=!picked.size;
    };
  });
  $('#pickOk').onclick=()=>{hideTip();onConfirm([...picked.values()]);};
  $('#pickCancel').onclick=()=>{sfx.click();hideTip();renderShop();};
}
function openPicker(title,hint,onPick){
  openPanel(`<div class="sub">MY DECK</div><h2>${title}</h2><p>${hint}</p><div class="k">${deckSummary()}</div><div id="gridHost"></div>
    <div class="actions"><button class="btn small teal" id="pickCancel">취소</button></div>`);
  $('#gridHost').appendChild(deckGrid(S.myDeck,{pick:onPick}));
  $('#pickCancel').onclick=()=>{sfx.click();hideTip();renderShop();};
}
function openDeckView(back){
  const inDraw=new Set(S.draw.map(c=>c.id));
  const inStage=S.draw.length+S.discard.length+S.player.length>0&&!back;
  openPanel(`<div class="sub">MY DECK</div><h2>내 덱</h2><div class="k">${deckSummary()}</div>
    ${inStage?'<p style="font-size:12.5px">흐린 카드는 이번 스테이지에서 이미 나온 카드예요. 남은 카드가 다음 히트의 후보입니다.</p>':''}
    <div id="gridHost"></div><div class="actions"><button class="btn small" id="deckClose">닫기</button></div>`);
  $('#gridHost').appendChild(deckGrid(S.myDeck,{dim:inStage?(c=>!inDraw.has(c.id)):null}));
  $('#deckClose').onclick=()=>{sfx.click();hideTip();if(back)back();else closePanel();};
}
