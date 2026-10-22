"use client";

import { useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { gsap } from "@/lib/animation/gsap";
import { prefersReducedMotion } from "@/lib/animation/motion";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/Images/LogoGIF/dochomoeo_logo_final_frame.png";
const LOGO_DARK_SRC = "/Images/LogoGIF/dochomoeo_logo_dark.png";

function getRouteSubtitle(url: string): string {
  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    const pathname = parsed.pathname;
    if (pathname === "/") return "Welcome to DocHomoeo";
    if (pathname.startsWith("/favourites")) return "Holistic Care & Favourites";
    if (pathname.startsWith("/doctors")) return "Holistic Care & Expert Doctors";
    if (pathname.startsWith("/products")) return "Curated Natural Remedies";
    if (pathname.startsWith("/categories")) return "Classical Formulations & Categories";
    if (pathname.startsWith("/brands")) return "Certified Pharmacopoeial Brands";
    if (pathname.startsWith("/insights") || pathname.startsWith("/blog")) return "Evidence & Health Insights";
    if (pathname.startsWith("/contact")) return "Patient Support & Consultation";
    if (pathname.startsWith("/cart")) return "Your Remedies & Cart";
    if (pathname.startsWith("/checkout")) return "Secure Holistic Checkout";
    if (pathname.startsWith("/login") || pathname.startsWith("/account")) return "Personalized Patient Portal";
  } catch {}
  return "Holistic Care & Wellness";
}

type TransitionState = "idle" | "pulling" | "covering" | "navigating" | "revealing";

/**
 * Global Bridge Helpers:
 * Dispatches standard window events so gesture and router coordination
 * remain 100% resilient across chunk boundaries and avoid React re-renders.
 */
export function setInteractiveTransitionProgress(progress: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("dochomoeo:curtain-pull", { detail: { progress } })
    );
  }
}

export function cancelInteractiveTransition() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dochomoeo:curtain-cancel"));
  }
}

export function commitInteractiveTransition(targetUrl: string = "/favourites") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("dochomoeo:curtain-commit", { detail: { targetUrl } })
    );
  }
}

export function navigateWithTransition(url: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("dochomoeo:route-transition", { detail: { url } })
    );
  }
}

export function navigateWithPreloader(url: string) {
  navigateWithTransition(url);
}

/**
 * RouteTransitionInner:
 * Coordinates the full-viewport warm ivory curtain transition.
 * State machine: idle → pulling → covering → navigating → revealing → idle
 */
function RouteTransitionInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const containerRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const crestRef = useRef<HTMLDivElement>(null);
  const crestSubtitleRef = useRef<HTMLParagraphElement>(null);

  const stateRef = useRef<TransitionState>("idle");
  const targetRouteRef = useRef<string | null>(null);
  const failsafeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize GSAP position on mount without CSS transform conflicts
  useEffect(() => {
    if (curtainRef.current) {
      gsap.set(curtainRef.current, { yPercent: -100 });
    }
  }, []);

  const clearFailsafe = () => {
    if (failsafeTimerRef.current) {
      clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
  };

  /**
   * Stage D: Destination Reveal
   * Glides the warm ivory curtain UP into the top edge to uncover the destination page.
   */
  const executeReveal = useCallback(() => {
    if (stateRef.current === "revealing" || stateRef.current === "idle") return;
    stateRef.current = "revealing";
    clearFailsafe();

    const curtain = curtainRef.current;
    const crest = crestRef.current;
    const container = containerRef.current;

    if (!curtain || !container) {
      stateRef.current = "idle";
      return;
    }

    if (prefersReducedMotion()) {
      gsap.to(curtain, {
        opacity: 0,
        duration: 0.18,
        onComplete: () => {
          gsap.set(curtain, { yPercent: -100, opacity: 1 });
          curtain.style.visibility = "hidden";
          container.style.pointerEvents = "none";
          stateRef.current = "idle";
          targetRouteRef.current = null;
        },
      });
      return;
    }

    gsap.killTweensOf([curtain, crest]);

    const exitTl = gsap.timeline({
      onComplete: () => {
        container.style.pointerEvents = "none";
        curtain.style.visibility = "hidden";
        gsap.set(curtain, { yPercent: -100 });
        stateRef.current = "idle";
        targetRouteRef.current = null;
      },
    });

    if (crest) {
      exitTl.to(
        crest,
        {
          opacity: 0,
          y: -20,
          scale: 0.96,
          duration: 0.24,
          ease: "power2.in",
        },
        0
      );
    }

    exitTl.to(
      curtain,
      {
        yPercent: -100,
        duration: 0.82,
        ease: "power2.inOut",
      },
      crest ? 0.06 : 0
    );
  }, []);

  // When pathname or searchParams updates, destination route has mounted
  useEffect(() => {
    if (stateRef.current !== "navigating") return;

    // Dignified pause while covered so the transition feels physical, silky, and premium
    const timer = setTimeout(() => {
      executeReveal();
    }, 350);

    return () => clearTimeout(timer);
  }, [pathname, searchParams, executeReveal]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearFailsafe();
    };
  }, []);

  /**
   * Listen for window events:
   * - Pulling gesture (real-time 1:1 progress)
   * - Gesture Cancel (spring back up)
   * - Gesture Commit (complete cover, navigate, reveal)
   * - Standard Route Transition (programmatic or link clicks)
   */
  useEffect(() => {
    const handleCurtainPull = (event: Event) => {
      const customEvent = event as CustomEvent<{ progress: number }>;
      const rawProgress = customEvent.detail?.progress ?? 0;
      const progress = Math.max(0, Math.min(1, rawProgress));

      if (stateRef.current !== "idle" && stateRef.current !== "pulling") return;
      stateRef.current = "pulling";

      const curtain = curtainRef.current;
      const crest = crestRef.current;
      const container = containerRef.current;
      if (!curtain || !container) return;

      container.style.pointerEvents = "none";
      curtain.style.visibility = "visible";

      gsap.killTweensOf([curtain, crest]);

      // Map progress (0 -> 1) directly to viewport cover (-100% -> 0%)
      const targetY = -100 + progress * 100;
      gsap.set(curtain, { yPercent: targetY, opacity: 1 });

      if (crest) {
        const crestOpacity = Math.max(0, (progress - 0.2) / 0.5);
        const crestY = (1 - progress) * -22;
        gsap.set(crest, {
          opacity: crestOpacity,
          y: crestY,
          scale: 0.92 + progress * 0.08,
        });
      }
    };

    const handleCurtainCancel = () => {
      if (stateRef.current !== "pulling") return;

      const curtain = curtainRef.current;
      const crest = crestRef.current;
      const container = containerRef.current;
      if (!curtain || !container) return;

      gsap.killTweensOf([curtain, crest]);

      gsap.to(curtain, {
        yPercent: -100,
        duration: 0.46,
        ease: "power2.out",
        onComplete: () => {
          curtain.style.visibility = "hidden";
          container.style.pointerEvents = "none";
          stateRef.current = "idle";
        },
      });

      if (crest) {
        gsap.to(crest, { opacity: 0, duration: 0.25 });
      }
    };

    const handleCurtainCommit = (event: Event) => {
      const customEvent = event as CustomEvent<{ targetUrl?: string }>;
      const targetUrl = customEvent.detail?.targetUrl || "/favourites";

      if (
        stateRef.current === "covering" ||
        stateRef.current === "navigating" ||
        stateRef.current === "revealing"
      ) {
        return;
      }

      stateRef.current = "covering";
      targetRouteRef.current = targetUrl;

      const curtain = curtainRef.current;
      const crest = crestRef.current;
      const container = containerRef.current;
      if (!curtain || !container) return;

      // Update subtitle dynamically based on destination
      if (crestSubtitleRef.current) {
        crestSubtitleRef.current.textContent = getRouteSubtitle(targetUrl);
      }

      container.style.pointerEvents = "auto";
      curtain.style.visibility = "visible";

      // 4.5s Failsafe to guarantee curtain NEVER remains stuck
      clearFailsafe();
      failsafeTimerRef.current = setTimeout(() => {
        executeReveal();
      }, 4500);

      gsap.killTweensOf([curtain, crest]);

      if (prefersReducedMotion()) {
        gsap.set(curtain, { yPercent: 0, opacity: 1 });
        if (crest) gsap.set(crest, { opacity: 1 });
        stateRef.current = "navigating";
        router.push(targetUrl);
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        return;
      }

      // Buttery smooth curtain expansion to 100% cover
      const tl = gsap.timeline({
        onComplete: () => {
          // Outgoing page is now fully covered
          stateRef.current = "navigating";

          const currentPath =
            window.location.pathname + window.location.search;
          if (
            currentPath === targetUrl ||
            (targetUrl === "/favourites" &&
              window.location.pathname === "/favourites")
          ) {
            setTimeout(() => executeReveal(), 320);
            return;
          }

          router.push(targetUrl);
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        },
      });

      tl.to(curtain, {
        yPercent: 0,
        duration: 0.88,
        ease: "power2.out",
      });

      if (crest) {
        tl.to(
          crest,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.52,
            ease: "power2.out",
          },
          "-=0.48"
        );
      }
    };

    const handleStandardNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<{ url?: string }>;
      const targetUrl = customEvent.detail?.url;
      if (!targetUrl) return;

      if (stateRef.current !== "idle") return;
      stateRef.current = "covering";
      targetRouteRef.current = targetUrl;

      const curtain = curtainRef.current;
      const crest = crestRef.current;
      const container = containerRef.current;
      if (!curtain || !container) return;

      if (crestSubtitleRef.current) {
        crestSubtitleRef.current.textContent = getRouteSubtitle(targetUrl);
      }

      container.style.pointerEvents = "auto";
      curtain.style.visibility = "visible";

      clearFailsafe();
      failsafeTimerRef.current = setTimeout(() => {
        executeReveal();
      }, 4500);

      gsap.killTweensOf([curtain, crest]);

      if (prefersReducedMotion()) {
        gsap.set(curtain, { yPercent: 0, opacity: 1 });
        if (crest) gsap.set(crest, { opacity: 1 });
        stateRef.current = "navigating";
        router.push(targetUrl);
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          stateRef.current = "navigating";
          router.push(targetUrl);
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        },
      });

      tl.fromTo(
        curtain,
        { yPercent: -100, opacity: 1 },
        {
          yPercent: 0,
          duration: 0.68,
          ease: "power2.out",
        }
      );

      if (crest) {
        tl.fromTo(
          crest,
          { opacity: 0, scale: 0.9, y: -22 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.44,
            ease: "power2.out",
          },
          "-=0.38"
        );
      }
    };

    window.addEventListener("dochomoeo:curtain-pull", handleCurtainPull);
    window.addEventListener("dochomoeo:curtain-cancel", handleCurtainCancel);
    window.addEventListener("dochomoeo:curtain-commit", handleCurtainCommit);
    window.addEventListener("dochomoeo:route-transition", handleStandardNavigate);
    window.addEventListener("dochomoeo:preloader-start", handleStandardNavigate);

    return () => {
      window.removeEventListener("dochomoeo:curtain-pull", handleCurtainPull);
      window.removeEventListener("dochomoeo:curtain-cancel", handleCurtainCancel);
      window.removeEventListener("dochomoeo:curtain-commit", handleCurtainCommit);
      window.removeEventListener("dochomoeo:route-transition", handleStandardNavigate);
      window.removeEventListener("dochomoeo:preloader-start", handleStandardNavigate);
    };
  }, [router, executeReveal]);

  // Intercept internal route and tab links for a silky, seamless transition preloader
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      // Ignore links explicitly opting out or opening elsewhere
      if (
        anchor.hasAttribute("data-no-transition") ||
        anchor.hasAttribute("data-no-curtain") ||
        anchor.getAttribute("target") === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const rawHref = anchor.getAttribute("href");
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("javascript:")
      ) {
        return;
      }

      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        // Only internal links within the same origin
        if (targetUrl.origin !== window.location.origin) return;

        // Skip if staying on the same page (e.g. query param changes, filters, date tabs, or in-page hashes)
        if (targetUrl.pathname === window.location.pathname) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        navigateWithTransition(targetUrl.pathname + targetUrl.search + targetUrl.hash);
      } catch {}
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-[999999] pointer-events-none select-none overflow-hidden"
    >
      {/* Fullscreen Warm Ivory Transition Curtain Sheet with Tactile Curved Edge */}
      <div
        ref={curtainRef}
        style={{ visibility: "hidden" }}
        className={cn(
          "absolute inset-0 w-full h-full will-change-transform",
          // Warm porcelain / soft ivory linen surface
          "bg-gradient-to-b from-[#fdfcf9] via-[#f7f3eb] to-[#f0e9dc]",
          "dark:from-[#081a13] dark:via-[#0c241b] dark:to-[#0f2d22]",
          // Soft lower-edge depth shadow
          "shadow-[0_30px_90px_rgba(13,90,67,0.25),0_12px_36px_rgba(0,0,0,0.14)]",
          "border-b-[3px] border-[#0d5a43] dark:border-emerald-400/90",
          "rounded-b-[2.5rem]",
          "flex flex-col items-center justify-center overflow-hidden"
        )}
      >
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,_rgba(13,90,67,0.06),transparent_70%)] pointer-events-none" />

        {/* Fine Gold Hairline Accent Above Deep Green Edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#d4af37]/80 to-transparent pointer-events-none" />

        {/* Central Monogram Crest */}
        <div
          ref={crestRef}
          className="relative z-10 flex flex-col items-center justify-center text-center px-6 select-none opacity-0"
        >
          {/* Large Unboxed Brand Logo with Ambient Glow and Specular Liquid Light Animation */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Soft Ambient Radial Halo that pulses behind the logo */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-10 sm:-inset-14 rounded-full bg-[radial-gradient(circle,_rgba(13,90,67,0.18)_0%,_transparent_72%)] dark:bg-[radial-gradient(circle,_rgba(52,211,153,0.16)_0%,_transparent_72%)] animate-preloader-halo blur-2xl"
            />

            {/* Logo Container: Generous Size with Breathing Levitation Animation */}
            <div className="relative w-[230px] sm:w-[280px] md:w-[320px] aspect-[890/560] animate-preloader-float">
              {/* Light Theme: Vibrant Botanical Brand Logo */}
              <img
                src={LOGO_SRC}
                alt="DocHomoeo"
                width={890}
                height={560}
                className="size-full object-contain pointer-events-none select-none drop-shadow-[0_12px_28px_rgba(13,90,67,0.14)] block dark:hidden"
              />

              {/* Dark Theme: Crisp Luminous Inverted Wordmark */}
              <img
                src={LOGO_DARK_SRC}
                alt="DocHomoeo"
                width={890}
                height={560}
                className="size-full object-contain pointer-events-none select-none drop-shadow-[0_12px_28px_rgba(16,185,129,0.18)] hidden dark:block"
              />

              {/* Liquid Specular Light Sweep Animation Masked Directly to Logo Shapes */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{
                  WebkitMaskImage: `url('${LOGO_SRC}')`,
                  maskImage: `url('${LOGO_SRC}')`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              >
                <span className="logo-shine-beam-loop absolute inset-y-0 w-2/5 bg-gradient-to-r from-transparent via-white/85 to-transparent pointer-events-none" />
              </span>
            </div>

            {/* Elegant Subtitle and Micro-Progress Shimmer Line */}
            <div className="mt-2 sm:mt-3 flex flex-col items-center gap-2">
              <p
                ref={crestSubtitleRef}
                className="text-[11px] sm:text-[12px] font-semibold tracking-[0.34em] uppercase text-[#0d5a43] dark:text-emerald-400 drop-shadow-xs"
              >
                Holistic Care &amp; Wellness
              </p>

              {/* Fine Luxury Accent Line with Center Shimmer */}
              <div className="relative w-28 sm:w-36 h-[1.5px] overflow-hidden rounded-full bg-[#0d5a43]/15 dark:bg-white/15">
                <div className="animate-preloader-shimmer absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <RouteTransitionInner />
    </Suspense>
  );
}
