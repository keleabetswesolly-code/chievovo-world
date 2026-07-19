import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function useArtistThumbnails(artists = []) {
  const [thumbnails, setThumbnails] = useState({});

  useEffect(() => {
    if (!artists.length) return;
    artists.forEach(artist => {
      if (!artist?.name) return;
      base44.functions.invoke('youtubeArtistPhoto', { artistName: artist.name })
        .then(res => {
          if (res.data?.thumbnail) {
            setThumbnails(prev => ({ ...prev, [artist.id]: res.data.thumbnail }));
          }
        })
        .catch(() => {});
    });
  }, [artists.map(a => a.id).join(',')]);

  return thumbnails;
}