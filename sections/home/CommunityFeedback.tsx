"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Heart,
  MessageSquare,
  Package,
  ShieldCheck,
  Sprout,
  Stethoscope,
  Users,
} from "lucide-react";
import MorphPopover from "@/components/kokonutui/morph-popover";
import { cn } from "@/lib/utils";

const CATEGORY_CARDS = [
  {
    id: "Remedy Sourcing",
    label: "Remedy Sourcing",
    icon: Sprout,
    image: "/Images/cat_remedy.jpg",
  },
  {
    id: "Doctor Consultation",
    label: "Doctor Care",
    icon: Stethoscope,
    image: "/Images/doctors/step-video-call.jpg",
  },
  {
    id: "Packaging & Delivery",
    label: "Packaging & Purity",
    icon: Package,
    image: "/Images/Editorial/chamomilla-pellet-bottle.webp",
  },
  {
    id: "General Feedback",
    label: "General Feedback",
    icon: MessageSquare,
    image: "/Images/NaturalWellBG.webp",
  },
];

export function CommunityFeedback() {
  const [activeCategory, setActiveCategory] = useState("Remedy Sourcing");

  return (
    <section
      id="community-feedback"
      aria-labelledby="feedback-heading"
      className="relative w-full bg-gradient-to-b from-[#e8eee3] via-[#faf7f0] to-[#f6f2ea] py-16 sm:py-20 lg:py-24"
    >
      {/* Top Edge Seamless Color Fade into Testimonials (#e8eee3) - No hard blur seams */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-[#e8eee3] via-[#e8eee3]/60 to-transparent z-10"
      />

      {/* Full-Bleed Background Image (Gentle edge feathering fade, no hard boundaries) */}
      <div className="absolute inset-0 z-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_36px,black_calc(100%-36px),transparent_100%)]">
        <Image
          src="/Images/FeedbackWaveBG.jpg"
          alt="DocHomoeo patient voice and holistic care sanctuary"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center] lg:object-center"
        />
        {/* Luminous left gradient scrim for crisp typography contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#fbf8f2]/95 via-[#fbf8f2]/85 to-transparent lg:w-[60%]"
        />
      </div>

      {/* Expansive Wide Container on high z-index (z-30) so popovers float cleanly above blur overlays */}
      <div className="relative z-30 mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-14">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column (7 cols): Editorial Typography, Arched Cards, Button */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Eyebrow Row */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-forest shadow-2xs backdrop-blur-xs">
                <MessageSquare className="size-3.5 text-forest" />
                <span className="tracking-wider uppercase text-[11px]">
                  Patient Voice
                </span>
              </span>
              <span className="h-px w-8 bg-ink/20 hidden sm:inline-block" />
              <span className="text-xs sm:text-sm text-ink/75 font-medium">
                Your experience. A healthier tomorrow.
              </span>
            </div>

            {/* Headline with Plus Jakarta Sans (font-sans font-bold) */}
            <h2
              id="feedback-heading"
              className="mt-4 font-sans text-3xl sm:text-4xl lg:text-[3.25rem] font-bold tracking-tight text-[#14251f] leading-[1.12]"
            >
              Share your experience, <br />
              help us{" "}
              <em className="font-display italic font-normal text-[#0d5a43]">
                care better.
              </em>
            </h2>

            <p className="mt-3.5 max-w-xl text-sm sm:text-base text-ink/80 leading-relaxed font-normal">
              Share your feedback on consultations, product quality, or
              remedies — and help us improve, for a healthier community.
            </p>

            {/* 4 Arched Category Cards - Fully populated, no empty space */}
            <div className="mt-7 flex flex-wrap gap-3 sm:gap-4">
              {CATEGORY_CARDS.map((card) => {
                const Icon = card.icon;
                const isSelected = activeCategory === card.id;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setActiveCategory(card.id)}
                    className={cn(
                      "group relative flex flex-col justify-between w-28 sm:w-32 lg:w-34 h-38 sm:h-40 p-2 sm:p-2.5 rounded-t-[2.2rem] rounded-b-2xl border transition-all duration-200 cursor-pointer text-left shadow-xs overflow-hidden",
                      isSelected
                        ? "border-forest/60 bg-[#0d5a43] text-white shadow-md shadow-forest/25 scale-[1.03]"
                        : "border-white/70 bg-white/80 hover:bg-white text-ink backdrop-blur-md"
                    )}
                  >
                    {/* Top Photographic Thumbnail - Dominates the top arch */}
                    <div className="relative w-full h-22 sm:h-24 rounded-t-[1.9rem] rounded-b-xl overflow-hidden mb-1.5 shadow-2xs">
                      <Image
                        src={card.image}
                        alt={card.label}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div
                        className={cn(
                          "absolute inset-0 transition-opacity",
                          isSelected
                            ? "bg-forest/20"
                            : "bg-black/8 group-hover:bg-black/0"
                        )}
                      />

                      {/* Top Checkmark when active */}
                      {isSelected ? (
                        <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-white text-forest shadow-xs">
                          <Check className="size-3 stroke-[2.8]" />
                        </span>
                      ) : null}
                    </div>

                    {/* Bottom Content Row: Icon + Label + Arrow cleanly anchored */}
                    <div className="flex items-center justify-between gap-1 px-1 mt-auto">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Icon
                          className={cn(
                            "size-3.5 shrink-0",
                            isSelected ? "text-cream" : "text-forest"
                          )}
                        />
                        <span className="text-[11px] sm:text-xs font-bold leading-tight truncate">
                          {card.label}
                        </span>
                      </div>

                      <div
                        className={cn(
                          "flex size-5.5 shrink-0 items-center justify-center rounded-full transition-all text-xs",
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-black/5 text-ink/70 group-hover:bg-forest group-hover:text-white"
                        )}
                      >
                        <ArrowRight className="size-2.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Row: Balanced "Share your feedback" Button + Context Indicators */}
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <MorphPopover
                label="Share your feedback"
                placeholder={`Tell our medical council about your thoughts on ${activeCategory.toLowerCase()}...`}
                sentLabel="Thank you! Your note has reached our medical council."
                categories={CATEGORY_CARDS.map((c) => c.id)}
                defaultCategory={activeCategory}
                variant="forest"
                width={520}
                height={50}
              />

              <div className="flex items-center gap-3 text-xs text-ink/80 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-forest" />
                  <span>Takes 30 seconds</span>
                </span>

                <span className="h-4 w-px bg-ink/20 hidden sm:inline-block" />

                <span className="hidden sm:flex items-center gap-1.5">
                  <Users className="size-3.5 text-forest" />
                  <span>Direct to medical council</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Signature Script + True Glassmorphism Card + Community Badge */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
            {/* Authentic Medical Council Signature Endorsement (Natural floating handwritten script, no artificial box/glassmorphism) */}
            <div className="w-full max-w-[340px] text-right mb-4 pr-2">
              <p className="font-signature text-3xl sm:text-[2.2rem] lg:text-[2.5rem] font-bold text-[#094231] leading-[1.12] drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)] -rotate-1 select-none">
                “Your insights create <br className="hidden sm:inline" />healthier tomorrows”
              </p>
              <p className="mt-1 font-signature text-lg sm:text-xl font-semibold text-[#0d5a43]/90 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] -rotate-1 select-none">
                — DocHomoeo Medical Council
              </p>
            </div>

            {/* True Glassmorphism Checklist Card */}
            <div className="relative w-full max-w-[340px] rounded-3xl border border-white/60 bg-white/45 p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              {/* Activity Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-forest/10 text-forest shadow-2xs">
                    <BarChart3 className="size-5" />
                  </div>
                  <div>
                    <p className="font-sans text-sm font-bold text-ink leading-tight">
                      Real voices
                    </p>
                    <p className="font-sans text-sm font-bold text-ink leading-tight">
                      Real improvements
                    </p>
                  </div>
                </div>

                <div className="flex size-7 items-center justify-center rounded-full bg-black/5 text-ink/70">
                  <ArrowRight className="size-3.5" />
                </div>
              </div>

              {/* Concrete Improvements Checklist */}
              <div className="mt-4 space-y-3 text-xs font-medium text-ink/90">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-forest shrink-0" />
                  <span>Better product sourcing</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-forest shrink-0" />
                  <span>Improved packaging</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-forest shrink-0" />
                  <span>Enhanced consultation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-forest shrink-0" />
                  <span>Continuous care upgrades</span>
                </div>
              </div>
            </div>

            {/* Separate Bottom Frosted Community Badge matching the mockup */}
            <div className="mt-4 w-full max-w-[340px] rounded-full border border-white/60 bg-white/50 px-4 py-3 backdrop-blur-xl shadow-md flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                <Heart className="size-4 text-forest fill-forest/10" />
                <span className="text-[11.5px]">Trusted by our community</span>
              </div>

              <div className="flex -space-x-2 overflow-hidden">
                <div className="relative size-6.5 rounded-full border-2 border-white overflow-hidden shadow-2xs">
                  <Image
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=64&h=64&q=80"
                    alt="Community member"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative size-6.5 rounded-full border-2 border-white overflow-hidden shadow-2xs">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80"
                    alt="Community member"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative size-6.5 rounded-full border-2 border-white overflow-hidden shadow-2xs">
                  <Image
                    src="/Images/doctors/care-support.jpg"
                    alt="Care Lead"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex size-6.5 items-center justify-center rounded-full border-2 border-white bg-forest/10 text-[10px] font-bold text-forest shadow-2xs">
                  +
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 3 Trust Pillars spanning cleanly across the container as designed */}
        <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-ink/10 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-forest/10 text-forest shadow-2xs">
              <ShieldCheck className="size-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-ink">100% Confidential</p>
              <p className="text-muted-ink text-[11px]">Your information is safe & encrypted</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-forest/10 text-forest shadow-2xs">
              <Users className="size-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-ink">Reviewed by experts</p>
              <p className="text-muted-ink text-[11px]">Direct to our medical review board</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-forest/10 text-forest shadow-2xs">
              <Sprout className="size-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-ink">Helps us improve care</p>
              <p className="text-muted-ink text-[11px]">For a better care experience tomorrow</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Edge Seamless Color Fade into Health Insights (#f6f2ea) - No hard blur seams */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-[#f6f2ea] via-[#f6f2ea]/60 to-transparent z-10"
      />
    </section>
  );
}
