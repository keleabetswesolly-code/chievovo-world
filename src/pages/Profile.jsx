import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Settings,
  Heart,
  Clock,
  Download,
  Headphones,
  ChevronRight,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  Palette,
  Volume2,
  Edit3,
  Cpu,
  Users2,
  Newspaper
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const MENU_ITEMS = [
  { icon: Heart, label: "Liked Tracks", count: 48, color: "#FF6B35" },
  { icon: Clock, label: "Recently Played", count: 124, color: "#00D4FF" },
  { icon: Download, label: "Downloads", count: 16, color: "#00D4FF" },
  { icon: Headphones, label: "My Devices", count: 2, color: "#FF6B35" },
];

const SETTINGS_ITEMS = [
  { icon: Bell, label: "Notifications", hasSwitch: true },
  { icon: Volume2, label: "Audio Quality", value: "High" },
  { icon: Palette, label: "Appearance", value: "Dark" },
  { icon: Shield, label: "Privacy & Security" },
  { icon: HelpCircle, label: "Help & Support" },
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // User not logged in
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const stats = [
    { label: "Following", value: "234" },
    { label: "Followers", value: "1.2K" },
    { label: "Playlists", value: "12" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 h-48 bg-gradient-to-b from-[#00D4FF]/20 to-transparent" />

        <div className="relative px-5 py-4">
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
            className="glass-card rounded-3xl p-6"
            style={{ background: 'rgba(17, 17, 17, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-[#00D4FF]">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FF6B35] text-2xl font-bold">
                    {user?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#00D4FF] rounded-full flex items-center justify-center">
                  <Edit3 className="w-3.5 h-3.5 text-black" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user?.full_name || "Music Lover"}</h2>
                <p className="text-gray-400 text-sm">{user?.email || "Premium Member"}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-semibold rounded-full">
                    Premium
                  </span>
                  <span className="px-2 py-0.5 bg-[#00D4FF]/20 text-[#00D4FF] text-xs font-semibold rounded-full">
                    Early Adopter
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
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
        {/* Library Section */}
        <h3 className="text-lg font-bold mb-4">Your Library</h3>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {MENU_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors"
              style={{ background: 'rgba(17, 17, 17, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${item.color}20` }}
              >
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
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
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

        {/* Device Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/30 to-[#FF6B35]/30" />
          <div className="relative p-5 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
              <Headphones className="w-7 h-7 text-[#00D4FF]" />
            </div>
            <div className="flex-1">
              <p className="font-bold">Buddyz Pro Connected</p>
              <p className="text-sm text-gray-400">Battery: 85% • ANC On</p>
            </div>
            <Button size="sm" className="bg-white/20 hover:bg-white/30 rounded-full">
              Manage
            </Button>
          </div>
        </motion.div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full py-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>

        <p className="text-center text-xs text-gray-600 mt-6">
          CHIEVOVO World v1.0.0
        </p>
      </div>
    </div>
  );
}