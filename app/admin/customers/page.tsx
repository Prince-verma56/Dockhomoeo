"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Search, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface CustomerRow {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
  orderCount?: number;
  rewardPoints: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api<{ items: CustomerRow[] }>("/admin/customers", {
        query: { q: search || undefined },
      });
      setCustomers(res.items || []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  return (
    <AdminShell
      title="Customers & Patients"
      description="View patient registry, order history, contact numbers, and loyalty points."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search customers by name, phone or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs bg-neutral-50/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadCustomers} className="h-10 text-xs gap-1.5">
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-400">Loading customers...</div>
          ) : customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9faf9] border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Customer Name</th>
                    <th className="px-5 py-3.5">Mobile Number</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Reward Points</th>
                    <th className="px-5 py-3.5">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50/50">
                      <td className="px-5 py-3.5 font-semibold text-neutral-900">
                        {[c.firstName, c.lastName].filter(Boolean).join(" ") || "Customer"}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-700">{c.phone || "—"}</td>
                      <td className="px-5 py-3.5 text-neutral-600">{c.email || "—"}</td>
                      <td className="px-5 py-3.5 font-semibold text-emerald-700">{c.rewardPoints} pts</td>
                      <td className="px-5 py-3.5 text-neutral-500">
                        {new Date(c.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center p-6">
              <Users className="size-10 text-neutral-300 stroke-1 mb-3" />
              <h3 className="text-sm font-semibold text-neutral-800">No customers found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                Patients signing in with mobile OTP will be registered in this directory automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
