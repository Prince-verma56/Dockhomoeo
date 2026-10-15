"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Plus, Search, Tags, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { AdminBrandItem } from "@/types/admin";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<AdminBrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadBrands = async () => {
    setLoading(true);
    try {
      const res = await api<{ items: AdminBrandItem[] }>("/admin/brands");
      setBrands(res.items || []);
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) || b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell
      title="Brand Directory"
      description="Manage trusted homoeopathic manufacturers (Schwabe, SBL, Dr. Reckeweg, etc.)."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search brands by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs bg-neutral-50/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadBrands} className="h-10 text-xs gap-1.5">
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
            <Button size="sm" className="h-10 text-xs bg-[#0d5a43] hover:bg-[#093e2e] text-white gap-1.5 shadow-sm">
              <Plus className="size-3.5" />
              <span>New Brand</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-400">Loading brands...</div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9faf9] border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Brand</th>
                    <th className="px-5 py-3.5">Slug</th>
                    <th className="px-5 py-3.5">Catalog Count</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/50">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-neutral-900">{item.name}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-neutral-500">/{item.slug}</td>
                      <td className="px-5 py-3.5 font-medium text-neutral-700">{item.productCount} medicines</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center p-6">
              <Tags className="size-10 text-neutral-300 stroke-1 mb-3" />
              <h3 className="text-sm font-semibold text-neutral-800">No brands found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                No manufacturers matching your query.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
