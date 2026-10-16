"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useAdminSession } from "@/hooks/use-admin-session";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { canAccess } from "@/lib/admin/access";
import type { AdminArea, SessionStaffUser } from "@/types/admin";

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  /**
   * The area this page belongs to. Without "view" on it the page explains
   * the role's limit instead of showing requests the backend would refuse.
   */
  area?: AdminArea;
}

interface AdminContextValue {
  user: SessionStaffUser;
  can: (area: AdminArea, level: "view" | "manage") => boolean;
}

const AdminContext = createContext<AdminContextValue | null>(null);

/** The signed-in staff member and their permissions, for content inside AdminShell. */
export function useAdmin(): AdminContextValue {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside AdminShell");
  return value;
}

export function AdminShell({ children, title, description, area }: AdminShellProps) {
  const router = useRouter();
  const { user, loading, signOut } = useAdminSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-600">
        <div role="status" className="flex flex-col items-center gap-3">
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

  const context: AdminContextValue = { user, can: (a, level) => canAccess(user, a, level) };
  const allowed = !area || context.can(area, "view");

  return (
    <AdminContext.Provider value={context}>
      <div className="flex min-h-screen bg-[#f3f4f6] text-neutral-900 font-sans">
        <AdminSidebar user={user} onSignOut={signOut} className="hidden lg:flex" />
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left" className="w-64 max-w-[85vw] gap-0 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Admin menu</SheetTitle>
            <AdminSidebar
              user={user}
              onSignOut={signOut}
              onNavigate={() => setMenuOpen(false)}
              className="h-full w-full border-r-0 static"
            />
          </SheetContent>
        </Sheet>
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader user={user} title={title} description={description} onOpenMenu={() => setMenuOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
            {allowed ? (
              children
            ) : (
              <div role="alert" className="bg-white rounded-xl border border-neutral-200/80 p-10 text-center">
                <ShieldAlert className="mx-auto mb-3 size-9 text-amber-500" />
                <h2 className="text-sm font-semibold text-neutral-900">Your role does not include this area</h2>
                <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-500">
                  Signed in as {user.roleName ?? "staff"}. Ask the owner to add it to your role under Staff &amp; Roles.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
