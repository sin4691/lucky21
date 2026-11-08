// 사이드 패널·부적 바·트릭 칸·남은 덱 정보·버스트 확률 표시.
'use strict';

/* ---------------- render ---------------- */
function renderSide(){
  $('#stageV').textContent=S.stage>8?`${S.stage} · ∞`:`${S.stage} / 8`;
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
  $('#deckInfo').innerHTML=`전체 <b>${S.myDeck.length}</b>장 · 남은 <b>${pile.length}</b>장${enh?` · 강화 ${enh}`:''}<br>
    10계열 ${tens} · A ${aces} · 2~6 ${low}<br>
    <span class="suits"><span>♠${cnt('♠')}</span><span class="rd">♥${cnt('♥')}</span><span class="rd">♦${cnt('♦')}</span><span>♣${cnt('♣')}</span></span>`;
  $('#deckCount').textContent=`딜러 덱 ${S.shoe.length}`;
}
function bustChance(){
  const pile=remainingPile();if(!pile.length)return 0;
  return pile.filter(c=>total([...S.player,c]).t>21).length/pile.length;
}
function renderBust(){
  const el=$('#bustP');
  if(S.busy||!S.player.length){el.classList.remove('on');return;}
  if(S.peek&&S.draw.length){const c=S.draw[S.draw.length-1],t=total([...S.player,c]).t;
    el.textContent=`다음 카드 ${c.s}${c.r} · 히트하면 ${t}${t>21?' (버스트)':''}`;el.className='on'+(t>21?' hi':'');return;}
  const p=bustChance();el.textContent=`다음 히트 버스트 확률 ${Math.round(p*100)}%`;
  el.className='on'+(p>=.5?' hi':p>=.25?' mid':'');
}
function renderCharms(){
  const bar=$('#charmBar');bar.innerHTML='';
  S.charms.forEach((ch,i)=>{
    const el=charmEl(ch);el.draggable=true;
    el.addEventListener('dragstart',e=>{if(S.busy&&!$('#overlay').classList.contains('on')&&S.player.length){e.preventDefault();toast('핸드 진행 중에는 순서를 바꿀 수 없어요');return;}e.dataTransfer.setData('text/plain',String(i));el.classList.add('dragging');hideTip();});
    el.addEventListener('dragend',()=>el.classList.remove('dragging'));
    el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('over');});
    el.addEventListener('dragleave',()=>el.classList.remove('over'));
    el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('over');const from=+e.dataTransfer.getData('text/plain');if(isNaN(from)||from===i)return;const [m]=S.charms.splice(from,1);S.charms.splice(i,0,m);sfx.click();renderCharms();});
    bar.appendChild(el);
  });
  for(let i=S.charms.length;i<5;i++){const d=document.createElement('div');d.className='slot';bar.appendChild(d);}
  const sep=document.createElement('div');sep.className='trick-sep';sep.innerHTML='<span>트릭</span>';bar.appendChild(sep);
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
  d.addEventListener('mouseenter',e=>{const tp=$('#tip');tp.innerHTML=`<span class="r">트릭 카드 · 1회용</span><b>${t.name}</b>${t.desc}`;tp.style.display='block';moveTip(e);});
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
  $('#pTot').textContent=S.player.length?(p.soft&&p.t<21?`소프트 ${p.t}`:p.t):'';
  if(!S.dealer.length){$('#dTot').textContent='';return;}
  if(S.holeRevealed){$('#dTot').textContent=total(S.dealer).t;}
  else if(S.boss?.id==='masked'){$('#dTot').textContent='? + ?';}
  else{$('#dTot').textContent=`${rankVal(S.dealer[0])===11?'A':rankVal(S.dealer[0])} + ?`;}
  renderDeckInfo();
}
