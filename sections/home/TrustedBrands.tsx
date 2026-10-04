"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSectionTimeline } from "@/lib/animation/sectionTimeline";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

/**
 * Top Homeopathic Brand definitions with authentic heritage, country of origin,
 * pharmacopoeia standard, verified vector logos, and category badges:
 */
const homeopathicBrands = [
  {
    id: "rudra",
    name: "Rudra",
    badge: "🌿 CLASSICAL EXTRACTS",
    badgeClass: "bg-[#0c503b]/8 text-[#0c503b] border-[#0c503b]/15",
    origin: "Classical Extracts",
    speciality: "Certified Botanical Potencies",
    standard: "Pure Pharmacopoeial Grade",
    href: "/products?brand=rudra",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7 sm:h-8 w-auto">
        <circle cx="28" cy="24" r="10" fill="#991b1b" />
        <circle cx="28" cy="24" r="4.5" fill="#ffffff" />
        <text
          x="46"
          y="31"
          fontFamily="Georgia, serif"
          fontWeight="800"
          fontSize="22"
          fill="#111827"
          letterSpacing="-0.01em"
        >
          Rudra
        </text>
      </svg>
    ),
  },
  {
    id: "boiron",
    name: "Boiron France",
    badge: "FR FRANCE · EST. 1932",
    badgeClass: "bg-[#1352a2]/8 text-[#1352a2] border-[#1352a2]/15",
    origin: "🇫🇷 France · Est. 1932",
    speciality: "World Leader in Homeopathy",
    standard: "European Pharmacopoeia",
    href: "/products?brand=boiron",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7 sm:h-8 w-auto">
        <text
          x="80"
          y="28"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="27"
          letterSpacing="0.08em"
          fill="#1352a2"
        >
          BOIRON
        </text>
        <path
          d="M 28 36 Q 80 43 132 36"
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
    badge: "DE GERMANY · BENSHEIM",
    badgeClass: "bg-[#d92d20]/8 text-[#b42318] border-[#d92d20]/15",
    origin: "🇩🇪 Germany · Bensheim",
    speciality: "R-Series Specialties & Dilutions",
    standard: "German Pharmacopoeia (HAB)",
    href: "/products?brand=reckeweg",
    logo: (
      <svg viewBox="0 0 160 50" fill="none" className="h-7 sm:h-8 w-auto">
        <rect x="10" y="10" width="28" height="28" rx="6" fill="#d92d20" />
        <text
          x="24"
          y="29"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          fontSize="13.5"
          fill="#ffffff"
        >
          Dr.
        </text>
        <text
          x="46"
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
    id: "schwabe",
    name: "Dr. Willmar Schwabe",
    badge: "DE GERMANY · EST. 1866",
    badgeClass: "bg-[#155734]/8 text-[#155734] border-[#155734]/15",
    origin: "🇩🇪 Germany · Est. 1866",
    speciality: "150+ Years Global Pioneer",
    standard: "Standardised Phyto-Extracts",
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
    id: "sbl",
    name: "SBL Homoeopathy",
    badge: "IN INDIA · GLOBAL PRESENCE",
    badgeClass: "bg-neutral-800/8 text-neutral-800 border-neutral-800/15",
    origin: "🇮🇳 India · Global Presence",
    speciality: "Classical Dilutions & Pellets",
    standard: "US-FDA Registered & GMP",
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
    id: "allen",
    name: "Allen Homoeo",
    badge: "IN INDIA · EST. 1969",
    badgeClass: "bg-[#0d6b4a]/8 text-[#0d6b4a] border-[#0d6b4a]/15",
    origin: "🇮🇳 India · Est. 1969",
    speciality: "Pure Mother Tinctures & Salts",
    standard: "ISO 9001:2015 & GMP",
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
    badge: "IN INDIA · DEHRADUN",
    badgeClass: "bg-[#146d3e]/8 text-[#146d3e] border-[#146d3e]/15",
    origin: "🇮🇳 India · Dehradun",
    speciality: "Clinical Formulations & Syrups",
    standard: "WHO-GMP Certified Facility",
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
    badge: "IN INDIA · MUMBAI",
    badgeClass: "bg-[#2e9b52]/8 text-[#2e9b52] border-[#2e9b52]/15",
    origin: "🇮🇳 India · Mumbai",
    speciality: "Clean Botanical Tinctures",
    standard: "cGMP Certified Formulation",
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
    id: "bakson",
    name: "Bakson's Homoeopathy",
    badge: "IN INDIA · NEW DELHI",
    badgeClass: "bg-[#0f7654]/8 text-[#0f7654] border-[#0f7654]/15",
    origin: "🇮🇳 India · New Delhi",
    speciality: "Clinical Line & Family Wellness",
    standard: "Standardised Quality Lab",
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
 * 4 Clinical Quality Pillars for the Accreditation Ribbon
 */
const qualityPillars = [
  {
    icon: ShieldCheck,
    title: "100% Direct Lab Sourcing",
    detail: "Zero Intermediaries; tamper-evident sealed packaging",
  },
  {
    icon: Award,
    title: "Pharmacopoeia Standards",
    detail: "Compliant with German (HAB), French & Indian HPI",
  },
  {
    icon: FlaskConical,
    title: "Batch Purity Tested",
    detail: "Chromatography verified for active botanical levels",
  },
  {
    icon: HeartHandshake,
    title: "Doctor Recommended",
    detail: "Prescribed daily by 500+ certified practitioners",
  },
];

/**
 * TopHomeopathicBrands Section
 * Uses authentic architectural apothecary background (TestimonialsBg.png)
 * with frosted glass accreditation cards and quality assurance ribbon.
 */
export function TrustedBrands() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [inView, setInView] = useState(false);

  // Brand marks get presence, not travel — a logo rail that slides in reads
  // cheap, and the rail is already drifting on its own.
  const sectionRef = useSectionTimeline<HTMLElement>([
    { sel: "[data-r-eyebrow]", variant: "rise", at: 0 },
    { sel: "[data-r-head]", variant: "rise", at: 0.12 },
    { sel: "[data-r-copy]", variant: "rise", at: 0.24 },
    { sel: "[data-r-rail]", variant: "bloom", at: 0.38 },
    { sel: "[data-r-pillar]", variant: "bloom", at: 0.54 },
  ]);

  // Manual scroll handler
  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 360;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // The drift loop used to run for the life of the page, burning a frame
  // callback even while the section was nowhere near the viewport.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    io.observe(container);
    return () => io.disconnect();
  }, []);

  // Auto-scroll drift effect that pauses on user hover
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !inView) return;

    let animationFrameId: number;
    const speed = 0.55; // Gentle luxury drift speed

    const step = () => {
      if (!isPaused && container) {
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 2) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += speed;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, inView]);

  return (
    <section
      ref={sectionRef}
      id="brands-section"
      aria-labelledby="brands-heading"
      className="relative w-full overflow-hidden pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24"
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. SCENIC ARCHITECTURAL APOTHECARY BACKGROUND IMAGE & LIGHTING    */}
      {/* ----------------------------------------------------------------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none overflow-hidden -z-10"
      >
        <img
          src="/Images/TestimonialsBg.webp"
          alt=""
          className="size-full object-cover object-[center_35%]"
        />
        {/* Soft warm daylight overlay preserving authentic stone texture while ensuring contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f6f2ea]/30 via-transparent to-[#f6f2ea]/40" />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. ATMOSPHERIC BOUNDARY TRANSITIONS                               */}
      {/* ----------------------------------------------------------------- */}
      <div aria-hidden className="dh-section-blend-top" />
      <div aria-hidden className="dh-section-blend-bottom" />

      {/* ----------------------------------------------------------------- */}
      {/* 3. MAIN SECTION CONTENT                                           */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative z-20 mx-auto w-full max-w-[1580px] px-4 sm:px-6 lg:px-10 xl:px-12">
        
        {/* Header - Prestige Centered Eyebrow & Display Headline */}
        <div className="text-center max-w-2xl mx-auto">
          <div
            data-r-eyebrow
            data-reveal
            className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md border border-[#0c503b]/20 px-4 py-1.5 text-[0.72rem] font-bold text-[#0c503b] tracking-[0.2em] uppercase shadow-2xs"
          >
            <span className="size-1.5 rounded-full bg-[#0c503b] animate-pulse" />
            <span>CLINICALLY CERTIFIED PARTNERS</span>
          </div>

          <h2
            data-r-head
            data-reveal
            id="brands-heading"
            className="mt-3.5 font-sans text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-[#071d13] leading-tight"
          >
            Top Homeopathic Brands
          </h2>

          <p
            data-r-copy
            data-reveal
            className="mt-2.5 text-[0.92rem] sm:text-[0.98rem] text-[#243d30] font-medium leading-relaxed max-w-xl mx-auto"
          >
            Collaborating exclusively with certified global homeopathic laboratories adhering to German (HAB), French, and Indian Pharmacopoeia standards.
          </p>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* 4. LUXURY ACCREDITATION PASSPORT CARDS CAROUSEL                 */}
        {/* --------------------------------------------------------------- */}
        <div
          data-r-rail
          data-reveal
          className="relative mt-9 sm:mt-11 flex items-center"
          onMouseEnter={() => setIsPaused(false)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll brands left"
            className="hidden md:grid absolute -left-3 lg:-left-5 z-30 size-11 lg:size-12 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-white/80 shadow-[0_4px_20px_rgba(20,40,30,0.1)] place-items-center text-[#11241b] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <ChevronLeft className="size-5 stroke-[2.2]" />
          </button>

          {/* Cards Track with edge fade rail mask for seamless continuous drift */}
          <div
            ref={scrollContainerRef}
            className="dh-rail-mask w-full flex items-center gap-4 sm:gap-5 overflow-x-auto scroll-smooth py-5 px-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Duplicated list to enable seamless infinite scroll drift */}
            {[...homeopathicBrands, ...homeopathicBrands].map((brand, idx) => (
              <Link
                key={`${brand.id}-${idx}`}
                href={brand.href}
                className="group relative flex flex-col justify-between h-[155px] sm:h-[168px] w-[230px] sm:w-[255px] shrink-0 rounded-2xl sm:rounded-3xl bg-white/85 hover:bg-white backdrop-blur-xl border border-white/90 p-4 sm:p-4.5 shadow-[0_8px_28px_rgba(20,40,30,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)] hover:shadow-[0_18px_40px_rgba(12,80,59,0.14)] hover:-translate-y-1.5 transition-all duration-300 select-none"
              >
                {/* Top: Origin chip & Verified Checkmark */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.66rem] sm:text-[0.68rem] font-bold tracking-wider uppercase border ${brand.badgeClass}`}
                  >
                    {brand.badge}
                  </span>
                  <ShieldCheck className="size-4 text-[#0c503b]/65 group-hover:text-[#0c503b] group-hover:scale-110 transition-all stroke-[1.8]" />
                </div>

                {/* Center: Brand Authentic Vector Logo */}
                <div className="my-auto flex items-center justify-center py-1 transition-transform duration-300 group-hover:scale-105">
                  {brand.logo}
                </div>

                {/* Bottom: Speciality Tag (Centered, matching user design) */}
                <div className="text-center pt-2 border-t border-black/[0.04]">
                  <span className="block text-[0.72rem] sm:text-[0.76rem] text-[#42594d] font-medium leading-tight truncate">
                    {brand.speciality}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll brands right"
            className="hidden md:grid absolute -right-3 lg:-right-5 z-30 size-11 lg:size-12 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-white/80 shadow-[0_4px_20px_rgba(20,40,30,0.1)] place-items-center text-[#11241b] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <ChevronRight className="size-5 stroke-[2.2]" />
          </button>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* 5. QUALITY ASSURANCE CREDIBILITY RIBBON (4 Clinical Pillars)    */}
        {/* --------------------------------------------------------------- */}
        <div className="mt-9 sm:mt-11 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
            {qualityPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  data-r-pillar
                  data-reveal
                  className="flex items-center gap-3.5 rounded-2xl bg-white/80 hover:bg-white/95 backdrop-blur-xl border border-white/85 p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(20,40,30,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <span className="grid size-11 rounded-full bg-[#0c503b]/8 text-[#0c503b] border border-[#0c503b]/15 shrink-0 place-items-center">
                    <Icon className="size-5 stroke-[1.8]" />
                  </span>
                  <div className="min-w-0 leading-tight">
                    <span className="block text-[0.85rem] sm:text-[0.89rem] font-bold text-[#0c2217] truncate">
                      {pillar.title}
                    </span>
                    <span className="block text-[0.72rem] sm:text-[0.75rem] text-[#4f675a] mt-0.5 line-clamp-1 font-medium">
                      {pillar.detail}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
