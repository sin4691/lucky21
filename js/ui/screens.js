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
  const MIN=innerWidth<820?.5:.62;
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
    <div><b>딜러를 이기세요.</b> 이기면 손패의 카드 칩을 모두 더하고, 그 값에 배수를 곱한 만큼 점수를 얻어요.</div>
    <div><b>목표 점수.</b> 스테이지마다 정해진 핸드 안에 목표를 넘겨야 다음으로 갈 수 있어요. 8 스테이지를 깨면 승리.</div>
    <div><b>부적.</b> 상점에서 최대 5개까지 장착해요. 칩, 배수, ×배수를 더해 점수 공식을 비틀어요. 발동 순서는 왼쪽부터예요.</div>
    <div><b>내 덱.</b> 플레이어는 자기 덱에서 뽑고, 딜러는 따로 섞은 덱을 써요. 상점에서 카드를 추가·강화·제거해서 덱을 만들어요.</div>
    <div><b>보스.</b> 3·6·8 스테이지에는 규칙을 비트는 보스 10종 중 하나가 붙어요. 상점에서 미리 확인할 수 있어요.</div>
    <div><b>버스트 확률.</b> 남은 내 덱 기준으로 다음 히트의 버스트 확률이 표시돼요. 판단은 직접!</div>
    <div><b>트릭 카드.</b> 상점에서 사는 1회용 카드예요. 최대 2장, 부적 칸 오른쪽에서 눌러서 써요. 다음 카드 미리보기, 바꿔치기 등.</div>
    <div><b>엔드리스.</b> 8스테이지를 깨면 계속 이어서 할 수 있어요. 목표가 계속 오르고 2스테이지마다 보스가 나와요.</div>
  </div>
  <div class="ptable">
    <div>승리<b><span class="c">10</span> × <span class="m">2</span></b></div>
    <div>블랙잭<b><span class="c">25</span> × <span class="m">4</span></b></div>
    <div>푸시<b><span class="c">0</span> × <span class="m">1</span></b></div>
    <div>더블다운<b><span class="m">최종 ×2</span></b></div>
  </div>
  <p style="font-size:12.5px;color:var(--muted)">카드 칩: 숫자는 그대로, 그림카드 10, 에이스 11. 딜러는 17 이상에서 스탠드합니다.</p>`;
}
function title(){
  const sv=loadSave();
  newRun();renderSide();renderCharms();$('.logo').innerHTML='LUCKY 21<small>BLACKJACK ROGUELIKE</small>';
  openPanel(`<h1>LUCKY 21</h1><div class="sub">BLACKJACK ROGUELIKE</div>
    <ul class="pitch">
      <li><b>딜러를 이기면</b> 카드 칩 × 배수만큼 점수</li>
      <li><b>부적과 카드</b>로 나만의 덱과 점수 공식 만들기</li>
      <li><b>8 스테이지</b>의 목표 점수를 모두 넘기면 승리</li>
    </ul>
    <p class="pitch-note">처음이면 플레이하면서 하나씩 알려 드려요. 전체 규칙은 언제든 <b>규칙</b> 버튼에서 볼 수 있어요.</p>
    <div class="actions" style="justify-content:space-between">${recHtml()||'<span></span>'}
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end"><button class="btn teal" id="demo">데모 모드<small>빌드 완성 상태로 시작</small></button>${sv?`<button class="btn" id="cont">이어하기<small>STAGE ${sv.stage}${sv.phase==='shop'||sv.phase==='clear'?' · 상점':''}</small></button>`:''}<button class="btn" id="go">${sv?'새 게임':'게임 시작'}<small>NEW RUN</small></button></div></div>`,'title');
  if(sv)$('#cont').onclick=()=>{ac();sfx.click();resumeRun();};
  $('#go').onclick=()=>{ac();sfx.click();if(sv)clearSave();startStage();};
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
  openPanel(`<div class="sub">BANKRUPT</div><h1 style="color:#ff8a70">파산</h1>
    <p>${S.endless?'엔드리스 ':''}스테이지 <b>${S.stage}</b>에서 <b>${fmt(S.score)}</b> / ${fmt(S.target)}점으로 멈췄어요.</p>
    <p>최고 핸드 <b class="gold">${fmt(S.bestHand)}</b> · 부적 ${S.charms.map(c=>c.name).join(', ')||'없음'}</p>
    <div class="actions"><button class="btn" id="again">다시 하기</button></div>`);
  $('#again').onclick=()=>{sfx.click();title();};
}
function victory(){
  sfx.big();saveRec(true);clearSave();
  for(let i=0;i<5;i++)setTimeout(()=>burst(Math.random()*innerWidth,innerHeight*.3,60,['#e8c46a','#fff3c4','#7fe0d4','#e6a3ff'],10),i*250);
  openPanel(`<div class="sub">ALL 8 STAGES CLEARED</div><h1>하우스를 털었다</h1>
    <p>최고 핸드 <b class="gold">${fmt(S.bestHand)}</b>점 · 마지막 부적: ${S.charms.map(c=>c.name).join(', ')||'없음'}</p>
    <p style="font-size:13px">엔드리스로 계속하면 목표 점수가 스테이지마다 1.6배씩 오르고, 2스테이지마다 보스가 나와요.</p>
    <div class="actions"><button class="btn teal" id="endless">엔드리스로 계속<small>ENDLESS</small></button><button class="btn" id="again">한 판 더<small>NEW RUN</small></button></div>`);
  $('#again').onclick=()=>{sfx.click();title();};
  $('#endless').onclick=()=>{sfx.click();S.endless=true;stageClear();};
}
