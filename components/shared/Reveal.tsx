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
  /** Distance travelled, in px. Kept small — this is a settle, not a slide. Default: 24 */
  y?: number;
  /** Horizontal distance travelled, in px. Default: 0 */
  x?: number;
  /** Starting scale. E.g. 0.98 for cards or 1.03 for image reveal. Default: 1 */
  scale?: number;
  delay?: number;
  duration?: number;
  /**
   * CSS selector for direct descendants to stagger, OR number of seconds between items, OR boolean.
   * Use for card grids, icon rails and metric rows.
   */
  stagger?: string | number | boolean;
  /** Viewport position that fires the reveal. Default: "top 86%" */
  start?: string;
  /** Fire on mount instead of scroll (for above-the-fold content). */
  immediate?: boolean;
};

/**
 * Scroll-triggered entrance for a block or a group of its children.
 *
 * Guarantees:
 * - Respects prefers-reduced-motion instantly.
 * - Cleans up inline transforms on complete so responsive layout and CSS hovers work unimpeded.
 * - Automatically releases reveal gates safely.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  y = 24,
  x = 0,
  scale = 1,
  delay = 0,
  duration = DURATION.slow,
  stagger,
  start = "top 86%",
  immediate = false,
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
      let targets: Element[] = [];
      let staggerAmount: number = STAGGER.card;

      if (typeof stagger === "number") {
        staggerAmount = stagger;
        const autoChildren = root.querySelectorAll("[data-reveal-item], [data-reveal-card]");
        if (autoChildren.length > 0) {
          targets = Array.from(autoChildren);
        } else if (root.children.length > 1) {
          targets = Array.from(root.children);
        } else if (root.firstElementChild && root.firstElementChild.children.length > 1) {
          targets = Array.from(root.firstElementChild.children);
        } else {
          targets = [root];
        }
      } else if (typeof stagger === "string") {
        const trimmed = stagger.trim();
        const asNum = Number(trimmed);
        if (!isNaN(asNum) && trimmed !== "") {
          staggerAmount = asNum;
          const autoChildren = root.querySelectorAll("[data-reveal-item], [data-reveal-card]");
          if (autoChildren.length > 0) {
            targets = Array.from(autoChildren);
          } else if (root.children.length > 1) {
            targets = Array.from(root.children);
          } else if (root.firstElementChild && root.firstElementChild.children.length > 1) {
            targets = Array.from(root.firstElementChild.children);
          } else {
            targets = [root];
          }
        } else {
          const selector = /^[>+~]/.test(trimmed) ? `:scope ${trimmed}` : trimmed;
          try {
            targets = Array.from(root.querySelectorAll(selector));
          } catch {
            targets = root.children.length > 0 ? Array.from(root.children) : [root];
          }
        }
      } else if (stagger === true) {
        const autoChildren = root.querySelectorAll("[data-reveal-item], [data-reveal-card]");
        if (autoChildren.length > 0) {
          targets = Array.from(autoChildren);
        } else if (root.children.length > 1) {
          targets = Array.from(root.children);
        } else if (root.firstElementChild && root.firstElementChild.children.length > 1) {
          targets = Array.from(root.firstElementChild.children);
        } else {
          targets = [root];
        }
      } else {
        const autoChildren = root.querySelectorAll("[data-reveal-item], [data-reveal-card]");
        if (autoChildren.length > 0) {
          targets = Array.from(autoChildren);
        } else {
          targets = [root];
        }
      }

      if (targets.length === 0) {
        releaseRevealGate(root);
        return;
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y, x, scale },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration,
          delay,
          ease: EASE.premium,
          stagger: targets.length > 1 ? staggerAmount : 0,
          scrollTrigger: immediate
            ? undefined
            : {
                trigger: root,
                start,
                once: true,
                invalidateOnRefresh: true,
              },
          onComplete: () => {
            gsap.set(targets, { clearProps: "opacity,transform,scale" });
          },
        },
      );

      releaseRevealGate(root);
    }, root);

    return () => ctx.revert();
  }, [y, x, scale, delay, duration, stagger, start, immediate]);

  return (
    <Tag ref={ref} data-motion-gate data-reveal className={cn(className)}>
      {children}
    </Tag>
  );
}
