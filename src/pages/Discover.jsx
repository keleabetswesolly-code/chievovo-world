import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowLeft, Music2, Radio, Users, Cpu, X, TrendingUp, Youtube, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TrackRow from "@/components/ui/TrackRow";
import LiveRoomCard from "@/components/ui/LiveRoomCard";
import useYouTubeSearch from "@/hooks/useYouTubeSearch";
import YouTubePlayer from "@/components/ui/YouTubePlayer";
import YouTubeResultRow from "@/components/ui/YouTubeResultRow";

const TRENDING_TAGS = ["#Amapiano", "#Afrobeats", "#FL Studio", "#Collab", "#DJSet", "#NewDrop", "#AfroHouse", "#Gqom", "#BeatMaking", "#Buddyz"];

export default function Discover() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const yt = useYouTubeSearch();

  const { data: tracks = [] } = useQuery({ queryKey: ['all-tracks'], queryFn: () => base44.entities.Track.list('-plays', 30) });
  const { data: artists = [] } = useQuery({ queryKey: ['all-artists'], queryFn: () => base44.entities.Artist.list('-followers', 20) });
  const { data: rooms = [] } = useQuery({ queryKey: ['all-rooms'], queryFn: () => base44.entities.LiveRoom.list('-listeners', 10) });
  const { data: collabs = [] } = useQuery({ queryKey: ['all-collabs'], queryFn: () => base44.entities.CollabProject.list('-created_date', 10) });

  const q = query.toLowerCase();
  const filteredTracks = tracks.filter(t => !q || t.title?.toLowerCase().includes(q) || t.artist_name?.toLowerCase().includes(q));
  const filteredArtists = artists.filter(a => !q || a.name?.toLowerCase().includes(q) || a.genre?.toLowerCase().includes(q));
  const filteredRooms = rooms.filter(r => !q || r.title?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q));
  const filteredCollabs = collabs.filter(c => !q || c.title?.toLowerCase().includes(q) || c.genre?.toLowerCase().includes(q));

  const hasResults = q && (filteredTracks.length + filteredArtists.length + filteredRooms.length + filteredCollabs.length) > 0;

  useEffect(() => {
    if (q) {
      yt.search(query);
    } else {
      yt.close();
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-40 px-5 py-4 bg-[#0A0A0A]/95 backdrop-blur-lg">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate(createPageUrl("Home"))} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={query} onChange={e => setQuery(e.target.value)} autoFocus
              placeholder="Search music, artists, rooms, collabs..."
              className="w-full pl-11 pr-10 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#00D4FF]" />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="px-5 pb-8">
        {!query ? (
          <>
            {/* Trending Tags */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
                <h2 className="text-lg font-bold">Trending</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map(tag => (
                  <button key={tag} onClick={() => setQuery(tag.replace('#', ''))}
                    className="px-3.5 py-2 rounded-full text-sm font-semibold bg-white/5 border border-white/10 hover:border-[#00D4FF]/30 hover:text-[#00D4FF] transition-all">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse Categories */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Browse</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Music & Tracks", icon: Music2, color: "#00D4FF", bg: "from-[#00D4FF]/20 to-transparent", page: "Music" },
                  { label: "Live Rooms", icon: Radio, color: "#FF6B35", bg: "from-[#FF6B35]/20 to-transparent", page: "Live" },
                  { label: "Collab Studio", icon: Cpu, color: "#00D4FF", bg: "from-[#00D4FF]/20 to-transparent", page: "Collab" },
                  { label: "Community", icon: Users, color: "#FF6B35", bg: "from-[#FF6B35]/20 to-transparent", page: "Community" },
                ].map((cat) => (
                  <motion.button key={cat.label} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(createPageUrl(cat.page))}
                    className={`p-5 rounded-2xl text-left bg-gradient-to-br ${cat.bg} border border-white/5 hover:border-white/15 transition-all`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${cat.color}20` }}>
                      <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <p className="font-bold">{cat.label}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Top Artists Quick Access */}
            <div>
              <h2 className="text-lg font-bold mb-4">Artists</h2>
              <div className="grid grid-cols-2 gap-3">
                {artists.slice(0, 6).map((artist, i) => (
                  <motion.div key={artist.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(createPageUrl(`ArtistDetail?id=${artist.id}`))}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-[#00D4FF]/20 transition-all cursor-pointer"
                    style={{ background: 'rgba(17,17,17,0.6)' }}>
                    <Avatar className="w-11 h-11 border border-white/10 flex-shrink-0">
                      <AvatarImage src={artist.image_url} />
                      <AvatarFallback className="bg-white/10">{artist.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{artist.name}</p>
                      <p className="text-xs text-gray-500">{artist.genre}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {filteredArtists.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Artists ({filteredArtists.length})</h2>
                  <div className="space-y-2">
                    {filteredArtists.slice(0, 4).map((artist, i) => (
                      <div key={artist.id} onClick={() => navigate(createPageUrl(`ArtistDetail?id=${artist.id}`))}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-[#00D4FF]/20 transition-all cursor-pointer"
                        style={{ background: 'rgba(17,17,17,0.6)' }}>
                        <Avatar className="w-11 h-11 border border-white/10">
                          <AvatarImage src={artist.image_url} />
                          <AvatarFallback className="bg-white/10">{artist.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{artist.name}</p>
                          <p className="text-xs text-gray-500">{artist.genre}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {filteredTracks.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Tracks ({filteredTracks.length})</h2>
                  <div className="rounded-2xl overflow-hidden border border-white/5">
                    {filteredTracks.slice(0, 5).map((track, i) => (
                      <TrackRow key={track.id} track={track} index={i} onClick={() => navigate(createPageUrl(`TrackPlayer?id=${track.id}`))} />
                    ))}
                  </div>
                </section>
              )}

              {filteredRooms.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Live Rooms ({filteredRooms.length})</h2>
                  <div className="space-y-3">
                    {filteredRooms.slice(0, 2).map(room => (
                      <LiveRoomCard key={room.id} room={room} onClick={() => navigate(createPageUrl(`RoomDetail?id=${room.id}`))} />
                    ))}
                  </div>
                </section>
              )}

              {/* YouTube results — auto-triggered with search query */}
              {q && (yt.loading || yt.results.length > 0) && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Stream on YouTube</h2>
                  </div>
                  {yt.loading && (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="w-4 h-4 text-[#00D4FF] animate-spin" />
                      <span className="text-sm text-gray-400">Searching YouTube…</span>
                    </div>
                  )}
                  {yt.results.length > 0 && (
                    <div className="space-y-2">
                      {yt.results.map((item, i) => (
                        <YouTubeResultRow key={item.videoId} item={item} index={i} onPlay={yt.play} />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {!hasResults && !yt.results.length && q && (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">No results for "{query}"</h3>
                  <p className="text-gray-500">Try a different search term</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <YouTubePlayer activeVideo={yt.activeVideo} onClose={yt.close} />
    </div>
  );
}