import type { ApiQuote } from "@/types/api/cart";
import type { CartItem } from "@/lib/cart/cartStore";

/**
 * Every number the cart, the checkout summary and the order preview show
 * comes from here, so no two components can price the same cart differently.
 *
 * The shop's quote (POST /api/shop/quote) is the authority. While a fresh
 * quote is on its way — or when the server cannot be reached — figures are
 * worked out from the last known unit prices and flagged `provisional`.
 * Even a fresh quote is an estimate until the order is placed: the backend
 * prices the cart again at checkout and refuses a total that moved.
 */

/** Mirrors the backend's default order limit (`maxOrderQuantity ?? 20`). */
export const DEFAULT_MAX_QUANTITY = 20;

export type CartLineView = {
  variantId: number;
  name: string;
  slug: string | null;
  brand: string | null;
  variantTitle: string | null;
  imageUrl: string | null;
  /** Dosage form as added, for the illustrated pack when there is no photo. */
  form: string | null;
  quantity: number;
  unitPrice: number;
  mrp: number;
  lineTotal: number;
  minQuantity: number;
  maxQuantity: number;
  /** The shop's reason this line cannot be ordered as it stands. */
  problem: string | null;
  /** Priced by a quote for exactly this quantity. */
  priced: boolean;
};

export type CartTotals = {
  itemCount: number;
  subtotal: number;
  /** MRP minus selling price, as the backend reports it. */
  savings: number;
  coupon: { code: string; discount: number; description: string | null } | null;
  /** Null until the shop has quoted delivery for this cart. */
  shipping: number | null;
  freeDeliveryFrom: number | null;
  codCharge: number;
  total: number;
  /** Not the shop's quote for this exact cart (yet). */
  provisional: boolean;
};

const round = (value: number) => Math.round(value * 100) / 100;

export function buildCartView(
  items: CartItem[],
  quote: ApiQuote | null,
  quoteIsCurrent: boolean,
): { lines: CartLineView[]; totals: CartTotals } {
  const quoted = new Map(quote?.lines.map((line) => [line.variantId, line]) ?? []);

  const lines = items.map((item): CartLineView => {
    const line = quoted.get(item.variantId);
    const unitPrice = line?.unitPrice ?? item.price;
    const priced = Boolean(line && quoteIsCurrent && line.quantity === item.quantity);
    return {
      variantId: item.variantId,
      name: line?.productName ?? item.title,
      slug: line?.slug ?? null,
      brand: line?.brandName ?? item.brand ?? null,
      variantTitle: line?.variantTitle ?? null,
      imageUrl: line?.imageUrl ?? item.imageUrl ?? null,
      form: item.form ?? null,
      quantity: item.quantity,
      unitPrice,
      mrp: Math.max(line?.mrp ?? unitPrice, unitPrice),
      lineTotal: priced && line ? line.lineTotal : round(unitPrice * item.quantity),
      minQuantity: line?.minQuantity ?? 1,
      maxQuantity: line ? Math.max(line.maxQuantity, 0) : DEFAULT_MAX_QUANTITY,
      problem: priced && line ? line.problem : null,
      priced,
    };
  });

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  if (quote && quoteIsCurrent && lines.every((line) => line.priced)) {
    return {
      lines,
      totals: {
        itemCount,
        subtotal: quote.subtotal,
        savings: quote.savings,
        coupon: quote.coupon ? { code: quote.coupon.code, discount: quote.coupon.discount, description: quote.coupon.description } : null,
        shipping: quote.shippingCharge,
        freeDeliveryFrom: quote.freeDeliveryFrom,
        codCharge: quote.codCharge,
        total: quote.grandTotal,
        provisional: false,
      },
    };
  }

  const subtotal = round(lines.reduce((sum, line) => sum + line.lineTotal, 0));
  return {
    lines,
    totals: {
      itemCount,
      subtotal,
      savings: round(lines.reduce((sum, line) => sum + (line.mrp - line.unitPrice) * line.quantity, 0)),
      coupon: null,
      shipping: null,
      freeDeliveryFrom: null,
      codCharge: 0,
      total: subtotal,
      provisional: true,
    },
  };
}
