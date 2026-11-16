package com.sin4691.lucky21;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.android.gms.games.AuthenticationResult;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.games.SnapshotsClient;
import com.google.android.gms.games.snapshot.Snapshot;
import com.google.android.gms.games.snapshot.SnapshotContents;
import com.google.android.gms.games.snapshot.SnapshotMetadataChange;

import java.nio.charset.StandardCharsets;

/**
 * 구글 플레이 게임즈 '저장된 게임'(Snapshots API)으로 진행 상황을 클라우드에 저장한다.
 * 웹 쪽(js/platform/cloud.js)에서 window.Capacitor.Plugins.CloudSave 로 부른다.
 *
 * - 저장 칸은 하나(SLOT). 내용은 JSON 문자열 그대로.
 * - strings.xml 의 game_services_project_id 가 비어 있으면 아무것도 하지 않는다(available=false).
 * - 플레이 스토어 테스트 트랙으로 설치한 앱에서만 동작한다 (안드로이드 스튜디오 직접 설치는 로그인 실패).
 */
@CapacitorPlugin(name = "CloudSave")
public class CloudSavePlugin extends Plugin {

    private static final String SLOT = "lucky21-main";
    private boolean enabled;

    @Override
    public void load() {
        String id = getContext().getString(R.string.game_services_project_id);
        enabled = id != null && !id.trim().isEmpty();
        if (enabled) PlayGamesSdk.initialize(getContext());
    }

    private GamesSignInClient signInClient() { return PlayGames.getGamesSignInClient(getActivity()); }
    private SnapshotsClient snapshots() { return PlayGames.getSnapshotsClient(getActivity()); }

    private JSObject state(boolean signedIn) {
        JSObject r = new JSObject();
        r.put("available", enabled);
        r.put("signedIn", signedIn);
        return r;
    }

    /** 사용 가능 여부와 로그인 상태 (앱 시작 시 자동 로그인 결과) */
    @PluginMethod
    public void status(PluginCall call) {
        if (!enabled) { call.resolve(state(false)); return; }
        signInClient().isAuthenticated().addOnCompleteListener(task -> {
            AuthenticationResult a = task.isSuccessful() ? task.getResult() : null;
            call.resolve(state(a != null && a.isAuthenticated()));
        });
    }

    /** 수동 로그인 (자동 로그인이 안 된 경우 메뉴의 버튼으로) */
    @PluginMethod
    public void signIn(PluginCall call) {
        if (!enabled) { call.resolve(state(false)); return; }
        signInClient().signIn().addOnCompleteListener(task -> {
            AuthenticationResult a = task.isSuccessful() ? task.getResult() : null;
            call.resolve(state(a != null && a.isAuthenticated()));
        });
    }

    /** 클라우드의 저장 내용을 읽는다. 없으면 data 가 빈 문자열 */
    @PluginMethod
    public void load(PluginCall call) {
        if (!enabled) { call.reject("unavailable"); return; }
        snapshots().open(SLOT, true, SnapshotsClient.RESOLUTION_POLICY_MOST_RECENTLY_MODIFIED)
            .addOnFailureListener(e -> call.reject("open failed", e))
            .addOnSuccessListener(res -> {
                // 충돌이면 서버 쪽 버전을 읽는다 (웹 쪽에서 로컬과 합친 뒤 다시 저장)
                Snapshot snap = res.isConflict() ? res.getConflict().getSnapshot() : res.getData();
                String data = "";
                try {
                    byte[] bytes = snap.getSnapshotContents().readFully();
                    if (bytes != null) data = new String(bytes, StandardCharsets.UTF_8);
                } catch (Exception e) {
                    call.reject("read failed", e);
                    return;
                }
                if (!res.isConflict()) snapshots().discardAndClose(snap);
                JSObject r = new JSObject();
                r.put("data", data);
                call.resolve(r);
            });
    }

    /** 클라우드에 저장한다. 오프라인이면 기기에 두었다가 연결되면 올라간다 */
    @PluginMethod
    public void save(PluginCall call) {
        if (!enabled) { call.reject("unavailable"); return; }
        String data = call.getString("data", "");
        String desc = call.getString("description", "LUCKY 21");
        snapshots().open(SLOT, true, SnapshotsClient.RESOLUTION_POLICY_MOST_RECENTLY_MODIFIED)
            .addOnFailureListener(e -> call.reject("open failed", e))
            .addOnSuccessListener(res -> {
                if (res.isConflict()) {
                    // 남은 충돌은 이번에 쓰는 내용으로 정리한다
                    SnapshotsClient.SnapshotConflict c = res.getConflict();
                    SnapshotContents contents = c.getResolutionSnapshotContents();
                    contents.writeBytes(data.getBytes(StandardCharsets.UTF_8));
                    SnapshotMetadataChange meta = new SnapshotMetadataChange.Builder().setDescription(desc).build();
                    snapshots().resolveConflict(c.getConflictId(), c.getSnapshot().getMetadata().getSnapshotId(), meta, contents)
                        .addOnFailureListener(e -> call.reject("resolve failed", e))
                        .addOnSuccessListener(x -> call.resolve());
                    return;
                }
                Snapshot snap = res.getData();
                snap.getSnapshotContents().writeBytes(data.getBytes(StandardCharsets.UTF_8));
                SnapshotMetadataChange meta = new SnapshotMetadataChange.Builder().setDescription(desc).build();
                snapshots().commitAndClose(snap, meta)
                    .addOnFailureListener(e -> call.reject("commit failed", e))
                    .addOnSuccessListener(x -> call.resolve());
            });
    }
}
