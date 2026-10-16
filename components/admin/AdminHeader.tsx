"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import type { SessionStaffUser } from "@/types/admin";

interface AdminHeaderProps {
  user: SessionStaffUser | null;
  title?: string;
  description?: string;
  /** Opens the navigation on screens too narrow for the sidebar. */
  onOpenMenu?: () => void;
}

export function AdminHeader({ title, description, onOpenMenu }: AdminHeaderProps) {
  return (
    <header className="min-h-16 border-b border-neutral-200/80 bg-white px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-30">
      <div className="flex min-w-0 items-center gap-2">
        {onOpenMenu ? (
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open admin menu"
            className="lg:hidden -ml-1 grid size-10 shrink-0 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-[#0d5a43]/40"
          >
            <Menu className="size-5" />
          </button>
        ) : null}
        <div className="flex min-w-0 flex-col">
          {title && <h1 className="text-base font-semibold text-neutral-900 leading-tight truncate">{title}</h1>}
          {description && <p className="text-xs text-neutral-500 line-clamp-1">{description}</p>}
        </div>
      </div>

      {/* Public Storefront Link */}
      <Link
        href="/"
        target="_blank"
        className="flex shrink-0 items-center gap-1.5 text-xs text-neutral-600 hover:text-[#0d5a43] px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
      >
        <span className="hidden sm:inline">Storefront</span>
        <ExternalLink className="size-3" />
        <span className="sr-only sm:hidden">Storefront</span>
      </Link>
    </header>
  );
}
