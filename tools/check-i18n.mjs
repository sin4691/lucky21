// 번역 검사: ko.js(원문)에 있는 키가 다른 언어에 모두 있는지, {변수} 이름이 같은지 확인한다.
// 사용법: node tools/check-i18n.mjs
import fs from 'node:fs';
import vm from 'node:vm';
const dir = new URL('../js/i18n/', import.meta.url);
const ctx = { L: {} };
vm.createContext(ctx);
for (const f of fs.readdirSync(dir)) vm.runInContext(fs.readFileSync(new URL(f, dir), 'utf8'), ctx);
const ko = ctx.L.ko, vars = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
let bad = 0;
for (const [code, d] of Object.entries(ctx.L)) {
  if (code === 'ko') continue;
  const missing = Object.keys(ko).filter(k => !(k in d));
  const extra = Object.keys(d).filter(k => !(k in ko));
  const mismatch = Object.keys(d).filter(k => k in ko && vars(ko[k]) !== vars(d[k]));
  const ok = !missing.length && !extra.length && !mismatch.length;
  if (!ok) bad++;
  console.log(`${ok ? 'OK ' : 'ERR'} ${code.padEnd(8)} ${Object.keys(d).length}/${Object.keys(ko).length}` +
    (missing.length ? `  누락: ${missing.join(', ')}` : '') + (extra.length ? `  불필요: ${extra.join(', ')}` : '') +
    (mismatch.length ? `  변수 불일치: ${mismatch.join(', ')}` : ''));
}
process.exit(bad ? 1 : 0);
