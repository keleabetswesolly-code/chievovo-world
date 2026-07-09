import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  MoreHorizontal,
  Heart,
  Share2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  ListMusic,
  Cast,
  RefreshCw,
  WifiOff
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/lib/AudioContext";

// ─── Liked tracks persistence via localStorage ───────────────────────────────
const LIKED_KEY = "chievovo_liked_tracks";
function getLikedTracks() {
  try { return JSON.parse(localStorage.getItem(LIKED_KEY) || "{}"); } catch { return {}; }
}
function setLikedTrack(id, value) {
  const liked = getLikedTracks();
  if (value) liked[id] = true; else delete liked[id];
  localStorage.setItem(LIKED_KEY, JSON.stringify(liked));
}

// ─── Extract YouTube video ID from URL or raw ID ─────────────────────────────
function extractVideoId(raw) {
  if (!raw) return null;
  const match = raw.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  if (match) return match[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  return null;
}

export default function TrackPlayer() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get("id");
  const videoIdParam = urlParams.get("videoId"); // optional YouTube fallback

  const { queue, setQueue } = useAudio();

  const iframeRef = useRef(null);
  const audioRef = useRef(null);
  const retryTimerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLikedState] = useState(() => getLikedTracks()[trackId] || false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);
  const [playbackError, setPlaybackError] = useState(null); // null | 'network' | 'embed'
  const [retryCount, setRetryCount] = useState(0);

  const { data: track, isLoading, refetch } = useQuery({
    queryKey: ['track', trackId],
    queryFn: () => base44.entities.Track.filter({ id: trackId }),
    select: (data) => data[0],
    enabled: !!trackId,
  });

  // Resolve video ID: URL param > track.audio_url > null
  const videoId = videoIdParam || (track ? extractVideoId(track.audio_url) : null);
  const useYouTube = !!videoId;

  // ── Sync liked state to localStorage when trackId changes ──────────────────
  useEffect(() => {
    if (trackId) setLikedState(getLikedTracks()[trackId] || false);
  }, [trackId]);

  // ── Auto-retry on network error (max 3 attempts, 5s apart) ─────────────────
  useEffect(() => {
    if (playbackError && retryCount < 3) {
      retryTimerRef.current = setTimeout(() => handleRetry(), 5000);
    }
    return () => clearTimeout(retryTimerRef.current);
  }, [playbackError, retryCount]);

  // ── HTML5 audio progress tracking ──────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || useYouTube) return;
    const onTimeUpdate = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onError = () => setPlaybackError('network');
    const onEnded = () => { setIsPlaying(false); setProgress(0); };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
    };
  }, [useYouTube, track]);

  const togglePlay = useCallback(() => {
    const next = !isPlaying;
    setIsPlaying(next);

    if (useYouTube && iframeRef.current) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: next ? 'playVideo' : 'pauseVideo', args: [] }),
          '*'
        );
      } catch {
        setPlaybackError('embed');
      }
    } else if (audioRef.current) {
      next ? audioRef.current.play().catch(() => setPlaybackError('network'))
           : audioRef.current.pause();
    }
  }, [isPlaying, useYouTube]);

  const toggleLike = () => {
    const next = !liked;
    setLikedState(next);
    if (trackId) setLikedTrack(trackId, next);
  };

  const handleRetry = () => {
    setPlaybackError(null);
    setRetryCount(c => c + 1);
    if (useYouTube && iframeRef.current) {
      // Remount iframe by briefly clearing src
      const src = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src; }, 100);
    } else if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => setPlaybackError('network'));
    }
  };

  const handleSeek = (value) => {
    setProgress(value[0]);
    if (!useYouTube && audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (value[0] / 100) * audioRef.current.duration;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSeconds = 225;
  const currentSeconds = Math.floor((progress / 100) * totalSeconds);

  const queueIndex = queue.findIndex(t => t.id === trackId);

  const skipTo = (nextTrack) => {
    if (!nextTrack) return;
    setProgress(0);
    setIsPlaying(false);
    navigate(createPageUrl(`TrackPlayer?id=${nextTrack.id}`));
  };

  const handleSkipBack = () => {
    if (queueIndex > 0) skipTo(queue[queueIndex - 1]);
  };

  const handleSkipForward = () => {
    if (queueIndex >= 0 && queueIndex < queue.length - 1) skipTo(queue[queueIndex + 1]);
  };

  // ── Loading state ───────────────────────────────────────────────────────────
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

      {/* ── Hidden YouTube IFrame ──────────────────────────────────────────── */}
      {useYouTube && (
        <div className="absolute w-px h-px opacity-0 pointer-events-none overflow-hidden">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&enablejsapi=1&controls=0&modestbranding=1&playsinline=1`}
            allow="autoplay; encrypted-media"
            title="audio-player"
            onError={() => setPlaybackError('embed')}
          />
        </div>
      )}

      {/* ── Hidden HTML5 Audio ─────────────────────────────────────────────── */}
      {!useYouTube && track.audio_url && (
        <audio ref={audioRef} src={track.audio_url} preload="metadata" />
      )}

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

        {/* Album Art */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1 flex items-center justify-center mb-8"
        >
          <div className={`relative w-72 h-72 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
            <img src={coverImg} alt={track.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </motion.div>

        {/* ── Playback Error Banner ──────────────────────────────────────────── */}
        <AnimatePresence>
          {playbackError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <WifiOff className="w-4 h-4 text-[#FF6B35] shrink-0" />
                <span>{playbackError === 'embed' ? 'Video unavailable' : 'Stream interrupted'}</span>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#00D4FF] hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
            className={`p-3 rounded-full transition-all ${liked ? 'text-[#FF6B35]' : 'text-gray-400'}`}
          >
            <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{formatTime(currentSeconds)}</span>
            <span>{track.duration || "3:45"}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={() => setShuffleOn(!shuffleOn)}
            className={`p-2 ${shuffleOn ? 'text-[#00D4FF]' : 'text-gray-400'}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button onClick={handleSkipBack} className={`p-3 transition-colors ${queueIndex > 0 ? 'text-white' : 'text-gray-600'}`}>
            <SkipBack className="w-7 h-7 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-[#00D4FF] rounded-full flex items-center justify-center hover:bg-[#00D4FF]/90 transition-colors"
            style={{ boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)' }}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-black fill-black" />
            ) : (
              <Play className="w-7 h-7 text-black fill-black ml-1" />
            )}
          </button>
          <button onClick={handleSkipForward} className={`p-3 transition-colors ${queueIndex >= 0 && queueIndex < queue.length - 1 ? 'text-white' : 'text-gray-600'}`}>
            <SkipForward className="w-7 h-7 fill-current" />
          </button>
          <button
            onClick={() => setRepeatOn(!repeatOn)}
            className={`p-2 ${repeatOn ? 'text-[#00D4FF]' : 'text-gray-400'}`}
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
          <span>{useYouTube ? "Streaming via YouTube" : "Playing on Buddyz Pro"}</span>
        </motion.div>
      </div>
    </div>
  );
}