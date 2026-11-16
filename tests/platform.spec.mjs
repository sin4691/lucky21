import { test, expect } from '@playwright/test';
import { boot, startAt, waitIdle, standWith, rigNextHand } from './helpers.mjs';

test.describe('웹 체험판', () => {
  test('4스테이지를 깨면 체험판 종료 안내와 플레이 스토어 링크', async ({ page }) => {
    await boot(page);
    await expect(page.locator('.trial-badge')).toBeVisible();
    await startAt(page, 4);
    await standWith(page, 99999);
    await expect(page.locator('#getApp')).toBeVisible({ timeout: 15_000 });
    expect(await page.locator('#getApp').getAttribute('href')).toContain('play.google.com/store/apps/details?id=com.sin4691.lucky21');
    expect(await page.evaluate(() => [S.over, loadSave()])).toEqual([true, null]);
  });

  test('3스테이지까지는 평소처럼 상점으로, 광고 버튼 없음', async ({ page }) => {
    await boot(page);
    await startAt(page, 3);
    await standWith(page, 99999);
    await page.waitForFunction(() => document.querySelector('#overlay.on'), null, { timeout: 15_000 });
    await expect(page.locator('#getApp')).toHaveCount(0);
    await page.evaluate(() => { closePanel(); S.busy = false; openShop(); });
    await expect(page.locator('#reroll')).toBeVisible();
    await expect(page.locator('#adReroll')).toHaveCount(0);
  });
});

test.describe('앱 (가짜 플러그인)', () => {
  test('체험판 표시 없음, 광고 초기화', async ({ page }) => {
    await boot(page, { app: true });
    await expect(page.locator('.trial-badge')).toHaveCount(0);
    await page.waitForFunction(() => adsReady);
    expect(await page.evaluate(() => __ads[0])).toBe('init');
  });

  test('마지막 기회: 광고 실패 → 그대로, 성공 → 1번 더, 두 번째는 없음 @mobile', async ({ page }) => {
    await boot(page, { app: true });
    await page.waitForFunction(() => adsReady);
    await startAt(page, 5);
    await page.evaluate(() => { S.handsLeft = 1; S.score = 0; onStand(); });
    await expect(page.locator('#adYes')).toBeVisible({ timeout: 15_000 });
    expect(await page.evaluate(() => loadSave().handsLeft)).toBe(0);

    await page.evaluate(() => { __adFail = true; });
    await page.click('#adYes');
    await expect(page.locator('#adYes')).toBeEnabled();

    await page.evaluate(() => { __adFail = false; });
    await rigNextHand(page);
    await page.click('#adYes');
    await waitIdle(page);
    expect(await page.evaluate(() => [S.revived, S.handsLeft, S.over])).toEqual([true, 1, false]);

    await page.evaluate(() => { S.score = 0; onStand(); });
    await page.waitForFunction(() => S.over, null, { timeout: 15_000 });
    await expect(page.locator('#adYes')).toHaveCount(0);
  });

  test('마지막 기회 화면에서 앱을 껐다 켜도 같은 선택지', async ({ page }) => {
    await boot(page, { app: true });
    await page.waitForFunction(() => adsReady);
    await startAt(page, 5);
    await page.evaluate(() => { S.handsLeft = 1; S.score = 0; onStand(); });
    await expect(page.locator('#adYes')).toBeVisible({ timeout: 15_000 });
    await boot(page, { app: true, keep: true });
    await page.click('#cont');
    await expect(page.locator('#adYes')).toBeVisible();
  });

  test('상점 무료 새로고침은 상점마다 1번', async ({ page }) => {
    await boot(page, { app: true });
    await page.waitForFunction(() => adsReady);
    await startAt(page, 2);
    await page.evaluate(() => { closePanel(); S.busy = false; openShop(); });
    const gold = await page.evaluate(() => S.gold);
    await page.click('#adReroll');
    await expect(page.locator('#adReroll')).toHaveCount(0);
    expect(await page.evaluate(() => [S.adReroll, S.gold])).toEqual([true, gold]);
  });

  test('클라우드: 빈 기기에서 시작하면 다른 기기의 기록을 받아온다', async ({ page }) => {
    const remote = JSON.stringify({ v: 1, at: 1, rec: { stage: 9, hand: 5000, wins: 0 },
      meta: { charms: ['spade', 'ace'], tricks: [], bosses: [], achs: ['reach4'], bossClears: 3 },
      stats: { runs: 7, bestHand: 5000 }, save: null, settings: { speed: 2, vol: 0.5, vib: true }, cleared: 0 });
    await boot(page, { app: true, cloud: remote });
    await page.waitForFunction(() => loadRec().stage === 9, null, { timeout: 10_000 });
    expect(await page.evaluate(() => [META.charms.length, STATS.runs, SETTINGS.speed])).toEqual([2, 7, 2]);
    await page.evaluate(() => openPause());
    await expect(page.locator('#pzCloud')).toBeVisible();
  });

  test('클라우드 합치기 규칙', async ({ page }) => {
    await boot(page, { app: true });
    const r = await page.evaluate(() => {
      const a = { at: 10, rec: { stage: 3, hand: 900 }, meta: { charms: ['a'], achs: [] }, stats: { runs: 2 }, save: { at: 5 }, cleared: 8 };
      const b = { at: 3, rec: { stage: 7, hand: 100 }, meta: { charms: ['b'], achs: ['x'] }, stats: { runs: 5 }, save: { at: 5 }, cleared: 0 };
      const m = mergeBlobs(a, b);
      return { stage: m.rec.stage, hand: m.rec.hand, charms: m.meta.charms.sort(), runs: m.stats.runs, save: m.save };
    });
    // 최고 기록은 큰 값, 도감은 합집합, 통계는 큰 값, 끝난 판(cleared 이후)은 되살아나지 않음
    expect(r).toEqual({ stage: 7, hand: 900, charms: ['a', 'b'], runs: 5, save: null });
  });
});
