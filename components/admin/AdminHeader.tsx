"use client";

import React from "react";
import Link from "next/link";
import { Bell, Search, ExternalLink } from "lucide-react";
import type { SessionStaffUser } from "@/types/admin";

interface AdminHeaderProps {
  user: SessionStaffUser | null;
  title?: string;
  description?: string;
}

export function AdminHeader({ user, title, description }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-neutral-200/80 bg-white px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex flex-col">
        {title && <h1 className="text-base font-semibold text-neutral-900 leading-tight">{title}</h1>}
        {description && <p className="text-xs text-neutral-500">{description}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Environment Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>API: Port 4000</span>
        </div>

        {/* Public Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-[#0d5a43] px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink className="size-3" />
        </Link>
      </div>
    </header>
  );
}
