"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, HeartHandshake, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { useSectionTimeline } from "@/lib/animation/sectionTimeline";
import { bestsellingProducts, productFilters } from "@/data/mock/home";

const ITEMS_PER_VIEW = 4;

export function BestsellingProducts() {
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(0);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    if (filter === "all") return bestsellingProducts;
    return bestsellingProducts.filter((product) => product.form === filter);
  }, [filter]);

  const maxPage = Math.max(0, Math.ceil(filteredProducts.length / ITEMS_PER_VIEW) - 1);

  // Products visible in the current 1-row showcase
  const visibleProducts = useMemo(() => {
    const start = page * ITEMS_PER_VIEW;
    return filteredProducts.slice(start, start + ITEMS_PER_VIEW);
  }, [filteredProducts, page]);

  // Heading leads, supporting copy and badges follow, cards land last.
  const sectionRef = useSectionTimeline<HTMLElement>([
    { sel: "[data-r-eyebrow]", variant: "rise", at: 0 },
    { sel: "[data-r-head]", variant: "rise", at: 0.12 },
    { sel: "[data-r-copy]", variant: "rise", at: 0.26 },
    { sel: "[data-r-badge]", variant: "rise", at: 0.4 },
    { sel: "[data-r-bar]", variant: "rise", at: 0.3 },
    { sel: "[data-r-card]", variant: "card", at: 0.46 },
  ]);

  const handleFilterChange = (tabId: string) => {
    setFilter(tabId);
    setPage(0);
  };

  return (
    <section
      ref={sectionRef}
      data-motion-gate
      id="bestselling-section"
      aria-labelledby="bestsellers-heading"
      className="relative text-ink pt-8 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 lg:pb-20 overflow-hidden"
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. LIGHT CANVAS BACKDROP                                          */}
      {/* Mint-tinted, to sit apart from the warm canvas of Health Goals     */}
      {/* directly above. Nothing below has to out-shout a photograph any    */}
      {/* more, which is why the frosted panels and white text halos are     */}
      {/* gone with it.                                                     */}
      {/* ----------------------------------------------------------------- */}
      <div aria-hidden="true" className="dh-canvas dh-canvas--mint" />

      {/* ----------------------------------------------------------------- */}
      {/* 2. SECTION CONTENT                                                */}
      {/* ----------------------------------------------------------------- */}
      <div className="mx-auto w-full max-w-[1660px] px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8 xl:gap-10">
          
          {/* ============================================================== */}
          {/* LEFT EDITORIAL COLUMN (open column on a hairline, not a card)  */}
          {/* ============================================================== */}
          <div className="relative w-full lg:w-[350px] xl:w-[390px] 2xl:w-[420px] shrink-0 flex flex-col justify-between py-3 sm:py-4 lg:py-5 px-3 sm:px-4 lg:border-r lg:border-line/70 lg:pr-8 xl:pr-10">
            {/* Top Text & CTA Block */}
            <div className="flex flex-col items-start relative z-10">
              {/* Eyebrow */}
              <div
                data-r-eyebrow
                data-reveal
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0c503b]/[0.06] border border-[#0c503b]/15 px-3.5 py-1 text-[0.75rem] font-bold text-[#0c503b] tracking-wider uppercase"
              >
                <Sparkles className="size-3.5 text-[#0c503b]" />
                <span>Top Picks</span>
                <ArrowRight className="size-3 text-[#0c503b]" />
              </div>

              {/* Large Crisp Display Headline (Matching Hero Typography) */}
              <h2
                data-r-head
                data-reveal
                id="bestsellers-heading"
                className="mt-3.5 font-display text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.65rem] font-bold tracking-tight text-[#061c12] leading-[1.04]"
              >
                Bestselling<br />Medicines
              </h2>

              {/* Subtitle */}
              <p
                data-r-copy
                data-reveal
                className="mt-3.5 text-[0.92rem] sm:text-[0.98rem] text-[#143425] font-medium leading-relaxed max-w-sm"
              >
                Most trusted homeopathic remedies for your everyday health and a better tomorrow.
              </p>

              {/* Action Button */}
              <Link
                data-r-copy
                data-reveal
                href="/products"
                className="mt-6 inline-flex items-center justify-center gap-2.5 rounded-full bg-[#0c503b] px-7 py-3.5 text-[0.88rem] sm:text-sm font-semibold text-white shadow-[0_6px_22px_rgba(12,80,59,0.32)] transition-all duration-300 hover:bg-[#07392a] hover:shadow-[0_10px_28px_rgba(12,80,59,0.42)] active:scale-95"
              >
                <span>View All Products</span>
                <ArrowRight className="size-4 stroke-[2]" />
              </Link>
            </div>

            {/* Bottom Trust Badges (Open list without enclosing card) */}
            <div className="mt-8 pt-6 border-t border-[#0c503b]/15 flex flex-col gap-3.5 w-full relative z-10">
              <div data-r-badge data-reveal className="flex items-center gap-3">
                <span className="grid size-9 rounded-full bg-[#0c503b]/[0.07] border border-[#0c503b]/12 place-items-center text-[#0c503b] shrink-0">
                  <Leaf className="size-4.5 stroke-[2]" />
                </span>
                <div className="text-[0.84rem] leading-tight text-[#061d13]">
                  <span className="font-bold block">100% Natural</span>
                  <span className="text-[#204030] font-medium text-xs">Pure classical plant & mineral extracts</span>
                </div>
              </div>

              <div data-r-badge data-reveal className="flex items-center gap-3">
                <span className="grid size-9 rounded-full bg-[#0c503b]/[0.07] border border-[#0c503b]/12 place-items-center text-[#0c503b] shrink-0">
                  <ShieldCheck className="size-4.5 stroke-[2]" />
                </span>
                <div className="text-[0.84rem] leading-tight text-[#061d13]">
                  <span className="font-bold block">Safe & Effective</span>
                  <span className="text-[#204030] font-medium text-xs">Standardized pharmacopoeia grade</span>
                </div>
              </div>

              <div data-r-badge data-reveal className="flex items-center gap-3">
                <span className="grid size-9 rounded-full bg-[#0c503b]/[0.07] border border-[#0c503b]/12 place-items-center text-[#0c503b] shrink-0">
                  <HeartHandshake className="size-4.5 stroke-[2]" />
                </span>
                <div className="text-[0.84rem] leading-tight text-[#061d13]">
                  <span className="font-bold block">Trusted by 10K+ Families</span>
                  <span className="text-[#204030] font-medium text-xs">Verified doctor-curated remedies</span>
                </div>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* RIGHT PRODUCTS & FILTER AREA (1 single row of 3-4 cards)       */}
          {/* ============================================================== */}
          <div className="flex-1 min-w-0 w-full flex flex-col justify-between gap-4 sm:gap-5">
            
            {/* Top Filter Bar + Controls */}
            <div
              data-r-bar
              data-reveal
              className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-line/70"
            >
              {/* Animated Filter Pills */}
              <div
                role="tablist"
                aria-label="Filter remedies by form"
                className="inline-flex items-center gap-1 bg-[#f1f0e9] p-1 rounded-full border border-line/70"
              >
                {productFilters.map((tab) => {
                  const isActive = filter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      type="button"
                      onClick={() => handleFilterChange(tab.id)}
                      className={`relative rounded-full px-3.5 sm:px-4 py-1.5 text-[0.82rem] font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                        isActive ? "text-white" : "text-[#4d5e56] hover:text-ink"
                      }`}
                    >
                      {/* Smooth Gliding Active Pill Background */}
                      {isActive && (
                        <motion.div
                          layoutId="activeFilterPill"
                          className="absolute inset-0 rounded-full bg-[#0c503b] shadow-xs"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 32,
                          }}
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Carousel Arrows + View All Link */}
              <div className="flex items-center gap-3">
                {maxPage > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#f1f0e9] rounded-full p-1 border border-line/70">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      aria-label="Previous medicines"
                      className="size-7 rounded-full bg-white text-[#11231a] shadow-2xs grid place-items-center hover:bg-forest hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="text-[0.74rem] font-semibold text-[#3d5045] px-1.5 select-none">
                      {page + 1}/{maxPage + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                      disabled={page >= maxPage}
                      aria-label="Next medicines"
                      className="size-7 rounded-full bg-white text-[#11231a] shadow-2xs grid place-items-center hover:bg-forest hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                )}

                <Link
                  href="/products"
                  className="group inline-flex items-center gap-2 text-[0.84rem] font-semibold text-[#0c503b] hover:text-[#083b2b] transition-colors"
                >
                  <span>View All</span>
                  <span className="size-7 rounded-full bg-white shadow-xs border border-line/60 grid place-items-center group-hover:translate-x-0.5 group-hover:scale-105 transition-all text-[#0c503b]">
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Showcase Product Cards Grid (Strictly 1 balanced row of 3-4 cards) */}
            {visibleProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line/70 bg-white p-12 text-center text-sm text-muted-ink">
                No medicines found in this category.
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4.5 lg:gap-5 items-stretch"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {visibleProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout="position"
                      initial={{ opacity: 0, scale: 0.94, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94, y: -8 }}
                      transition={{
                        duration: 0.38,
                        ease: [0.25, 1, 0.5, 1],
                      }}
                      className="h-full"
                    >
                      {/* No `data-reveal` here on purpose: these cards re-mount on every
                          filter/page change, and the section timeline is `once: true`,
                          so a gated re-render would have nothing left to release it.
                          The layout effect hides them before first paint anyway. */}
                      <div data-r-card className="h-full">
                        <ProductCard
                          product={product}
                          mediaRatio="aspect-[4/3.5]"
                          className="rounded-[22px] sm:rounded-[24px] bg-white border border-line/70 shadow-[0_1px_2px_rgba(20,37,31,0.04),0_10px_30px_-18px_rgba(20,37,31,0.35)] hover:shadow-[0_20px_42px_-22px_rgba(13,90,67,0.45)] transition-all duration-300"
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
