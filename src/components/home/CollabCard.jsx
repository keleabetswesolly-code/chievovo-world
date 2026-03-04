import React from "react";
import { motion } from "framer-motion";
import { Cpu, Music2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ROLE_COLORS = {
  "Vocalist": "#FF6B35",
  "Producer": "#00D4FF",
  "Guitarist": "#FF6B35",
  "Drummer": "#00D4FF",
  "Engineer": "#FF6B35",
};

export default function CollabCard({ collab, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-4 rounded-2xl border border-white/5 cursor-pointer hover:border-[#00D4FF]/30 transition-all group"
      style={{ background: 'rgba(17,17,17,0.7)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D4FF22, #FF6B3522)' }}>
            <Cpu className="w-5 h-5 text-[#00D4FF]" />
          </div>
          <div>
            <h3 className="font-bold text-sm line-clamp-1">{collab.title}</h3>
            <p className="text-xs text-gray-500">{collab.daw} · {collab.genre}</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400">
          Open
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {collab.roles_needed?.slice(0, 3).map((role) => (
            <span key={role} className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: `${ROLE_COLORS[role] || '#00D4FF'}18`, color: ROLE_COLORS[role] || '#00D4FF', border: `1px solid ${ROLE_COLORS[role] || '#00D4FF'}30` }}>
              {role}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs">{collab.collaborators?.length || 0}</span>
        </div>
      </div>

      {collab.bpm && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
          <span className="text-xs text-gray-500">BPM: <span className="text-[#00D4FF] font-bold">{collab.bpm}</span></span>
          {collab.key && <span className="text-xs text-gray-500">Key: <span className="text-[#FF6B35] font-bold">{collab.key}</span></span>}
        </div>
      )}
    </motion.div>
  );
}