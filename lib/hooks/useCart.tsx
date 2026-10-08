"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { repositories } from "@/lib/repositories";
import { ApiQuote, ApiQuoteLineInput } from "@/types/api/cart";

type CartItemInput = ApiQuoteLineInput;

interface CartContextType {
  items: CartItemInput[];
  quote: ApiQuote | null;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (variantId: number, quantity: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  removeItem: (variantId: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemInput[]>([]);
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [quote, setQuote] = useState<ApiQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dochomo_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
    setIsInitialized(true);
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("dochomo_cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  // Fetch Quote when items or coupon changes
  useEffect(() => {
    let active = true;

    async function fetchQuote() {
      if (items.length === 0) {
        setQuote(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await repositories.cart.getQuote(items, couponCode);
        if (active) {
          setQuote(result);
        }
      } catch (error) {
        console.error("Failed to fetch quote", error);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    if (isInitialized) {
      fetchQuote();
    }

    return () => {
      active = false;
    };
  }, [items, couponCode, isInitialized]);

  const addItem = (variantId: number, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.variantId === variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { variantId, quantity }];
    });
    setIsOpen(true);
  };

  const updateQuantity = (variantId: number, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.variantId !== variantId);
      }
      return prev.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item
      );
    });
  };

  const removeItem = (variantId: number) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(undefined);
  };

  const applyCoupon = async (code: string) => {
    setCouponCode(code);
    // The useEffect will trigger fetchQuote and validate the coupon
  };

  const removeCoupon = () => {
    setCouponCode(undefined);
  };

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        quote,
        isLoading,
        isOpen,
        setIsOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        itemCount,
      }}
    >
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
