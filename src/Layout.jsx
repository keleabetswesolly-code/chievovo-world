import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Music2, Radio, ShoppingBag, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AudioProvider } from "@/lib/AudioContext";
import { CartProvider } from "@/lib/CartContext";
import MiniPlayer from "@/components/MiniPlayer";
import ExpandedPlayer from "@/components/ExpandedPlayer";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const navItems = [
    { name: "Home", icon: Home, page: "Home" },
    { name: "Music", icon: Music2, page: "Music" },
    { name: "Live", icon: Radio, page: "Live", dot: true },
    { name: "Create", icon: Cpu, page: "Collab" },
    { name: "Shop", icon: ShoppingBag, page: "Shop" },
  ];

  const hideNav = ["ProductDetail", "ArtistDetail", "RoomDetail", "TrackPlayer", "Discover"].includes(currentPageName);

  return (
    <CartProvider>
      <AudioProvider>
        <div className="min-h-screen bg-black text-white font-sans">
          <style>{`
            :root {
              --electric-blue: #00D4FF;
              --orange-accent: #FF6B35;
              --dark-bg: #0A0A0A;
              --card-bg: #111111;
              --border-color: #1A1A1A;
            }
            body {
              background: var(--dark-bg);
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            .gradient-text {
              background: linear-gradient(135deg, #00D4FF 0%, #FF6B35 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .glow-blue { box-shadow: 0 0 30px rgba(0, 212, 255, 0.3); }
            .glow-orange { box-shadow: 0 0 30px rgba(255, 107, 53, 0.3); }
            .glass-card {
              background: rgba(17, 17, 17, 0.85);
              backdrop-filter: blur(24px);
              -webkit-backdrop-filter: blur(24px);
              border: 1px solid rgba(255, 255, 255, 0.06);
            }
            .pulse-live { animation: pulse-anim 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse-anim {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.4; }
            }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            .noise-bg::before {
              content: '';
              position: absolute;
              inset: 0;
              background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
              pointer-events: none;
              z-index: 1;
            }
          `}</style>

          <main className={`${hideNav ? '' : 'pb-24'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname + location.search}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          {!hideNav && <MiniPlayer />}
          {currentPageName !== "TrackPlayer" && <ExpandedPlayer />}

          {!hideNav && (
            <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/5" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}>
              <div className="max-w-lg mx-auto px-1 pt-2">
                <div className="flex justify-around items-center">
                  {navItems.map((item) => {
                    const isActive = currentPageName === item.page;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.page}
                        to={createPageUrl(item.page)}
                        className="relative flex flex-col items-center py-2 px-3 group"
                      >
                        <div className={`relative ${isActive ? 'text-[#00D4FF]' : 'text-gray-500'}`}>
                          {item.dot && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FF6B35] rounded-full pulse-live" />
                          )}
                          <Icon
                            className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:text-gray-300'}`}
                            strokeWidth={isActive ? 2.5 : 1.5}
                          />
                        </div>
                        <span className={`text-[10px] mt-1 font-semibold tracking-widest uppercase ${isActive ? 'text-[#00D4FF]' : 'text-gray-600'}`}>
                          {item.name}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="absolute -bottom-2 w-6 h-0.5 rounded-full"
                            style={{ background: 'linear-gradient(90deg, #00D4FF, #FF6B35)' }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          )}
        </div>
      </AudioProvider>
    </CartProvider>
  );
}