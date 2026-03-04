import React from "react";
import { motion } from "framer-motion";
import { Users, Mic2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LiveRoomCard({ room, onClick }) {
  const isLive = room.status === "live";
  
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-all"
      style={{ background: 'rgba(17, 17, 17, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Live</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-[#00D4FF]/10 rounded-full text-xs font-semibold text-[#00D4FF] uppercase tracking-wide">
              Scheduled
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
          {room.category}
        </span>
      </div>
      
      <h3 className="font-bold text-lg mb-2 line-clamp-2">{room.title}</h3>
      
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="w-8 h-8 border-2 border-[#00D4FF]">
          <AvatarImage src={room.host_image} />
          <AvatarFallback className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
            {room.host_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{room.host_name}</p>
          <p className="text-xs text-gray-500">Host</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {room.speakers?.slice(0, 4).map((speaker, i) => (
            <Avatar key={i} className="w-7 h-7 border-2 border-[#0A0A0A]">
              <AvatarImage src={speaker.image} />
              <AvatarFallback className="bg-gray-800 text-xs">
                {speaker.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
          {room.speakers?.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-gray-800 border-2 border-[#0A0A0A] flex items-center justify-center">
              <span className="text-xs text-gray-400">+{room.speakers.length - 4}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-gray-400">
          <Users className="w-4 h-4" />
          <span className="text-sm">{room.listeners || 0}</span>
        </div>
      </div>
    </motion.div>
  );
}