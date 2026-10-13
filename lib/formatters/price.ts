import type { Price } from "@/types/common";

const FORMATTERS = new Map<string, Intl.NumberFormat>();

function formatterFor(currency: Price["currency"]) {
  let formatter = FORMATTERS.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    FORMATTERS.set(currency, formatter);
  }
  return formatter;
}

/** Formats money for display. The only place currency presentation is decided. */
export function formatPrice(price: Price): string {
  return formatterFor(price.currency).format(price.amount);
}

const RUPEES = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const WHOLE_RUPEES = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/**
 * An amount from the cart or an order. Paise are kept when there are any:
 * rounding a total for display would show a figure the customer is not charged.
 */
export function formatRupees(amount: number): string {
  return (Number.isInteger(amount) ? WHOLE_RUPEES : RUPEES).format(amount);
}

/** Whole-percent saving, or null when there is nothing to compare against. */
export function discountPercent(
  price: Price,
  compareAt?: Price,
): number | null {
  if (!compareAt || compareAt.amount <= price.amount) return null;
  return Math.round(((compareAt.amount - price.amount) / compareAt.amount) * 100);
}
