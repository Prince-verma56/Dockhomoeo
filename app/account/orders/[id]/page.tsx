"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Loader2, MapPin, Package, SearchX } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { formatRupees } from "@/lib/formatters/price";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductThumb } from "@/components/commerce/ProductThumb";
import { AccountError, StatusPill } from "@/components/account/AccountStates";
import { PAYMENT_METHOD_LABELS, orderStatus, paymentStatusLabel } from "@/lib/account/orderStatus";
import { describeError } from "@/lib/api";
import type { ApiOrderDetail } from "@/types/api/cart";

/**
 * One of the customer's orders (GET /api/me/orders/:id). A 404 from the
 * backend (not this customer's order, or no such order) shows "not found";
 * any other failure offers a retry.
 */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number.parseInt(id, 10);
  const validId = Number.isInteger(orderId) && orderId > 0;
  const [state, setState] = useState<
    { status: "loading" } | { status: "missing" } | { status: "error"; message: string } | { status: "ready"; order: ApiOrderDetail }
  >({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!validId) return;
    let active = true;
    repositories.account
      .getOrderById(orderId)
      .then((order) => active && setState(order ? { status: "ready", order } : { status: "missing" }))
      .catch((error: unknown) => active && setState({ status: "error", message: describeError(error, "We could not load this order.") }));
    return () => {
      active = false;
    };
  }, [orderId, validId, attempt]);

  if (state.status === "loading" && validId) {
    return (
      <div role="status" className="flex h-64 items-center justify-center rounded-[2rem] border border-line/70 bg-cream">
        <Loader2 aria-hidden className="size-7 animate-spin text-forest" />
        <span className="sr-only">Loading order…</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <AccountError
        message={state.message}
        onRetry={() => {
          setState({ status: "loading" });
          setAttempt((n) => n + 1);
        }}
      />
    );
  }

  if (state.status !== "ready") {
    return (
      <div className="flex flex-col items-center rounded-[2rem] border border-line/70 bg-cream p-12 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-sage-tint text-forest">
          <SearchX aria-hidden className="size-6" strokeWidth={1.6} />
        </span>
        <h2 className="mt-5 font-display text-xl text-ink">We couldn’t find that order</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-ink">It may belong to another account, or the link is incomplete.</p>
        <Button asChild variant="brand" size="xl" className="mt-6">
          <Link href="/account/orders">Back to my orders</Link>
        </Button>
      </div>
    );
  }

  const { order } = state;
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/account/orders" className="mb-4 inline-flex items-center text-sm font-medium text-muted-ink transition-colors hover:text-forest">
          <ArrowLeft aria-hidden className="mr-2 size-4" />
          Back to orders
        </Link>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl text-ink">Order {order.orderNumber}</h2>
            <p className="mt-1 text-sm text-muted-ink">Placed on {formatDate(order.placedAt)}</p>
          </div>
          <StatusPill {...orderStatus(order.status)} className="h-7 px-3 text-sm" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="items-heading" className="rounded-[1.75rem] border border-line/70 bg-cream p-6 sm:p-7 lg:col-span-2">
          <h3 id="items-heading" className="mb-5 flex items-center font-display text-lg text-ink">
            <Package aria-hidden className="mr-2 size-5 text-forest" />
            {count} {count === 1 ? "item" : "items"}
          </h3>
          <ul className="divide-y divide-line/70">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                <ProductThumb imageUrl={item.imageUrl} name={item.productName} variant={item.variantTitle} brand={item.brandName} className="size-16" />
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row">
                  <div className="min-w-0">
                    {item.brandName ? <p className="text-[0.6875rem] font-semibold tracking-wider text-muted-ink uppercase">{item.brandName}</p> : null}
                    <p className="font-semibold text-ink">
                      {item.slug ? (
                        <Link href={`/product/${item.slug}`} className="hover:text-forest">
                          {item.productName}
                        </Link>
                      ) : (
                        item.productName
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-ink">
                      {[item.variantTitle, `Qty ${item.quantity}`, `${formatRupees(item.unitPrice)} each`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <p className="font-semibold text-ink tabular-nums sm:text-right">{formatRupees(item.lineTotal)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section aria-labelledby="summary-heading" className="rounded-[1.75rem] border border-line/70 bg-cream p-6">
            <h3 id="summary-heading" className="mb-4 font-display text-lg text-ink">Summary</h3>
            <dl className="space-y-2.5 text-sm text-muted-ink">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-medium text-ink tabular-nums">{formatRupees(order.subtotal)}</dd>
              </div>
              {order.couponDiscount > 0 ? (
                <div className="flex justify-between">
                  <dt>Coupon {order.couponCode}</dt>
                  <dd className="text-forest tabular-nums">−{formatRupees(order.couponDiscount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd className="font-medium text-ink tabular-nums">{order.shippingCharge === 0 ? "Free" : formatRupees(order.shippingCharge)}</dd>
              </div>
              {order.codCharge > 0 ? (
                <div className="flex justify-between">
                  <dt>Pay-on-delivery fee</dt>
                  <dd className="font-medium text-ink tabular-nums">{formatRupees(order.codCharge)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-line/70 pt-3 text-base font-semibold text-ink">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatRupees(order.grandTotal)}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="address-heading" className="rounded-[1.75rem] border border-line/70 bg-cream p-6">
            <h3 id="address-heading" className="mb-3 flex items-center font-display text-lg text-ink">
              <MapPin aria-hidden className="mr-2 size-5 text-forest" />
              Delivery address
            </h3>
            <address className="space-y-0.5 text-sm text-muted-ink not-italic">
              <p className="font-medium text-ink">{order.customerName}</p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.shippingCity}, {order.shippingState} {order.shippingPincode}
              </p>
            </address>
          </section>

          <section aria-labelledby="payment-heading" className="rounded-[1.75rem] border border-line/70 bg-cream p-6">
            <h3 id="payment-heading" className="mb-3 flex items-center font-display text-lg text-ink">
              <CreditCard aria-hidden className="mr-2 size-5 text-forest" />
              Payment
            </h3>
            <p className="text-sm text-muted-ink">
              {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod} ·{" "}
              <span className="font-medium text-ink">{paymentStatusLabel(order.paymentStatus)}</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
