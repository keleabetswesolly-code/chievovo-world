// Bridge to the Android foreground playback service.
// Everything here is a no-op in a normal browser.

const bridge = () => (typeof window !== "undefined" ? window.ChievovoNative : null);

export function startNativePlayback(track) {
  const native = bridge();
  if (!native || !track) return;
  try {
    native.start(track.title || "CHIEVOVO WORLD", track.artist_name || "");
  } catch {}
}

export function setNativePlaybackState(playing) {
  const native = bridge();
  if (!native) return;
  try {
    native.setPlaying(!!playing);
  } catch {}
}

export function stopNativePlayback() {
  const native = bridge();
  if (!native) return;
  try {
    native.stop();
  } catch {}
}