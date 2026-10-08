"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
export function TrustedBrands() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 360;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
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

        {/* Left flank botanical foliage with gentle blur */}
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-25 lg:opacity-30">
          <img
            src="/Images/PNGS/HeroLeftLeaves.webp"
            alt=""
            className="h-72 sm:h-96 w-auto object-contain filter blur-[0.6px]"
          />
        </div>

        {/* Right flank botanical foliage with gentle blur */}
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-20 lg:opacity-25 scale-x-[-1]">
          <img
            src="/Images/PNGS/HeroLeftLeaves.webp"
            alt=""
            className="h-64 sm:h-80 w-auto object-contain filter blur-[0.8px]"
          />
        </div>

        {/* Soft top connectivity blend */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#f6f2ea] to-transparent pointer-events-none" />

        {/* Soft bottom connectivity blend */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f6f2ea] to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Header - Centered with Clean Frosted Eyebrow */}
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-[#0c503b]/15 px-3.5 py-1 text-[0.72rem] font-bold text-[#0c503b] tracking-[0.2em] uppercase shadow-2xs">
            <span className="size-1.5 rounded-full bg-[#0c503b]" />
            <span>TRUSTED PARTNERS</span>
          </div>
          <h2
            id="brands-heading"
            className="mt-3 font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-[#071911] leading-tight"
          >
            Top Homeopathic Brands
          </h2>
          <p className="mt-2.5 text-[0.92rem] sm:text-[0.98rem] text-[#243d30] font-medium leading-relaxed max-w-lg mx-auto">
            Authentic formulations from globally accredited manufacturers, tested for clinical purity and safety.
          </p>
        </div>

        {/* Brand Carousel with Navigation Arrows */}
        <div className="relative mt-10 sm:mt-12 flex items-center">
          
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll brands left"
            className="hidden md:grid absolute -left-4 lg:-left-6 z-20 size-11 rounded-full bg-white/95 backdrop-blur-md border border-white shadow-[0_6px_22px_rgba(20,40,30,0.08)] place-items-center text-[#11241b] hover:bg-[#0c503b] hover:text-white hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <ChevronLeft className="size-5 stroke-[2.2]" />
          </button>

          {/* Cards Track with edge fade mask for seamless rail entry */}
          <div
            ref={scrollContainerRef}
            className="dh-rail-mask w-full flex items-center gap-4 sm:gap-5 overflow-x-auto scroll-smooth py-4 px-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {homeopathicBrands.map((brand) => (
              <Link
                key={brand.id}
                href={brand.href}
                className="group relative flex h-20 sm:h-[90px] w-42 sm:w-50 shrink-0 items-center justify-center rounded-2xl bg-white/85 hover:bg-white backdrop-blur-xl border border-white/90 shadow-[0_4px_20px_rgba(20,40,30,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:shadow-[0_12px_28px_rgba(12,80,59,0.12)] hover:-translate-y-1.5 px-4 transition-all duration-300"
              >
                <div className="transition-transform duration-300 group-hover:scale-105">
                  {brand.logo}
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll brands right"
            className="hidden md:grid absolute -right-4 lg:-right-6 z-20 size-11 rounded-full bg-white/95 backdrop-blur-md border border-white shadow-[0_6px_22px_rgba(20,40,30,0.08)] place-items-center text-[#11241b] hover:bg-[#0c503b] hover:text-white hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <ChevronRight className="size-5 stroke-[2.2]" />
          </button>

        </div>
      </div>
    </section>
  );
}
