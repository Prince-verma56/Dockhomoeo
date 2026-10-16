"use client";

import Link from "next/link";
import { ChevronRight, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountEmpty, AccountError, AccountLoading, AccountPageHeader, StatusPill, panelClass } from "@/components/account/AccountStates";
import { ProductThumb } from "@/components/commerce/ProductThumb";
import { repositories } from "@/lib/repositories";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { orderStatus } from "@/lib/account/orderStatus";
import { formatRupees } from "@/lib/formatters/price";
import { formatDate, cn } from "@/lib/utils";

const loadOrders = () => repositories.account.getOrders();

/** The customer's orders (GET /api/me/orders, the latest 50), newest first. */
export default function OrdersPage() {
  const { state, reload } = useAsyncData(loadOrders);

  return (
    <div>
      <AccountPageHeader title="My orders" description="Every order placed with this account, newest first." />

      {state.status === "loading" ? <AccountLoading rows={3} label="Loading your orders…" /> : null}
      {state.status === "error" ? <AccountError message={state.message} onRetry={reload} /> : null}

      {state.status === "ready" && state.data.length === 0 ? (
        <AccountEmpty
          icon={<Package aria-hidden className="size-6" strokeWidth={1.6} />}
          title="No orders yet"
          action={
            <Button asChild variant="brand" size="xl">
              <Link href="/products">Browse remedies</Link>
            </Button>
          }
        >
          When you place an order it will appear here with its status and delivery updates.
        </AccountEmpty>
      ) : null}

      {state.status === "ready" && state.data.length > 0 ? (
        <ul className="space-y-4">
          {state.data.map((order) => {
            const status = orderStatus(order.status);
            const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const first = order.items[0];
            const tracking = order.shipments[0];
            return (
              <li key={order.id} className={cn(panelClass, "transition-[border-color,box-shadow] hover:border-forest/30 hover:shadow-soft")}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center gap-4 rounded-[1.5rem] p-5 focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none sm:p-6"
                >
                  <ProductThumb imageUrl={first?.imageUrl ?? null} name={first?.productName ?? order.orderNumber} variant={first?.variantTitle} className="size-14 sm:size-16" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{order.orderNumber}</span>
                      <StatusPill {...status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-ink">
                      {first ? first.productName : "Order"}
                      {order.items.length > 1 ? ` and ${order.items.length - 1} more` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-ink">
                      Placed {formatDate(order.placedAt)} · {count} {count === 1 ? "item" : "items"}
                      {order.prescription ? ` · Prescription ${order.prescription.prescriptionNumber}` : ""}
                    </p>
                    {tracking?.trackingNumber ? (
                      <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-forest">
                        <Truck aria-hidden className="size-3.5" />
                        {tracking.carrier ? `${tracking.carrier} · ` : ""}
                        {tracking.trackingNumber}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-semibold text-ink tabular-nums">{formatRupees(order.grandTotal)}</span>
                    <ChevronRight aria-hidden className="size-4 text-muted-ink" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
