"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * − value + within [min, max]. The bounds come from the shop's quote, so the
 * stepper cannot ask for a quantity the order would be refused for. Removing
 * a line is a separate, explicit action rather than "minus at one".
 */
export function QuantityStepper({
  value,
  min,
  max,
  label,
  onChange,
  className,
}: {
  value: number;
  min: number;
  max: number;
  /** What is being counted, for the buttons' accessible names. */
  label: string;
  onChange: (value: number) => void;
  className?: string;
}) {
  const button =
    "grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-forest/8 disabled:cursor-not-allowed disabled:text-ink/25 disabled:hover:bg-transparent";
  return (
    <div
      role="group"
      aria-label={`Quantity of ${label}`}
      className={cn("inline-flex h-10 items-center rounded-full border border-line bg-cream", className)}
    >
      <button
        type="button"
        aria-label={`Decrease quantity of ${label}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={button}
      >
        <Minus aria-hidden className="size-4" />
      </button>
      {/* Re-keyed so a change settles in with a short fade; reduced motion skips it. */}
      <output
        key={value}
        aria-live="polite"
        className="w-8 text-center text-sm font-semibold tabular-nums text-ink motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200"
      >
        {value}
      </output>
      <button
        type="button"
        aria-label={`Increase quantity of ${label}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={button}
      >
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}
