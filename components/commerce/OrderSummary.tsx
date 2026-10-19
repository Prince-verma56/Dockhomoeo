import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatRupees } from "@/lib/formatters/price";
import type { CartTotals } from "@/lib/cart/cartView";
import { FastDeliveryTimer } from "@/components/commerce/FastDeliveryTimer";
import { Percent, ShieldCheck } from "lucide-react";

/**
 * The totals block shared by the cart and checkout. It displays
 * the full price details breakdown (MRP, Discount on MRP, Subtotal, Shipping, Amount Payable).
 */
export function OrderSummary({
  totals,
  updating = false,
  heading = "Price details",
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

  // Cart total at MRP before discount
  const mrpTotal = totals.subtotal + totals.savings;
  const totalSavings = totals.savings + (totals.coupon?.discount ?? 0);

  return (
    <section aria-labelledby="order-summary-heading" className={cn("rounded-2xl border border-line-soft bg-paper dark:bg-[#0c1e17] shadow-soft p-5 sm:p-6", className)}>
      <Heading id="order-summary-heading" className="text-base sm:text-lg font-bold text-ink dark:text-white">
        {heading}
      </Heading>

      {leading ? <div className="mt-4">{leading}</div> : null}

      <dl className={cn("mt-4 space-y-2.5 text-xs sm:text-sm transition-opacity duration-200", updating && "opacity-60")}>
        {/* 1. Cart total (MRP) */}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-ink">
            Cart total ({totals.itemCount} {noun})
          </dt>
          <dd className="font-semibold tabular-nums text-ink dark:text-white">
            {totals.savings > 0 ? (
              <span className="line-through text-muted-ink/75 mr-1.5 font-normal text-xs">
                {formatRupees(mrpTotal)}
              </span>
            ) : null}
            <span>{formatRupees(mrpTotal > 0 ? mrpTotal : totals.subtotal)}</span>
          </dd>
        </div>

        {/* 2. Discount on MRP */}
        {totals.savings > 0 ? (
          <div className="flex justify-between gap-4 text-emerald-700 dark:text-emerald-400">
            <dt className="font-medium">Discount on MRP</dt>
            <dd className="font-bold tabular-nums">−{formatRupees(totals.savings)}</dd>
          </div>
        ) : null}

        {/* 3. Shipping Charge */}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-ink">Shipping charge</dt>
          <dd className={cn("font-medium tabular-nums", totals.shipping === 0 ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-ink dark:text-white")}>
            {delivery}
          </dd>
        </div>

        {/* 4. Sub total (Price after MRP discount) */}
        <div className="flex justify-between gap-4 pt-1 border-t border-line-soft/60">
          <dt className="text-muted-ink font-medium">Sub total</dt>
          <dd className="font-bold tabular-nums text-ink dark:text-white">{formatRupees(totals.subtotal)}</dd>
        </div>

        {/* 5. Coupon Discount (if applied) */}
        {totals.coupon ? (
          <div className="flex justify-between gap-4 text-emerald-700 dark:text-emerald-400">
            <dt className="font-medium">Coupon discount ({totals.coupon.code})</dt>
            <dd className="font-bold tabular-nums">−{formatRupees(totals.coupon.discount)}</dd>
          </div>
        ) : null}

        {/* 6. COD Charge */}
        {totals.codCharge > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-ink">Pay-on-delivery charge</dt>
            <dd className="font-medium tabular-nums text-ink dark:text-white">{formatRupees(totals.codCharge)}</dd>
          </div>
        ) : null}

        {/* 7. Amount Payable / Estimated Total */}
        <div className="flex items-baseline justify-between gap-4 border-t border-line/80 pt-3 text-base">
          <div>
            <dt className="font-bold text-ink dark:text-white">Amount payable</dt>
            <span className="text-[10px] text-muted-ink block font-normal">Inclusive of all taxes</span>
          </div>
          <dd className="text-xl font-extrabold tabular-nums text-ink dark:text-white">{formatRupees(totals.total)}</dd>
        </div>
      </dl>

      {/* Savings Highlight Badge (Image 3 style) */}
      {totalSavings > 0 ? (
        <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <Percent className="size-3.5 text-emerald-600 shrink-0" />
          <span>You saved {formatRupees(totalSavings)} on this order</span>
        </div>
      ) : null}

      {/* Fast Delivery Urgency Timer (Image 3) */}
      <div className="mt-3.5">
        <FastDeliveryTimer showDiscountUrgency={true} />
      </div>

      <div className="mt-3 space-y-1 text-[11px] leading-relaxed text-muted-ink" aria-live="polite">
        {toFree !== null && toFree > 0 ? <p className="text-emerald-700 dark:text-emerald-400 font-medium">Add {formatRupees(toFree)} more for free delivery.</p> : null}
        <p>
          {updating
            ? "Updating prices…"
            : totals.provisional
              ? "Using the prices shown when you added these items while we check with the shop."
              : "The shop confirms the final amount when you place your order."}
        </p>
      </div>

      {children ? <div className="mt-4 space-y-3">{children}</div> : null}
    </section>
  );
}
