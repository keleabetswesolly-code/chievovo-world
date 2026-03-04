import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Cpu, Plus, Search, Users, Music2, Sliders, Play, ArrowLeft, Mic, Zap, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionHeader from "@/components/ui/SectionHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ROLES = ["Vocalist", "Producer", "Guitarist", "Drummer", "Engineer", "Lyricist", "Keyboardist", "DJ"];
const ROLE_COLORS = { "Vocalist": "#FF6B35", "Producer": "#00D4FF", "Guitarist": "#FF6B35", "Drummer": "#00D4FF", "Engineer": "#FF6B35", "Lyricist": "#FF6B35", "Keyboardist": "#00D4FF", "DJ": "#FF6B35" };
const DAWS = ["FL Studio", "Ableton", "Logic Pro", "Pro Tools", "GarageBand"];

export default function Collab() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("explore");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [newProject, setNewProject] = useState({ title: "", description: "", genre: "", bpm: "", key: "", daw: "FL Studio", roles_needed: [] });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['collab-projects'],
    queryFn: () => base44.entities.CollabProject.list('-created_date', 30),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CollabProject.create({ ...data, status: 'open', owner_name: 'You', bpm: Number(data.bpm) || undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['collab-projects'] }); setShowCreate(false); setNewProject({ title: "", description: "", genre: "", bpm: "", key: "", daw: "FL Studio", roles_needed: [] }); }
  });

  const filtered = projects.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.genre?.toLowerCase().includes(search.toLowerCase()) ||
    p.daw?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRole = (role) => {
    setNewProject(prev => ({
      ...prev,
      roles_needed: prev.roles_needed.includes(role)
        ? prev.roles_needed.filter(r => r !== role)
        : [...prev.roles_needed, role]
    }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="sticky top-0 z-40 px-5 py-4 bg-[#0A0A0A]/95 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D4FF, #FF6B35)' }}>
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Collab Studio</h1>
              <p className="text-xs text-gray-500">Remote collaboration hub</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="rounded-xl font-bold text-black"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #FF6B35)' }}
          >
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects, genres, DAWs..."
            className="w-full pl-11 bg-white/5 border-0 rounded-xl text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#00D4FF]" />
        </div>
      </header>

      <div className="px-5 py-6">
        {/* FL Studio Promo Banner */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-8 p-5"
          style={{ background: 'linear-gradient(135deg, #FF6B3520, #00D4FF15)', border: '1px solid #FF6B3530' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FF6B35, #FF6B3560)' }}>
              <Sliders className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider mb-1">Remote Collab</p>
              <h3 className="font-black text-lg leading-tight">Collaborate on FL Studio Beats</h3>
              <p className="text-xs text-gray-400 mt-1">Share projects, stems & sessions in real-time</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {["Share Stems", "Sync Sessions", "Real-time Chat"].map(f => (
              <span key={f} className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#00D4FF]" style={{ background: '#00D4FF15', border: '1px solid #00D4FF30' }}>{f}</span>
            ))}
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[{ label: "Open Projects", value: projects.filter(p => p.status === 'open').length, color: "#00D4FF" },
            { label: "In Progress", value: projects.filter(p => p.status === 'in_progress').length, color: "#FF6B35" },
            { label: "Completed", value: projects.filter(p => p.status === 'completed').length, color: "#00D4FF" }]
            .map((s, i) => (
              <div key={s.label} className="text-center py-3 rounded-xl" style={{ background: `${s.color}0D`, border: `1px solid ${s.color}22` }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
        </div>

        {/* Projects Grid */}
        <SectionHeader title="Open Projects" subtitle={`${filtered.length} available`} />

        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((project, i) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="p-4 rounded-2xl border border-white/5 hover:border-[#00D4FF]/30 transition-all cursor-pointer group"
                style={{ background: 'rgba(17,17,17,0.8)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-bold line-clamp-1">{project.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{project.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${
                    project.status === 'open' ? 'bg-green-500/20 text-green-400' :
                    project.status === 'in_progress' ? 'bg-[#00D4FF]/20 text-[#00D4FF]' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{project.status?.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/20">{project.daw}</span>
                  {project.genre && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/20">{project.genre}</span>}
                  {project.bpm && <span className="text-xs text-gray-500">{project.bpm} BPM</span>}
                  {project.key && <span className="text-xs text-gray-500">Key of {project.key}</span>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {project.roles_needed?.slice(0, 4).map(role => (
                      <span key={role} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: `${ROLE_COLORS[role] || '#00D4FF'}15`, color: ROLE_COLORS[role] || '#00D4FF', border: `1px solid ${ROLE_COLORS[role] || '#00D4FF'}25` }}>
                        {role}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      {project.collaborators?.length || 0}
                    </div>
                    <Button size="sm" className="rounded-full h-8 px-4 text-xs font-bold text-black" style={{ background: '#00D4FF' }}>
                      Join
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Cpu className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">No Projects Yet</h3>
            <p className="text-gray-500 mb-6">Start a collab and find your creative partner</p>
            <Button onClick={() => setShowCreate(true)} className="rounded-xl text-black font-bold" style={{ background: 'linear-gradient(135deg, #00D4FF, #FF6B35)' }}>
              <Plus className="w-4 h-4 mr-2" /> Create First Project
            </Button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full rounded-t-3xl p-6 pb-10 overflow-y-auto max-h-[90vh]" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black">New Collab Project</h2>
                <button onClick={() => setShowCreate(false)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <Input value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="Project title *" className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-500 focus-visible:ring-[#00D4FF]" />
                <Input value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Short description" className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-500 focus-visible:ring-[#00D4FF]" />

                <div className="grid grid-cols-3 gap-3">
                  <Input value={newProject.genre} onChange={e => setNewProject({ ...newProject, genre: e.target.value })}
                    placeholder="Genre" className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-500" />
                  <Input value={newProject.bpm} onChange={e => setNewProject({ ...newProject, bpm: e.target.value })}
                    placeholder="BPM" type="number" className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-500" />
                  <Input value={newProject.key} onChange={e => setNewProject({ ...newProject, key: e.target.value })}
                    placeholder="Key" className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-500" />
                </div>

                <div>
                  <p className="text-sm font-semibold mb-3 text-gray-300">DAW</p>
                  <div className="flex flex-wrap gap-2">
                    {DAWS.map(daw => (
                      <button key={daw} onClick={() => setNewProject({ ...newProject, daw })}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${newProject.daw === daw ? 'text-black' : 'bg-white/5 text-gray-400 border border-white/10'}`}
                        style={newProject.daw === daw ? { background: '#FF6B35' } : {}}>
                        {daw}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-3 text-gray-300">Roles Needed</p>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map(role => {
                      const selected = newProject.roles_needed.includes(role);
                      const color = ROLE_COLORS[role] || '#00D4FF';
                      return (
                        <button key={role} onClick={() => toggleRole(role)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                          style={selected ? { background: color, color: '#000' } : { background: `${color}15`, color, border: `1px solid ${color}30` }}>
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={() => createMutation.mutate(newProject)} disabled={!newProject.title || createMutation.isPending}
                  className="w-full h-13 rounded-xl font-black text-black text-base"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #FF6B35)' }}>
                  {createMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}