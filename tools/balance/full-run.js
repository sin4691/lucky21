// 판 전체 시뮬레이션: 12스테이지 동안 상점에서 부적·맞춤 카드를 사고 덱을 정리하는 봇을 여러 판 돌린다.
// 사용법: node tools/balance/full-run.js [판 수] ["[목표 점수 배열]"]
// 결과: clear(클리어율), survive(스테이지별 도달률), capacity(스테이지별 6핸드 점수 5·10·25·50 백분위)
const fs=require('fs'),vm=require('vm'),path=require('path');
const R=path.join(__dirname,'../../');
const ctx={console,Math,t:(k,p)=>k,S:null};vm.createContext(ctx);
const load=f=>vm.runInContext(fs.readFileSync(R+f,'utf8').replace(/'use strict';/,'').replace(/^const /gm,'var ').replace(/^let /gm,'var '),ctx);
vm.runInContext("var UID=0;function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}var rnd=a=>a[Math.floor(Math.random()*a.length)];",ctx);
['js/game/cards.js','js/data/stages.js','js/data/charms.js'].forEach(load);
vm.runInContext(fs.readFileSync(path.join(__dirname,'core.js'),'utf8'),ctx);
ctx.SOLO=JSON.parse(fs.readFileSync(path.join(__dirname,'charm-power.json'),'utf8')).charms;
if(process.argv[3])vm.runInContext('TARGETS='+process.argv[3],ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'run-core.js'),'utf8'),ctx);
console.log(JSON.stringify(ctx.runMany(+process.argv[2]||2000)));
