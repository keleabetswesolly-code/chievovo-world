import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const SEARCH_TTL_DAYS = 7;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const query = body?.query;
    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'query is required' }, { status: 400 });
    }

    const clean = query.trim();
    // v2 cache key: older entries may point at non-embeddable videos, start fresh
    const cacheKey = `search:v2:${clean.toLowerCase()}`;
    const now = new Date();

    // --- Cache-first: check DB before hitting YouTube API ---
    let staleRecord: any = null;
    try {
      const cached = await base44.asServiceRole.entities.YouTubeCache.filter({ video_id: cacheKey });
      const record = cached?.[0];
      if (record) {
        staleRecord = record;
        if (record.expires_at && new Date(record.expires_at) > now) {
          const results = JSON.parse(record.raw_data || '[]');
          return Response.json({ results, cached: true });
        }
      }
    } catch (_) { /* cache miss, proceed to API */ }

    // Keep music playing when YouTube is exhausted/unreachable: serve last good results
    const staleFallback = () => {
      if (!staleRecord?.raw_data) return null;
      try {
        const results = JSON.parse(staleRecord.raw_data);
        if (Array.isArray(results) && results.length) {
          return Response.json({ results, cached: true, stale: true });
        }
      } catch (_) {}
      return null;
    };

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      return staleFallback() || Response.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    // Only embeddable + syndicated videos can actually play inside the app.
    // Label/VEVO videos are blocked outside youtube.com, which breaks playback.
    const searchYouTube = async (q: string, strict: boolean) => {
      const embedFilter = strict ? '&videoEmbeddable=true&videoSyndicated=true' : '';
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8${embedFilter}&q=${encodeURIComponent(q)}&key=${apiKey}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, status: res.status, error: data?.error?.message || 'YouTube API error', items: [] as any[] };
      }
      const items = (data.items || []).map((item: any) => ({
        videoId: item.id?.videoId,
        title: item.snippet?.title,
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
        channel: item.snippet?.channelTitle,
      })).filter((r: any) => r.videoId);
      return { ok: true, status: 200, error: '', items };
    };

    // Don't duplicate the suffix the caller may already include
    const composed = /official/i.test(clean) ? clean : `${clean} official audio`;
    let attempt = await searchYouTube(composed, true);
    if (attempt.ok && attempt.items.length === 0) {
      attempt = await searchYouTube(clean, true);
    }
    if (attempt.ok && attempt.items.length === 0) {
      attempt = await searchYouTube(clean, false);
    }

    if (!attempt.ok) {
      return staleFallback() || Response.json({ error: attempt.error }, { status: attempt.status });
    }

    const results = attempt.items;

    // --- Persist results to cache for TTL days ---
    const expiresAt = new Date(now.getTime() + SEARCH_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    try {
      const existing = await base44.asServiceRole.entities.YouTubeCache.filter({ video_id: cacheKey });
      if (existing?.[0]) {
        await base44.asServiceRole.entities.YouTubeCache.update(existing[0].id, {
          raw_data: JSON.stringify(results),
          expires_at: expiresAt,
        });
      } else {
        await base44.asServiceRole.entities.YouTubeCache.create({
          video_id: cacheKey,
          title: query,
          raw_data: JSON.stringify(results),
          expires_at: expiresAt,
        });
      }
    } catch (_) { /* cache write failure is non-fatal */ }

    return Response.json({ results });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});