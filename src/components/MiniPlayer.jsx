import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X } from "lucide-react";
import { useAudio } from "@/lib/AudioContext";
import { createPageUrl } from "@/utils";

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, clearTrack, getVideoId, iframeRef } = useAudio();
  const navigate = useNavigate();
  const videoId = getVideoId(currentTrack);

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="fixed bottom-[72px] left-0 right-0 z-40 px-3"
        >
          {/* Hidden YouTube iframe — audio engine */}
          {videoId && (
            <div className="absolute w-px h-px opacity-0 pointer-events-none overflow-hidden">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1&controls=0&modestbranding=1&playsinline=1`}
                allow="autoplay; encrypted-media"
                title="global-audio-engine"
              />
            </div>
          )}

          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
            style={{
              background: 'rgba(17,17,17,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
            }}
          >
            {/* Thumbnail — click opens full player */}
            <div
              className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
              onClick={() => navigate(createPageUrl(`TrackPlayer?id=${currentTrack.id}${videoId ? `&videoId=${videoId}` : ''}`))}
            >
              <img
                src={currentTrack.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200"}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Scrolling track info */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => navigate(createPageUrl(`TrackPlayer?id=${currentTrack.id}${videoId ? `&videoId=${videoId}` : ''}`))}
            >
              <p className="text-sm font-bold truncate text-white">{currentTrack.title}</p>
              <p className="text-xs text-gray-400 truncate">{currentTrack.artist_name}</p>
            </div>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#00D4FF', boxShadow: '0 0 12px rgba(0,212,255,0.4)' }}
            >
              {isPlaying
                ? <Pause className="w-4 h-4 text-black fill-black" />
                : <Play className="w-4 h-4 text-black fill-black ml-0.5" />
              }
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