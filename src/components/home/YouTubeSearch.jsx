import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Search, Play, X, Loader2 } from "lucide-react";

export default function YouTubeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);
    try {
      const res = await base44.functions.invoke('youtubeSearch', { query: query.trim() });
      const data = res.data?.results || res.results || [];
      setResults(data);
    } catch (err) {
      console.error('YouTube search error:', err);
      setError(err?.response?.data?.error || err?.message || 'Search failed. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (videoId, title) => {
    setActiveVideo({ videoId, title });
  };

  return (
    <section>
      {/* Search Bar */}
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
            <button type="button" onClick={() => { setQuery(""); setResults([]); setHasSearched(false); setError(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-3.5 rounded-2xl font-bold text-sm text-black disabled:opacity-40 transition-opacity flex items-center gap-1.5 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #00D4FF, #FF6B35)" }}
        >
          <Search className="w-4 h-4" strokeWidth={2.5} />
          Search
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin" />
          <span className="ml-2 text-sm text-gray-400">Searching YouTube…</span>
        </div>
      )}

      {/* Results Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {results.map((item, i) => (
            <motion.div
              key={item.videoId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handlePlay(item.videoId, item.title)}
              className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors group"
            >
              <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold line-clamp-2 leading-tight">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.channel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-8 px-4">
          <p className="text-sm text-[#FF6B35] font-medium mb-1">Search failed</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      )}

      {/* No results */}
      {!loading && !error && hasSearched && results.length === 0 && (
        <p className="text-center text-sm text-gray-600 py-6">No results found — try a different search</p>
      )}

      {/* Empty hint */}
      {!loading && !hasSearched && (
        <p className="text-center text-sm text-gray-600 py-6">Search YouTube for any song or mix to stream instantly</p>
      )}

      {/* YouTube Player — sticky mini player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-3 right-3 z-50 rounded-2xl overflow-hidden glass-card border border-white/10"
            style={{ background: "rgba(10,10,10,0.95)" }}
          >
            <div className="flex items-center gap-3 p-2">
              <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img src={results.find(r => r.videoId === activeVideo.videoId)?.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{activeVideo.title}</p>
                <p className="text-[10px] text-[#00D4FF]">▶ Streaming from YouTube</p>
              </div>
              <button onClick={() => setActiveVideo(null)} className="p-2 text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <iframe
              key={activeVideo.videoId}
              className="w-full"
              height="200"
              src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1`}
              title={activeVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}