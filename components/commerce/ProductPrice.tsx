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
    <p className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold tracking-tight text-ink", sizing.current)}>
        {formatPrice(price)}
      </span>

      {compareAtPrice ? (
        <span className={cn("text-muted-ink line-through", sizing.compare)}>
          {formatPrice(compareAtPrice)}
        </span>
      ) : null}

      {showSaving && saving ? (
        <span className={cn("font-medium text-forest", sizing.compare)}>
          {saving}% off
        </span>
      ) : null}
    </p>
  );
}
