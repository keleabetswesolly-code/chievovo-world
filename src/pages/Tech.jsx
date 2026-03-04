import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, Clock, Heart, ChevronRight, Headphones, Zap, Cpu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SectionHeader from "@/components/ui/SectionHeader";

const CATEGORIES = ["All", "Product Update", "Music Tech", "AI & Music", "Industry News", "Tutorials", "Gear Review"];
const CAT_COLORS = { "Product Update": "#00D4FF", "Music Tech": "#FF6B35", "AI & Music": "#00D4FF", "Industry News": "#FF6B35", "Tutorials": "#00D4FF", "Gear Review": "#FF6B35" };

export default function Tech() {
  const [selected, setSelected] = useState("All");
  const [likedPosts, setLikedPosts] = useState(new Set());

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['tech-posts'],
    queryFn: () => base44.entities.TechPost.list('-created_date', 30),
  });

  const filtered = posts.filter(p => selected === "All" || p.category === selected);
  const featured = posts.find(p => p.is_featured);

  const toggleLike = (id) => {
    setLikedPosts(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="sticky top-0 z-40 px-5 py-4 bg-[#0A0A0A]/95 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D4FF, #FF6B35)' }}>
            <Cpu className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Tech & Updates</h1>
            <p className="text-xs text-gray-500">Innovation from CHIEVOVO</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map(cat => {
            const color = CAT_COLORS[cat] || '#00D4FF';
            return (
              <button key={cat} onClick={() => setSelected(cat)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${selected === cat ? 'text-black' : 'bg-white/5 text-gray-400 border border-white/10'}`}
                style={selected === cat ? { background: color } : {}}>
                {cat}
              </button>
            );
          })}
        </div>
      </header>

      <div className="px-5 py-6">
        {/* Featured Post */}
        {featured && selected === "All" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden mb-8 cursor-pointer group">
            <div className="aspect-[16/9]">
              <img src={featured.cover_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"} alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 100%)' }} />
            </div>
            <div className="absolute top-4 left-4">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-black" style={{ background: CAT_COLORS[featured.category] || '#00D4FF' }}>
                {featured.category}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h2 className="text-xl font-black mb-1 line-clamp-2">{featured.title}</h2>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{featured.summary}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7 border border-white/20">
                    <AvatarImage src={featured.author_image} />
                    <AvatarFallback className="text-xs bg-white/10">{featured.author?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold">{featured.author || "CHIEVOVO Team"}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Clock className="w-2.5 h-2.5" />
                      {featured.read_time || "3 min read"}
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-black" style={{ background: '#00D4FF' }}>
                  Read <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Buddyz Product Highlight */}
        {selected === "All" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl mb-8 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #00D4FF15, #FF6B3510)', border: '1px solid #00D4FF25' }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00D4FF30, #FF6B3520)' }}>
                <Headphones className="w-8 h-8 text-[#00D4FF]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#00D4FF] uppercase tracking-widest mb-1">Latest Drop</p>
                <h3 className="font-black text-lg leading-tight">Buddyz Pro v2.0</h3>
                <p className="text-xs text-gray-400 mt-1">Spatial audio · ANC · 30hr battery</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {["Spatial Audio", "ANC 3.0", "30hr Life", "BT 5.3"].map(f => (
                <span key={f} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-gray-300 border border-white/10">{f}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Posts List */}
        <SectionHeader title={selected === "All" ? "All Articles" : selected} subtitle={`${filtered.length} articles`} />

        {isLoading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((post, i) => {
              const color = CAT_COLORS[post.category] || '#00D4FF';
              return (
                <motion.div key={post.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex gap-4 p-4 rounded-2xl border border-white/5 cursor-pointer hover:border-[#00D4FF]/30 transition-all"
                  style={{ background: 'rgba(17,17,17,0.8)' }}>
                  {post.cover_url && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{post.category}</span>
                    <h3 className="font-bold text-sm mt-0.5 line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{post.summary}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <Clock className="w-3 h-3" />
                        {post.read_time || "3 min"}
                      </div>
                      <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1 text-xs ${likedPosts.has(post.id) ? 'text-[#FF6B35]' : 'text-gray-600'}`}>
                        <Heart className={`w-3 h-3 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                        {post.likes || 0}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Newspaper className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">No articles in this category yet</p>
          </div>
        )}
      </div>
    </div>
  );
}