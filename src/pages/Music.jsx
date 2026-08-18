import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import { Search, SlidersHorizontal, Play, Shuffle, Youtube, Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import FeaturedCard from "@/components/ui/FeaturedCard";
import TrackRow from "@/components/ui/TrackRow";
import SectionHeader from "@/components/ui/SectionHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useYouTubeSearch from "@/hooks/useYouTubeSearch";
import useArtistThumbnails from "@/hooks/useArtistThumbnails";
import { useAudio } from "@/lib/AudioContext";
import YouTubePlayer from "@/components/ui/YouTubePlayer";
import YouTubeResultRow from "@/components/ui/YouTubeResultRow";

const GENRES = ["All", "Afrobeats", "Amapiano", "Afro House", "Afro Tech", "Gqom", "Hip Hop"];

export default function Music() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedGenre, setSelectedGenre] = useState(() => sessionStorage.getItem("music_genre") || "All");
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem("music_search") || "");
  const [visibleCount, setVisibleCount] = useState(10);
  const yt = useYouTubeSearch();
  const { playTrack, togglePlay, currentTrack, isPlaying, setQueue } = useAudio();

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['tracks', selectedGenre],
    queryFn: () => selectedGenre === "All" 
      ? base44.entities.Track.list('-plays', 200)
      : base44.entities.Track.filter({ genre: selectedGenre }, '-plays', 200),
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.filter({ is_official: true }, '-followers', 6),
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists-top'],
    queryFn: () => base44.entities.Artist.list('-followers', 10),
  });

  const artistThumbnails = useArtistThumbnails(artists);

  const handleSetGenre = (g) => { setSelectedGenre(g); sessionStorage.setItem("music_genre", g); };
  const handleSetSearch = (v) => { setSearchQuery(v); sessionStorage.setItem("music_search", v); setVisibleCount(10); };

  const ptr = usePullToRefresh(() => {
    queryClient.invalidateQueries({ queryKey: ['tracks'] });
    queryClient.invalidateQueries({ queryKey: ['playlists'] });
    queryClient.invalidateQueries({ queryKey: ['artists-top'] });
  });

  const filteredTracks = tracks.filter(track => 
    !searchQuery || 
    track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (searchQuery && filteredTracks.length === 0 && !tracksLoading) {
      yt.search(searchQuery);
    }
  }, [searchQuery, filteredTracks.length, tracksLoading]);

  return (
    <div className="min-h-screen bg-[#0A0A0A]" {...ptr}>
      {ptr.isRefreshing && (
        <div className="flex justify-center py-3">
          <div className="w-6 h-6 border-2 border-white/20 border-t-[#00D4FF] rounded-full animate-spin" />
        </div>
      )}
      {!ptr.isRefreshing && ptr.pullProgress > 0 && (
        <div className="flex justify-center py-3">
          <div className="w-6 h-6 border-2 border-white/20 border-t-[#00D4FF] rounded-full" style={{ transform: `rotate(${ptr.pullProgress * 360}deg)` }} />
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-40 px-5 bg-[#0A0A0A]/95 backdrop-blur-lg border-b border-white/5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)', paddingBottom: '16px' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black">Music</h1>
          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input 
            placeholder="Search tracks, artists..."
            value={searchQuery}
            onChange={(e) => handleSetSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border-0 rounded-xl text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#00D4FF]"
          />
        </div>
      </header>

      <div className="px-5 py-6">
        {/* Genre Tabs */}
        <div className="mb-6 -mx-5 px-5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => handleSetGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedGenre === genre
                    ? "bg-[#00D4FF] text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Playlists */}
        {playlists.length > 0 && !searchQuery && (
          <section className="mb-8">
            <SectionHeader title="Curated Playlists" subtitle="By CHIEVOVO" />
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5">
              {playlists.map((playlist) => (
                <FeaturedCard
                  key={playlist.id}
                  image={playlist.cover_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400"}
                  title={playlist.name}
                  subtitle={`${playlist.followers || 0} followers`}
                  tag={playlist.genre}
                  onPlay={() => {}}
                />
              ))}
            </div>
          </section>
        )}

        {/* Top Artists */}
        {!searchQuery && (
          <section className="mb-8">
            <SectionHeader title="Top Artists" link={createPageUrl("Music")} linkText="View All" />
            <div className="grid grid-cols-5 gap-3 overflow-x-auto">
              {artists.slice(0, 5).map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(createPageUrl(`ArtistDetail?id=${artist.id}`))}
                  className="text-center cursor-pointer group"
                >
                  <Avatar className="w-full aspect-square mb-2 border-2 border-transparent group-hover:border-[#00D4FF] transition-colors">
                    <AvatarImage src={artistThumbnails[artist.id] || artist.image_url} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-[#00D4FF]/20 to-[#FF6B35]/20 text-xl">
                      {artist.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-medium truncate">{artist.name}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Tracks List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <SectionHeader 
              title={searchQuery ? "Search Results" : "All Tracks"} 
              subtitle={`${filteredTracks.length} tracks`}
            />
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center hover:bg-[#FF6B35]/90 transition-colors">
                <Shuffle className="w-5 h-5 text-white" />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#00D4FF] flex items-center justify-center hover:bg-[#00D4FF]/90 transition-colors">
                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
              </button>
            </div>
          </div>

          {tracksLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                  <div className="w-14 h-14 bg-white/5 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/5 rounded w-32 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTracks.slice(0, visibleCount).map((track, i) => (
                <TrackRow 
                  key={track.id} 
                  track={track} 
                  index={i}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  onClick={() => { playTrack(track); setQueue(filteredTracks); }}
                />
              ))}
            </div>
          )}

          {filteredTracks.length > visibleCount && !tracksLoading && (
            <button
              onClick={() => setVisibleCount(c => c + 10)}
              className="mt-4 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-300"
            >
              Load More
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {filteredTracks.length === 0 && !tracksLoading && !searchQuery && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tracks found</p>
            </div>
          )}
          </section>

          {/* YouTube Search Fallback — auto-triggered when local results are empty */}
          {searchQuery && (yt.loading || yt.results.length > 0) && (
          <section className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Youtube className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Stream from YouTube</h3>
            </div>
            {yt.loading && (
              <div className="flex items-center justify-center py-8 gap-2">
                <Loader2 className="w-5 h-5 text-[#00D4FF] animate-spin" />
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
      </div>

      <YouTubePlayer activeVideo={yt.activeVideo} onClose={yt.close} />
    </div>
  );
}