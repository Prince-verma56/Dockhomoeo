import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const norm = status.toUpperCase();

  let style = "bg-neutral-100 text-neutral-700 border-neutral-200";

  if (["DELIVERED", "CONFIRMED", "APPROVED", "ACTIVE", "PAID"].includes(norm)) {
    style = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (["PENDING", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(norm)) {
    style = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (["CANCELLED", "FAILED", "REJECTED", "ARCHIVED", "OUT_OF_STOCK"].includes(norm)) {
    style = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (["LOW_STOCK", "RETURN_REQUESTED"].includes(norm)) {
    style = "bg-orange-50 text-orange-700 border-orange-200";
  }

  const display = label || norm.replace(/_/g, " ").toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize",
        style,
        className,
      )}
    >
      {display}
    </span>
  );
}
