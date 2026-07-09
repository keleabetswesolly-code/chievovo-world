import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
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
  Cast
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export default function TrackPlayer() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get("id");

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [liked, setLiked] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);

  const { data: track, isLoading } = useQuery({
    queryKey: ['track', trackId],
    queryFn: () => base44.entities.Track.filter({ id: trackId }),
    select: (data) => data[0],
    enabled: !!trackId,
  });

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
          <Button onClick={() => navigate(createPageUrl("Music"))}>
            Back to Music
          </Button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSeconds = 225; // 3:45
  const currentSeconds = Math.floor((progress / 100) * totalSeconds);

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute inset-0">
        <img
          src={track.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"}
          alt=""
          className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
        />
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

        {/* Album Art */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1 flex items-center justify-center mb-8"
        >
          <div className={`relative w-72 h-72 rounded-3xl overflow-hidden shadow-2xl ${isPlaying ? 'animate-pulse' : ''}`}>
            <img
              src={track.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"}
              alt={track.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
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
            onClick={() => setLiked(!liked)}
            className={`p-3 rounded-full transition-all ${liked ? 'text-[#FF6B35]' : 'text-gray-400'}`}
          >
            <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Slider
            value={[progress]}
            onValueChange={(value) => setProgress(value[0])}
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
          <button className="p-3 text-white">
            <SkipBack className="w-7 h-7 fill-white" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 bg-[#00D4FF] rounded-full flex items-center justify-center hover:bg-[#00D4FF]/90 transition-colors glow-blue"
            style={{ boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)' }}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-black fill-black" />
            ) : (
              <Play className="w-7 h-7 text-black fill-black ml-1" />
            )}
          </button>
          <button className="p-3 text-white">
            <SkipForward className="w-7 h-7 fill-white" />
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
          <span>Playing on Buddyz Pro</span>
        </motion.div>
      </div>
    </div>
  );
}