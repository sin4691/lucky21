// 웹 버전(../index.html, ../assets)을 앱용 www 폴더로 복사한다.
// - Google Fonts 링크를 로컬 글꼴(@fontsource)로 바꿔서 인터넷 없이도 글꼴이 나오게 한다.
// - 실제로 쓰는 글꼴 파일만 복사해서 앱 용량을 줄인다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '..');
const gameDir = path.resolve(appDir, '..');
const www = path.join(appDir, 'www');

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });

// 1) 게임 에셋
fs.cpSync(path.join(gameDir, 'assets'), path.join(www, 'assets'), { recursive: true });

// 2) 글꼴: 패키지별로 쓰는 CSS만 골라서, 그 CSS가 참조하는 파일만 복사
const FONT_CSS = [
  ['@fontsource/black-han-sans', ['index.css']],
  ['@fontsource/dm-serif-display', ['index.css']],
  ['@fontsource/noto-sans-kr', ['400.css', '700.css', '900.css']],
];
const imports = [];
let copied = 0;
for (const [pkg, cssFiles] of FONT_CSS) {
  const pkgDir = path.join(appDir, 'node_modules', pkg);
  const outDir = path.join(www, 'fonts', path.basename(pkg));
  fs.mkdirSync(path.join(outDir, 'files'), { recursive: true });
  for (const css of cssFiles) {
    // 안드로이드 WebView는 woff2를 지원하므로 woff 대체 경로는 빼서 용량을 절반으로 줄인다
    const text = fs.readFileSync(path.join(pkgDir, css), 'utf8').replace(/,\s*url\(\.\/files\/[^)]+\.woff\) format\('woff'\)/g, '');
    for (const m of text.matchAll(/url\(\.\/files\/([^)]+)\)/g)) {
      const f = m[1];
      const dst = path.join(outDir, 'files', f);
      if (!fs.existsSync(dst)) { fs.copyFileSync(path.join(pkgDir, 'files', f), dst); copied++; }
    }
    fs.writeFileSync(path.join(outDir, css), text);
    imports.push(`@import url("./${path.basename(pkg)}/${css}");`);
  }
}
fs.writeFileSync(path.join(www, 'fonts', 'fonts.css'), imports.join('\n') + '\n');

// 3) index.html: Google Fonts 링크 → 로컬 글꼴
let html = fs.readFileSync(path.join(gameDir, 'index.html'), 'utf8');
const before = html.length;
html = html.replace(/\s*<link rel="preconnect"[^>]*>/g, '');
html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="fonts/fonts.css">');
if (!html.includes('fonts/fonts.css')) throw new Error('글꼴 링크를 찾지 못했습니다. index.html의 <link> 태그를 확인하세요.');
fs.writeFileSync(path.join(www, 'index.html'), html);

console.log(`www 준비 완료: 글꼴 파일 ${copied}개, index.html ${before} → ${html.length} bytes`);
