import React from "react";
import { motion } from "framer-motion";
import { Play, Youtube, Disc3 } from "lucide-react";

export default function SearchResultRow({ result, index, isPlaying = false, onPlay }) {
  const isYt = result.source === "youtube";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onPlay?.(result)}
      className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.07] transition-colors group"
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={result.thumbnail || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200"}
          alt={result.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#22d3ee" }}>
            <Play className="w-4 h-4 text-black fill-black ml-0.5" />
          </div>
        </div>
        {isPlaying && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="flex gap-0.5 items-end h-4">
              <span className="w-1 rounded-full animate-pulse" style={{ background: "#22d3ee", height: "60%" }} />
              <span className="w-1 rounded-full animate-pulse" style={{ background: "#22d3ee", height: "100%", animationDelay: "150ms" }} />
              <span className="w-1 rounded-full animate-pulse" style={{ background: "#22d3ee", height: "40%", animationDelay: "300ms" }} />
              <span className="w-1 rounded-full animate-pulse" style={{ background: "#22d3ee", height: "80%", animationDelay: "450ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Meta + source badge */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold line-clamp-1 leading-tight">{result.title}</p>
        <p className="text-xs text-gray-500 truncate">{result.artist}</p>
        <div className="flex items-center gap-1 mt-1">
          {isYt
            ? <Youtube className="w-3 h-3 text-red-500" />
            : <Disc3 className="w-3 h-3 text-[#22d3ee]" />}
          <span className={`text-[10px] uppercase tracking-wider font-semibold ${isYt ? "text-red-500/80" : "text-[#22d3ee]"}`}>
            {isYt ? "YouTube" : "Library"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}