"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/animation/gsap";
import { DURATION, EASE, STAGGER, prefersReducedMotion } from "@/lib/animation/motion";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

type SplitHeadingProps = {
  /**
   * One entry per visual line. Lines are authored rather than measured — this
   * keeps the mask exact at every breakpoint and avoids splitting the heading
   * into dozens of spans (brain/11_ANIMATION_SPEC.md, pattern A).
   */
  lines: ReactNode[];
  as?: ElementType;
  id?: string;
  className?: string;
  /** Fire on mount instead of on scroll. For above-the-fold headings only. */
  immediate?: boolean;
  delay?: number;
};

/**
 * The signature masked heading reveal: each line sits in an overflow-hidden
 * wrapper and rises from below its own baseline.
 *
 * Lines render in their final position; GSAP pushes them down in a layout
 * effect before first paint, so there is no flash and no permanently hidden
 * text if JavaScript fails.
 */
export function SplitHeading({
  lines,
  as: Tag = "h2",
  id,
  className,
  immediate = false,
  delay = 0,
}: SplitHeadingProps) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const inner = root.querySelectorAll("[data-line-inner]");
      if (inner.length === 0) return;

      // fromTo rather than set + to: the from-state is owned by the tween, so
      // it survives a context revert/recreate cycle (which React runs on every
      // mount in development) and is re-applied on ScrollTrigger refresh.
      // invalidateOnRefresh re-resolves yPercent after the display font swaps
      // in and changes the line height.
      gsap.fromTo(
        inner,
        { yPercent: 108, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: DURATION.slow,
          delay,
          ease: EASE.premium,
          stagger: STAGGER.line,
          ...(immediate
            ? {}
            : {
                scrollTrigger: {
                  trigger: root,
                  start: "top 88%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              }),
        },
      );
    }, root);

    return () => ctx.revert();
  }, [immediate, delay]);

  return (
    <Tag ref={ref} id={id} className={cn("font-display", className)}>
      {lines.map((line, index) => (
        <span key={index} className="dh-reveal-line">
          <span data-line-inner className="block will-change-transform">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
