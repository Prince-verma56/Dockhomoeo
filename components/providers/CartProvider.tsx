"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { repositories } from "@/lib/repositories";
import { ApiQuote, ApiQuoteLineInput } from "@/types/api/cart";

export interface CartItem extends ApiQuoteLineInput {
  // Adding minimal local info to show immediately before quote resolves
  title: string;
  price: number;
  imageUrl?: string;
  brand?: string;
}

interface CartContextType {
  items: CartItem[];
  quote: ApiQuote | null;
  isQuoteLoading: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  removeItem: (variantId: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [quote, setQuote] = useState<ApiQuote | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dochomo_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("dochomo_cart", JSON.stringify(items));
    }
  }, [items, isHydrated]);

  // Fetch quote whenever items change
  const fetchQuote = useCallback(async (currentItems: CartItem[]) => {
    if (currentItems.length === 0) {
      setQuote(null);
      return;
    }
    setIsQuoteLoading(true);
    try {
      const lines = currentItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }));
      const newQuote = await repositories.cart.getQuote(lines);
      setQuote(newQuote);
    } catch (e) {
      console.error("Failed to fetch quote", e);
    } finally {
      setIsQuoteLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      fetchQuote(items);
    }
  }, [items, isHydrated, fetchQuote]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.variantId === item.variantId);
      if (existing) {
        return prev.map(i => 
          i.variantId === item.variantId 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    setIsOpen(true);
  };

  const updateQuantity = (variantId: number, quantity: number) => {
    setItems(prev => {
      if (quantity <= 0) {
        return prev.filter(i => i.variantId !== variantId);
      }
      return prev.map(i => 
        i.variantId === variantId 
          ? { ...i, quantity }
          : i
      );
    });
  };

  const removeItem = (variantId: number) => {
    setItems(prev => prev.filter(i => i.variantId !== variantId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      quote,
      isQuoteLoading,
      isOpen,
      setIsOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
