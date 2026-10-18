"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { gsap } from "@/lib/animation/gsap";
import { prefersReducedMotion } from "@/lib/animation/motion";

const LOGO_SRC = "/Images/LogoGIF/dochomoeo_logo_final_frame.png";

/**
 * Editorial White-Themed Route Preloader for DocHomoeo:
 * - Intercepts internal route changes before the new page mounts.
 * - Curtain slides down from top to bottom (translateY(-100%) -> translateY(0%)).
 * - Plays an intentional luxury preloader sequence (brand monogram, pulsing aura, 0-100% counter, and fluid emerald progress beam).
 * - Navigates to the destination route cleanly while screen is masked.
 * - When the target page is ready, the curtain smoothly glides back up to the top (translateY(0%) -> translateY(-100%)).
 * - Includes failsafe timers, scroll resets, and prefers-reduced-motion accessibility.
 */
function RoutePreloaderInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const containerRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(false);
  const [percent, setPercent] = useState(0);

  const isNavigatingRef = useRef<boolean>(false);
  const destinationUrlRef = useRef<string | null>(null);
  const failsafeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentPathRef = useRef<string>("");

  useEffect(() => {
    currentPathRef.current = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
  }, [pathname, searchParams]);

  useEffect(() => {
    return () => {
      if (failsafeTimerRef.current) clearTimeout(failsafeTimerRef.current);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  /**
   * Smooth exit: Retracts the white curtain back up towards the top
   */
  const finishAndRetract = useCallback(() => {
    if (failsafeTimerRef.current) {
      clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }

    const curtain = curtainRef.current;
    const card = cardRef.current;
    const container = containerRef.current;

    if (!curtain || !card || !container) {
      isNavigatingRef.current = false;
      setActive(false);
      return;
    }

    if (prefersReducedMotion()) {
      gsap.to(card, {
        opacity: 0,
        duration: 0.18,
        onComplete: () => {
          gsap.set(curtain, { yPercent: -100 });
          container.style.pointerEvents = "none";
          isNavigatingRef.current = false;
          setActive(false);
          setPercent(0);
        },
      });
      return;
    }

    gsap.killTweensOf([curtain, card]);

    // Badge fades out smoothly
    gsap.to(card, {
      opacity: 0,
      scale: 0.96,
      y: -12,
      duration: 0.22,
      ease: "power2.in",
    });

    // White curtain glides smoothly UP into the top direction
    gsap.to(curtain, {
      yPercent: -100,
      duration: 0.46,
      delay: 0.08,
      ease: "power3.inOut",
      onComplete: () => {
        container.style.pointerEvents = "none";
        isNavigatingRef.current = false;
        setActive(false);
        setPercent(0);
      },
    });
  }, []);

  /**
   * Preloader orchestration:
   * 1. Curtain descends from top to bottom (-100% -> 0%)
   * 2. Counter & progress bar animate from 0% to 100%
   * 3. router.push navigates to the destination
   */
  const startPreloader = useCallback((targetUrl: string) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    destinationUrlRef.current = targetUrl;
    setActive(true);
    setPercent(0);

    if (failsafeTimerRef.current) clearTimeout(failsafeTimerRef.current);
    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);

    // Failsafe auto-retract after 4.5 seconds so user is never stuck
    failsafeTimerRef.current = setTimeout(() => {
      finishAndRetract();
    }, 4500);

    const curtain = curtainRef.current;
    const card = cardRef.current;
    const container = containerRef.current;
    if (!curtain || !card || !container) return;

    container.style.pointerEvents = "auto";

    if (prefersReducedMotion()) {
      gsap.set(curtain, { yPercent: 0 });
      gsap.set(card, { opacity: 1, scale: 1, y: 0 });
      setPercent(100);
      router.push(targetUrl);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    gsap.killTweensOf([curtain, card]);

    // 1. Curtain wipes DOWN from top to bottom
    gsap.fromTo(
      curtain,
      { yPercent: -100 },
      {
        yPercent: 0,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      }
    );

    // 2. Card entrance with subtle scale & settle
    gsap.fromTo(
      card,
      { opacity: 0, scale: 0.93, y: -16 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.35,
        delay: 0.08,
        ease: "power2.out",
        overwrite: "auto",
      }
    );

    // 3. Smooth percentage counter progression (0 -> 100)
    const progressTracker = { value: 0 };
    gsap.to(progressTracker, {
      value: 100,
      duration: 0.42,
      delay: 0.06,
      ease: "power2.inOut",
      onUpdate: () => {
        setPercent(Math.round(progressTracker.value));
      },
      onComplete: () => {
        setPercent(100);
        // Execute the Next.js navigation while masked by the white preloader
        router.push(targetUrl);
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      },
    });
  }, [router, finishAndRetract]);

  // When pathname or searchParams updates (new route mounted), retract the curtain back up
  useEffect(() => {
    if (isNavigatingRef.current) {
      // Allow a brief 160ms polish buffer so the 100% state is perceivable
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = setTimeout(() => {
        finishAndRetract();
      }, 160);
    }
  }, [pathname, searchParams, finishAndRetract]);

  // Global click interceptor for internal links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Allow modifier keys (cmd/ctrl click to open in new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return; // Left click only

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      // Ignore external, download, or blank links
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.getAttribute("rel")?.includes("external")) return;
      if (anchor.hasAttribute("data-no-transition") || anchor.hasAttribute("data-no-preloader")) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref) return;

      // Ignore hash-only anchors and protocol links
      if (
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("javascript:")
      ) {
        return;
      }

      try {
        const targetUrl = new URL(anchor.href, window.location.href);

        // Only handle internal links
        if (targetUrl.origin !== window.location.origin) return;

        // Skip if target is the exact same path & search query
        const targetFull = targetUrl.pathname + targetUrl.search;
        const currentFull = window.location.pathname + window.location.search;
        if (targetFull === currentFull) return;

        // Intercept navigation to play the preloader sequence
        e.preventDefault();
        e.stopPropagation();

        startPreloader(targetUrl.href);
      } catch {
        // Fallback to standard browser behavior
      }
    };

    // Popstate (browser back/forward)
    const handlePopState = () => {
      startPreloader(window.location.href);
    };

    // Custom programmatic navigation event
    const handleCustomNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ url?: string }>;
      if (customEvent.detail?.url) {
        startPreloader(customEvent.detail.url);
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("dochomoeo:preloader-start", handleCustomNavigate);

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("dochomoeo:preloader-start", handleCustomNavigate);
    };
  }, [startPreloader]);

  return (
    <div
      ref={containerRef}
      aria-hidden={!active}
      className="fixed inset-0 z-[999999] pointer-events-none select-none overflow-hidden"
    >
      {/* Fullscreen White Preloader Curtain */}
      <div
        ref={curtainRef}
        className="absolute inset-0 w-full h-full -translate-y-full bg-gradient-to-b from-white via-[#fcfbfa] to-white dark:from-[#0a1611] dark:via-[#0c1a14] dark:to-[#0a1611] shadow-[0_30px_70px_-15px_rgba(13,90,67,0.18)] border-b border-black/[0.07] dark:border-white/10 flex flex-col items-center justify-center will-change-transform"
      >
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-forest/[0.04] via-transparent to-transparent pointer-events-none" />

        {/* Central Preloader Card */}
        <div
          ref={cardRef}
          className="relative z-10 flex flex-col items-center justify-center text-center px-6 opacity-0"
        >
          {/* Logo Monogram Badge with Ambient Pulse */}
          <div className="relative size-20 sm:size-22 rounded-3xl bg-white dark:bg-[#14231c] shadow-2xl shadow-forest/10 border border-forest/12 dark:border-white/10 p-4 flex items-center justify-center">
            {/* Subtle Aura Pulse */}
            <div className="absolute -inset-1 rounded-3xl bg-forest/10 animate-ping opacity-25 pointer-events-none" />

            <div className="relative size-12 sm:size-14">
              <Image
                src={LOGO_SRC}
                alt="DocHomoeo"
                width={56}
                height={56}
                priority
                className="size-full object-contain"
              />
            </div>
          </div>

          {/* Typography */}
          <div className="mt-5">
            <h2 className="text-[13px] sm:text-[14px] font-semibold tracking-[0.34em] text-forest dark:text-emerald-400 uppercase font-sans">
              DocHomoeo
            </h2>
            <p className="mt-1 text-[10px] sm:text-[11px] font-medium tracking-[0.24em] text-ink/40 dark:text-white/40 uppercase">
              Natural Holistic Care
            </p>
          </div>

          {/* Progress Bar & Percentage Counter */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="h-1.5 w-44 sm:w-56 rounded-full bg-forest/10 dark:bg-white/10 overflow-hidden relative shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-forest to-emerald-600 transition-all duration-75 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between w-44 sm:w-56 px-0.5">
              <span className="text-[10px] font-medium tracking-wider text-ink/40 dark:text-white/40 uppercase">
                Preparing Experience
              </span>
              <span className="text-[11px] font-semibold font-mono tracking-tight text-forest dark:text-emerald-400">
                {percent}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Emerald Hairline Gradient Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-forest dark:via-emerald-400 to-transparent shadow-xs" />
      </div>
    </div>
  );
}

export function PageTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <RoutePreloaderInner />
    </Suspense>
  );
}

/**
 * Programmatic helper to trigger the preloader before navigating
 */
export function navigateWithPreloader(url: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("dochomoeo:preloader-start", { detail: { url } })
    );
  }
}
