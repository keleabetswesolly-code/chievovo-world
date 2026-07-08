import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function YouTubePlayer({ activeVideo, onClose }) {
  return (
    <AnimatePresence>
      {activeVideo && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-3 right-3 z-50 rounded-2xl overflow-hidden border border-white/10"
          style={{ background: "rgba(10,10,10,0.97)" }}
        >
          <div className="flex items-center gap-3 p-2">
            {activeVideo.thumbnail && (
              <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img src={activeVideo.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{activeVideo.title}</p>
              <p className="text-[10px] text-[#00D4FF]">▶ Streaming from YouTube</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <iframe
            key={activeVideo.videoId}
            className="w-full"
            height="200"
            src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1`}
            title={activeVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}