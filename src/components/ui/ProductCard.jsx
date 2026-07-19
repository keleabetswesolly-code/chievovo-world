import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";

export default function ProductCard({ product, onClick, onAddToCart }) {
  const discount = product.original_price 
    ? Math.round((1 - product.price / product.original_price) * 100) 
    : 0;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 mb-3">
        <img 
          src={product.images?.[0] || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400"} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {discount > 0 && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-[#FF6B35] text-white text-xs font-bold rounded-lg">
              -{discount}%
            </span>
          </div>
        )}
        
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="px-4 py-2 border border-white/30 rounded-full text-sm font-medium">
              Sold Out
            </span>
          </div>
        )}
        
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
            <Heart className="w-4 h-4" />
          </button>
        </div>
        
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <button onClick={onAddToCart} className="w-full py-2.5 bg-[#00D4FF] text-black font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#00D4FF]/90 transition-colors">
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
      
      <div>
        <span className="text-xs text-[#00D4FF] font-medium uppercase tracking-wider">
          {product.category}
        </span>
        <h3 className="font-semibold mt-1 line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-lg">${product.price}</span>
          {product.original_price && (
            <span className="text-sm text-gray-500 line-through">${product.original_price}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}