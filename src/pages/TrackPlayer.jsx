import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, MoreHorizontal, Heart, Share2,
  Play, Pause, SkipBack, SkipForward,
  Repeat, Shuffle, Volume2, ListMusic, Cast,
  RefreshCw, WifiOff
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/lib/AudioContext";

// ─── Liked tracks persistence ─────────────────────────────────────────────────
const LIKED_KEY = "chievovo_liked_tracks";
function getLikedTracks() {
  try { return JSON.parse(localStorage.getItem(LIKED_KEY) || "{}"); } catch { return {}; }
}
function setLikedTrack(id, value) {
  const liked = getLikedTracks();
  if (value) liked[id] = true; else delete liked[id];
  localStorage.setItem(LIKED_KEY, JSON.stringify(liked));
}

export default function TrackPlayer() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get("id");

  const { queue, currentTrack, isResolving, playTrack, togglePlay: ctxTogglePlay, iframeRef, currentTime, duration, seek } = useAudio();

  const [isPlaying, setIsPlaying] = useState(false);
  const [iframeVisible, setIframeVisible] = useState(false);
  const [liked, setLikedState] = useState(() => getLikedTracks()[trackId] || false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  const { data: track, isLoading } = useQuery({
    queryKey: ["track", trackId],
    queryFn: () => base44.entities.Track.filter({ id: trackId }),
    select: (data) => data[0],
    enabled: !!trackId,
  });

  // Resolve the videoId: prefer from the global currentTrack (already resolved),
  // fallback to the local track object for fresh deep-links
  const videoId = (currentTrack?.id === trackId ? currentTrack?.videoId : null) || null;

  // If this page was opened directly (no currentTrack), auto-trigger playTrack
  useEffect(() => {
    if (track && (!currentTrack || currentTrack.id !== trackId)) {
      playTrack(track);
    }
  }, [track]);

  // Reset iframe visibility on track change
  useEffect(() => {
    setIframeVisible(false);
    setEmbedError(false);
    setIsPlaying(true);
    if (trackId) setLikedState(getLikedTracks()[trackId] || false);
  }, [trackId]);

  const handleTogglePlay = () => {
    setIsPlaying(p => !p);
    ctxTogglePlay();
  };

  const toggleLike = () => {
    const next = !liked;
    setLikedState(next);
    if (trackId) setLikedTrack(trackId, next);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const queueIndex = queue.findIndex(t => t.id === trackId);

  const skipTo = (nextTrack) => {
    if (!nextTrack) return;
    setIsPlaying(true);
    navigate(createPageUrl(`TrackPlayer?id=${nextTrack.id}`));
    playTrack(nextTrack);
  };

  const handleSkipBack = () => {
    if (queueIndex > 0) skipTo(queue[queueIndex - 1]);
  };

  const handleSkipForward = () => {
    if (queueIndex >= 0 && queueIndex < queue.length - 1) skipTo(queue[queueIndex + 1]);
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-5">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Track not found</h2>
          <Button onClick={() => navigate(createPageUrl("Music"))}>Back to Music</Button>
        </div>
      </div>
    );
  }

  const coverImg = track.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800";

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute inset-0">
        <img src={coverImg} alt="" className="w-full h-full object-cover blur-3xl opacity-30 scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/90 to-[#0A0A0A]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col px-5 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate(createPageUrl("Music"))}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Now Playing</p>
            <p className="text-sm font-medium">{track.album || "Single"}</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </header>

        {/* ── Album Art + YouTube IFrame ──────────────────────────────────────── */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1 flex items-center justify-center mb-8"
        >
          <div
            className={`relative w-72 h-72 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-700 ${isPlaying ? "scale-105" : "scale-100"}`}
            style={{ boxShadow: videoId && iframeVisible ? "0 0 40px rgba(0,212,255,0.25)" : undefined }}
          >
            {/* Fallback cover art */}
            <img src={coverImg} alt={track.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Loading spinner — visible while resolving the video ID */}
            <AnimatePresence>
              {isResolving && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/50"
                >
                  <div
                    className="w-14 h-14 rounded-full border-2 border-transparent border-t-[#00D4FF] border-r-[#00D4FF] animate-spin"
                    style={{ boxShadow: "0 0 20px rgba(0,212,255,0.4)" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* YouTube IFrame — fades in once loaded */}
            {videoId && !embedError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: iframeVisible ? 1 : 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full z-10 rounded-3xl overflow-hidden"
              >
                <iframe
                  ref={iframeRef}
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
                  allow="autoplay; encrypted-media"
                  title="track-player"
                  className="w-full h-full border-0"
                  onLoad={() => setIframeVisible(true)}
                  onError={() => setEmbedError(true)}
                />
              </motion.div>
            )}

            {/* Embed error state */}
            {embedError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 gap-2">
                <WifiOff className="w-8 h-8 text-[#FF6B35]" />
                <span className="text-xs text-gray-300">Stream unavailable</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Track Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 min-w-0">
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl font-black truncate"
            >
              {track.title}
            </motion.h1>
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400"
            >
              {track.artist_name}
            </motion.p>
          </div>
          <button
            onClick={toggleLike}
            className={`p-3 rounded-full transition-all ${liked ? "text-[#FF6B35]" : "text-gray-400"}`}
          >
            <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Slider
            value={[progress]}
            onValueChange={(v) => duration > 0 && seek((v[0] / 100) * duration)}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : (track.duration || "–:––")}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={() => setShuffleOn(!shuffleOn)}
            className={`p-2 ${shuffleOn ? "text-[#00D4FF]" : "text-gray-400"}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button
            onClick={handleSkipBack}
            className={`p-3 transition-colors ${queueIndex > 0 ? "text-white" : "text-gray-600"}`}
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>
          <button
            onClick={handleTogglePlay}
            disabled={isResolving}
            className="w-16 h-16 bg-[#00D4FF] rounded-full flex items-center justify-center hover:bg-[#00D4FF]/90 transition-colors disabled:opacity-50"
            style={{ boxShadow: "0 0 30px rgba(0, 212, 255, 0.4)" }}
          >
            {isPlaying
              ? <Pause className="w-7 h-7 text-black fill-black" />
              : <Play className="w-7 h-7 text-black fill-black ml-1" />
            }
          </button>
          <button
            onClick={handleSkipForward}
            className={`p-3 transition-colors ${queueIndex >= 0 && queueIndex < queue.length - 1 ? "text-white" : "text-gray-600"}`}
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>
          <button
            onClick={() => setRepeatOn(!repeatOn)}
            className={`p-2 ${repeatOn ? "text-[#00D4FF]" : "text-gray-400"}`}
          >
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between">
          <button className="p-3 text-gray-400 hover:text-white transition-colors">
            <Cast className="w-5 h-5" />
          </button>
          <button className="p-3 text-gray-400 hover:text-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-3 text-gray-400 hover:text-white transition-colors">
            <ListMusic className="w-5 h-5" />
          </button>
        </div>

        {/* Device Indicator */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center justify-center gap-2 text-xs text-[#00D4FF]"
        >
          <Volume2 className="w-4 h-4" />
          <span>{isResolving ? "Finding stream…" : "Streaming via YouTube"}</span>
        </motion.div>
      </div>
    </div>
  );
}