import React from "react";
import { motion } from "framer-motion";

export default function EcosystemPill({ label, icon: Icon, color, dot, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
      style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
    >
      <div className="relative">
        {dot && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" style={{ animation: 'pulse-anim 2s infinite' }} />}
        <Icon className="w-4 h-4" />
      </div>
      {label}
    </motion.button>
  );
}