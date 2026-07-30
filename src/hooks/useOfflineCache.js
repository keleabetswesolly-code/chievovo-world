/**
 * useOfflineCache — stores resolved track videoIds and metadata in localStorage
 * so they can be replayed when the user is offline.
 *
 * What we cache: { id, title, artist_name, cover_url, genre, album, videoId }
 * YouTube embeds still require a connection; offline mode plays back the last
 * known videoId (which YouTube may serve from its own service-worker cache)
 * and shows a clear offline banner when the stream cannot load.
 */

const CACHE_KEY = "chievovo_track_cache";
const MAX_CACHED = 50; // keep last 50 played tracks

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
}

function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
}

/** Save/update a track entry. Call after videoId is resolved. */
export function cacheTrack(track) {
  if (!track?.id || !track?.videoId) return;
  const cache = readCache();
  // Move to front (most-recent), then trim
  const entry = {
    id: track.id,
    title: track.title,
    artist_name: track.artist_name,
    cover_url: track.cover_url,
    genre: track.genre,
    album: track.album,
    videoId: track.videoId,
    cachedAt: Date.now(),
  };
  delete cache[track.id]; // remove existing so insertion order reflects recency
  const entries = { [track.id]: entry, ...cache };
  const keys = Object.keys(entries).slice(0, MAX_CACHED);
  const trimmed = {};
  keys.forEach(k => { trimmed[k] = entries[k]; });
  writeCache(trimmed);
}

/** Retrieve a cached track by id (returns null if not cached). */
export function getCachedTrack(id) {
  if (!id) return null;
  const cache = readCache();
  return cache[id] || null;
}

/** Return all cached tracks sorted by most recently played. */
export function getAllCachedTracks() {
  const cache = readCache();
  return Object.values(cache).sort((a, b) => b.cachedAt - a.cachedAt);
}

/** Remove a single track from the cache. */
export function removeCachedTrack(id) {
  const cache = readCache();
  delete cache[id];
  writeCache(cache);
}

/** Clear the entire cache. */
export function clearTrackCache() {
  localStorage.removeItem(CACHE_KEY);
}

/** React hook — returns { isOnline, cachedTracks } and re-renders on change. */
import { useState, useEffect } from "react";

export function useOfflineCache() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [cachedTracks, setCachedTracks] = useState(() => getAllCachedTracks());

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const refresh = () => setCachedTracks(getAllCachedTracks());

  return { isOnline, cachedTracks, refresh };
}