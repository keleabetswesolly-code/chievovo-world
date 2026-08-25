import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";

// Unified track schema:
// { id, title, artist, thumbnail, source: 'local' | 'youtube', videoId?:string, raw }
export default function useHybridSearch(localTracks = [], query = "") {
  const [ytResults, setYtResults] = useState([]);
  const [ytLoading, setYtLoading] = useState(false);

  const q = query.trim();

  // Query YouTube in parallel (debounced) — runs alongside client-side local filter
  useEffect(() => {
    if (!q) { setYtResults([]); setYtLoading(false); return; }
    let cancelled = false;
    setYtLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke("youtubeSearch", { query: q });
        const data = res?.data?.results ?? res?.results ?? [];
        if (!cancelled) setYtResults(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setYtResults([]);
      } finally {
        if (!cancelled) setYtLoading(false);
      }
    }, 350);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  // Local matches — client-side filter over the loaded pool
  const localResults = useMemo(() => {
    if (!q) return [];
    const needle = q.toLowerCase();
    return localTracks
      .filter(t =>
        t.title?.toLowerCase().includes(needle) ||
        t.artist_name?.toLowerCase().includes(needle))
      .map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist_name,
        thumbnail: t.cover_url,
        source: "local",
        raw: t,
      }));
  }, [localTracks, q]);

  // YouTube matches — normalized to the same schema
  const youtubeResults = useMemo(() =>
    ytResults.map(item => ({
      id: `yt-${item.videoId}`,
      title: item.title,
      artist: item.channel || "YouTube",
      thumbnail: item.thumbnail,
      source: "youtube",
      videoId: item.videoId,
      raw: item,
    })), [ytResults]);

  // Combined: local first, deduped by id
  const results = useMemo(() => {
    const seen = new Set();
    return [...localResults, ...youtubeResults].filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [localResults, youtubeResults]);

  return { results, loading: ytLoading, localCount: localResults.length, ytCount: youtubeResults.length };
}