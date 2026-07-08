import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft, Share2, Play, Shuffle, Heart, MoreHorizontal,
  CheckCircle2, Instagram, Twitter, Cpu, X, Send, CheckCircle, Youtube, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TrackRow from "@/components/ui/TrackRow";
import useYouTubeSearch from "@/hooks/useYouTubeSearch";
import YouTubePlayer from "@/components/ui/YouTubePlayer";
import YouTubeResultRow from "@/components/ui/YouTubeResultRow";

const PROJECT_TYPES = ["Single", "EP", "Album", "Feature", "Remix", "Live Performance", "Other"];

export default function ArtistDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("id");

  const [showCollabModal, setShowCollabModal] = useState(false);
  const [message, setMessage] = useState("");
  const [projectType, setProjectType] = useState("Feature");
  const [submitted, setSubmitted] = useState(false);

  const collabMutation = useMutation({
    mutationFn: (data) => base44.entities.CollabRequest.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => { setShowCollabModal(false); setSubmitted(false); setMessage(""); setProjectType("Feature"); }, 2000);
    }
  });

  const yt = useYouTubeSearch();

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

  // Auto-load YouTube results once artist name is known
  useEffect(() => {
    if (artist?.name) yt.search(`${artist.name} music`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artist?.name]);

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
        <div className="flex items-center gap-3 mb-4">
          <Button className="flex-1 h-12 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-black font-bold rounded-full">
            <Play className="w-5 h-5 mr-2 fill-black" />
            Play All
          </Button>
          <button className="w-12 h-12 rounded-full bg-[#FF6B35] flex items-center justify-center hover:bg-[#FF6B35]/90">
            <Shuffle className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setShowCollabModal(true)}
          className="w-full mb-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm border border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all"
          style={{ background: "rgba(0,212,255,0.06)" }}
        >
          <Cpu className="w-4 h-4" />
          Request Collaboration
        </button>

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

        {/* YouTube Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Youtube className="w-4 h-4 text-red-500" />
            <h2 className="text-lg font-bold">Stream on YouTube</h2>
          </div>
          {yt.loading && (
            <div className="flex items-center gap-2 py-6 justify-center">
              <Loader2 className="w-5 h-5 text-[#00D4FF] animate-spin" />
              <span className="text-sm text-gray-400">Loading…</span>
            </div>
          )}
          {yt.results.length > 0 && (
            <div className="space-y-2">
              {yt.results.map((item, i) => (
                <YouTubeResultRow key={item.videoId} item={item} index={i} onPlay={yt.play} />
              ))}
            </div>
          )}
        </div>
      </div>

      <YouTubePlayer activeVideo={yt.activeVideo} onClose={yt.close} />

      <AnimatePresence>
        {showCollabModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full rounded-t-3xl p-6 pb-10" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
              {submitted ? (
                <div className="py-8 text-center">
                  <CheckCircle className="w-14 h-14 text-[#00D4FF] mx-auto mb-3" />
                  <h3 className="text-xl font-black mb-1">Request Sent!</h3>
                  <p className="text-gray-400 text-sm">Your collab invite has been sent to {artist.name}.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-black">Request Collab</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Send an invite to {artist.name}</p>
                    </div>
                    <button onClick={() => setShowCollabModal(false)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2 text-gray-300">Project Type</p>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_TYPES.map(type => (
                        <button key={type} onClick={() => setProjectType(type)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                          style={projectType === type
                            ? { background: '#00D4FF', color: '#000' }
                            : { background: 'rgba(0,212,255,0.08)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)' }}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={`Tell ${artist.name} about your project — genre, vision, timeline...`}
                    className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-500 min-h-[110px] resize-none focus-visible:ring-[#00D4FF] mb-4"
                  />
                  <Button
                    onClick={() => collabMutation.mutate({ artist_id: artist.id, artist_name: artist.name, message, project_type: projectType, requester_name: "You" })}
                    disabled={!message.trim() || collabMutation.isPending}
                    className="w-full h-12 rounded-xl text-black font-bold"
                    style={{ background: 'linear-gradient(135deg, #00D4FF, #FF6B35)' }}>
                    <Send className="w-4 h-4 mr-2" />
                    {collabMutation.isPending ? "Sending..." : "Send Collab Request"}
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}