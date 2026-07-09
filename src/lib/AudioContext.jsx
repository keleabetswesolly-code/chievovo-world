import React, { createContext, useContext, useState, useRef, useCallback } from "react";

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null); // { id, title, artist_name, cover_url, audio_url, videoId }
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const iframeRef = useRef(null);

  // Extract YouTube video ID from URL or raw 11-char ID
  const extractVideoId = (raw) => {
    if (!raw) return null;
    const match = raw.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    if (match) return match[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
    return null;
  };

  const getVideoId = (track) => track?.videoId || extractVideoId(track?.audio_url) || null;

  const playTrack = useCallback((track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      const next = !prev;
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: next ? 'playVideo' : 'pauseVideo', args: [] }),
          '*'
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
  }, []);

  return (
    <AudioContext.Provider value={{ currentTrack, isPlaying, queue, setQueue, playTrack, togglePlay, nextTrack, prevTrack, clearTrack, iframeRef, getVideoId }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used inside AudioProvider");
  return ctx;
}