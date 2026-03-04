import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Check,
  Minus,
  Plus,
  ChevronDown,
  Truck,
  Shield,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => base44.entities.Product.filter({ id: productId }),
    select: (data) => data[0],
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-5">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Product not found</h2>
          <Button onClick={() => navigate(createPageUrl("Shop"))}>
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"];

  const colors = product.colors || ["#0A0A0A", "#00D4FF", "#FF6B35"];
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-5 py-4 flex items-center justify-between bg-gradient-to-b from-[#0A0A0A] to-transparent">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Image Gallery */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-900 to-gray-800">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={images[selectedImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {discount > 0 && (
          <Badge className="absolute top-20 left-5 bg-[#FF6B35] text-white border-0 font-bold">
            -{discount}% OFF
          </Badge>
        )}

        {/* Image Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedImageIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === selectedImageIndex ? "w-6 bg-[#00D4FF]" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="relative -mt-6 rounded-t-3xl bg-[#0A0A0A] p-5 pb-32">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#00D4FF] font-bold uppercase tracking-wider">
            {product.category}
          </span>
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-xs text-gray-500">({product.reviews_count || 0})</span>
            </div>
          )}
        </div>

        {/* Name & Price */}
        <h1 className="text-2xl font-black mb-2">{product.name}</h1>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl font-black">${product.price}</span>
          {product.original_price && (
            <span className="text-lg text-gray-500 line-through">${product.original_price}</span>
          )}
        </div>

        {/* Color Selection */}
        {colors.length > 1 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Color</h3>
            <div className="flex gap-3">
              {colors.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColor === i ? "border-[#00D4FF] scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === i && (
                    <Check className="w-5 h-5 mx-auto text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">Quantity</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-bold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">Description</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {product.description || "Experience premium audio quality with the latest Buddyz technology. Designed for African beats and modern lifestyles."}
          </p>
        </div>

        {/* Specs Accordion */}
        <button
          onClick={() => setShowSpecs(!showSpecs)}
          className="w-full flex items-center justify-between py-4 border-t border-white/10"
        >
          <span className="font-semibold">Specifications</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${showSpecs ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {showSpecs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pb-4">
                {Object.entries(product.specs || { "Battery": "24hrs", "ANC": "Active", "Bluetooth": "5.3" }).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-500">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 py-6 border-t border-white/10">
          {[
            { icon: Truck, label: "Free Shipping" },
            { icon: Shield, label: "2yr Warranty" },
            { icon: RotateCcw, label: "30-Day Return" },
          ].map((item) => (
            <div key={item.label} className="text-center py-3 rounded-xl bg-white/5">
              <item.icon className="w-5 h-5 text-[#00D4FF] mx-auto mb-1" />
              <p className="text-[10px] text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#0A0A0A]/95 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center gap-3">
          <button className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ShoppingCart className="w-6 h-6" />
          </button>
          <Button
            className="flex-1 h-14 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-black font-bold text-lg rounded-xl"
          >
            Buy Now • ${(product.price * quantity).toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}