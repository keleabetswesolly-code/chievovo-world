import React from "react";
import { motion } from "framer-motion";
import { Play, Heart } from "lucide-react";

export default function FeaturedCard({ 
  image, 
  title, 
  subtitle, 
  tag, 
  onPlay, 
  onClick,
  gradient = "from-[#00D4FF]/20 to-transparent"
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-72 h-80 rounded-3xl overflow-hidden flex-shrink-0 cursor-pointer group"
    >
      <img 
        src={image} 
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${gradient} via-transparent to-black/60`} />
      
      {tag && (
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-[#FF6B35] text-white text-xs font-bold uppercase tracking-wider rounded-full">
            {tag}
          </span>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{title}</h3>
        <p className="text-gray-300 text-sm">{subtitle}</p>
      </div>
      
      {onPlay && (
        <button 
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
          className="absolute bottom-5 right-5 w-12 h-12 bg-[#00D4FF] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 glow-blue"
        >
          <Play className="w-5 h-5 text-black fill-black ml-0.5" />
        </button>
      )}
    </motion.div>
  );
}