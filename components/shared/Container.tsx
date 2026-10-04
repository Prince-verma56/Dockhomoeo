import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /**
   * `default` — 1360px, the page's standard editorial measure.
   * `wide`    — 1560px, for rails and cinematic rows that want more air.
   * `narrow`  — 1100px, for text-led blocks.
   */
  width?: "default" | "wide" | "narrow";
};

const WIDTHS = {
  default: "max-w-[1360px]",
  wide: "max-w-[1560px]",
  narrow: "max-w-[1100px]",
} as const;

/** Horizontal measure and gutters. The only place page padding is defined. */
export function Container({
  children,
  className,
  as: Tag = "div",
  width = "default",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-12",
        WIDTHS[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
