import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  MoreHorizontal,
  Users,
  Mic,
  MicOff,
  Hand,
  MessageCircle,
  Share2,
  Heart,
  Volume2,
  VolumeX,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function RoomDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("id");

  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);

  const { data: room, isLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => base44.entities.LiveRoom.filter({ id: roomId }),
    select: (data) => data[0],
    enabled: !!roomId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-5">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Room not found</h2>
          <Button onClick={() => navigate(createPageUrl("Live"))}>
            Back to Live
          </Button>
        </div>
      </div>
    );
  }

  const isLive = room.status === "live";
  const speakers = room.speakers || [];
  const listeners = Array(Math.min(room.listeners || 12, 12)).fill(null).map((_, i) => ({
    id: i,
    name: `Listener ${i + 1}`,
    image: `https://i.pravatar.cc/100?img=${i + 10}`
  }));

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-white/5">
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate(createPageUrl("Live"))}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-red-400">LIVE</span>
            </span>
          )}
          <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full">
            <Users className="w-4 h-4" />
            <span className="text-sm">{room.listeners || 0}</span>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Room Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Room Info */}
        <div className="mb-8">
          <span className="text-xs text-[#00D4FF] font-bold uppercase tracking-wider">
            {room.category}
          </span>
          <h1 className="text-2xl font-black mt-1 mb-2">{room.title}</h1>
          <p className="text-gray-400 text-sm">{room.description}</p>
        </div>

        {/* Host Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Host
          </h2>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-3">
              <Avatar className="w-24 h-24 border-4 border-[#00D4FF] ring-4 ring-[#00D4FF]/30">
                <AvatarImage src={room.host_image} />
                <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FF6B35] text-2xl">
                  {room.host_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#00D4FF] rounded-full flex items-center justify-center">
                <Mic className="w-4 h-4 text-black" />
              </div>
            </div>
            <p className="font-bold">{room.host_name}</p>
            <p className="text-xs text-gray-500">Host</p>
          </motion.div>
        </div>

        {/* Speakers Section */}
        {speakers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Speakers ({speakers.length})
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {speakers.map((speaker, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-2">
                    <Avatar className="w-16 h-16 border-2 border-[#FF6B35]">
                      <AvatarImage src={speaker.image} />
                      <AvatarFallback className="bg-[#FF6B35]/20">
                        {speaker.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center">
                      <Mic className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-medium truncate w-full text-center">{speaker.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Listeners Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Listeners ({room.listeners || 0})
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {listeners.map((listener, i) => (
              <motion.div
                key={listener.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex flex-col items-center"
              >
                <Avatar className="w-12 h-12 mb-1">
                  <AvatarImage src={listener.image} />
                  <AvatarFallback className="bg-white/10 text-xs">
                    {listener.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            ))}
            {(room.listeners || 0) > 12 && (
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-xs text-gray-400">+{(room.listeners || 0) - 12}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="sticky bottom-0 glass-card border-t border-white/10 px-5 py-4" style={{ background: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate(createPageUrl("Live"))}
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Leave
          </Button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHandRaised(!handRaised)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                handRaised ? 'bg-[#FF6B35] text-white' : 'bg-white/10 text-gray-400'
              }`}
            >
              <Hand className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-gray-400">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-white/10 text-gray-400' : 'bg-[#00D4FF] text-black'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>

          <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-gray-400">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}