"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { ICONS } from "@/lib/icons";
import { offerCampaign } from "@/data/mock/home";

/**
 * OfferBanner Section (Seasonal Wellness Edit)
 *
 * Implements the editorial campaign showcase using the photographic
 * artwork `/Images/SeasonalEditBG.webp`:
 * - Deep green dappled-sunlight background with the amber DocHomeo Immunity Support bottle on a stone plinth in rippling water
 * - Left editorial copy: Eyebrow, bold display headline, description, and white pill CTA
 * - Center unobstructed focal area spotlighting the real bottle & water ripples
 * - Right frosted-glass benefit capsules: 100% Genuine, Fast Delivery, Secure Payments
 */
export function OfferBanner() {
  return (
    <section
      aria-labelledby="offer-heading"
      className="bg-[#f6f2ea] px-3 pt-6 pb-12 sm:px-6 md:pt-10 md:pb-16 lg:px-8"
    >
      <Container width="wide" className="px-0 sm:px-0 lg:px-0">
        <div className="relative isolate overflow-hidden rounded-[2.25rem] sm:rounded-[2.75rem] border border-white/40 shadow-[0_24px_65px_-12px_rgba(4,42,32,0.22)] min-h-[460px] sm:min-h-[500px] lg:min-h-[520px] flex items-center">
          
          {/* ------------------------------------------------------------- */}
          {/* 1. PHOTOGRAPHIC SCENIC BACKGROUND (SeasonalEditBG.png)        */}
          {/* ------------------------------------------------------------- */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            <img
              src="/Images/SeasonalEditBG.webp"
              alt=""
              aria-hidden="true"
              className="size-full object-cover object-[62%_center] lg:object-center scale-[1.01]"
            />

            {/* Directional gradient vignette from left to guarantee crisp text legibility */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent lg:from-black/55 lg:via-black/15 pointer-events-none"
            />

            {/* Subtle bottom shadow vignette */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent pointer-events-none"
            />
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 2. CARD CONTENT GRID                                          */}
          {/* ------------------------------------------------------------- */}
          <div className="relative z-10 w-full grid items-center gap-8 px-6 py-10 sm:px-10 md:py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.4fr)_minmax(0,0.85fr)] lg:gap-6 lg:pl-12 lg:pr-8 xl:pl-16 xl:pr-10 lg:py-12">
            
            {/* Left Editorial Copy */}
            <div className="max-w-[28rem] flex flex-col items-start">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-3.5 py-1 text-[0.72rem] font-bold text-white tracking-[0.2em] uppercase shadow-2xs">
                  <Sparkles className="size-3 text-white" />
                  <span>{offerCampaign.eyebrow}</span>
                </div>
              </Reveal>

              <Reveal delay={0.06}>
                <h2
                  id="offer-heading"
                  className="mt-4 font-display text-3xl sm:text-4xl lg:text-[3.25rem] font-bold tracking-tight text-white leading-[1.05] drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                >
                  {offerCampaign.headlineLines[0]}
                  <br />
                  {offerCampaign.headlineLines[1]}
                </h2>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="mt-4 max-w-[34ch] text-[0.94rem] sm:text-[1.02rem] leading-relaxed text-white/85 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                  {offerCampaign.description}
                </p>

                <Link
                  href={offerCampaign.ctaHref}
                  className="mt-7 inline-flex items-center justify-center gap-2.5 rounded-full bg-white hover:bg-[#f6f2ea] text-[#053225] font-bold text-sm sm:text-base px-8 py-3.5 shadow-[0_8px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <span>{offerCampaign.ctaLabel}</span>
                  <ArrowRight className="size-4 stroke-[2.2]" />
                </Link>
              </Reveal>
            </div>

            {/* Center Focal Point (Generous open area spotlighting the bottle & water reflections) */}
            <div aria-hidden="true" className="hidden lg:block min-h-[280px] pointer-events-none" />

            {/* Right Trust Benefits (Shifted flush to the right edge with luxury glassmorphism) */}
            <Reveal stagger="[data-offer-benefit]" className="flex flex-col gap-3 sm:gap-3.5 w-full max-w-[270px] xl:max-w-[285px] lg:ml-auto">
              {offerCampaign.benefits.map((benefit) => {
                const Icon = ICONS[benefit.icon];
                return (
                  <div
                    key={benefit.id}
                    data-offer-benefit
                    className="group/benefit flex items-center gap-3.5 w-full rounded-2xl border border-white/25 bg-black/35 hover:bg-black/50 backdrop-blur-2xl px-4 py-3 sm:py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/45 hover:-translate-x-1.5 transition-all duration-300 select-none"
                  >
                    <span className="grid size-9.5 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-2xs group-hover/benefit:scale-105 transition-transform">
                      <Icon aria-hidden className="size-4.5" strokeWidth={1.8} />
                    </span>
                    <span className="leading-tight min-w-0">
                      <span className="block text-[0.84rem] sm:text-[0.88rem] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] truncate">
                        {benefit.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-white/80 font-medium truncate">
                        {benefit.detail}
                      </span>
                    </span>
                  </div>
                );
              })}
            </Reveal>

          </div>
        </div>
      </Container>
    </section>
  );
}
