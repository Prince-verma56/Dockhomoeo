"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FileText,
  FlaskConical,
  Heart,
  Leaf,
  Pill,
  Shield,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { Link001 } from "@/components/ui/skiper-ui/skiper40";
import { ProductCard } from "@/components/commerce/ProductCard";
import type { CategorySummary } from "@/lib/catalogue";
import type { Product } from "@/types/product";

interface CategoryShowcaseViewProps {
  categories: CategorySummary[];
  totalProducts: number;
  popularProducts: Product[];
}

// 6 Health Concerns for the Signature Bento Grid
const HEALTH_CONCERNS = [
  {
    id: "immunity",
    name: "Immunity",
    slug: "immunity",
    remedyCount: 124,
    image: "/Images/HealthGoals/immunity.webp",
    isLead: true,
    benefits: [
      { icon: Shield, text: "Stronger Natural Defence" },
      { icon: Leaf, text: "Trusted Formulations" },
      { icon: Droplets, text: "For Everyday Wellness" },
    ],
  },
  {
    id: "skincare",
    name: "Skin Care",
    slug: "skin-care",
    remedyCount: 86,
    image: "/Images/HealthGoals/skincare.webp",
  },
  {
    id: "sleep-stress",
    name: "Sleep & Stress",
    slug: "sleep-stress",
    remedyCount: 72,
    image: "/Images/HealthGoals/sleep-stress.webp",
  },
  {
    id: "digestive",
    name: "Digestive Health",
    slug: "digestive",
    remedyCount: 64,
    image: "/Images/HealthGoals/digestive.webp",
  },
  {
    id: "womens-health",
    name: "Women's Health",
    slug: "womens-health",
    remedyCount: 58,
    image: "/Images/HealthGoals/womens-health.webp",
  },
  {
    id: "joint-bone",
    name: "Joint & Bone",
    slug: "joint-bone",
    remedyCount: 46,
    image: "/Images/HealthGoals/joint-bone.webp",
    isWide: true,
  },
];

// 5 Dosage Formats
const PRODUCT_FORMATS = [
  {
    title: "Drops & Dilutions",
    form: "drops",
    count: 148,
    image: "/Images/Editorial/eucalyptus-dropper-bottle.webp",
    icon: Droplets,
  },
  {
    title: "Tablets & Pellets",
    form: "tablets",
    count: 96,
    image: "/Images/brands/tablets-pellets.jpg",
    icon: Pill,
  },
  {
    title: "Mother Tinctures",
    form: "tincture",
    count: 72,
    image: "/Images/Products/schwabe-alfalfa.jpg",
    icon: FlaskConical,
  },
  {
    title: "Oils",
    form: "cream",
    count: 48,
    image: "/Images/Products/bakson-arnica-oil.jpg",
    icon: Droplets,
  },
  {
    title: "Creams & Ointments",
    form: "cream",
    count: 64,
    image: "/Images/Editorial/arnica-cream-tube.webp",
    icon: Leaf,
  },
];

// Fallback high-fidelity popular remedies with genuine database variant IDs
const FALLBACK_POPULAR_PRODUCTS: Product[] = [
  {
    id: "6",
    slug: "respiratory-care-drops",
    name: "Respiratory Care Drops",
    brand: "Dr. Reckeweg",
    form: "drops",
    variant: "Combination · 22 ml",
    price: { amount: 230, currency: "INR" },
    compareAtPrice: { amount: 250, currency: "INR" },
    rating: { value: 4.8, count: 63 },
    tone: "amber",
    mediaLabel: "Respiratory Care Drops",
    image: "/Images/Products/reckeweg-r41.jpg",
    variantId: 6,
  },
  {
    id: "7",
    slug: "calendula-ointment",
    name: "Calendula Ointment 10%",
    brand: "Schwabe",
    form: "cream",
    variant: "Ointment 10% · 25 g",
    price: { amount: 95, currency: "INR" },
    compareAtPrice: { amount: 110, currency: "INR" },
    rating: { value: 4.7, count: 58 },
    tone: "amber",
    mediaLabel: "Calendula Ointment",
    image: "/Images/Editorial/arnica-cream-tube.webp",
    variantId: 7,
  },
  {
    id: "1",
    slug: "arnica-montana-30c",
    name: "Arnica Montana 30C",
    brand: "SBL",
    form: "drops",
    variant: "30C · 30 ml",
    price: { amount: 110, currency: "INR" },
    rating: { value: 4.9, count: 112 },
    tone: "amber",
    mediaLabel: "Arnica Montana 30C",
    image: "/Images/Products/boiron-arnica.jpg",
    variantId: 1,
  },
  {
    id: "4",
    slug: "arnica-massage-oil",
    name: "Arnica Massage Oil",
    brand: "Bakson",
    form: "oil",
    variant: "Botanical Oil · 100 ml",
    price: { amount: 149, currency: "INR" },
    compareAtPrice: { amount: 170, currency: "INR" },
    rating: { value: 4.8, count: 76 },
    tone: "amber",
    mediaLabel: "Arnica Massage Oil",
    image: "/Images/Products/bakson-arnica-oil.jpg",
    variantId: 4,
  },
  {
    id: "3",
    slug: "arnica-pellets-200",
    name: "Arnica Pellets 200",
    brand: "DocHomoeo",
    form: "tablets",
    variant: "200C · 4 g",
    price: { amount: 75, currency: "INR" },
    rating: { value: 4.9, count: 84 },
    tone: "amber",
    mediaLabel: "Arnica Pellets 200",
    image: "/Images/Editorial/chamomilla-pellet-bottle.webp",
    variantId: 3,
  },
  {
    id: "5",
    slug: "kali-phos-6x",
    name: "Kali Phosphoricum 6X",
    brand: "Lord's",
    form: "tablets",
    variant: "6X · 200 tablets",
    price: { amount: 65, currency: "INR" },
    rating: { value: 4.7, count: 52 },
    tone: "amber",
    mediaLabel: "Kali Phosphoricum 6X",
    image: "/Images/Products/lords-kali-phos.jpg",
    variantId: 5,
  },
];

export function CategoryShowcaseView({
  categories,
  totalProducts,
  popularProducts,
}: CategoryShowcaseViewProps) {
  // Embla Carousel for smooth products rail
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    queueMicrotask(() => onSelect());
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const displayedProducts =
    popularProducts && popularProducts.length > 0 ? popularProducts : FALLBACK_POPULAR_PRODUCTS;

  const leadConcern = HEALTH_CONCERNS[0];
  const rightConcerns = HEALTH_CONCERNS.slice(1);

  return (
    <div className="bg-canvas pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 overflow-x-hidden">
      <Container className="max-w-[1260px] w-full px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 lg:space-y-24">
        
        {/* ========================================================== */}
        {/* HERO HEADER: TITLE, STATS, & AESTHETIC VISUAL CARD         */}
        {/* ========================================================== */}
        <section aria-labelledby="categories-hero-title" className="space-y-6">
          <PageBreadcrumb items={[{ name: "Categories", href: "/categories" }]} structuredData={false} />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-2">
            
            {/* Left Content */}
            <div className="space-y-3 max-w-2xl">
              <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-forest block">
                Find Your Path to Wellness
              </span>

              <h1 id="categories-hero-title" className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-ink leading-[1.08]">
                Find your <em className="italic font-serif text-forest-deep font-normal">natural care.</em>
              </h1>

              <p className="text-sm sm:text-base text-muted-ink leading-relaxed">
                Browse remedies by health concern or preferred form.
              </p>

              {/* Stats badges */}
              <div className="flex items-center gap-6 pt-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-ink">06</span>
                  <span className="text-xs text-muted-ink">health concerns</span>
                </div>
                <div className="h-6 w-px bg-line-soft" />
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-ink">05</span>
                  <span className="text-xs text-muted-ink">product forms</span>
                </div>
              </div>
            </div>

            {/* Right Aesthetic Composition (Eliminates dead space!) */}
            <div className="relative shrink-0 w-full sm:w-auto self-center lg:self-auto">
              <div className="relative rounded-[2rem] overflow-hidden border border-line-soft bg-paper shadow-soft h-[150px] sm:h-[165px] w-full sm:w-[320px]">
                <img
                  src="/Images/Editorial/eucalyptus-dropper-bottle.webp"
                  alt="Aesthetic botanical remedy with chamomile flowers"
                  className="size-full object-cover object-center pointer-events-none select-none"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white drop-shadow-xs">
                  <span className="text-xs font-bold">Holistic Botanical Care</span>
                  <span className="text-[10px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full font-semibold">Verified</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================== */}
        {/* SECTION 1: BROWSE BY HEALTH CONCERN (SIGNATURE BENTO GRID) */}
        {/* ========================================================== */}
        <section id="health-concerns" aria-labelledby="health-concerns-heading" className="space-y-6">
          <Reveal y={16}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 id="health-concerns-heading" className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink">
                  Browse by health concern
                </h2>
                <p className="text-xs sm:text-sm text-muted-ink mt-1 max-w-xl">
                  Explore remedies for your specific wellness needs, carefully curated from trusted manufacturers.
                </p>
              </div>

              <div>
                <Link001 href="/products" tone="forest" className="text-xs sm:text-sm font-semibold">
                  View all concerns
                </Link001>
              </div>
            </div>
          </Reveal>

          {/* Bento Grid: 12-column layout */}
          <Reveal y={24} stagger={0.06}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 sm:gap-5 items-stretch">
              
              {/* Left Tall Lead Card: IMMUNITY */}
              <div className="lg:col-span-5 relative rounded-3xl overflow-hidden shadow-soft border border-line-soft group flex flex-col justify-between p-6 sm:p-8 min-h-[460px] lg:min-h-[520px]">
                {/* Background Photo */}
                <img
                  src={leadConcern.image}
                  alt={leadConcern.name}
                  className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none select-none"
                  draggable={false}
                />

                {/* Gradient Overlay for crystal clear typography */}
                <div className="absolute inset-0 bg-linear-to-b from-black/65 via-black/35 to-black/80 pointer-events-none" />

                {/* Top Details */}
                <div className="relative z-10 space-y-4">
                  <span className="inline-flex items-center rounded-full bg-amber-400/90 text-amber-950 font-black text-[10px] tracking-wider uppercase px-3 py-1 shadow-xs">
                    MOST EXPLORED
                  </span>

                  <div>
                    <h3 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      {leadConcern.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-white/80 mt-1">
                      {leadConcern.remedyCount} remedies
                    </p>
                  </div>

                  {/* 3 Value bullets */}
                  <div className="space-y-3 pt-2">
                    {leadConcern.benefits?.map((b) => {
                      const Icon = b.icon;
                      return (
                        <div key={b.text} className="flex items-center gap-2.5 text-xs sm:text-[13px] text-white/90">
                          <span className="grid size-6 place-items-center rounded-full bg-white/15 text-white backdrop-blur-xs shrink-0">
                            <Icon className="size-3.5" />
                          </span>
                          <span className="font-medium drop-shadow-2xs">{b.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="relative z-10 pt-6">
                  <Link
                    href={`/products?category=${leadConcern.slug}`}
                    className="size-11 sm:size-12 rounded-full bg-cream text-forest-deep flex items-center justify-center shadow-soft transition-all duration-300 group-hover:scale-108 group-hover:bg-white"
                    aria-label={`Explore ${leadConcern.name}`}
                  >
                    <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Right 7 Columns: 2x2 Grid + Bottom Wide Card */}
              <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 justify-between">
                
                {/* 2x2 Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {rightConcerns.slice(0, 4).map((item) => (
                    <Link
                      key={item.id}
                      href={`/products?category=${item.slug}`}
                      className="group relative rounded-3xl overflow-hidden shadow-soft border border-line-soft h-[165px] sm:h-[180px] p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none select-none"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/30 to-black/75 pointer-events-none" />

                      <div className="relative z-10">
                        <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-white/80 mt-0.5 font-medium">
                          {item.remedyCount} remedies
                        </p>
                      </div>

                      <div className="relative z-10">
                        <span className="size-9 rounded-full bg-cream/90 text-forest-deep flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Bottom Full-Width Card: Joint & Bone */}
                {rightConcerns[4] ? (
                  <Link
                    href={`/products?category=${rightConcerns[4].slug}`}
                    className="group relative rounded-3xl overflow-hidden shadow-soft border border-line-soft h-[140px] sm:h-[150px] p-5 sm:p-6 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                  >
                    <img
                      src={rightConcerns[4].image}
                      alt={rightConcerns[4].name}
                      className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none select-none"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/45 to-black/30 pointer-events-none" />

                    <div className="relative z-10">
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        {rightConcerns[4].name}
                      </h3>
                      <p className="text-xs text-white/85 mt-1 font-medium">
                        {rightConcerns[4].remedyCount} remedies
                      </p>
                    </div>

                    <div className="relative z-10">
                      <span className="size-10 sm:size-11 rounded-full bg-cream/95 text-forest-deep flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
                        <ArrowRight className="size-4.5" />
                      </span>
                    </div>
                  </Link>
                ) : null}

              </div>

            </div>
          </Reveal>
        </section>

        {/* ========================================================== */}
        {/* SECTION 2: CHOOSE YOUR FORMAT (5 CARDS WITH IMAGES & ICONS) */}
        {/* ========================================================== */}
        <section id="product-formats" aria-labelledby="product-formats-heading" className="space-y-6">
          <Reveal y={16}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 id="product-formats-heading" className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink">
                  Choose your format
                </h2>
                <p className="text-xs sm:text-sm text-muted-ink mt-1 max-w-xl">
                  Same trusted remedies, in the form that suits you.
                </p>
              </div>

              <div>
                <Link001 href="/products" tone="forest" className="text-xs sm:text-sm font-semibold">
                  View all formats
                </Link001>
              </div>
            </div>
          </Reveal>

          {/* 5 Format Cards */}
          <Reveal y={20} stagger={0.05}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4.5">
              {PRODUCT_FORMATS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={`/products?form=${item.form}`}
                    className="group relative rounded-2xl border border-line-soft bg-paper overflow-hidden shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-forest/40 hover:shadow-lift flex flex-col justify-between"
                  >
                    {/* Top Image Showcase */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-cream/30">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106 pointer-events-none select-none"
                        draggable={false}
                      />
                    </div>

                    {/* Bottom Format Details */}
                    <div className="p-3.5 sm:p-4 bg-white flex items-center justify-between gap-2 border-t border-line-soft/60">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="grid size-8 place-items-center rounded-xl bg-sage-wash text-forest shadow-2xs shrink-0">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-xs sm:text-[13px] text-ink truncate">
                            {item.title}
                          </h3>
                          <p className="text-[10px] text-muted-ink mt-0.5">
                            {item.count} products
                          </p>
                        </div>
                      </div>

                      <span className="grid size-7 place-items-center rounded-full bg-canvas text-forest group-hover:bg-forest group-hover:text-cream transition-colors shrink-0">
                        <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </section>

        {/* ========================================================== */}
        {/* SECTION 3: POPULAR FOR EVERYDAY WELLNESS (CAROUSEL SLIDER)  */}
        {/* ========================================================== */}
        <section id="popular-remedies" aria-labelledby="popular-remedies-heading" className="space-y-6">
          <Reveal y={16}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 id="popular-remedies-heading" className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink">
                  Popular for everyday wellness
                </h2>
                <p className="text-xs sm:text-sm text-muted-ink mt-1 max-w-xl">
                  Handpicked remedies from trusted manufacturers.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link001 href="/products" tone="forest" className="text-xs sm:text-sm font-semibold mr-2">
                  View all products
                </Link001>

                {/* Prev / Next Carousel Controls */}
                <button
                  type="button"
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  aria-label="Previous products"
                  className="grid size-9 place-items-center rounded-full border border-line-soft bg-paper text-ink shadow-2xs hover:border-forest/40 hover:text-forest transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  aria-label="Next products"
                  className="grid size-9 place-items-center rounded-full border border-line-soft bg-paper text-ink shadow-2xs hover:border-forest/40 hover:text-forest transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </Reveal>

          {/* Smooth Momentum Embla Carousel */}
          <Reveal y={20}>
            <div ref={emblaRef} className="overflow-hidden pb-2 pt-1 -mx-2 px-2 select-none">
            <div className="flex gap-4 sm:gap-5">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-[0_0_82%] sm:flex-[0_0_46%] lg:flex-[0_0_280px] xl:flex-[0_0_288px] min-w-0 h-full"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
          </Reveal>
        </section>

        {/* ========================================================== */}
        {/* SECTION 4: 3 TRUST VALUE PROPOSITIONS (FILLS GAPS SMOOTHLY) */}
        {/* ========================================================== */}
        <section aria-labelledby="trust-props-heading" className="pt-2 border-t border-line-soft/80">
          <h2 id="trust-props-heading" className="sr-only">DocHomoeo Commitments</h2>
          <Reveal y={20} stagger={0.06}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 sm:gap-6">
              
              {/* Box 1: Verified Manufacturers */}
              <div className="group rounded-2xl border border-line-soft bg-paper p-5 flex items-center justify-between shadow-2xs hover:border-forest/30 hover:shadow-soft transition-all duration-300">
                <div className="flex items-center gap-3.5">
                  <span className="grid size-11 place-items-center rounded-2xl bg-sage-wash text-forest shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                    <Leaf className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-sm text-ink leading-tight">
                      Verified manufacturers
                    </h3>
                    <p className="text-xs text-muted-ink mt-0.5">
                      Trusted names in homeopathy
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-ink group-hover:text-forest group-hover:translate-x-1 transition-all" />
              </div>

              {/* Box 2: Clear Product Information */}
              <div className="group rounded-2xl border border-line-soft bg-paper p-5 flex items-center justify-between shadow-2xs hover:border-forest/30 hover:shadow-soft transition-all duration-300">
                <div className="flex items-center gap-3.5">
                  <span className="grid size-11 place-items-center rounded-2xl bg-sage-wash text-forest shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-sm text-ink leading-tight">
                      Clear product information
                    </h3>
                    <p className="text-xs text-muted-ink mt-0.5">
                      Know what you&apos;re choosing
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-ink group-hover:text-forest group-hover:translate-x-1 transition-all" />
              </div>

              {/* Box 3: Care When You Need It */}
              <div className="group rounded-2xl border border-line-soft bg-paper p-5 flex items-center justify-between shadow-2xs hover:border-forest/30 hover:shadow-soft transition-all duration-300">
                <div className="flex items-center gap-3.5">
                  <span className="grid size-11 place-items-center rounded-2xl bg-sage-wash text-forest shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                    <Heart className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-sm text-ink leading-tight">
                      Care when you need it
                    </h3>
                    <p className="text-xs text-muted-ink mt-0.5">
                      Expert guidance, always
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-ink group-hover:text-forest group-hover:translate-x-1 transition-all" />
              </div>

            </div>
          </Reveal>
        </section>

      </Container>
    </div>
  );
}
