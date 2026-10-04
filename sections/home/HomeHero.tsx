"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FlaskConical,
  HeartHandshake,
  Leaf,
  Star,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { useHeroPlayback } from "@/components/providers/HeroPlaybackContext";
import { gsap } from "@/lib/animation/gsap";

/**
 * HomeHero
 * 
 * Features:
 * 1. Background video from /Videos/HeroVideo.mp4 playing cleanly without clutter
 * 2. Bottom play/mute UI removed completely
 * 3. Masked parallax reveal animation on headline, copy, and trust elements
 * 4. Subparagraph and bottom proof bar encased in subtle frosted glass for 100% legibility
 * 5. Right side cards redesigned with pure glassmorphism, uniform width, and aligned on right edge
 * 6. Botanical Corner Leaves (HeroLeftLeaves.png & HeroRightLeaves.png):
 *    - Reveal elastically from bottom-left and bottom-right corners AFTER content animation finishes
 *    - Continuous gentle YOYO swaying breathing animation powered by GSAP
 *    - Scroll reactivity: Smoothly retreat back to corner origins on scroll down, spring back elastically on scroll up to hero!
 */
export function HomeHero() {
  const playback = useHeroPlayback();
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Sync ref with context
  const videoRef = playback?.videoRef ?? localVideoRef;

  const [currentTime, setCurrentTime] = useState(0);

  // Appearance state from context
  const contentVisible = playback ? playback.contentVisible : true;

  // Section ref for scroll trigger tracking
  const sectionRef = useRef<HTMLElement | null>(null);

  // Layer 1: Scroll-tracked scrub refs (outer)
  const leftLeafScrollRef = useRef<HTMLDivElement | null>(null);
  const rightLeafScrollRef = useRef<HTMLDivElement | null>(null);

  // Layer 2: Directional first-time entrance refs (middle)
  const leftLeafEntranceRef = useRef<HTMLDivElement | null>(null);
  const rightLeafEntranceRef = useRef<HTMLDivElement | null>(null);

  // Layer 3: Ambient yoyo breathing sway refs (inner)
  const leftLeafInnerRef = useRef<HTMLImageElement | null>(null);
  const rightLeafInnerRef = useRef<HTMLImageElement | null>(null);

  // Guard to ensure entrance triggers only once
  const hasEnteredRef = useRef(false);

  // Handle video time update
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  }, [videoRef]);

  // Handle video ending - pause cleanly on the last frame
  const handleEnded = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
  }, [videoRef]);

  // 1. Set initial off-screen positions for directional corner entrance
  useEffect(() => {
    if (leftLeafEntranceRef.current) {
      gsap.set(leftLeafEntranceRef.current, {
        x: -260,
        y: 200,
        rotation: -12,
        opacity: 0,
      });
    }
    if (rightLeafEntranceRef.current) {
      gsap.set(rightLeafEntranceRef.current, {
        x: 260,
        y: 200,
        rotation: 12,
        opacity: 0,
      });
    }
  }, []);

  // 2. Trigger smooth first-time entrance from left-bottom and right-bottom corners
  useEffect(() => {
    if (!contentVisible || hasEnteredRef.current) return;
    hasEnteredRef.current = true;

    const timer = setTimeout(() => {
      // Left leaf glides in smoothly from bottom-left corner
      if (leftLeafEntranceRef.current) {
        gsap.to(leftLeafEntranceRef.current, {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          duration: 1.8,
          ease: "power3.out",
        });
      }

      // Right leaf glides in smoothly from bottom-right corner
      if (rightLeafEntranceRef.current) {
        gsap.to(rightLeafEntranceRef.current, {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          duration: 1.8,
          ease: "power3.out",
        });
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [contentVisible]);

  // 3. Scroll-tracked scrub animation (Outer layer) & Ambient Yoyo Sway (Inner layer)
  useEffect(() => {
    if (!sectionRef.current || !leftLeafScrollRef.current || !rightLeafScrollRef.current) return;

    const ctx = gsap.context(() => {
      // Direct Scroll-Tracked Timeline on Layer 1:
      // Perfectly tracks with user's scroll wheel and finger!
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=380",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        leftLeafScrollRef.current,
        {
          x: -240,
          y: 190,
          rotation: -8,
          opacity: 0,
          ease: "power1.out",
        },
        0
      );

      tl.to(
        rightLeafScrollRef.current,
        {
          x: 240,
          y: 190,
          rotation: 8,
          opacity: 0,
          ease: "power1.out",
        },
        0
      );

      // Ambient organic yoyo sway on Layer 3
      if (leftLeafInnerRef.current) {
        gsap.to(leftLeafInnerRef.current, {
          y: "-=8",
          rotation: "+=1",
          duration: 4.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      if (rightLeafInnerRef.current) {
        gsap.to(rightLeafInnerRef.current, {
          y: "-=10",
          rotation: "-=1",
          duration: 5.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const cards = [
    {
      icon: <Leaf className="size-5 text-[#0d5a43]" />,
      title: "100%",
      subtitle: "Natural Ingredients",
    },
    {
      icon: <FlaskConical className="size-5 text-[#0d5a43]" />,
      title: "Clinically",
      subtitle: "Trusted Formulations",
    },
    {
      icon: <UserCheck className="size-5 text-[#0d5a43]" />,
      title: "Expert Doctors",
      subtitle: "Online",
    },
    {
      icon: <HeartHandshake className="size-5 text-[#0d5a43]" />,
      title: "Holistic Care",
      subtitle: "for Every Family",
    },
  ];

  return (
    <section
      ref={sectionRef}
      aria-label="DocHomoeo Hero"
      className="relative min-h-screen w-full overflow-hidden bg-[#f6f2ea] pt-24 pb-8 sm:pt-28 sm:pb-10 lg:pt-32 lg:pb-12 flex items-center"
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. HERO VIDEO BACKGROUND                                          */}
      {/* ----------------------------------------------------------------- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef as React.RefObject<HTMLVideoElement>}
          src="/Videos/HeroVideo.mp4"
          autoPlay
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className="h-full w-full object-cover object-center scale-[1.01]"
        />

        {/* Ultra-subtle minimal tint on left to ensure contrast without cloudiness */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-full lg:w-[38%] bg-gradient-to-r from-white/20 to-transparent pointer-events-none"
        />

        {/* Seamless atmospheric bottom blend connecting into Health Goals */}
        <div aria-hidden className="dh-section-blend-bottom" />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. HERO CONTENT GRID                                              */}
      {/* ----------------------------------------------------------------- */}
      <Container width="wide" className="relative z-10 w-full py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.18fr_0.82fr_0.95fr] lg:items-center">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="flex flex-col gap-5 sm:gap-6 max-w-[36rem]">
            
            {/* Eyebrow - masked slide-up */}
            <div className="overflow-hidden">
              <div
                className={cn(
                  "flex items-center gap-3.5 transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  contentVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-full opacity-0"
                )}
                style={{ transitionDelay: "80ms" }}
              >
                <span className="text-[0.75rem] sm:text-[0.8125rem] font-bold tracking-[0.22em] uppercase text-[#0d5a43] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                  Natural Healing. Real Results.
                </span>
                <span className="h-[1.5px] w-12 bg-[#0d5a43]/50 rounded-full" />
              </div>
            </div>

            {/* Main Headline - Masked Parallax Reveal */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.9rem] xl:text-[4.4rem] font-sans font-bold tracking-tight text-[#14251f] leading-[1.04]">
              {/* Line 1 */}
              <div className="overflow-hidden py-0.5">
                <span
                  className={cn(
                    "block transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[0_2px_10px_rgba(255,255,255,0.7)]",
                    contentVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-[120%] opacity-0"
                  )}
                  style={{ transitionDelay: "140ms" }}
                >
                  Gentle Care
                </span>
              </div>
              {/* Line 2 */}
              <div className="overflow-hidden py-0.5">
                <span
                  className={cn(
                    "block transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[0_2px_10px_rgba(255,255,255,0.7)]",
                    contentVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-[120%] opacity-0"
                  )}
                  style={{ transitionDelay: "260ms" }}
                >
                  For a Healthier
                </span>
              </div>
              {/* Line 3 */}
              <div className="overflow-hidden py-0.5">
                <span
                  className={cn(
                    "block transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[0_2px_10px_rgba(255,255,255,0.7)]",
                    contentVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-[120%] opacity-0"
                  )}
                  style={{ transitionDelay: "380ms" }}
                >
                  <em className="font-display italic font-normal text-[#0d5a43]">
                    Tomorrow
                  </em>
                </span>
              </div>
            </h1>

            {/* Subparagraph - Frosted Glass Plate for Perfect Legibility */}
            <div
              className={cn(
                "transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)]",
                contentVisible
                  ? "translate-y-0 opacity-100 filter-none"
                  : "translate-y-8 opacity-0 blur-xs"
              )}
              style={{ transitionDelay: "480ms" }}
            >
              <div className="rounded-2xl bg-white/35 backdrop-blur-md border border-white/60 px-5 py-3 shadow-[0_4px_24px_rgba(20,37,31,0.05)] max-w-[42ch]">
                <p className="text-[0.9375rem] sm:text-[1rem] leading-relaxed text-[#14251f] font-semibold">
                  Trusted homeopathic medicines, expert doctors and holistic care —
                  all at your doorstep.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={cn(
                "flex flex-wrap items-center gap-3.5 pt-1 transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)]",
                contentVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: "580ms" }}
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#0d5a43] hover:bg-[#063b2d] text-white px-7 py-3.5 text-[0.9375rem] font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 group"
              >
                Shop Medicines
                <ArrowRight className="size-4.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/doctors"
                className="inline-flex items-center gap-2.5 rounded-full bg-white/95 hover:bg-white text-[#14251f] border border-white/80 px-6 py-3.5 text-[0.9375rem] font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              >
                <Stethoscope className="size-4.5 text-[#0d5a43]" />
                Consult a Doctor
              </Link>
            </div>

            {/* Social Proof Bar - Frosted Glass Capsule for 100% Visibility Over Water & Bubbles */}
            <div
              className={cn(
                "pt-2 transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)]",
                contentVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: "680ms" }}
            >
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 rounded-full bg-white/40 backdrop-blur-md border border-white/60 px-5 py-2.5 shadow-[0_4px_24px_rgba(20,37,31,0.06)] w-fit">
                {/* Patient Avatars */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2.5 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Happy family member"
                      width={34}
                      height={34}
                      className="inline-block size-8.5 rounded-full ring-2 ring-white object-cover"
                    />
                    <Image
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="Happy family member"
                      width={34}
                      height={34}
                      className="inline-block size-8.5 rounded-full ring-2 ring-white object-cover"
                    />
                    <Image
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                      alt="Happy family member"
                      width={34}
                      height={34}
                      className="inline-block size-8.5 rounded-full ring-2 ring-white object-cover"
                    />
                  </div>
                  <div className="text-xs leading-snug">
                    <span className="block font-bold text-[#14251f] text-[0.8125rem]">
                      10,000+
                    </span>
                    <span className="text-[#3b4742] font-semibold">Happy Families</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-black/15" />

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <span className="grid size-7.5 place-items-center rounded-lg bg-[#0d5a43]/15 text-[#0d5a43]">
                    <Building2 className="size-4" />
                  </span>
                  <div className="text-xs leading-snug">
                    <span className="flex items-center gap-1 font-bold text-[#14251f] text-[0.8125rem]">
                      4.8 <Star className="size-3 fill-amber-500 text-amber-500" />
                    </span>
                    <span className="text-[#3b4742] font-semibold">App Rating</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ================= CENTER COLUMN SPACER ================= */}
          <div className="hidden lg:block min-h-[300px]" aria-hidden />

          {/* ================= RIGHT COLUMN (Pure Glassmorphic Aligned Cards) ================= */}
          <div className="flex flex-col gap-3 sm:gap-3.5 lg:items-end justify-center">
            {cards.map((card, i) => (
              <div
                key={card.title}
                className={cn(
                  "transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  contentVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-12 opacity-0"
                )}
                style={{ transitionDelay: `${250 + i * 110}ms` }}
              >
                <GlassmorphicCard
                  icon={card.icon}
                  title={card.title}
                  subtitle={card.subtitle}
                />
              </div>
            ))}
          </div>

        </div>
      </Container>

      {/* ----------------------------------------------------------------- */}
      {/* 3. BOTANICAL CORNER LEAVES (Corner Entrance & Scroll-Tracked)     */}
      {/* ----------------------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {/* Left Leaf: Layer 1 (Directly scrubbed by user scroll) */}
        <div
          ref={leftLeafScrollRef}
          className="absolute -bottom-4 sm:-bottom-6 lg:-bottom-8 -left-8 sm:-left-14 lg:-left-20 w-[210px] sm:w-[280px] md:w-[360px] lg:w-[440px] xl:w-[490px] max-w-[36vw] select-none will-change-transform drop-shadow-[0_15px_35px_rgba(0,0,0,0.16)]"
        >
          {/* Left Leaf: Layer 2 (First-time smooth entrance from bottom-left corner) */}
          <div ref={leftLeafEntranceRef} className="w-full h-auto will-change-transform">
            {/* Left Leaf: Layer 3 (Inner image for ambient breathing breeze) */}
            {/* Above the fold and part of the opening composition, so this one
                is fetched eagerly rather than lazily. */}
            <Image
              ref={leftLeafInnerRef}
              src="/Images/PNGS/HeroLeftLeaves.webp"
              alt=""
              aria-hidden="true"
              width={1536}
              height={1024}
              priority
              sizes="(max-width: 640px) 210px, (max-width: 1024px) 360px, 490px"
              className="w-full h-auto object-contain object-left-bottom select-none"
            />
          </div>
        </div>

        {/* Right Leaf: Layer 1 (Directly scrubbed by user scroll) */}
        <div
          ref={rightLeafScrollRef}
          className="absolute -bottom-4 sm:-bottom-6 lg:-bottom-8 -right-8 sm:-right-14 lg:-right-20 w-[210px] sm:w-[280px] md:w-[360px] lg:w-[440px] xl:w-[490px] max-w-[36vw] select-none will-change-transform drop-shadow-[0_15px_35px_rgba(0,0,0,0.16)]"
        >
          {/* Right Leaf: Layer 2 (First-time smooth entrance from bottom-right corner) */}
          <div ref={rightLeafEntranceRef} className="w-full h-auto will-change-transform">
            {/* Right Leaf: Layer 3 (Inner image for ambient breathing breeze) */}
            <Image
              ref={rightLeafInnerRef}
              src="/Images/PNGS/HeroRightLeaves.webp"
              alt=""
              aria-hidden="true"
              width={1536}
              height={1024}
              priority
              sizes="(max-width: 640px) 210px, (max-width: 1024px) 360px, 490px"
              className="w-full h-auto object-contain object-right-bottom select-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Pure Glassmorphic Feature Card:
 * - True luminous frosted glass (bg-white/25 backdrop-blur-xl border border-white/60)
 * - Uniform width (w-[245px]) for clean vertical alignment on right edge
 * - Subtle specular border highlights
 */
function GlassmorphicCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="group flex h-[58px] w-full sm:w-[245px] items-center gap-3.5 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-xl px-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] border border-white/60 border-t-white/80 hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)] hover:-translate-x-1 transition-all duration-300">
      <div className="grid size-9.5 shrink-0 place-items-center rounded-full bg-white/50 backdrop-blur-md border border-white/60 text-[#0d5a43] group-hover:scale-105 shadow-xs transition-transform duration-300">
        {icon}
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <span className="block text-[0.84rem] font-bold text-[#14251f] tracking-tight truncate drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
          {title}
        </span>
        <span className="block text-[0.72rem] text-[#2c3b34] font-semibold tracking-tight truncate mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
