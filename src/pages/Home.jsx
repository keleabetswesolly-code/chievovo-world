import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Play, Bell, Search, Headphones, Zap, Radio, Cpu, Users2, Newspaper, ArrowRight } from "lucide-react";
import TrackRow from "@/components/ui/TrackRow";
import LiveRoomCard from "@/components/ui/LiveRoomCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DJMixCard from "@/components/home/DJMixCard";
import EcosystemPill from "@/components/home/EcosystemPill";
import TechPostCard from "@/components/home/TechPostCard";
import CollabCard from "@/components/home/CollabCard";

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
  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list('-followers', 8),
  });
  const { data: mixes = [] } = useQuery({
    queryKey: ['mixes-home'],
    queryFn: () => base44.entities.DJMix.filter({ featured: true }, '-plays', 4),
  });
  const { data: techPosts = [] } = useQuery({
    queryKey: ['tech-posts-home'],
    queryFn: () => base44.entities.TechPost.filter({ is_featured: true }, '-created_date', 3),
  });
  const { data: collabs = [] } = useQuery({
    queryKey: ['collabs-home'],
    queryFn: () => base44.entities.CollabProject.filter({ status: 'open' }, '-created_date', 3),
  });
  const { data: communityPosts = [] } = useQuery({
    queryKey: ['community-home'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 3),
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-40 px-5 py-4 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D4FF, #FF6B35)' }}>
              <Headphones className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none" style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #FF6B35 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                CHIEVOVO WORLD
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Music · Tech · Culture</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(createPageUrl("Discover"))} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
            </button>
            <button className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#FF6B35] rounded-full" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-5 pb-8 space-y-8">

        {/* Ecosystem Pills */}
        <div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {[
              { label: "Discover", icon: Search, page: "Discover", color: "#00D4FF" },
              { label: "DJ Mixes", icon: Play, page: "Music", color: "#FF6B35" },
              { label: "Live Rooms", icon: Radio, page: "Live", color: "#00D4FF", dot: true },
              { label: "Collab", icon: Cpu, page: "Collab", color: "#FF6B35" },
              { label: "Community", icon: Users2, page: "Community", color: "#00D4FF" },
              { label: "Tech", icon: Newspaper, page: "Tech", color: "#FF6B35" },
              { label: "Shop", icon: Headphones, page: "Shop", color: "#00D4FF" },
            ].map((pill) => (
              <EcosystemPill key={pill.label} {...pill} onClick={() => navigate(createPageUrl(pill.page))} />
            ))}
          </div>
        </div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-52 rounded-3xl overflow-hidden cursor-pointer"
          onClick={() => navigate(createPageUrl("Shop"))}
        >
          <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800" alt="Buddyz Earbuds" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, #000000ee 40%, #00D4FF15 100%)' }} />
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-black" style={{ background: '#00D4FF' }}>
                New Drop
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#00D4FF] uppercase tracking-widest mb-1">Buddyz Pro</p>
              <h2 className="text-3xl font-black mb-1 leading-none">Sound.<br />Redefined.</h2>
              <p className="text-gray-400 text-xs mb-4">Next-gen earbuds built for African beats</p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-black" style={{ background: '#00D4FF' }}>
                <Zap className="w-4 h-4" /> Shop Now
              </span>
            </div>
          </div>
        </motion.div>

        {/* Ecosystem Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Tracks", value: "12K+", color: "#00D4FF" },
            { label: "Artists", value: "500+", color: "#FF6B35" },
            { label: "Live", value: `${liveRooms.length || 3}`, color: "#00D4FF", dot: true },
            { label: "Collabs", value: "89+", color: "#FF6B35" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="text-center py-3 rounded-2xl relative overflow-hidden"
              style={{ background: `${s.color}0D`, border: `1px solid ${s.color}22` }}>
              <div className="flex items-center justify-center gap-1">
                {s.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-live" />}
                <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Live Now */}
        {liveRooms.length > 0 && (
          <section>
            <SectionHeader title="Live Now" subtitle="Active rooms" link={createPageUrl("Live")} />
            <div className="grid gap-3">
              {liveRooms.slice(0, 2).map(room => (
                <LiveRoomCard key={room.id} room={room} onClick={() => navigate(createPageUrl(`RoomDetail?id=${room.id}`))} />
              ))}
            </div>
          </section>
        )}

        {/* DJ Mixes */}
        {mixes.length > 0 && (
          <section>
            <SectionHeader title="DJ Mixes" subtitle="Fresh sets & sessions" link={createPageUrl("Music")} />
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5">
              {mixes.map((mix, i) => (
                <DJMixCard key={mix.id} mix={mix} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Artists */}
        <section>
          <SectionHeader title="Trending Artists" subtitle="African talent" link={createPageUrl("Music")} />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5">
            {artists.map((artist, i) => (
              <motion.div key={artist.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                onClick={() => navigate(createPageUrl(`ArtistDetail?id=${artist.id}`))}
                className="flex-shrink-0 text-center cursor-pointer group w-[72px]">
                <div className="relative w-[72px] h-[72px] mb-2">
                  <Avatar className="w-full h-full border-2 border-transparent group-hover:border-[#00D4FF] transition-all duration-300">
                    <AvatarImage src={artist.image_url} className="object-cover" />
                    <AvatarFallback className="text-lg" style={{ background: 'linear-gradient(135deg, #00D4FF22, #FF6B3522)' }}>{artist.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {artist.verified && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0A0A0A]" style={{ background: '#00D4FF' }}>
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold truncate">{artist.name}</p>
                <p className="text-[10px] text-gray-500">{artist.genre}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trending Tracks */}
        <section>
          <SectionHeader title="Trending Now" subtitle="Hot tracks this week" link={createPageUrl("Music")} />
          <div className="space-y-1 bg-white/[0.02] rounded-2xl overflow-hidden border border-white/5 p-1">
            {tracks.slice(0, 5).map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} onClick={() => navigate(createPageUrl(`TrackPlayer?id=${track.id}`))} />
            ))}
          </div>
        </section>

        {/* Open Collabs */}
        {collabs.length > 0 && (
          <section>
            <SectionHeader title="Open Collabs" subtitle="Find your next partner" link={createPageUrl("Collab")} />
            <div className="space-y-3">
              {collabs.slice(0, 2).map((collab, i) => (
                <CollabCard key={collab.id} collab={collab} index={i} onClick={() => navigate(createPageUrl("Collab"))} />
              ))}
            </div>
          </section>
        )}

        {/* Community Feed Peek */}
        {communityPosts.length > 0 && (
          <section>
            <SectionHeader title="Community" subtitle="What's happening" link={createPageUrl("Community")} />
            <div className="space-y-3">
              {communityPosts.slice(0, 2).map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                  style={{ background: 'rgba(17,17,17,0.6)' }}
                  onClick={() => navigate(createPageUrl("Community"))}>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-9 h-9 border border-white/10">
                      <AvatarImage src={post.author_image} />
                      <AvatarFallback className="text-xs bg-white/10">{post.author_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{post.author_name}</p>
                      <p className="text-xs text-gray-500">{post.author_role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">{post.content}</p>
                </motion.div>
              ))}
              <button onClick={() => navigate(createPageUrl("Community"))} className="w-full py-3 rounded-2xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-[#00D4FF]/40 transition-all flex items-center justify-center gap-2">
                View Community <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* Tech Updates */}
        {techPosts.length > 0 && (
          <section>
            <SectionHeader title="Tech & Updates" subtitle="Innovation from CHIEVOVO" link={createPageUrl("Tech")} />
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5">
              {techPosts.map((post, i) => (
                <TechPostCard key={post.id} post={post} index={i} onClick={() => navigate(createPageUrl("Tech"))} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}