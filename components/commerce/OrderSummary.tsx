import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatRupees } from "@/lib/formatters/price";
import type { CartTotals } from "@/lib/cart/cartView";

/**
 * The totals block shared by the cart and checkout. It only renders
 * `CartTotals` (lib/cart/cartView); it never adds anything up itself.
 *
 * The total is labelled an estimate on purpose: the shop prices the cart again
 * when the order is placed and refuses it if the figure moved.
 */
export function OrderSummary({
  totals,
  updating = false,
  heading = "Order summary",
  headingLevel: Heading = "h2",
  leading,
  children,
  className,
}: {
  totals: CartTotals;
  /** Shown between the heading and the figures, e.g. the lines being ordered. */
  leading?: ReactNode;
  /** A fresh quote is on its way; figures may change. */
  updating?: boolean;
  heading?: string;
  headingLevel?: "h2" | "h3";
  /** Actions under the total (coupon, primary button…). */
  children?: ReactNode;
  className?: string;
}) {
  const noun = totals.itemCount === 1 ? "item" : "items";
  const delivery =
    totals.shipping === null ? "Calculated at checkout" : totals.shipping === 0 ? "Free" : formatRupees(totals.shipping);
  const toFree =
    totals.freeDeliveryFrom !== null && totals.shipping !== null && totals.shipping > 0
      ? totals.freeDeliveryFrom - totals.subtotal
      : null;

  return (
    <section aria-labelledby="order-summary-heading" className={cn("rounded-2xl border border-line-soft bg-paper shadow-soft p-6", className)}>
      <Heading id="order-summary-heading" className="text-lg font-semibold text-ink">
        {heading}
      </Heading>

      {leading ? <div className="mt-4">{leading}</div> : null}

      <dl className={cn("mt-5 space-y-3 text-sm transition-opacity duration-200", updating && "opacity-60")}>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-ink">
            Items ({totals.itemCount} {noun})
          </dt>
          <dd className="font-medium tabular-nums text-ink">{formatRupees(totals.subtotal)}</dd>
        </div>
        {totals.coupon ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-ink">Coupon {totals.coupon.code}</dt>
            <dd className="font-medium tabular-nums text-forest">−{formatRupees(totals.coupon.discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-ink">Delivery</dt>
          <dd className={cn("font-medium tabular-nums", totals.shipping === 0 ? "text-forest" : "text-ink")}>{delivery}</dd>
        </div>
        {totals.codCharge > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-ink">Pay-on-delivery charge</dt>
            <dd className="font-medium tabular-nums text-ink">{formatRupees(totals.codCharge)}</dd>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between gap-4 border-t border-line/70 pt-4">
          <dt className="text-base font-semibold text-ink">Estimated total</dt>
          <dd className="text-xl font-semibold tabular-nums text-ink">{formatRupees(totals.total)}</dd>
        </div>
      </dl>

      <div className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted-ink" aria-live="polite">
        {totals.savings > 0 ? <p>Includes {formatRupees(totals.savings)} off MRP.</p> : null}
        {toFree !== null && toFree > 0 ? <p>Add {formatRupees(toFree)} more for free delivery.</p> : null}
        <p>
          {updating
            ? "Updating prices…"
            : totals.provisional
              ? "Using the prices shown when you added these items while we check with the shop."
              : "The shop confirms the final amount when you place your order."}
        </p>
      </div>

      {children ? <div className="mt-5 space-y-3">{children}</div> : null}
    </section>
  );
}
