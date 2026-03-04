import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Share2,
  Play,
  Shuffle,
  Heart,
  MoreHorizontal,
  CheckCircle2,
  Instagram,
  Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TrackRow from "@/components/ui/TrackRow";

export default function ArtistDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("id");

  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => base44.entities.Artist.filter({ id: artistId }),
    select: (data) => data[0],
    enabled: !!artistId,
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['artist-tracks', artistId],
    queryFn: () => base44.entities.Track.filter({ artist_id: artistId }, '-plays', 20),
    enabled: !!artistId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-5">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Artist not found</h2>
          <Button onClick={() => navigate(createPageUrl("Music"))}>
            Back to Music
          </Button>
        </div>
      </div>
    );
  }

  const formatFollowers = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header with Cover */}
      <div className="relative h-72">
        <img
          src={artist.cover_url || artist.image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />

        {/* Navigation */}
        <header className="absolute top-0 left-0 right-0 z-10 px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-lg flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-lg flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-lg flex items-center justify-center">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Artist Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end gap-4">
            <Avatar className="w-24 h-24 border-4 border-[#0A0A0A]">
              <AvatarImage src={artist.image_url} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FF6B35] text-3xl font-bold">
                {artist.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black">{artist.name}</h1>
                {artist.verified && (
                  <CheckCircle2 className="w-6 h-6 text-[#00D4FF] fill-[#00D4FF]" />
                )}
              </div>
              <p className="text-gray-400">{artist.genre}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {/* Stats & Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-6">
            <div>
              <p className="text-xl font-bold">{formatFollowers(artist.followers)}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div>
              <p className="text-xl font-bold">{tracks.length}</p>
              <p className="text-xs text-gray-500">Tracks</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full border-white/20 hover:bg-white/10">
              <Heart className="w-4 h-4 mr-2" />
              Follow
            </Button>
            {artist.social_links?.instagram && (
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
                <Instagram className="w-5 h-5" />
              </button>
            )}
            {artist.social_links?.twitter && (
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
                <Twitter className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        {artist.bio && (
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">{artist.bio}</p>
        )}

        {/* Play Controls */}
        <div className="flex items-center gap-3 mb-6">
          <Button className="flex-1 h-12 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-black font-bold rounded-full">
            <Play className="w-5 h-5 mr-2 fill-black" />
            Play All
          </Button>
          <button className="w-12 h-12 rounded-full bg-[#FF6B35] flex items-center justify-center hover:bg-[#FF6B35]/90">
            <Shuffle className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Tracks */}
        <div>
          <h2 className="text-lg font-bold mb-4">Popular Tracks</h2>
          {tracks.length > 0 ? (
            <div className="space-y-1">
              {tracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={i}
                  onClick={() => navigate(createPageUrl(`TrackPlayer?id=${track.id}`))}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No tracks available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}