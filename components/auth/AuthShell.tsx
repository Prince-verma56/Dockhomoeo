"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SHOWCASE_SLIDES = [
  {
    image: "/Images/NaturesCareBG.webp",
    badge: "Phytotherapy & Homoeopathy",
    title: "100% Genuine Certified Care",
    description:
      "Certified German & Indian pharmacopoeia standards sourced directly from Schwabe, SBL, Reckeweg & Boiron. Fresh batch guaranteed.",
    tag: "Sealed Fresh Dispensing",
  },
  {
    image: "/Images/ConsultentBG.webp",
    badge: "Clinical Telehealth",
    title: "Council-Verified Doctors",
    description:
      "Unhurried 20-minute private telehealth consultations with experienced BHMS & MD homoeopaths across India.",
    tag: "Telehealth Council Certified",
  },
  {
    image: "/Images/NaturalWellBG.webp",
    badge: "Fast Dispatch",
    title: "Doorstep Delivery Across India",
    description:
      "Secure, temperature-controlled transit delivered with verified batch quality to 26,000+ pin codes.",
    tag: "Fast Pan-India Express",
  },
];

export type AuthShellProps = {
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Premium Full-Page Auth Shell:
 * - Desktop: Full-bleed edge-to-edge layout. Left half is a rich botanical sanctuary with 100% full-cover imagery
 *   and sleek editorial storytelling; Right half is a clean, spacious, minimalist form canvas.
 * - Mobile: Dedicated luxury layout with full-width visual hero cover banner, clean typography,
 *   and streamlined form flow without awkward mini-square image cards.
 */
export function AuthShell({ children, footer }: AuthShellProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance slides every 6 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const current = SHOWCASE_SLIDES[activeSlide];

  return (
    <div
      data-auth-page="true"
      className="min-h-screen w-full bg-white dark:bg-[#07130e] flex flex-col justify-between overflow-x-hidden"
    >
      <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] xl:grid-cols-[1.25fr_1fr] items-stretch">
        
        {/* ================================================================ */}
        {/* DESKTOP LEFT PANEL: 100% Full-Cover Editorial Visual Sanctuary   */}
        {/* ================================================================ */}
        <aside
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="hidden lg:flex min-h-screen h-full relative overflow-hidden select-none flex-col justify-between p-10 lg:p-12 xl:p-14"
        >
          {/* Full-bleed background imagery covering 100% of container */}
          {SHOWCASE_SLIDES.map((slide, idx) => (
            <div
              key={slide.image}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                activeSlide === idx ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
              )}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                priority={idx === 0}
                className="object-cover object-center transform scale-105 transition-transform duration-7000 ease-out"
              />
            </div>
          ))}

          {/* Cinematic dark luxury overlay for maximum readability & mood */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/35 z-10" />

          {/* Top Header Bar */}
          <div className="flex items-center justify-between relative z-20">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="size-3.5" />
              <span>Return to DocHomoeo</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 backdrop-blur-md border border-emerald-400/30 px-3 py-1 rounded-full shadow-sm">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>Council Verified Telehealth</span>
            </span>
          </div>

          {/* Bottom Editorial Storytelling & Pill Indicators */}
          <div className="relative z-20 max-w-xl space-y-4 pt-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-black/35 backdrop-blur-md border border-emerald-500/25 px-3 py-1 rounded-full">
              <Sparkles className="size-3.5 text-emerald-400" />
              <span>{current.badge}</span>
            </div>

            <h2 className="font-display text-2xl xl:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
              {current.title}
            </h2>

            <p className="text-sm text-neutral-200/90 leading-relaxed font-normal min-h-[44px]">
              {current.description}
            </p>

            {/* Carousel navigation pills */}
            <div className="flex items-center gap-2 pt-2">
              {SHOWCASE_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={cn(
                    "transition-all duration-300 cursor-pointer h-1 rounded-full",
                    activeSlide === idx
                      ? "w-8 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* ================================================================ */}
        {/* RIGHT / MAIN PANEL: Full-Height Clean Form Canvas                */}
        {/* ================================================================ */}
        <main
          id="main"
          className="min-h-screen h-full bg-white dark:bg-[#0c1e17] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto dh-no-scrollbar"
        >
          {/* Mobile Full-Bleed Visual Hero Cover Banner (Edge-to-edge) */}
          <div className="block lg:hidden -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 mb-6 bg-neutral-900 overflow-hidden rounded-b-[26px] shadow-sm">
            <div className="relative h-44 sm:h-52 w-full">
              <Image
                src="/Images/NaturesCareBG.webp"
                alt="DocHomoeo Botanical Care"
                fill
                sizes="100vw"
                priority
                className="object-cover object-center brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />

              {/* Mobile Top Navigation & Status */}
              <div className="absolute inset-x-0 top-0 p-4 flex items-center justify-between z-10">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back</span>
                </Link>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-400/30">
                  <ShieldCheck className="size-3 text-emerald-400" />
                  <span>Council Verified</span>
                </span>
              </div>

              {/* Brand Logo & Editorial Caption inside mobile banner */}
              <div className="absolute inset-x-0 bottom-3.5 px-4 z-10 flex items-center gap-3">
                <div className="relative size-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 shrink-0 flex items-center justify-center">
                  <Image
                    src="/Images/LogoGIF/Glossy Capsule with Sprouting Leaves.png"
                    alt="DocHomoeo Sprout"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="text-sm font-extrabold tracking-tight text-white block">
                    DOCHOMOEO
                  </span>
                  <span className="text-[10px] text-white/80 font-medium block">
                    Certified German &amp; Indian Pharmacopoeia
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content Container */}
          <div className="w-full max-w-md mx-auto my-auto py-2 sm:py-4">
            {/* Injected Form Controls */}
            {children}

            {/* Footer / Switcher */}
            {footer ? (
              <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-white/10 text-center text-xs text-neutral-500 dark:text-neutral-400">
                {footer}
              </div>
            ) : null}

            {/* Trust & Compliance Badge */}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
              <Lock className="size-3 text-[#0d5a43] dark:text-emerald-400" />
              <span>100% Secure Telehealth &amp; Encrypted Session</span>
            </div>
          </div>

          {/* Desktop copyright line */}
          <div className="hidden lg:block text-center text-[11px] text-neutral-400 pt-4">
            &copy; {new Date().getFullYear()} DocHomoeo Healthcare Network · All Rights Reserved
          </div>
        </main>

      </div>
    </div>
  );
}

/** Heading and one line of context at the top of an auth step. */
export function AuthHeading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 sm:mb-7 space-y-1 text-center lg:text-left">
      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {title}
      </h1>
      {children ? (
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {children}
        </p>
      ) : null}
    </div>
  );
}
