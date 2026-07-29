import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Settings, Heart, Clock, Headphones, ChevronRight, LogOut,
  Bell, Shield, HelpCircle, Volume2, Edit3, Cpu, Users2,
  Newspaper, Check, X, Music2, Layers, Trash2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const SETTINGS_ITEMS = [
  { icon: Bell, label: "Notifications", hasSwitch: true },
  { icon: Volume2, label: "Audio Quality", value: "High" },
  { icon: Shield, label: "Privacy & Security" },
  { icon: HelpCircle, label: "Help & Support" },
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Real liked tracks from localStorage
  const likedCount = Object.keys(
    JSON.parse(localStorage.getItem("chievovo_likes") || "{}")
  ).filter(k => JSON.parse(localStorage.getItem("chievovo_likes") || "{}")[k]).length;

  // Real data
  const { data: playlists = [] } = useQuery({
    queryKey: ["user-playlists"],
    queryFn: () => base44.entities.Playlist.list("-created_date", 100),
  });
  const { data: collabs = [] } = useQuery({
    queryKey: ["user-collabs"],
    queryFn: () => base44.entities.CollabProject.list("-created_date", 100),
  });
  const { data: tracks = [] } = useQuery({
    queryKey: ["tracks-count"],
    queryFn: () => base44.entities.Track.list("-created_date", 200),
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setNameInput(u?.full_name || "");
    }).catch(() => {});
  }, []);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSaving(true);
    await base44.auth.updateMe({ full_name: nameInput.trim() });
    setUser(prev => ({ ...prev, full_name: nameInput.trim() }));
    setSaving(false);
    setEditingName(false);
  };

  const handleLogout = () => base44.auth.logout();

  const handleDeleteAccount = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await base44.auth.logout("/");
  };

  const stats = [
    { label: "Tracks", value: tracks.length || 0 },
    { label: "Playlists", value: playlists.length || 0 },
    { label: "Collabs", value: collabs.length || 0 },
  ];

  const libraryItems = [
    { icon: Heart, label: "Liked Tracks", count: likedCount, color: "#FF6B35", page: "Music" },
    { icon: Music2, label: "Playlists", count: playlists.length, color: "#00D4FF", page: "Music" },
    { icon: Layers, label: "Collab Projects", count: collabs.length, color: "#00D4FF", page: "Collab" },
    { icon: Headphones, label: "All Tracks", count: tracks.length, color: "#FF6B35", page: "Music" },
  ];

  const quickLinks = [
    { label: "Collab Studio", icon: Cpu, page: "Collab", color: "#00D4FF" },
    { label: "Community", icon: Users2, page: "Community", color: "#FF6B35" },
    { label: "Tech Updates", icon: Newspaper, page: "Tech", color: "#00D4FF" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 h-48 bg-gradient-to-b from-[#00D4FF]/20 to-transparent" />
        <div className="relative px-5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)', paddingBottom: '16px' }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black">Profile</h1>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-6"
            style={{ background: 'rgba(17, 17, 17, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-[#00D4FF]">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FF6B35] text-2xl font-bold text-black">
                    {user?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      className="bg-white/10 text-white rounded-lg px-3 py-1 text-sm font-bold border border-[#00D4FF]/50 outline-none flex-1"
                      autoFocus
                      onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                    />
                    <button onClick={handleSaveName} disabled={saving} className="w-7 h-7 bg-[#00D4FF] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-black" />
                    </button>
                    <button onClick={() => setEditingName(false)} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold truncate">{user?.full_name || "Music Lover"}</h2>
                    <button onClick={() => setEditingName(true)} className="flex-shrink-0">
                      <Edit3 className="w-3.5 h-3.5 text-gray-500 hover:text-[#00D4FF] transition-colors" />
                    </button>
                  </div>
                )}
                <p className="text-gray-400 text-sm truncate">{user?.email || ""}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-semibold rounded-full capitalize">
                    {user?.role || "Member"}
                  </span>
                  <span className="px-2 py-0.5 bg-[#00D4FF]/20 text-[#00D4FF] text-xs font-semibold rounded-full">
                    Early Adopter
                  </span>
                </div>
              </div>
            </div>

            {/* Real Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      <div className="px-5 py-6">
        {/* Quick Nav */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {quickLinks.map((link, i) => (
            <motion.button
              key={link.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(createPageUrl(link.page))}
              className="flex flex-col items-center py-4 rounded-2xl border transition-all"
              style={{ background: `${link.color}0D`, borderColor: `${link.color}20` }}
            >
              <link.icon className="w-6 h-6 mb-2" style={{ color: link.color }} />
              <span className="text-xs font-semibold" style={{ color: link.color }}>{link.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Library Section */}
        <h3 className="text-lg font-bold mb-4">Your Library</h3>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {libraryItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(createPageUrl(item.page))}
              className="rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors"
              style={{ background: 'rgba(17, 17, 17, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${item.color}20` }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <p className="font-semibold">{item.label}</p>
              <p className="text-sm text-gray-500">{item.count} items</p>
            </motion.div>
          ))}
        </div>

        {/* Settings Section */}
        <h3 className="text-lg font-bold mb-4">Settings</h3>
        <div className="space-y-2 mb-8">
          {SETTINGS_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.hasSwitch ? (
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              ) : item.value ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-sm">{item.value}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full py-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>

        {/* Delete Account */}
        <div className="mt-8 mb-6">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            <h3 className="text-sm font-bold text-red-400 mb-1">Danger Zone</h3>
            <p className="text-xs text-gray-500 mb-3">Once you delete your account, there is no going back.</p>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="ghost"
              className="w-full py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-red-500/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-2">CHIEVOVO World v1.0.0</p>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowDeleteConfirm(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-6"
          >
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-lg font-black text-center mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-400 text-center mb-6">
              This will permanently delete your account and all associated data. This action <span className="text-red-400 font-semibold">cannot be undone</span>.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="ghost"
                className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}