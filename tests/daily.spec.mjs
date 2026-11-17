import { test, expect } from '@playwright/test';
import { boot } from './helpers.mjs';

const dailyStart = page => page.evaluate(() => { startDaily(); return { draw: S.draw.map(c => c.r + c.s).join(), shoe: S.shoe.slice(-6).map(c => c.r + c.s).join(), boss: S.nextBoss && S.nextBoss.id, offers: rollOffers().map(o => o.def.id).join() }; });

test('일일 도전: 같은 날이면 다른 기기에서도 같은 덱 순서·상점', async ({ browser }) => {
  const a = await browser.newPage(), b = await browser.newPage();
  await boot(a); await boot(b);
  const ra = await dailyStart(a), rb = await dailyStart(b);
  expect(ra).toEqual(rb);
  // 일반 판은 매번 다르다
  const n1 = await a.evaluate(() => { title(); newRun(); startStage(); return S.draw.map(c => c.r + c.s).join(); });
  const n2 = await b.evaluate(() => { title(); newRun(); startStage(); return S.draw.map(c => c.r + c.s).join(); });
  expect(n1).not.toEqual(n2);
  expect(n1).not.toEqual(ra.draw);
});

test('일일 도전: 이어하기 후에도 같은 난수 흐름, DAILY 표시', async ({ page }) => {
  await boot(page);
  await dailyStart(page);
  const before = await page.evaluate(() => { snapshot('hand'); return { rng: RNG.s, daily: S.daily }; });
  await boot(page, { keep: true });
  await page.click('#cont');
  const after = await page.evaluate(() => ({ rng: RNG.s, daily: S.daily, seeded: RNG.seeded, badge: !!document.querySelector('.daily-badge') }));
  expect(after).toEqual({ ...before, seeded: true, badge: true });
  // 타이틀로 나가면 고정 난수가 풀린다
  expect(await page.evaluate(() => { title(); return RNG.seeded; })).toBe(false);
});

test('일일 도전: 끝나면 오늘 기록이 남고 타이틀 버튼에 표시', async ({ page }) => {
  await boot(page);
  await dailyStart(page);
  await page.evaluate(() => { S.stage = 3; giveUp(); });
  const r = await page.evaluate(() => loadDaily());
  expect(r).toMatchObject({ stage: 3, tries: 1, cleared: false });
  await page.evaluate(() => title());
  await expect(page.locator('#daily small')).toHaveText(/3/);
});

test('모바일 상점: 상품을 누르면 설명 시트, 시트에서 구매 @mobile', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', '좁은 화면 전용');
  await boot(page);
  await page.evaluate(() => { closePanel(); newRun(); S.gold = 20; S.busy = false; openShop(); });
  // 좁은 화면에서는 설명이 숨겨진다
  expect(await page.locator('#offers .offer .od').first().isVisible()).toBe(false);
  await page.locator('#offers .offer').first().click({ position: { x: 20, y: 20 } });
  await expect(page.locator('#offerSheet .od')).toBeVisible();
  const name = await page.locator('#offerSheet .on').textContent();
  await page.click('#osBuy');
  await expect(page.locator('#offerSheet')).toHaveCount(0);
  expect(await page.evaluate(() => S.charms.map(c => c.name))).toContain(name);
});

test('데스크톱 상점은 설명을 그대로 보여 준다', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => { closePanel(); newRun(); S.busy = false; openShop(); });
  expect(await page.locator('#offers .offer .od').first().isVisible()).toBe(true);
  await page.locator('#offers .offer').first().click({ position: { x: 20, y: 20 } });
  await expect(page.locator('#offerSheet')).toHaveCount(0);
});
