"use client";

import { useRef } from "react";
import {
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
const journeySteps = [
  {
    step: "01",
    title: "Find Your Doctor",
    description: "Browse certified doctors by speciality.",
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
    description: "Talk over video, audio or chat.",
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
    title: "100% Genuine",
    detail: "Products",
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
          start: "top 78%",
          once: true,
        },
      });

      // 1. Eyebrow badge fade & scale
      tl.fromTo(
        "[data-anim='eyebrow']",
        { opacity: 0, y: 16, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power2.out" }
      );

      // 2. Headline mask text wipe reveal
      tl.fromTo(
        "[data-anim='heading-mask']",
        { y: "115%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.85, ease: "power3.out" },
        "-=0.35"
      );

      // 3. Subtitle fade in
      tl.fromTo(
        "[data-anim='subtitle']",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.55"
      );

      // 4. SVG wave path draws smoothly from left to right
      const wavePath = container.querySelector("[data-anim='wave-path']");
      if (wavePath) {
        const length = 1200;
        gsap.set(wavePath, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(
          wavePath,
          { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" },
          "-=0.4"
        );
      }

      // 5. Connecting dots scale in
      tl.fromTo(
        "[data-anim='wave-dot']",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, stagger: 0.12, ease: "back.out(2)" },
        "-=1.0"
      );

      // 6. Staggered node badges pop in with soft bounce
      tl.fromTo(
        "[data-anim='node-badge']",
        { scale: 0.45, opacity: 0, y: 22 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.1,
          ease: "back.out(1.6)",
        },
        "-=1.1"
      );

      // 7. Node texts slide up
      tl.fromTo(
        "[data-anim='node-text']",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        "-=0.7"
      );

      // 8. Why Choose glass card floats up smoothly
      tl.fromTo(
        "[data-anim='why-choose-card']",
        { opacity: 0, y: 35, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
        "-=0.45"
      );

      // 9. Benefit badges ripple in
      tl.fromTo(
        "[data-anim='benefit-item']",
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" },
        "-=0.5"
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      aria-labelledby="journey-heading"
      className="relative w-full overflow-hidden text-ink py-16 sm:py-20 lg:py-24"
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. SCENIC BACKGROUND IMAGE (SimplePathBG.webp)                     */}
      {/* ----------------------------------------------------------------- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <img
          src="/Images/SimplePathBG.webp"
          alt=""
          aria-hidden="true"
          className="size-full object-cover object-[center_top] lg:object-center"
        />
        {/* Seamless atmospheric top blend connecting from Doctor Consultation */}
        <div aria-hidden="true" className="dh-section-blend-top" />

        {/* Seamless atmospheric bottom blend connecting to Trusted Brands */}
        <div aria-hidden="true" className="dh-section-blend-bottom" />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. SECTION CONTAINER                                              */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative z-10 mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10 xl:px-12">
        
        {/* Eyebrow & Headline with Mask Container */}
        <div className="max-w-2xl">
          {/* Eyebrow Pill Badge */}
          <div data-anim="eyebrow" className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md border border-white/80 px-4 py-1.5 shadow-2xs">
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
              className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight text-[#11241b] leading-[1.08] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
            >
              A Simple Path to Better Health
            </h2>
          </div>

          {/* Subtitle */}
          <p
            data-anim="subtitle"
            className="mt-3 text-[0.95rem] sm:text-[1.02rem] text-[#33483e] leading-relaxed max-w-xl font-normal"
          >
            Consult certified homeopathic doctors from the comfort of your home, track your treatment, and receive genuine medicines at your doorstep.
          </p>
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
