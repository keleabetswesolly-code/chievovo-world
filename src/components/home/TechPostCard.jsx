import React from "react";
import { motion } from "framer-motion";
import { Clock, Zap } from "lucide-react";

export default function TechPostCard({ post, index, onClick }) {
  const categoryColors = {
    "Product Update": "#00D4FF",
    "Music Tech": "#FF6B35",
    "AI & Music": "#00D4FF",
    "Industry News": "#FF6B35",
    "Tutorials": "#00D4FF",
    "Gear Review": "#FF6B35",
  };
  const color = categoryColors[post.category] || "#00D4FF";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-shrink-0 w-64 cursor-pointer group"
    >
      <div className="relative h-36 rounded-2xl overflow-hidden mb-3">
        <img
          src={post.cover_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500"}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-black" style={{ background: color }}>
            {post.category}
          </span>
        </div>
      </div>
      <h3 className="font-bold text-sm line-clamp-2 mb-1">{post.title}</h3>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        <span>{post.read_time || "3 min read"}</span>
      </div>
    </motion.div>
  );
}