"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Plus, Search, Filter, RefreshCw, Package, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { AdminProductItem } from "@/types/admin";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api<{ items: AdminProductItem[]; total: number }>("/admin/products", {
        query: { q: search || undefined },
      });
      setProducts(res.items || []);
    } catch {
      // Empty fallback for initial DB
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  return (
    <AdminShell
      title="Medicines & Catalog"
      description="Manage remedies, dilutions, potencies, stock inventory and retail/wholesale pricing."
    >
      <div className="space-y-6">
        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search products by title, SKU, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs bg-neutral-50/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadProducts}
              className="h-10 text-xs gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              className="h-10 text-xs bg-[#0d5a43] hover:bg-[#093e2e] text-white gap-1.5 shadow-sm"
            >
              <Plus className="size-3.5" />
              <span>Add Medicine</span>
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-400">Loading catalog items...</div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9faf9] border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-5 py-3.5">Form</th>
                    <th className="px-5 py-3.5">SKU</th>
                    <th className="px-5 py-3.5">Stock</th>
                    <th className="px-5 py-3.5">Price</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/50">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-neutral-900">{item.name}</div>
                        <div className="text-[11px] text-neutral-500">{item.brandName || "General"}</div>
                      </td>
                      <td className="px-5 py-3.5 capitalize text-neutral-600">{item.form}</td>
                      <td className="px-5 py-3.5 font-mono text-neutral-500">{item.sku || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className={item.stock <= 5 ? "text-amber-600 font-bold" : "text-neutral-700"}>
                          {item.stock} in stock
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-neutral-900">
                        ₹{item.price.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button variant="ghost" size="sm" className="size-8 p-0 text-neutral-400 hover:text-neutral-900">
                          <Edit className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center p-6">
              <Package className="size-10 text-neutral-300 stroke-1 mb-3" />
              <h3 className="text-sm font-semibold text-neutral-800">No products found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1 mb-4">
                No items matching your search or no medicines currently staged in the catalog.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
