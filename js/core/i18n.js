// 다국어 지원. 화면에 나오는 모든 글은 t('키')로 가져오고, 언어별 문장은 js/i18n/<언어>.js에 있다.
// 언어는 저장된 선택 → 기기 언어 순서로 정하고, 없는 키는 한국어로 대신 보여 준다.
'use strict';

const LANGS=[
  ['ko','한국어'],['en','English'],['ja','日本語'],['zh-Hant','繁體中文'],
  ['es','Español'],['pt-BR','Português (BR)'],['de','Deutsch'],
];
const L={}; // L[언어] = {키: 문장}. 각 언어 파일이 채운다.
const LANG_KEY='lucky21.lang';

function detectLang(){
  try{const s=localStorage.getItem(LANG_KEY);if(s&&LANGS.some(l=>l[0]===s))return s;}catch(e){}
  for(const raw of (navigator.languages||[navigator.language||'en'])){
    const l=String(raw).toLowerCase();
    if(l.startsWith('ko'))return'ko';
    if(l.startsWith('ja'))return'ja';
    if(l.startsWith('zh'))return'zh-Hant';
    if(l.startsWith('es'))return'es';
    if(l.startsWith('pt'))return'pt-BR';
    if(l.startsWith('de'))return'de';
    if(l.startsWith('en'))return'en';
  }
  return'en';
}
let LANG=detectLang();

// t('key', {name:'값'}) → 해당 언어 문장. {name} 자리에 값이 들어간다.
function t(key,p){
  let s=(L[LANG]&&L[LANG][key]);
  if(s==null)s=L.ko&&L.ko[key];
  if(s==null)return key;
  if(p)s=s.replace(/\{(\w+)\}/g,(m,k)=>p[k]!=null?p[k]:m);
  return s;
}

function setLang(code){
  try{localStorage.setItem(LANG_KEY,code);}catch(e){}
  location.reload(); // 데이터·화면 문장을 처음부터 다시 그리는 가장 확실한 방법
}

// 부적·트릭·보스·덱·업적·강화 이름과 설명을 현재 언어로 채운다.
function localizeData(){
  const fill=(arr,pre)=>arr.forEach(o=>{o.name=t(`${pre}.${o.id}.n`);o.desc=t(`${pre}.${o.id}.d`);});
  fill(CHARMS,'ch');fill(TRICKS,'tr');fill(BOSSES,'bo');fill(DECKS,'dk');fill(ACHIEVEMENTS,'ac');
  for(const k of Object.keys(ENH)){ENH[k].name=t(`enh.${k}.n`);ENH[k].desc=t(`enh.${k}.d`);}
}

// index.html의 data-i18n="키" 요소에 문장을 넣는다.
function localizeDom(){
  document.documentElement.lang=LANG;
  // 일본어·중국어는 한자·가나 글꼴이 따로 필요하다. 앱은 로컬 글꼴(fonts.css)에 이미 들어 있고, 웹은 이때만 불러온다.
  const fam={ja:'Noto+Sans+JP','zh-Hant':'Noto+Sans+TC'}[LANG];
  if(fam&&!document.querySelector('link[href*="fonts/fonts.css"]')){
    const l=document.createElement('link');l.rel='stylesheet';
    l.href=`https://fonts.googleapis.com/css2?family=${fam}:wght@400;700;900&display=swap`;document.head.appendChild(l);
  }
  document.title=t('ui.docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.innerHTML=t(el.dataset.i18n);});
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{el.setAttribute('aria-label',t(el.dataset.i18nAria));});
}
