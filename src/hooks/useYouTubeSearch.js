import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export default function useYouTubeSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const search = useCallback(async (query) => {
    if (!query?.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await base44.functions.invoke('youtubeSearch', { query: query.trim() });
      const data = res.data?.results || res.results || [];
      setResults(data);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const play = useCallback((videoId, title, thumbnail) => {
    setActiveVideo({ videoId, title, thumbnail });
  }, []);

  const close = useCallback(() => setActiveVideo(null), []);

  return { results, loading, error, activeVideo, search, play, close };
}