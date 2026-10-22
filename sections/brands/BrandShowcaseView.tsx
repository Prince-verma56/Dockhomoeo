"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FlaskConical,
  Heart,
  LayoutGrid,
  Leaf,
  Pill,
  Search,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import {
  BrandOfficialLogo,
  BrandTileItem,
  DrReckewegLogo,
  SblLogo,
  BaksonLogo,
  SchwabeLogo,
  LordsLogo,
} from "@/components/commerce/BrandLogos";
import type { BrandSummary } from "@/lib/catalogue";

interface BrandShowcaseViewProps {
  brands: BrandSummary[];
}

// 5 Featured Brands with curated high-res imagery and authentic branding
const FEATURED_BRANDS = [
  {
    name: "Dr. Reckeweg",
    slug: "dr-reckeweg-test",
    origin: "Germany · Est. 1897",
    image: "/Images/Products/reckeweg-r41.jpg",
    logoComponent: DrReckewegLogo,
    productsCount: 2,
    tagline: "Premier German Drops & Formulations",
  },
  {
    name: "SBL",
    slug: "sbl-test",
    origin: "India · Worldwide",
    image: "/Images/Products/sbl-natrum.jpg",
    logoComponent: SblLogo,
    productsCount: 2,
    tagline: "World Class Quality in Homoeopathy",
  },
  {
    name: "Bakson",
    slug: "bakson-test",
    origin: "India · Natural Care",
    image: "/Images/Products/bakson-arnica-oil.jpg",
    logoComponent: BaksonLogo,
    productsCount: 1,
    tagline: "Trusted Natural Health & Personal Care",
  },
  {
    name: "Schwabe",
    slug: "schwabe-test",
    origin: "Germany · Est. 1866",
    image: "/Images/Products/schwabe-alfalfa.jpg",
    logoComponent: SchwabeLogo,
    productsCount: 1,
    tagline: "From Nature. For People.",
  },
  {
    name: "Lord's",
    slug: "lords-test",
    origin: "India · Trusted Since 1986",
    image: "/Images/Products/lords-kali-phos.jpg",
    logoComponent: LordsLogo,
    productsCount: 1,
    tagline: "Authentic Clinical Homoeopathic Remedies",
  },
];

// Curated 10 Makers for the balanced 5x2 grid (100% authentic images & branding)
const MAKERS_LIST = [
  {
    name: "ADEL",
    slug: "adel-test",
    origin: "Germany · Est. 1985",
    country: "international",
    popular: true,
    image: "/Images/Editorial/eucalyptus-dropper-bottle.webp",
  },
  {
    name: "Bakson",
    slug: "bakson-test",
    origin: "Quality Care Naturally",
    country: "indian",
    popular: true,
    image: "/Images/Products/bakson-arnica-oil.jpg",
  },
  {
    name: "Dr. Reckeweg",
    slug: "dr-reckeweg-test",
    origin: "Germany · Est. 1897",
    country: "international",
    popular: true,
    image: "/Images/Products/reckeweg-r41.jpg",
  },
  {
    name: "Lord's",
    slug: "lords-test",
    origin: "Trusted Since 1986",
    country: "indian",
    popular: true,
    image: "/Images/Products/lords-kali-phos.jpg",
  },
  {
    name: "SBL",
    slug: "sbl-test",
    origin: "Leading in Homoeopathy",
    country: "indian",
    popular: true,
    image: "/Images/Products/sbl-natrum.jpg",
  },
  {
    name: "Weleda",
    slug: "weleda-test",
    origin: "Switzerland · Est. 1921",
    country: "international",
    popular: false,
    image: "/Images/Editorial/chamomilla-pellet-bottle.webp",
  },
  {
    name: "Hahnemann",
    slug: "hahnemann-test",
    origin: "Germany · Pure Classical",
    country: "international",
    popular: false,
    image: "/Images/Editorial/massage-oil-bottle.webp",
  },
  {
    name: "Pflüger",
    slug: "pflueger-test",
    origin: "Germany · Certified Maker",
    country: "international",
    popular: false,
    image: "/Images/brands/tablets-pellets.jpg",
  },
  {
    name: "Schwabe",
    slug: "schwabe-test",
    origin: "From Nature. For People.",
    country: "international",
    popular: true,
    image: "/Images/Products/schwabe-alfalfa.jpg",
  },
  {
    name: "Boiron",
    slug: "boiron-test",
    origin: "France · Est. 1932",
    country: "international",
    popular: true,
    image: "/Images/Products/boiron-arnica.jpg",
  },
];

// Product Types / Forms Showcase
const PRODUCT_TYPES = [
  {
    title: "Drops & Dilutions",
    slug: "drops",
    image: "/Images/Products/reckeweg-r41.jpg",
    icon: Droplets,
    href: "/products?form=drops",
    description: "Concentrated liquid potencies for quick sublingual uptake.",
  },
  {
    title: "Tablets & Pellets",
    slug: "tablets",
    image: "/Images/brands/tablets-pellets.jpg",
    icon: Pill,
    href: "/products?form=tablets",
    description: "Convenient biochemic tissue salts and sugar globules.",
  },
  {
    title: "Mother Tinctures",
    slug: "tincture",
    image: "/Images/Products/schwabe-alfalfa.jpg",
    icon: FlaskConical,
    href: "/products?form=tincture",
    description: "Botanical extracts prepared at peak potency.",
  },
  {
    title: "External Applications",
    slug: "cream",
    image: "/Images/Products/bakson-arnica-oil.jpg",
    icon: Droplets,
    href: "/products?form=cream",
    description: "Herbal ointments, gels, and nourishing massage oils.",
  },
];

type FilterTab = "all" | "popular" | "a-z" | "new" | "indian" | "international";

export function BrandShowcaseView({ brands }: BrandShowcaseViewProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const sliderRef = useRef<HTMLDivElement>(null);
  const searchInputId = useId();

  // Scroll controls for featured brand carousel
  const scrollSlider = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const scrollAmount = 340;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Filter makers logic
  const isDefaultView = activeTab === "all" && searchQuery.trim() === "";

  const filteredMakers = isDefaultView
    ? MAKERS_LIST
    : MAKERS_LIST.filter((maker) => {
        const matchesSearch =
          searchQuery.trim() === "" ||
          maker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          maker.origin.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === "popular") return maker.popular;
        if (activeTab === "indian") return maker.country === "indian";
        if (activeTab === "international") return maker.country === "international";
        return true;
      }).sort((a, b) => {
        if (activeTab === "a-z") return a.name.localeCompare(b.name);
        return 0;
      });

  return (
    <div className="bg-canvas pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 overflow-x-hidden">
      <Container className="max-w-[1260px] w-full px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 lg:space-y-24">
        
        {/* Breadcrumb */}
        <PageBreadcrumb items={[{ name: "Brands", href: "/brands" }]} structuredData={false} />

        {/* ========================================================== */}
        {/* SECTION 1: HERO SHOWCASE WITH 4 FLOATING BADGES             */}
        {/* ========================================================== */}
        <section aria-labelledby="brands-hero-title" className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-forest block">
                Authentic Manufacturers
              </span>

              <h1 id="brands-hero-title" className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-ink leading-[1.08]">
                Brands that give you more than <em className="italic font-serif text-forest-deep font-normal">remedies</em>.
              </h1>

              <p className="text-sm sm:text-base text-muted-ink leading-relaxed max-w-lg">
                Explore trusted homeopathic manufacturers and the unique ranges they bring to your natural wellness journey.
              </p>

              <div className="pt-2">
                <a
                  href="#featured-brands"
                  className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-bold text-cream shadow-soft hover:bg-forest-deep transition-all hover:scale-102 cursor-pointer"
                >
                  <span>Explore Brands</span>
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>

            {/* Right Visual Composition with 4 Floating Feature Badges */}
            <div className="lg:col-span-7 relative">
              <div className="relative mx-auto rounded-[2rem] overflow-hidden border border-line-soft bg-paper shadow-lift aspect-[16/10] max-h-[460px] w-full">
                <img
                  src="/Images/brands/hero-composition.jpg"
                  alt="Homeopathic remedies bottles and chamomile blossoms on sandstone pedestals"
                  className="size-full object-cover object-center pointer-events-none select-none"
                  draggable={false}
                />

                {/* Subtle soft vignette */}
                <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Badge 1: Top-Left */}
              <div className="hidden sm:flex absolute -top-4 -left-4 z-10 items-center gap-3 rounded-2xl border border-white/80 bg-paper/95 p-3 sm:p-3.5 shadow-float backdrop-blur-md max-w-[220px]">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sage-wash text-forest shadow-2xs">
                  <Award className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink leading-snug">Trusted Makers</p>
                  <p className="text-[10px] text-muted-ink">Backed by decades</p>
                </div>
                <ArrowRight className="size-3 text-muted-ink ml-auto shrink-0" />
              </div>

              {/* Badge 2: Top-Right */}
              <div className="hidden sm:flex absolute -top-4 -right-4 z-10 items-center gap-3 rounded-2xl border border-white/80 bg-paper/95 p-3 sm:p-3.5 shadow-float backdrop-blur-md max-w-[220px]">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sage-wash text-forest shadow-2xs">
                  <FlaskConical className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink leading-snug">Wide Product Range</p>
                  <p className="text-[10px] text-muted-ink">Every wellness need</p>
                </div>
                <ArrowRight className="size-3 text-muted-ink ml-auto shrink-0" />
              </div>

              {/* Badge 3: Bottom-Left */}
              <div className="hidden sm:flex absolute -bottom-4 -left-4 z-10 items-center gap-3 rounded-2xl border border-white/80 bg-paper/95 p-3 sm:p-3.5 shadow-float backdrop-blur-md max-w-[240px]">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sage-wash text-forest shadow-2xs">
                  <ShieldCheck className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink leading-snug">Quality You Can Trust</p>
                  <p className="text-[10px] text-muted-ink">Authentic & verified</p>
                </div>
                <ArrowRight className="size-3 text-muted-ink ml-auto shrink-0" />
              </div>

              {/* Badge 4: Bottom-Right */}
              <div className="hidden sm:flex absolute -bottom-4 -right-4 z-10 items-center gap-3 rounded-2xl border border-white/80 bg-paper/95 p-3 sm:p-3.5 shadow-float backdrop-blur-md max-w-[240px]">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sage-wash text-forest shadow-2xs">
                  <Heart className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink leading-snug">Natural Living</p>
                  <p className="text-[10px] text-muted-ink">Trusted worldwide</p>
                </div>
                <ArrowRight className="size-3 text-muted-ink ml-auto shrink-0" />
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================== */}
        {/* SECTION 2: FEATURED BRANDS CAROUSEL                         */}
        {/* ========================================================== */}
        <section id="featured-brands" aria-labelledby="featured-brands-heading" className="space-y-6">
          <Reveal y={16}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-forest block">
                  Featured Brands
                </span>
                <h2 id="featured-brands-heading" className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink mt-1">
                  Leading names. Trusted <em className="italic font-serif text-forest-deep font-normal">care</em>.
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="#all-makers"
                  className="text-xs sm:text-sm font-semibold text-forest hover:underline inline-flex items-center gap-1 mr-2"
                >
                  <span>View all brands</span>
                  <ArrowRight className="size-3.5" />
                </a>

                {/* Carousel Arrows */}
                <button
                  type="button"
                  onClick={() => scrollSlider("left")}
                  aria-label="Previous brands"
                  className="grid size-9 place-items-center rounded-full border border-line-soft bg-paper text-ink shadow-2xs hover:border-forest/40 hover:text-forest transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider("right")}
                  aria-label="Next brands"
                  className="grid size-9 place-items-center rounded-full border border-line-soft bg-paper text-ink shadow-2xs hover:border-forest/40 hover:text-forest transition-colors cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </Reveal>

          {/* 5-Card Featured Grid / Horizontal Carousel */}
          <Reveal y={20}>
            <div
              ref={sliderRef}
              className="grid grid-flow-col auto-cols-[82%] sm:auto-cols-[45%] lg:auto-cols-[220px] xl:auto-cols-[232px] gap-4.5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory select-none"
            >
              {FEATURED_BRANDS.map((item) => {
                const Logo = item.logoComponent;
                return (
                  <div
                    key={item.slug}
                    className="snap-start rounded-2xl border border-line-soft bg-paper overflow-hidden shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-forest/30 hover:shadow-lift flex flex-col group select-none"
                  >
                    {/* Top Image Showcase */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream/40">
                      <img
                        src={item.image}
                        alt={`${item.name} remedy showcase`}
                        className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                        draggable={false}
                      />
                    </div>

                    {/* Bottom Brand Card Details */}
                    <div className="p-4 flex flex-col items-center text-center flex-1 justify-between bg-white border-t border-line-soft/60">
                      <div className="py-2 w-full flex items-center justify-center min-h-[46px]">
                        <Logo />
                      </div>

                      <Link
                        href={`/brands/${item.slug}`}
                        className="mt-3.5 inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-canvas py-2 px-3 text-xs font-bold text-forest hover:bg-forest hover:text-cream transition-all group-hover:bg-forest group-hover:text-cream"
                      >
                        <span>Explore range</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </section>

        {/* ========================================================== */}
        {/* SECTION 3: BROWSE EVERY MAKER (PERFECT 5x2 BALANCED GRID)   */}
        {/* ========================================================== */}
        <section id="all-makers" aria-labelledby="all-makers-heading" className="space-y-6">
          <Reveal y={16}>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-forest block">
                  Explore Manufacturers
                </span>
                <h2 id="all-makers-heading" className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink mt-1">
                  Browse every maker
                </h2>
                <p className="text-xs sm:text-sm text-muted-ink mt-1 max-w-xl">
                  Discover all homeopathic manufacturers and explore their complete product range.
                </p>
              </div>

              {/* Search Input */}
              <div className="w-full lg:max-w-xs relative">
                <label htmlFor={searchInputId} className="sr-only">
                  Search manufacturers
                </label>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-ink" />
                <input
                  id={searchInputId}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search manufacturers..."
                  className="h-11 w-full rounded-full border border-line-soft bg-paper pl-10 pr-9 text-xs text-ink placeholder:text-muted-ink shadow-2xs focus:border-forest focus:ring-2 focus:ring-forest/15 focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-ink hover:text-ink cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { id: "all", label: "All Brands" },
                { id: "popular", label: "Popular" },
                { id: "a-z", label: "A-Z" },
                { id: "new", label: "New Arrivals" },
                { id: "indian", label: "Indian Brands" },
                { id: "international", label: "International Brands" },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as FilterTab)}
                    className={cn(
                      "cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all shadow-2xs",
                      active
                        ? "bg-forest-deep text-cream shadow-xs"
                        : "bg-paper border border-line-soft text-muted-ink hover:border-forest/40 hover:text-ink",
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* Grid Layout: Left Popular Card + Right 5x2 Grid */}
          <Reveal y={20}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Left Popular Manufacturers Dark Card */}
              <div className="lg:col-span-3 rounded-3xl bg-forest-abyss text-cream p-6 flex flex-col justify-between shadow-soft border border-forest/30 relative overflow-hidden group">
                <div className="space-y-4">
                  <h3 className="font-display text-2xl font-bold tracking-tight text-cream">
                    Popular Manufacturers
                  </h3>

                  {/* Real Physician Portrait Avatars + Verified Badge */}
                  <div className="flex items-center -space-x-2 pt-1">
                    <div className="size-9 rounded-full border-2 border-forest-abyss overflow-hidden bg-white/10 shrink-0 shadow-xs">
                      <img
                        src="/Images/doctors/step-video-call.jpg"
                        alt="Dr. Sharma, Senior Homeopath"
                        className="size-full object-cover pointer-events-none select-none"
                        draggable={false}
                      />
                    </div>
                    <div className="size-9 rounded-full border-2 border-forest-abyss overflow-hidden bg-white/10 shrink-0 shadow-xs">
                      <img
                        src="/Images/doctors/step-doctor-laptop.jpg"
                        alt="Dr. Patel, Clinical Specialist"
                        className="size-full object-cover pointer-events-none select-none"
                        draggable={false}
                      />
                    </div>
                    <div className="size-9 rounded-full border-2 border-forest-abyss overflow-hidden bg-white/10 shrink-0 shadow-xs">
                      <img
                        src="/Images/doctors/care-support.jpg"
                        alt="Dr. Gupta, Homeopathic Consultant"
                        className="size-full object-cover pointer-events-none select-none"
                        draggable={false}
                      />
                    </div>
                    <span className="grid size-9 place-items-center rounded-full border-2 border-forest-abyss bg-white/20 text-cream text-[11px] font-bold backdrop-blur-xs">
                      +12
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-cream/75 leading-relaxed">
                    Most explored and trusted brands by our community.
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-cream/80 pt-1">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-cream">4.9 ★ Rating</span>
                    <span className="text-[11px] text-cream/60">· Verified Labs</span>
                  </div>
                </div>

                {/* Bottom Action Button (Clean pill matching original reference) */}
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab("popular")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-cream hover:bg-white text-forest-deep px-5 py-3 text-xs sm:text-sm font-bold shadow-soft transition-all duration-300 hover:scale-[1.02] cursor-pointer w-full group/btn"
                  >
                    <span>View popular</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Right 5-Column Grid: Exactly 10 Tiles in 2 Rows of 5 */}
              <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                {filteredMakers.map((maker) => (
                  <Link
                    key={maker.name + maker.slug}
                    href={`/brands/${maker.slug}`}
                    className="group relative rounded-2xl border border-line-soft bg-white p-3.5 sm:p-4 flex flex-col items-center justify-between text-center shadow-2xs hover:border-forest/40 hover:shadow-soft transition-all duration-300 hover:-translate-y-1 h-[155px] sm:h-[165px]"
                  >
                    <BrandTileItem name={maker.name} origin={maker.origin} image={maker.image} />
                  </Link>
                ))}
              </div>

            </div>
          </Reveal>
        </section>

        {/* ========================================================== */}
        {/* SECTION 4: BROWSE BY PRODUCT TYPE                           */}
        {/* ========================================================== */}
        <section aria-labelledby="product-types-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-forest block">
                Browse by Product Type
              </span>
              <h2 id="product-types-heading" className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink mt-1">
                Find what you need, from every maker.
              </h2>
              <p className="text-xs sm:text-sm text-muted-ink mt-1 max-w-xl">
                Explore remedies across different categories, curated from trusted manufacturers.
              </p>
            </div>

            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-xs font-bold text-cream hover:bg-forest-deep transition-all shrink-0 shadow-xs"
            >
              <span>Explore all categories</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
            {PRODUCT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Link
                  key={type.slug}
                  href={type.href}
                  className="group rounded-2xl border border-line-soft bg-paper overflow-hidden shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-forest/30 hover:shadow-lift flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream/30">
                    <img
                      src={type.image}
                      alt={type.title}
                      className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                      draggable={false}
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between bg-white border-t border-line-soft/60">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sage-wash text-forest shadow-2xs group-hover:bg-forest group-hover:text-cream transition-colors">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-ink group-hover:text-forest transition-colors">
                          {type.title}
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-forest inline-flex items-center gap-1">
                      <span>Explore</span>
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ========================================================== */}
        {/* SECTION 5: WHY CHOOSE OUR BRANDS STRIP                      */}
        {/* ========================================================== */}
        {/* ========================================================== */}
        {/* SECTION 5: WHY CHOOSE OUR BRANDS STRIP                      */}
        {/* ========================================================== */}
        <section aria-labelledby="why-choose-heading">
          <Reveal y={16}>
            <div className="rounded-2xl border border-line-soft bg-linear-to-r from-sage-wash/80 via-white to-sage-wash/60 p-5 sm:p-6 shadow-2xs">
              <span id="why-choose-heading" className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-forest block mb-4 text-center sm:text-left">
                Why Choose Our Brands
              </span>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-forest shadow-2xs border border-line-soft">
                    <ShieldCheck className="size-4" />
                  </span>
                  <span className="text-xs font-bold text-ink leading-snug">
                    Licensed & Verified Manufacturers
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-forest shadow-2xs border border-line-soft">
                    <LayoutGrid className="size-4" />
                  </span>
                  <span className="text-xs font-bold text-ink leading-snug">
                    Wide Range of Authentic Remedies
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-forest shadow-2xs border border-line-soft">
                    <CheckCircle2 className="size-4" />
                  </span>
                  <span className="text-xs font-bold text-ink leading-snug">
                    Quality You Can Trust
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-forest shadow-2xs border border-line-soft">
                    <Leaf className="size-4" />
                  </span>
                  <span className="text-xs font-bold text-ink leading-snug">
                    Supporting Natural & Holistic Wellness
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ========================================================== */}
        {/* SECTION 6: BOTTOM HERO BANNER ("Natural care from...")      */}
        {/* ========================================================== */}
        <section aria-labelledby="bottom-banner-heading">
          <Reveal y={24}>
            <div className="grid grid-cols-1 lg:grid-cols-12 rounded-[2rem] border border-line-soft bg-paper overflow-hidden shadow-lift items-center">
              
              {/* Left Image */}
              <div className="lg:col-span-6 relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[280px]">
                <img
                  src="/Images/doctors/concern-remedies.jpg"
                  alt="Natural remedies on warm sandstone arches"
                  className="size-full object-cover object-center pointer-events-none select-none"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-linear-to-r from-transparent to-paper/20 pointer-events-none" />
              </div>

              {/* Right Content */}
              <div className="lg:col-span-6 p-7 sm:p-10 lg:p-12 space-y-4">
                <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-forest block">
                  Authentic Manufacturers
                </span>

                <h2 id="bottom-banner-heading" className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink leading-tight">
                  Natural care from trusted makers.
                </h2>

                <p className="text-xs sm:text-sm text-muted-ink leading-relaxed">
                  Explore the complete range of homeopathic brands and find the right remedy for you.
                </p>

                <div className="pt-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-xs sm:text-sm font-bold text-cream shadow-soft hover:bg-forest-deep transition-all hover:scale-102"
                  >
                    <span>Explore All Brands</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>

            </div>
          </Reveal>
        </section>

      </Container>
    </div>
  );
}
