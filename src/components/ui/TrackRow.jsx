import React from "react";
import { motion } from "framer-motion";
import { Play, MoreHorizontal, Heart } from "lucide-react";

export default function TrackRow({ 
  track, 
  index, 
  onPlay, 
  onClick,
  isPlaying = false 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
    >
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
        <img 
          src={track.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200"} 
          alt={track.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onPlay?.(); }}
            className="w-8 h-8 bg-[#00D4FF] rounded-full flex items-center justify-center"
          >
            <Play className="w-4 h-4 text-black fill-black ml-0.5" />
          </button>
        </div>
        {isPlaying && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="flex gap-0.5 items-end h-4">
              <span className="w-1 bg-[#00D4FF] rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0ms' }} />
              <span className="w-1 bg-[#00D4FF] rounded-full animate-pulse" style={{ height: '100%', animationDelay: '150ms' }} />
              <span className="w-1 bg-[#00D4FF] rounded-full animate-pulse" style={{ height: '40%', animationDelay: '300ms' }} />
              <span className="w-1 bg-[#00D4FF] rounded-full animate-pulse" style={{ height: '80%', animationDelay: '450ms' }} />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold truncate ${isPlaying ? 'text-[#00D4FF]' : 'text-white'}`}>
          {track.title}
        </h4>
        <p className="text-sm text-gray-400 truncate">{track.artist_name}</p>
      </div>
      
      <span className="text-sm text-gray-500">{track.duration || "3:45"}</span>
      
      <button className="p-2 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
        <Heart className="w-5 h-5" />
      </button>
      
      <button className="p-2 text-gray-500 hover:text-white transition-colors">
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </motion.div>
  );
}