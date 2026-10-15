"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Boxes, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface InventoryRow {
  id: number;
  productName: string;
  variantTitle: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  sellingPrice: number;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api<{ items: InventoryRow[] }>("/admin/inventory", {
        query: { q: search || undefined },
      });
      setItems(res.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [search]);

  return (
    <AdminShell
      title="Stock & Inventory Desk"
      description="Monitor active remedy batches, pack availability, and low-stock replenishment alerts."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search inventory by title or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs bg-neutral-50/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadInventory} className="h-10 text-xs gap-1.5">
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-400">Loading inventory data...</div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9faf9] border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Medicine / Remedy</th>
                    <th className="px-5 py-3.5">Pack / Variant</th>
                    <th className="px-5 py-3.5">SKU</th>
                    <th className="px-5 py-3.5">Available Units</th>
                    <th className="px-5 py-3.5">Unit Price</th>
                    <th className="px-5 py-3.5">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {items.map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-50/50">
                      <td className="px-5 py-3.5 font-semibold text-neutral-900">{row.productName}</td>
                      <td className="px-5 py-3.5 text-neutral-600">{row.variantTitle}</td>
                      <td className="px-5 py-3.5 font-mono text-neutral-500">{row.sku}</td>
                      <td className="px-5 py-3.5 font-bold text-neutral-900">{row.stockQuantity}</td>
                      <td className="px-5 py-3.5 font-medium text-neutral-800">
                        ₹{row.sellingPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5">
                        {row.stockQuantity <= 0 ? (
                          <StatusBadge status="OUT_OF_STOCK" />
                        ) : row.stockQuantity <= 5 ? (
                          <StatusBadge status="LOW_STOCK" label={`Low (${row.stockQuantity})`} />
                        ) : (
                          <StatusBadge status="ACTIVE" label="Optimal" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center p-6">
              <Boxes className="size-10 text-neutral-300 stroke-1 mb-3" />
              <h3 className="text-sm font-semibold text-neutral-800">No inventory entries</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                Stock items and pack size batches will appear here once products are created.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
