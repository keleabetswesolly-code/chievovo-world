import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Play, Bell, Search, Headphones, Zap, Radio } from "lucide-react";
import FeaturedCard from "@/components/ui/FeaturedCard";
import TrackRow from "@/components/ui/TrackRow";
import LiveRoomCard from "@/components/ui/LiveRoomCard";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const navigate = useNavigate();

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks-featured'],
    queryFn: () => base44.entities.Track.filter({ featured: true }, '-plays', 6),
  });

  const { data: liveRooms = [] } = useQuery({
    queryKey: ['live-rooms'],
    queryFn: () => base44.entities.LiveRoom.filter({ status: 'live' }, '-listeners', 3),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-featured'],
    queryFn: () => base44.entities.Product.filter({ featured: true }, '-created_date', 4),
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list('-followers', 8),
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-40 px-5 py-4 bg-gradient-to-b from-[#0A0A0A] to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #FF6B35 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                CHIEVOVO
              </span>
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">World</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
            </button>
            <button className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF6B35] rounded-full" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-5 pb-8">
        {/* Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 rounded-3xl overflow-hidden mb-8"
        >
          <img 
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800" 
            alt="Buddyz Earbuds"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-[#00D4FF]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#00D4FF]">
                Buddyz Pro
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-black mb-1">Sound. Redefined.</h2>
              <p className="text-gray-400 text-sm mb-3">Next-gen earbuds for African beats</p>
              <button 
                onClick={() => navigate(createPageUrl("Shop"))}
                className="px-5 py-2.5 bg-[#00D4FF] text-black font-bold text-sm rounded-full hover:bg-[#00D4FF]/90 transition-colors inline-flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Shop Now
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Tracks", value: "12K+", color: "#00D4FF" },
            { label: "Artists", value: "500+", color: "#FF6B35" },
            { label: "Live Now", value: liveRooms.length || "3", color: "#00D4FF" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center py-4 rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${stat.color}10, transparent)`, border: `1px solid ${stat.color}20` }}
            >
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Live Now */}
        {liveRooms.length > 0 && (
          <section className="mb-8">
            <SectionHeader 
              title="Live Now" 
              subtitle="Join the conversation"
              link={createPageUrl("Live")}
            />
            <div className="grid gap-3">
              {liveRooms.slice(0, 2).map((room) => (
                <LiveRoomCard 
                  key={room.id} 
                  room={room}
                  onClick={() => navigate(createPageUrl(`RoomDetail?id=${room.id}`))}
                />
              ))}
            </div>
          </section>
        )}

        {/* Trending Artists */}
        <section className="mb-8">
          <SectionHeader 
            title="Trending Artists" 
            subtitle="Discover African talent"
            link={createPageUrl("Music")}
          />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5">
            {artists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(createPageUrl(`ArtistDetail?id=${artist.id}`))}
                className="flex-shrink-0 text-center cursor-pointer group"
              >
                <div className="relative w-20 h-20 mb-2">
                  <Avatar className="w-full h-full border-2 border-transparent group-hover:border-[#00D4FF] transition-colors">
                    <AvatarImage src={artist.image_url} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-[#00D4FF]/20 to-[#FF6B35]/20 text-lg">
                      {artist.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {artist.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#00D4FF] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium truncate w-20">{artist.name}</p>
                <p className="text-xs text-gray-500">{artist.genre}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trending Tracks */}
        <section className="mb-8">
          <SectionHeader 
            title="Trending Now" 
            subtitle="Hot tracks this week"
            link={createPageUrl("Music")}
          />
          <div className="space-y-1">
            {tracks.slice(0, 5).map((track, i) => (
              <TrackRow 
                key={track.id} 
                track={track} 
                index={i}
                onClick={() => navigate(createPageUrl(`TrackPlayer?id=${track.id}`))}
              />
            ))}
          </div>
        </section>

        {/* Shop Section */}
        <section>
          <SectionHeader 
            title="Shop Buddyz" 
            subtitle="Premium audio gear"
            link={createPageUrl("Shop")}
          />
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 4).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onClick={() => navigate(createPageUrl(`ProductDetail?id=${product.id}`))}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}