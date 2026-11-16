import { test, expect } from '@playwright/test';
import { boot, startAt, waitIdle, standWith, rigNextHand } from './helpers.mjs';

test('타이틀 → 판 시작 → 핸드 한 번 @mobile', async ({ page }) => {
  const errors = await boot(page);
  await startAt(page, 1);
  const before = await page.evaluate(() => S.handsLeft);
  expect(before).toBe(6);
  await page.click('#btnStand');
  await page.waitForFunction(b => S.handsLeft < b || document.querySelector('#overlay.on'), before, { timeout: 15_000 });
  expect(errors).toEqual([]);
});

test('데모 모드가 오류 없이 시작된다', async ({ page }) => {
  const errors = await boot(page);
  await page.click('#demo');
  await rigNextHand(page);
  await page.click('#goStage');
  await waitIdle(page);
  expect(await page.evaluate(() => S.demo && S.charms.length)).toBe(5);
  expect(errors).toEqual([]);
});

test('이어하기: 새로고침해도 같은 스테이지·같은 카드', async ({ page }) => {
  await boot(page);
  await startAt(page, 3);
  const snap = await page.evaluate(() => ({ stage: S.stage, hand: S.player.map(c => c.r + c.s).join() }));
  await boot(page, { keep: true });
  await page.click('#cont');
  await page.click('#goStage').catch(() => {});
  await waitIdle(page);
  const after = await page.evaluate(() => ({ stage: S.stage, hand: S.player.map(c => c.r + c.s).join() }));
  expect(after).toEqual(snap);
});

test('일시정지 메뉴: 속도 저장, 개인정보처리방침 링크, 포기 @mobile', async ({ page }) => {
  await boot(page);
  await startAt(page, 2);
  await page.evaluate(() => openPause());
  await expect(page.locator('#pzPolicy')).toBeVisible();
  await page.locator('#pauseBox button', { hasText: '2x' }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('lucky21.settings')).speed)).toBe(2);
  await page.evaluate(() => giveUp());
  await page.waitForFunction(() => S.over);
  expect(await page.evaluate(() => loadSave())).toBeNull();
});

test('길게 눌러도 글자 선택·메뉴가 뜨지 않는다 @mobile', async ({ page }) => {
  await boot(page);
  expect(await page.evaluate(() => getComputedStyle(document.body).userSelect)).toBe('none');
  const blocked = await page.evaluate(() => {
    const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    document.querySelector('.btn').dispatchEvent(e); return e.defaultPrevented;
  });
  expect(blocked).toBe(true);
});

for (const lang of ['ko', 'en', 'ja', 'zh-Hant', 'es', 'pt-BR', 'de']) {
  test(`언어 ${lang}: 번역 키가 화면에 그대로 나오지 않는다`, async ({ page }) => {
    const errors = await boot(page, { lang });
    await startAt(page, 1);
    await page.evaluate(() => openPause());
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/\b(ui|shop|ads|cloud|trial|end|title)\.[a-zA-Z]+\b/);
    expect(errors).toEqual([]);
  });
}
