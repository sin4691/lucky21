// 부적 세기 측정: 부적 하나만 장착했을 때 '부적 없음 대비 핸드당 점수 배율'을 몬테카를로로 잰다.
// 사용법: node tools/balance/charm-power.js [핸드 반복 수] > tools/balance/charm-power.json
const fs=require('fs'),vm=require('vm'),path=require('path');
const R=path.join(__dirname,'../../');
const ctx={console,Math,t:(k,p)=>k,S:null};vm.createContext(ctx);
const load=f=>vm.runInContext(fs.readFileSync(R+f,'utf8').replace(/'use strict';/,'').replace(/^const /gm,'var ').replace(/^let /gm,'var '),ctx);
vm.runInContext("var UID=0;function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}",ctx);
['js/game/cards.js','js/data/stages.js','js/data/charms.js'].forEach(load);
vm.runInContext(fs.readFileSync(path.join(__dirname,'core.js'),'utf8'),ctx);
const N=+process.argv[2]||20000;
console.log(JSON.stringify(ctx.measure(N),null,1));
