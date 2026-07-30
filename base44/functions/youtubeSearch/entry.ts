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

    const cacheKey = `search:${query.trim().toLowerCase()}`;
    const now = new Date();

    // --- Cache-first: check DB before hitting YouTube API ---
    try {
      const cached = await base44.asServiceRole.entities.YouTubeCache.filter({ video_id: cacheKey });
      const record = cached?.[0];
      if (record && record.expires_at && new Date(record.expires_at) > now) {
        const results = JSON.parse(record.raw_data || '[]');
        return Response.json({ results, cached: true });
      }
    } catch (_) { /* cache miss, proceed to API */ }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });

    // Append "official audio" to prioritize clean results
    const searchQuery = `${query} official audio`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

    const ytRes = await fetch(url);
    const ytData = await ytRes.json();

    if (!ytRes.ok) {
      return Response.json({ error: ytData?.error?.message || 'YouTube API error' }, { status: ytRes.status });
    }

    const results = (ytData.items || []).map((item: any) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
      channel: item.snippet?.channelTitle,
    })).filter((r: any) => r.videoId);

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