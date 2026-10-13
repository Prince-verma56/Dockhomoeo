"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { repositories } from "@/lib/repositories";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { cartStore, getServerSnapshot, getSnapshot, subscribe, type CartItem } from "@/lib/cart/cartStore";
import type { ApiPaymentMethod, ApiQuote } from "@/types/api/cart";

export type { CartItem };

/**
 * idle    — nothing to price (empty or not yet read from the browser)
 * loading — a quote for the current cart is on its way
 * ready   — `quote` is the shop's answer for exactly this cart
 * error   — the shop could not be asked; `retryQuote` tries again
 */
export type QuoteStatus = "idle" | "loading" | "ready" | "error";

interface CartContextType {
  items: CartItem[];
  /** False until the saved cart has been read; render a placeholder, not "empty". */
  hydrated: boolean;
  itemCount: number;
  /** The latest quote received. It may describe the cart as it was a moment ago. */
  quote: ApiQuote | null;
  /** True when `quote` was asked for exactly the current lines, coupon and payment method. */
  quoteIsCurrent: boolean;
  quoteStatus: QuoteStatus;
  quoteError: string | null;
  retryQuote: () => void;
  /** Kept for existing callers: a quote is on its way. */
  isQuoteLoading: boolean;
  /** The code being tried or applied; the quote says whether it took. */
  couponCode: string | null;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  paymentMethod: ApiPaymentMethod;
  setPaymentMethod: (method: ApiPaymentMethod) => void;
  /** Lines the shop no longer sells, dropped since the cart was last shown. */
  droppedCount: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  removeItem: (variantId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/** Quantity taps arrive in bursts; price the cart once they settle. */
const QUOTE_DEBOUNCE_MS = 250;

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<ApiPaymentMethod>("COD");
  const [attempt, setAttempt] = useState(0);
  const [lastQuote, setLastQuote] = useState<{ key: string; quote: ApiQuote } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [droppedCount, setDroppedCount] = useState(0);

  const lines = cart.items.map(({ variantId, quantity }) => ({ variantId, quantity }));
  const requestKey = JSON.stringify({ lines, couponCode, paymentMethod });
  const settledKey = useDebounce(requestKey, QUOTE_DEBOUNCE_MS);

  useEffect(() => {
    if (!cart.hydrated) return;
    const request = JSON.parse(settledKey) as {
      lines: typeof lines;
      couponCode: string | null;
      paymentMethod: ApiPaymentMethod;
    };
    if (request.lines.length === 0) return;

    // Answers can arrive out of order; only the latest request may write.
    let active = true;
    repositories.cart.getQuote(request.lines, request.couponCode ?? undefined, request.paymentMethod).then(
      (quote) => {
        if (!active) return;
        setLastQuote({ key: settledKey, quote });
        setFailure(null);
        if (quote.removed.length > 0) {
          setDroppedCount((count) => count + quote.removed.length);
          cartStore.drop(quote.removed);
        }
      },
      () => {
        if (!active) return;
        setFailure({ key: settledKey, message: "We couldn't check prices with the shop just now." });
      },
    );
    return () => {
      active = false;
    };
  }, [settledKey, cart.hydrated, attempt]);

  const empty = cart.items.length === 0;
  const quoteIsCurrent = !empty && lastQuote?.key === requestKey;
  const failedNow = !empty && failure?.key === requestKey;
  const quoteStatus: QuoteStatus =
    !cart.hydrated || empty ? "idle" : quoteIsCurrent ? "ready" : failedNow ? "error" : "loading";

  const value: CartContextType = {
    items: cart.items,
    hydrated: cart.hydrated,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    quote: empty ? null : (lastQuote?.quote ?? null),
    quoteIsCurrent,
    quoteStatus,
    quoteError: failedNow ? (failure?.message ?? null) : null,
    retryQuote: () => {
      setFailure(null);
      setAttempt((n) => n + 1);
    },
    isQuoteLoading: quoteStatus === "loading",
    couponCode,
    applyCoupon: (code) => setCouponCode(code.trim().toUpperCase() || null),
    removeCoupon: () => setCouponCode(null),
    paymentMethod,
    setPaymentMethod,
    droppedCount,
    isOpen,
    setIsOpen,
    addItem: (item) => {
      cartStore.add(item);
      setIsOpen(true);
    },
    updateQuantity: (variantId, quantity) => cartStore.setQuantity(variantId, quantity),
    removeItem: (variantId) => cartStore.remove(variantId),
    clearCart: () => {
      cartStore.clear();
      setCouponCode(null);
      setDroppedCount(0);
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
