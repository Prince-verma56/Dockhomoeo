"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Percent, ShoppingBag, Truck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";
import { buildCartView } from "@/lib/cart/cartView";
import { formatRupees } from "@/lib/formatters/price";
import { FastDeliveryTimer } from "@/components/commerce/FastDeliveryTimer";
import { Button } from "@/components/ui/button";
import { getLenis } from "@/components/providers/SmoothScrollProvider";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductThumb } from "@/components/commerce/ProductThumb";
import { QuantityStepper } from "@/components/commerce/QuantityStepper";
import { CouponField } from "@/sections/cart/CouponField";

/**
 * CartDrawer — luxury e-commerce slide-over cart.
 *
 * UX & Priority Hierarchy:
 * 1. Product items take #1 priority with maximum vertical space (up to 4-5 items visible without cramped scrolling).
 * 2. Bottom checkout bar has an interactive open/close accordion: by default it only shows Total Amount & Savings, and smoothly expands on-demand to show detailed bill charges.
 * 3. Quick-action buttons [View cart] and [Checkout →] remain anchored and accessible.
 */
export function CartDrawer() {
  const pathname = usePathname();
  const {
    isOpen,
    setIsOpen,
    quote,
    quoteIsCurrent,
    items,
    hydrated,
    updateQuantity,
    removeItem,
    isQuoteLoading,
    flightVariantId,
  } = useCart();
  const { lines, totals } = buildCartView(items, quote, quoteIsCurrent);
  const [isBillExpanded, setIsBillExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const close = () => setIsOpen(false);

  // Close the cart sheet smoothly whenever the route changes (e.g. navigating to /checkout or /cart)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  // Stop Lenis while the cart drawer is open so page wheel scrolling does not
  // fight Radix scroll lock or cause unresponsiveness on Windows.
  useEffect(() => {
    if (!isOpen) return;
    const lenis = getLenis();
    lenis?.stop();
    return () => lenis?.start();
  }, [isOpen]);

  const totalSavings = totals.savings + (totals.coupon?.discount ?? 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex h-full flex-col gap-0 border-line bg-canvas dark:bg-[#081510] p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-108"
      >
        {/* ================================================================= */}
        {/* HEADER: Title, Count & Close                                      */}
        {/* ================================================================= */}
        <SheetHeader className="flex-row items-center justify-between gap-3 border-b border-line/70 bg-cream/90 dark:bg-[#0c1e17] px-5 py-3.5 sm:px-6 shrink-0">
          <div className="min-w-0">
            <SheetTitle className="flex items-center gap-2 font-display text-lg sm:text-xl text-ink dark:text-white">
              <ShoppingBag aria-hidden className="size-5 text-[#0d5a43] dark:text-emerald-400" strokeWidth={1.8} />
              Your cart
            </SheetTitle>
            <SheetDescription className="mt-0.5 text-xs text-muted-ink">
              {totals.itemCount === 0
                ? "Nothing added yet"
                : `${totals.itemCount} ${totals.itemCount === 1 ? "item" : "items"} in your order`}
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full text-muted-ink hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              aria-label="Close cart"
            >
              <X aria-hidden className="size-5" />
            </Button>
          </SheetClose>
        </SheetHeader>

        {/* Free Express Delivery Top Banner (Prominent & slim) */}
        {lines.length > 0 && totals.shipping === 0 && (
          <div className="flex items-center justify-between bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-300 shrink-0">
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>You unlocked <strong>FREE Express Delivery</strong></span>
            </span>
            <span className="rounded-full bg-emerald-600/15 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
              FREE
            </span>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCROLLABLE BODY: Priority 1 - All Added Products                  */}
        {/* ================================================================= */}
        <div
          ref={scrollRef}
          data-lenis-prevent
          className="dh-custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 space-y-4"
        >
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center py-12">
              <span className="grid size-16 place-items-center rounded-full bg-sage-tint dark:bg-emerald-950/40 text-forest dark:text-emerald-400">
                <ShoppingBag aria-hidden className="size-7" strokeWidth={1.5} />
              </span>
              <p className="mt-5 font-display text-xl text-ink dark:text-white">
                {hydrated ? "Your cart is empty" : "Loading your cart…"}
              </p>
              {hydrated ? (
                <p className="mt-1.5 max-w-xs text-sm text-muted-ink">
                  Browse remedies by concern, brand or form, and add what you need.
                </p>
              ) : null}
              <Button asChild variant="brand" size="xl" className="mt-7">
                <Link href="/products" onClick={close}>
                  Browse remedies
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Product List */}
              <ul className="space-y-2.5">
                {lines.map((line) => (
                  <li
                    key={line.variantId}
                    className="flex gap-3 rounded-2xl border border-line-soft bg-paper dark:bg-white/5 shadow-2xs p-3 transition-colors hover:border-[#0d5a43]/30"
                  >
                    <ProductThumb
                      data-cart-thumb={line.variantId}
                      data-flight-pending={flightVariantId === line.variantId ? "" : undefined}
                      imageUrl={line.imageUrl}
                      name={line.name}
                      form={line.form}
                      variant={line.variantTitle}
                      brand={line.brand}
                      className="size-18 sm:size-20 shrink-0 rounded-xl transition-opacity duration-200 data-flight-pending:opacity-0"
                    />
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0">
                            {line.brand ? (
                              <p className="text-[10px] font-bold tracking-wider text-muted-ink uppercase">
                                {line.brand}
                              </p>
                            ) : null}
                            <h3 className="text-xs sm:text-[0.84rem] leading-snug font-semibold text-ink dark:text-white line-clamp-2">
                              {line.slug ? (
                                <Link
                                  href={`/product/${line.slug}`}
                                  onClick={close}
                                  className="hover:text-[#0d5a43] dark:hover:text-emerald-400 transition-colors"
                                >
                                  {line.name}
                                </Link>
                              ) : (
                                line.name
                              )}
                            </h3>
                            {line.variantTitle ? (
                              <p className="mt-0.5 text-[11px] text-muted-ink font-medium">{line.variantTitle}</p>
                            ) : null}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(line.variantId)}
                            aria-label={`Remove ${line.name} from cart`}
                            className="-mt-1 -mr-1 size-7 rounded-full text-muted-ink hover:bg-destructive/10 hover:text-destructive cursor-pointer shrink-0"
                          >
                            <X aria-hidden className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-end justify-between gap-2">
                        <QuantityStepper
                          value={line.quantity}
                          min={Math.max(1, line.minQuantity)}
                          max={Math.max(line.quantity, line.maxQuantity)}
                          label={line.name}
                          onChange={(quantity) => updateQuantity(line.variantId, quantity)}
                          className="h-8 [&_button]:size-8 text-xs"
                        />
                        <div className="text-right">
                          <p className="text-sm font-bold text-ink dark:text-white tabular-nums">
                            {formatRupees(line.lineTotal)}
                          </p>
                          {line.mrp > line.unitPrice ? (
                            <p className="text-[10.5px] text-muted-ink tabular-nums line-through">
                              {formatRupees(line.mrp * line.quantity)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {line.problem ? (
                        <p className="mt-1 text-xs font-medium text-destructive">{line.problem}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Coupons & Promo Offers Card */}
              <div className="rounded-2xl border border-line-soft bg-paper dark:bg-white/5 p-3.5 shadow-2xs">
                <CouponField />
              </div>

              {/* Fast Delivery Dispatch Urgency */}
              <div className="rounded-2xl border border-line-soft overflow-hidden shadow-2xs">
                <FastDeliveryTimer showDiscountUrgency={true} />
              </div>

              {/* Quality & Trust Notes */}
              <div className="text-center py-1">
                <p className="text-[11px] font-medium text-muted-ink">
                  🛡️ 100% Genuine Sealed Remedies • Climate-Controlled Dispatch
                </p>
              </div>
            </>
          )}
        </div>

        {/* ================================================================= */}
        {/* PINNED FOOTER: Interactive Collapsible Bill Bar (~88px collapsed) */}
        {/* ================================================================= */}
        {lines.length > 0 ? (
          <SheetFooter className="gap-0 border-t border-line/70 bg-white/95 dark:bg-[#0c1e17]/95 backdrop-blur-xl px-5 pt-3 pb-[max(1.125rem,env(safe-area-inset-bottom))] sm:px-6 shadow-[0_-8px_24px_-6px_rgba(0,0,0,0.08)] shrink-0 flex flex-col">
            {/* Quick Price & Collapsible Toggle Header */}
            <div className="flex items-center justify-between gap-3 mb-2.5 w-full">
              <div>
                <button
                  type="button"
                  onClick={() => setIsBillExpanded((prev) => !prev)}
                  aria-expanded={isBillExpanded}
                  className="group flex items-center gap-1 text-[11px] font-bold text-[#0d5a43] dark:text-emerald-400 hover:text-[#063325] dark:hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <span>{isBillExpanded ? "Hide bill details" : "View bill details"}</span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      isBillExpanded && "rotate-180"
                    )}
                  />
                </button>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-ink dark:text-white tabular-nums tracking-tight">
                    {isQuoteLoading ? "…" : formatRupees(totals.total)}
                  </span>
                  {totalSavings > 0 ? (
                    <span className="text-xs text-muted-ink line-through tabular-nums">
                      {formatRupees(totals.subtotal + totals.savings)}
                    </span>
                  ) : null}
                </div>
              </div>

              {totalSavings > 0 ? (
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                  <Percent className="size-3 text-emerald-600 shrink-0" />
                  <span>Saved {formatRupees(totalSavings)}</span>
                </div>
              ) : null}
            </div>

            {/* Smooth Collapsible Bill Breakdown Accordion */}
            <AnimatePresence initial={false}>
              {isBillExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden w-full"
                >
                  <div className="mb-3 rounded-2xl border border-line-soft bg-paper dark:bg-white/5 p-3.5 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-line-soft/60">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-ink">
                        Itemized Charges
                      </span>
                      <span className="text-[11px] font-semibold text-muted-ink">
                        {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <dl className="space-y-1.5 text-xs text-muted-ink">
                      {/* Cart Total (MRP) */}
                      <div className="flex justify-between">
                        <dt>Items total (MRP)</dt>
                        <dd className="tabular-nums font-semibold text-ink dark:text-white">
                          {formatRupees(totals.subtotal + totals.savings)}
                        </dd>
                      </div>

                      {/* Discount on MRP */}
                      {totals.savings > 0 && (
                        <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                          <dt>Discount on MRP</dt>
                          <dd className="font-bold tabular-nums">−{formatRupees(totals.savings)}</dd>
                        </div>
                      )}

                      {/* Shipping Charge */}
                      {totals.shipping !== null && (
                        <div className="flex justify-between">
                          <dt>Delivery Partner Fee</dt>
                          <dd className={cn("tabular-nums", totals.shipping === 0 && "font-bold text-emerald-700 dark:text-emerald-400")}>
                            {totals.shipping === 0 ? "FREE" : formatRupees(totals.shipping)}
                          </dd>
                        </div>
                      )}

                      {/* Coupon Discount */}
                      {totals.coupon && (
                        <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                          <dt>Coupon ({totals.coupon.code})</dt>
                          <dd className="font-bold tabular-nums">−{formatRupees(totals.coupon.discount)}</dd>
                        </div>
                      )}

                      {/* Final Total */}
                      <div className="flex items-baseline justify-between pt-1.5 border-t border-line-soft font-bold text-sm text-ink dark:text-white">
                        <dt>Amount payable</dt>
                        <dd aria-live="polite" className="tabular-nums font-extrabold text-[#0d5a43] dark:text-emerald-400 text-base">
                          {isQuoteLoading ? "Updating…" : formatRupees(totals.total)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons: [View cart] & [Checkout →] */}
            <div className="grid grid-cols-[105px_1fr] sm:grid-cols-[115px_1fr] gap-2 w-full">
              <SheetClose asChild>
                <Button
                  asChild
                  variant="brandOutline"
                  size="lg"
                  className="h-11 rounded-xl text-xs font-bold border-line-soft hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <Link href="/cart" onClick={() => setIsOpen(false)}>
                    View cart
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  asChild
                  variant="brand"
                  size="lg"
                  className="h-11 rounded-xl font-bold shadow-md hover:shadow-lg transition-all group cursor-pointer bg-[#0d5a43] hover:bg-[#083c2c] text-white"
                >
                  <Link href="/checkout" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2">
                    <span>Checkout</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
