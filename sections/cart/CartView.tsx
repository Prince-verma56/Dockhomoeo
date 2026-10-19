"use client";

import { useRef } from "react";
import { ProductThumb } from "@/components/commerce/ProductThumb";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, ArrowLeft, ArrowRight, RotateCw, ShoppingBag, Trash2 } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { QuantityStepper } from "@/components/commerce/QuantityStepper";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCart } from "@/components/providers/CartProvider";
import { buildCartView, type CartLineView } from "@/lib/cart/cartView";
import { formatRupees } from "@/lib/formatters/price";
import { DURATION, EASE_PREMIUM_BEZIER } from "@/lib/animation/motion";
import { CouponField } from "./CouponField";
import { FastDeliveryTimer } from "@/components/commerce/FastDeliveryTimer";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { cartCrumbs } from "@/lib/navigation/crumbs";

export function CartView() {
  const cart = useCart();
  const itemsHeadingRef = useRef<HTMLHeadingElement>(null);
  const { lines, totals } = buildCartView(cart.items, cart.quote, cart.quoteIsCurrent);
  const blocked = lines.some((line) => line.problem);

  if (!cart.hydrated) return <CartSkeleton />;
  if (lines.length === 0) return <EmptyCart dropped={cart.droppedCount} />;

  return (
    <>
      <section aria-labelledby="cart-heading" className="dh-page-top dh-section-b">
        <Container>
          <CartBreadcrumb current="Cart" />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 id="cart-heading" className="dh-title-page text-ink">
              Your cart
            </h1>
            <p className="text-sm text-muted-ink">
              {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
            </p>
          </div>

          {cart.droppedCount > 0 ? (
            <p role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-line-soft bg-paper shadow-2xs px-4 py-3 text-sm text-ink">
              <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-warm" />
              {cart.droppedCount === 1 ? "An item is" : `${cart.droppedCount} items are`} no longer sold and{" "}
              {cart.droppedCount === 1 ? "was" : "were"} removed from your cart.
            </p>
          ) : null}

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
            <div className="min-w-0">
              <h2 ref={itemsHeadingRef} tabIndex={-1} className="sr-only">
                Items in your cart
              </h2>
              <ul className="border-t border-line-soft">
                <AnimatePresence initial={false}>
                  {lines.map((line) => (
                    <CartRow
                      key={line.variantId}
                      line={line}
                      onQuantity={(quantity) => cart.updateQuantity(line.variantId, quantity)}
                      onRemove={() => {
                        cart.removeItem(line.variantId);
                        // The row and its buttons are going; keep keyboard users in the list.
                        itemsHeadingRef.current?.focus();
                      }}
                    />
                  ))}
                </AnimatePresence>
              </ul>
              <Link
                href="/products"
                className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest"
              >
                <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" />
                Continue shopping
              </Link>
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <OrderSummary totals={totals} updating={cart.quoteStatus === "loading"}>
                {cart.quoteStatus === "error" ? (
                  <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-ink">
                    <span>{cart.quoteError} Your cart is safe.</span>
                    <button
                      type="button"
                      onClick={cart.retryQuote}
                      className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-forest"
                    >
                      <RotateCw aria-hidden className="size-3.5" />
                      Retry
                    </button>
                  </div>
                ) : null}
                <CouponField />
                {blocked || cart.quoteStatus === "error" ? (
                  <Button type="button" variant="brand" size="xl" className="w-full" disabled>
                    Proceed to checkout
                  </Button>
                ) : (
                  <Button asChild variant="brand" size="xl" className="w-full">
                    <Link href="/checkout">
                      Proceed to checkout
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                )}
                {blocked ? (
                  <p className="text-xs text-destructive">Fix the items marked above to continue.</p>
                ) : null}
              </OrderSummary>
            </div>
          </div>
        </Container>
      </section>

      {/* Mobile Sticky Bottom Checkout Bar (Image 3) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0c1e17]/95 backdrop-blur-md border-t border-line-soft shadow-[0_-4px_25px_rgba(0,0,0,0.08)]">
        {/* Fast Delivery Urgency Timer Bar (Image 3 green circle) */}
        <FastDeliveryTimer showDiscountUrgency={false} className="rounded-none border-x-0 border-t-0 py-1.5 text-[11px]" />

        <div className="px-4 py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-lg font-extrabold text-ink dark:text-white tabular-nums">
                {formatRupees(totals.total)}
              </span>
              {totals.savings > 0 ? (
                <span className="text-xs text-muted-ink line-through tabular-nums">
                  {formatRupees(totals.subtotal + totals.savings)}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block truncate">
              {totals.savings > 0 ? `You save ${formatRupees(totals.savings)}` : "Amount payable"}
            </span>
          </div>

          <Button asChild variant="brand" size="default" className="h-10 px-6 rounded-full text-xs font-bold bg-[#0d5a43] hover:bg-[#074231] text-white shadow-sm shrink-0">
            <Link href="/checkout">
              Place order
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

export function CartBreadcrumb({ current, via }: { current: string; via?: { label: string; href: string } }) {
  const items = via
    ? [{ name: via.label, href: via.href }, { name: current, href: "" }]
    : current.toLowerCase() === "cart"
      ? cartCrumbs()
      : [{ name: current, href: "" }];

  return <PageBreadcrumb items={items} className="mb-5" structuredData={false} />;
}

function CartRow({
  line,
  onQuantity,
  onRemove,
}: {
  line: CartLineView;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const href = line.slug ? `/product/${line.slug}` : null;

  return (
    <motion.li
      layout={reducedMotion ? false : "position"}
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, height: 0 }}
      transition={{ duration: DURATION.fast, ease: EASE_PREMIUM_BEZIER }}
      className="overflow-hidden border-b border-line-soft"
    >
      <div className="flex gap-4 py-5 sm:gap-5">
        <ProductThumb imageUrl={line.imageUrl} name={line.name} form={line.form} variant={line.variantTitle} brand={line.brand} className="size-20 rounded-2xl sm:size-24" />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0">
              {line.brand ? <p className="dh-eyebrow text-[0.66rem] text-muted-ink">{line.brand}</p> : null}
              <h3 className="mt-0.5 text-base font-semibold leading-snug text-ink">
                {href ? (
                  <Link href={href} className="transition-colors hover:text-forest">
                    {line.name}
                  </Link>
                ) : (
                  line.name
                )}
              </h3>
              {line.variantTitle ? <p className="text-sm text-muted-ink">{line.variantTitle}</p> : null}
              <p className="mt-1 text-sm text-ink">
                {formatRupees(line.unitPrice)}
                {line.mrp > line.unitPrice ? (
                  <s className="ml-1.5 text-muted-ink">
                    <span className="sr-only">MRP </span>
                    {formatRupees(line.mrp)}
                  </s>
                ) : null}
                <span className="text-muted-ink"> each</span>
              </p>
            </div>
            <p className="text-base font-semibold tabular-nums text-ink sm:text-right">
              <span className="sr-only">Line total </span>
              {formatRupees(line.lineTotal)}
            </p>
          </div>

          {line.problem ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
              <AlertCircle aria-hidden className="size-4" />
              {line.problem}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <QuantityStepper
              value={line.quantity}
              min={line.minQuantity}
              max={Math.max(line.maxQuantity, line.minQuantity)}
              label={line.name}
              onChange={onQuantity}
            />
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${line.name} from cart`}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-ink transition-colors hover:bg-destructive/6 hover:text-destructive"
            >
              <Trash2 aria-hidden className="size-4" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

function EmptyCart({ dropped }: { dropped: number }) {
  return (
    <section aria-labelledby="cart-heading" className="dh-page-top dh-section-b">
      <Container>
        <CartBreadcrumb current="Cart" />
        <div className="mx-auto mt-6 max-w-xl text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-sage-tint text-forest">
            <ShoppingBag aria-hidden className="size-8" strokeWidth={1.6} />
          </span>
          <h1 id="cart-heading" className="dh-title-page mt-6 text-ink">
            Your cart is empty
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-ink">
            {dropped > 0
              ? "The items you had are no longer sold, so we removed them. "
              : null}
            Browse remedies by health concern, brand or form — anything you add waits here.
          </p>
          <Button asChild variant="brand" size="xl" className="mt-8">
            <Link href="/products">
              Shop medicines
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <p className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <Link href="/categories" className="font-semibold text-forest underline-offset-4 hover:underline">
              Shop by category
            </Link>
            <Link href="/brands" className="font-semibold text-forest underline-offset-4 hover:underline">
              Shop by brand
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}

function CartSkeleton() {
  return (
    <section className="dh-page-top dh-section-b" role="status">
      <span className="sr-only">Loading your cart…</span>
      <Container>
        <div aria-hidden className="h-5 w-32 rounded-md bg-cream-sunk motion-safe:animate-pulse" />
        <div aria-hidden className="mt-5 h-12 w-56 rounded-md bg-cream-sunk motion-safe:animate-pulse" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
          <div className="border-t border-line/70">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} aria-hidden className="flex gap-5 border-b border-line/70 py-5">
                <div className="size-24 rounded-2xl bg-cream-sunk motion-safe:animate-pulse" />
                <div className="flex-1 space-y-2.5 pt-1">
                  <div className="h-3 w-20 rounded bg-cream-sunk motion-safe:animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-cream-sunk motion-safe:animate-pulse" />
                  <div className="h-10 w-32 rounded-full bg-cream-sunk motion-safe:animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div aria-hidden className="h-72 rounded-card bg-cream-sunk motion-safe:animate-pulse" />
        </div>
      </Container>
    </section>
  );
}
