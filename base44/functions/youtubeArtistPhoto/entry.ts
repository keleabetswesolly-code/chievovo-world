Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const artistName = body?.artistName;
    if (!artistName) return Response.json({ error: 'artistName is required' }, { status: 400 });

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });

    // Search for the artist's channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(artistName)}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      return Response.json({ error: searchData?.error?.message || 'YouTube API error' }, { status: searchRes.status });
    }

    const channel = searchData.items?.[0];
    if (!channel) return Response.json({ thumbnail: null });

    const channelId = channel.id?.channelId;
    const thumbnail = channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.medium?.url || channel.snippet?.thumbnails?.default?.url;

    return Response.json({ thumbnail, channelId, channelTitle: channel.snippet?.title });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});