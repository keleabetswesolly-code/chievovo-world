import React from "react";
import { motion } from "framer-motion";
import { Play, Youtube } from "lucide-react";

export default function YouTubeResultRow({ item, index, onPlay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onPlay(item.videoId, item.title, item.thumbnail)}
      className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.07] transition-colors group"
    >
      <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold line-clamp-2 leading-tight">{item.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Youtube className="w-3 h-3 text-red-500" />
          <p className="text-xs text-gray-500">{item.channel}</p>
        </div>
      </div>
    </motion.div>
  );
}