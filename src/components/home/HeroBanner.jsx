import React from "react";
import { motion } from "framer-motion";
import { Zap, ShoppingBag } from "lucide-react";

export default function HeroBanner({ onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative h-56 rounded-3xl overflow-hidden cursor-pointer"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <img
        src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800"
        alt="Buddyz Pro"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(110deg, #000000f0 40%, #00D4FF18 100%)" }} />
      
      {/* Animated glow */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-30 blur-3xl" style={{ background: "#00D4FF" }} />

      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-black" style={{ background: "#FF6B35" }}>
            🔥 New Drop
          </span>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#00D4FF" }}>Buddyz Pro</p>
          <h2 className="text-3xl font-black mb-1 leading-none">Sound.<br />Redefined.</h2>
          <p className="text-gray-400 text-xs mb-4">Next-gen earbuds built for African beats</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-black" style={{ background: "#00D4FF" }}>
              <ShoppingBag className="w-4 h-4" /> Shop Now
            </span>
            <span className="text-xs text-gray-500 line-through">$199</span>
            <span className="text-sm font-bold text-white">$149</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}