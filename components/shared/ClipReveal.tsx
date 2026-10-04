"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/animation/gsap";
import { DURATION, EASE, prefersReducedMotion } from "@/lib/animation/motion";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

type ClipRevealProps = {
  children: ReactNode;
  className?: string;
  /** Edge the mask opens from. */
  from?: "bottom" | "left" | "right";
  delay?: number;
};

const CLOSED: Record<NonNullable<ClipRevealProps["from"]>, string> = {
  bottom: "inset(100% 0% 0% 0% round var(--radius-frame))",
  left: "inset(0% 100% 0% 0% round var(--radius-frame))",
  right: "inset(0% 0% 0% 100% round var(--radius-frame))",
};

const OPEN = "inset(0% 0% 0% 0% round var(--radius-frame))";

/**
 * Media mask reveal (brain/11_ANIMATION_SPEC.md, pattern D).
 *
 * The frame is clipped open while its contents settle back from a slight
 * overscale, which reads as the media being uncovered rather than sliding in.
 * Used on the doctor portrait, the featured collection stage and editorial
 * media — not on every image on the page.
 */
export function ClipReveal({
  children,
  className,
  from = "bottom",
  delay = 0,
}: ClipRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const inner = root.firstElementChild;

      const tl = gsap.timeline({
        delay,
        scrollTrigger: {
          trigger: root,
          start: "top 84%",
          once: true,
          invalidateOnRefresh: true,
        },
      });

      // fromTo throughout, so the closed state belongs to the timeline and is
      // restored cleanly if the context is rebuilt.
      tl.fromTo(
        root,
        { clipPath: CLOSED[from] },
        {
          clipPath: OPEN,
          duration: DURATION.slow + 0.16,
          ease: EASE.premium,
        },
      );

      if (inner) {
        tl.fromTo(
          inner,
          { scale: 1.08 },
          { scale: 1, duration: DURATION.slow + 0.36, ease: EASE.premium },
          0,
        );
      }
    }, root);

    return () => ctx.revert();
  }, [from, delay]);

  return (
    <div ref={ref} className={cn("will-change-[clip-path]", className)}>
      {children}
    </div>
  );
}
