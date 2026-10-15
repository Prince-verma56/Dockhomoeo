"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  FolderTree,
  Tags,
  Boxes,
  Stethoscope,
  Wallet,
  UserCog,
  LogOut,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionStaffUser } from "@/types/admin";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Sales & Orders",
    items: [
      { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { title: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", href: "/admin/products", icon: Package },
      { title: "Categories", href: "/admin/categories", icon: FolderTree },
      { title: "Brands", href: "/admin/brands", icon: Tags },
      { title: "Inventory", href: "/admin/inventory", icon: Boxes },
    ],
  },
  {
    label: "Clinical Care",
    items: [
      { title: "Doctors Desk", href: "/admin/doctors", icon: Stethoscope },
      { title: "Prescriptions", href: "/admin/prescriptions", icon: ClipboardList },
      { title: "Doctor Payouts", href: "/admin/payouts", icon: Wallet },
    ],
  },
  {
    label: "System",
    items: [{ title: "Staff & Roles", href: "/admin/staff", icon: UserCog }],
  },
];

interface AdminSidebarProps {
  user: SessionStaffUser | null;
  onSignOut: () => void;
  className?: string;
}

export function AdminSidebar({ user, onSignOut, className }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r border-neutral-200 bg-[#f9faf9] select-none shrink-0 h-screen sticky top-0",
        className,
      )}
    >
      {/* Brand header */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-neutral-200/80 bg-white">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-[#0d5a43] flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
            DH
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-neutral-900 tracking-tight text-sm leading-tight">
              DocHomeo
            </span>
            <span className="text-[10px] font-medium tracking-wide uppercase text-[#0d5a43]">
              Admin Ledger
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-2.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-[#0d5a43] text-white shadow-sm font-semibold"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60",
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", active ? "text-white" : "text-neutral-500")} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        ))}

        {/* View Public Website */}
        <div className="pt-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:text-[#0d5a43] hover:bg-emerald-50/60 border border-neutral-200/80 bg-white shadow-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="size-3.5" />
              <span>Public Storefront</span>
            </span>
            <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
              Port 3000
            </span>
          </Link>
        </div>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-neutral-200/80 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-full bg-neutral-200 text-neutral-700 font-semibold text-xs flex items-center justify-center shrink-0 uppercase">
              {user?.name ? user.name.slice(0, 2) : "AD"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-neutral-900 truncate">
                {user?.name || "Staff Admin"}
              </span>
              <span className="text-[10px] text-neutral-500 truncate capitalize">
                {user?.role?.replace("_", " ").toLowerCase() || "Staff"}
              </span>
            </div>
          </div>
          <button
            onClick={onSignOut}
            title="Sign out of Admin"
            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
