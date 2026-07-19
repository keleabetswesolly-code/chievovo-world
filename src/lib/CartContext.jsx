import React, { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ product, quantity, color }]

  const addToCart = useCallback((product, quantity = 1, color = null) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.color === color);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.color === color
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity, color }];
    });
  }, []);

  const removeFromCart = useCallback((productId, color = null) => {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.color === color)));
  }, []);

  const updateQuantity = useCallback((productId, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, color);
      return;
    }
    setItems(prev => prev.map(i =>
      i.product.id === productId && i.color === color ? { ...i, quantity } : i
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}