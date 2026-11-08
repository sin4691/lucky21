// 카드 DOM: 앞/뒷면, 강화 표시, 3D 틸트, 덱에서 날아오는 딜 애니메이션.
'use strict';

/* ---------------- card DOM ---------------- */
function cardEl(c,down){
  const d=document.createElement('div');d.className='card'+(isRed(c)?' red':'')+(down?' down':'')+(c.enh?' e-'+c.enh:'');
  const mid=isFace(c)?`<div class="mid court"><span data-s="${c.s}">${c.r}</span></div>`:`<div class="mid">${c.s}</div>`;
  const backArt=ART.cardBack?` art" style="background-image:url(${ART.cardBack})`:'';
  d.innerHTML=`<div class="tilt"><div class="inner">
    <div class="face front">${c.enh?`<span class="enh" title="${ENH[c.enh].name}">${ENH[c.enh].tag}</span>`:''}<div class="tl">${c.r}<i>${c.s}</i></div>${mid}<div class="br">${c.r}<i>${c.s}</i></div></div>
    <div class="face back${backArt}"><span class="peek">${c.r}${c.s}</span></div></div></div>`;
  const tilt=d.firstElementChild;
  d.addEventListener('mousemove',e=>{const r=d.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;tilt.style.transform=`translateY(-8px) rotateX(${-y*18}deg) rotateY(${x*18}deg)`;});
  d.addEventListener('mouseleave',()=>{tilt.style.transform='';hideTip();});
  if(c.enh)d.addEventListener('mouseenter',e=>{if(d.classList.contains('down'))return;const t=$('#tip');t.innerHTML=`<span class="r">강화</span><b>${ENH[c.enh].name} 카드</b>${ENH[c.enh].desc}`;t.style.display='block';moveTip(e);});
  if(c.enh)d.addEventListener('mousemove',e=>{if($('#tip').style.display==='block')moveTip(e);});
  return d;
}
function backOnly(){const d=cardEl({r:'',s:''},true);d.style.pointerEvents='none';return d;}
function flyIn(el){
  const deck=$('#deck').getBoundingClientRect(),r=el.getBoundingClientRect();
  el.style.transition='none';el.style.transform=`translate(${deck.left-r.left}px,${deck.top-r.top}px) rotate(-14deg)`;
  void el.offsetWidth;el.style.transition='transform .4s cubic-bezier(.2,.85,.25,1)';el.style.transform='';
}
async function deal(who,down=false){
  let c;
  if(who==='p'){if(!S.draw.length){S.draw=shuffle(S.discard);S.discard=[];sfx.shuffle();toast('버린 카드를 다시 섞었습니다');}c=S.draw.pop();S.peek=false;}
  else{if(!S.shoe.length)S.shoe=newDeck();c=S.shoe.pop();}
  const el=cardEl(c,down);
  if(who==='p'){S.player.push(c);S.pEls.push(el);$('#pHand').appendChild(el);}
  else{S.dealer.push(c);S.dEls.push(el);$('#dHand').appendChild(el);if(down&&hasCharm('xray'))el.classList.add('peek');}
  flyIn(el);sfx.card();updateTotals();
  await sleep(240);
}
async function reveal(){
  if(S.holeRevealed)return;S.holeRevealed=true;
  S.dEls.forEach(el=>{if(el.classList.contains('down')){el.classList.remove('down','peek');}});sfx.flip();
  updateTotals();await sleep(380);
}
async function clearTable(){
  const els=[...S.pEls,...S.dEls];if(els.length)sfx.sweep();els.forEach(e=>e.classList.add('leave'));
  if(els.length)await sleep(300);
  $('#pHand').innerHTML='';$('#dHand').innerHTML='';
}
