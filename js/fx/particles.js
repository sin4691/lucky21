// 연출: 캔버스 파티클, 떠오르는 숫자, 화면 흔들림, 코인 비행, 카운트업.
'use strict';

/* ---------------- fx: particles / popups ---------------- */
const cv=$('#fx'),cx=cv.getContext('2d');let parts=[];
function resize(){const d=devicePixelRatio||1;cv.width=innerWidth*d;cv.height=innerHeight*d;cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';cx.setTransform(d,0,0,d,0,0);}
addEventListener('resize',resize);resize();
function burst(x,y,n=24,colors=['#e8c46a','#fff3c4','#c9a35a'],power=6){
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=(.4+Math.random())*power;
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-power*.5,life:1,decay:.012+Math.random()*.02,size:2+Math.random()*4,c:rnd(colors),rot:Math.random()*6,vr:(Math.random()-.5)*.4,sq:Math.random()<.5});}
}
function loop(){
  cx.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(p=>p.life>0);
  for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=.22;p.vx*=.985;p.life-=p.decay;p.rot+=p.vr;
    cx.save();cx.globalAlpha=Math.max(0,p.life);cx.translate(p.x,p.y);cx.rotate(p.rot);cx.fillStyle=p.c;
    if(p.sq)cx.fillRect(-p.size/2,-p.size,p.size,p.size*2);else{cx.beginPath();cx.arc(0,0,p.size/2,0,7);cx.fill();}
    cx.restore();}
  requestAnimationFrame(loop);
}
loop();
function center(el){const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,top:r.top};}
function pop(el,text,kind='info',dy=0){
  const p=center(el);const d=document.createElement('div');d.className='pop '+kind;d.textContent=text;
  d.style.left=p.x+'px';d.style.top=(p.top+dy)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),1000);
}
function shake(strong){const a=$('#app');a.classList.remove('shake','shake2');void a.offsetWidth;a.classList.add(strong?'shake2':'shake');}
async function flyDots(fromEl,toEl,n=10){
  const a=center(fromEl),b=center(toEl);
  for(let i=0;i<n;i++){
    const d=document.createElement('div');d.className='dot';d.style.left=(a.x+(Math.random()-.5)*60)+'px';d.style.top=(a.y+(Math.random()-.5)*30)+'px';
    document.body.appendChild(d);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{const r=d.getBoundingClientRect();d.style.transform=`translate(${b.x-r.left}px,${b.y-r.top}px) scale(.6)`;d.style.opacity='.2';}));
    setTimeout(()=>d.remove(),620);
    await sleep(28);
  }
  await sleep(480);
}
function countTo(el,from,to,dur=600){
  return new Promise(res=>{const t0=performance.now();dur*=SPEED;
    const step=t=>{const k=Math.min(1,(t-t0)/dur);const e=1-Math.pow(1-k,3);el.textContent=fmt(from+(to-from)*e);if(k<1)requestAnimationFrame(step);else res();};
    requestAnimationFrame(step);});
}
