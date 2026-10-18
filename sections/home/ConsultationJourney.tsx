"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CreditCard,
  FileText,
  Package,
  RotateCcw,
  Search,
  Sprout,
  Truck,
  Video,
} from "lucide-react";
import { gsap } from "@/lib/animation/gsap";
import { prefersReducedMotion } from "@/lib/animation/motion";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * 5 Journey Steps matching the user's inspiration design
 */
const journeySteps: {
  step: string;
  title: string;
  description: string;
  /** Where this step happens on the site, when it is a page of its own. */
  link?: { href: string; label: string };
  icon: typeof Search;
  color: { aura: string; inner: string; shadow: string };
}[] = [
  {
    step: "01",
    title: "Find Your Doctor",
    description: "Browse verified doctors by speciality.",
    link: { href: "/doctors", label: "Browse doctors" },
    icon: Search,
    color: {
      aura: "bg-[#edf6ee] ring-8 ring-[#edf6ee]/70 text-[#1b5037]",
      inner: "bg-white text-[#1b5037]",
      shadow: "shadow-[0_10px_26px_rgba(27,80,55,0.09)]",
    },
  },
  {
    step: "02",
    title: "Book a Slot",
    description: "Choose a time that suits you.",
    icon: Calendar,
    color: {
      aura: "bg-[#fcf3ea] ring-8 ring-[#fcf3ea]/70 text-[#aa5d1c]",
      inner: "bg-white text-[#aa5d1c]",
      shadow: "shadow-[0_10px_26px_rgba(170,93,28,0.09)]",
    },
  },
  {
    step: "03",
    title: "Consult Online",
    description: "Talk over video or audio.",
    icon: Video,
    color: {
      aura: "bg-[#edf6f9] ring-8 ring-[#edf6f9]/70 text-[#146687]",
      inner: "bg-white text-[#146687]",
      shadow: "shadow-[0_10px_26px_rgba(20,102,135,0.09)]",
    },
  },
  {
    step: "04",
    title: "Get Prescription",
    description: "Receive a digital prescription.",
    link: { href: "/account/prescriptions", label: "Your prescriptions" },
    icon: FileText,
    color: {
      aura: "bg-[#f7f0f8] ring-8 ring-[#f7f0f8]/70 text-[#75347d]",
      inner: "bg-white text-[#75347d]",
      shadow: "shadow-[0_10px_26px_rgba(117,52,125,0.09)]",
    },
  },
  {
    step: "05",
    title: "Receive & Order",
    description: "Medicines delivered to your home.",
    link: { href: "/products", label: "Shop remedies" },
    icon: Package,
    color: {
      aura: "bg-[#edf7f1] ring-8 ring-[#edf7f1]/70 text-[#13613d]",
      inner: "bg-white text-[#13613d]",
      shadow: "shadow-[0_10px_26px_rgba(19,97,61,0.09)]",
    },
  },
];

/**
 * 4 Core Trust Benefits for the integrated "Why Choose DocHomeo?" card
 */
const trustBenefits = [
  {
    id: "genuine",
    title: "Genuine",
    detail: "Licensed makers",
    icon: Sprout,
    color: "bg-[#edf6ee] text-[#1b5037] border-white/80",
  },
  {
    id: "delivery",
    title: "Fast & Safe",
    detail: "Delivery",
    icon: Truck,
    color: "bg-[#fcf3ea] text-[#aa5d1c] border-white/80",
  },
  {
    id: "payments",
    title: "Secure",
    detail: "Payments",
    icon: CreditCard,
    color: "bg-[#edf6f9] text-[#146687] border-white/80",
  },
  {
    id: "returns",
    title: "Easy Returns",
    detail: "& Support",
    icon: RotateCcw,
    color: "bg-[#fbebee] text-[#b63c55] border-white/80",
  },
];

/**
 * ConsultationJourney Section
 *
 * Implements:
 * 1. Scenic Background: /Images/SimplePathBG.webp with sunlit archways and undulating dunes.
 * 2. Header: Floating frosted pill "HOW IT WORKS" + mask wipe animation on the warm serif headline.
 * 3. 5-Node Journey: Interactive pastel aura rings, animated SVG connecting wave line with trail dots.
 * 4. Unified Bottom Card: "Why Choose DocHomeo?" floating frosted card seamlessly integrated.
 * 5. Professional Entrance Animation: ScrollTrigger mask reveals and staggered springs.
 */
export function ConsultationJourney() {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 95%",
          once: true,
          fastScrollEnd: true,
        },
      });

      // 1. Eyebrow badge fade & scale
      tl.fromTo(
        "[data-anim='eyebrow']",
        { opacity: 0, y: 12, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
      );

      // 2. Headline mask text wipe reveal
      tl.fromTo(
        "[data-anim='heading-mask']",
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.4, ease: "power2.out" },
        "-=0.2"
      );

      // 3. Subtitle fade in
      tl.fromTo(
        "[data-anim='subtitle']",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
        "-=0.25"
      );

      // 3b. Header live clinic card entrance
      tl.fromTo(
        "[data-anim='header-action-card']",
        { opacity: 0, y: 16, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" },
        "-=0.25"
      );

      // 4. SVG wave path draws swiftly from left to right
      const wavePath = container.querySelector("[data-anim='wave-path']");
      if (wavePath) {
        const length = 1200;
        gsap.set(wavePath, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(
          wavePath,
          { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" },
          "-=0.25"
        );
      }

      // 5. Connecting dots scale in
      tl.fromTo(
        "[data-anim='wave-dot']",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.2, stagger: 0.03, ease: "back.out(2)" },
        "-=0.4"
      );

      // 6. Staggered node badges pop in swiftly
      tl.fromTo(
        "[data-anim='node-badge']",
        { scale: 0.5, opacity: 0, y: 16 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.04,
          ease: "back.out(1.5)",
        },
        "-=0.38"
      );

      // 7. Node texts slide up
      tl.fromTo(
        "[data-anim='node-text']",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: "power2.out" },
        "-=0.25"
      );

      // 8. Why Choose glass card floats up smoothly
      tl.fromTo(
        "[data-anim='why-choose-card']",
        { opacity: 0, y: 20, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" },
        "-=0.2"
      );

      // 9. Benefit badges ripple in
      tl.fromTo(
        "[data-anim='benefit-item']",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.25, stagger: 0.03, ease: "power2.out" },
        "-=0.25"
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      aria-labelledby="journey-heading"
      className="relative w-full overflow-hidden text-ink py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#f7f5ed] via-[#f4f7f2] to-[#f6f2ea]"
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. BRAND COLOR THEME AMBIENCE (Clean botanical elegance)           */}
      {/* ----------------------------------------------------------------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        {/* Soft herbal & warm sand radial glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_45%_at_15%_20%,rgba(13,90,67,0.06)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_85%_75%,rgba(195,160,100,0.045)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.85)_0%,transparent_65%)]" />

        {/* Delicate botanical geometric rings watermark */}
        <svg className="absolute -top-20 -right-20 w-[540px] h-[540px] text-forest/[0.035]" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="44" stroke="currentColor" strokeWidth="0.75" strokeDasharray="1 3" />
        </svg>

        <svg className="absolute -bottom-24 -left-20 w-[480px] h-[480px] text-forest/[0.03]" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" />
          <circle cx="100" cy="100" r="62" stroke="currentColor" strokeWidth="0.5" />
        </svg>

        {/* Seamless atmospheric top blend connecting from Doctor Consultation */}
        <div className="dh-section-blend-top opacity-60" />

        {/* Seamless atmospheric bottom blend connecting to Trusted Brands */}
        <div className="dh-section-blend-bottom opacity-60" />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. SECTION CONTAINER                                              */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative z-10 mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10 xl:px-12">
        
        {/* Top Header: Editorial Headline on Left + Live Clinic Action Hub on Right */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">
          {/* Left Column: Eyebrow & Headline with Mask Container */}
          <div className="max-w-2xl">
            {/* Eyebrow Pill Badge */}
            <div data-anim="eyebrow" className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-forest/15 px-4 py-1.5 shadow-2xs">
              <span className="size-1.5 rounded-full bg-forest animate-pulse" />
              <span className="text-[0.74rem] font-bold tracking-[0.18em] text-forest uppercase">
                HOW IT WORKS
              </span>
            </div>

            {/* Mask Reveal Headline */}
            <div className="overflow-hidden mt-3.5">
              <h2
                id="journey-heading"
                data-anim="heading-mask"
                className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight text-[#11241b] leading-[1.08]"
              >
                A Simple Path to Better Health
              </h2>
            </div>

            {/* Subtitle */}
            <p
              data-anim="subtitle"
              className="mt-3 text-[0.95rem] sm:text-[1.02rem] text-[#33483e] leading-relaxed max-w-xl font-normal"
            >
              Consult verified homoeopathic doctors from the comfort of your home, track your treatment, and receive genuine medicines at your doorstep.
            </p>
          </div>

          {/* Right Column: Live Clinic & Quick Consultation Hub Card */}
          <div
            data-anim="header-action-card"
            className="w-full lg:w-auto lg:max-w-md shrink-0 flex flex-col gap-3 rounded-2xl bg-white/85 hover:bg-white/95 backdrop-blur-xl border border-forest/15 p-4 sm:p-5 shadow-[0_12px_32px_rgba(20,40,30,0.06)] transition-all"
          >
            {/* Top Row: Live Indicator + Verified Doctors Badge */}
            <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-600" />
                </span>
                <span className="text-[11px] font-bold tracking-wider text-forest uppercase">
                  Live Clinic Active
                </span>
              </div>
              <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-forest">
                Avg. wait &lt; 15 mins
              </span>
            </div>

            {/* Middle Row: 3 Quick Guarantees */}
            <div className="grid grid-cols-3 gap-2 py-1 text-center">
              <div className="rounded-xl bg-forest/[0.04] p-2">
                <p className="text-[11.5px] font-bold text-ink">100% Vetted</p>
                <p className="text-[10px] text-[#485e52]">BHMS / MD</p>
              </div>
              <div className="rounded-xl bg-forest/[0.04] p-2">
                <p className="text-[11.5px] font-bold text-ink">Video &amp; Audio</p>
                <p className="text-[10px] text-[#485e52]">Private Call</p>
              </div>
              <div className="rounded-xl bg-forest/[0.04] p-2">
                <p className="text-[11.5px] font-bold text-ink">Digital Rx</p>
                <p className="text-[10px] text-[#485e52]">Valid Anywhere</p>
              </div>
            </div>

            {/* Action Button */}
            <Link
              href="/doctors"
              className="group/btn inline-flex items-center justify-between w-full rounded-xl bg-forest px-4.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-forest/90 transition-all"
            >
              <div className="flex items-center gap-2">
                <Video className="size-3.5" />
                <span>Book Video Consultation</span>
              </div>
              <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 3. 5-NODE JOURNEY PATH                                            */}
        {/* ----------------------------------------------------------------- */}
        <div className="relative mt-14 sm:mt-18">
          
          {/* Desktop SVG Undulating Wave Curve Line */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-[34px] inset-x-0 pointer-events-none select-none z-0"
          >
            <svg
              viewBox="0 0 1000 60"
              fill="none"
              preserveAspectRatio="none"
              className="w-full h-14"
            >
              {/* Undulating gentle wave curve connecting the 5 column centers */}
              <path
                data-anim="wave-path"
                d="M 60 30 C 130 16, 170 44, 240 30 C 310 16, 370 44, 440 30 C 510 16, 570 44, 640 30 C 710 16, 770 44, 840 30 C 880 20, 910 35, 940 30"
                stroke="#789e7f"
                strokeWidth="2"
                strokeDasharray="none"
                className="opacity-55"
              />
              {/* Organic glowing dots along the wave trail */}
              <circle data-anim="wave-dot" cx="180" cy="30" r="3.5" fill="#5f8966" className="opacity-80" />
              <circle data-anim="wave-dot" cx="380" cy="30" r="3.5" fill="#5f8966" className="opacity-80" />
              <circle data-anim="wave-dot" cx="580" cy="30" r="3.5" fill="#5f8966" className="opacity-80" />
              <circle data-anim="wave-dot" cx="780" cy="30" r="3.5" fill="#5f8966" className="opacity-80" />
            </svg>
          </div>

          {/* 5 Journey Nodes */}
          <ol className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-6 md:gap-4 lg:gap-6">
            {journeySteps.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.step}
                  className="group flex md:flex-col items-start gap-4 md:gap-0 transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Circular Node Icon with Glowing Pastel Aura Ring */}
                  <div data-anim="node-badge" className="relative shrink-0">
                    <span
                      className={`grid size-16 sm:size-17 lg:size-18 place-items-center rounded-full border-2 border-white/90 ${item.color.aura} ${item.color.shadow} transition-transform duration-300 group-hover:scale-105`}
                    >
                      <span className={`grid size-10 sm:size-11 place-items-center rounded-full ${item.color.inner} shadow-xs`}>
                        <Icon className="size-5 sm:size-5.5 stroke-[2]" />
                      </span>
                    </span>
                  </div>

                  {/* Step Info */}
                  <div data-anim="node-text" className="min-w-0 md:mt-5">
                    <span className="text-[0.76rem] sm:text-[0.8rem] font-bold text-forest tracking-wider uppercase">
                      {item.step}
                    </span>
                    <h3 className="mt-1 text-[1.02rem] sm:text-[1.08rem] font-semibold text-[#11231a] leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[0.82rem] sm:text-[0.86rem] text-[#485e52] leading-relaxed max-w-[22ch]">
                      {item.description}
                    </p>
                    {item.link ? (
                      <Link
                        href={item.link.href}
                        className="mt-2 inline-flex items-center gap-1 rounded-sm text-[0.82rem] font-semibold text-forest underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none"
                      >
                        {item.link.label}
                        <ArrowRight aria-hidden className="size-3.5" />
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 4. UNIFIED "WHY CHOOSE DOCHOMEO?" TRUST CARD                      */}
        {/* ----------------------------------------------------------------- */}
        <div data-anim="why-choose-card" className="mt-14 sm:mt-18 lg:mt-22">
          <div className="rounded-[30px] bg-white/75 hover:bg-white/80 backdrop-blur-2xl border border-white/85 px-6 sm:px-8 lg:px-10 py-6 sm:py-7.5 shadow-[0_16px_42px_rgba(20,40,30,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)] transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 xl:gap-12">
              
              {/* Brand Title */}
              <div className="shrink-0">
                <p className="text-[0.7rem] font-bold text-forest tracking-widest uppercase">
                  WHY CHOOSE US
                </p>
                <h3 className="mt-1 font-display text-2xl sm:text-[1.85rem] font-bold text-ink leading-tight">
                  Why Choose<br className="hidden sm:inline" /> DocHomeo?
                </h3>
              </div>

              {/* Vertical divider on desktop */}
              <div
                aria-hidden="true"
                className="hidden lg:block h-12 w-px bg-black/[0.08]"
              />

              {/* 4 Trust Benefits */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 flex-1">
                {trustBenefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={benefit.id}
                      data-anim="benefit-item"
                      className="group/item flex items-center gap-3 sm:gap-3.5 transition-transform duration-200 hover:translate-x-1"
                    >
                      <span
                        className={`grid size-11 sm:size-12 shrink-0 place-items-center rounded-full border shadow-2xs ${benefit.color} transition-transform duration-200 group-hover/item:scale-105`}
                      >
                        <Icon className="size-4.5 sm:size-5 stroke-[1.8]" />
                      </span>
                      <div className="min-w-0 leading-tight">
                        <span className="block text-[0.84rem] sm:text-[0.9rem] font-semibold text-[#11231a]">
                          {benefit.title}
                        </span>
                        <span className="block text-[0.73rem] sm:text-[0.77rem] text-[#55695f] mt-0.5">
                          {benefit.detail}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
