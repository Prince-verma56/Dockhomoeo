import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupees } from "@/lib/formatters/price";
import type { CartTotals } from "@/lib/cart/cartView";
import { FastDeliveryTimer } from "@/components/commerce/FastDeliveryTimer";

/**
 * The totals block shared by the cart and checkout. It displays
 * the total amount payable prominently with an interactive collapsible accordion
 * for the itemized price breakdown (MRP, Discount, Shipping, Subtotal, Coupon).
 */
export function OrderSummary({
  totals,
  updating = false,
  heading = "Price details",
  headingLevel: Heading = "h2",
  leading,
  children,
  className,
  collapsible = true,
  defaultExpanded = false,
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
  /** Whether the detailed charges breakdown can be toggled open/closed */
  collapsible?: boolean;
  /** Initial expansion state */
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

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
    <section aria-labelledby="order-summary-heading" className={cn("rounded-2xl border border-line-soft bg-paper dark:bg-[#0c1e17] shadow-soft p-4 sm:p-5 lg:p-6", className)}>
      <div className="flex items-center justify-between pb-1">
        <Heading id="order-summary-heading" className="text-base sm:text-lg font-bold text-ink dark:text-white">
          {heading}
        </Heading>
        {collapsible && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="group flex items-center gap-1 text-xs font-bold text-[#0d5a43] dark:text-emerald-400 hover:text-[#063325] dark:hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? "Hide details" : "View details"}</span>
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      {leading ? <div className="mt-3">{leading}</div> : null}

      {/* Prominent Total Payable Banner (Always visible by default) */}
      <div className="mt-4 rounded-xl border border-line-soft/80 bg-white dark:bg-black/20 p-3 sm:p-3.5 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-muted-ink">
              Amount payable
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-ink dark:text-white tabular-nums tracking-tight">
                {formatRupees(totals.total)}
              </span>
              {mrpTotal > totals.total ? (
                <span className="text-xs text-muted-ink line-through tabular-nums">
                  {formatRupees(mrpTotal)}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] text-muted-ink/80 block mt-0.5">
              Inclusive of all taxes & charges
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {totalSavings > 0 ? (
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                <Percent className="size-3 text-emerald-600 shrink-0" />
                <span>Saved {formatRupees(totalSavings)}</span>
              </div>
            ) : null}

            {collapsible && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-[11px] font-semibold text-[#0d5a43] dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-0.5"
              >
                <span>{isExpanded ? "Hide breakdown" : "View breakdown"}</span>
                <ChevronDown className={cn("size-3 transition-transform", isExpanded && "rotate-180")} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Itemized Figures Accordion */}
      <AnimatePresence initial={false}>
        {(!collapsible || isExpanded) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-line-soft bg-paper dark:bg-white/5 p-3.5 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-line-soft/60">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-ink">
                  Price Breakdown
                </span>
                <span className="text-[11px] font-semibold text-muted-ink">
                  {totals.itemCount} {noun}
                </span>
              </div>

              <dl className={cn("space-y-2 text-xs transition-opacity duration-200", updating && "opacity-60")}>
                {/* 1. Cart total (MRP) */}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-ink">
                    Cart total ({totals.itemCount} {noun})
                  </dt>
                  <dd className="font-semibold tabular-nums text-ink dark:text-white">
                    {totals.savings > 0 ? (
                      <span className="line-through text-muted-ink/75 mr-1.5 font-normal text-[11px]">
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
              </dl>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Savings Highlight Badge */}
      {totalSavings > 0 ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <Percent className="size-3.5 text-emerald-600 shrink-0" />
          <span>You saved {formatRupees(totalSavings)} on this order</span>
        </div>
      ) : null}

      {/* Fast Delivery Urgency Timer */}
      <div className="mt-3">
        <FastDeliveryTimer showDiscountUrgency={true} />
      </div>

      <div className="mt-2.5 space-y-1 text-[11px] leading-relaxed text-muted-ink" aria-live="polite">
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
