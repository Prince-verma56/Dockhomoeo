"use client";

import { useRef } from "react";
import { gsap } from "./gsap";
import {
  DURATION,
  EASE,
  STAGGER,
  prefersReducedMotion,
  releaseRevealGate,
} from "./motion";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Entrance personalities.
 *
 * A section picks the ones that suit its content rather than every section
 * reaching for the same fade-up — that sameness is what makes a page read as
 * generic (brain/11_ANIMATION_SPEC.md).
 */
const VARIANTS = {
  /** Masked line rise. For headings split into `dh-reveal-line` wrappers. */
  mask: {
    from: { yPercent: 108, opacity: 0 },
    to: { yPercent: 0, opacity: 1 },
    duration: DURATION.slow,
    ease: EASE.premium,
    stagger: STAGGER.line,
  },
  /** Small settle. Eyebrows, paragraphs, CTAs, supporting rows. */
  rise: {
    from: { opacity: 0, y: 18 },
    to: { opacity: 1, y: 0 },
    duration: DURATION.medium,
    ease: EASE.soft,
    stagger: STAGGER.tight,
  },
  /** Product cards: lift with just enough scale to read as depth. */
  card: {
    from: { opacity: 0, y: 30, scale: 0.97 },
    to: { opacity: 1, y: 0, scale: 1 },
    duration: DURATION.slow,
    ease: EASE.premium,
    stagger: STAGGER.card,
  },
  /** Brand marks: presence, no travel. A logo rail that slides reads cheap. */
  bloom: {
    from: { opacity: 0, scale: 0.94 },
    to: { opacity: 1, scale: 1 },
    duration: DURATION.medium,
    ease: EASE.soft,
    stagger: STAGGER.tight,
  },
  /** Full-bleed scene behind a section: settles out of a slight overscale.
      No clip here — wiping a section-sized backdrop exposes bare page colour
      mid-scroll and reads as a loading bug rather than a reveal. */
  backdrop: {
    from: { opacity: 0, scale: 1.06 },
    to: { opacity: 1, scale: 1 },
    duration: DURATION.slow + 0.3,
    ease: EASE.premium,
    stagger: 0,
  },
  /** Editorial media: uncovered from below rather than slid in. */
  media: {
    from: { opacity: 0, scale: 1.06, clipPath: "inset(0% 0% 100% 0%)" },
    to: { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" },
    duration: DURATION.slow + 0.2,
    ease: EASE.premium,
    stagger: STAGGER.card,
  },
  /** Testimonials: alternating drift, so the column does not march in step. */
  drift: {
    from: { opacity: 0, x: (i: number) => (i % 2 === 0 ? -34 : 34) },
    to: { opacity: 1, x: 0 },
    duration: DURATION.slow,
    ease: EASE.premium,
    stagger: STAGGER.card,
  },
} as const;

export type RevealVariant = keyof typeof VARIANTS;

export type SectionStep = {
  /** Selector for the targets, scoped to the section root. */
  sel: string;
  variant: RevealVariant;
  /** Absolute position on the section timeline, in seconds. */
  at?: number;
};

/**
 * Builds one scroll-triggered timeline for a whole section and returns the ref
 * to attach to its root.
 *
 * One timeline per section, not one per element: that is what gives a section
 * an order (heading, then copy, then cards) instead of everything arriving at
 * once. Targets are hidden before first paint by the `data-reveal` gate and
 * released here, in the same layout effect that hands their from-state to GSAP.
 */
export function useSectionTimeline<T extends HTMLElement = HTMLElement>(
  steps: SectionStep[],
  { start = "top 72%" }: { start?: string } = {},
) {
  const ref = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      releaseRevealGate(root);
      return;
    }

    let ctx: gsap.Context | undefined;

    try {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start,
            once: true,
            // Positions are re-measured on refresh, so late-loading media
            // cannot leave this timeline firing at the wrong scroll offset.
            invalidateOnRefresh: true,
          },
        });

        for (const { sel, variant, at = 0 } of steps) {
          const targets = root.querySelectorAll(sel);
          if (targets.length === 0) continue;

          const v = VARIANTS[variant];
          tl.fromTo(
            targets,
            { ...v.from },
            {
              ...v.to,
              duration: v.duration,
              ease: v.ease,
              stagger: v.stagger,
              // A clip-path left on the layer keeps it composited for nothing.
              clearProps: variant === "media" ? "clipPath" : "",
            },
            at,
          );
        }
      }, root);
    } finally {
      // Always, even if building the timeline threw: a section left gated is
      // invisible forever, which is far worse than one that does not animate.
      releaseRevealGate(root);
    }

    // Steps are authored inline per section and never change at runtime, so
    // the timeline is built once and `start` is the only meaningful input.
    return () => ctx?.revert();
  }, [start]);

  return ref;
}
