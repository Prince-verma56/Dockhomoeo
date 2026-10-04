import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingProps = {
  value: number;
  count?: number;
  className?: string;
  /** Compact shows one star and the number; full draws all five. */
  variant?: "compact" | "full";
};

/**
 * Rating display. The numeric value is always present in the accessible name,
 * so the stars stay decorative and screen readers get the real figure.
 */
export function Rating({
  value,
  count,
  className,
  variant = "compact",
}: RatingProps) {
  const label =
    count === undefined
      ? `Rated ${value} out of 5`
      : `Rated ${value} out of 5 from ${count} reviews`;

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-[0.8125rem]", className)}
      aria-label={label}
    >
      {variant === "compact" ? (
        <Star
          aria-hidden
          className="size-3.5 fill-warm text-warm"
          strokeWidth={1.5}
        />
      ) : (
        <span aria-hidden className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              strokeWidth={1.5}
              className={cn(
                "size-3.5",
                index < Math.round(value)
                  ? "fill-warm text-warm"
                  : "text-line",
              )}
            />
          ))}
        </span>
      )}

      <span aria-hidden className="font-medium text-ink">
        {value.toFixed(1)}
      </span>

      {count !== undefined ? (
        <span aria-hidden className="text-muted-ink">
          ({count})
        </span>
      ) : null}
    </span>
  );
}
