"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, ShoppingCart, RefreshCw, Eye, Truck, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { AdminOrderItem } from "@/types/admin";

const STATUS_TABS = [
  { label: "All Orders", value: "" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Packed", value: "PACKED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api<{ items: AdminOrderItem[]; total: number }>("/admin/orders", {
        query: {
          status: activeTab || undefined,
          q: search || undefined,
        },
      });
      setOrders(res.items || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab, search]);

  return (
    <AdminShell
      title="Orders Desk"
      description="Track fulfillment, customer packing, courier dispatch, and payments."
    >
      <div className="space-y-6">
        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 border-b border-neutral-200">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.value
                  ? "bg-[#0d5a43] text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by order number or customer phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs bg-neutral-50/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadOrders} className="h-10 text-xs gap-1.5">
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-400">Loading order records...</div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9faf9] border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Order Number</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Date Placed</th>
                    <th className="px-5 py-3.5">Payment</th>
                    <th className="px-5 py-3.5">Fulfillment Status</th>
                    <th className="px-5 py-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/50">
                      <td className="px-5 py-3.5 font-semibold text-neutral-900 font-mono">
                        {item.orderNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-neutral-800">{item.customerName}</div>
                        <div className="text-[11px] text-neutral-500">{item.customerPhone || "—"}</div>
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600">
                        {new Date(item.placedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-neutral-700">{item.paymentMethod}</span>
                        <span className="text-[11px] text-neutral-500 block uppercase">{item.paymentStatus}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-neutral-900">
                        ₹{item.grandTotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center p-6">
              <ShoppingCart className="size-10 text-neutral-300 stroke-1 mb-3" />
              <h3 className="text-sm font-semibold text-neutral-800">No orders found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                No orders matching the selected filter or status criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
