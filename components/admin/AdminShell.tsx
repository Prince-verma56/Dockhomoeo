"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useAdminSession } from "@/hooks/use-admin-session";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AdminShell({ children, title, description }: AdminShellProps) {
  const router = useRouter();
  const { user, loading, error, signOut } = useAdminSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-600">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-[#0d5a43] animate-spin" />
          <p className="text-sm font-medium">Verifying staff credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center">
          <div className="size-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
            <ShieldAlert className="size-6" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 mb-1">Staff Authentication Required</h2>
          <p className="text-sm text-neutral-600 mb-6">
            You must be signed in with an authorized staff account to access the administration panel.
          </p>
          <div className="flex gap-3 w-full">
            <Button
              className="flex-1 bg-[#0d5a43] hover:bg-[#093e2e]"
              onClick={() => router.push("/admin/login")}
            >
              Sign In to Admin
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] text-neutral-900 font-sans">
      <AdminSidebar user={user} onSignOut={signOut} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} title={title} description={description} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
