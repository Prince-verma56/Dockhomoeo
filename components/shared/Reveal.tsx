"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/animation/gsap";
import { DURATION, EASE, STAGGER, prefersReducedMotion } from "@/lib/animation/motion";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Distance travelled, in px. Kept small — this is a settle, not a slide. */
  y?: number;
  delay?: number;
  /**
   * CSS selector for direct descendants to stagger instead of the wrapper.
   * Use for card grids, icon rails and metric rows.
   */
  stagger?: string;
  /** Viewport position that fires the reveal. */
  start?: string;
};

/**
 * Scroll-triggered entrance for a block or a group of its children.
 *
 * The "from" state is applied by GSAP in a layout effect, never in markup, so
 * server-rendered content is visible on first paint and stays visible if the
 * animation never runs (brain/23_ACCESSIBILITY_SPEC.md).
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  y = 26,
  delay = 0,
  stagger,
  start = "top 86%",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const targets: Element[] = stagger
        ? Array.from(root.querySelectorAll(stagger))
        : [root];

      if (targets.length === 0) return;

      // fromTo keeps the from-state owned by the tween, so it is re-applied
      // whenever the context is rebuilt or ScrollTrigger refreshes.
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: DURATION.slow,
          delay,
          ease: EASE.premium,
          stagger: stagger ? STAGGER.card : 0,
          scrollTrigger: {
            trigger: root,
            start,
            once: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [y, delay, stagger, start]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
