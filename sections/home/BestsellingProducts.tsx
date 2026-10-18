"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Factory, MapPin, PackageSearch, RotateCw, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { MomentumRail, RailSlide } from "@/components/kokonutui/carousel-cards";
import { Reveal } from "@/components/shared/Reveal";
import { SplitHeading } from "@/components/shared/SplitHeading";
import type { Product } from "@/types/product";

/** One of the shop's home rails (GET /api/shop/home `rails`), its cards already mapped for ProductCard. */
export type HomeRail = { key: string; title: string; href: string; products: Product[] };

const list = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

/**
 * Bestsellers: an editorial column beside a momentum rail of product cards.
 * The rail flicks and springs to a card (mouse), scrolls natively with snap
 * (touch), steps with the arrow keys, and keeps every card's own controls —
 * favourite and Add — working.
 *
 * The tabs are the shop's own rails ("Best sellers", "Biggest savings",
 * "Just added"…); the backend leaves a rail out when it has nothing in it,
 * so no tab opens onto nothing. With no rails at all the section is not shown.
 */
export function BestsellingProducts({
  rails,
  brandNames,
  unavailable = false,
}: {
  rails: HomeRail[];
  brandNames: string[];
  /** The shop could not be reached; the section stays and says so. */
  unavailable?: boolean;
}) {
  const [filter, setFilter] = useState<string>(rails[0]?.key ?? "");
  const reducedMotion = useReducedMotion();
  const rail = rails.find((r) => r.key === filter) ?? rails[0] ?? null;
  const products = rail?.products ?? [];

  // Only claims the shop can stand behind: the makers it actually stocks, the
  // maker on every product page, and the delivery check on every product.
  const makers = brandNames.slice(0, 4);
  const assurances = [
    {
      icon: Factory,
      title: "Licensed manufacturers",
      detail: makers.length ? `${list.format(brandNames.length > 4 ? [...makers, "more"] : makers)}` : "The maker is named on every pack",
    },
    { icon: BadgeCheck, title: "Maker named on every product", detail: "Know exactly where each remedy comes from" },
    { icon: MapPin, title: "Delivery check by pincode", detail: "See availability before you order" },
  ];

  return (
    <section
      id="bestselling-section"
      aria-labelledby="bestsellers-heading"
      className="relative overflow-hidden pt-10 pb-14 text-ink sm:pt-14 sm:pb-18 lg:pt-16 lg:pb-22"
    >
      <div aria-hidden="true" className="dh-section-blend-bottom" />

      <div className="relative z-10 mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-12 xl:gap-16">
          {/* Editorial column */}
          <div className="flex shrink-0 flex-col justify-between lg:w-[20rem] xl:w-[23rem]">
            <div>
              <Reveal y={12} delay={0}>
                <p className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-paper/80 px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.14em] text-forest uppercase">
                  <Sparkles aria-hidden className="size-3.5" />
                  Top picks
                </p>
              </Reveal>
              <SplitHeading
                id="bestsellers-heading"
                lines={["Bestselling", "medicines"]}
                delay={0.06}
                className="mt-4 font-display text-[2.5rem] leading-[1.02] tracking-tight text-ink sm:text-5xl xl:text-[3.5rem]"
              />
              <Reveal y={16} delay={0.16}>
                <p className="dh-body mt-4 text-[0.9375rem]">
                  Our most popular remedies, from the licensed manufacturers we stock.
                </p>
              </Reveal>
              <Reveal y={16} delay={0.24}>
                <Link
                  href={rails[0]?.href ?? "/products"}
                  className="group mt-7 inline-flex h-12 items-center gap-2.5 rounded-full bg-forest pr-2 pl-6 text-sm font-semibold text-cream shadow-soft transition-[background-color,box-shadow] duration-300 hover:bg-forest-deep hover:shadow-lift"
                >
                  View all bestsellers
                  <span className="grid size-8 place-items-center rounded-full bg-cream/15 transition-transform duration-300 group-hover:translate-x-0.5">
                    <ArrowRight aria-hidden className="size-4" />
                  </span>
                </Link>
              </Reveal>
            </div>

            <Reveal y={18} delay={0.28} stagger="li">
              <ul className="mt-9 hidden flex-col gap-4 border-t border-forest/12 pt-6 lg:flex">
                {assurances.map(({ icon: Icon, title, detail }) => (
                  <li key={title} className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line-soft bg-paper text-forest">
                      <Icon aria-hidden className="size-4" strokeWidth={1.9} />
                    </span>
                    <span className="text-[0.8125rem] leading-tight text-ink">
                      <span className="block font-semibold">{title}</span>
                      <span className="text-xs text-muted-ink">{detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* Rail, or an honest panel when there is nothing to show */}
          <Reveal y={24} delay={0.12} className="min-w-0 flex-1">
            {rail ? (
            <MomentumRail
              key={rail.key}
              label={rail.title}
              align="start"
              depth="none"
              cardWidth="[--rail-card:72cqw] @md/rail:[--rail-card:15.5rem] @5xl/rail:[--rail-card:16.5rem]"
              toolbarStart={
                <div
                  role="tablist"
                  aria-label="Choose a collection"
                  className="dh-no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-black/[0.07] bg-paper/80 p-1 shadow-2xs backdrop-blur-md"
                >
                  {rails.map((tab) => {
                    const active = rail.key === tab.key;
                    return (
                      <button
                        key={tab.key}
                        role="tab"
                        aria-selected={active}
                        type="button"
                        onClick={() => setFilter(tab.key)}
                        className={`relative shrink-0 rounded-full px-4 py-1.5 text-[0.8125rem] font-medium transition-colors duration-200 ${
                          active ? "text-cream" : "text-muted-ink hover:text-ink"
                        }`}
                      >
                        {active ? (
                          <motion.span
                            layoutId="bestseller-tab"
                            className="absolute inset-0 rounded-full bg-forest"
                            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                          />
                        ) : null}
                        <span className="relative">{tab.title}</span>
                      </button>
                    );
                  })}
                </div>
              }
              toolbarEnd={
                <Link
                  href={rail.href}
                  className="ml-1 hidden items-center gap-1.5 text-[0.8125rem] font-semibold text-forest hover:text-forest-deep sm:inline-flex"
                >
                  View all
                  <ArrowRight aria-hidden className="size-3.5" />
                </Link>
              }
            >
              {products.map((product, index) => (
                <RailSlide key={product.id} align="start" depth="none">
                  <motion.div
                    className="h-full"
                    initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProductCard
                      product={product}
                      mediaRatio="aspect-[4/3.5]"
                      className="h-full rounded-[1.375rem] border border-white/90 bg-paper shadow-[0_8px_25px_rgba(20,40,30,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_38px_rgba(13,90,67,0.14)]"
                    />
                  </motion.div>
                </RailSlide>
              ))}
            </MomentumRail>
            ) : (
              <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-forest/20 bg-paper/70 px-6 py-12 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-sage-wash text-forest">
                  <PackageSearch aria-hidden className="size-6" strokeWidth={1.6} />
                </span>
                <h3 className="mt-5 font-display text-xl text-ink">
                  {unavailable ? "We couldn’t load products just now" : "Our first remedies are on their way"}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-ink">
                  {unavailable
                    ? "The shop is not responding at the moment. Please try again shortly."
                    : "Bestsellers appear here as soon as the shop lists its products."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {unavailable ? (
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-cream transition-colors hover:bg-forest-deep"
                    >
                      <RotateCw aria-hidden className="size-4" />
                      Try again
                    </button>
                  ) : null}
                  <Link
                    href="/categories"
                    className="inline-flex h-11 items-center rounded-full border border-forest/25 px-5 text-sm font-semibold text-forest transition-colors hover:bg-forest/6"
                  >
                    Browse by health concern
                  </Link>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
