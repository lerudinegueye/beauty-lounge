'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  updateQuantity: (id: number, quantity: number) => void; // <-- NUOVA FUNZIONE
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      let updatedItems;
      if (existingItem) {
        updatedItems = prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedItems = [...prevItems, { ...item, quantity: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      return updatedItems;
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      return updatedItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.setItem('cart', JSON.stringify([]));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setCartItems((prevItems) => {
      let updatedItems;
      if (quantity <= 0) {
        updatedItems = prevItems.filter((item) => item.id !== id);
      } else {
        updatedItems = prevItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
      }
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      return updatedItems;
    });
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};