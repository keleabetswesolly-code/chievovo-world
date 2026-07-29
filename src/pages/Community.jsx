import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import { Users2, Plus, Heart, MessageCircle, Repeat2, Play, Image, Mic, X, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SectionHeader from "@/components/ui/SectionHeader";
import { formatDistanceToNow } from "date-fns";

const TAGS = ["#Afrobeats", "#Amapiano", "#FL Studio", "#Collab", "#NewMusic", "#DJSet", "#BeatMaking"];

export default function Community() {
  const queryClient = useQueryClient();
  const [showCompose, setShowCompose] = useState(false);
  const [content, setContent] = useState("");
  const [selectedTag, setSelectedTag] = useState(() => sessionStorage.getItem("community_tag") || "");
  const [likedPosts, setLikedPosts] = useState(new Set());

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 30),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunityPost.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['community-posts'] }); setShowCompose(false); setContent(""); setSelectedTag(""); }
  });

  const likeMutation = useMutation({
    mutationFn: ({ id, likes }) => base44.entities.CommunityPost.update(id, { likes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-posts'] })
  });

  const handleLike = (post) => {
    const wasLiked = likedPosts.has(post.id);
    setLikedPosts(prev => { const s = new Set(prev); wasLiked ? s.delete(post.id) : s.add(post.id); return s; });
    likeMutation.mutate({ id: post.id, likes: (post.likes || 0) + (wasLiked ? -1 : 1) });
  };

  const ptr = usePullToRefresh(() => {
    queryClient.invalidateQueries({ queryKey: ['community-posts'] });
  });

  const handleSetTag = (tag) => { setSelectedTag(tag); sessionStorage.setItem("community_tag", tag); };

  const formatNum = (n) => {
    if (!n) return "0";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]" {...ptr}>
      {ptr.isRefreshing && (
        <div className="flex justify-center py-3">
          <div className="w-6 h-6 border-2 border-white/20 border-t-[#00D4FF] rounded-full animate-spin" />
        </div>
      )}
      {!ptr.isRefreshing && ptr.pullProgress > 0 && (
        <div className="flex justify-center py-3">
          <div className="w-6 h-6 border-2 border-white/20 border-t-[#00D4FF] rounded-full" style={{ transform: `rotate(${ptr.pullProgress * 360}deg)` }} />
        </div>
      )}
      <header className="sticky top-0 z-40 px-5 bg-[#0A0A0A]/95 backdrop-blur-lg border-b border-white/5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)', paddingBottom: '16px' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D4FF, #FF6B35)' }}>
              <Users2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Community</h1>
              <p className="text-xs text-gray-500">Music · Tech · Culture</p>
            </div>
          </div>
          <Button onClick={() => setShowCompose(true)} className="rounded-xl text-black font-bold" style={{ background: '#00D4FF' }}>
            <Plus className="w-4 h-4 mr-1" /> Post
          </Button>
        </div>

        {/* Tag Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button onClick={() => handleSetTag("")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${!selectedTag ? 'text-black' : 'bg-white/5 text-gray-400 border border-white/10'}`}
            style={!selectedTag ? { background: '#00D4FF' } : {}}>All</button>
          {TAGS.map(tag => (
            <button key={tag} onClick={() => handleSetTag(selectedTag === tag ? "" : tag)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedTag === tag ? 'text-black' : 'bg-white/5 text-gray-400 border border-white/10'}`}
              style={selectedTag === tag ? { background: '#FF6B35' } : {}}>
              {tag}
            </button>
          ))}
        </div>
      </header>

      <div className="px-5 py-4 space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-36 bg-white/5 rounded-2xl animate-pulse" />)
        ) : posts.length > 0 ? (
          posts
            .filter(p => !selectedTag || p.tags?.includes(selectedTag))
            .map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-4 rounded-2xl border border-white/5"
                style={{ background: 'rgba(17,17,17,0.8)' }}>
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-10 h-10 border border-white/10 flex-shrink-0">
                    <AvatarImage src={post.author_image} />
                    <AvatarFallback className="text-sm bg-white/10">{post.author_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{post.author_name}</p>
                      {post.author_role && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-[#FF6B35]/20 text-[#FF6B35]">{post.author_role}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : "recently"}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-200 mb-3 leading-relaxed">{post.content}</p>

                {post.media_url && post.media_type === 'image' && (
                  <div className="rounded-xl overflow-hidden mb-3 aspect-video">
                    <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs text-[#00D4FF] hover:underline cursor-pointer">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 pt-2 border-t border-white/5">
                  <button onClick={() => handleLike(post)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:bg-white/5 ${likedPosts.has(post.id) ? 'text-[#FF6B35]' : 'text-gray-500'}`}>
                    <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                    <span className="text-xs">{formatNum((post.likes || 0) + (likedPosts.has(post.id) ? 1 : 0))}</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-white/5 transition-all">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{formatNum(post.comments)}</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-white/5 transition-all">
                    <Repeat2 className="w-4 h-4" />
                    <span className="text-xs">{formatNum(post.reposts)}</span>
                  </button>
                </div>
              </motion.div>
            ))
        ) : (
          <div className="text-center py-16">
            <Users2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Be the First to Post</h3>
            <p className="text-gray-500 mb-6">Share your music, thoughts, and projects</p>
            <Button onClick={() => setShowCompose(true)} className="rounded-xl text-black font-bold" style={{ background: '#00D4FF' }}>
              <Plus className="w-4 h-4 mr-2" /> Create Post
            </Button>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full rounded-t-3xl p-6 pb-10" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black">New Post</h2>
                <button onClick={() => setShowCompose(false)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <Textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="What's on your mind? Share music, beats, or updates..."
                className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-500 min-h-[120px] resize-none focus-visible:ring-[#00D4FF] mb-4" />

              <div className="flex flex-wrap gap-2 mb-4">
                {TAGS.map(tag => (
                  <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                    style={selectedTag === tag ? { background: '#FF6B35', color: '#000' } : { background: '#FF6B3515', color: '#FF6B35', border: '1px solid #FF6B3530' }}>
                    {tag}
                  </button>
                ))}
              </div>

              <Button onClick={() => createMutation.mutate({ content, author_name: 'You', author_role: 'Member', tags: selectedTag ? [selectedTag] : [] })}
                disabled={!content.trim() || createMutation.isPending}
                className="w-full h-12 rounded-xl text-black font-bold" style={{ background: 'linear-gradient(135deg, #00D4FF, #FF6B35)' }}>
                <Send className="w-4 h-4 mr-2" />
                {createMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}