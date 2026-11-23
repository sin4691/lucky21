package com.sin4691.lucky21;

import android.content.pm.ApplicationInfo;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * 웹 쪽에 "지금 디버그 빌드인지"를 알려 준다.
 * 디버그 빌드(Android Studio에서 바로 실행)는 테스트 광고, 서명된 출시 빌드는 실제 광고를 쓰기 위해서다.
 * (개발자가 자기 실제 광고를 누르면 AdMob 정책 위반이라, 개발 중에는 절대 실제 광고가 나오지 않게 한다)
 */
@CapacitorPlugin(name = "BuildInfo")
public class BuildInfoPlugin extends Plugin {
    @PluginMethod
    public void get(PluginCall call) {
        boolean debug = (getContext().getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        JSObject r = new JSObject();
        r.put("debug", debug);
        call.resolve(r);
    }
}
