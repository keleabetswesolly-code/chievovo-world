import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import { Search, SlidersHorizontal, Play, Shuffle, Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import FeaturedCard from "@/components/ui/FeaturedCard";
import TrackRow from "@/components/ui/TrackRow";
import SectionHeader from "@/components/ui/SectionHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useHybridSearch from "@/hooks/useHybridSearch";
import useArtistThumbnails from "@/hooks/useArtistThumbnails";
import { useAudio } from "@/lib/AudioContext";
import SearchResultRow from "@/components/ui/SearchResultRow";

const GENRES = ["All", "Afrobeats", "Amapiano", "Afro House", "Afro Tech", "Gqom", "Hip Hop"];

export default function Music() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedGenre, setSelectedGenre] = useState(() => sessionStorage.getItem("music_genre") || "All");
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem("music_search") || "");
  const { playTrack, togglePlay, currentTrack, isPlaying, setQueue, expandPlayer } = useAudio();

  const PAGE_SIZE = 10;
  const { data: pagesData, isLoading: tracksLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['tracks', selectedGenre],
    queryFn: ({ pageParam = 0 }) => selectedGenre === "All"
      ? base44.entities.Track.list('-plays', PAGE_SIZE, pageParam)
      : base44.entities.Track.filter({ genre: selectedGenre }, '-plays', PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, allPages) => lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
    initialPageParam: 0,
  });
  const tracks = pagesData ? pagesData.pages.flat() : [];
  const hybrid = useHybridSearch(tracks, searchQuery);

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
  const handleSetSearch = (v) => { setSearchQuery(v); sessionStorage.setItem("music_search", v); };

  const ptr = usePullToRefresh(() => {
    queryClient.invalidateQueries({ queryKey: ['tracks'] });
    queryClient.invalidateQueries({ queryKey: ['playlists'] });
    queryClient.invalidateQueries({ queryKey: ['artists-top'] });
  });

  const handlePlayResult = (res) => {
    if (res.source === "youtube") {
      playTrack({ id: res.id, title: res.title, artist_name: res.artist, cover_url: res.thumbnail, videoId: res.videoId, source: "youtube" });
    } else {
      playTrack(res.raw);
      setQueue(tracks);
    }
    expandPlayer();
  };

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

        {/* Search Results — hybrid local + YouTube */}
        {searchQuery && (
          <section className="mb-8">
            <SectionHeader
              title="Search Results"
              subtitle={`${hybrid.results.length} tracks${hybrid.loading ? " · searching…" : ""}`}
            />
            {hybrid.loading && hybrid.results.length === 0 && (
              <div className="flex items-center justify-center py-8 gap-2">
                <Loader2 className="w-5 h-5 text-[#22d3ee] animate-spin" />
                <span className="text-sm text-gray-400">Searching local + YouTube…</span>
              </div>
            )}
            {hybrid.results.length > 0 && (
              <div className="space-y-2">
                {hybrid.results.map((res, i) => (
                  <SearchResultRow
                    key={res.id}
                    result={res}
                    index={i}
                    isPlaying={currentTrack?.id === res.id && isPlaying}
                    onPlay={handlePlayResult}
                  />
                ))}
              </div>
            )}
            {hybrid.results.length === 0 && !hybrid.loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No results found</p>
              </div>
            )}
          </section>
        )}

        {/* Tracks List — shown when not searching */}
        {!searchQuery && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <SectionHeader
              title="All Tracks"
              subtitle={`${tracks.length} tracks`}
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
              {tracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={i}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  onClick={() => { playTrack(track); setQueue(tracks); expandPlayer(); }}
                  onPlay={() => { playTrack(track); setQueue(tracks); expandPlayer(); }}
                />
              ))}
            </div>
          )}

          {hasNextPage && !tracksLoading && (
            <button
              onClick={fetchNextPage}
              disabled={isFetchingNextPage}
              className="mt-4 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-300 disabled:opacity-50"
            >
              {isFetchingNextPage ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</>
              ) : (
                <>Load More <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          )}

          {tracks.length === 0 && !tracksLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tracks found</p>
            </div>
          )}
          </section>
        )}
      </div>

    </div>
  );
}