import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, WifiOff, ChevronUp } from "lucide-react";
import { useAudio } from "@/lib/AudioContext";

export default function MiniPlayer() {
  const {
    currentTrack, isPlaying, isResolving, isOnline,
    isPlayerExpanded, togglePlay, clearTrack, expandPlayer,
    currentTime, duration,
  } = useAudio();
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {currentTrack && !isPlayerExpanded && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="fixed bottom-[72px] left-0 right-0 z-40 px-3"
        >
          {/* Progress bar */}
          <div className="h-0.5 rounded-full bg-white/10 overflow-hidden mb-0.5">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #22d3ee, #00D4FF)" }}
            />
          </div>

          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
            style={{
              background: "rgba(11,15,18,0.96)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.5)",
            }}
          >
            {/* Thumbnail */}
            <div
              className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer relative"
              onClick={expandPlayer}
            >
              <img
                src={currentTrack.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200"}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
              {isResolving && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={expandPlayer}>
              <p className="text-sm font-bold truncate text-white">{currentTrack.title}</p>
              <p className="text-xs truncate flex items-center gap-1">
                {!isOnline && <WifiOff className="w-3 h-3 text-[#FF6B35] flex-shrink-0" />}
                <span className={!isOnline ? "text-[#FF6B35]" : "text-gray-400"}>{currentTrack.artist_name}</span>
              </p>
            </div>

            {/* Expand */}
            <button
              onClick={expandPlayer}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={isResolving}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50"
              style={{ background: "#22d3ee", boxShadow: "0 0 12px rgba(34,211,238,0.4)" }}
            >
              {isPlaying
                ? <Pause className="w-4 h-4 text-black fill-black" />
                : <Play className="w-4 h-4 text-black fill-black ml-0.5" />}
            </button>

            {/* Dismiss */}
            <button
              onClick={clearTrack}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}