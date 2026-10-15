"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { repositories } from "@/lib/repositories";
import { ApiOrderSummary } from "@/types/api/account";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await repositories.account.getOrders();
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[2rem] bg-white border border-forest-abyss/5">
        <Loader2 className="size-8 animate-spin text-forest-deep" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">My Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-paper border border-line-soft p-14 text-center shadow-soft">
          <div className="rounded-full bg-sage-wash p-4 mb-4 text-forest-deep">
            <Package className="size-8 text-forest" />
          </div>
          <h3 className="font-display text-xl font-bold text-ink">No orders yet</h3>
          <p className="mt-2 text-muted-ink max-w-md text-sm">
            Looks like you haven&rsquo;t placed any orders yet. Start exploring our natural remedies.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-forest px-8 text-sm font-semibold text-cream shadow-xs hover:bg-forest-deep transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl bg-paper p-6 shadow-soft border border-line-soft hover:border-forest/30 hover:shadow-lift transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-sage-wash p-3 text-forest-deep mt-1 sm:mt-0">
                  <Package className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink">{order.orderNumber}</span>
                    <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"} className="rounded-md">
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-ink">
                    <span>{formatDate(order.placedAt)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-semibold text-ink">{formatCurrency(order.grandTotal)}</span>
                  </div>
                </div>
              </div>
              <div className="flex w-full md:w-auto items-center gap-2 pt-2 md:pt-0">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex-1 md:flex-none inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line-soft bg-paper px-4 text-sm font-medium text-ink hover:border-forest/40 hover:text-forest transition-colors shadow-2xs"
                >
                  <Eye className="size-4 text-muted-ink" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
