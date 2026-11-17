// 버그 사냥 봇: 실제 게임을 브라우저에서 처음부터 끝까지 자동으로 플레이한다.
//   node tools/bot/soak.mjs [판 수=20] [--rich] [--app] [--seed=N]
// --rich : 시작 골드를 크게 줘서 상점에서 많이 사게 함 (부적·카드 조합을 넓게 시험)
// --app  : 앱 환경 흉내 (광고·클라우드 가짜 플러그인, 체험판 제한 없음)
// 잡는 것: 페이지 오류, 콘솔 오류, 멈춤(진행 없음), 숫자 이상(NaN·음수·무한), 카드 수 불일치
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { APP_MOCK } from '../../tests/helpers.mjs';

const args = process.argv.slice(2);
const RUNS = Number(args.find(a => /^\d+$/.test(a)) || 20);
const RICH = args.includes('--rich');
const APP = args.includes('--app') || true; // 12스테이지 + 무한까지 보려면 앱 모드 (웹은 4스테이지에서 끝남)
const SEED = Number((args.find(a => a.startsWith('--seed=')) || '--seed=1').split('=')[1]);
const PORT = Number(process.env.BOT_PORT || 4174);
const STALL_MS = 25_000;
const MAX_STAGE = 16; // 12스테이지 + 무한 모드 4스테이지까지

const server = spawn(process.execPath, ['tools/serve.mjs', String(PORT)], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 600));

const browser = await chromium.launch();
const problems = [];
const summary = [];

try {
  for (let run = 1; run <= RUNS; run++) {
    const page = await browser.newPage({ viewport: { width: run % 3 === 0 ? 390 : 1366, height: run % 3 === 0 ? 844 : 800 } });
    const tag = `#${run}`;
    page.on('pageerror', e => problems.push(`${tag} 페이지 오류: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|net::|Failed to load resource/.test(m.text())) problems.push(`${tag} 콘솔 오류: ${m.text()}`); });
    page.on('response', r => { if (r.status() === 404 && !/fonts\.g/.test(r.url())) problems.push(`${tag} 파일 없음(404): ${r.url().replace(/^https?:\/\/[^/]+/, '')}`); });
    if (APP) await page.addInitScript(APP_MOCK(''));
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem('lucky21.lang', 'ko'); localStorage.setItem('lucky21.tut', 'done'); });
    await page.reload();
    await page.waitForSelector('h1.brand');

    // 판 시작: 덱 무작위, (선택) 부자 모드
    await page.evaluate(({ seed, rich }) => {
      let x = seed; window.__r = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
      muted = true; SPEED = 0.02;
      closePanel(); newRun();
      if (rich) S.gold = 300;
    }, { seed: SEED * 1000 + run, rich: RICH });
    await page.evaluate(() => startStage());

    let last = Date.now(), lastKey = '', end = null, steps = 0;
    while (!end) {
      steps++;
      const st = await page.evaluate(() => {
        const on = id => { const e = document.getElementById(id); return !!(e && e.offsetParent !== null && !e.disabled); };
        const bad = [];
        for (const k of ['score', 'gold', 'handsLeft', 'target', 'stage']) {
          const v = S[k];
          if (typeof v !== 'number' || !Number.isFinite(v)) bad.push(`${k}=${v}`);
          else if (v < 0 && k !== 'score') bad.push(`${k}=${v} (음수)`);
        }
        const onTable = S.player.length + (S.pEls ? 0 : 0);
        const deckCount = S.draw.length + S.discard.length + S.player.length;
        if (!S.over && !S.busy && !document.querySelector('#overlay.on') && deckCount > S.myDeck.length) bad.push(`카드 수 ${deckCount} > 덱 ${S.myDeck.length}`);
        return {
          over: S.over, busy: S.busy, stage: S.stage, hands: S.handsLeft, score: S.score, gold: S.gold, endless: !!S.endless,
          overlay: !!document.querySelector('#overlay.on'), bad,
          btn: ['goStage', 'toShop', 'nextStage', 'pickCancel', 'adYes', 'endless', 'again', 'getApp', 'cl', 'deckClose']
            .filter(on),
          canHit: on('btnHit'), canStand: on('btnStand'), total: S.player.length ? total(S.player).t : 0,
          tricks: S.tricks ? S.tricks.length : 0,
        };
      });
      for (const b of st.bad) problems.push(`${tag} 숫자 이상 (스테이지 ${st.stage}): ${b}`);
      if (st.bad.length) { end = 'bad'; break; }

      const key = JSON.stringify([st.stage, st.hands, st.score, st.overlay, st.btn, st.busy]);
      if (key !== lastKey) { lastKey = key; last = Date.now(); }
      else if (Date.now() - last > STALL_MS) {
        const html = await page.evaluate(() => (document.querySelector('#overlay.on')?.innerText || document.querySelector('#overlay.on')?.innerHTML || '').replace(/\s+/g, ' ').slice(0, 300));
        problems.push(`${tag} 멈춤: ${key} 화면: ${html}`); end = 'stall'; break; }

      if (st.stage > MAX_STAGE) { end = `무한 ${st.stage - 12}`; break; }
      if (st.over && (st.btn.includes('again') || st.btn.includes('getApp'))) {
        end = st.endless ? `무한 모드 탈락 (스테이지 ${st.stage})` : `탈락 (스테이지 ${st.stage})`; break;
      }
      if (st.btn.includes('adYes')) {           // 마지막 기회: 절반은 광고 보기
        await page.click(Math.random() < 0.5 ? '#adYes' : '#adNo'); continue;
      }
      if (st.btn.includes('endless')) { await page.click('#endless'); continue; } // 12스테이지 클리어 → 무한 모드
      if (st.btn.includes('pickCancel')) {       // 카드 고르기 창 (강화·제거): 무작위로 1~2장 고르고 확인
        await page.evaluate(() => {
          const cards = [...document.querySelectorAll('#gridHost .card')].filter(c => !c.classList.contains('used'));
          const n = 1 + Math.floor(__r() * 2);
          for (let i = 0; i < n && cards.length; i++) cards.splice(Math.floor(__r() * cards.length), 1)[0].click();
        });
        await page.waitForTimeout(40);
        if (await page.evaluate(() => { const ok = document.getElementById('pickOk'); return !!ok && !ok.disabled; })) await page.click('#pickOk');
        else if (await page.evaluate(() => !!document.getElementById('pickCancel'))) await page.click('#pickCancel');
        continue;
      }
      if (st.btn.includes('goStage')) { await page.click('#goStage'); continue; }
      if (st.btn.includes('toShop')) { await page.click('#toShop'); continue; }
      if (st.btn.includes('nextStage')) {        // 상점: 살 수 있는 것 무작위로 몇 개 사고 다음으로
        await page.evaluate(() => {
          for (let i = 0; i < 6; i++) {
            const bs = [...document.querySelectorAll('#offers button, #cardOffers button, #trickOffers button, #adReroll')]
              .filter(b => !b.disabled && b.offsetParent !== null);
            if (!bs.length) break;
            bs[Math.floor(__r() * bs.length)].click();
            if (document.getElementById('pickCancel')) break;
          }
          if (S.charms.length > 1 && __r() < 0.3) S.charms.reverse(); // 부적 순서 바꾸기도 시험
        });
        await page.waitForTimeout(50);
        if (await page.evaluate(() => !document.getElementById('pickCancel') && !document.getElementById('adYes'))) await page.click('#nextStage').catch(() => {});
        continue;
      }
      if (!st.busy && !st.overlay && (st.canHit || st.canStand)) {
        // 가끔 트릭 사용, 기본은 17 미만이면 히트
        if (st.tricks && Math.random() < 0.15) await page.evaluate(() => useTrick(0)).catch(() => {});
        else if (st.canHit && st.total < 17) await page.click('#btnHit');
        else await page.click('#btnStand');
        continue;
      }
      await page.waitForTimeout(40);
    }
    const info = await page.evaluate(() => ({ charms: S.charms.map(c => c.id).join(','), deck: S.myDeck.length, best: S.bestInfo?.pts || 0 }));
    summary.push(`${tag} ${end}  · 부적 ${info.charms || '-'} · 덱 ${info.deck}장 · 최고 핸드 ${info.best}`);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(summary.join('\n'));
if (problems.length) { console.log(`\n문제 ${problems.length}건:\n` + [...new Set(problems)].join('\n')); process.exit(1); }
console.log(`\n${RUNS}판, 문제 없음`);
