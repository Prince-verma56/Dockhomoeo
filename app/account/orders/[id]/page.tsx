"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Package,
  RotateCcw,
  SearchX,
  XCircle,
} from "lucide-react";
import { repositories } from "@/lib/repositories";
import { formatRupees } from "@/lib/formatters/price";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductThumb } from "@/components/commerce/ProductThumb";
import { AccountError, StatusPill } from "@/components/account/AccountStates";
import { PAYMENT_METHOD_LABELS, orderStatus, paymentStatusLabel } from "@/lib/account/orderStatus";
import { describeError } from "@/lib/api";
import { OrderTimeline } from "@/components/account/orders/OrderTimeline";
import { OrderCancelDialog } from "@/components/account/orders/OrderCancelDialog";
import { OrderReturnSheet } from "@/components/account/orders/OrderReturnSheet";
import { OrderInvoiceModal } from "@/components/account/orders/OrderInvoiceModal";
import type { ApiOrderDetail } from "@/types/api/cart";

/**
 * Enhanced Order Details Page with Tracking Timeline, Invoice preview,
 * Cancellation dialog, and Return/Replacement requisition flow.
 */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number.parseInt(id, 10);
  const validId = Number.isInteger(orderId) && orderId > 0;
  const [state, setState] = useState<
    { status: "loading" } | { status: "missing" } | { status: "error"; message: string } | { status: "ready"; order: ApiOrderDetail }
  >({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  // Dialog & Sheet states
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

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
      <div role="status" className="flex h-64 items-center justify-center rounded-[2rem] border border-line-soft bg-paper">
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
      <div className="flex flex-col items-center rounded-[2rem] border border-line-soft bg-paper p-12 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-sage-wash text-forest-deep">
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
  const isCancelled = order.status.toUpperCase() === "CANCELLED";
  const isDelivered = order.status.toUpperCase() === "DELIVERED";

  return (
    <div className="space-y-6">
      {/* Top Navigation & Header */}
      <div>
        <Link
          href="/account/orders"
          className="mb-4 inline-flex items-center text-sm font-medium text-muted-ink transition-colors hover:text-forest-deep"
        >
          <ArrowLeft aria-hidden className="mr-2 size-4" />
          Back to orders
        </Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Order #{order.orderNumber}
            </h2>
            <p className="mt-1 text-sm text-muted-ink">
              Placed on {formatDate(order.placedAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInvoiceOpen(true)}
              className="h-8 gap-1.5 rounded-xl border-line-soft text-xs text-ink hover:text-forest-deep"
            >
              <FileText className="size-3.5" />
              Tax Invoice
            </Button>

            {!isCancelled && (
              <>
                {order.canCancel && !isDelivered ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCancelOpen(true)}
                    className="h-8 gap-1.5 rounded-xl border-red-200 text-xs text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <XCircle className="size-3.5" />
                    Cancel Order
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReturnOpen(true)}
                    className="h-8 gap-1.5 rounded-xl border-line-soft text-xs text-forest-deep hover:bg-forest/5"
                  >
                    <RotateCcw className="size-3.5" />
                    Return / Replace
                  </Button>
                )}
              </>
            )}

            <StatusPill {...orderStatus(order.status)} className="h-8 px-3 text-sm" />
          </div>
        </div>
      </div>

      {/* Fulfillment Timeline */}
      <OrderTimeline order={order} />

      {/* Order Detail Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items List */}
        <section aria-labelledby="items-heading" className="rounded-[1.75rem] border border-line-soft bg-paper p-6 sm:p-7 shadow-xs lg:col-span-2">
          <h3 id="items-heading" className="mb-5 flex items-center font-display text-lg font-semibold text-ink">
            <Package aria-hidden className="mr-2 size-5 text-forest-deep" />
            {count} {count === 1 ? "remedy item" : "remedy items"}
          </h3>
          <ul className="divide-y divide-line-soft">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                <ProductThumb
                  imageUrl={item.imageUrl}
                  name={item.productName}
                  variant={item.variantTitle}
                  brand={item.brandName}
                  className="size-16 rounded-xl"
                />
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row">
                  <div className="min-w-0">
                    {item.brandName ? (
                      <p className="text-[0.6875rem] font-semibold tracking-wider text-muted-ink uppercase">
                        {item.brandName}
                      </p>
                    ) : null}
                    <p className="font-semibold text-ink">
                      {item.slug ? (
                        <Link href={`/product/${item.slug}`} className="hover:text-forest-deep transition-colors">
                          {item.productName}
                        </Link>
                      ) : (
                        item.productName
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-ink">
                      {[item.variantTitle, `Qty ${item.quantity}`, `${formatRupees(item.unitPrice)} each`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <p className="font-semibold text-ink tabular-nums sm:text-right">
                    {formatRupees(item.lineTotal)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Right Sidebar: Summary, Address, Payment */}
        <div className="space-y-6">
          {/* Summary Box */}
          <section aria-labelledby="summary-heading" className="rounded-[1.75rem] border border-line-soft bg-paper p-6 shadow-xs">
            <h3 id="summary-heading" className="mb-4 font-display text-lg font-semibold text-ink">
              Summary
            </h3>
            <dl className="space-y-2.5 text-sm text-muted-ink">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-medium text-ink tabular-nums">{formatRupees(order.subtotal)}</dd>
              </div>
              {order.couponDiscount > 0 ? (
                <div className="flex justify-between">
                  <dt>Coupon {order.couponCode}</dt>
                  <dd className="text-forest-deep font-medium tabular-nums">−{formatRupees(order.couponDiscount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd className="font-medium text-ink tabular-nums">
                  {order.shippingCharge === 0 ? "Free" : formatRupees(order.shippingCharge)}
                </dd>
              </div>
              {order.codCharge > 0 ? (
                <div className="flex justify-between">
                  <dt>Pay-on-delivery fee</dt>
                  <dd className="font-medium text-ink tabular-nums">{formatRupees(order.codCharge)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-line-soft pt-3 text-base font-bold text-ink">
                <dt>Total</dt>
                <dd className="tabular-nums text-forest-deep">{formatRupees(order.grandTotal)}</dd>
              </div>
            </dl>
          </section>

          {/* Delivery Address */}
          <section aria-labelledby="address-heading" className="rounded-[1.75rem] border border-line-soft bg-paper p-6 shadow-xs">
            <h3 id="address-heading" className="mb-3 flex items-center font-display text-lg font-semibold text-ink">
              <MapPin aria-hidden className="mr-2 size-5 text-forest-deep" />
              Delivery address
            </h3>
            <address className="space-y-0.5 text-sm text-muted-ink not-italic">
              <p className="font-medium text-ink">{order.customerName}</p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.shippingCity}, {order.shippingState} {order.shippingPincode}
              </p>
              {order.customerPhone && <p className="text-xs pt-1">Tel: {order.customerPhone}</p>}
            </address>
          </section>

          {/* Payment Method */}
          <section aria-labelledby="payment-heading" className="rounded-[1.75rem] border border-line-soft bg-paper p-6 shadow-xs">
            <h3 id="payment-heading" className="mb-3 flex items-center font-display text-lg font-semibold text-ink">
              <CreditCard aria-hidden className="mr-2 size-5 text-forest-deep" />
              Payment
            </h3>
            <p className="text-sm text-muted-ink">
              {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod} ·{" "}
              <span className="font-medium text-ink">{paymentStatusLabel(order.paymentStatus)}</span>
            </p>
          </section>
        </div>
      </div>

      {/* Interactive Dialogs & Sheets */}
      <OrderCancelDialog
        order={order}
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
      />

      <OrderReturnSheet
        order={order}
        open={isReturnOpen}
        onOpenChange={setIsReturnOpen}
      />

      <OrderInvoiceModal
        order={order}
        open={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
      />
    </div>
  );
}
