import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, MessageCircle, Play, Radio, Cpu, ShoppingBag, Newspaper, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const typeConfig = {
  playlist: { label: "Trending Playlist", color: "#00D4FF", icon: Play },
  mix: { label: "DJ Mix", color: "#FF6B35", icon: Play },
  room: { label: "Live Now", color: "#FF4444", icon: Radio },
  community: { label: "Community", color: "#A855F7", icon: MessageCircle },
  tech: { label: "Tech Update", color: "#00D4FF", icon: Newspaper },
  product: { label: "New Drop", color: "#FF6B35", icon: ShoppingBag },
  event: { label: "Upcoming Event", color: "#22C55E", icon: Radio },
  collab: { label: "Open Collab", color: "#FF6B35", icon: Cpu },
};

export default function FeedCard({ item, index, onClick }) {
  const [liked, setLiked] = useState(false);
  const cfg = typeConfig[item.type] || typeConfig.tech;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="relative rounded-3xl overflow-hidden cursor-pointer"
      style={{ background: "rgba(17,17,17,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}
      onClick={onClick}
    >
      {/* Cover Image */}
      {item.image && (
        <div className="relative w-full h-52 overflow-hidden">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111]/90 via-[#111]/30 to-transparent" />

          {/* Type Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm"
            style={{ background: `${cfg.color}22`, border: `1px solid ${cfg.color}44` }}>
            {item.type === "room" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            <Icon className="w-3 h-3" style={{ color: cfg.color }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
          </div>

          {/* Play button for media types */}
          {(item.type === "mix" || item.type === "playlist") && (
            <div className="absolute bottom-3 right-3 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: cfg.color, boxShadow: `0 0 20px ${cfg.color}66` }}>
              <Play className="w-5 h-5 text-black fill-black ml-0.5" />
            </div>
          )}

          {/* Live listener count */}
          {item.type === "room" && item.meta && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
              <span className="text-xs font-bold text-white">{item.meta} listening</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Author row for community */}
        {item.author && (
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="w-8 h-8 border border-white/10">
              <AvatarImage src={item.authorImage} />
              <AvatarFallback className="text-xs bg-white/10">{item.author?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold leading-none">{item.author}</p>
              {item.authorRole && <p className="text-[11px] text-gray-500">{item.authorRole}</p>}
            </div>
          </div>
        )}

        <h3 className="font-bold text-base leading-snug mb-1">{item.title}</h3>
        {item.subtitle && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{item.subtitle}</p>}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-400 bg-white/5">#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
              className="flex items-center gap-1.5 text-sm"
              style={{ color: liked ? "#FF6B35" : "#6B7280" }}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span>{liked ? (item.likes || 0) + 1 : item.likes || 0}</span>
            </button>
            {item.comments != null && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span>{item.comments}</span>
              </div>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); }} className="text-gray-600 hover:text-gray-400 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}