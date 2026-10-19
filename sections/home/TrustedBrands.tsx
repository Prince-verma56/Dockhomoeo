"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShieldCheck, Award, Sparkles } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { SplitHeading } from "@/components/shared/SplitHeading";
import type { ApiBrand } from "@/types/api/home";

/**
 * Top Homeopathic Brand definitions matching the user's inspiration screenshot:
 * SBL, BOIRON, Dr. Reckeweg, Allen, Wheezal, Medisynth, Rudra, Schwabe, Bakson
 */
const homeopathicBrands = [
  {
    id: "sbl",
    name: "SBL Homoeopathy",
    href: "/products?brand=sbl",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-8 sm:h-9 w-auto">
        <text
          x="80"
          y="28"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="30"
          letterSpacing="0.05em"
          fill="#0c1110"
        >
          SBL
        </text>
        <line x1="20" y1="34" x2="140" y2="34" stroke="#0c1110" strokeWidth="2.5" />
        <line x1="20" y1="38" x2="140" y2="38" stroke="#0c1110" strokeWidth="1" />
        <text
          x="80"
          y="47"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          fontSize="6.5"
          letterSpacing="0.16em"
          fill="#0c1110"
        >
          WORLD CLASS HOMOEOPATHY
        </text>
      </svg>
    ),
  },
  {
    id: "boiron",
    name: "Boiron France",
    href: "/products?brand=boiron",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7 sm:h-8 w-auto">
        <text
          x="80"
          y="28"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="28"
          letterSpacing="0.1em"
          fill="#1352a2"
        >
          BOIRON
        </text>
        <path
          d="M 28 36 Q 80 44 132 36"
          stroke="#2ba84a"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 40 33 Q 80 39 120 33"
          stroke="#f6b800"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: "reckeweg",
    name: "Dr. Reckeweg Germany",
    href: "/products?brand=reckeweg",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7 sm:h-8 w-auto">
        <rect x="12" y="10" width="28" height="28" rx="6" fill="#d92d20" />
        <text
          x="26"
          y="29"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          fontSize="16"
          fill="#ffffff"
        >
          On
        </text>
        <text
          x="48"
          y="29"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          fontSize="16.5"
          fill="#14181f"
          letterSpacing="-0.02em"
        >
          Dr. Reckeweg
        </text>
      </svg>
    ),
  },
  {
    id: "allen",
    name: "Allen Homoeo",
    href: "/products?brand=allen",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7.5 sm:h-8.5 w-auto">
        <path
          d="M 28 38 C 22 28, 18 16, 28 12 C 34 10, 38 18, 33 26 C 30 30, 24 38, 38 38"
          stroke="#0d6b4a"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="28" cy="12" r="3" fill="#0d6b4a" />
        <text
          x="44"
          y="32"
          fontFamily="Georgia, serif"
          fontWeight="700"
          fontSize="26"
          fontStyle="italic"
          fill="#0f172a"
        >
          Allen
        </text>
        <text
          x="46"
          y="44"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          fontSize="5.5"
          letterSpacing="0.2em"
          fill="#0d6b4a"
        >
          A.L.L.E.N HOMOEOPATHY
        </text>
      </svg>
    ),
  },
  {
    id: "wheezal",
    name: "Wheezal Homoeopathy",
    href: "/products?brand=wheezal",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7.5 sm:h-8.5 w-auto">
        <path d="M 80 6 L 92 20 L 68 20 Z" fill="#207a48" />
        <path d="M 80 6 L 86 13 L 74 13 Z" fill="#f0aa14" />
        <text
          x="80"
          y="34"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="17"
          letterSpacing="0.08em"
          fill="#146d3e"
        >
          WHEEZAL
        </text>
        <text
          x="80"
          y="44"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          fontSize="5.5"
          letterSpacing="0.24em"
          fill="#1f3b2b"
        >
          HOMOEOPATHY
        </text>
      </svg>
    ),
  },
  {
    id: "medisynth",
    name: "Medisynth",
    href: "/products?brand=medisynth",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7 sm:h-8 w-auto">
        <path d="M 32 20 C 30 10, 20 12, 22 22 C 24 28, 32 24, 32 20 Z" fill="#2e9b52" />
        <path d="M 33 20 C 35 10, 45 12, 43 22 C 41 28, 33 24, 33 20 Z" fill="#e59819" />
        <line
          x1="32.5"
          y1="20"
          x2="32.5"
          y2="30"
          stroke="#2e9b52"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text
          x="50"
          y="28"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          fontSize="19"
          fill="#101828"
          letterSpacing="-0.02em"
        >
          Medisynth
        </text>
      </svg>
    ),
  },
  {
    id: "rudra",
    name: "Rudra",
    href: "/products?brand=rudra",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7 sm:h-8 w-auto">
        <circle cx="28" cy="24" r="10" fill="#881329" />
        <circle cx="28" cy="24" r="5" fill="#f4b5c1" />
        <text
          x="46"
          y="30"
          fontFamily="Georgia, serif"
          fontWeight="800"
          fontSize="23"
          fill="#111827"
          letterSpacing="-0.01em"
        >
          Rudra
        </text>
      </svg>
    ),
  },
  {
    id: "schwabe",
    name: "Dr. Willmar Schwabe",
    href: "/products?brand=schwabe",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7.5 sm:h-8.5 w-auto">
        <path d="M 28 10 L 38 18 L 38 30 L 28 38 L 18 30 L 18 18 Z" fill="#155734" />
        <text
          x="28"
          y="27"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="13"
          fill="#ffffff"
        >
          WS
        </text>
        <text
          x="46"
          y="24"
          fontFamily="Georgia, serif"
          fontWeight="800"
          fontSize="16"
          fill="#123d24"
        >
          Schwabe
        </text>
        <text
          x="47"
          y="36"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fontSize="6.5"
          letterSpacing="0.12em"
          fill="#4a6b57"
        >
          GERMANY / INDIA
        </text>
      </svg>
    ),
  },
  {
    id: "bakson",
    name: "Bakson's Homoeopathy",
    href: "/products?brand=bakson",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7.5 sm:h-8.5 w-auto">
        <rect x="18" y="14" width="22" height="22" rx="5" fill="#0f7654" />
        <path
          d="M 29 18 L 29 32 M 22 25 L 36 25"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <text
          x="48"
          y="26"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          fontSize="17"
          fill="#0f172a"
        >
          Bakson&apos;s
        </text>
        <text
          x="49"
          y="37"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fontSize="6.5"
          letterSpacing="0.14em"
          fill="#0f7654"
        >
          HOMOEOPATHY
        </text>
      </svg>
    ),
  },
  {
    id: "lord",
    name: "Lord's Homoeopathic Laboratory",
    href: "/products?brand=lords",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7.5 sm:h-8.5 w-auto">
        <text
          x="80"
          y="27"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontWeight="700"
          fontSize="24"
          letterSpacing="0.03em"
          fill="#111827"
        >
          Lord&apos;s
        </text>
        <text
          x="80"
          y="40"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          fontSize="6"
          letterSpacing="0.22em"
          fill="#0c503b"
        >
          HOMOEOPATHIC LABS
        </text>
      </svg>
    ),
  },
  {
    id: "dochomeo",
    name: "DocHomoeo",
    href: "/products?brand=dochomeo",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7 sm:h-8 w-auto">
        <text
          x="80"
          y="27"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          fontSize="18"
          letterSpacing="0.1em"
          fill="#0c503b"
        >
          DOCHOMОEO
        </text>
        <line x1="35" y1="33" x2="125" y2="33" stroke="#0c503b" strokeWidth="1" strokeOpacity="0.3" />
        <text
          x="80"
          y="42"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fontSize="6"
          letterSpacing="0.18em"
          fill="#475569"
        >
          CLINICAL EXCELLENCE
        </text>
      </svg>
    ),
  },
];

/**
 * TopHomeopathicBrands Section
 *
 * Implements the brand showcase slider matching the user's inspiration image:
 * - Eyebrow: "TRUSTED PARTNERS"
 * - Display heading: "Top Homeopathic Brands" (Warm serif Fraunces)
 * - Carousel navigation buttons (< and >)
 * - White rounded cards with authentic brand vector logos
 * - Dappled botanical ambiance
 */
/**
 * The hand-drawn wordmark for a catalogue brand, when one was drawn for it.
 * Matched on the brand's own slug or name, so "dr-reckeweg" or "Reckeweg &
 * Co." both find the Reckeweg mark; anything else gets its uploaded logo or
 * a typographic wordmark below.
 */
function drawnLogoFor(brand: ApiBrand) {
  const text = `${brand.slug} ${brand.name}`.toLowerCase();
  return homeopathicBrands.find((drawn) => text.includes(drawn.id) || drawn.id.includes(brand.slug.toLowerCase()))?.logo ?? null;
}

/**
 * The brands the shop actually stocks (GET /api/shop/home `brands`, the 18
 * with the most products), each linking to its brand page. When the shop has
 * none, the drawn maker logos stand in, each opening a search for that maker.
 */
export function TrustedBrands({ brands }: { brands: ApiBrand[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The shop's own brands when it has any; otherwise the makers drawn for this
  // section, each opening a search for that maker (never a brand page that may not exist).
  const tiles =
    brands.length > 0
      ? brands.map((brand) => ({
          key: String(brand.id),
          href: `/brands/${encodeURIComponent(brand.slug)}`,
          label: `${brand.name}, ${brand.productCount} ${brand.productCount === 1 ? "product" : "products"}`,
          logo:
            drawnLogoFor(brand) ??
            (brand.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- logos are any size and format the admin uploads
              <img
                src={brand.logoUrl}
                alt=""
                draggable={false}
                className="max-h-12 w-auto max-w-36 object-contain pointer-events-none select-none"
                loading="lazy"
              />
            ) : (
              <span className="block max-w-36 text-center font-display text-lg leading-tight font-semibold tracking-tight text-[#0c1110] dark:text-white">
                {brand.name}
              </span>
            )),
        }))
      : homeopathicBrands.map((brand) => ({
          key: brand.id,
          href: `/products?q=${encodeURIComponent(brand.id)}`,
          label: `Search for ${brand.name}`,
          logo: brand.logo,
        }));

  // Render 3 consecutive sets for seamless 360-degree looping without any edge boundaries
  const displayTiles = [...tiles, ...tiles, ...tiles];

  // Continuous, butter-smooth auto-scroller moving towards the left
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Center scroll position on mount
    const initOffset = container.scrollWidth / 3;
    if (container.scrollLeft === 0 && initOffset > 0) {
      container.scrollLeft = initOffset;
    }

    let animationFrameId: number;
    let lastTime = performance.now();
    const pixelsPerSecond = 46; // Calm, steady reading velocity

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (container && !isHoveredRef.current && !isDraggingRef.current) {
        // Move to the left continuously
        container.scrollLeft += pixelsPerSecond * dt;

        const loopSegment = container.scrollWidth / 3;
        if (loopSegment > 0) {
          if (container.scrollLeft >= loopSegment * 2) {
            container.scrollLeft -= loopSegment;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += loopSegment;
          }
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [tiles.length]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);

    const scrollAmount = 360;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    resumeTimeoutRef.current = setTimeout(() => {
      isDraggingRef.current = false;
    }, 1400);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.pageX - container.offsetLeft;
    dragScrollLeftRef.current = container.scrollLeft;
    hasMovedRef.current = false;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - dragStartXRef.current) * 1.25;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    container.scrollLeft = dragScrollLeftRef.current - walk;

    const loopSegment = container.scrollWidth / 3;
    if (loopSegment > 0) {
      if (container.scrollLeft >= loopSegment * 2) {
        container.scrollLeft -= loopSegment;
        dragScrollLeftRef.current -= loopSegment;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += loopSegment;
        dragScrollLeftRef.current += loopSegment;
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    resumeTimeoutRef.current = setTimeout(() => {
      isDraggingRef.current = false;
    }, 1400);
  };

  const handleTouchStart = () => {
    isDraggingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleTouchEnd = () => {
    resumeTimeoutRef.current = setTimeout(() => {
      isDraggingRef.current = false;
    }, 1400);
  };

  return (
    <section
      id="brands-section"
      aria-labelledby="brands-heading"
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#f6f2ea] via-[#fbf8f2] to-[#f6f2ea] py-16 sm:py-20 lg:py-24"
    >
      {/* 1. Ambient lighting & botanical background connectivity */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
      >
        {/* Central soft organic green-gold radial aura */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(218,234,223,0.45)_0%,transparent_100%)]" />

        {/* Ambient atmospheric aura */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.03] via-transparent to-emerald-500/[0.03] pointer-events-none" />

        {/* Soft top connectivity blend */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#f6f2ea] to-transparent pointer-events-none" />

        {/* Soft bottom connectivity blend */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f6f2ea] to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Header - Centered with Clean Frosted Eyebrow */}
        <div className="text-center max-w-xl mx-auto">
          <Reveal y={12} delay={0}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 dark:bg-white/10 backdrop-blur-md border border-[#0c503b]/20 px-3.5 py-1 text-[0.72rem] font-bold text-[#0c503b] dark:text-emerald-400 tracking-[0.2em] uppercase shadow-2xs">
              <span className="size-1.5 rounded-full bg-[#0c503b] dark:bg-emerald-400 animate-pulse" />
              <span>TRUSTED PARTNERS</span>
            </div>
          </Reveal>
          <SplitHeading
            id="brands-heading"
            lines={["Top Homeopathic Brands"]}
            delay={0.06}
            className="mt-3 font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-[#071911] dark:text-white leading-tight"
          />
          <Reveal y={16} delay={0.14}>
            <p className="mt-2.5 text-[0.92rem] sm:text-[0.98rem] text-[#243d30] dark:text-emerald-100/80 font-medium leading-relaxed max-w-lg mx-auto">
              Authentic formulations from globally accredited manufacturers, tested for clinical purity and safety.
            </p>
          </Reveal>
        </div>

        {/* Brand Carousel with Navigation Arrows & Continuous Left Auto-Scroll */}
        <Reveal y={20} delay={0.18} scale={0.98} className="relative mt-10 sm:mt-12 flex items-center">
          
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll brands left"
            className="hidden md:grid absolute -left-3 lg:-left-5 z-20 size-11 lg:size-12 rounded-full bg-white/95 dark:bg-[#11241b]/95 backdrop-blur-md border border-black/8 dark:border-white/15 shadow-[0_6px_22px_rgba(20,40,30,0.1)] place-items-center text-[#11241b] dark:text-white hover:bg-[#0c503b] hover:text-white hover:scale-108 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <ChevronLeft className="size-5 stroke-[2.2]" />
          </button>

          {/* Masked Continuous Auto-Scroll Track */}
          <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => {
                isHoveredRef.current = true;
              }}
              onMouseLeave={() => {
                isHoveredRef.current = false;
                handleMouseUp();
              }}
              className="w-full flex items-center gap-4 sm:gap-5 lg:gap-6 overflow-x-auto scrollbar-none py-5 px-3 select-none cursor-grab active:cursor-grabbing"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {displayTiles.map((tile, idx) => (
                <Link
                  key={`${tile.key}-${idx}`}
                  href={tile.href}
                  aria-label={tile.label}
                  draggable={false}
                  onClick={(e) => {
                    if (hasMovedRef.current) e.preventDefault();
                  }}
                  className="group relative flex h-20 sm:h-[92px] lg:h-[100px] w-44 sm:w-52 lg:w-56 shrink-0 items-center justify-center rounded-[22px] sm:rounded-[26px] bg-white/95 dark:bg-[#12221b]/95 hover:bg-white backdrop-blur-xl border border-black/[0.06] dark:border-white/10 shadow-[0_4px_22px_rgba(20,40,30,0.05),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:border-[#0c503b]/35 hover:shadow-[0_16px_36px_rgba(12,80,59,0.14)] hover:-translate-y-1.5 px-4 sm:px-6 transition-all duration-300"
                >
                  <div className="transition-transform duration-300 group-hover:scale-108 pointer-events-none select-none flex items-center justify-center">
                    {tile.logo}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll brands right"
            className="hidden md:grid absolute -right-3 lg:-right-5 z-20 size-11 lg:size-12 rounded-full bg-white/95 dark:bg-[#11241b]/95 backdrop-blur-md border border-black/8 dark:border-white/15 shadow-[0_6px_22px_rgba(20,40,30,0.1)] place-items-center text-[#11241b] dark:text-white hover:bg-[#0c503b] hover:text-white hover:scale-108 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <ChevronRight className="size-5 stroke-[2.2]" />
          </button>

        </Reveal>

        {/* Trust Accreditation Pill Bar */}
        <Reveal y={12} delay={0.24}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-[13px] text-[#2e473b] dark:text-emerald-300/85 font-medium select-none">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-[#0c503b] dark:text-emerald-400" />
              100% Genuine &amp; Sealed
            </span>
            <span className="hidden sm:inline text-black/20 dark:text-white/20">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Award className="size-4 text-[#0c503b] dark:text-emerald-400" />
              GMP &amp; German Ph. Eur. Accredited
            </span>
            <span className="hidden sm:inline text-black/20 dark:text-white/20">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-4 text-[#0c503b] dark:text-emerald-400" />
              Direct Licensed Manufacturer Supply
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
