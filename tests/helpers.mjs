// 테스트 공용 도우미
import { expect } from '@playwright/test';

// 앱(안드로이드) 환경 흉내: Capacitor + AdMob + CloudSave 가짜 플러그인
export const APP_MOCK = (cloudData = '') => `
  window.__cloud = localStorage.getItem('__cloud') || ${JSON.stringify(cloudData)};
  window.__ads = []; window.__adFail = false;
  window.Capacitor = { isNativePlatform: () => true, Plugins: {
    AdMob: {
      initialize: async () => { __ads.push('init'); },
      requestConsentInfo: async () => ({ status: 'OBTAINED', isConsentFormAvailable: false, privacyOptionsRequirementStatus: 'REQUIRED' }),
      showConsentForm: async () => {}, showPrivacyOptionsForm: async () => { __ads.push('privacy'); },
      prepareRewardVideoAd: async o => { __ads.push('prepare:' + o.adId); },
      showRewardVideoAd: async () => { __ads.push('show'); return window.__adFail ? null : { type: 'coin', amount: 1 }; },
    },
    CloudSave: {
      status: async () => ({ available: true, signedIn: true }),
      signIn: async () => ({ available: true, signedIn: true }),
      load: async () => ({ data: window.__cloud }),
      save: async o => { window.__cloud = o.data; localStorage.setItem('__cloud', o.data); },
    },
  } };
`;

// 첫 실행 상태로 게임을 연다 (언어 고정, 튜토리얼 끝, 소리 끔). 페이지 오류는 모아서 돌려준다.
export async function boot(page, { lang = 'ko', app = false, cloud = '', keep = false } = {}) {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  if (app) await page.addInitScript(APP_MOCK(cloud));
  await page.goto('/index.html');
  if (!keep) await page.evaluate(l => { localStorage.clear(); localStorage.setItem('lucky21.lang', l); localStorage.setItem('lucky21.tut', 'done'); }, lang);
  await page.reload();
  await expect(page.locator('h1.brand')).toBeVisible();
  await page.evaluate(() => { muted = true; });
  return errors;
}

// 다음 핸드가 블랙잭으로 바로 끝나지 않게 첫 카드를 고정한다 (테스트가 운에 따라 달라지는 걸 막기 위해).
// 나와 딜러 모두 에이스가 아닌 카드 2장을 덱 맨 뒤(먼저 뽑히는 쪽)에 둔다. 에이스가 없으면 21이 될 수 없다.
// 이어하기 지점도 이 순서로 다시 저장한다.
export async function rigNextHand(page) {
  await page.evaluate(() => {
    const twoNonAce = pile => {
      const picked = [];
      for (let i = pile.length - 1; i >= 0 && picked.length < 2; i--) if (pile[i].r !== 'A') picked.push(pile.splice(i, 1)[0]);
      pile.push(...picked);
    };
    if (S.draw.length < 2) { S.draw.push(...shuffle(S.discard)); S.discard = []; }
    if (S.shoe.length < 10) S.shoe = newDeck();
    twoNonAce(S.draw); twoNonAce(S.shoe);
    if (!S.demo) snapshot('hand');
  });
}

// 스테이지를 바로 시작 (목표 화면에서 시작 버튼까지)
export async function startAt(page, stage = 1) {
  await page.evaluate(st => { closePanel(); newRun(); S.stage = st; startStage(); }, stage);
  await rigNextHand(page);
  await page.click('#goStage');
  await waitIdle(page);
}

export const waitIdle = page => page.waitForFunction(() => S && !S.busy, null, { timeout: 15_000 });

// 점수를 원하는 값으로 맞춰 두고 스탠드 → 핸드가 끝날 때까지
export async function standWith(page, score) {
  await page.evaluate(sc => { S.score = sc; onStand(); }, score);
}
