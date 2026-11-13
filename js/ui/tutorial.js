// 첫 플레이 튜토리얼: 필요한 순간에 UI를 스포트라이트로 강조하는 말풍선.
'use strict';

/* ---------------- tutorial ---------------- */
const TUT_KEY='lucky21.tut';
function tutDone(){try{return localStorage.getItem(TUT_KEY)==='done';}catch(e){return false;}}
function setTutDone(v){try{v?localStorage.setItem(TUT_KEY,'done'):localStorage.removeItem(TUT_KEY);}catch(e){}}
const tutOn=()=>S&&S.tut&&!S.demo;
// 한 번만 보여 줄 단계. 이미 봤거나 튜토리얼이 꺼져 있으면 바로 넘어감
async function tutStep(id,steps){
  if(!tutOn()||S.tutSeen[id])return;S.tutSeen[id]=true;
  for(let i=0;i<steps.length;i++){if(!tutOn())return;await coach(steps[i],i,steps.length);}
  if(S.tutSeen.play&&S.tutSeen.score&&S.tutSeen.shop)setTutDone(true);
}
function coach({target,title,html},i,n){
  return new Promise(res=>{
    S.coaching=true;hideTip();
    const els=(Array.isArray(target)?target:[target]).map(t=>typeof t==='string'?$(t):t).filter(Boolean);
    const el=els[0];
    const rectOf=()=>{const rs=els.map(e=>e.getBoundingClientRect()).filter(r=>r.width||r.height);const l=Math.min(...rs.map(r=>r.left)),t=Math.min(...rs.map(r=>r.top)),R=Math.max(...rs.map(r=>r.right)),B=Math.max(...rs.map(r=>r.bottom));return{left:l,top:t,right:R,bottom:B,width:R-l,height:B-t};};
    if(el&&el.scrollIntoView){const r=el.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)el.scrollIntoView({block:'center'});}
    const spot=$('#coachSpot'),box=$('#coachBox'),cat=$('#coachCatch');
    const place=()=>{
      if(!el){spot.style.display='none';box.style.left='50%';box.style.top='50%';box.style.transform='translate(-50%,-50%)';return;}
      const r=rectOf(),pad=8;
      Object.assign(spot.style,{display:'block',left:(r.left-pad)+'px',top:(r.top-pad)+'px',width:(r.width+pad*2)+'px',height:(r.height+pad*2)+'px'});
      box.style.transform='none';
      const bw=Math.min(320,innerWidth-24),bh=box.offsetHeight||150;
      let x=Math.min(Math.max(12,r.left+r.width/2-bw/2),innerWidth-bw-12),y;
      const below=r.bottom+pad+12, above=r.top-pad-12-bh, midY=Math.min(Math.max(8,r.top+r.height/2-bh/2),innerHeight-bh-8);
      if(below+bh<=innerHeight-8)y=below;
      else if(r.right+pad+16+bw<=innerWidth-8){x=r.right+pad+16;y=midY;}
      else if(r.left-pad-16-bw>=8){x=r.left-pad-16-bw;y=midY;}
      else if(above>=8)y=above;
      else y=Math.max(8,innerHeight-bh-8);
      box.style.left=x+'px';box.style.top=y+'px';
    };
    box.innerHTML=`<div class="step">${t('ui.tutStep',{i:i+1,n})}</div><h4>${title}</h4><p>${html}</p>
      <div class="row2"><button class="skip" id="coachSkip">${t('ui.tutOff')}</button><button class="btn" id="coachOk">${i+1<n?t('ui.next'):t('ui.gotIt')}</button></div>`;
    box.style.display='block';cat.style.display='block';place();requestAnimationFrame(place);
    const onR=()=>place();addEventListener('resize',onR);
    const close=()=>{removeEventListener('resize',onR);box.style.display='none';spot.style.display='none';cat.style.display='none';S.coaching=false;sfx.click();res();};
    $('#coachOk').onclick=close;
    $('#coachSkip').onclick=()=>{S.tut=false;setTutDone(true);close();toast(t('ui.tutOffToast'));};
  });
}
