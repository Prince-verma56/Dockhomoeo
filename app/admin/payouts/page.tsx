"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Wallet, RefreshCw, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface PayoutBatch {
  id: number;
  batchNumber: string;
  doctorName: string;
  consultationCount: number;
  amount: number;
  status: string;
  periodStart: string;
  periodEnd: string;
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const res = await api<{ items: PayoutBatch[] }>("/admin/payouts");
      setPayouts(res.items || []);
    } catch {
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  return (
    <AdminShell
      title="Doctor Payouts Desk"
      description="Weekly practitioner settlement batches, consultation earnings, and bank transfer exports."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="text-xs text-neutral-600">
            <span>Settlement Cycle: </span>
            <span className="font-semibold text-neutral-900">Weekly (Every Monday)</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadPayouts} className="h-10 text-xs gap-1.5">
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
            <Button size="sm" className="h-10 text-xs bg-[#0d5a43] hover:bg-[#093e2e] text-white gap-1.5 shadow-sm">
              <Download className="size-3.5" />
              <span>Export NEFT Bank Sheet</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-400">Loading payout records...</div>
          ) : payouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9faf9] border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Batch</th>
                    <th className="px-5 py-3.5">Doctor</th>
                    <th className="px-5 py-3.5">Completed Consultations</th>
                    <th className="px-5 py-3.5">Amount Owed</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/50">
                      <td className="px-5 py-3.5 font-mono font-semibold text-neutral-900">{p.batchNumber}</td>
                      <td className="px-5 py-3.5 font-semibold text-neutral-900">{p.doctorName}</td>
                      <td className="px-5 py-3.5 text-neutral-700">{p.consultationCount} sessions</td>
                      <td className="px-5 py-3.5 font-bold text-neutral-900">₹{p.amount.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center p-6">
              <Wallet className="size-10 text-neutral-300 stroke-1 mb-3" />
              <h3 className="text-sm font-semibold text-neutral-800">No pending doctor payouts</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                Completed consultations will be aggregated into settlement batches automatically every Monday.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
