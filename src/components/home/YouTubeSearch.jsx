import React, { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import useYouTubeSearch from "@/hooks/useYouTubeSearch";
import YouTubePlayer from "@/components/ui/YouTubePlayer";
import YouTubeResultRow from "@/components/ui/YouTubeResultRow";

export default function YouTubeSearch() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const yt = useYouTubeSearch();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setHasSearched(true);
    await yt.search(query.trim());
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
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]/50 transition-colors text-sm"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); yt.close(); setHasSearched(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={yt.loading || !query.trim()}
          className="px-5 py-3.5 rounded-2xl font-bold text-sm text-black disabled:opacity-40 transition-opacity flex items-center gap-1.5 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #00D4FF, #FF6B35)" }}
        >
          {yt.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" strokeWidth={2.5} />}
          Search
        </button>
      </form>

      {yt.loading && (
        <div className="flex items-center justify-center py-10 gap-2">
          <Loader2 className="w-5 h-5 text-[#00D4FF] animate-spin" />
          <span className="text-sm text-gray-400">Searching YouTube…</span>
        </div>
      )}

      {!yt.loading && yt.results.length > 0 && (
        <div className="space-y-2">
          {yt.results.map((item, i) => (
            <YouTubeResultRow key={item.videoId} item={item} index={i} onPlay={yt.play} />
          ))}
        </div>
      )}

      {!yt.loading && yt.error && (
        <div className="text-center py-8 px-4">
          <p className="text-sm text-[#FF6B35] font-medium mb-1">Search failed</p>
          <p className="text-xs text-gray-500">{yt.error}</p>
        </div>
      )}

      {!yt.loading && !yt.error && hasSearched && yt.results.length === 0 && (
        <p className="text-center text-sm text-gray-600 py-6">No results — try a different search</p>
      )}

      {!yt.loading && !hasSearched && (
        <p className="text-center text-sm text-gray-600 py-6">Search YouTube for any song or mix to stream instantly</p>
      )}

      <YouTubePlayer activeVideo={yt.activeVideo} onClose={yt.close} />
    </section>
  );
}