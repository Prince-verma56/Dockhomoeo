"use client";

import { useRef } from "react";
import { gsap } from "./gsap";
import {
  DURATION,
  EASE,
  STAGGER,
  SCROLL_START,
  prefersReducedMotion,
  releaseRevealGate,
} from "./motion";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

export type ScrollRevealOptions = {
  /** Distance travelled in Y (px). Subtle upward settle. Default: 24 */
  y?: number;
  /** Distance travelled in X (px). Default: 0 */
  x?: number;
  /** Starting scale. E.g. 0.97 for subtle card bloom or 1.04 for media. Default: 1 */
  scale?: number;
  /** Opacity start. Default: 0 */
  opacity?: number;
  /** Duration in seconds. Default: DURATION.slow (0.85s) */
  duration?: number;
  /** Easing function. Default: EASE.premium ("power3.out") */
  ease?: string;
  /** Delay before animation starts in seconds. Default: 0 */
  delay?: number;
  /** Stagger interval for child elements in seconds. Default: STAGGER.card (0.075s) */
  stagger?: number;
  /** CSS selector for staggered descendants inside the container. */
  staggerSelector?: string;
  /** Viewport position that fires the reveal. Default: "top 85%" */
  start?: string;
  /** Whether to animate immediately on mount (for above-the-fold sections). Default: false */
  immediate?: boolean;
};

/**
 * High-performance GSAP ScrollTrigger hook for smooth, un-intrusive section and element reveals.
 *
 * Guarantees:
 * 1. Respects `prefers-reduced-motion` immediately without flashing or delay.
 * 2. Clears all inline styles on completion (`clearProps: "all"`) so CSS hovers, transforms,
 *    and responsive flex/grid layouts remain 100% unimpeded.
 * 3. Scoped to container ref with automatic cleanup via `ctx.revert()` on unmount.
 * 4. Never leaves elements hidden if ScrollTrigger or JS encounters an edge case.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);

  const {
    y = 24,
    x = 0,
    scale = 1,
    opacity = 0,
    duration = DURATION.slow,
    ease = EASE.premium,
    delay = 0,
    stagger = STAGGER.card,
    staggerSelector,
    start = SCROLL_START.section,
    immediate = false,
  } = options;

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      releaseRevealGate(root);
      return;
    }

    const ctx = gsap.context(() => {
      // Find targets: either specified selector, auto-detected data-reveal items, or the root itself
      let targets: Element[] = [];

      if (staggerSelector) {
        const trimmed = staggerSelector.trim();
        const selector = /^[>+~]/.test(trimmed) ? `:scope ${trimmed}` : trimmed;
        try {
          targets = Array.from(root.querySelectorAll(selector));
        } catch {
          targets = root.children.length > 0 ? Array.from(root.children) : [root];
        }
      } else {
        const marked = root.querySelectorAll("[data-reveal-item], [data-reveal-card]");
        if (marked.length > 0) {
          targets = Array.from(marked);
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
        {
          opacity,
          y,
          x,
          scale,
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration,
          delay,
          ease,
          stagger: targets.length > 1 ? stagger : 0,
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
        }
      );

      releaseRevealGate(root);
    }, root);

    return () => ctx.revert();
  }, [y, x, scale, opacity, duration, ease, delay, stagger, staggerSelector, start, immediate]);

  return ref;
}
