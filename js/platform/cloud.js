// 클라우드 저장 (앱 전용, 구글 플레이 게임즈 '저장된 게임').
// 네이티브 쪽은 app/android/.../CloudSavePlugin.java. 플레이 게임즈 프로젝트 ID가 설정돼 있지 않으면 조용히 꺼진다.
// 저장 대상: 최고 기록, 도감·업적, 통계, 이어하기, 설정. 기기 간에 합칠 때는 '더 진행된 쪽'을 고른다.
'use strict';

const CloudSave=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.CloudSave;
const CLOUD_KEYS={rec:'lucky21.rec',meta:'lucky21.meta',stats:'lucky21.stats',save:'lucky21.save',settings:'lucky21.settings',cleared:'lucky21.saveCleared'};
const CLOUD={available:false,signedIn:false,lastSync:0,busy:false};

const readLS=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};
const writeLS=(k,v)=>{try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
function localBlob(){const b={v:1,at:Date.now()};for(const [k,key] of Object.entries(CLOUD_KEYS))b[k]=readLS(key);return b;}

// 두 기기의 기록 합치기
function mergeBlobs(a,b){
  if(!a)return b;if(!b)return a;
  const out={v:1,at:Math.max(a.at||0,b.at||0)};
  const ra=a.rec||{},rb=b.rec||{};
  out.rec={stage:Math.max(ra.stage||0,rb.stage||0),hand:Math.max(ra.hand||0,rb.hand||0),wins:Math.max(ra.wins||0,rb.wins||0),endless:Math.max(ra.endless||0,rb.endless||0)};
  const ma=a.meta||{},mb=b.meta||{},uni=k=>[...new Set([...(ma[k]||[]),...(mb[k]||[])])];
  out.meta={charms:uni('charms'),tricks:uni('tricks'),bosses:uni('bosses'),achs:uni('achs'),bossClears:Math.max(ma.bossClears||0,mb.bossClears||0)};
  // 통계는 두 기기의 값을 더하면 중복될 수 있어서 항목별로 큰 쪽을 쓴다
  const sa=a.stats||{},sb=b.stats||{};out.stats={};
  for(const k of new Set([...Object.keys(sa),...Object.keys(sb)]))out.stats[k]=Math.max(sa[k]||0,sb[k]||0);
  // 이어하기와 설정은 더 최근 것
  // 이어하기: 더 최근 것. 단, 그 뒤에 어느 기기에서든 판이 끝났으면(cleared) 지운다
  const sva=a.save,svb=b.save;out.save=!sva?svb:!svb?sva:((sva.at||0)>=(svb.at||0)?sva:svb);
  out.cleared=Math.max(+a.cleared||0,+b.cleared||0);
  if(out.save&&(out.save.at||0)<=out.cleared)out.save=null;
  out.settings=(a.at||0)>=(b.at||0)?(a.settings||b.settings):(b.settings||a.settings);
  return out;
}
function applyBlob(b){
  for(const [k,key] of Object.entries(CLOUD_KEYS))writeLS(key,b[k]);
  // 메모리에 올라와 있는 값도 새로 고친다 (안 그러면 다음 저장 때 합친 내용이 덮어써진다)
  META=loadMeta();Object.assign(STATS,b.stats||{});
  if(b.settings){Object.assign(SETTINGS,b.settings);applySettings();}
}

async function cloudStatus(){
  if(!IS_APP||!CloudSave)return;
  try{const s=await CloudSave.status();CLOUD.available=!!s.available;CLOUD.signedIn=!!s.signedIn;}catch(e){CLOUD.available=false;}
}
// 앱 시작 시: 클라우드에서 받아 합친 뒤 다시 올린다. 바뀐 게 있으면 화면을 다시 그린다.
async function cloudSync(){
  if(!CLOUD.available||!CLOUD.signedIn||CLOUD.busy)return false;
  CLOUD.busy=true;
  try{
    const r=await CloudSave.load();
    const remote=r&&r.data?JSON.parse(r.data):null;
    const local=localBlob(),merged=mergeBlobs(local,remote);
    const changed=JSON.stringify({...merged,at:0})!==JSON.stringify({...local,at:0});
    applyBlob(merged);
    await CloudSave.save({data:JSON.stringify({...merged,at:Date.now()}),description:`LUCKY 21 · ${t('ui.recBest')} ${merged.rec.stage||0}`});
    CLOUD.lastSync=Date.now();
    return changed;
  }catch(e){return false;}finally{CLOUD.busy=false;}
}
// 진행 중 저장: 너무 자주 올리지 않도록 몇 초 모았다가 한 번에
let cloudTimer=0;
function cloudPush(){
  if(!IS_APP||!CLOUD.available||!CLOUD.signedIn)return;
  clearTimeout(cloudTimer);
  cloudTimer=setTimeout(async()=>{
    if(CLOUD.busy)return;CLOUD.busy=true;
    try{await CloudSave.save({data:JSON.stringify(localBlob()),description:'LUCKY 21'});CLOUD.lastSync=Date.now();}catch(e){}
    CLOUD.busy=false;
  },4000);
}
async function cloudSignIn(){
  if(!CloudSave)return;
  try{const s=await CloudSave.signIn();CLOUD.signedIn=!!s.signedIn;}catch(e){}
  if(CLOUD.signedIn){const changed=await cloudSync();if(changed&&(!S||S.over))title();toast(t('cloud.synced'));}
  else toast(t('cloud.signInFailed'));
}
// 앱 시작 시. 다른 기기의 진행이 합쳐졌으면 타이틀(이어하기·최고 기록)을 다시 그린다
async function initCloud(){
  await cloudStatus();
  if(CLOUD.signedIn&&await cloudSync()&&(!S||S.over))title();
}
