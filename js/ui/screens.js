// 패널 열기/자동 축소, 규칙·타이틀·데모·게임 오버·승리 화면.
'use strict';

/* ---------------- screens ---------------- */
function openPanel(html,cls=''){
  const o=$('#overlay'),old=o.querySelector('.panel');
  const keep=o.classList.contains('on')&&old&&cls&&old.dataset.kind===cls?old.scrollTop:0;
  o.innerHTML=`<div class="panel ${cls}" data-kind="${cls}">${html}</div>`;
  if(keep)o.firstElementChild.style.animation='none';
  o.classList.add('on');document.body.classList.add('locked');
  // 상점·덱 보기처럼 openPanel 다음에 내용을 채워 넣는 화면이 있어서, 채운 뒤에 크기를 잰다
  const p=o.firstElementChild;
  queueMicrotask(()=>{fitPanel();if(keep)p.scrollTop=keep;});
}
// 패널이 화면보다 길면 같은 디자인 그대로 비율만 줄여서 한 화면에 맞춘다.
// 너무 작아지면(덱 보기처럼 내용이 아주 긴 경우) 최소 비율에서 멈추고 스크롤한다.
function fitPanel(){
  const o=$('#overlay'),p=o.querySelector('.panel');if(!p)return;
  p.style.zoom='';p.style.width='';p.style.maxHeight='none';
  const cs=getComputedStyle(o),availH=innerHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
  const availW=o.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  const maxW=parseFloat(getComputedStyle(p).maxWidth)||availW;
  let h=p.scrollHeight;
  if(h<=availH){p.style.maxHeight='';return;}
  // 폴드 커버처럼 아주 좁은 폰은 글자가 읽히도록 덜 줄인다
  const MIN=innerWidth>=820&&innerHeight>=520?.62:innerWidth<340?.62:.5;
  let k=Math.max(MIN,availH/h);
  // 줄어든 만큼 폭을 넓혀서 다시 재고 한 번 더 맞춘다 (폭이 넓어지면 높이가 줄어듦)
  p.style.width=Math.min(maxW,availW/k)+'px';h=p.scrollHeight;
  k=Math.max(MIN,Math.min(1,availH/h));
  p.style.width=Math.min(maxW,availW/k)+'px';
  p.style.zoom=k;p.style.maxHeight=(availH/k)+'px';
}
addEventListener('resize',()=>{if($('#overlay').classList.contains('on'))fitPanel();});
function closePanel(){$('#overlay').classList.remove('on');document.body.classList.remove('locked');}
function rulesHtml(){
  return `<div class="rules">
    ${['beat','target','charms','deck','boss','bust','trick','endless'].map(k=>`<div>${t('rules.'+k)}</div>`).join('')}
  </div>
  <div class="ptable">
    ${[['win',2],['bj',4],['push',1]].map(([k,m])=>`<div>${t('rules.'+k)}<b><span class="c">${t('rules.chips')}</span> × <span class="m">${m}</span></b></div>`).join('')}
    <div>${t('rules.dd')}<b><span class="m">${t('rules.final2')}</span></b></div>
  </div>
  <p style="font-size:12.5px;color:var(--muted)">${t('rules.cardChips')}</p>`;
}
// 언어 선택. 고르면 저장하고 새로고침해서 모든 글을 다시 그린다 (진행 중인 판은 마지막 저장 지점에서 이어짐).
function openLangPicker(back){
  openPanel(`<div class="sub">LANGUAGE</div><h2>${t('ui.language')}</h2>
    <div class="lang-grid">${LANGS.map(([c,n])=>`<button class="lang-opt${c===LANG?' on':''}" data-lang="${c}">${n}</button>`).join('')}</div>
    <div class="actions"><button class="btn small" id="langClose">${t('ui.close')}</button></div>`,'lang');
  document.querySelectorAll('.lang-opt').forEach(b=>b.onclick=()=>{sfx.click();if(b.dataset.lang===LANG){back?back():closePanel();return;}setLang(b.dataset.lang);});
  $('#langClose').onclick=()=>{sfx.click();back?back():closePanel();};
}
function title(){
  const sv=loadSave();
  newRun();renderSide();renderCharms();$('.logo').innerHTML='LUCKY 21<small>BLACKJACK ROGUELIKE</small>';
  openPanel(`<button class="linkbtn lang-btn" id="titleLang">🌐 ${LANGS.find(l=>l[0]===LANG)[1]}</button><h1 class="brand">LUCKY 21</h1><div class="sub">BLACKJACK ROGUELIKE</div>
    <ul class="pitch">
      <li>${t('title.p1')}</li>
      <li>${t('title.p2')}</li>
      <li>${t('title.p3')}</li>
    </ul>
    <p class="pitch-note">${t('title.note')}</p>
    <div class="actions" style="justify-content:space-between">${recHtml()||'<span></span>'}
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end"><button class="btn teal" id="demo">${t('title.demo')}<small>${t('title.demoSub')}</small></button>${sv?`<button class="btn" id="cont">${t('title.cont')}<small>STAGE ${sv.stage}${sv.phase==='shop'||sv.phase==='clear'?t('title.shop'):''}</small></button>`:''}<button class="btn" id="go">${sv?t('title.newGame'):t('title.start')}<small>NEW RUN</small></button></div></div>`,'title');
  if(sv)$('#cont').onclick=()=>{ac();sfx.click();resumeRun();};
  $('#titleLang').onclick=()=>{sfx.click();openLangPicker(title);};
  $('#go').onclick=()=>{ac();sfx.click();openDeckSelect(sv);};
  $('#demo').onclick=()=>{ac();sfx.click();setupDemo();startStage();};
}
function setupDemo(){
  S.demo=true;S.gold=15;
  S.charms=['heart','seven','grow','exact','ace'].map(id=>makeCharm(CHARMS.find(c=>c.id===id)));
  // 하트 빌드: 낮은 클로버·스페이드 제거, 하트 강화
  S.myDeck=S.myDeck.filter(c=>!((c.s==='♣'||c.s==='♠')&&['2','3','4','5'].includes(c.r)));
  S.myDeck.forEach(c=>{if(c.s==='♥'&&['7','10','K'].includes(c.r))c.enh='gold';if(c.s==='♥'&&c.r==='A')c.enh='glass';if(c.s==='♦'&&c.r==='7')c.enh='lucky';});
  renderCharms();renderSide();
  $('.logo').innerHTML='LUCKY 21<span class="demo-badge">DEMO</span><small>BLACKJACK ROGUELIKE</small>';
}
function gameOver(){
  hideBanner();sfx.lose();saveRec(false);clearSave();
  openPanel(`<div class="sub">BANKRUPT</div><h1 style="color:#ff8a70">${t('end.bankrupt')}</h1>
    <p>${t('end.stoppedAt',{endless:S.endless?t('end.endlessPre'):'',n:S.stage,score:fmt(S.score),target:fmt(S.target)})}</p>
    <p>${t('end.best',{n:fmt(S.bestHand),charms:S.charms.map(c=>c.name).join(', ')||t('end.none')})}</p>
    <div class="actions"><button class="btn" id="again">${t('end.again')}</button></div>`);
  $('#again').onclick=()=>{sfx.click();title();};
}
function victory(){
  sfx.big();saveRec(true);clearSave();
  for(let i=0;i<5;i++)setTimeout(()=>burst(Math.random()*innerWidth,innerHeight*.3,60,['#e8c46a','#fff3c4','#7fe0d4','#e6a3ff'],10),i*250);
  openPanel(`<div class="sub">ALL 8 STAGES CLEARED</div><h1>${t('end.win')}</h1>
    <p>${t('end.winBest',{n:fmt(S.bestHand),charms:S.charms.map(c=>c.name).join(', ')||t('end.none')})}</p>
    <p style="font-size:13px">${t('end.endlessNote')}</p>
    <div class="actions"><button class="btn teal" id="endless">${t('end.endless')}<small>ENDLESS</small></button><button class="btn" id="again">${t('end.oneMore')}<small>NEW RUN</small></button></div>`);
  $('#again').onclick=()=>{sfx.click();title();};
  $('#endless').onclick=()=>{sfx.click();S.endless=true;stageClear();};
}
