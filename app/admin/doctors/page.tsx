"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Stethoscope, RefreshCw, Check, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { AdminDoctorItem } from "@/types/admin";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<AdminDoctorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const res = await api<{ items: AdminDoctorItem[] }>("/admin/doctors", {
        query: { q: search || undefined },
      });
      setDoctors(res.items || []);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [search]);

  return (
    <AdminShell
      title="Doctors & Clinical Onboarding"
      description="Review physician credentials, license verifications, consulting streams, and video fees."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search doctors by name or stream..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs bg-neutral-50/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadDoctors} className="h-10 text-xs gap-1.5">
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-400">Loading doctor records...</div>
          ) : doctors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9faf9] border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Doctor</th>
                    <th className="px-5 py-3.5">Stream / Specialization</th>
                    <th className="px-5 py-3.5">Experience</th>
                    <th className="px-5 py-3.5">Fee</th>
                    <th className="px-5 py-3.5">Verification</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-neutral-50/50">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-neutral-900">{doc.displayName}</div>
                        <div className="text-[11px] text-neutral-500">{doc.qualification || "Practitioner"}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-neutral-800">{doc.stream}</div>
                        <div className="text-[11px] text-neutral-500">{doc.specialization || "General"}</div>
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600">
                        {doc.experienceYears ? `${doc.experienceYears} yrs` : "—"}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-neutral-900">
                        {doc.videoFee ? `₹${doc.videoFee}` : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={doc.verificationStatus} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="size-8 p-0 text-emerald-600 hover:bg-emerald-50" title="Approve Practitioner">
                            <Check className="size-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="size-8 p-0 text-rose-600 hover:bg-rose-50" title="Reject / Defer">
                            <X className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center p-6">
              <Stethoscope className="size-10 text-neutral-300 stroke-1 mb-3" />
              <h3 className="text-sm font-semibold text-neutral-800">No doctors registered</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                When physicians register through the doctor onboarding flow, their applications will arrive here for license review.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
