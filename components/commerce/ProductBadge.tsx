import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductBadgeKind } from "@/types/product";

/**
 * Merchandising badge. Rendered only when the product data carries one, so the
 * UI never asserts "Bestseller" on its own initiative.
 */
const BADGES: Record<ProductBadgeKind, { label: string; className: string }> = {
  bestseller: {
    label: "Bestseller",
    className: "bg-[#d32f2f] text-white shadow-sm ring-1 ring-red-300/40",
  },
  popular: {
    label: "Popular",
    className: "bg-[#0288d1] text-white shadow-sm ring-1 ring-sky-300/40",
  },
  trending: {
    label: "Trending",
    className: "bg-[#7b1fa2] text-white shadow-sm ring-1 ring-purple-300/40",
  },
  new: {
    label: "New",
    className: "bg-[#2e7d32] text-white shadow-sm ring-1 ring-emerald-300/40",
  },
  "for-pain": {
    label: "For Pain",
    className: "bg-[#e65100] text-white shadow-sm ring-1 ring-orange-300/40",
  },
  "for-skin": {
    label: "For Skin",
    className: "bg-[#f57c00] text-white shadow-sm ring-1 ring-amber-300/40",
  },
};

export function ProductBadge({
  kind,
  className,
}: {
  kind: ProductBadgeKind;
  className?: string;
}) {
  const badge = BADGES[kind];

  return (
    <Badge
      className={cn(
        "h-[24px] rounded-full px-2.5 text-[0.6875rem] font-medium tracking-wide inline-flex items-center gap-1.5 shadow-xs border-0",
        badge.className,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-white/90" />
      {badge.label}
    </Badge>
  );
}
