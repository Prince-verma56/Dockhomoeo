"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FileText,
  FlaskConical,
  Heart,
  Leaf,
  Pill,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { Link001 } from "@/components/ui/skiper-ui/skiper40";
import { useCart } from "@/components/providers/CartProvider";
import { useFavourites } from "@/lib/favourites/favourites";
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
    icon: Sparkles,
  },
  {
    title: "Creams & Ointments",
    form: "cream",
    count: 64,
    image: "/Images/Editorial/arnica-cream-tube.webp",
    icon: Leaf,
  },
];

// Fallback high-fidelity popular remedies if none fetched
const DEFAULT_POPULAR_REMEDIES = [
  {
    id: "reckeweg-r41",
    slug: "reckeweg-r41-test",
    name: "R41 Memory and Nerve Drops (test)",
    brand: "Dr. Reckeweg (test)",
    variant: "22 ml",
    variantId: 101,
    price: 225,
    compareAtPrice: 250,
    badge: "Bestseller",
    rating: { value: 4.7, count: 63 },
    image: "/Images/Products/reckeweg-r41.jpg",
  },
  {
    id: "sbl-calendula-cream",
    slug: "sbl-calendula-cream-test",
    name: "Calendula Cream (test)",
    brand: "SBL",
    variant: "25 g",
    variantId: 102,
    price: 199,
    compareAtPrice: 220,
    badge: "Popular",
    rating: { value: 4.6, count: 58 },
    image: "/Images/Editorial/arnica-cream-tube.webp",
  },
  {
    id: "bakson-arnica-30c",
    slug: "bakson-arnica-test",
    name: "Arnica Montana 30C (test)",
    brand: "Bakson (test)",
    variant: "30 g",
    variantId: 103,
    price: 130,
    badge: "New",
    rating: { value: 4.8, count: 112 },
    image: "/Images/Products/bakson-arnica-oil.jpg",
  },
  {
    id: "schwabe-calendula-ointment",
    slug: "schwabe-calendula-test",
    name: "Calendula Ointment (test)",
    brand: "Schwabe (test)",
    variant: "25 g",
    variantId: 104,
    price: 210,
    badge: "Top Rated",
    rating: { value: 4.6, count: 76 },
    image: "/Images/Products/schwabe-alfalfa.jpg",
  },
  {
    id: "sbl-natrum-mur",
    slug: "sbl-natrum-test",
    name: "Natrum Muriaticum 6X (test)",
    brand: "SBL (test)",
    variant: "25 g",
    variantId: 105,
    price: 165,
    badge: "Verified",
    rating: { value: 4.9, count: 84 },
    image: "/Images/Products/sbl-natrum.jpg",
  },
  {
    id: "lords-kali-phos",
    slug: "lords-kali-phos-test",
    name: "Kali Phosphoricum 6X (test)",
    brand: "Lord's (test)",
    variant: "25 g",
    variantId: 106,
    price: 175,
    badge: "Popular",
    rating: { value: 4.7, count: 52 },
    image: "/Images/Products/lords-kali-phos.jpg",
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
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Cart & Favourites hooks
  const { addItem } = useCart();
  const favourites = useFavourites();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAddToCart = (item: (typeof DEFAULT_POPULAR_REMEDIES)[0]) => {
    addItem({
      variantId: item.variantId,
      quantity: 1,
      title: item.name,
      price: item.price,
      imageUrl: item.image,
      brand: item.brand,
    });

    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const leadConcern = HEALTH_CONCERNS[0];
  const rightConcerns = HEALTH_CONCERNS.slice(1);

  return (
    <div className="bg-canvas pt-20 pb-16 sm:pt-24 sm:pb-20 overflow-x-hidden">
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

          {/* Bento Grid: 12-column layout */}
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
        </section>

        {/* ========================================================== */}
        {/* SECTION 2: CHOOSE YOUR FORMAT (5 CARDS WITH IMAGES & ICONS) */}
        {/* ========================================================== */}
        <section id="product-formats" aria-labelledby="product-formats-heading" className="space-y-6">
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

          {/* 5 Format Cards */}
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
        </section>

        {/* ========================================================== */}
        {/* SECTION 3: POPULAR FOR EVERYDAY WELLNESS (CAROUSEL SLIDER)  */}
        {/* ========================================================== */}
        <section id="popular-remedies" aria-labelledby="popular-remedies-heading" className="space-y-6">
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

          {/* Smooth Momentum Embla Carousel */}
          <div ref={emblaRef} className="overflow-hidden pb-2 pt-1 -mx-2 px-2 select-none">
            <div className="flex gap-4 sm:gap-5">
              {DEFAULT_POPULAR_REMEDIES.map((product) => {
                const isFavourited = favourites.isFavourite(product.slug);
                const isAdded = addedIds[product.id];

                return (
                  <div
                    key={product.id}
                    className="flex-[0_0_82%] sm:flex-[0_0_46%] lg:flex-[0_0_280px] xl:flex-[0_0_288px] min-w-0"
                  >
                    <div className="group relative rounded-2xl border border-line-soft bg-white overflow-hidden shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-forest/30 hover:shadow-lift flex flex-col h-full justify-between select-none">
                      
                      {/* Top Media Box */}
                      <div className="relative aspect-square w-full overflow-hidden bg-cream/35">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                          draggable={false}
                        />

                        {/* Top Badge */}
                        {product.badge ? (
                          <span className="absolute top-3 left-3 rounded-full bg-forest-abyss/90 text-cream px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-xs shadow-2xs">
                            {product.badge}
                          </span>
                        ) : null}

                        {/* Heart Favourites Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            favourites.toggle(product.slug);
                          }}
                          aria-label={isFavourited ? "Remove from favourites" : "Add to favourites"}
                          className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/85 text-ink shadow-2xs backdrop-blur-xs hover:bg-white hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Heart className={cn("size-4", isFavourited && "fill-red-500 text-red-500")} />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 flex flex-col flex-1 justify-between gap-3 border-t border-line-soft/60">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-ink">
                            {product.brand}
                          </p>
                          <Link href={`/product/${product.slug}`} className="block">
                            <h3 className="font-display font-bold text-xs sm:text-sm text-ink line-clamp-2 leading-snug group-hover:text-forest transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-[11px] text-muted-ink">
                            {product.variant}
                          </p>

                          {/* Star Rating */}
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <div className="flex items-center text-amber-500">
                              <Star className="size-3 fill-current" />
                              <Star className="size-3 fill-current" />
                              <Star className="size-3 fill-current" />
                              <Star className="size-3 fill-current" />
                              <Star className="size-3 fill-current" />
                            </div>
                            <span className="text-[11px] font-bold text-ink">
                              {product.rating.value}
                            </span>
                            <span className="text-[10px] text-muted-ink">
                              ({product.rating.count})
                            </span>
                          </div>
                        </div>

                        {/* Price & Add Button */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-line-soft/40">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-display font-bold text-base text-ink">
                              ₹{product.price}
                            </span>
                            {product.compareAtPrice ? (
                              <span className="text-xs text-muted-ink line-through">
                                ₹{product.compareAtPrice}
                              </span>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer",
                              isAdded
                                ? "bg-forest-deep text-cream"
                                : "bg-forest text-cream hover:bg-forest-deep active:scale-95"
                            )}
                          >
                            {isAdded ? (
                              <>
                                <Check className="size-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="size-3.5" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* SECTION 4: 3 TRUST VALUE PROPOSITIONS (FILLS GAPS SMOOTHLY) */}
        {/* ========================================================== */}
        <section aria-labelledby="trust-props-heading" className="pt-2 border-t border-line-soft/80">
          <h2 id="trust-props-heading" className="sr-only">DocHomoeo Commitments</h2>
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
        </section>

      </Container>
    </div>
  );
}
