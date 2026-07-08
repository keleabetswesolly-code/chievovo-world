import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Radio, Calendar, Plus, Users, Mic2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LiveRoomCard from "@/components/ui/LiveRoomCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "DJ Set", "Production Workshop", "Music Talk", "Collaboration", "Listening Party"];

export default function Live() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("live");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: liveRooms = [], isLoading: liveLoading } = useQuery({
    queryKey: ['live-rooms-all'],
    queryFn: () => base44.entities.LiveRoom.filter({ status: 'live' }, '-listeners', 20),
  });

  const { data: scheduledRooms = [] } = useQuery({
    queryKey: ['scheduled-rooms'],
    queryFn: () => base44.entities.LiveRoom.filter({ status: 'scheduled' }, 'scheduled_time', 20),
  });

  const filteredLive = liveRooms.filter(room => 
    selectedCategory === "All" || room.category === selectedCategory
  );

  const filteredScheduled = scheduledRooms.filter(room => 
    selectedCategory === "All" || room.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-40 px-5 py-4 bg-[#0A0A0A]/95 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#FF6B35] flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Live</h1>
              <p className="text-xs text-gray-500">{liveRooms.length} rooms active</p>
            </div>
          </div>
          <Button className="bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-black font-semibold rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Start Room
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-white/5 p-1 rounded-xl">
            <TabsTrigger 
              value="live" 
              className="flex-1 data-[state=active]:bg-[#00D4FF] data-[state=active]:text-black rounded-lg font-semibold"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              Live Now
            </TabsTrigger>
            <TabsTrigger 
              value="scheduled" 
              className="flex-1 data-[state=active]:bg-[#00D4FF] data-[state=active]:text-black rounded-lg font-semibold"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Scheduled
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="px-5 py-6">
        {/* Category Filter */}
        <div className="mb-6 -mx-5 px-5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-[#FF6B35] text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Live Room */}
        {activeTab === "live" && filteredLive.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden mb-6 cursor-pointer"
            onClick={() => navigate(createPageUrl(`RoomDetail?id=${filteredLive[0].id}`))}
          >
            {filteredLive[0].cover_url || filteredLive[0].host_image ? (
              <>
                <img src={filteredLive[0].cover_url || filteredLive[0].host_image} alt={filteredLive[0].title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)" }} />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/30 to-[#FF6B35]/30" />
            )}
            <div className="relative p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-red-400 uppercase">Featured Live</span>
                </span>
              </div>
              
              <h2 className="text-2xl font-black mb-2">{filteredLive[0].title}</h2>
              <p className="text-gray-300 mb-4">{filteredLive[0].description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {filteredLive[0].speakers?.slice(0, 3).map((speaker, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gray-700 border-2 border-[#0A0A0A] overflow-hidden">
                        <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold">{filteredLive[0].host_name}</p>
                    <p className="text-xs text-gray-400">+ {filteredLive[0].speakers?.length || 0} speakers</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate(createPageUrl(`RoomDetail?id=${filteredLive[0].id}`))}
                  className="bg-white text-black font-bold rounded-full px-6 hover:bg-white/90"
                >
                  <Mic2 className="w-4 h-4 mr-2" />
                  Join Room
                </Button>
              </div>
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-1 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{filteredLive[0].listeners || 0} listening</span>
                </div>
                <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-300">
                  {filteredLive[0].category}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rooms Grid */}
        <div className="grid gap-4">
          {activeTab === "live" ? (
            <>
              {liveLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
                ))
              ) : filteredLive.length > 0 ? (
                filteredLive.slice(1).map((room, i) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <LiveRoomCard 
                      room={room}
                      onClick={() => navigate(createPageUrl(`RoomDetail?id=${room.id}`))}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16">
                  <Radio className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Live Rooms</h3>
                  <p className="text-gray-500 mb-6">Be the first to start a conversation</p>
                  <Button className="bg-[#00D4FF] text-black font-semibold rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Start a Room
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              {filteredScheduled.length > 0 ? (
                filteredScheduled.map((room, i) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <LiveRoomCard 
                      room={room}
                      onClick={() => navigate(createPageUrl(`RoomDetail?id=${room.id}`))}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Scheduled Rooms</h3>
                  <p className="text-gray-500">Check back later for upcoming sessions</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}