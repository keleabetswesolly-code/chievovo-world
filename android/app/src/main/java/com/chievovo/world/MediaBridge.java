package com.chievovo.world;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.webkit.JavascriptInterface;

/**
 * Exposed to the web player as `window.ChievovoNative`.
 * Lets the app hand playback state to the Android foreground service.
 */
public class MediaBridge {

    private final Context context;

    public MediaBridge(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public void start(String title, String artist) {
        Intent intent = new Intent(context, MediaPlaybackService.class);
        intent.setAction(MediaPlaybackService.ACTION_START);
        intent.putExtra("title", title);
        intent.putExtra("artist", artist);
        dispatch(intent);
    }

    @JavascriptInterface
    public void setPlaying(boolean playing) {
        Intent intent = new Intent(context, MediaPlaybackService.class);
        intent.setAction(MediaPlaybackService.ACTION_STATE);
        intent.putExtra("playing", playing);
        dispatch(intent);
    }

    @JavascriptInterface
    public void stop() {
        Intent intent = new Intent(context, MediaPlaybackService.class);
        intent.setAction(MediaPlaybackService.ACTION_STOP);
        dispatch(intent);
    }

    private void dispatch(Intent intent) {
        try {
            if (Build.VERSION.SDK_INT >= 26) {
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }
        } catch (Exception ignored) {
            // Playback continues in the WebView even if the service cannot start
        }
    }
}