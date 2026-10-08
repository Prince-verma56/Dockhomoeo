"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { healthGoals } from "@/data/mock/home";
import { gsap } from "@/lib/animation/gsap";

/**
 * HealthGoals Section
 *
 * Implements a grand, generously scaled floating frosted glass shelf:
 * 1. Prominent scale & height — luxury console proportions that feel substantial and harmonious.
 * 2. Large 3D botanical icons (82px-96px pedestals) with tactile presence and smooth hover lifts.
 * 3. Full, readable labels without any truncation ("Women's Health", "Sleep & Stress", etc.).
 * 4. Perfectly balanced vertical positioning after the Hero section without empty void gaps.
 * 5. Organic curved wave shape separator cradling the shelf and transitioning into Bestselling section.
 */
export function HealthGoals() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shelfRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const waveBackRef = useRef<HTMLDivElement | null>(null);
  const waveFrontRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll boundary to update button states
  const checkScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  // Scroll carousel left/right
  const handleScroll = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    track.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(checkScroll, 320);
  };

  // Setup GSAP Multi-Plane Parallax Animation
  useEffect(() => {
    if (!sectionRef.current || !shelfRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Floating Shelf Parallax: floats up smoothly as user scrolls
      gsap.to(shelfRef.current, {
        y: -26,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      // 2. Organic Wave Back Layer Parallax
      if (waveBackRef.current) {
        gsap.to(waveBackRef.current, {
          y: -18,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });
      }

      // 3. Organic Wave Front Layer Parallax
      if (waveFrontRef.current) {
        gsap.to(waveFrontRef.current, {
          y: -10,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.0,
            invalidateOnRefresh: true,
          },
        });
      }

      // 4. Smooth entrance reveal when section approaches viewport
      gsap.fromTo(
        shelfRef.current,
        { opacity: 0.92, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="health-goals"
      aria-label="Find remedies by health goal"
      className="relative z-20 bg-gradient-to-b from-[#f6f2ea] via-[#faf8f4] to-[#f6f2ea] pt-4 sm:pt-6 lg:pt-8 pb-20 sm:pb-24 lg:pb-28 overflow-hidden"
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. FLOATING FROSTED GLASS SHELF (Generously Scaled & Proportioned) */}
      {/* ----------------------------------------------------------------- */}
      <Container width="wide" className="relative z-20">
        <div
          ref={shelfRef}
          className="mx-auto w-full max-w-[1380px] rounded-[32px] sm:rounded-[40px] lg:rounded-[48px] bg-white/90 dark:bg-[#14231b]/90 backdrop-blur-2xl border border-white shadow-[0_24px_55px_-12px_rgba(20,40,30,0.1),0_2px_8px_rgba(0,0,0,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,1)] px-5 py-5 sm:px-8 sm:py-6 lg:px-9 lg:py-7 will-change-transform transition-shadow duration-300 hover:shadow-[0_28px_65px_-12px_rgba(20,40,30,0.14)]"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-5 lg:gap-6">
            
            {/* Left Header Block */}
            <div className="shrink-0 flex items-center justify-between md:block md:w-[220px] lg:w-[245px]">
              <div>
                <h2 className="text-[1.32rem] sm:text-[1.5rem] lg:text-[1.65rem] font-bold text-[#11241c] tracking-tight leading-[1.18]">
                  Find by Health Goal
                </h2>
                <p className="mt-1 text-[0.8rem] sm:text-[0.84rem] text-[#4d5e56] leading-relaxed">
                  Explore natural solutions for every stage of life.
                </p>
              </div>

              {/* Mobile Carousel Controls */}
              <div className="flex items-center gap-2 md:hidden">
                <button
                  type="button"
                  onClick={() => handleScroll("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous health goals"
                  className="size-9 rounded-full bg-white text-[#14251f] shadow-xs border border-line/60 flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                >
                  <ChevronLeft className="size-4.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll("right")}
                  disabled={!canScrollRight}
                  aria-label="Next health goals"
                  className="size-9 rounded-full bg-white text-[#14251f] shadow-xs border border-line/60 flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                >
                  <ChevronRight className="size-4.5" />
                </button>
              </div>
            </div>

            {/* Vertical Frosted Divider */}
            <div
              className="hidden md:block w-px h-20 bg-black/10 shrink-0 mx-1 lg:mx-2"
              aria-hidden="true"
            />

            {/* Desktop Left Carousel Control (<) */}
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous health goals"
              className="hidden md:flex size-10 lg:size-11 shrink-0 rounded-full bg-white hover:bg-white text-[#14251f] shadow-[0_3px_12px_rgba(0,0,0,0.08)] border border-[#e4eae6] items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="size-5" />
            </button>

            {/* Scrollable Track of Scaled-Up Botanical Health Goals */}
            <div
              ref={trackRef}
              onScroll={checkScroll}
              className="flex-1 flex items-center gap-3 sm:gap-4 lg:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-1.5 px-1"
            >
              {healthGoals.map((goal) => (
                <Link
                  key={goal.id}
                  href={goal.href}
                  className="group flex flex-col items-center shrink-0 w-[88px] sm:w-[98px] lg:w-[106px] select-none outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:rounded-2xl"
                >
                  {/* Generously Scaled Soft White Pedestal with 3D Botanical Sculpture */}
                  <div className="relative size-[78px] sm:size-[86px] lg:size-[94px] rounded-[20px] sm:rounded-[24px] bg-white border border-[#e0e6e2] shadow-[0_4px_14px_rgba(0,0,0,0.04)] group-hover:shadow-[0_10px_24px_rgba(13,90,67,0.15)] group-hover:-translate-y-1.5 transition-all duration-300 flex items-center justify-center p-2 overflow-hidden">
                    <img
                      src={goal.image || `/Images/HealthGoals/${goal.id}.webp`}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300 drop-shadow-xs"
                      loading="lazy"
                    />
                  </div>

                  {/* Clean, Full Non-Truncated Category Label */}
                  <span className="mt-2 text-[0.78rem] sm:text-[0.82rem] font-semibold text-[#182a22] group-hover:text-forest transition-colors text-center whitespace-nowrap tracking-tight">
                    {goal.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop Right Carousel Control (>) */}
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Next health goals"
              className="hidden md:flex size-10 lg:size-11 shrink-0 rounded-full bg-white hover:bg-white text-[#14251f] shadow-[0_3px_12px_rgba(0,0,0,0.08)] border border-[#e4eae6] items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </Container>

      {/* ----------------------------------------------------------------- */}
      {/* 2. ORGANIC CURVED SHAPE SEPARATOR (Parallax Wave to Bestsellers)  */}
      {/* ----------------------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden z-10 leading-none">
        {/* Back organic wave: soft translucent warm dune tint */}
        <div
          ref={waveBackRef}
          className="w-full will-change-transform translate-y-1"
        >
          <svg
            viewBox="0 0 1440 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-16 sm:h-24 lg:h-32 object-fill"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,45 C280,95 560,15 840,55 C1120,95 1320,25 1440,40 L1440,140 L0,140 Z"
              fill="#ede7dc"
              fillOpacity="0.6"
            />
          </svg>
        </div>

        {/* Front organic wave: matches next section's cream surface (#f6f2ea) */}
        <div
          ref={waveFrontRef}
          className="w-full will-change-transform -mt-10 sm:-mt-14 lg:-mt-20"
        >
          <svg
            viewBox="0 0 1440 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-16 sm:h-24 lg:h-32 object-fill drop-shadow-[0_-4px_12px_rgba(20,40,30,0.03)]"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,60 C320,110 580,25 880,60 C1160,95 1340,30 1440,50 L1440,140 L0,140 Z"
              fill="#f6f2ea"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
