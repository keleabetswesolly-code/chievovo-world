import React from "react";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";

export default function DJMixCard({ mix, index, onClick }) {
  const formatPlays = (n) => {
    if (!n) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-shrink-0 w-52 cursor-pointer group"
    >
      <div className="relative w-52 h-52 rounded-2xl overflow-hidden mb-3">
        <img
          src={mix.cover_url || "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400"}
          alt={mix.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-wider">{mix.genre}</span>
            {mix.episode && <p className="text-[10px] text-gray-400">{mix.episode}</p>}
          </div>
          <div className="flex items-center gap-1 text-gray-300 text-xs">
            <Clock className="w-3 h-3" />
            {mix.duration}
          </div>
        </div>
        <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#00D4FF] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100" style={{ boxShadow: '0 0 20px rgba(0,212,255,0.5)' }}>
          <Play className="w-4 h-4 text-black fill-black ml-0.5" />
        </div>
      </div>
      <h3 className="font-bold text-sm line-clamp-1 mb-0.5">{mix.title}</h3>
      <p className="text-xs text-gray-400">{mix.dj_name} · {formatPlays(mix.plays)} plays</p>
    </motion.div>
  );
}