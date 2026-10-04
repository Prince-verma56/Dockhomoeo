"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { prefersReducedMotion } from "@/lib/animation/motion";

/**
 * The single smooth-scroll instance for the app shell (brain/02_TRD.md).
 *
 * Lenis drives scroll position, GSAP's ticker drives Lenis, and every Lenis
 * frame pushes an update into ScrollTrigger. That ordering keeps scrub-linked
 * animation in sync with the smoothed position instead of the native one.
 *
 * Under `prefers-reduced-motion: reduce` Lenis is never constructed, so the
 * browser keeps its own native scrolling and no RAF loop is started.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // The display serif loads with `font-display: swap`, so headings resize
    // after first paint and every ScrollTrigger start position computed before
    // that is stale — which shows up as a section that scrolls past without
    // ever revealing. Recompute once the fonts have actually landed.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    if (prefersReducedMotion()) return () => { cancelled = true; };

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      // Touch devices keep native momentum; overriding it feels worse, not better.
      syncTouch: false,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      cancelled = true;
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
