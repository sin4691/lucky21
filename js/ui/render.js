// 사이드 패널·부적 바·트릭 칸·남은 덱 정보·버스트 확률 표시.
'use strict';

/* ---------------- render ---------------- */
function renderSide(){
  if(S&&S.gold>=25)achEvent('gold');
  $('#stageV').textContent=S.stage>FINAL_STAGE?`${S.stage} · ∞`:`${S.stage} / ${FINAL_STAGE}`;
  $('#stageLbl').textContent=S.boss?'BOSS':'';
  $('#targetV').textContent=fmt(S.target);
  $('#scoreV').textContent=fmt(S.score);
  $('#prog').style.width=Math.min(100,S.score/S.target*100)+'%';
  $('#handsV').textContent=S.handsLeft;
  $('#goldV').textContent=S.gold;
  $('#streakV').textContent=S.streak;
  $('#bestV').textContent=fmt(S.bestHand);
  const bb=$('#bossBox');
  if(S.boss){bb.classList.add('on');$('#bossName').textContent=S.boss.name;$('#bossDesc').textContent=S.boss.desc;}else bb.classList.remove('on');
  $('#arcTxt').textContent=S.boss?.id==='stiff'?'DEALER MUST STAND ON 18':'DEALER MUST STAND ON 17';
  renderDeckInfo();
}
function remainingPile(){return S.draw.length?S.draw:S.discard;}
function renderDeckInfo(){
  const pile=S.draw;const cnt=s=>pile.filter(c=>c.s===s).length;
  const tens=pile.filter(c=>rankVal(c)===10).length,aces=pile.filter(c=>c.r==='A').length,low=pile.filter(c=>{const v=rankVal(c);return v>=2&&v<=6;}).length;
  const enh=S.myDeck.filter(c=>c.enh).length;
  $('#deckInfo').innerHTML=`${t('ui.deckInfo',{all:S.myDeck.length,left:pile.length,enh:enh?t('ui.deckInfoEnh',{n:enh}):''})}<br>
    ${t('ui.deckInfo2',{tens,aces,low})}<br>
    <span class="suits"><span>♠${cnt('♠')}</span><span class="rd">♥${cnt('♥')}</span><span class="rd">♦${cnt('♦')}</span><span>♣${cnt('♣')}</span></span>`;
  $('#deckCount').textContent=t('ui.dealerDeck',{n:S.shoe.length});
}
function bustChance(){
  const pile=remainingPile();if(!pile.length)return 0;
  return pile.filter(c=>total([...S.player,c]).t>21).length/pile.length;
}
function renderBust(){
  const el=$('#bustP');
  if(S.busy||!S.player.length){el.classList.remove('on');return;}
  if(S.peek&&S.draw.length){const c=S.draw[S.draw.length-1],tt=total([...S.player,c]).t;
    el.textContent=t('ui.nextCard',{card:c.s+c.r,t:tt})+(tt>21?t('ui.bustSuffix'):'');el.className='on'+(tt>21?' hi':'');return;}
  const p=bustChance();el.textContent=t('ui.bustChance',{p:Math.round(p*100)});
  el.className='on'+(p>=.5?' hi':p>=.25?' mid':'');
}
const TOUCH_UI=()=>matchMedia('(hover:none)').matches;
const canReorder=()=>!(S.busy&&!$('#overlay').classList.contains('on')&&S.player.length);
// 터치: 꾹 누르면(0.35초) 부적이 들리고, 좌우로 끌어 놓으면 순서가 바뀐다
function holdToReorder(el){
  el.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse')return;
    const bar=$('#charmBar'),x0=e.clientX,y0=e.clientY;let lifted=false,tx=0;
    el.classList.add('holding');
    const timer=setTimeout(()=>{
      el.classList.remove('holding');
      if(!canReorder()){toast(t('ui.noReorder'));cleanup();return;}
      lifted=true;hideTip();el.classList.add('lifted');el.style.transform='scale(1.1)';
      try{el.setPointerCapture(e.pointerId);}catch(_){}
      if(navigator.vibrate)navigator.vibrate(15);sfx.click();
    },350);
    const others=()=>[...bar.querySelectorAll('.charm')].filter(c=>c!==el);
    const move=ev=>{
      if(ev.pointerId!==e.pointerId)return;
      if(!lifted){if(Math.hypot(ev.clientX-x0,ev.clientY-y0)>10){clearTimeout(timer);cleanup();}return;}
      ev.preventDefault();
      const x=ev.clientX,list=others();
      // 손가락이 지나간 이웃 부적 앞뒤로 자리를 옮긴다
      const idx=list.filter(c=>{const r=c.getBoundingClientRect();return r.left+r.width/2<x;}).length;
      const before=list[idx]||null,curNext=el.nextElementSibling;
      if(before!==curNext&&!(before===null&&!(curNext&&curNext.classList.contains('charm')))){
        const firstRects=new Map(list.map(c=>[c,c.getBoundingClientRect().left]));
        const elLeft=el.getBoundingClientRect().left-tx;
        bar.insertBefore(el,before||list[list.length-1].nextSibling);
        const newLeft=el.getBoundingClientRect().left-tx;
        x0Shift+=newLeft-elLeft;
        // 밀려난 부적은 부드럽게 미끄러지게
        list.forEach(c=>{const d=firstRects.get(c)-c.getBoundingClientRect().left;if(d){c.classList.remove('shift');c.style.transform=`translateX(${d}px)`;requestAnimationFrame(()=>{c.classList.add('shift');c.style.transform='';});}});
      }
      tx=x-x0-x0Shift;el.style.transform=`translateX(${tx}px) scale(1.1)`;
    };
    let x0Shift=0;
    const up=ev=>{
      if(ev.pointerId!==e.pointerId)return;
      clearTimeout(timer);
      if(lifted){
        const order=[...bar.querySelectorAll('.charm')].map(c=>+c.dataset.i);
        const changed=order.some((v,k)=>v!==k);
        if(changed){const old=S.charms.slice();S.charms=order.map(k=>old[k]);sfx.click();}
        hideTip();cleanup();renderCharms();
        // 꾹 누른 뒤 따라오는 탭(설명 창)은 막는다
        setTimeout(hideTip,50);
        return;
      }
      cleanup();
    };
    function cleanup(){
      el.classList.remove('holding','lifted');el.style.transform='';
      removeEventListener('pointermove',move);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);
    }
    addEventListener('pointermove',move,{passive:false});addEventListener('pointerup',up);addEventListener('pointercancel',up);
  });
}
function renderCharms(){
  const bar=$('#charmBar');bar.innerHTML='';
  S.charms.forEach((ch,i)=>{
    const el=charmEl(ch);el.draggable=!TOUCH_UI();el.dataset.i=i;holdToReorder(el);
    el.addEventListener('dragstart',e=>{if(!canReorder()){e.preventDefault();toast(t('ui.noReorder'));return;}e.dataTransfer.setData('text/plain',String(i));el.classList.add('dragging');hideTip();});
    el.addEventListener('dragend',()=>el.classList.remove('dragging'));
    el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('over');});
    el.addEventListener('dragleave',()=>el.classList.remove('over'));
    el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('over');const from=+e.dataTransfer.getData('text/plain');if(isNaN(from)||from===i)return;const [m]=S.charms.splice(from,1);S.charms.splice(i,0,m);sfx.click();renderCharms();});
    bar.appendChild(el);
  });
  for(let i=S.charms.length;i<5;i++){const d=document.createElement('div');d.className='slot';bar.appendChild(d);}
  const sep=document.createElement('div');sep.className='trick-sep';sep.innerHTML=`<span>${t('ui.trick')}</span>`;bar.appendChild(sep);
  for(let i=0;i<2;i++){
    const t=S.tricks[i];
    if(t){const el=trickEl(t);el.onclick=()=>useTrick(i);bar.appendChild(el);}
    else{const d=document.createElement('div');d.className='slot tslot';bar.appendChild(d);}
  }
  $('#charmCnt').textContent=`${S.charms.length}/5`;
}
function charmEl(ch,big){
  const d=document.createElement('div');d.className=`charm r${ch.rar}${big?' big':''}`;d.dataset.id=ch.id;
  d.innerHTML=`<div class="glyph">${ch.glyph}</div><div class="cname">${ch.name}</div>`;
  if(ART.charms[ch.id]){d.classList.add('has-art');d.style.backgroundImage=`url(${ART.charms[ch.id]})`;}
  d.addEventListener('mouseenter',e=>showTip(e,ch));d.addEventListener('mousemove',moveTip);d.addEventListener('mouseleave',hideTip);
  return d;
}
function trickEl(t){
  const d=document.createElement('div');d.className='trick';d.dataset.id=t.id;
  d.innerHTML=`<div class="glyph">${t.glyph}</div><div class="cname">${t.name}</div>`;
  if(ART.tricks[t.id]){d.classList.add('has-art');d.style.backgroundImage=`url(${ART.tricks[t.id]})`;}
  d.addEventListener('mouseenter',e=>{const tp=$('#tip');tp.innerHTML=`<span class="r">${window.t('ui.trickOnce')}</span><b>${t.name}</b>${t.desc}`;tp.style.display='block';moveTip(e);});
  d.addEventListener('mousemove',moveTip);d.addEventListener('mouseleave',hideTip);
  return d;
}
const descOf=ch=>ch.desc.replace('{v}',ch.val);
function showTip(e,ch){const t=$('#tip');t.innerHTML=`<span class="r">${RAR_NAME[ch.rar]}</span><b>${ch.name}</b>${descOf(ch)}`;t.style.display='block';moveTip(e);}
function moveTip(e){const t=$('#tip');const x=Math.min(e.clientX+14,innerWidth-t.offsetWidth-8);t.style.left=x+'px';t.style.top=(e.clientY+16)+'px';}
function hideTip(){$('#tip').style.display='none';}
function setCM(c,m){const cE=$('#cmC'),mE=$('#cmM');cE.textContent=fmt(c);mE.textContent=fmtM(m);bump(cE);bump(mE);}
function bump(el){el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('on'),1600);}
function updateButtons(){
  const can=!S.busy;
  $('#btnHit').disabled=!can;$('#btnStand').disabled=!can;$('#btnDouble').disabled=!can||S.player.length!==2||S.boss?.id==='nodouble';
  renderBust();
}
function updateTotals(){
  const p=total(S.player);
  $('#pTot').textContent=S.player.length?(p.soft&&p.t<21?t('ui.soft',{n:p.t}):p.t):'';
  if(!S.dealer.length){$('#dTot').textContent='';return;}
  if(S.holeRevealed){$('#dTot').textContent=total(S.dealer).t;}
  else if(S.boss?.id==='masked'){$('#dTot').textContent='? + ?';}
  else{$('#dTot').textContent=`${rankVal(S.dealer[0])===11?'A':rankVal(S.dealer[0])} + ?`;}
  renderDeckInfo();
}
