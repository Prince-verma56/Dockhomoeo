"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TiltProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum rotation angle in degrees (applied per axis). Default: 8 */
  rotationFactor?: number;
  /** Perspective depth in px. Default: 800 */
  perspective?: number;
  /** Scale on hover. Default: 1.02 */
  scaleOnHover?: number;
  /** Easing transition for the tilt back to neutral. Default: "0.4s ease-out" */
  springDuration?: string;
  children: React.ReactNode;
}

/**
 * Tilt — lightweight mouse-tracking 3-D perspective tilt.
 */
export function Tilt({
  rotationFactor = 8,
  perspective = 800,
  scaleOnHover = 1.02,
  springDuration = "0.4s ease-out",
  children,
  className,
  style,
  onMouseMove,
  onMouseLeave,
  ...props
}: TiltProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseMove?.(e);
      const el = ref.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 2;
      const y = ((e.clientY - top) / height - 0.5) * 2;
      const rotX = -y * rotationFactor;
      const rotY = x * rotationFactor;
      el.style.transition = "transform 0.1s linear";
      el.style.transform = `perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scaleOnHover})`;
    },
    [onMouseMove, rotationFactor, perspective, scaleOnHover],
  );

  const handleMouseLeave = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(e);
      const el = ref.current;
      if (!el) return;
      el.style.transition = `transform ${springDuration}`;
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    },
    [onMouseLeave, springDuration, perspective],
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("will-change-transform", className)}
      style={{ transformStyle: "preserve-3d", ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
