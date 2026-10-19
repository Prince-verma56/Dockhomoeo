"use client";

import { useEffect, useRef, useState } from "react";
import { ProductThumb } from "@/components/commerce/ProductThumb";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, CreditCard, FlaskConical, Loader2, PackageSearch, RotateCw, XCircle } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { repositories, usingMockData } from "@/lib/repositories";
import { formatRupees } from "@/lib/formatters/price";
import { EASE_PREMIUM_BEZIER } from "@/lib/animation/motion";
import { toOrderConfirmation, type OrderConfirmation } from "@/lib/checkout/orderConfirmation";
import { CheckoutError } from "@/lib/checkout/checkoutForm";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { orderConfirmationCrumbs } from "@/lib/navigation/crumbs";

/** What the payment gateway said, as the backend passes it back (`?payment=`). */
export type PaymentReturn = "success" | "pending" | "failed";

type Load =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error" }
  | { status: "ready"; order: OrderConfirmation };

/**
 * /thankyou?order=<id>. The page claims only what the shop's order record
 * says. Opened without an order, or for one this visitor cannot see, it says
 * so plainly instead of showing a confirmation.
 */
export function OrderConfirmationView({ orderId, payment = null }: { orderId: number | null; payment?: PaymentReturn | null }) {
  const [load, setLoad] = useState<{ id: number | null; state: Load } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (orderId === null) return;
    let active = true;
    repositories.cart.getOrder(orderId).then(
      (order) =>
        active &&
        setLoad({
          id: orderId,
          state: order ? { status: "ready", order: toOrderConfirmation(order, usingMockData) } : { status: "missing" },
        }),
      // Not a missing order: the shop could not be asked. Offer a retry, never a false confirmation.
      () => active && setLoad({ id: orderId, state: { status: "error" } }),
    );
    return () => {
      active = false;
    };
  }, [orderId, attempt]);

  const state: Load = orderId === null ? { status: "missing" } : load?.id === orderId ? load.state : { status: "loading" };

  if (state.status === "loading") {
    return (
      <Container className="max-w-3xl">
        <PageBreadcrumb items={orderConfirmationCrumbs()} className="mb-6" />
        <div role="status" className="space-y-4">
          <span className="sr-only">Loading your order…</span>
          <div aria-hidden className="mx-auto size-16 rounded-full bg-cream-sunk motion-safe:animate-pulse" />
          <div aria-hidden className="mx-auto h-10 w-2/3 rounded-md bg-cream-sunk motion-safe:animate-pulse" />
          <div aria-hidden className="h-64 rounded-card bg-cream-sunk motion-safe:animate-pulse" />
        </div>
      </Container>
    );
  }

  if (state.status === "missing") return <NoConfirmation />;
  if (state.status === "error") {
    return (
      <Container className="max-w-xl text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-destructive/8 text-destructive">
          <AlertCircle aria-hidden className="size-7" strokeWidth={1.6} />
        </span>
        <h1 className="dh-title-section mt-6 text-ink">We couldn&rsquo;t load your order</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-ink">
          If you placed an order, it is safe. This page just couldn&rsquo;t reach the shop. Try again, or find it in your orders.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            variant="brand"
            size="xl"
            onClick={() => {
              setLoad(null);
              setAttempt((n) => n + 1);
            }}
          >
            <RotateCw aria-hidden />
            Try again
          </Button>
          <Button asChild variant="brandOutline" size="xl">
            <Link href="/account/orders">Your orders</Link>
          </Button>
        </div>
      </Container>
    );
  }
  return <Confirmation order={state.order} payment={payment} />;
}

function NoConfirmation() {
  return (
    <Container className="max-w-xl text-center">
      <PageBreadcrumb items={orderConfirmationCrumbs()} className="mb-6 text-left" />
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-cream-sunk text-muted-ink">
        <PackageSearch aria-hidden className="size-7" strokeWidth={1.6} />
      </span>
      <h1 className="dh-title-section mt-6 text-ink">No order confirmation to show</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-ink">
        This page shows your confirmation straight after you place an order. If you have placed one, you can find it with
        your orders.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="brand" size="xl">
          <Link href="/products">
            Continue shopping
            <ArrowRight aria-hidden />
          </Link>
        </Button>
        <Button asChild variant="brandOutline" size="xl">
          <Link href="/account/orders">Your orders</Link>
        </Button>
      </div>
    </Container>
  );
}

const HEADLINES: Record<OrderConfirmation["state"], { title: string; lead: string }> = {
  confirmed: { title: "Thank you — your order is confirmed", lead: "We've received your order and will prepare it for dispatch." },
  "awaiting-payment": {
    title: "Your order is waiting for payment",
    lead: "It is reserved for you. Complete the payment from your order page to confirm it.",
  },
  cancelled: { title: "This order was cancelled", lead: "Nothing further will be sent. Contact us if this is unexpected." },
  received: { title: "Thank you — we have your order", lead: "You can follow its progress from your orders." },
};

function Confirmation({ order, payment }: { order: OrderConfirmation; payment: PaymentReturn | null }) {
  const reducedMotion = useReducedMotion();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const payingRef = useRef(false);

  // POST /api/me/orders/:id/pay opens a fresh payment page for the same order:
  // no second order is created, so retrying is always safe.
  const payAgain = async () => {
    if (payingRef.current) return;
    payingRef.current = true;
    setPaying(true);
    setPayError(null);
    try {
      const { payUrl } = await repositories.cart.payOrder(order.orderId);
      window.location.assign(payUrl);
    } catch (error) {
      payingRef.current = false;
      setPaying(false);
      setPayError(error instanceof CheckoutError ? error.message : "We couldn't open the payment page just now. Please try again.");
    }
  };
  const awaitingPayment = order.state === "awaiting-payment";
  const headline = order.preview
    ? { title: "Order preview received", lead: "This is how your confirmation will look once the shop is connected." }
    : HEADLINES[order.state];
  const Icon = order.preview ? FlaskConical : order.state === "awaiting-payment" ? Clock : order.state === "cancelled" ? XCircle : CheckCircle2;
  const placed = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.placedAt));
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container className="max-w-3xl">
      <PageBreadcrumb items={orderConfirmationCrumbs()} className="mb-6" />
      {order.preview ? (
        <p role="note" className="mb-8 flex items-start gap-2.5 rounded-xl border border-warm/40 bg-warm-soft/25 px-4 py-3 text-sm text-ink">
          <FlaskConical aria-hidden className="mt-0.5 size-4 shrink-0 text-warm" />
          <span>
            <strong className="font-semibold">Development preview.</strong> No order was placed with the shop and nothing
            was charged. The reference below exists only in this browser tab.
          </span>
        </p>
      ) : null}

      {awaitingPayment && payment === "failed" ? (
        <p role="alert" className="mb-8 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-ink">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span>
            <strong className="font-semibold">The payment did not go through.</strong> Your order is still reserved, and you can
            try paying again.
          </span>
        </p>
      ) : null}
      {awaitingPayment && payment === "pending" ? (
        <p role="status" className="mb-8 flex items-start gap-2.5 rounded-xl border border-line-soft bg-cream px-4 py-3 text-sm text-ink">
          <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" />
          <span>
            <strong className="font-semibold">Your payment is being confirmed.</strong> This can take a few minutes. Please
            don&rsquo;t pay again yet; check this order in a little while.
          </span>
        </p>
      ) : null}

      <div className="text-center">
        <motion.span
          initial={reducedMotion ? false : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: EASE_PREMIUM_BEZIER }}
          className="mx-auto grid size-16 place-items-center rounded-full bg-sage-tint text-forest"
        >
          <Icon aria-hidden className="size-8" strokeWidth={1.6} />
        </motion.span>
        <h1 className="dh-title-section mt-6 text-ink">{headline.title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-muted-ink">{headline.lead}</p>
      </div>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: EASE_PREMIUM_BEZIER }}
        className="mt-10 overflow-hidden rounded-2xl border border-line-soft bg-paper shadow-soft"
      >
        <dl className="grid gap-x-6 gap-y-4 border-b border-line-soft p-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-ink">{order.preview ? "Preview reference" : "Order number"}</dt>
            <dd className="mt-0.5 font-semibold text-ink">{order.orderNumber}</dd>
          </div>
          <div>
            <dt className="text-muted-ink">Placed</dt>
            <dd className="mt-0.5 text-ink">{placed}</dd>
          </div>
          <div>
            <dt className="text-muted-ink">Payment</dt>
            <dd className="mt-0.5 text-ink">{order.payment.label}</dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-muted-ink">Delivering to</dt>
            <dd className="mt-0.5 text-ink">
              {order.deliverTo.name} · {order.deliverTo.place}
            </dd>
          </div>
        </dl>

        <div className="p-6">
          <h2 className="text-base font-semibold text-ink">
            {count} {count === 1 ? "item" : "items"}
          </h2>
          <ul className="mt-4 space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <ProductThumb imageUrl={item.imageUrl} name={item.productName} variant={item.variantTitle} brand={item.brandName} sizes="48px" className="size-12" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{item.productName}</span>
                  <span className="block text-xs text-muted-ink">
                    {[item.variantTitle, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="text-sm font-medium tabular-nums text-ink">{formatRupees(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t border-line-soft pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-ink">Items</dt>
              <dd className="tabular-nums text-ink">{formatRupees(order.totals.subtotal)}</dd>
            </div>
            {order.totals.couponDiscount > 0 ? (
              <div className="flex justify-between">
                <dt className="text-muted-ink">Coupon {order.totals.couponCode}</dt>
                <dd className="tabular-nums text-forest">−{formatRupees(order.totals.couponDiscount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-muted-ink">Delivery</dt>
              <dd className="tabular-nums text-ink">{order.totals.shipping === 0 ? "Free" : formatRupees(order.totals.shipping)}</dd>
            </div>
            {order.totals.codCharge > 0 ? (
              <div className="flex justify-between">
                <dt className="text-muted-ink">Pay-on-delivery charge</dt>
                <dd className="tabular-nums text-ink">{formatRupees(order.totals.codCharge)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-line/70 pt-3 text-base font-semibold">
              <dt className="text-ink">{order.payment.method === "COD" ? "To pay on delivery" : "Total"}</dt>
              <dd className="tabular-nums text-ink">{formatRupees(order.totals.total)}</dd>
            </div>
          </dl>
        </div>
      </motion.div>

      {payError ? (
        <p role="alert" className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-ink">
          {payError}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {awaitingPayment && order.canPay && payment !== "pending" ? (
          <Button variant="brand" size="xl" onClick={payAgain} disabled={paying} aria-busy={paying || undefined}>
            {paying ? <Loader2 aria-hidden className="motion-safe:animate-spin" /> : <CreditCard aria-hidden />}
            {paying ? "Opening payment…" : `Pay ${formatRupees(order.totals.total)} now`}
          </Button>
        ) : null}
        <Button asChild variant={awaitingPayment && order.canPay ? "brandOutline" : "brand"} size="xl">
          <Link href="/products">
            Continue shopping
            <ArrowRight aria-hidden />
          </Link>
        </Button>
        {/* The account order page reads the shop's orders; a preview is not one of them. */}
        {order.preview ? null : (
          <Button asChild variant="brandOutline" size="xl">
            <Link href={`/account/orders/${order.orderId}`}>View order</Link>
          </Button>
        )}
      </div>
    </Container>
  );
}
