package com.sin4691.lucky21;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.view.View;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

/**
 * 게임 화면을 전체화면(몰입 모드)으로 띄운다.
 * - 위쪽 상태바와 아래쪽 내비게이션 바를 숨긴다. 가장자리를 스와이프하면 잠깐 나타났다 사라진다.
 * - 카메라 구멍(디스플레이 컷아웃) 영역까지 화면을 그린다.
 * - 대신 컷아웃 크기를 웹 쪽 CSS 변수(--sat/--sar/--sab/--sal)로 넘겨서,
 *   글자·버튼은 그만큼 안쪽에 배치한다. (Unity의 Screen.safeArea와 같은 개념)
 */
public class MainActivity extends BridgeActivity {

    // 마지막으로 받은 안전 영역 여백 (CSS px)
    private float safeTop, safeRight, safeBottom, safeLeft;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 카메라 구멍이 있는 짧은 변(세로 모드의 위쪽)까지 앱이 그리도록 허용
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }

        // 컷아웃 크기가 정해지거나 바뀔 때마다 웹에 전달
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (v, insets) -> {
            Insets c = insets.getInsets(WindowInsetsCompat.Type.displayCutout());
            float d = getResources().getDisplayMetrics().density;
            safeTop = c.top / d;
            safeRight = c.right / d;
            safeBottom = c.bottom / d;
            safeLeft = c.left / d;
            v.setPadding(0, 0, 0, 0);
            pushSafeArea();
            return ViewCompat.onApplyWindowInsets(v, insets);
        });

        // 페이지가 (다시) 로드되면 CSS 변수가 초기화되므로 한 번 더 전달
        if (getBridge() != null) {
            getBridge().addWebViewListener(new WebViewListener() {
                @Override
                public void onPageLoaded(WebView webView) {
                    pushSafeArea();
                }
            });
        }

        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // 다른 앱이나 알림창에서 돌아왔을 때 바가 다시 보이지 않도록 매번 숨긴다
        if (hasFocus) hideSystemBars();
    }

    private void pushSafeArea() {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        final String js = "(function(){var s=document.documentElement.style;"
                + "s.setProperty('--sat','" + safeTop + "px');"
                + "s.setProperty('--sar','" + safeRight + "px');"
                + "s.setProperty('--sab','" + safeBottom + "px');"
                + "s.setProperty('--sal','" + safeLeft + "px');"
                + "window.dispatchEvent(new Event('resize'));})();";
        getBridge().getWebView().post(() -> getBridge().getWebView().evaluateJavascript(js, null));
    }

    private void hideSystemBars() {
        // 플러그인 초기화 등으로 창 속성이 바뀌었을 수 있어 매번 다시 지정
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            if (lp.layoutInDisplayCutoutMode != WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES) {
                lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
                getWindow().setAttributes(lp);
            }
        }
        // 비어 보이는 영역이 생겨도 회색이 아니라 게임 배경색으로 보이게 (창 자체와 루트 뷰 모두)
        getWindow().setBackgroundDrawable(new ColorDrawable(Color.parseColor("#11120F")));
        getWindow().getDecorView().setBackgroundColor(Color.parseColor("#11120F"));
        View content = findViewById(android.R.id.content);
        if (content != null) content.setBackgroundColor(Color.parseColor("#11120F"));
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
