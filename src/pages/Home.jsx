import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import { UserCircle, Search, Headphones, Play, Radio, Cpu, Users2, Newspaper } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import EcosystemPill from "@/components/home/EcosystemPill";
import HeroBanner from "@/components/home/HeroBanner";
import StatsBar from "@/components/home/StatsBar";
import FeedCard from "@/components/home/FeedCard";
import YouTubeSearch from "@/components/home/YouTubeSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useArtistThumbnails from "@/hooks/useArtistThumbnails";

const PILLS = [
  { label: "Discover", icon: Search, page: "Discover", color: "#00D4FF" },
  { label: "DJ Mixes", icon: Play, page: "Music", color: "#FF6B35" },
  { label: "Live Rooms", icon: Radio, page: "Live", color: "#00D4FF", dot: true },
  { label: "Collab", icon: Cpu, page: "Collab", color: "#FF6B35" },
  { label: "Community", icon: Users2, page: "Community", color: "#00D4FF" },
  { label: "Tech", icon: Newspaper, page: "Tech", color: "#FF6B35" },
  { label: "Shop", icon: Headphones, page: "Shop", color: "#00D4FF" },
];

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks-featured'],
    queryFn: () => base44.entities.Track.filter({ featured: true }, '-plays', 6),
  });
  const { data: liveRooms = [] } = useQuery({
    queryKey: ['live-rooms'],
    queryFn: () => base44.entities.LiveRoom.filter({ status: 'live' }, '-listeners', 4),
  });
  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list('-followers', 8),
  });
  const { data: mixes = [] } = useQuery({
    queryKey: ['mixes-home'],
    queryFn: () => base44.entities.DJMix.list('-plays', 6),
  });
  const { data: techPosts = [] } = useQuery({
    queryKey: ['tech-posts-home'],
    queryFn: () => base44.entities.TechPost.list('-created_date', 5),
  });
  const { data: collabs = [] } = useQuery({
    queryKey: ['collabs-home'],
    queryFn: () => base44.entities.CollabProject.filter({ status: 'open' }, '-created_date', 4),
  });
  const { data: communityPosts = [] } = useQuery({
    queryKey: ['community-home'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 5),
  });
  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists-home'],
    queryFn: () => base44.entities.Playlist.list('-followers', 4),
  });
  const { data: products = [] } = useQuery({
    queryKey: ['products-featured'],
    queryFn: () => base44.entities.Product.filter({ featured: true }, '-created_date', 3),
  });

  const artistThumbnails = useArtistThumbnails(artists);

  const ptr = usePullToRefresh(() => {
    queryClient.invalidateQueries({ queryKey: ['tracks-featured'] });
    queryClient.invalidateQueries({ queryKey: ['live-rooms'] });
    queryClient.invalidateQueries({ queryKey: ['artists'] });
    queryClient.invalidateQueries({ queryKey: ['mixes-home'] });
    queryClient.invalidateQueries({ queryKey: ['community-home'] });
  });

  // Build interleaved TikTok-style feed
  const feedItems = useMemo(() => {
    const items = [];

    // Live rooms first — highest urgency
    liveRooms.forEach(r => items.push({
      type: "room", id: r.id, title: r.title,
      subtitle: `Hosted by ${r.host_name} · ${r.category}`,
      image: r.cover_url || r.host_image || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
      meta: r.listeners, likes: null, page: `RoomDetail?id=${r.id}`
    }));

    // Trending playlists
    playlists.forEach(p => items.push({
      type: "playlist", id: p.id, title: p.name,
      subtitle: p.description,
      image: p.cover_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
      tags: p.genre ? [p.genre] : [],
      likes: p.followers, page: "Music"
    }));

    // DJ Mixes
    mixes.forEach(m => items.push({
      type: "mix", id: m.id, title: m.title,
      subtitle: `${m.dj_name} · ${m.genre}`,
      image: m.cover_url || "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800",
      likes: m.likes, page: "Music"
    }));

    // Community posts
    communityPosts.forEach(p => items.push({
      type: "community", id: p.id, title: p.content?.slice(0, 80) + (p.content?.length > 80 ? "…" : ""),
      subtitle: null, author: p.author_name, authorRole: p.author_role,
      authorImage: p.author_image, image: p.media_type !== "none" ? p.media_url : null,
      tags: p.tags, likes: p.likes, comments: p.comments, page: "Community"
    }));

    // Tech updates
    techPosts.forEach(p => items.push({
      type: "tech", id: p.id, title: p.title,
      subtitle: p.summary,
      image: p.cover_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
      tags: p.tags, likes: p.likes, page: "Tech"
    }));

    // New product launches
    products.forEach(p => items.push({
      type: "product", id: p.id, title: p.name,
      subtitle: p.description,
      image: (p.images || [])[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      likes: p.reviews_count, page: `ProductDetail?id=${p.id}`
    }));

    // Open collabs
    collabs.forEach(c => items.push({
      type: "collab", id: c.id, title: c.title,
      subtitle: `${c.genre} · ${c.daw} · ${c.bpm ? c.bpm + " BPM" : ""}`,
      image: c.cover_url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
      tags: c.roles_needed, likes: c.likes, page: "Collab"
    }));

    // Interleave: shuffle while keeping live rooms near top
    const liveItems = items.filter(i => i.type === "room");
    const rest = items.filter(i => i.type !== "room");

    // Mix rest with a deterministic shuffle
    const mixed = [];
    let ri = 0;
    const order = ["mix", "playlist", "tech", "community", "collab", "product", "community", "mix", "tech"];
    order.forEach(t => {
      const idx = rest.findIndex((item, i) => item.type === t && i >= ri);
      if (idx >= 0) { mixed.push(rest[idx]); rest.splice(idx, 1); }
    });
    mixed.push(...rest);

    return [...liveItems, ...mixed];
  }, [liveRooms, playlists, mixes, communityPosts, techPosts, products, collabs]);

  return (
    <div className="min-h-screen bg-[#0A0A0A]" {...ptr}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-5 py-4 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/69a791e052caf5d23b3b4005/2750bf44e_1000229494-removebg-preview.png"
              alt="Chievovo Logo"
              className="h-20 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none" style={{ background: "linear-gradient(135deg, #00D4FF 0%, #FF6B35 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                CHIEVOVO WORLD
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Music · Tech · Culture</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(createPageUrl("Profile"))} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <UserCircle className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-5 pb-10 space-y-6">

        {/* Ecosystem Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {PILLS.map(pill => (
            <EcosystemPill key={pill.label} {...pill} onClick={() => navigate(createPageUrl(pill.page))} />
          ))}
        </div>

        {/* Hero Banner */}
        <HeroBanner onClick={() => navigate(createPageUrl("Shop"))} />

        {/* Stats Bar */}
        <StatsBar liveCount={liveRooms.length} />

        {/* Trending Artists Strip */}
        {artists.length > 0 && (
          <section>
            <SectionHeader title="Trending Artists" subtitle="African talent" link={createPageUrl("Music")} />
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5">
              {artists.map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(createPageUrl(`ArtistDetail?id=${artist.id}`))}
                  className="flex-shrink-0 text-center cursor-pointer group w-[72px]"
                >
                  <div className="relative w-[72px] h-[72px] mb-2">
                    <Avatar className="w-full h-full border-2 border-transparent group-hover:border-[#00D4FF] transition-all duration-300">
                      <AvatarImage src={artistThumbnails[artist.id] || artist.image_url} className="object-cover" />
                      <AvatarFallback className="text-lg" style={{ background: "linear-gradient(135deg, #00D4FF22, #FF6B3522)" }}>
                        {artist.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {artist.verified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0A0A0A]" style={{ background: "#00D4FF" }}>
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
        )}

        {/* YouTube Search */}
        <YouTubeSearch />

        {/* Dynamic Discovery Feed */}
        <section>
          <SectionHeader title="For You" subtitle="Curated by CHIEVOVO" />
          <div className="space-y-4">
            {feedItems.length === 0 ? (
              <div className="py-16 text-center text-gray-600">Add some content to see your feed</div>
            ) : (
              feedItems.map((item, i) => (
                <FeedCard
                  key={`${item.type}-${item.id}-${i}`}
                  item={item}
                  index={i}
                  onClick={() => navigate(createPageUrl(item.page))}
                />
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}