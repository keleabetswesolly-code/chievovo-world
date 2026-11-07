package com.chievovo.world;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.lang.ref.WeakReference;

public class MainActivity extends BridgeActivity {

    private static WeakReference<MainActivity> instance = new WeakReference<>(null);
    private static final int NOTIFICATION_PERMISSION_REQUEST = 9001;

    public static MainActivity getInstance() {
        return instance.get();
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        instance = new WeakReference<>(this);

        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            // Let playback resume without requiring a fresh tap on the screen
            settings.setMediaPlaybackRequiresUserGesture(false);
            // Playback state handoff to the foreground media service
            webView.addJavascriptInterface(new MediaBridge(getApplicationContext()), "ChievovoNative");
        }

        requestNotificationPermission();
    }

    /**
     * Runs a snippet in the web player, used by notification controls.
     */
    public void runJavaScript(final String js) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null) {
                    webView.evaluateJavascript(js, null);
                }
            }
        });
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33
            && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                new String[]{ Manifest.permission.POST_NOTIFICATIONS },
                NOTIFICATION_PERMISSION_REQUEST);
        }
    }

    @Override
    public void onDestroy() {
        if (instance.get() == this) {
            instance = new WeakReference<>(null);
        }
        super.onDestroy();
    }

    @Override
    public void onPause() {
        super.onPause();

        // Keep the WebView and its audio running while the app is in the
        // background, so music continues when the user leaves the app.
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
    }
}