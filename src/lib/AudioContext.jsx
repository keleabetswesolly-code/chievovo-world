import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

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
  const [currentTrack, setCurrentTrack] = useState(null); // { id, title, artist_name, cover_url, videoId }
  const [isPlaying, setIsPlaying] = useState(false);
  const [isResolving, setIsResolving] = useState(false); // true while background YT search is in-flight
  const [queue, setQueue] = useState([]);
  const iframeRef = useRef(null);

  const playTrack = useCallback(async (track) => {
    setIsResolving(true);
    setCurrentTrack({ ...track, videoId: null }); // show player immediately with spinner
    setIsPlaying(true);

    const videoId = await resolveVideoId(track).catch(() => null);
    setCurrentTrack({ ...track, videoId });
    setIsResolving(false);
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

  const clearTrack = useCallback(() => {
    setCurrentTrack(null);
    setIsPlaying(false);
    setIsResolving(false);
  }, []);

  return (
    <AudioContext.Provider value={{
      currentTrack, isPlaying, isResolving,
      queue, setQueue,
      playTrack, togglePlay, nextTrack, prevTrack, clearTrack,
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