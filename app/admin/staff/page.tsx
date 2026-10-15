"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserCog, Plus, RefreshCw, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface StaffRow {
  id: number;
  name: string;
  email: string;
  role: string;
  roleName?: string;
  isActive: boolean;
  lastLoginAt?: string | null;
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await api<{ items: StaffRow[] }>("/admin/staff");
      setStaff(res.items || []);
    } catch {
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  return (
    <AdminShell
      title="Staff & Role Permissions"
      description="Manage administrative accounts, role permissions across the 16 ledger domains, and security access."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Shield className="size-4 text-[#0d5a43]" />
            <span>Role-Based Access Control (RBAC) enforced by backend permissions middleware.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadStaff} className="h-10 text-xs gap-1.5">
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
            <Button size="sm" className="h-10 text-xs bg-[#0d5a43] hover:bg-[#093e2e] text-white gap-1.5 shadow-sm">
              <Plus className="size-3.5" />
              <span>Add Staff Member</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-400">Loading staff accounts...</div>
          ) : staff.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9faf9] border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Staff Name</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {staff.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-50/50">
                      <td className="px-5 py-3.5 font-semibold text-neutral-900">{s.name}</td>
                      <td className="px-5 py-3.5 text-neutral-600">{s.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-neutral-800">{s.roleName || s.role}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={s.isActive ? "ACTIVE" : "INACTIVE"} />
                      </td>
                      <td className="px-5 py-3.5 text-neutral-500">
                        {s.lastLoginAt
                          ? new Date(s.lastLoginAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center p-6">
              <UserCog className="size-10 text-neutral-300 stroke-1 mb-3" />
              <h3 className="text-sm font-semibold text-neutral-800">Staff accounts staged</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                The super admin account is configured in the backend environment variables.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
