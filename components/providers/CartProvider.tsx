"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { repositories } from "@/lib/repositories";
import { describeError } from "@/lib/api";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { cartStore, getServerSnapshot, getSnapshot, subscribe, type CartItem } from "@/lib/cart/cartStore";
import { flyToCart, type Flight } from "@/lib/cart/flyToCart";
import { prefersReducedMotion } from "@/lib/animation/motion";
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
  /**
   * Adds the line once and opens the cart sheet. With a `source` (the product
   * image that was clicked) the image flies into the sheet; reduced motion
   * skips the flight. Returns false when the same pack was added a moment ago
   * and the click was absorbed, so a double click never adds twice.
   */
  addItem: (item: CartItem, options?: { source?: HTMLElement | null }) => boolean;
  /** The pack whose image is in flight; its cart thumbnail waits for it. */
  flightVariantId: number | null;
  updateQuantity: (variantId: number, quantity: number) => void;
  /**
   * The prescription this cart is being ordered for; sent as `prescriptionId`
   * at checkout so the order is recorded against it. Cleared with the cart.
   */
  prescription: LinkedPrescription | null;
  setPrescription: (prescription: LinkedPrescription | null) => void;
  removeItem: (variantId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/** The prescription an order is being placed for (only its id and number, never its contents). */
export type LinkedPrescription = { id: number; number: string };
const PRESCRIPTION_KEY = "dochomoeo_cart_prescription_v1";
const COUPON_KEY = "dochomoeo_cart_coupon_v1";

function readCoupon(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const val = window.localStorage.getItem(COUPON_KEY);
    return val && typeof val === "string" && val.trim().length > 0 ? val.trim().toUpperCase() : null;
  } catch {
    return null;
  }
}

function writeCoupon(code: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (code && code.trim().length > 0) window.localStorage.setItem(COUPON_KEY, code.trim().toUpperCase());
    else window.localStorage.removeItem(COUPON_KEY);
  } catch {
    // Without storage the coupon lasts for this session only.
  }
}

function readPrescription(): LinkedPrescription | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.localStorage.getItem(PRESCRIPTION_KEY) ?? "null") as LinkedPrescription | null;
    return value && Number.isInteger(value.id) && typeof value.number === "string" ? value : null;
  } catch {
    return null;
  }
}

function writePrescription(value: LinkedPrescription | null) {
  try {
    if (value) window.localStorage.setItem(PRESCRIPTION_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(PRESCRIPTION_KEY);
  } catch {
    // Without storage the link lasts for this page only.
  }
}

/** Quantity taps arrive in bursts; price the cart once they settle. */
const QUOTE_DEBOUNCE_MS = 250;

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCodeState] = useState<string | null>(null);

  useEffect(() => {
    const saved = readCoupon();
    if (saved) setCouponCodeState(saved);
  }, []);

  const applyCoupon = useCallback((code: string) => {
    const cleaned = code.trim().toUpperCase() || null;
    writeCoupon(cleaned);
    setCouponCodeState(cleaned);
  }, []);

  const removeCoupon = useCallback(() => {
    writeCoupon(null);
    setCouponCodeState(null);
  }, []);

  const [paymentMethod, setPaymentMethod] = useState<ApiPaymentMethod>("COD");
  const [attempt, setAttempt] = useState(0);
  const [lastQuote, setLastQuote] = useState<{ key: string; quote: ApiQuote } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [droppedCount, setDroppedCount] = useState(0);
  const [flightVariantId, setFlightVariantId] = useState<number | null>(null);
  const [prescription, setPrescriptionState] = useState<LinkedPrescription | null>(readPrescription);
  const setPrescription = useCallback((value: LinkedPrescription | null) => {
    writePrescription(value);
    setPrescriptionState(value);
  }, []);
  const [announcement, setAnnouncement] = useState("");
  // Packs added in the last moment. A ref, not state: it gates clicks and
  // must not re-render the whole tree.
  const recentlyAdded = useRef(new Set<number>());
  const flight = useRef<Flight | null>(null);

  useEffect(() => () => flight.current?.cancel(), []);

  const addItem = useCallback((item: CartItem, options?: { source?: HTMLElement | null }) => {
    const { variantId } = item;
    if (recentlyAdded.current.has(variantId)) return false;
    recentlyAdded.current.add(variantId);

    // The store is the cart: it changes here, once, before any animation.
    cartStore.add(item);
    setIsOpen(true);
    setAnnouncement(`${item.title} added to your cart`);

    const release = () => recentlyAdded.current.delete(variantId);
    const source = options?.source;
    if (!source || prefersReducedMotion()) {
      window.setTimeout(release, 400);
      return true;
    }

    // One flight at a time: a newer add finishes the previous one instantly.
    flight.current?.cancel();
    const current = flyToCart(source, variantId);
    flight.current = current;
    setFlightVariantId(variantId);
    void current.done.then(() => {
      release();
      if (flight.current === current) {
        flight.current = null;
        setFlightVariantId(null);
      }
    });
    return true;
  }, []);

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
      (error: unknown) => {
        if (!active) return;
        setFailure({ key: settledKey, message: describeError(error, "We couldn't check prices with the shop just now.") });
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
    applyCoupon,
    removeCoupon,
    paymentMethod,
    setPaymentMethod,
    droppedCount,
    isOpen,
    setIsOpen,
    addItem,
    flightVariantId,
    updateQuantity: (variantId, quantity) => cartStore.setQuantity(variantId, quantity),
    removeItem: (variantId) => cartStore.remove(variantId),
    // An empty cart is not being ordered for any prescription.
    prescription: cart.items.length > 0 ? prescription : null,
    setPrescription,
    clearCart: () => {
      cartStore.clear();
      removeCoupon();
      setDroppedCount(0);
      setPrescription(null);
    },
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Announces adds for screen readers; the sheet's own focus move says the rest. */}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
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
