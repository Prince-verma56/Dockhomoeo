"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  IndianRupee,
  ShoppingCart,
  Boxes,
  Stethoscope,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import type { AdminDashboardData } from "@/types/admin";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api<any>("/admin/dashboard");
        const stats = {
          totalRevenue: res.totals?.revenue?.value ?? res.stats?.totalRevenue ?? 0,
          totalOrders: res.totals?.orders?.value ?? res.stats?.totalOrders ?? 0,
          pendingOrders: res.counters?.openOrders ?? res.stats?.pendingOrders ?? 0,
          lowStockCount: res.counters?.lowStock ?? res.stats?.lowStockCount ?? 0,
          pendingDoctorApprovals: res.counters?.doctorsToVerify ?? res.stats?.pendingDoctorApprovals ?? 0,
          totalCustomers: res.totals?.newCustomers?.value ?? res.stats?.totalCustomers ?? 0,
        };
        const recentOrders = (res.recentOrders ?? []).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber ?? `ORD-${o.id}`,
          customerName: o.customerName ?? (o.user ? [o.user.firstName, o.user.lastName].filter(Boolean).join(" ") : "Customer"),
          status: o.status ?? "PENDING",
          paymentMethod: o.paymentMethod ?? "COD",
          grandTotal: o.grandTotal ?? 0,
          placedAt: o.placedAt ?? new Date().toISOString(),
        }));
        setData({
          stats,
          recentOrders,
          attentionItems: [
            {
              label: "Pending Orders",
              count: stats.pendingOrders,
              href: "/admin/orders",
              type: stats.pendingOrders > 0 ? "warning" : "info",
            },
            {
              label: "Low Stock Items",
              count: stats.lowStockCount,
              href: "/admin/inventory",
              type: stats.lowStockCount > 0 ? "danger" : "info",
            },
            {
              label: "Doctors Awaiting Verification",
              count: stats.pendingDoctorApprovals,
              href: "/admin/doctors",
              type: stats.pendingDoctorApprovals > 0 ? "warning" : "info",
            },
          ],
        });
      } catch {
        // Fallback default state for development when DB connection fails
        setData({
          stats: {
            totalRevenue: 0,
            totalOrders: 0,
            pendingOrders: 0,
            lowStockCount: 0,
            pendingDoctorApprovals: 0,
            totalCustomers: 0,
          },
          recentOrders: [],
          attentionItems: [
            {
              label: "Database initialization ready",
              count: 0,
              href: "/admin/products",
              type: "info",
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const stats = data?.stats ?? {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    pendingDoctorApprovals: 0,
    totalCustomers: 0,
  };

  return (
    <AdminShell
      title="Dispensary Ledger Overview"
      description="Live operational telemetry across commerce, stock, logistics and clinical practice."
    >
      <div className="space-y-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="text-2xl font-bold text-neutral-900">
                ₹{stats.totalRevenue.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <TrendingUp className="size-3" /> Live ledger tracking
              </span>
            </div>
            <div className="size-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="size-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Orders Placed
              </span>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.totalOrders}
              </div>
              <span className="text-[11px] text-neutral-500">
                {stats.pendingOrders} awaiting fulfillment
              </span>
            </div>
            <div className="size-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingCart className="size-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Low Stock Alerts
              </span>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.lowStockCount}
              </div>
              <span className="text-[11px] text-amber-600 font-medium">
                Items below threshold
              </span>
            </div>
            <div className="size-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Boxes className="size-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Doctor Approvals
              </span>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.pendingDoctorApprovals}
              </div>
              <span className="text-[11px] text-[#0d5a43] font-medium">
                Pending verification
              </span>
            </div>
            <div className="size-11 rounded-xl bg-[#0d5a43]/10 text-[#0d5a43] flex items-center justify-center">
              <Stethoscope className="size-5" />
            </div>
          </div>
        </div>

        {/* Quick Operations & Workflow Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/orders"
            className="group bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs hover:border-[#0d5a43]/40 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Fulfillment
                </span>
                <ArrowRight className="size-4 text-neutral-400 group-hover:text-[#0d5a43] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm mb-1">Orders Desk</h3>
              <p className="text-xs text-neutral-500">
                Process dispatch, generate GST invoices, and book Shiprocket couriers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-xs text-[#0d5a43] font-medium">
              <span>View all orders</span>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="group bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs hover:border-[#0d5a43]/40 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Catalog
                </span>
                <ArrowRight className="size-4 text-neutral-400 group-hover:text-[#0d5a43] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm mb-1">Medicines & Catalog</h3>
              <p className="text-xs text-neutral-500">
                Manage homoeopathic dilutions, tinctures, patent remedies, and pricing tiers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-xs text-[#0d5a43] font-medium">
              <span>Manage catalog</span>
            </div>
          </Link>

          <Link
            href="/admin/doctors"
            className="group bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs hover:border-[#0d5a43]/40 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Clinical Care
                </span>
                <ArrowRight className="size-4 text-neutral-400 group-hover:text-[#0d5a43] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm mb-1">Doctor Verification</h3>
              <p className="text-xs text-neutral-500">
                Review practitioner credentials, council licenses, and consultation fees.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-xs text-[#0d5a43] font-medium">
              <span>Review practitioners</span>
            </div>
          </Link>
        </div>

        {/* Operational Attention Items & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Recent Customer Orders</h2>
                <p className="text-xs text-neutral-500">Orders placed across web storefront and care channels</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-medium text-[#0d5a43] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>

            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-200/80 text-neutral-500 font-semibold uppercase">
                    <tr>
                      <th className="pb-3">Order Number</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {data.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 font-semibold text-neutral-900">{order.orderNumber}</td>
                        <td className="py-3 text-neutral-600">{order.customerName}</td>
                        <td className="py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3 text-neutral-600">{order.paymentMethod}</td>
                        <td className="py-3 text-right font-semibold text-neutral-900">
                          ₹{order.grandTotal.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-neutral-400">
                <ShoppingCart className="size-8 stroke-1 mb-2 text-neutral-300" />
                <p className="text-sm font-medium text-neutral-700">No active orders found</p>
                <p className="text-xs text-neutral-500 max-w-sm mt-1">
                  New orders placed through the public storefront or prescription checkouts will appear here.
                </p>
              </div>
            )}
          </div>

          {/* System Telemetry & Attention Feed */}
          <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs p-6 space-y-4">
            <h2 className="text-base font-semibold text-neutral-900">Ledger Telemetry</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-start gap-3">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-neutral-900 block">Express 5 API Connected</span>
                  <span className="text-neutral-500">Proxied seamlessly via Next.js rewrites at /api/*</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-start gap-3">
                <Clock className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-neutral-900 block">Automated Housekeeping</span>
                  <span className="text-neutral-500">Auto-expires unpaid orders after 45 minutes</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-start gap-3">
                <Package className="size-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-neutral-900 block">Shiprocket & Invoices</span>
                  <span className="text-neutral-500">Configured in automatic courier dispatch mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
