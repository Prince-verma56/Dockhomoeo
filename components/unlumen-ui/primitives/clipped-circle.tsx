import * as React from "react";
import { cn } from "@/lib/utils";

export interface ClippedCircleProps {
  /** Additional classes on the outer container. */
  className?: string;
  /** Classes applied to the circle itself. */
  circleClassName?: string;
  /** Diameter of the decorative circle in px. Default: 600 */
  circleSize?: number;
}

/**
 * ClippedCircle — a large decorative circle clipped to the bottom-right corner
 * of its nearest `relative` ancestor. Used as a subtle ambient glow / depth
 * ornament behind card content.
 */
export function ClippedCircle({
  className,
  circleClassName,
  circleSize = 600,
}: ClippedCircleProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className,
      )}
    >
      <div
        className={cn("absolute rounded-full opacity-[0.06]", circleClassName)}
        style={{
          width: circleSize,
          height: circleSize,
          right: -circleSize / 2,
          bottom: -circleSize / 2,
        }}
      />
    </div>
  );
}
