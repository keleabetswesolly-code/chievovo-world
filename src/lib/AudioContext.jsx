import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { cacheTrack, getCachedTrack, useOfflineCache } from "@/hooks/useOfflineCache";

const AudioContext = createContext(null);

// Build a search query from track metadata
function buildQuery(track) {
  return `${track.artist_name} - ${track.title} official audio`;
}

// Resolve a videoId by calling the youtubeSearch backend function
async function resolveVideoId(track) {
  if (track.videoId) return track.videoId;
  const response = await base44.functions.invoke("youtubeSearch", { query: buildQuery(track) });
  const results = response?.data?.results ?? response?.data ?? [];
  return results[0]?.videoId || null;
}

export function AudioProvider({ children }) {
  const { isOnline } = useOfflineCache();
  const [currentTrack, setCurrentTrack] = useState(null); // { id, title, artist_name, cover_url, videoId }
  const [isPlaying, setIsPlaying] = useState(false);
  const [isResolving, setIsResolving] = useState(false); // true while background YT search is in-flight
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const iframeRef = useRef(null);
  const pollRef = useRef(null);

  // Poll YouTube iframe for currentTime/duration every second
  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: 1 }), "*"
      );
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "getCurrentTime", args: [] }), "*"
      );
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "getDuration", args: [] }), "*"
      );
    }, 1000);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  // Listen for YouTube API messages
  useEffect(() => {
    const handler = (e) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.event === "infoDelivery" && data?.info) {
          if (typeof data.info.currentTime === "number") setCurrentTime(data.info.currentTime);
          if (typeof data.info.duration === "number" && data.info.duration > 0) setDuration(data.info.duration);
          if (typeof data.info.playerState === "number") {
            // 1 = playing, 2 = paused, 0 = ended
            if (data.info.playerState === 1) setIsPlaying(true);
            if (data.info.playerState === 2) setIsPlaying(false);
          }
        }
      } catch {}
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Start/stop polling when playing state changes
  useEffect(() => {
    if (isPlaying) startPolling(); else stopPolling();
    return stopPolling;
  }, [isPlaying, startPolling, stopPolling]);

  const playTrack = useCallback(async (track) => {
    // Known videoId (e.g. from YouTube search results) — instant, no resolve
    if (track.videoId) {
      const resolved = { ...track, videoId: track.videoId };
      setCurrentTrack(resolved);
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(0);
      setIsResolving(false);
      cacheTrack(resolved);
      return;
    }
    // Check cache first for instant offline/fast playback — no API call needed
    const cached = getCachedTrack(track.id);
    if (cached?.videoId) {
      setCurrentTrack({ ...track, videoId: cached.videoId });
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(0);
      setIsResolving(false);
      // Do NOT re-resolve if cached — saves YouTube quota
      return;
    }

    setIsResolving(true);
    setCurrentTrack({ ...track, videoId: null }); // show player immediately with spinner
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);

    const videoId = await resolveVideoId(track).catch(() => null);
    const resolved = { ...track, videoId };
    setCurrentTrack(resolved);
    setIsResolving(false);
    // Persist to offline cache
    if (videoId) cacheTrack(resolved);
  }, []);

  const seek = useCallback((seconds) => {
    setCurrentTime(seconds);
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "seekTo", args: [seconds, true] }), "*"
    );
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      const next = !prev;
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: next ? "playVideo" : "pauseVideo", args: [] }),
          "*"
        );
      }
      return next;
    });
  }, []);

  const nextTrack = useCallback(() => {
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    const next = queue[(idx + 1) % queue.length];
    if (next) playTrack(next);
  }, [queue, currentTrack, playTrack]);

  const prevTrack = useCallback(() => {
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    const prev = queue[(idx - 1 + queue.length) % queue.length];
    if (prev) playTrack(prev);
  }, [queue, currentTrack, playTrack]);

  const expandPlayer = useCallback(() => setIsPlayerExpanded(true), []);
  const collapsePlayer = useCallback(() => setIsPlayerExpanded(false), []);

  const clearTrack = useCallback(() => {
    setCurrentTrack(null);
    setIsPlaying(false);
    setIsResolving(false);
    setIsPlayerExpanded(false);
    setCurrentTime(0);
    setDuration(0);
    stopPolling();
  }, [stopPolling]);

  return (
    <AudioContext.Provider value={{
      currentTrack, isPlaying, isResolving,
      currentTime, duration,
      isOnline,
      isPlayerExpanded, expandPlayer, collapsePlayer,
      queue, setQueue,
      playTrack, togglePlay, nextTrack, prevTrack, clearTrack, seek,
      iframeRef,
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used inside AudioProvider");
  return ctx;
}