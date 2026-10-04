"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/animation/gsap";
import { EASE, prefersReducedMotion } from "@/lib/animation/motion";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /**
   * Travel across the full scroll pass, as a percentage of the element's own
   * height. Negative moves against the scroll (appears nearer the viewer).
   * Keep within roughly ±14 — above that the object stops reading as part of
   * the scene (brain/11_ANIMATION_SPEC.md, pattern C).
   */
  speed?: number;
  /** Disable below this viewport width. Mobile gets a calmer page. */
  minWidth?: number;
};

/**
 * Scrub-linked depth parallax. Applied deliberately — hero product stage,
 * featured collection cards, doctor portrait and the offer scene — never as a
 * blanket effect across the page.
 */
export function Parallax({
  children,
  className,
  speed = -8,
  minWidth = 768,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // matchMedia keeps the trigger out of existence entirely below the
      // breakpoint, and tears it down cleanly on resize across it.
      const mm = gsap.matchMedia();

      mm.add(`(min-width: ${minWidth}px)`, () => {
        gsap.fromTo(
          root,
          { yPercent: -speed / 2 },
          {
            yPercent: speed / 2,
            ease: EASE.scrub,
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, [speed, minWidth]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
