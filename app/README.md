# LUCKY 21 안드로이드 앱 (Capacitor)

웹 버전(저장소 루트의 `index.html`, `assets/`)을 그대로 안드로이드 앱으로 감싼 프로젝트입니다. 게임 코드는 루트에서만 고치고, 이 폴더에서는 빌드만 합니다.

## 준비물

- Node.js (LTS)
- Android Studio (설치 마법사에서 Android SDK까지 같이 설치)

## 처음 한 번

```bash
cd app
npm install
npm run sync     # 웹 파일을 www로 복사(글꼴 포함) → 안드로이드 프로젝트에 반영
npm run open     # Android Studio로 열기
```

Android Studio에서 처음 열면 Gradle 동기화가 몇 분 걸립니다. 하단 진행 표시줄이 끝날 때까지 기다리세요.

## 폰에서 테스트

1. 폰 설정 > 휴대전화 정보 > 소프트웨어 정보 > 빌드번호를 7번 눌러 개발자 모드를 켜고, 개발자 옵션에서 USB 디버깅을 켭니다.
2. USB로 연결한 뒤 Android Studio 위쪽에서 기기를 고르고 ▶ Run을 누릅니다.

## 게임을 수정한 뒤

루트의 `index.html`이나 `assets/`를 고친 다음:

```bash
cd app
npm run sync
```

그 뒤 Android Studio에서 다시 Run 하면 됩니다.

## 구글 플레이 출시용 빌드

1. `android/app/build.gradle`에서 버전을 올립니다. 업로드할 때마다 `versionCode`는 반드시 이전보다 커야 합니다.
   ```
   versionCode 2
   versionName "1.1"
   ```
2. Android Studio 메뉴 **Build > Generate Signed App Bundle / APK** → **Android App Bundle** 선택
3. 처음이면 **Create new...** 로 키스토어를 만듭니다.
   - **키스토어 파일(.jks)과 비밀번호는 절대 잃어버리면 안 됩니다.** 잃어버리면 이 앱에 업데이트를 올릴 수 없습니다.
   - 키스토어 파일은 이 저장소에 올리지 말고 따로 백업하세요.
4. **release**를 선택해 빌드하면 `android/app/release/app-release.aab`가 나옵니다. 이 파일을 플레이 콘솔에 올립니다.

## 플레이 콘솔 등록 체크리스트

스토어 등록용 아이콘·그래픽 이미지·스크린샷과 설명 문구는 [`docs/store/`](../docs/store/listing.md)에 준비되어 있습니다.

- **앱 이름**: LUCKY 21 (같은 이름이 있으면 부제 추가)
- **패키지 이름**: `com.sin4691.lucky21` (출시 후 변경 불가)
- **콘텐츠 등급 설문**: 모의 도박 요소 있음으로 정직하게 답변. 실제 돈 거래 없음
- **타깃 연령**: 아동 대상으로 설정하지 않음
- **데이터 보안**: 광고(AdMob)와 클라우드 저장 때문에 "수집함". 항목별 답은 [`docs/store/listing.md`](../docs/store/listing.md)의 '앱 콘텐츠 설문' 참고
- **개인정보처리방침 URL**: `https://sin4691.github.io/lucky21/privacy.html`
- **광고 포함 여부**: 예
- **광고 ID**: 예, 광고에 사용

## 웹 체험판 / 앱 정식판

같은 코드로 둘 다 만듭니다. `js/platform/edition.js`가 앱 안인지(`IS_APP`) 확인합니다.

| | 웹 (깃허브 사이트) | 앱 |
|---|---|---|
| 스테이지 | 4스테이지까지 (`TRIAL_LAST_STAGE`), 끝나면 플레이 스토어 링크 | 12스테이지 + 무한 모드 |
| 광고 | 없음 | 보상형만: 탈락 직전 1번 더(한 판에 1번), 상점 무료 새로고침(상점마다 1번) |
| 클라우드 저장 | 없음 | Play 게임즈 저장된 게임 |

## 광고 (AdMob) 설정

지금은 **구글 테스트 광고 ID**가 들어 있어서 폰에서 "Test Ad"가 나옵니다. 출시 전에 실제 ID로 바꿉니다.

1. https://admob.google.com 가입 → **앱 > 앱 추가** → Android, "Google Play에 등록됨"은 아직이면 "아니요"
2. 앱 ID(`ca-app-pub-숫자~숫자`)를 `android/app/src/main/res/values/strings.xml`의 `admob_app_id`에 넣기
3. **광고 단위 > 보상형** 하나 만들기 → 단위 ID(`ca-app-pub-숫자/숫자`)를 `js/platform/ads.js`의 `ADS_CONFIG.rewardedId`에 넣고 `testing:false`로
4. AdMob **개인정보 보호 및 메시지 > 유럽 규정** 메시지를 만들어 게시 (안 하면 유럽 사용자에게 광고가 안 나옴)
5. 플레이 스토어에 출시한 뒤 AdMob에서 앱을 스토어와 연결하고, `app-ads.txt`가 필요하면 안내대로 등록
6. `npm run sync`

> 실제 광고 ID로 바꾼 뒤에는 **자기 광고를 직접 누르지 마세요.** 계정이 정지될 수 있습니다. 개발 중에는 `testing:true`로 두면 됩니다.

## 클라우드 저장 (Play 게임즈) 설정

`strings.xml`의 `game_services_project_id`가 비어 있으면 클라우드 저장은 꺼진 채로 동작합니다 (메뉴에도 안 보임).

1. 플레이 콘솔에서 앱 만들기 (앱 유형: **게임**)
2. **Play 게임즈 서비스 > 설정 및 관리 > 설정** → "새 Play 게임즈 서비스 프로젝트" (Google Cloud 프로젝트도 새로 만들기)
3. **속성 수정 → 저장된 게임: 사용**
4. **사용자 인증 정보 추가 → Android** → OAuth 동의 화면 설정 후, 패키지 `com.sin4691.lucky21`와 **SHA-1 인증서 지문** 입력
   - 플레이 앱 서명을 쓰면 SHA-1은 플레이 콘솔 **테스트 및 출시 > 설정 > 앱 무결성 > 앱 서명 키 인증서**에 있습니다
5. Google Cloud 콘솔에서 **Google Drive API** 사용 설정 (저장된 게임이 이걸 씁니다)
6. 설정 화면 맨 위의 **프로젝트 ID(숫자)** 를 `strings.xml`의 `game_services_project_id`에 넣기
7. **테스터** 탭에 본인 구글 계정 추가 → 변경사항 검토 후 게시
8. `npm run sync` → 서명된 번들로 **내부 테스트 트랙**에 올려서, 플레이 스토어에서 설치해 확인

> 안드로이드 스튜디오 ▶ Run 으로 직접 설치한 앱은 서명 키가 달라서 Play 게임즈 로그인이 안 됩니다. 클라우드 저장은 반드시 테스트 트랙으로 설치해서 확인하세요. 게임 자체는 로그인 없이도 정상 동작합니다.

## 구성

| 파일 | 역할 |
|---|---|
| `scripts/build-web.mjs` | 웹 파일을 `www/`로 복사하고, Google Fonts를 앱 내장 글꼴로 바꿈 (오프라인 동작) |
| `capacitor.config.json` | 앱 이름, 패키지 이름, 배경색 |
| `resources/` | 아이콘·스플래시 원본. 바꾼 뒤 `npx capacitor-assets generate --android --assetPath resources` 실행 |
| `android/` | Android Studio 프로젝트 |
| `android/.../CloudSavePlugin.java` | Play 게임즈 저장된 게임을 웹 쪽(`js/platform/cloud.js`)에 연결하는 직접 만든 플러그인 |
