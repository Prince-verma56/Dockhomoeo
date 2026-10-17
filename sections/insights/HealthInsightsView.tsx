"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Check,
  ShieldCheck,
  Award,
  Leaf,
  Clock,
  Sparkles,
  Mail,
  Info,
  X,
  BookOpen,
  CheckCircle2,
  Stethoscope,
  Volume2,
  Share2,
  Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link001 } from "@/components/ui/skiper-ui/skiper40";
import type { ApiInsightCard } from "@/types/api/insight";

/**
 * 6 Primary Health Concerns for the Circular Badge Rail
 * Using high-resolution authentic webp photography
 */
export const HEALTH_CONCERNS = [
  {
    id: "immunity",
    name: "Immunity",
    slug: "immunity",
    articleCount: 12,
    image: "/Images/HealthGoals/immunity.webp",
    description: "Strengthening natural cellular defense",
  },
  {
    id: "skincare",
    name: "Skin Care",
    slug: "skincare",
    articleCount: 8,
    image: "/Images/HealthGoals/skincare.webp",
    description: "Topical soothing & barrier repair",
  },
  {
    id: "sleep-stress",
    name: "Sleep & Stress",
    slug: "sleep-stress",
    articleCount: 10,
    image: "/Images/HealthGoals/sleep-stress.webp",
    description: "Nervous balance & restorative rest",
  },
  {
    id: "digestive",
    name: "Digestive Health",
    slug: "digestive",
    articleCount: 9,
    image: "/Images/HealthGoals/digestive.webp",
    description: "Gentle gastrointestinal motility",
  },
  {
    id: "womens-health",
    name: "Women's Health",
    slug: "womens-health",
    articleCount: 6,
    image: "/Images/HealthGoals/womens-health.webp",
    description: "Hormonal & cycle equilibrium",
  },
  {
    id: "joint-bone",
    name: "Joint & Bone",
    slug: "joint-bone",
    articleCount: 7,
    image: "/Images/HealthGoals/joint-bone.webp",
    description: "Musculoskeletal mobility & relief",
  },
];

/**
 * 5 Featured Articles for the interactive 01/05 carousel display
 * High-resolution authentic photography with zero screenshot artifacts
 */
export const FEATURED_ARTICLES = [
  {
    index: "01",
    category: "IMMUNITY",
    title: "How Homeopathy Supports Natural Immunity",
    excerpt:
      "Explore how homeopathic remedies like Arnica, Echinacea, and Arsenicum Album gently stimulate your body's vital defense mechanisms for long-term resilience.",
    readTime: "6 min read",
    author: "Dr. Emily Chen, MD (Hom)",
    badge: "Expert reviewed",
    image: "/Images/doctors/concern-remedies.jpg",
    slug: "how-homeopathy-supports-natural-immunity",
  },
  {
    index: "02",
    category: "DIGESTIVE",
    title: "Gentle Approaches to Gastrointestinal Harmony",
    excerpt:
      "Understanding Nux Vomica and Carbo Vegetabilis: restoring digestive rhythm, easing post-meal bloating, and maintaining natural gut flora balance.",
    readTime: "5 min read",
    author: "Dr. Rajiv Sharma, Senior Homeopath",
    badge: "Clinical study",
    image: "/Images/HealthGoals/digestive.webp",
    slug: "gentle-approaches-to-gastrointestinal-harmony",
  },
  {
    index: "03",
    category: "SLEEP & STRESS",
    title: "Restoring Circadian Balance Without Sedatives",
    excerpt:
      "How Coffea Cruda and Passiflora Incarnata calm an overstimulated nervous system, encouraging deep REM cycles without daytime grogginess or dependency.",
    readTime: "7 min read",
    author: "Dr. Eleanor Vance, Sleep Specialist",
    badge: "Practitioner guide",
    image: "/Images/doctors/step-video-call.jpg",
    slug: "restoring-circadian-balance-without-sedatives",
  },
  {
    index: "04",
    category: "SKIN CARE",
    title: "Botanical Formulations for Sensitive & Reactive Skin",
    excerpt:
      "Topical Calendula Officinalis and Berberis Aquifolium: calming acute eczema flare-ups, seasonal dryness, and oxidative stressors with pure herbal mother tinctures.",
    readTime: "4 min read",
    author: "Dr. Maya Patel, Clinical Specialist",
    badge: "Dermatologist reviewed",
    image: "/Images/Editorial/arnica-cream-tube.webp",
    slug: "botanical-formulations-for-sensitive-skin",
  },
  {
    index: "05",
    category: "DILUTION SCIENCE",
    title: "Demystifying Homeopathic Potencies (6X to 200C)",
    excerpt:
      "A clinician's comprehensive guide to understanding decimal and centesimal scales, serial succussion, and how to select the right potency for acute vs chronic concerns.",
    readTime: "8 min read",
    author: "DocHomoeo Pharmacopeia Board",
    badge: "Evidence based",
    image: "/Images/brands/tablets-pellets.jpg",
    slug: "demystifying-homeopathic-potencies",
  },
];

/**
 * Curated Topics (4 Cards row with pristine high-res assets)
 */
export const CURATED_TOPICS = [
  {
    id: "remedies-explained",
    title: "Remedies Explained",
    tag: "PRINCIPLES",
    description: "Understand the core doctrine of 'Like Cures Like', symptom totality, and what to expect during initial healing phases.",
    articleCount: 12,
    image: "/Images/brands/tablets-pellets.jpg",
    slug: "remedies-explained",
  },
  {
    id: "everyday-wellness",
    title: "Everyday Wellness",
    tag: "LIFESTYLE",
    description: "Practical natural therapies, restorative massage oils, and therapeutic routines to maintain daily vitality.",
    articleCount: 8,
    image: "/Images/Editorial/massage-oil-bottle.webp",
    slug: "everyday-wellness",
  },
  {
    id: "your-consultation",
    title: "Your Consultation",
    tag: "PRACTICE",
    description: "How to prepare comprehensive case notes, symptom timelines, and questions for your licensed practitioner visit.",
    articleCount: 5,
    image: "/Images/doctors/step-doctor-laptop.jpg",
    slug: "your-consultation",
  },
  {
    id: "understanding-labels",
    title: "Understanding Labels",
    tag: "PHARMACOPEIA",
    description: "Master bottle nomenclature, manufacturing standards, expiry conventions, and storage guidelines for remedies.",
    articleCount: 5,
    image: "/Images/Editorial/chamomilla-pellet-bottle.webp",
    slug: "understanding-labels",
  },
];

/**
 * From Our Experts (3 vertical cards in the dark forest showcase)
 */
export const EXPERT_ARTICLES = [
  {
    id: "manage-stress",
    category: "LIFESTYLE",
    title: "How to manage stress naturally through mindfulness and gentle adaptogens",
    author: "Dr. Eleanor Vance",
    role: "Clinical Homeopath",
    readTime: "5 min read",
    image: "/Images/doctors/step-video-call.jpg",
    slug: "how-to-manage-stress-naturally",
  },
  {
    id: "support-digestion",
    category: "DIGESTIVE",
    title: "Botanical infusions and nutritional timing that support optimal digestion",
    author: "Dr. Rajiv Sharma",
    role: "Gastroenterology Focus",
    readTime: "6 min read",
    image: "/Images/HealthGoals/digestive.webp",
    slug: "foods-that-support-better-digestion",
  },
  {
    id: "healthy-skin-tips",
    category: "SKIN CARE",
    title: "Topical Arnica and Calendula rituals for radiant, calm skin barrier",
    author: "Dr. Emily Chen",
    role: "Integrative Dermatology",
    readTime: "4 min read",
    image: "/Images/Editorial/arnica-cream-tube.webp",
    slug: "natural-care-tips-for-healthy-skin",
  },
];

interface HealthInsightsViewProps {
  initialInsights?: ApiInsightCard[];
  totalArticles?: number;
}

export function HealthInsightsView({
  initialInsights = [],
  totalArticles = 38,
}: HealthInsightsViewProps) {
  // Active Featured Article state (01/05 stepper)
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const activeArticle = FEATURED_ARTICLES[featuredIdx];

  // Selected concern filter state
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);

  // Audio / Video Overview modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Notify Me modal state
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(false);

  // Newsletter subscription state
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  // Horizontal concerns rail ref
  const concernsRailRef = useRef<HTMLDivElement>(null);

  const scrollConcerns = (direction: "left" | "right") => {
    if (concernsRailRef.current) {
      const offset = direction === "right" ? 300 : -300;
      concernsRailRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handlePrevFeatured = () => {
    setFeaturedIdx((prev) => (prev === 0 ? FEATURED_ARTICLES.length - 1 : prev - 1));
  };

  const handleNextFeatured = () => {
    setFeaturedIdx((prev) => (prev === FEATURED_ARTICLES.length - 1 ? 0 : prev + 1));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail || !subscribeEmail.includes("@")) return;
    setSubscribeSuccess(true);
    setTimeout(() => {
      setSubscribeEmail("");
      setSubscribeSuccess(false);
    }, 3500);
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes("@")) return;
    setNotifySuccess(true);
    setTimeout(() => {
      setIsNotifyModalOpen(false);
      setNotifySuccess(false);
      setNotifyEmail("");
    }, 2200);
  };

  return (
    <div className="relative overflow-x-hidden bg-canvas text-ink selection:bg-forest/15 selection:text-forest-deep">
      
      {/* ============================================================== */}
      {/* SECTION 1: IMMERSIVE EDITORIAL HERO (From Image 1 Inspiration)  */}
      {/* Seamless full-width stone arch atmosphere, books & tea ritual  */}
      {/* ============================================================== */}
      <section
        aria-labelledby="insights-hero-heading"
        className="relative overflow-hidden pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 bg-linear-to-b from-[#fbf8f2] via-[#f8f5ee] to-canvas border-b border-line-soft/80"
      >
        {/* Soft background ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-32 size-[520px] rounded-full bg-forest/8 blur-3xl select-none"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 -right-32 size-[520px] rounded-full bg-amber-500/8 blur-3xl select-none"
        />

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Main Card with Balanced Framing & Centered Aesthetics */}
          <div className="relative rounded-3xl sm:rounded-[2.5rem] border border-line-soft/90 bg-paper/95 p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 shadow-lift ring-1 ring-black/[0.03] backdrop-blur-xs overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center relative z-10">
              
              {/* Left Column: Breadcrumbs, Eyebrow, Typographic Title & CTAs */}
              <div className="lg:col-span-6 xl:col-span-6 space-y-5 sm:space-y-6">
                
                {/* Breadcrumbs from Image 1 */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-muted-ink">
                  <Link href="/" className="hover:text-forest transition-colors">
                    Home
                  </Link>
                  <span className="text-muted-ink/40 font-normal">›</span>
                  <span className="text-forest-deep">
                    Health Insights
                  </span>
                </nav>

                {/* Eyebrow from Image 1 */}
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-forest animate-pulse" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-forest">
                    THE WELLNESS JOURNAL
                  </span>
                </div>

                {/* Main Headline from Image 1 */}
                <h1
                  id="insights-hero-heading"
                  className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] font-bold text-ink tracking-tight leading-[1.08]"
                >
                  Knowledge <br />
                  for a{" "}
                  <span className="font-serif italic font-normal text-forest">
                    healthier
                  </span>{" "}
                  <br />
                  tomorrow.
                </h1>

                {/* Subtitle from Image 1 */}
                <p className="text-xs sm:text-sm lg:text-[0.96rem] text-muted-ink leading-relaxed max-w-xl">
                  Practical guides, expert-backed insights and natural wellness knowledge — written by licensed homeopaths to help you make informed healthcare decisions.
                </p>

                {/* Action Buttons from Image 1 & 2 */}
                <div className="pt-2 flex flex-wrap items-center gap-3.5">
                  <a
                    href="#health-concerns"
                    className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-xs sm:text-sm font-bold text-cream shadow-soft hover:bg-forest-deep transition-all duration-300 hover:scale-102 cursor-pointer"
                  >
                    <span>Explore Articles</span>
                    <ArrowRight className="size-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-line-soft bg-canvas/80 px-5 py-3.5 text-xs sm:text-sm font-semibold text-ink hover:border-forest/40 hover:text-forest transition-all cursor-pointer"
                  >
                    <Info className="size-4 text-forest" />
                    <span>How it helps</span>
                  </button>
                </div>

                {/* Three Trust Pillars from Image 2 with Enhanced Styling */}
                <div className="pt-6 border-t border-line-soft/80 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2.5 lg:gap-4 select-none">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-sage-wash text-forest shadow-2xs">
                      <Award className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink leading-tight truncate">
                        Expert reviewed
                      </p>
                      <p className="text-[10px] text-muted-ink truncate hidden sm:block">
                        Qualified practitioners
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-sage-wash text-forest shadow-2xs">
                      <ShieldCheck className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink leading-tight truncate">
                        Evidence based
                      </p>
                      <p className="text-[10px] text-muted-ink truncate hidden sm:block">
                        Pharmacopeia backed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-sage-wash text-forest shadow-2xs">
                      <Leaf className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink leading-tight truncate">
                        Natural & holistic
                      </p>
                      <p className="text-[10px] text-muted-ink truncate hidden sm:block">
                        Everyday wellness
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Expansive Stone Arch Window & Library Composition */}
              <div className="lg:col-span-6 xl:col-span-6 relative flex justify-center lg:justify-end items-center">
                <div className="relative w-full max-w-[500px] aspect-[4/3] sm:aspect-[16/11] rounded-[2rem] sm:rounded-[2.25rem] overflow-hidden border border-line-soft bg-paper shadow-lift group">
                  
                  {/* High-Resolution Classical Homeopathic Library Composition */}
                  <img
                    src="/Images/doctors/insights-books.jpg"
                    alt="Classical leatherbound Materia Medica and Homeopathy books on wooden desk with tea cup and library window"
                    className="size-full object-cover object-center pointer-events-none select-none transition-transform duration-700 ease-premium group-hover:scale-104"
                    draggable={false}
                  />

                  {/* Soft Vignette Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

                  {/* Floating Glass Pill: "Small reads. Big differences." */}
                  <div className="absolute top-4 right-4 sm:top-5 sm:right-5 rounded-2xl border border-white/85 bg-white/92 px-4 py-3 shadow-float backdrop-blur-md max-w-[230px] hidden sm:flex items-center gap-3 select-none">
                    <span className="grid size-8 place-items-center rounded-xl bg-forest-abyss text-cream shrink-0 shadow-2xs">
                      <BookOpen className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink leading-tight">
                        Small reads.
                      </p>
                      <p className="text-[10px] text-muted-ink leading-snug">
                        Big differences in daily life.
                      </p>
                    </div>
                    <span className="grid size-6 place-items-center rounded-full bg-forest/10 text-forest shrink-0">
                      <ArrowRight className="size-3" />
                    </span>
                  </div>

                  {/* Bottom Shelf Badge Label */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white drop-shadow-xs text-xs font-medium">
                    <span className="font-semibold flex items-center gap-1.5 bg-black/35 backdrop-blur-xs px-3 py-1.5 rounded-full">
                      <Sparkles className="size-3 text-amber-300" />
                      Materia Medica · Repertory · Clinical Insights
                    </span>
                  </div>

                </div>

                {/* Far Right Minimalist Vertical Indicator from Image 1 */}
                <div className="hidden 2xl:flex absolute -right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 select-none pointer-events-none">
                  <div className="h-10 w-px bg-forest/30" />
                  <span className="size-1.5 rounded-full bg-forest" />
                  <div className="flex flex-col items-center gap-4 text-[9px] font-bold tracking-[0.28em] text-muted-ink uppercase [writing-mode:vertical-rl]">
                    <span>LEARN</span>
                    <span>EXPLORE</span>
                    <span>UNDERSTAND</span>
                    <span>APPLY</span>
                    <span>LIVE BETTER</span>
                  </div>
                  <div className="h-10 w-px bg-forest/30" />
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: EXPLORE BY HEALTH CONCERN (INTERACTIVE PILL RAIL)   */}
      {/* Clean high-resolution photography without screenshot artifacts */}
      {/* ============================================================== */}
      <section
        id="health-concerns"
        aria-labelledby="concerns-heading"
        className="py-12 sm:py-16 border-b border-line-soft/70"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-7">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-forest block">
                EXPLORE BY HEALTH CONCERN
              </span>
              <h2
                id="concerns-heading"
                className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink mt-1"
              >
                Find what you want to learn.
              </h2>
            </div>

            <div className="flex items-center gap-3 select-none">
              <Link001 href="/categories" tone="forest" className="text-xs sm:text-sm font-semibold mr-1">
                View all topics
              </Link001>

              {/* Prev / Next Rail Controls */}
              <button
                type="button"
                onClick={() => scrollConcerns("left")}
                aria-label="Previous concerns"
                className="grid size-9 place-items-center rounded-full border border-line-soft bg-paper text-ink shadow-2xs hover:border-forest/40 hover:text-forest transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollConcerns("right")}
                aria-label="Next concerns"
                className="grid size-9 place-items-center rounded-full border border-line-soft bg-paper text-ink shadow-2xs hover:border-forest/40 hover:text-forest transition-colors cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* 6 Circular Concern Badges Rail */}
          <div
            ref={concernsRailRef}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none select-none"
          >
            {HEALTH_CONCERNS.map((item) => {
              const isSelected = selectedConcern === item.slug;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedConcern(isSelected ? null : item.slug)}
                  className={cn(
                    "group flex flex-col items-center text-center shrink-0 w-[130px] sm:w-[150px] p-3.5 sm:p-4 rounded-3xl border transition-all duration-300 cursor-pointer",
                    isSelected
                      ? "border-forest bg-sage-wash/40 shadow-soft scale-102"
                      : "border-line-soft bg-paper hover:border-forest/35 hover:shadow-soft hover:-translate-y-1"
                  )}
                >
                  {/* High-Resolution Circular Photo */}
                  <div className="relative size-20 sm:size-24 rounded-full overflow-hidden border-2 border-line-soft group-hover:border-forest/50 bg-cream-sunk shadow-xs transition-transform duration-500 group-hover:scale-106">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-full object-cover object-center pointer-events-none select-none"
                      draggable={false}
                    />
                    <div className="absolute inset-0 rounded-full ring-1 ring-black/5 ring-inset pointer-events-none" />
                  </div>

                  {/* Title & Pill Badge */}
                  <div className="mt-3.5 space-y-1">
                    <h3 className="font-display font-bold text-xs sm:text-sm text-ink group-hover:text-forest transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <span className="inline-block text-[10.5px] font-semibold text-muted-ink bg-canvas px-2.5 py-0.5 rounded-full border border-line-soft/60">
                      {item.articleCount} articles
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: FEATURED MASTER ARTICLE (01/05 SLIDER)              */}
      {/* 4K Photographic macro of amber remedy bottle & sucrose pellets */}
      {/* ============================================================== */}
      <section
        id="featured-article"
        aria-labelledby="featured-heading"
        className="py-12 sm:py-18"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="relative rounded-[2.5rem] border border-line-soft bg-paper shadow-lift overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Left Media Box with 4K Photography */}
            <div className="lg:col-span-6 xl:col-span-6 relative aspect-[16/11] lg:aspect-auto min-h-[320px] sm:min-h-[420px] overflow-hidden bg-cream-sunk">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="size-full object-cover object-center pointer-events-none select-none transition-all duration-700 ease-premium"
                draggable={false}
              />
              
              {/* Soft Photographic Vignette */}
              <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />

              {/* Crisp HTML Glassmorphic Badge */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 select-none">
                <span className="inline-flex items-center gap-2 rounded-full bg-paper/95 text-ink px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider shadow-float backdrop-blur-md border border-line-soft">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  FEATURED ARTICLE
                </span>
              </div>

              {/* Interactive Audio / Video Overview Circle Button */}
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                aria-label="Listen to audio overview"
                className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 grid size-12 place-items-center rounded-full bg-white text-forest shadow-float hover:scale-110 hover:bg-forest hover:text-cream transition-all duration-300 cursor-pointer"
              >
                <Play className="size-5 ml-0.5 fill-current" />
              </button>
            </div>

            {/* Right Editorial Details */}
            <div className="lg:col-span-6 xl:col-span-6 p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative bg-paper">
              
              {/* Delicate Botanical Line-Art Watermark */}
              <div
                aria-hidden
                className="pointer-events-none absolute right-4 bottom-4 opacity-[0.05] select-none"
              >
                <svg width="240" height="240" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M50 95 C50 60 20 40 20 20 C35 20 45 35 50 50 C55 35 65 20 80 20 C80 40 50 60 50 95 Z" />
                  <path d="M50 50 C40 30 50 10 50 5 C50 10 60 30 50 50 Z" />
                </svg>
              </div>

              <div className="space-y-4 sm:space-y-5 relative z-10">
                {/* Top Counter & Category Tag */}
                <div className="flex items-center justify-between select-none">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-forest">
                    {activeArticle.category}
                  </span>
                  <div className="flex items-baseline gap-1 font-display">
                    <span className="text-2xl sm:text-3xl font-black text-ink">{activeArticle.index}</span>
                    <span className="text-xs font-semibold text-muted-ink">/05</span>
                  </div>
                </div>

                {/* Article Headline */}
                <h3
                  id="featured-heading"
                  className="font-display text-2xl sm:text-3xl lg:text-[2rem] font-bold tracking-tight text-ink leading-snug"
                >
                  {activeArticle.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs sm:text-sm text-muted-ink leading-relaxed">
                  {activeArticle.excerpt}
                </p>

                {/* Author Citation & Reading Time */}
                <div className="flex flex-wrap items-center gap-3.5 text-xs text-muted-ink pt-1 font-medium">
                  <span className="flex items-center gap-1.5 text-ink font-semibold">
                    <Stethoscope className="size-3.5 text-forest" />
                    {activeArticle.author}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-forest">
                    <Clock className="size-3.5" />
                    {activeArticle.readTime}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-forest font-semibold">
                    <ShieldCheck className="size-3.5" />
                    {activeArticle.badge}
                  </span>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="pt-8 sm:pt-10 flex items-center justify-between gap-4 border-t border-line-soft/80 mt-6 relative z-10">
                <Link
                  href={`/insights/${activeArticle.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-xs sm:text-sm font-bold text-cream shadow-soft hover:bg-forest-deep transition-all duration-300 hover:scale-102 cursor-pointer"
                >
                  <span>Read article</span>
                  <ArrowRight className="size-3.5" />
                </Link>

                {/* Steppers: Prev / Next */}
                <div className="flex items-center gap-2 select-none">
                  <button
                    type="button"
                    onClick={handlePrevFeatured}
                    aria-label="Previous featured article"
                    className="grid size-10 place-items-center rounded-full border border-line-soft bg-canvas text-ink hover:border-forest hover:text-forest transition-colors cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="size-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFeatured}
                    aria-label="Next featured article"
                    className="grid size-10 place-items-center rounded-full border border-line-soft bg-canvas text-ink hover:border-forest hover:text-forest transition-colors cursor-pointer shadow-2xs"
                  >
                    <ChevronRight className="size-4.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: CURATED TOPICS (4 EDITORIAL CARDS)                  */}
      {/* Using real macro photography without screenshot borders        */}
      {/* ============================================================== */}
      <section
        id="curated-topics"
        aria-labelledby="topics-heading"
        className="py-12 sm:py-16 border-t border-line-soft/70"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-forest block">
                CURATED TOPICS
              </span>
              <h2
                id="topics-heading"
                className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink mt-1"
              >
                Guides for your everyday wellness.
              </h2>
            </div>

            <Link001 href="/products" tone="forest" className="text-xs sm:text-sm font-semibold">
              View all topics
            </Link001>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 sm:gap-6">
            {CURATED_TOPICS.map((topic) => (
              <Link
                key={topic.id}
                href={`/insights?topic=${topic.slug}`}
                className="group rounded-3xl border border-line-soft bg-paper overflow-hidden shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-forest/40 hover:shadow-lift flex flex-col justify-between select-none"
              >
                <div>
                  {/* Photo with Circular Arrow Badge */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-cream-sunk">
                    <img
                      src={topic.image}
                      alt={topic.title}
                      className="size-full object-cover object-center pointer-events-none select-none transition-transform duration-700 ease-premium group-hover:scale-106"
                      draggable={false}
                    />
                    
                    {/* Tag badge pill */}
                    <span className="absolute top-3 left-3 rounded-full bg-black/45 text-white backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                      {topic.tag}
                    </span>

                    {/* Arrow circular pill */}
                    <div className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full bg-white/95 text-forest shadow-xs backdrop-blur-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-forest group-hover:text-cream">
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-2">
                    <h3 className="font-display font-bold text-base sm:text-lg text-ink group-hover:text-forest transition-colors leading-snug">
                      {topic.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-muted-ink leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                </div>

                {/* Footer Count */}
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 text-xs font-semibold text-forest flex items-center justify-between border-t border-line-soft/50">
                  <span>{topic.articleCount} articles</span>
                  <span className="text-[11px] text-muted-ink">Explore →</span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 5: FROM OUR EXPERTS ("Wellness, explained by pro...")   */}
      {/* Deep Forest Green Curved Container with Real Physician Citations*/}
      {/* ============================================================== */}
      <section
        id="from-our-experts"
        aria-labelledby="experts-heading"
        className="py-10 sm:py-16"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="rounded-[2.5rem] bg-forest-abyss text-cream p-7 sm:p-10 lg:p-12 shadow-lift border border-forest/30 relative overflow-hidden">
            
            {/* Subtle atmospheric ambient glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-emerald-500/10 blur-3xl select-none"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
              
              {/* Left Column (4 cols) */}
              <div className="lg:col-span-4 space-y-4 sm:space-y-5">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300 block">
                  FROM OUR EXPERTS
                </span>
                
                <h2
                  id="experts-heading"
                  className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-cream leading-tight"
                >
                  Wellness, explained by professionals.
                </h2>

                <p className="text-xs sm:text-sm text-cream/75 leading-relaxed">
                  Discover expert-backed articles, practical tips and natural care guidance authored by licensed homeopathic physicians.
                </p>

                {/* Verified Physician Avatars Row */}
                <div className="flex items-center -space-x-2 pt-2">
                  <div className="size-9 rounded-full border-2 border-forest-abyss overflow-hidden bg-white/10 shrink-0 shadow-xs">
                    <img
                      src="/Images/doctors/step-video-call.jpg"
                      alt="Dr. Eleanor Vance"
                      className="size-full object-cover pointer-events-none select-none"
                      draggable={false}
                    />
                  </div>
                  <div className="size-9 rounded-full border-2 border-forest-abyss overflow-hidden bg-white/10 shrink-0 shadow-xs">
                    <img
                      src="/Images/doctors/step-doctor-laptop.jpg"
                      alt="Dr. Rajiv Sharma"
                      className="size-full object-cover pointer-events-none select-none"
                      draggable={false}
                    />
                  </div>
                  <div className="size-9 rounded-full border-2 border-forest-abyss overflow-hidden bg-white/10 shrink-0 shadow-xs">
                    <img
                      src="/Images/doctors/care-support.jpg"
                      alt="Dr. Emily Chen"
                      className="size-full object-cover pointer-events-none select-none"
                      draggable={false}
                    />
                  </div>
                  <span className="grid size-9 place-items-center rounded-full border-2 border-forest-abyss bg-white/20 text-cream text-[11px] font-bold backdrop-blur-xs">
                    +12
                  </span>
                </div>

                <div className="pt-2">
                  <Link
                    href="/doctors"
                    className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-xs sm:text-sm font-bold text-forest shadow-soft hover:bg-white hover:scale-102 transition-all duration-300"
                  >
                    <span>Meet our experts</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: 3 Pristine Article Cards (8 cols) */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4.5 select-none">
                {EXPERT_ARTICLES.map((article) => (
                  <Link
                    key={article.id}
                    href={`/insights/${article.slug}`}
                    className="group rounded-3xl bg-paper text-ink p-4 shadow-soft flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float overflow-hidden"
                  >
                    <div className="space-y-3.5">
                      {/* Photo with Tag Badge */}
                      <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-cream-sunk">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="size-full object-cover object-center pointer-events-none select-none transition-transform duration-500 group-hover:scale-106"
                          draggable={false}
                        />
                        <span className="absolute top-2.5 left-2.5 rounded-full bg-forest-abyss/90 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-cream shadow-2xs backdrop-blur-xs">
                          {article.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display font-bold text-xs sm:text-[13px] text-ink group-hover:text-forest transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Author */}
                      <p className="text-[11px] font-medium text-muted-ink">
                        By {article.author}
                      </p>
                    </div>

                    {/* Footer Row */}
                    <div className="pt-3 border-t border-line-soft/60 mt-3 flex items-center justify-between text-[11px] text-muted-ink font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-forest" />
                        {article.readTime}
                      </span>
                      <span className="grid size-6 place-items-center rounded-full bg-canvas text-forest group-hover:bg-forest group-hover:text-cream transition-colors">
                        <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 6: THE WELLNESS JOURNAL ("Our first guides are on...")  */}
      {/* High-res classical Materia Medica book composition & seal stamp*/}
      {/* ============================================================== */}
      <section
        id="wellness-guides-notice"
        aria-labelledby="guides-notice-heading"
        className="py-10 sm:py-16"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="rounded-[2.5rem] border border-line-soft bg-paper shadow-lift overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Left Photo Composition: High-Res Materia Medica Spread */}
            <div className="lg:col-span-5 relative aspect-16/10 lg:aspect-auto lg:h-full min-h-[250px] overflow-hidden bg-cream-sunk">
              <img
                src="/Images/doctors/insights-books.jpg"
                alt="Classical homeopathic clinical texts and monographs"
                className="size-full object-cover object-center pointer-events-none select-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-paper/20 pointer-events-none" />
            </div>

            {/* Right Copy with Botanical Stamp */}
            <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative">
              
              <div className="space-y-3.5 max-w-lg">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest block">
                  THE WELLNESS JOURNAL
                </span>

                <h3
                  id="guides-notice-heading"
                  className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink leading-snug"
                >
                  Our first guides are on the way.
                </h3>

                <p className="text-xs sm:text-sm text-muted-ink leading-relaxed">
                  We're working on practical, expert-reviewed articles to help you with common health questions. Meanwhile, explore remedies and verified maker formulations.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNotifyModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-xs sm:text-sm font-bold text-cream shadow-soft hover:bg-forest-deep transition-all duration-300 hover:scale-102 cursor-pointer"
                  >
                    <span>Notify me</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Verified Round Botanical Seal Stamp */}
              <div className="shrink-0 flex items-center justify-center pt-2 sm:pt-0">
                <div className="relative size-26 sm:size-30 rounded-full border border-forest/30 bg-[#f7f9f5] flex items-center justify-center p-2 text-forest select-none shadow-2xs">
                  {/* Double dashed ring */}
                  <div className="absolute inset-2 rounded-full border border-dashed border-forest/40 pointer-events-none" />
                  
                  {/* Center engraved leaf */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <Leaf className="size-7 text-forest fill-forest/20" />
                    <span className="text-[8px] font-black tracking-widest uppercase text-forest mt-1">
                      DOCHOMEO
                    </span>
                    <span className="text-[7px] font-semibold text-muted-ink tracking-tight">
                      EST. 2024
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 7: MODERN NEWSLETTER SUBSCRIPTION RIBBON                */}
      {/* ============================================================== */}
      <section
        id="newsletter-insights"
        aria-labelledby="newsletter-heading"
        className="pb-14 sm:pb-20"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="rounded-3xl border border-line-soft bg-paper p-6 sm:p-8 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left Info with Envelope Icon */}
            <div className="flex items-center gap-4 text-left w-full md:w-auto">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sage-wash text-forest shadow-2xs">
                <Mail className="size-6" />
              </span>
              <div>
                <h3
                  id="newsletter-heading"
                  className="font-display font-bold text-base sm:text-lg text-ink"
                >
                  Get wellness insights in your inbox.
                </h3>
                <p className="text-xs sm:text-sm text-muted-ink">
                  Be the first to know when we publish new monographs, physician tips and dilution guides.
                </p>
              </div>
            </div>

            {/* Right Email Form */}
            <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-center gap-2">
              <div className="relative flex-1 md:w-72">
                <input
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full rounded-full border border-line-soft bg-canvas px-4 py-3 text-xs sm:text-sm text-ink placeholder:text-muted-ink/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-forest px-6 py-3 text-xs sm:text-sm font-bold text-cream hover:bg-forest-deep transition-all shrink-0 cursor-pointer shadow-xs"
              >
                {subscribeSuccess ? (
                  <>
                    <Check className="size-4" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </button>
            </form>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* MODAL: Audio / Video Overview                                  */}
      {/* ============================================================== */}
      {isVideoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl bg-paper p-6 sm:p-8 text-center shadow-float border border-line-soft space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(false)}
              aria-label="Close overview modal"
              className="absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-canvas text-ink hover:text-forest transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <span className="grid size-14 place-items-center rounded-full bg-sage-wash text-forest mx-auto shadow-2xs">
              <Volume2 className="size-6 text-forest" />
            </span>

            <h3 className="font-display font-bold text-xl sm:text-2xl text-ink">
              DocHomoeo Clinical Audio Digests
            </h3>

            <p className="text-xs sm:text-sm text-muted-ink leading-relaxed">
              Our clinical editorial board compiles physician-recorded audio briefings covering homeopathic dilution principles, potency selection guidelines, and holistic wellness routines.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="rounded-full bg-forest px-6 py-2.5 text-xs sm:text-sm font-bold text-cream hover:bg-forest-deep transition-colors cursor-pointer"
              >
                Close briefing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Notify Me Dialog                                        */}
      {/* ============================================================== */}
      {isNotifyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsNotifyModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-paper p-6 sm:p-7 text-left shadow-float border border-line-soft space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsNotifyModalOpen(false)}
              aria-label="Close notify modal"
              className="absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-canvas text-ink hover:text-forest transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <span className="grid size-12 place-items-center rounded-2xl bg-sage-wash text-forest shadow-2xs">
              <Sparkles className="size-6" />
            </span>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg sm:text-xl text-ink">
                Be notified when new guides launch
              </h3>
              <p className="text-xs text-muted-ink leading-relaxed">
                Enter your email address to receive our upcoming homeopathic wellness monographs and physician-backed guides.
              </p>
            </div>

            {notifySuccess ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <span>You're all set! We'll notify you as soon as the first monographs go live.</span>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-3 pt-1">
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-xl border border-line-soft bg-canvas px-4 py-2.5 text-xs sm:text-sm text-ink placeholder:text-muted-ink/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-forest py-2.5 text-xs sm:text-sm font-bold text-cream hover:bg-forest-deep transition-colors shadow-xs cursor-pointer"
                >
                  Confirm Notification
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
