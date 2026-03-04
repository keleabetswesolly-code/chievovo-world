import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Music2, Users, ShoppingBag, User, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: "Home", icon: Home, page: "Home" },
    { name: "Music", icon: Music2, page: "Music" },
    { name: "Live", icon: Radio, page: "Live" },
    { name: "Shop", icon: ShoppingBag, page: "Shop" },
    { name: "Profile", icon: User, page: "Profile" },
  ];

  const hideNav = ["ProductDetail", "ArtistDetail", "RoomDetail", "TrackPlayer"].includes(currentPageName);

  return (
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
          background: linear-gradient(135deg, var(--electric-blue) 0%, var(--orange-accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glow-blue {
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
        }
        
        .glow-orange {
          box-shadow: 0 0 30px rgba(255, 107, 53, 0.3);
        }
        
        .glass-card {
          background: rgba(17, 17, 17, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .nav-active {
          color: var(--electric-blue);
        }
        
        .pulse-live {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <main className={`${hideNav ? '' : 'pb-24'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/5">
          <div className="max-w-lg mx-auto px-2 py-2">
            <div className="flex justify-around items-center">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className="relative flex flex-col items-center py-2 px-4 group"
                  >
                    <div className={`relative ${isActive ? 'nav-active' : 'text-gray-500'}`}>
                      {item.page === "Live" && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF6B35] rounded-full pulse-live" />
                      )}
                      <Icon 
                        className={`w-6 h-6 transition-all duration-300 ${
                          isActive ? 'scale-110' : 'group-hover:text-gray-300'
                        }`} 
                        strokeWidth={isActive ? 2.5 : 1.5}
                      />
                    </div>
                    <span className={`text-[10px] mt-1 font-medium tracking-wide uppercase ${
                      isActive ? 'text-[#00D4FF]' : 'text-gray-500'
                    }`}>
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-2 w-8 h-0.5 bg-gradient-to-r from-[#00D4FF] to-[#FF6B35] rounded-full"
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
  );
}