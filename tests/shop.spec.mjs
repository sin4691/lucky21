import { test, expect } from '@playwright/test';
import { boot, startAt } from './helpers.mjs';

// 버그 사냥 봇이 찾은 문제: 강화권 카드 고르기에서 같은 결제가 두 번 실행되면 골드가 음수가 됐다
test('상점 결제는 두 번 눌려도 한 번만 처리된다', async ({ page }) => {
  await boot(page);
  await startAt(page, 2);
  const gold = await page.evaluate(() => {
    closePanel(); S.busy = false; S.gold = 4;
    openShop();
    const i = S.cardOffers.findIndex(o => o.kind === 'enh');
    const btn = document.querySelectorAll('#cardOffers button')[i];
    btn.click();                                   // 강화권 사용 → 카드 고르기 창
    const card = document.querySelector('#gridHost .card');
    card.click(); card.click();                    // 같은 카드를 빠르게 두 번
    return S.gold;
  });
  expect(gold).toBe(0);
});
