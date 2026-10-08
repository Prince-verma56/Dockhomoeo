"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { repositories } from "@/lib/repositories";
import { ApiOrderSummary } from "@/types/api/account";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Eye, FileText } from "lucide-react";
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
        <div className="flex flex-col items-center justify-center rounded-[2rem] bg-white border border-forest-abyss/5 p-16 text-center shadow-sm">
          <div className="rounded-full bg-forest-abyss/5 p-4 mb-4">
            <Package className="size-8 text-muted-ink" />
          </div>
          <h3 className="font-display text-xl font-bold text-ink">No orders yet</h3>
          <p className="mt-2 text-muted-ink max-w-md">
            Looks like you haven't placed any orders yet. Start exploring our natural remedies.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-forest-deep px-8 text-sm font-semibold text-white shadow-sm hover:bg-forest-abyss transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[2rem] bg-white p-6 shadow-sm border border-forest-abyss/5 hover:border-forest-deep/20 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-forest-deep/5 p-3 text-forest-deep mt-1 sm:mt-0">
                  <Package className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink">{order.orderNumber}</span>
                    <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"} className="rounded-md">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-ink">
                    <span>{formatDate(order.placedAt)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-semibold text-ink">{formatCurrency(order.grandTotal)}</span>
                  </div>
                </div>
              </div>
              <div className="flex w-full sm:w-auto items-center gap-2 pt-2 sm:pt-0">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-forest-abyss/10 bg-white px-4 text-sm font-medium text-ink hover:bg-black/5 hover:border-transparent transition-colors"
                >
                  <Eye className="size-4 text-muted-ink" />
                  View Details
                </Link>
                {order.status === "DELIVERED" && (
                  <button className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-forest-abyss/10 bg-white px-4 text-sm font-medium text-ink hover:bg-black/5 hover:border-transparent transition-colors">
                    <FileText className="size-4 text-muted-ink" />
                    Invoice
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
