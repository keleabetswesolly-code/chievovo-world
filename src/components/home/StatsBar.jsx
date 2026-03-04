import React from "react";
import { motion } from "framer-motion";

export default function StatsBar({ liveCount }) {
  const stats = [
    { label: "Tracks", value: "12K+", color: "#00D4FF" },
    { label: "Artists", value: "500+", color: "#FF6B35" },
    { label: "Live", value: `${liveCount || 3}`, color: "#FF4444", dot: true },
    { label: "Collabs", value: "89+", color: "#FF6B35" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="text-center py-3 rounded-2xl"
          style={{ background: `${s.color}0D`, border: `1px solid ${s.color}22` }}
        >
          <div className="flex items-center justify-center gap-1">
            {s.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}