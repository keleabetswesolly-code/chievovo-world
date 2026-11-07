package com.chievovo.world;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/**
 * Keeps CHIEVOVO WORLD playing while the app is in the background.
 *
 * The audio itself is produced by the WebView, so this service does not decode
 * anything: it holds the process in the foreground (so Android cannot freeze or
 * kill it), keeps a partial wake lock, and exposes play/pause/next from the
 * notification shade. Controls are forwarded into the web player.
 */
public class MediaPlaybackService extends Service {

    public static final String ACTION_START = "com.chievovo.world.playback.START";
    public static final String ACTION_STATE = "com.chievovo.world.playback.STATE";
    public static final String ACTION_STOP = "com.chievovo.world.playback.STOP";
    public static final String ACTION_TOGGLE = "com.chievovo.world.playback.TOGGLE";
    public static final String ACTION_NEXT = "com.chievovo.world.playback.NEXT";

    private static final String CHANNEL_ID = "chievovo_playback";
    private static final int NOTIFICATION_ID = 4711;

    private PowerManager.WakeLock wakeLock;
    private String title = "CHIEVOVO WORLD";
    private String artist = "";
    private boolean playing = false;
    private boolean inForeground = false;

    @Override
    public void onCreate() {
        super.onCreate();
        createChannel();
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "chievovo:playback");
            wakeLock.setReferenceCounted(false);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : null;

        if (ACTION_STOP.equals(action)) {
            releaseWakeLock();
            stopSelf();
            return START_NOT_STICKY;
        }

        // Controls tapped in the notification shade
        if (ACTION_TOGGLE.equals(action)) {
            // Flip the shade controls immediately, then let the web player follow
            playing = !playing;
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.notify(NOTIFICATION_ID, buildNotification());
            if (playing) acquireWakeLock(); else releaseWakeLock();
            sendToWeb("toggle");
            return START_STICKY;
        }
        if (ACTION_NEXT.equals(action)) {
            playing = true;
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.notify(NOTIFICATION_ID, buildNotification());
            acquireWakeLock();
            sendToWeb("next");
            return START_STICKY;
        }

        if (ACTION_START.equals(action) && intent != null) {
            String t = intent.getStringExtra("title");
            String a = intent.getStringExtra("artist");
            if (t != null && t.length() > 0) title = t;
            if (a != null) artist = a;
            playing = true;
        } else if (ACTION_STATE.equals(action) && intent != null) {
            playing = intent.getBooleanExtra("playing", playing);
        }

        if (!inForeground) {
            startForeground(NOTIFICATION_ID, buildNotification());
            inForeground = true;
        } else {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.notify(NOTIFICATION_ID, buildNotification());
        }

        if (playing) acquireWakeLock(); else releaseWakeLock();
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        releaseWakeLock();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void sendToWeb(String action) {
        MainActivity activity = MainActivity.getInstance();
        if (activity != null) {
            activity.runJavaScript(
                "window.chievovoMediaAction && window.chievovoMediaAction('" + action + "')");
        }
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID, "Playback", NotificationManager.IMPORTANCE_LOW);
        channel.setShowBadge(false);
        nm.createNotificationChannel(channel);
    }

    private int pendingFlags() {
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        return flags;
    }

    private Notification buildNotification() {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, openIntent, pendingFlags());

        Intent toggleIntent = new Intent(this, MediaPlaybackService.class);
        toggleIntent.setAction(ACTION_TOGGLE);
        PendingIntent toggle = PendingIntent.getService(this, 1, toggleIntent, pendingFlags());

        Intent nextIntent = new Intent(this, MediaPlaybackService.class);
        nextIntent.setAction(ACTION_NEXT);
        PendingIntent next = PendingIntent.getService(this, 2, nextIntent, pendingFlags());

        Notification.Builder builder = Build.VERSION.SDK_INT >= 26
            ? new Notification.Builder(this, CHANNEL_ID)
            : new Notification.Builder(this);

        builder.setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(title)
            .setContentText(artist)
            .setContentIntent(contentIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setShowWhen(false)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .addAction(playing ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                playing ? "Pause" : "Play", toggle)
            .addAction(android.R.drawable.ic_media_next, "Next", next);

        return builder.build();
    }

    private void acquireWakeLock() {
        if (wakeLock != null && !wakeLock.isHeld()) wakeLock.acquire();
    }

    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) wakeLock.release();
    }
}