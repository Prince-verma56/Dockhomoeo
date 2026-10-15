"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";
import { buildCartView } from "@/lib/cart/cartView";
import { formatRupees } from "@/lib/formatters/price";
import { Button } from "@/components/ui/button";
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

/**
 * The cart sheet. Built on the shared shadcn Sheet (Radix Dialog), so focus
 * moves into it, Escape and the overlay close it, and the page behind is
 * inert while it is open.
 *
 * Every figure comes from lib/cart/cartView — the same numbers the cart and
 * checkout pages show. Each line's thumbnail carries `data-cart-thumb`, the
 * landing spot for the add-to-cart flight (lib/cart/flyToCart).
 */
export function CartDrawer() {
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
  const close = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 border-line bg-canvas p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-108"
      >
        <SheetHeader className="flex-row items-center justify-between gap-3 border-b border-line/70 bg-cream px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <SheetTitle className="flex items-center gap-2 font-display text-xl text-ink">
              <ShoppingBag aria-hidden className="size-5 text-forest" strokeWidth={1.8} />
              Your cart
            </SheetTitle>
            <SheetDescription className="mt-0.5 text-[0.8125rem] text-muted-ink">
              {totals.itemCount === 0
                ? "Nothing added yet"
                : `${totals.itemCount} ${totals.itemCount === 1 ? "item" : "items"}`}
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-lg" className="rounded-full text-muted-ink hover:text-ink" aria-label="Close cart">
              <X aria-hidden className="size-5" />
            </Button>
          </SheetClose>
        </SheetHeader>

        {/* data-lenis-prevent: wheel scrolling here belongs to the list, not the page. */}
        <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-sage-tint text-forest">
                <ShoppingBag aria-hidden className="size-7" strokeWidth={1.5} />
              </span>
              <p className="mt-5 font-display text-xl text-ink">{hydrated ? "Your cart is empty" : "Loading your cart…"}</p>
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
            <ul className="space-y-3">
              {lines.map((line) => (
                <li
                  key={line.variantId}
                  className="flex gap-3.5 rounded-2xl border border-line-soft bg-paper shadow-2xs p-3 sm:gap-4"
                >
                  <ProductThumb
                    data-cart-thumb={line.variantId}
                    data-flight-pending={flightVariantId === line.variantId ? "" : undefined}
                    imageUrl={line.imageUrl}
                    name={line.name}
                    form={line.form}
                    className="size-20 transition-opacity duration-200 data-flight-pending:opacity-0"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {line.brand ? (
                          <p className="text-[0.6875rem] font-semibold tracking-wider text-muted-ink uppercase">{line.brand}</p>
                        ) : null}
                        <h3 className="text-sm leading-snug font-semibold text-ink">
                          {line.slug ? (
                            <Link href={`/product/${line.slug}`} onClick={close} className="hover:text-forest">
                              {line.name}
                            </Link>
                          ) : (
                            line.name
                          )}
                        </h3>
                        {line.variantTitle ? <p className="mt-0.5 text-xs text-muted-ink">{line.variantTitle}</p> : null}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(line.variantId)}
                        aria-label={`Remove ${line.name} from cart`}
                        className="-mt-1 -mr-1 rounded-full text-muted-ink hover:bg-destructive/8 hover:text-destructive"
                      >
                        <X aria-hidden className="size-4" />
                      </Button>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
                      <QuantityStepper
                        value={line.quantity}
                        min={Math.max(1, line.minQuantity)}
                        max={Math.max(line.quantity, line.maxQuantity)}
                        label={line.name}
                        onChange={(quantity) => updateQuantity(line.variantId, quantity)}
                        className="h-9 [&_button]:size-9"
                      />
                      <div className="text-right">
                        <p className="text-[0.9375rem] font-semibold text-ink tabular-nums">{formatRupees(line.lineTotal)}</p>
                        {line.mrp > line.unitPrice ? (
                          <p className="text-xs text-muted-ink tabular-nums line-through">{formatRupees(line.mrp * line.quantity)}</p>
                        ) : null}
                      </div>
                    </div>
                    {line.problem ? <p className="mt-2 text-xs font-medium text-destructive">{line.problem}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 ? (
          <SheetFooter className="gap-0 border-t border-line/70 bg-cream px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
            <dl className="space-y-2 text-sm text-muted-ink">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-medium text-ink tabular-nums">{formatRupees(totals.subtotal)}</dd>
              </div>
              {totals.coupon ? (
                <div className="flex justify-between text-forest">
                  <dt>Coupon {totals.coupon.code}</dt>
                  <dd className="tabular-nums">−{formatRupees(totals.coupon.discount)}</dd>
                </div>
              ) : null}
              {totals.shipping !== null ? (
                <div className="flex justify-between">
                  <dt>Delivery</dt>
                  <dd className={cn("tabular-nums", totals.shipping === 0 && "font-medium text-forest")}>
                    {totals.shipping === 0 ? "Free" : formatRupees(totals.shipping)}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between border-t border-line/70 pt-3 text-base font-semibold text-ink">
                <dt>Estimated total</dt>
                <dd aria-live="polite" className="tabular-nums">
                  {isQuoteLoading ? <span className="text-sm font-medium text-muted-ink">Updating…</span> : formatRupees(totals.total)}
                </dd>
              </div>
            </dl>
            {totals.savings > 0 ? (
              <p className="mt-1.5 text-xs text-forest">You save {formatRupees(totals.savings)} on MRP.</p>
            ) : null}
            <div className="mt-4 grid grid-cols-[auto_1fr] gap-2.5">
              <Button asChild variant="brandOutline" size="xl" className="px-5">
                <Link href="/cart" onClick={close}>
                  View cart
                </Link>
              </Button>
              <Button asChild variant="brand" size="xl">
                <Link href="/checkout" onClick={close}>
                  Checkout
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
