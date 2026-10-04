"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSectionTimeline } from "@/lib/animation/sectionTimeline";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  Plus,
} from "lucide-react";

/**
 * Curated Patient Testimonials matching the exact user layout:
 * - Center card initially: Mumbai (5.0)
 * - Left card initially: Pune (4.0)
 * - Right card initially: Bangalore (4.5)
 */
const testimonialData = [
  {
    id: "pune",
    rating: 4.0,
    quote:
      "Really helpful and knowledgeable doctors. The process was simple and comfortable.",
    authorName: "Sample Reviewer",
    authorLocation: "Pune",
    initials: "SR",
    verified: true,
  },
  {
    id: "mumbai",
    rating: 5.0,
    quote:
      "“The consultation was smooth, and the natural treatment really worked for me. I feel much better now!”",
    authorName: "Sample Reviewer",
    authorLocation: "Mumbai",
    initials: "SR",
    verified: true,
  },
  {
    id: "bangalore",
    rating: 4.5,
    quote:
      "“Loved the care and personal attention. The results have been truly positive.”",
    authorName: "Sample Reviewer",
    authorLocation: "Bangalore",
    initials: "SR",
    verified: true,
  },
  {
    id: "delhi",
    rating: 5.0,
    quote:
      "“The doctors took time to understand the root causes. Genuine medicines delivered straight to my home!”",
    authorName: "Sample Reviewer",
    authorLocation: "New Delhi",
    initials: "SR",
    verified: true,
  },
  {
    id: "jaipur",
    rating: 5.0,
    quote:
      "“Very smooth booking and prescription flow. Clear guidance and effective homeopathic care without stress.”",
    authorName: "Sample Reviewer",
    authorLocation: "Jaipur",
    initials: "SR",
    verified: true,
  },
];

/**
 * Avatar stack for social proof header
 */
const patientAvatars = [
  {
    name: "Priya",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    fallback: "P",
  },
  {
    name: "Rahul",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    fallback: "R",
  },
  {
    name: "Ananya",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    fallback: "A",
  },
  {
    name: "Vikram",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    fallback: "V",
  },
];

export function Testimonials() {
  // The quote column reads first, then the coverflow stage arrives. The cards
  // themselves are driven by inline 3D transforms, so GSAP only ever touches
  // their stage — never the cards — or the two would fight over `transform`.
  const sectionRef = useSectionTimeline<HTMLElement>([
    { sel: "[data-r-eyebrow]", variant: "rise", at: 0 },
    { sel: "[data-r-head]", variant: "rise", at: 0.12 },
    { sel: "[data-r-copy]", variant: "rise", at: 0.26 },
    { sel: "[data-r-proof]", variant: "rise", at: 0.38 },
    { sel: "[data-r-stage]", variant: "rise", at: 0.3 },
    { sel: "[data-r-dots]", variant: "rise", at: 0.6 },
  ]);

  // Start with index 1 (Mumbai) centered, with Pune (0) on the left and Bangalore (2) on the right
  const [activeIndex, setActiveIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const total = testimonialData.length;

  // Touch and drag swipe tracking
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const prev = useCallback(() => {
    setActiveIndex((curr) => (curr - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setActiveIndex((curr) => (curr + 1) % total);
  }, [total]);

  // Gentle auto-rotation that pauses when user hovers or interacts
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      next();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    if (touchDeltaX.current > 45) {
      prev();
    } else if (touchDeltaX.current < -45) {
      next();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <section
      ref={sectionRef}
      data-motion-gate
      id="testimonials-section"
      aria-labelledby="testimonials-heading"
      className="relative w-full overflow-hidden pt-12 sm:pt-16 lg:pt-20 pb-14 sm:pb-18 lg:pb-24"
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. LIGHT CANVAS BACKDROP                                          */}
      {/* Mint-tinted. Its horizon arc carries the staging the photograph    */}
      {/* used to provide, and the orbital rings below now draw in brand ink */}
      {/* rather than white, which a white canvas would have swallowed.      */}
      {/* ----------------------------------------------------------------- */}
      <div aria-hidden="true" className="dh-canvas dh-canvas--mint" />

      {/* ----------------------------------------------------------------- */}
      {/* 2. MAIN SECTION CONTENT                                           */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative z-20 mx-auto w-full max-w-[1580px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr] gap-12 lg:gap-8 items-center">
          
          {/* ------------------------------------------------------------- */}
          {/* LEFT COLUMN: Clean text, straight onto the canvas              */}
          {/* ------------------------------------------------------------- */}
          <div className="relative flex flex-col justify-center max-w-xl lg:max-w-lg">
            
            {/* Eyebrow with leading rule */}
            <div
              data-r-eyebrow
              data-reveal
              className="flex items-center gap-2 text-[0.72rem] sm:text-xs font-bold tracking-[0.22em] text-[#0d5a43] uppercase"
            >
              <span className="w-5 h-[1.5px] bg-[#0d5a43]" />
              <span>REAL PEOPLE. REAL CARE.</span>
            </div>

            {/* Consistent Primary Sans-Main Headline (Plus Jakarta Sans) */}
            <h2
              data-r-head
              data-reveal
              id="testimonials-heading"
              className="mt-3.5 font-sans font-bold tracking-tight text-[#071d13] text-3xl sm:text-4xl lg:text-[3.1rem] leading-[1.12]"
            >
              What Our Patients Say
            </h2>

            {/* Narrative Subtitle */}
            <p
              data-r-copy
              data-reveal
              className="mt-3.5 text-[0.95rem] sm:text-[1.02rem] text-[#2c4437] font-medium leading-relaxed"
            >
              Stories of healing, trust, and better living — from people who chose a more natural path to wellness.
            </p>

            {/* Social Proof Avatar Stack & Rating Metric */}
            <div data-r-proof data-reveal className="mt-7 flex items-center gap-4 pt-1">
              {/* Overlapping Avatar Pill */}
              <div className="flex -space-x-2.5 items-center">
                {patientAvatars.map((avatar, idx) => (
                  <div
                    key={idx}
                    className="relative size-9 sm:size-10 rounded-full border-2 border-white overflow-hidden shadow-2xs shrink-0 bg-[#dbe8de]"
                  >
                    <Image
                      src={avatar.src}
                      alt={avatar.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ))}
                {/* 5th circle badge with plus */}
                <div className="relative size-9 sm:size-10 rounded-full border-2 border-white bg-[#e6ede6] text-[#142e22] text-xs font-bold flex items-center justify-center shadow-2xs shrink-0">
                  <Plus className="size-3.5 stroke-[2.8]" />
                </div>
              </div>

              {/* Rating text */}
              <div className="leading-tight">
                <span className="block text-base sm:text-lg font-bold text-[#071d13]">
                  4.8/5
                </span>
                <span className="block text-[0.72rem] sm:text-[0.78rem] text-[#4d6657] font-medium mt-0.5">
                  From 500+ happy patients
                </span>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT COLUMN: 3D Cinematic Orbital Coverflow Carousel         */}
          {/* ------------------------------------------------------------- */}
          <div
            className="relative flex flex-col items-center justify-center w-full min-h-[350px] sm:min-h-[380px] lg:min-h-[420px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Atmospheric 3D Orbital Perspective Ellipses */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10 select-none overflow-hidden"
            >
              <svg
                viewBox="0 0 760 380"
                className="w-[125%] max-w-[800px] h-auto opacity-70 sm:opacity-90"
                fill="none"
              >
                {/* Outer orbital perspective ring */}
                <ellipse
                  cx="380"
                  cy="190"
                  rx="340"
                  ry="105"
                  stroke="rgba(13, 90, 67, 0.18)"
                  strokeWidth="1.2"
                  strokeDasharray="6 5"
                  style={{ transform: "rotate(-10deg)", transformOrigin: "center" }}
                />
                {/* Inner orbital perspective ring */}
                <ellipse
                  cx="380"
                  cy="190"
                  rx="280"
                  ry="85"
                  stroke="rgba(201, 142, 85, 0.38)"
                  strokeWidth="1.4"
                  style={{ transform: "rotate(-6deg)", transformOrigin: "center" }}
                />
              </svg>
            </div>

            {/* 3D Cards Perspective Stage */}
            <div
              data-r-stage
              data-reveal
              className="relative w-full h-[310px] sm:h-[330px] flex items-center justify-center [perspective:1200px]"
            >
              {testimonialData.map((item, index) => {
                // Compute relative offset in circular array: -1 (left), 0 (center), 1 (right)
                let diff = (index - activeIndex) % total;
                if (diff < -Math.floor(total / 2)) diff += total;
                if (diff > Math.floor(total / 2)) diff -= total;

                // Center (Active Spotlight)
                const isCenter = diff === 0;
                // Left neighbor
                const isLeft = diff === -1;
                // Right neighbor
                const isRight = diff === 1;

                // Calculate 3D transforms based on position
                let transformStyle = "";
                let opacity = 0;
                let zIndex = 0;
                let pointerEvents: "auto" | "none" = "none";

                if (isCenter) {
                  transformStyle =
                    "translateX(0%) translateZ(0px) rotateY(0deg) scale(1)";
                  opacity = 1;
                  zIndex = 30;
                  pointerEvents = "auto";
                } else if (isLeft) {
                  transformStyle =
                    "translateX(-58%) translateZ(-90px) rotateY(20deg) scale(0.84)";
                  opacity = 0.8;
                  zIndex = 10;
                  pointerEvents = "auto";
                } else if (isRight) {
                  transformStyle =
                    "translateX(58%) translateZ(-90px) rotateY(-20deg) scale(0.84)";
                  opacity = 0.8;
                  zIndex = 10;
                  pointerEvents = "auto";
                } else {
                  // Hidden cards in background
                  transformStyle = diff < 0
                    ? "translateX(-110%) translateZ(-160px) rotateY(30deg) scale(0.7)"
                    : "translateX(110%) translateZ(-160px) rotateY(-30deg) scale(0.7)";
                  opacity = 0;
                  zIndex = 0;
                  pointerEvents = "none";
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isLeft) prev();
                      if (isRight) next();
                    }}
                    style={{
                      transform: transformStyle,
                      opacity,
                      zIndex,
                      pointerEvents,
                      transformStyle: "preserve-3d",
                    }}
                    className={`absolute w-[290px] sm:w-[340px] md:w-[365px] rounded-[26px] sm:rounded-[30px] p-6 sm:p-7 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] select-none ${
                      isCenter
                        ? "bg-white border border-line/70 shadow-[0_2px_4px_rgba(20,37,31,0.04),0_26px_50px_-26px_rgba(20,37,31,0.45)] cursor-default"
                        : "bg-[#fbfaf6] border border-line/60 shadow-[0_1px_2px_rgba(20,37,31,0.03),0_14px_30px_-22px_rgba(20,37,31,0.35)] hover:opacity-90 cursor-pointer"
                    }`}
                  >
                    {/* Header: Star Rating and Score */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 text-[#d97706]">
                        {Array.from({ length: 5 }).map((_, starIdx) => {
                          const isFilled = starIdx < Math.floor(item.rating);
                          const isHalf = starIdx === Math.floor(item.rating) && item.rating % 1 !== 0;
                          return (
                            <Star
                              key={starIdx}
                              className={`size-4 ${
                                isFilled
                                  ? "fill-[#d97706] text-[#d97706]"
                                  : isHalf
                                  ? "fill-[#d97706]/50 text-[#d97706]"
                                  : "text-neutral-300"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <span className="text-[0.82rem] font-bold text-[#14251f] ml-1">
                        {item.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Middle: Patient Quote */}
                    <div className="py-4 my-auto min-h-[88px] sm:min-h-[100px] flex items-center">
                      <p className="text-[0.92rem] sm:text-[1.02rem] text-[#14251f] font-normal leading-relaxed line-clamp-3">
                        {item.quote}
                      </p>
                    </div>

                    {/* Bottom: Reviewer Identity */}
                    <div className="flex items-center gap-3 pt-3 border-t border-line/60">
                      {/* Avatar Initials Badge */}
                      <span className="size-9 rounded-full bg-[#dbe8de] text-[#134e3a] font-bold text-xs flex items-center justify-center shrink-0 border border-white">
                        {item.initials}
                      </span>
                      <div className="min-w-0 leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[0.84rem] font-bold text-[#0d2117] truncate">
                            {item.authorName}
                          </span>
                          {item.verified && (
                            <CheckCircle2 className="size-3.5 text-[#0c503b] shrink-0" />
                          )}
                        </div>
                        <span className="text-[0.72rem] text-[#556d60] font-medium block mt-0.5">
                          {item.authorLocation}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ----------------------------------------------------------- */}
            {/* Carousel Navigation Bar (Clean Minimal Buttons + Track)     */}
            {/* ----------------------------------------------------------- */}
            <div className="mt-6 flex items-center gap-3.5 z-40">
              {/* Prev Button */}
              <button
                type="button"
                onClick={prev}
                aria-label="Previous testimonial"
                className="size-9 sm:size-10 rounded-full bg-white hover:bg-[#0d5a43] hover:text-white shadow-[0_2px_10px_-4px_rgba(20,37,31,0.25)] border border-line/70 grid place-items-center text-[#11241a] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <ChevronLeft className="size-4.5 stroke-[2.2]" />
              </button>

              {/* Segmented Progress Track */}
              <div data-r-dots data-reveal className="flex items-center gap-1.5 px-1 py-1">
                {testimonialData.map((_, dotIdx) => {
                  const isActive = dotIdx === activeIndex;
                  return (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveIndex(dotIdx)}
                      aria-label={`Go to testimonial ${dotIdx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-400 cursor-pointer ${
                        isActive
                          ? "w-7 bg-[#0d5a43]"
                          : "w-4 bg-black/15 hover:bg-black/30"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={next}
                aria-label="Next testimonial"
                className="size-9 sm:size-10 rounded-full bg-white hover:bg-[#0d5a43] hover:text-white shadow-[0_2px_10px_-4px_rgba(20,37,31,0.25)] border border-line/70 grid place-items-center text-[#11241a] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <ChevronRight className="size-4.5 stroke-[2.2]" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
