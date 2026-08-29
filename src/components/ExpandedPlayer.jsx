import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown, MoreHorizontal, Heart, Play, Pause,
  SkipBack, SkipForward, Repeat, Shuffle,
  Volume2, ListMusic, Cast, WifiOff,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/lib/AudioContext";

const LIKED_KEY = "chievovo_liked_tracks";
const getLiked = () => { try { return JSON.parse(localStorage.getItem(LIKED_KEY) || "{}"); } catch { return {}; } };
const setLiked = (id, v) => {
  const l = getLiked();
  if (v) l[id] = true; else delete l[id];
  localStorage.setItem(LIKED_KEY, JSON.stringify(l));
};

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const x = Math.floor(s % 60);
  return `${m}:${x.toString().padStart(2, "0")}`;
};

const FALLBACK_COVER = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800";

export default function ExpandedPlayer() {
  const {
    currentTrack, isPlaying, isResolving, isOnline,
    isPlayerExpanded, collapsePlayer,
    togglePlay, nextTrack, prevTrack, seek,
    iframeRef, currentTime, duration,
  } = useAudio();

  const [liked, setLikedState] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);
  const [iframeVisible, setIframeVisible] = useState(false);

  useEffect(() => {
    if (currentTrack?.id) setLikedState(!!getLiked()[currentTrack.id]);
    setIframeVisible(false);
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  const videoId = currentTrack.videoId;
  const cover = currentTrack.cover_url || FALLBACK_COVER;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const toggleLike = () => {
    const next = !liked;
    setLikedState(next);
    setLiked(currentTrack.id, next);
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: isPlayerExpanded ? 0 : "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 320 }}
      className="fixed inset-0 z-[60] overflow-hidden"
      style={{ background: "#0b0f12", pointerEvents: isPlayerExpanded ? "auto" : "none" }}
    >
      {/* Ambient backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        <img src={cover} alt="" className="w-full h-full object-cover blur-3xl opacity-20 scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f12]/80 via-[#0b0f12]/95 to-[#0b0f12]" />
      </div>

      <div
        className="relative z-10 h-full flex flex-col px-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        {/* Header */}
        <header className="flex items-center justify-between py-3">
          <button
            onClick={collapsePlayer}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
          >
            <ChevronDown className="w-5 h-5 text-white" />
          </button>
          <div className="text-center">
            <p className="text-[10px] tracking-[0.25em] text-gray-400 uppercase font-semibold">Now Playing</p>
            <p className="text-sm font-medium text-white">{currentTrack.album || "Single"}</p>
          </div>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
          >
            <MoreHorizontal className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* Media / Video card */}
        <div
          className="rounded-3xl p-4 mt-3 flex-shrink-0"
          style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <img src={cover} alt={currentTrack.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentTrack.title}</p>
              <p className="text-xs text-gray-400 truncate">{currentTrack.artist_name}</p>
            </div>
          </div>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
            <img
              src={cover}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${iframeVisible ? "opacity-0" : "opacity-100"}`}
            />
            {isResolving && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                <div className="w-10 h-10 rounded-full border-2 border-[#22d3ee] border-t-transparent animate-spin" />
              </div>
            )}
            {videoId && (
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&playsinline=1&enablejsapi=1`}
                allow="autoplay; encrypted-media; picture-in-picture; web-share"
                title="expanded-player"
                className="absolute inset-0 w-full h-full border-0"
                onLoad={() => setIframeVisible(true)}
              />
            )}
          </div>
        </div>

        {/* Track meta + heart */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-white truncate">{currentTrack.title}</h1>
            <p className="text-gray-400 truncate">{currentTrack.artist_name}</p>
          </div>
          <button
            onClick={toggleLike}
            className={`p-2.5 rounded-full transition-colors ${liked ? "text-[#22d3ee]" : "text-gray-400"}`}
          >
            <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <Slider
            value={[progress]}
            onValueChange={(v) => duration > 0 && seek((v[0] / 100) * duration)}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{fmt(currentTime)}</span>
            <span>{duration > 0 ? fmt(duration) : (currentTrack.duration || "–:––")}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-5 px-2">
          <button onClick={() => setShuffleOn(!shuffleOn)} className={`p-2 ${shuffleOn ? "text-[#22d3ee]" : "text-gray-400"}`}>
            <Shuffle className="w-5 h-5" />
          </button>
          <button onClick={prevTrack} className="p-2 text-white">
            <SkipBack className="w-7 h-7 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            disabled={isResolving}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
            style={{ background: "#22d3ee", boxShadow: "0 0 30px rgba(34,211,238,0.5)" }}
          >
            {isPlaying
              ? <Pause className="w-7 h-7 text-black fill-black" />
              : <Play className="w-7 h-7 text-black fill-black ml-1" />}
          </button>
          <button onClick={nextTrack} className="p-2 text-white">
            <SkipForward className="w-7 h-7 fill-current" />
          </button>
          <button onClick={() => setRepeatOn(!repeatOn)} className={`p-2 ${repeatOn ? "text-[#22d3ee]" : "text-gray-400"}`}>
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        {/* Footer — stream provenance */}
        <div className="mt-auto flex items-center justify-between pt-6">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Cast className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs text-[#22d3ee]">
            {isOnline ? <Volume2 className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="font-medium tracking-wide">
              {isResolving
                ? "Finding stream…"
                : currentTrack.source === "local"
                  ? "Playing from Library"
                  : isOnline ? "Streaming via YouTube" : "Offline — cached stream"}
            </span>
          </div>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}