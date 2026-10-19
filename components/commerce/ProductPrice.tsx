import { cn } from "@/lib/utils";
import { discountPercent, formatPrice } from "@/lib/formatters/price";
import type { Price } from "@/types/common";

type ProductPriceProps = {
  price: Price;
  compareAtPrice?: Price;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Shows the saving as a percentage next to the struck-through price. */
  showSaving?: boolean;
};

const SIZES = {
  sm: { current: "text-[0.9375rem]", compare: "text-xs" },
  md: { current: "text-[1.0625rem]", compare: "text-[0.8125rem]" },
  lg: { current: "text-xl", compare: "text-sm" },
} as const;

/** Current price, optional reference price and optional saving. */
export function ProductPrice({
  price,
  compareAtPrice,
  className,
  size = "md",
  showSaving = false,
}: ProductPriceProps) {
  const saving = discountPercent(price, compareAtPrice);
  const sizing = SIZES[size];

  return (
    <div className={cn("flex flex-col justify-center min-w-0 leading-tight", className)}>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={cn("font-bold tracking-tight text-ink", sizing.current)}>
          {formatPrice(price)}
        </span>

        {compareAtPrice ? (
          <span className={cn("text-muted-ink line-through text-[11px] sm:text-xs", sizing.compare)}>
            {formatPrice(compareAtPrice)}
          </span>
        ) : null}
      </div>

      {showSaving && saving ? (
        <span className="text-[10px] sm:text-[11px] font-bold text-red-600 mt-0.5 truncate">
          {saving}% off
        </span>
      ) : null}
    </div>
  );
}
