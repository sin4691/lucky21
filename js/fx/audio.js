// 효과음: Web Audio API로 실시간 합성 (오디오 파일 없음).
'use strict';

/* ---------------- audio (WebAudio 합성) ---------------- */
let AC=null,muted=false;
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;}}return AC;}
function tone(f,d=.09,type='triangle',vol=.1,delay=0){const a=ac();if(!a||muted)return;const t=a.currentTime+delay;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.02);}
function noise(d=.07,vol=.18,freq=2600){const a=ac();if(!a||muted)return;const n=a.sampleRate*d,b=a.createBuffer(1,n,a.sampleRate),ch=b.getChannelData(0);for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();f.type='bandpass';f.frequency.value=freq;f.Q.value=.8;g.gain.value=vol;s.buffer=b;s.connect(f).connect(g).connect(a.destination);s.start();}
let pitch=0;
const sfx={
  card:()=>noise(.08,.22,2200+Math.random()*900),
  flip:()=>noise(.11,.2,1500),
  sweep:()=>{},
  shuffle:()=>{},
  chip:()=>{tone(520*Math.pow(2,pitch/12),.07,'triangle',.09);pitch=Math.min(pitch+1,24);},
  mult:()=>{tone(330*Math.pow(2,pitch/12),.1,'square',.05);pitch=Math.min(pitch+1,24);},
  xmult:()=>{tone(220,.18,'sawtooth',.06);tone(440*Math.pow(2,pitch/12),.2,'square',.05,.04);pitch=Math.min(pitch+2,24);},
  gold:()=>{tone(1320,.06,'sine',.08);tone(1760,.09,'sine',.07,.05);},
  win:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.25,'triangle',.08,i*.07)),
  big:()=>[392,523,659,784,1046,1318].forEach((f,i)=>tone(f,.35,'triangle',.08,i*.06)),
  lose:()=>{tone(196,.3,'sawtooth',.06);tone(147,.4,'sawtooth',.05,.12);},
  click:()=>tone(880,.04,'square',.04),
  buy:()=>{tone(988,.08,'triangle',.08);tone(1318,.12,'triangle',.08,.06);},
};
