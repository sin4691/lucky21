// 안드로이드 리소스·매니페스트 XML 검사.
// release 빌드는 debug보다 엄격해서, 주석 안의 "--" 같은 문제가 debug에서는 안 보이다가 출시 빌드에서야 터진다.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'app', 'android', 'app', 'src', 'main');
async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p); else if (p.endsWith('.xml')) yield p;
  }
}
const problems = [];
let count = 0;
for await (const file of walk(root)) {
  count++;
  const s = await readFile(file, 'utf8');
  const rel = file.slice(root.length + 1);
  if (!s.trimStart().startsWith('<')) problems.push(`${rel}: XML로 시작하지 않음`);
  for (const m of s.matchAll(/<!--([\s\S]*?)-->/g)) {
    if (m[1].includes('--')) problems.push(`${rel}: 주석 안에 "--" (${m[0].slice(0, 60)})`);
  }
  // 태그 짝 맞춤 (간단한 검사: 열고 닫는 태그 이름이 순서대로 맞는지)
  const body = s.replace(/<!--[\s\S]*?-->/g, '').replace(/<\?[\s\S]*?\?>/g, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  const stack = [];
  for (const t of body.matchAll(/<(\/?)([A-Za-z_][\w.:-]*)[^>]*?(\/?)>/g)) {
    const [, close, name, self] = t;
    if (self) continue;
    if (!close) stack.push(name);
    else if (stack.pop() !== name) { problems.push(`${rel}: </${name}> 짝이 맞지 않음`); break; }
  }
  if (stack.length) problems.push(`${rel}: 닫히지 않은 태그 <${stack.at(-1)}>`);
  if (rel.endsWith('strings.xml') && /<string name="admob_app_id">\s*<\/string>/.test(s)) problems.push(`${rel}: admob_app_id가 비어 있음`);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`OK  XML ${count}개`);
