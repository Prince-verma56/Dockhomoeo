"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/animation/gsap";
import {
  DURATION,
  EASE,
  STAGGER,
  prefersReducedMotion,
  releaseRevealGate,
} from "@/lib/animation/motion";
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
 * The wrapper ships with `data-reveal`, so CSS hides it before first paint and
 * the copy is never readable ahead of its own trigger. GSAP takes ownership of
 * the from-state in a layout effect and releases the gate in the same block.
 *
 * If JavaScript never runs, or reduced motion is requested, the gate class is
 * never set on <html> and the content simply renders visible
 * (brain/23_ACCESSIBILITY_SPEC.md).
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
    if (!root) return;

    if (prefersReducedMotion()) {
      releaseRevealGate(root);
      return;
    }

    const ctx = gsap.context(() => {
      const targets: Element[] = stagger
        ? Array.from(root.querySelectorAll(stagger))
        : [root];

      if (targets.length === 0) {
        releaseRevealGate(root);
        return;
      }

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

      // fromTo renders its from-state immediately, so the targets are already
      // hidden by inline style here. Safe to drop the CSS gate.
      releaseRevealGate(root);
    }, root);

    return () => ctx.revert();
  }, [y, delay, stagger, start]);

  return (
    <Tag ref={ref} data-motion-gate data-reveal className={cn(className)}>
      {children}
    </Tag>
  );
}
