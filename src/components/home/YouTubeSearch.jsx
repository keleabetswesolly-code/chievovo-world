import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useHybridSearch from "@/hooks/useHybridSearch";
import SearchResultRow from "@/components/ui/SearchResultRow";
import { useAudio } from "@/lib/AudioContext";

export default function YouTubeSearch() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { playTrack, setQueue, currentTrack, isPlaying, expandPlayer } = useAudio();

  // Local pool for hybrid search (client-side filtered by the hook)
  const { data: localTracks = [] } = useQuery({
    queryKey: ["hybrid-search-pool"],
    queryFn: () => base44.entities.Track.list("-plays", 50),
  });

  const hybrid = useHybridSearch(localTracks, hasSearched ? query : "");

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setHasSearched(true);
  };

  const handlePlayResult = (res) => {
    if (res.source === "youtube") {
      playTrack({
        id: res.id,
        title: res.title,
        artist_name: res.artist,
        cover_url: res.thumbnail,
        videoId: res.videoId,
        source: "youtube",
      });
    } else {
      playTrack(res.raw);
      setQueue(localTracks);
    }
    expandPlayer();
  };

  return (
    <section>
      <form onSubmit={handleSearch} className="relative mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, mixes..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#22d3ee]/50 transition-colors text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setHasSearched(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!query.trim()}
          className="px-5 py-3.5 rounded-2xl font-bold text-sm text-black disabled:opacity-40 transition-opacity flex items-center gap-1.5 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #00D4FF, #FF6B35)" }}
        >
          <Search className="w-4 h-4" strokeWidth={2.5} />
          Search
        </button>
      </form>

      {hybrid.loading && (
        <div className="flex items-center justify-center py-10 gap-2">
          <Loader2 className="w-5 h-5 text-[#22d3ee] animate-spin" />
          <span className="text-sm text-gray-400">Searching local + YouTube…</span>
        </div>
      )}

      {!hybrid.loading && hybrid.results.length > 0 && (
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

      {!hybrid.loading && hasSearched && hybrid.results.length === 0 && (
        <p className="text-center text-sm text-gray-600 py-6">No results — try a different search</p>
      )}

      {!hasSearched && (
        <p className="text-center text-sm text-gray-600 py-6">
          Search across your library and YouTube — tap any result to play instantly
        </p>
      )}
    </section>
  );
}