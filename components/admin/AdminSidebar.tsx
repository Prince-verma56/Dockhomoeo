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
  TicketPercent,
  Layers,
  MessageSquareQuote,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminArea, SessionStaffUser } from "@/types/admin";
import { canAccess } from "@/lib/admin/access";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  /** The backend area (lib/permissions.ts) whose "view" permission the page needs. */
  area: AdminArea;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard, area: "dashboard" }],
  },
  {
    label: "Sales & Orders",
    items: [
      { title: "Orders", href: "/admin/orders", icon: ShoppingCart, area: "orders" },
      { title: "Customers", href: "/admin/customers", icon: Users, area: "customers" },
      { title: "Coupons", href: "/admin/coupons", icon: TicketPercent, area: "discounts" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", href: "/admin/products", icon: Package, area: "catalog" },
      { title: "Categories", href: "/admin/categories", icon: FolderTree, area: "catalog" },
      { title: "Brands", href: "/admin/brands", icon: Tags, area: "catalog" },
      { title: "Inventory", href: "/admin/inventory", icon: Boxes, area: "catalog" },
    ],
  },
  {
    label: "Clinical Care",
    items: [
      { title: "Doctors Desk", href: "/admin/doctors", icon: Stethoscope, area: "doctors" },
      { title: "Streams & Specialties", href: "/admin/streams", icon: Layers, area: "doctors" },
      { title: "Doctor Reviews", href: "/admin/doctor-reviews", icon: MessageSquareQuote, area: "doctors" },
      { title: "Prescriptions", href: "/admin/prescriptions", icon: ClipboardList, area: "consultations" },
      { title: "Doctor Payouts", href: "/admin/payouts", icon: Wallet, area: "payouts" },
    ],
  },
  {
    label: "Content",
    items: [{ title: "Health Insights", href: "/admin/blog", icon: Newspaper, area: "content" }],
  },
  {
    label: "System",
    items: [{ title: "Staff & Roles", href: "/admin/staff", icon: UserCog, area: "staff" }],
  },
];

interface AdminSidebarProps {
  user: SessionStaffUser | null;
  onSignOut: () => void;
  /** Called after a link is followed; the mobile menu closes itself with it. */
  onNavigate?: () => void;
  className?: string;
}

export function AdminSidebar({ user, onSignOut, onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // The backend checks every request; hiding what a role cannot open is only a courtesy.
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccess(user, item.area, "view")),
  })).filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r border-neutral-200 bg-[#f9faf9] select-none shrink-0 h-screen sticky top-0",
        className,
      )}
    >
      {/* Brand header */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-neutral-200/80 bg-white">
        <Link href="/admin" onClick={onNavigate} className="flex items-center gap-2.5">
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
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {groups.map((group) => (
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
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#0d5a43]/40",
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
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:text-[#0d5a43] hover:bg-emerald-50/60 border border-neutral-200/80 bg-white shadow-xs transition-colors"
          >
            <ExternalLink className="size-3.5" />
            <span>Public Storefront</span>
          </Link>
        </div>
      </nav>

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
              <span className="text-[10px] text-neutral-500 truncate">
                {user?.roleName || user?.role?.replace("_", " ").toLowerCase() || "Staff"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            title="Sign out of Admin"
            aria-label="Sign out of Admin"
            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
