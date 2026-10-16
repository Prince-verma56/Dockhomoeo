import type { ApiQuoteLineInput } from "@/types/api/cart";

/**
 * A line as the shopper added it. Prices here are only what the page showed
 * at the time; the quote from the shop server is what the cart displays and
 * what an order is charged (brain/10_SECURITY.md: never trust client prices).
 */
export interface CartItem extends ApiQuoteLineInput {
  title: string;
  price: number;
  imageUrl?: string;
  brand?: string;
  /** Dosage form, so the cart can draw the right pack when there is no photo. */
  form?: string;
}

export type CartSnapshot = {
  items: CartItem[];
  /** False on the server and until the browser copy has been read. */
  hydrated: boolean;
};

/**
 * The one frontend cart. It lives outside React so every page, the drawer
 * and the header read the same lines, and it is read through
 * useSyncExternalStore so the server render (an empty, unhydrated cart) and
 * the first client render agree.
 *
 * Only product lines are kept in localStorage — never addresses, contact or
 * payment details. Other tabs follow through the storage event.
 */
/**
 * Versioned with the catalogue the variant ids belong to. The development
 * catalogue's ids (productId × 1000 + n) mean nothing to the live shop and
 * could even collide with a real pack, so carts saved under the old key are
 * dropped rather than priced as someone else's medicine.
 */
const STORAGE_KEY = "dochomoeo_cart_live_v1";
const RETIRED_KEYS = ["dochomo_cart"];
const SERVER_SNAPSHOT: CartSnapshot = { items: [], hydrated: false };

let snapshot: CartSnapshot | null = null;
const listeners = new Set<() => void>();

const isCartItem = (value: unknown): value is CartItem => {
  const item = value as CartItem;
  return (
    typeof item === "object" &&
    item !== null &&
    Number.isInteger(item.variantId) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.title === "string" &&
    typeof item.price === "number"
  );
};

function read(): CartItem[] {
  try {
    for (const key of RETIRED_KEYS) window.localStorage.removeItem(key);
  } catch {
    // Storage unavailable; nothing to clean up.
  }
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    // Private mode, blocked storage or a damaged entry: start empty.
    return [];
  }
}

function commit(items: CartItem[]) {
  snapshot = { items, hydrated: true };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // The cart still works for this visit without persistence.
  }
  listeners.forEach((listener) => listener());
}

const current = () => getSnapshot().items;

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  snapshot = { items: read(), hydrated: true };
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): CartSnapshot {
  snapshot ??= { items: read(), hydrated: true };
  return snapshot;
}

export function getServerSnapshot(): CartSnapshot {
  return SERVER_SNAPSHOT;
}

export const cartStore = {
  add(item: CartItem) {
    const items = current();
    const existing = items.find((i) => i.variantId === item.variantId);
    commit(
      existing
        ? items.map((i) => (i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i))
        : [...items, item],
    );
  },
  /** A quantity below one removes the line, as the cart has always done. */
  setQuantity(variantId: number, quantity: number) {
    const whole = Math.floor(quantity);
    commit(
      whole < 1
        ? current().filter((i) => i.variantId !== variantId)
        : current().map((i) => (i.variantId === variantId ? { ...i, quantity: whole } : i)),
    );
  },
  remove(variantId: number) {
    commit(current().filter((i) => i.variantId !== variantId));
  },
  /** Lines the shop no longer sells (the quote's `removed`). */
  drop(variantIds: number[]) {
    if (variantIds.length === 0) return;
    commit(current().filter((i) => !variantIds.includes(i.variantId)));
  },
  clear() {
    commit([]);
  },
};
