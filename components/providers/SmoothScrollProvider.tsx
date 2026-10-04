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
    const root = document.documentElement;

    // Tells the inline gate script in app/layout.tsx that the client bundle
    // booted, so its failsafe must not strip the reveal gate.
    root.setAttribute("data-motion-ready", "");

    // ScrollTrigger measures every start/end position once, at creation. Any
    // layout change after that leaves those numbers stale, which is what makes
    // a section either animate while it is still off-screen (and sit finished
    // by the time you arrive) or never fire at all. Images are the usual
    // culprit, so refresh on every event that can resize the document.
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    // Mobile browsers resize the viewport when the URL bar hides; refreshing
    // on that causes triggers to re-fire mid-scroll.
    ScrollTrigger.config({ ignoreMobileResize: true });

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) refresh();
    });

    // `load` covers images that finish after hydration.
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh);

    // Catches anything the two events above miss — lazy media, late fonts in a
    // section further down, content that reflows on first interaction.
    const observer = new ResizeObserver(refresh);
    observer.observe(document.body);

    if (prefersReducedMotion()) {
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("load", refresh);
        root.removeAttribute("data-motion-ready");
      };
    }

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
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("load", refresh);
      root.removeAttribute("data-motion-ready");
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
