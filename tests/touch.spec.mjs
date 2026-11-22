import { test, expect } from '@playwright/test';
import { boot } from './helpers.mjs';

async function setup(page) {
  await boot(page);
  await page.evaluate(() => { closePanel(); newRun(); S.charms = ['heart', 'seven', 'streak'].map(id => makeCharm(CHARMS.find(c => c.id === id))); renderSide(); renderCharms(); S.busy = false; });
}
// 터치 포인터 이벤트로 꾹 누르기 → 끌기 → 놓기
async function holdDrag(page, fromSel, toX, holdMs = 450) {
  const box = await page.locator(fromSel).boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.evaluate(({ sel, x, y }) => { const el = document.querySelector(sel); el.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 7, pointerType: 'touch', clientX: x, clientY: y, bubbles: true })); }, { sel: fromSel, x, y });
  await page.waitForTimeout(holdMs);
  for (let i = 1; i <= 8; i++) await page.evaluate(({ x, y }) => dispatchEvent(new PointerEvent('pointermove', { pointerId: 7, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, cancelable: true })), { x: x + (toX - x) * i / 8, y });
  await page.evaluate(({ x, y }) => dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, pointerType: 'touch', clientX: x, clientY: y, bubbles: true })), { x: toX, y });
}

test('터치: 부적을 꾹 눌러 오른쪽 끝으로 옮기면 순서가 바뀐다 @mobile', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', '터치 전용');
  await setup(page);
  const last = await page.locator('#charmBar .charm').nth(2).boundingBox();
  await holdDrag(page, '#charmBar .charm[data-id="heart"]', last.x + last.width - 2);
  expect(await page.evaluate(() => S.charms.map(c => c.id))).toEqual(['seven', 'streak', 'heart']);
});

test('터치: 짧게 누르고 끌면(스와이프) 순서는 그대로 @mobile', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', '터치 전용');
  await setup(page);
  const last = await page.locator('#charmBar .charm').nth(2).boundingBox();
  await holdDrag(page, '#charmBar .charm[data-id="heart"]', last.x + last.width - 2, 80);
  expect(await page.evaluate(() => S.charms.map(c => c.id))).toEqual(['heart', 'seven', 'streak']);
});

test('터치 화면에는 ESC·H/S/D 안내가 없고, PC에는 있다 @mobile', async ({ page }, info) => {
  await setup(page);
  const touch = info.project.name === 'mobile';
  await expect(page.locator('#btnHit .kbd-only')).toBeVisible({ visible: !touch });
  await page.evaluate(() => document.querySelector('#side').classList.add('menu'));
  await expect(page.locator('#btnPause .kbd-only')).toBeVisible({ visible: !touch });
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('#charmBar .charm')).getPropertyValue('touch-action'))).toBe('none');
});
