import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, ShoppingCart, Package, Headphones, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";

const CATEGORIES = ["All", "Earbuds", "Accessories", "Apparel", "Limited Edition", "Bundles"];

export default function Shop() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => selectedCategory === "All"
      ? base44.entities.Product.list('-created_date', 20)
      : base44.entities.Product.filter({ category: selectedCategory }, '-created_date', 20),
  });

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => base44.entities.Product.filter({ featured: true }, '-created_date', 3),
  });

  const filteredProducts = products.filter(product =>
    !searchQuery ||
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-40 px-5 py-4 bg-[#0A0A0A]/95 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Shop</h1>
              <p className="text-xs text-gray-500">Buddyz Audio Gear</p>
            </div>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border-0 rounded-xl text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#00D4FF]"
          />
        </div>
      </header>

      <div className="px-5 py-6">
        {/* Category Pills */}
        <div className="mb-6 -mx-5 px-5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-[#00D4FF] text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Banner */}
        {!searchQuery && featuredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(createPageUrl(`ProductDetail?id=${featuredProducts[0].id}`))}
            className="relative rounded-3xl overflow-hidden mb-8 cursor-pointer group"
          >
            <div className="aspect-[16/9] relative">
              <img
                src={featuredProducts[0].images?.[0] || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"}
                alt={featuredProducts[0].name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-[#FF6B35] text-white border-0 font-bold">
                <Sparkles className="w-3 h-3 mr-1" />
                New Drop
              </Badge>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="text-xs text-[#00D4FF] font-bold uppercase tracking-wider">
                {featuredProducts[0].category}
              </span>
              <h2 className="text-2xl font-black mt-1 mb-2">{featuredProducts[0].name}</h2>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">${featuredProducts[0].price}</span>
                {featuredProducts[0].original_price && (
                  <span className="text-gray-400 line-through">${featuredProducts[0].original_price}</span>
                )}
                <button className="ml-auto px-6 py-2.5 bg-[#00D4FF] text-black font-bold rounded-full hover:bg-[#00D4FF]/90 transition-colors">
                  Shop Now
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Package, label: "Free Shipping", desc: "On orders $100+" },
            { icon: Headphones, label: "30-Day Trial", desc: "Risk-free" },
            { icon: Sparkles, label: "2yr Warranty", desc: "Full coverage" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center py-4 rounded-2xl bg-white/5 border border-white/5"
            >
              <item.icon className="w-5 h-5 text-[#00D4FF] mx-auto mb-2" />
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="text-[10px] text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Products Grid */}
        <SectionHeader
          title={searchQuery ? "Search Results" : "All Products"}
          subtitle={`${filteredProducts.length} products`}
        />

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard
                  product={product}
                  onClick={() => navigate(createPageUrl(`ProductDetail?id=${product.id}`))}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}