"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { prefersReducedMotion } from "@/lib/animation/motion";

let activeLenis: Lenis | null = null;

/**
 * The running Lenis instance, or null under reduced motion / before mount.
 * Programmatic scrolls go through it so they do not fight its smoothing.
 */
export const getLenis = () => activeLenis;

/**
 * The single smooth-scroll instance for the app shell.
 *
 * Provides:
 * 1. Frame-rate independent exponential smoothing (prevents abrupt stopping/pausing on 60/120/144Hz).
 * 2. Route-transition awareness: resets to top, wakes up Lenis, and resizes layout seamlessly on navigation.
 * 3. Non-blocking debounced ScrollTrigger refresh: waits for scroll momentum to finish so refreshes never hitch.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-motion-ready", "");

    if (prefersReducedMotion()) {
      return () => {
        root.removeAttribute("data-motion-ready");
      };
    }

    // Configure ScrollTrigger to avoid unwanted auto-resizing
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    });

    // Frame-rate independent Lenis configuration with exponential easing
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      syncTouch: false,
      autoRaf: false,
    });

    lenisRef.current = lenis;
    activeLenis = lenis;

    const onScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);

    // Sync GSAP ticker with Lenis
    const updateRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);

    // Safe, non-blocking refresh that never interrupts active user scrolling
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
    const safeRefresh = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        // If the visitor is actively scrolling, defer until momentum completes
        if (lenis.isScrolling) {
          safeRefresh();
          return;
        }
        lenis.resize();
        ScrollTrigger.refresh();
      }, 250);
    };

    // Observe layout reflows smoothly
    const observer = new ResizeObserver(safeRefresh);
    observer.observe(document.body);

    document.fonts?.ready.then(() => safeRefresh());

    if (document.readyState === "complete") {
      safeRefresh();
    } else {
      window.addEventListener("load", safeRefresh);
    }

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      observer.disconnect();
      window.removeEventListener("load", safeRefresh);
      root.removeAttribute("data-motion-ready");
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(updateRaf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
      activeLenis = null;
    };
  }, []);

  // Handle route changes seamlessly across all routes
  useEffect(() => {
    const lenis = lenisRef.current ?? activeLenis;
    if (!lenis) return;

    // Wake up Lenis in case any dialog/sheet left it stopped
    lenis.start();

    // Scroll to top immediately on route change
    lenis.scrollTo(0, { immediate: true });

    // Recalibrate dimensions after the new route page renders
    const timer = setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    }, 80);

    return () => clearTimeout(timer);
  }, [pathname]);

  return <>{children}</>;
}
