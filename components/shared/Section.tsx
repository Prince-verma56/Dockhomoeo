import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Links the section to its own heading for assistive technology. */
  labelledBy?: string;
  /**
   * Surface tone. The page alternates between these to give the scroll a
   * rhythm without needing a separator at every boundary.
   */
  tone?: "ivory" | "cream" | "sage" | "forest";
  /** Vertical rhythm. Heights stay in the ranges set by the homepage brief. */
  space?: "none" | "tight" | "default" | "loose";
};

const TONES = {
  ivory: "bg-ivory text-ink",
  cream: "bg-cream text-ink",
  sage: "bg-sage-tint text-ink",
  forest: "bg-forest-deep text-cream",
} as const;

const SPACING = {
  none: "",
  tight: "py-12 md:py-14",
  default: "py-16 md:py-20 lg:py-24",
  loose: "py-20 md:py-28 lg:py-32",
} as const;

/** A homepage band: one surface, one vertical rhythm, one labelled region. */
export function Section({
  children,
  className,
  id,
  labelledBy,
  tone = "ivory",
  space = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative", TONES[tone], SPACING[space], className)}
    >
      {children}
    </section>
  );
}
