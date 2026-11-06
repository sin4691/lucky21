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

- **앱 이름**: LUCKY 21 (같은 이름이 있으면 부제 추가)
- **패키지 이름**: `com.sin4691.lucky21` (출시 후 변경 불가)
- **콘텐츠 등급 설문**: 모의 도박 요소 있음으로 정직하게 답변. 실제 돈 거래 없음
- **타깃 연령**: 아동 대상으로 설정하지 않음
- **데이터 보안**: 수집하는 데이터 없음, 공유하는 데이터 없음
- **개인정보처리방침 URL**: `https://sin4691.github.io/lucky21/privacy.html`
- **광고 포함 여부**: 아니요

## 구성

| 파일 | 역할 |
|---|---|
| `scripts/build-web.mjs` | 웹 파일을 `www/`로 복사하고, Google Fonts를 앱 내장 글꼴로 바꿈 (오프라인 동작) |
| `capacitor.config.json` | 앱 이름, 패키지 이름, 배경색 |
| `resources/` | 아이콘·스플래시 원본. 바꾼 뒤 `npx capacitor-assets generate --android --assetPath resources` 실행 |
| `android/` | Android Studio 프로젝트 |
