"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { gsap } from "@/lib/animation/gsap";

/**
 * Curated Health Goal definitions enriched with authentic pharmacopoeia
 * active botanicals and category focus to match the Mediterranean apothecary aesthetic:
 */
const healthGoalData = [
  {
    id: "immunity",
    name: "Immunity",
    tag: "DEFENSE & VITALITY",
    herbs: "Echinacea · Aconite · Zincum",
    remedies: "32 remedies",
    image: "/Images/HealthGoals/immunity.webp",
    href: "/products?goal=immunity",
  },
  {
    id: "skin-care",
    name: "Skin Care",
    tag: "GLOW & PURITY",
    herbs: "Calendula · Berberis · Sulphur",
    remedies: "28 remedies",
    image: "/Images/HealthGoals/skincare.webp",
    href: "/products?goal=skin-care",
  },
  {
    id: "hair-care",
    name: "Hair Care",
    tag: "ROOT STRENGTH",
    herbs: "Arnica · Jaborandi · Thuja",
    remedies: "24 remedies",
    image: "/Images/HealthGoals/haircare.webp",
    href: "/products?goal=hair-care",
  },
  {
    id: "digestive",
    name: "Digestive",
    tag: "GUT BALANCE",
    herbs: "Nux Vomica · Carbo Veg",
    remedies: "36 remedies",
    image: "/Images/HealthGoals/digestive.webp",
    href: "/products?goal=digestive",
  },
  {
    id: "womens-health",
    name: "Women's Health",
    tag: "HORMONE HARMONY",
    herbs: "Pulsatilla · Sepia · Ashoka",
    remedies: "30 remedies",
    image: "/Images/HealthGoals/womens-health.webp",
    href: "/products?goal=womens-health",
  },
  {
    id: "children",
    name: "Children",
    tag: "GENTLE PEDIATRIC",
    herbs: "Chamomilla · Calcarea Carb",
    remedies: "22 remedies",
    image: "/Images/HealthGoals/children.webp",
    href: "/products?goal=children",
  },
  {
    id: "joint-bone",
    name: "Joint & Bone",
    tag: "MOBILITY & FLEX",
    herbs: "Rhus Tox · Bryonia Alba",
    remedies: "26 remedies",
    image: "/Images/HealthGoals/joint-bone.webp",
    href: "/products?goal=joint-bone",
  },
  {
    id: "respiratory",
    name: "Respiratory",
    tag: "CLEAR BREATHING",
    herbs: "Drosera · Justicia Adhatoda",
    remedies: "25 remedies",
    image: "/Images/HealthGoals/respiratory.webp",
    href: "/products?goal=respiratory",
  },
  {
    id: "sleep-stress",
    name: "Sleep & Stress",
    tag: "CALM & DEEP REST",
    herbs: "Passiflora · Kali Phosphoricum",
    remedies: "19 remedies",
    image: "/Images/HealthGoals/sleep-stress.webp",
    href: "/products?goal=sleep-stress",
  },
];

/**
 * HealthGoals Section
 *
 * Harmonized with NaturalWellBG.png color theme:
 * - Cards tuned to warm Tuscan travertine limestone & botanical parchment tones
 * - Seamless blend-multiply on botanical sculptures (zero square boundary lines)
 * - Enriched content: domain tag, 3D sculpture, active botanical herbs, remedy count, and micro-action
 * - Silky smooth 60fps GPU parallax navigation
 */
export function HealthGoals() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll boundary to update button states
  const checkScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  // Smooth carousel scroll
  const handleScroll = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const scrollAmount = direction === "left" ? -420 : 420;
    track.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  // Hardware-accelerated lightweight GSAP Scroll Parallax
  useEffect(() => {
    if (!sectionRef.current || !bgRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bgRef.current,
        { yPercent: -5, force3D: true },
        {
          yPercent: 5,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            fastScrollEnd: true,
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
      aria-labelledby="health-goals-heading"
      className="relative z-10 w-full overflow-hidden pt-14 sm:pt-18 lg:pt-22 pb-16 sm:pb-20 lg:pb-24"
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. SCENIC NATURAL WELLNESS BACKGROUND WITH BUTTER-SMOOTH PARALLAX */}
      {/* ----------------------------------------------------------------- */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[7%] h-[114%] select-none will-change-transform -z-10 [transform:translate3d(0,0,0)] [backface-visibility:hidden]"
      >
        <img
          src="/Images/NaturalWellBG.webp"
          alt=""
          className="size-full object-cover object-[center_34%]"
        />
      </div>

      {/* Subtle bottom blur blend to connect seamlessly to Bestselling Products */}
      <div aria-hidden className="dh-section-blend-bottom" />

      {/* ----------------------------------------------------------------- */}
      {/* 2. SECTION CONTENT                                                */}
      {/* ----------------------------------------------------------------- */}
      <Container width="wide" className="relative z-10">
        
        {/* Header Block (Pure, clean text directly on the sunlit wall) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-black/[0.06]">
          <div className="max-w-xl">
            {/* Prestige Eyebrow Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-[#0c503b]/15 px-3.5 py-1 text-[0.72rem] font-bold text-[#0c503b] tracking-[0.18em] uppercase shadow-2xs transition-colors">
              <Sparkles className="size-3 text-[#0c503b]" />
              <span>NATURAL WELLNESS PATHS</span>
            </div>

            {/* Display Heading (Plus Jakarta Sans) */}
            <h2
              id="health-goals-heading"
              className="mt-3.5 font-sans text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight text-[#0a1e16] leading-tight"
            >
              Find by Health Goal
            </h2>

            <p className="mt-2 text-[0.92rem] sm:text-[1rem] text-[#284236] font-medium leading-relaxed">
              Explore targeted homeopathic remedies formulated by certified laboratories for your specific health needs.
            </p>
          </div>

          {/* Controls: "View All Categories" Link & Carousel Arrow Buttons */}
          <div className="flex items-center gap-3 self-start md:self-end shrink-0">
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-[0.84rem] font-bold text-[#0c503b] hover:text-[#063b2d] bg-white/75 hover:bg-white backdrop-blur-md border border-white/80 px-4 py-2 rounded-full shadow-2xs transition-all mr-1"
            >
              <span>View all categories</span>
              <ArrowRight className="size-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous health goals"
              className="size-10 sm:size-11 rounded-full bg-white/80 hover:bg-[#0c503b] text-[#11241b] hover:text-white backdrop-blur-md border border-white/80 shadow-2xs hover:shadow-xs grid place-items-center transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="size-5 stroke-[2]" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Next health goals"
              className="size-10 sm:size-11 rounded-full bg-white/80 hover:bg-[#0c503b] text-[#11241b] hover:text-white backdrop-blur-md border border-white/80 shadow-2xs hover:shadow-xs grid place-items-center transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="size-5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* 3. WARM TRAVERTINE APOTHECARY REMEDY CARDS                       */}
        {/* --------------------------------------------------------------- */}
        <div className="relative mt-8">
          <div
            ref={trackRef}
            onScroll={checkScroll}
            className="flex items-stretch gap-4 sm:gap-5 lg:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1"
          >
            {healthGoalData.map((goal) => (
              <Link
                key={goal.id}
                href={goal.href}
                className="group relative flex flex-col justify-between w-[175px] sm:w-[195px] lg:w-[215px] shrink-0 rounded-[26px] sm:rounded-[30px] bg-[#faf5eb]/85 hover:bg-[#fffcf6]/95 backdrop-blur-xl border border-[#dccfb8]/50 hover:border-[#0c503b]/45 p-4 sm:p-5 shadow-[0_8px_28px_rgba(35,28,16,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.85)] hover:shadow-[0_20px_45px_rgba(12,80,59,0.14)] hover:-translate-y-2 transition-all duration-300 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#0c503b]"
              >
                {/* Top: Category Discipline Tag */}
                <div className="w-full flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0c503b]/8 border border-[#0c503b]/12 px-2.5 py-0.5 text-[0.62rem] sm:text-[0.66rem] font-bold text-[#0c503b] tracking-wider uppercase">
                    {goal.tag}
                  </span>
                </div>

                {/* Center: 3D Botanical Sculpture (Seamlessly blends into warm travertine card) */}
                <div className="my-auto w-full aspect-square max-h-[125px] sm:max-h-[140px] flex items-center justify-center p-1 relative overflow-hidden">
                  <img
                    src={goal.image}
                    alt={goal.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-400 ease-out"
                    loading="lazy"
                  />
                </div>

                {/* Bottom: Title & Active Pharmacopoeia Botanicals */}
                <div className="mt-2 text-center w-full">
                  <h3 className="text-[0.98rem] sm:text-[1.05rem] font-bold text-[#0a1e16] group-hover:text-[#0c503b] tracking-tight transition-colors line-clamp-1">
                    {goal.name}
                  </h3>
                  <p className="mt-0.5 text-[0.68rem] sm:text-[0.72rem] text-[#607669] font-medium truncate">
                    {goal.herbs}
                  </p>
                </div>

                {/* Footer Bar: Remedy Count & Micro Action Button */}
                <div className="mt-2.5 pt-2 border-t border-black/[0.05] flex items-center justify-between w-full">
                  <span className="text-[0.72rem] font-bold text-[#0c503b]">
                    {goal.remedies}
                  </span>
                  <span className="size-6 sm:size-6.5 rounded-full bg-[#0c503b]/10 group-hover:bg-[#0c503b] text-[#0c503b] group-hover:text-white flex items-center justify-center transition-all duration-300">
                    <ArrowRight className="size-3 stroke-[2.2]" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </Container>
    </section>
  );
}
