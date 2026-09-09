import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";

const AD_VIDEO_URL =
  "https://media.base44.com/videos/public/69a791e052caf5d23b3b4005/a6acddd73_BuddyzReel-Gradev03.mp4";
const DISMISS_KEY = "chievovo_video_ad_dismissed";

export default function VideoPopupAd() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  const goShop = () => {
    close();
    navigate(createPageUrl("Shop"));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-5 bg-black/80 backdrop-blur-md"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: "#0b0f12", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#00D4FF]">Sponsored</span>
              </div>
              <button
                onClick={close}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full aspect-[9/16] bg-black">
              <video
                src={AD_VIDEO_URL}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>

            <div className="p-4">
              <h3 className="text-lg font-black text-white leading-tight mb-1">
                New Buddyz Drop Is Here
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Premium sound, limited edition. Shop the collection now.
              </p>
              <button
                onClick={goShop}
                className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
                style={{ background: "linear-gradient(135deg, #00D4FF, #FF6B35)", color: "#000" }}
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}