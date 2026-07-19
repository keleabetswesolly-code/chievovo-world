import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { Button } from "@/components/ui/button";

export default function CartDrawer({ open, onClose }) {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-[#111111] z-50 flex flex-col border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#00D4FF]" />
                <h2 className="text-lg font-bold">Cart</h2>
                {totalItems > 0 && (
                  <span className="w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center text-xs font-bold">
                    {totalItems}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-700" />
                  <p className="text-gray-500 text-sm">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.product.id}-${item.color}`} className="flex gap-4 items-start p-3 rounded-2xl bg-white/5">
                    <img
                      src={item.product.images?.[0] || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200"}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">{item.product.name}</h3>
                      {item.color && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-gray-500">Color</span>
                        </div>
                      )}
                      <p className="text-[#00D4FF] font-bold mt-1">${(item.product.price * item.quantity).toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.color, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.color, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.color)}
                          className="ml-auto w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-xl font-black">${totalPrice.toFixed(2)}</span>
                </div>
                <Button className="w-full h-14 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-black font-bold text-base rounded-xl">
                  Checkout • ${totalPrice.toFixed(2)}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}