import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const ARTIST_TTL_HOURS = 7 * 24; // 7 days — artist info changes less often

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const channelIds: string[] = body.channel_ids;

    if (!Array.isArray(channelIds) || channelIds.length === 0) {
      return Response.json({ error: "channel_ids array required" }, { status: 400 });
    }

    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) return Response.json({ error: "YOUTUBE_API_KEY not set" }, { status: 500 });

    const now = new Date();
    const results: Record<string, any> = {};
    const stale: string[] = [];

    // --- Step 1: Cache-first check ---
    for (const channelId of channelIds) {
      const cached = await base44.asServiceRole.entities.YouTubeArtistCache.filter({ channel_id: channelId });
      const record = cached?.[0];

      if (record && new Date(record.expires_at) > now) {
        results[channelId] = JSON.parse(record.raw_data);
      } else {
        stale.push(channelId);
      }
    }

    if (stale.length === 0) {
      return Response.json({ source: "cache", data: results });
    }

    // --- Step 2: Fetch stale channels from YouTube ---
    // Build ETag map from existing stale records for conditional requests
    const storedEtags: string[] = [];
    for (const channelId of stale) {
      const cached = await base44.asServiceRole.entities.YouTubeArtistCache.filter({ channel_id: channelId });
      if (cached?.[0]?.etag) storedEtags.push(cached[0].etag);
    }

    const batchIds = stale.join(",");
    const ytHeaders: Record<string, string> = {};
    // Use If-None-Match only when a single channel is requested (etag is per-resource)
    if (stale.length === 1 && storedEtags.length === 1) {
      ytHeaders["If-None-Match"] = storedEtags[0];
    }

    const ytUrl = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&id=${encodeURIComponent(batchIds)}&key=${apiKey}`;
    const ytRes = await fetch(ytUrl, { headers: ytHeaders });

    // 304 Not Modified — extend TTL
    if (ytRes.status === 304) {
      for (const channelId of stale) {
        const cached = await base44.asServiceRole.entities.YouTubeArtistCache.filter({ channel_id: channelId });
        if (cached?.[0]) {
          const newExpiry = new Date(now.getTime() + ARTIST_TTL_HOURS * 60 * 60 * 1000).toISOString();
          await base44.asServiceRole.entities.YouTubeArtistCache.update(cached[0].id, { expires_at: newExpiry });
          results[channelId] = JSON.parse(cached[0].raw_data);
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

    // --- Step 3: Upsert each channel into artist cache ---
    for (const item of items) {
      const channelId = item.id;
      const snippet = item.snippet || {};
      const statistics = item.statistics || {};
      const expiresAt = new Date(now.getTime() + ARTIST_TTL_HOURS * 60 * 60 * 1000).toISOString();

      const cachePayload = {
        channel_id: channelId,
        artist_name: snippet.title || "",
        description: snippet.description || "",
        profile_picture_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || "",
        subscriber_count: parseInt(statistics.subscriberCount || "0"),
        etag: item.etag || responseEtag,
        raw_data: JSON.stringify(item),
        expires_at: expiresAt,
      };

      const existing = await base44.asServiceRole.entities.YouTubeArtistCache.filter({ channel_id: channelId });
      if (existing?.[0]) {
        await base44.asServiceRole.entities.YouTubeArtistCache.update(existing[0].id, cachePayload);
      } else {
        await base44.asServiceRole.entities.YouTubeArtistCache.create(cachePayload);
      }

      results[channelId] = item;
    }

    return Response.json({ source: "youtube_api", data: results, etag: responseEtag });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});