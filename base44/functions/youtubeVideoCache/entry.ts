import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const VIDEO_TTL_HOURS = 24;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const videoIds: string[] = body.video_ids;

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return Response.json({ error: "video_ids array required" }, { status: 400 });
    }

    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) return Response.json({ error: "YOUTUBE_API_KEY not set" }, { status: 500 });

    const now = new Date();
    const results: Record<string, any> = {};
    const stale: string[] = [];
    const etagMap: Record<string, string> = {};

    // --- Step 1: Check cache for each video_id ---
    for (const videoId of videoIds) {
      const cached = await base44.asServiceRole.entities.YouTubeCache.filter({ video_id: videoId });
      const record = cached?.[0];

      if (record && new Date(record.expires_at) > now) {
        // Cache hit — return stored data
        results[videoId] = JSON.parse(record.raw_data);
        if (record.etag) etagMap[videoId] = record.etag;
      } else {
        // Cache miss or expired
        stale.push(videoId);
      }
    }

    if (stale.length === 0) {
      return Response.json({ source: "cache", data: results });
    }

    // --- Step 2: ETag conditional check for stale but previously cached items ---
    // Batch fetch stale from YouTube using videos.list
    const batchIds = stale.join(",");

    // Build headers — if ALL stale share one etag we can try If-None-Match
    // (YouTube doesn't support per-item etag in batch; skip If-None-Match for batch calls)
    const ytHeaders: Record<string, string> = {};

    const ytUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(batchIds)}&key=${apiKey}`;

    const ytRes = await fetch(ytUrl, { headers: ytHeaders });

    // 304 Not Modified — nothing changed, extend TTL of existing records
    if (ytRes.status === 304) {
      for (const videoId of stale) {
        const cached = await base44.asServiceRole.entities.YouTubeCache.filter({ video_id: videoId });
        if (cached?.[0]) {
          const newExpiry = new Date(now.getTime() + VIDEO_TTL_HOURS * 60 * 60 * 1000).toISOString();
          await base44.asServiceRole.entities.YouTubeCache.update(cached[0].id, { expires_at: newExpiry });
          results[videoId] = JSON.parse(cached[0].raw_data);
        }
      }
      return Response.json({ source: "cache:304", data: results });
    }

    if (!ytRes.ok) {
      const errText = await ytRes.text();
      return Response.json({ error: `YouTube API error: ${errText}` }, { status: ytRes.status });
    }

    const responseEtag = ytRes.headers.get("etag") || "";
    const ytData = await ytRes.json();
    const items: any[] = ytData.items || [];

    // --- Step 3: Upsert each video into cache ---
    for (const item of items) {
      const videoId = item.id;
      const snippet = item.snippet || {};
      const expiresAt = new Date(now.getTime() + VIDEO_TTL_HOURS * 60 * 60 * 1000).toISOString();

      const cachePayload = {
        video_id: videoId,
        title: snippet.title || "",
        description: snippet.description || "",
        thumbnail_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || "",
        channel_id: snippet.channelId || "",
        channel_title: snippet.channelTitle || "",
        etag: item.etag || responseEtag,
        raw_data: JSON.stringify(item),
        expires_at: expiresAt,
      };

      // Check if record exists to decide create vs update
      const existing = await base44.asServiceRole.entities.YouTubeCache.filter({ video_id: videoId });
      if (existing?.[0]) {
        await base44.asServiceRole.entities.YouTubeCache.update(existing[0].id, cachePayload);
      } else {
        await base44.asServiceRole.entities.YouTubeCache.create(cachePayload);
      }

      results[videoId] = item;
    }

    return Response.json({ source: "youtube_api", data: results, etag: responseEtag });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});