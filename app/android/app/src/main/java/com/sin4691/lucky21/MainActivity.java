package com.sin4691.lucky21;

import android.graphics.Color;
import android.os.Bundle;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

/**
 * 게임 화면을 전체화면(몰입 모드)으로 띄운다.
 * - 위쪽 상태바와 아래쪽 내비게이션 바를 숨긴다.
 * - 화면 가장자리를 스와이프하면 바가 잠깐 나타났다가 다시 사라진다.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // 다른 앱이나 알림창에서 돌아왔을 때 바가 다시 보이지 않도록 매번 숨긴다
        if (hasFocus) hideSystemBars();
    }

    private void hideSystemBars() {
        // 카메라 구멍 때문에 비워 두는 줄이 회색으로 보이지 않게 창 배경을 게임 배경색으로 칠한다
        getWindow().getDecorView().setBackgroundColor(Color.parseColor("#11120F"));
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
