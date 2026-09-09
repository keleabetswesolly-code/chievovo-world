import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";

const AD_VIDEO_URL =
  "https://media.base44.com/videos/public/69a791e052caf5d23b3b4005/a6acddd73_BuddyzReel-Gradev03.mp4";
const AD_POSTER =
  "https://media.base44.com/images/public/69a791e052caf5d23b3b4005/b01d57d93_Screenshot_20260830-155647.jpg";
const DISMISS_KEY = "chievovo_video_ad_dismissed";

export default function VideoPopupAd() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const videoRef = useRef(null);

  // Preload the video as soon as the page mounts so it starts instantly when shown.
  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "fetch";
    preload.href = AD_VIDEO_URL;
    document.head.appendChild(preload);
    const t = setTimeout(() => setOpen(true), 800);
    return () => {
      clearTimeout(t);
      preload.remove();
    };
  }, []);

  // Force muted + play via ref (React's `muted` prop isn't reliably applied to the DOM).
  useEffect(() => {
    if (!open) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [open]);

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
          className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[280px] rounded-2xl overflow-hidden relative"
            style={{ background: "#0b0f12", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="px-4 py-2.5">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#00D4FF]">Sponsored</span>
            </div>

            {/* Video — shorter aspect keeps the popup compact and fast to decode */}
            <div className="relative w-full aspect-[4/5] bg-black">
              <video
                ref={videoRef}
                src={AD_VIDEO_URL}
                poster={AD_POSTER}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />

              {/* Floating CTA centred at the bottom of the ad */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center px-4">
                <button
                  onClick={goShop}
                  className="flex items-center justify-center gap-2 px-6 h-11 rounded-full font-bold text-sm shadow-lg shadow-black/40 transition-transform active:scale-95"
                  style={{ background: "linear-gradient(135deg, #00D4FF, #FF6B35)", color: "#000" }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop Now
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}