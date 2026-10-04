"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  FileText,
  MessageSquare,
  Play,
  ShieldCheck,
  Star,
  Video,
} from "lucide-react";
import { featuredDoctor } from "@/data/mock/home";
import { formatPrice } from "@/lib/formatters/price";
import { useSectionTimeline } from "@/lib/animation/sectionTimeline";

/**
 * DoctorConsultation Section
 *
 * Implements the editorial layout matching the user's inspiration screenshot:
 * 1. Background Image: /Images/ConsultentBG.webp covering the section with the doctor
 *    at his marble desk on the left and the sunlit stone wall on the right.
 * 2. Left Scene Floating UI Components (True Frosted Glassmorphism):
 *    - Card A: Frosted glass doctor booking card at bottom-left (Dr. A. Demo, ratings, availability, price, CTA)
 *    - Card B: Frosted glass "50+ Certified doctors" bubble floating between the doctor and arch
 *    - Card C: Bottom modality pill (Video | Chat | Prescription) positioned under the laptop
 * 3. Right Editorial Column:
 *    - "ONLINE CONSULTATION" eyebrow with horizontal accent line
 *    - Display serif headline: "Expert Doctors. Personalised Care."
 *    - Description paragraph
 *    - 4 Capability items with circular frosted icon badges and hairline dividers
 *    - Action buttons: "[ Find a Doctor → ]" and "[ ▶ How It Works ]"
 */
export function DoctorConsultation() {
  // Media leads here: the scene is uncovered, then the editorial column reads
  // in over it. Deliberately the reverse of BestsellingProducts next door.
  const sectionRef = useSectionTimeline<HTMLElement>([
    { sel: "[data-r-media]", variant: "backdrop", at: 0 },
    { sel: "[data-r-float]", variant: "rise", at: 0.45 },
    { sel: "[data-r-eyebrow]", variant: "rise", at: 0.3 },
    { sel: "[data-r-head]", variant: "rise", at: 0.42 },
    { sel: "[data-r-copy]", variant: "rise", at: 0.56 },
    { sel: "[data-r-item]", variant: "rise", at: 0.68 },
  ]);

  return (
    <section
      ref={sectionRef}
      id="consultation-section"
      aria-labelledby="consultation-heading"
      className="relative min-h-[640px] lg:h-[720px] xl:h-[760px] max-h-[840px] text-ink overflow-hidden flex items-center py-10 lg:py-0"
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. SCENIC BACKGROUND IMAGE (ConsultentBG.png)                     */}
      {/* ----------------------------------------------------------------- */}
      <div
        data-r-media
        data-reveal
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none will-change-transform"
      >
        <img
          src="/Images/ConsultentBG.webp"
          alt=""
          aria-hidden="true"
          className="size-full object-cover object-[24%_center] lg:object-center"
        />

        {/* Soft atmospheric gradient for small screen text readability */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/60 to-transparent lg:hidden pointer-events-none"
        />

        {/* Seamless atmospheric top blend connecting from Bestselling section */}
        <div aria-hidden="true" className="dh-section-blend-top" />

        {/* Seamless atmospheric bottom blend connecting to Consultation Journey */}
        <div aria-hidden="true" className="dh-section-blend-bottom" />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. SECTION CONTENT CONTAINER                                      */}
      {/* ----------------------------------------------------------------- */}
      <div className="mx-auto w-full max-w-[1660px] px-4 sm:px-6 lg:px-10 xl:px-12 h-full relative z-10 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center w-full gap-8 lg:gap-0 h-full">
          
          {/* ============================================================== */}
          {/* LEFT SCENE (Cols 1-7: Doctor desk, arch window, floating glass)*/}
          {/* ============================================================== */}
          <div className="lg:col-span-7 relative min-h-[460px] sm:min-h-[520px] lg:h-[640px] xl:h-[680px] w-full flex flex-col justify-between">
            
            {/* Component B: "50+ Certified Doctors" Floating Glass Bubble */}
            {/* Positioned more towards the right direction near the arch window */}
            <div data-r-float data-reveal className="self-end lg:absolute lg:top-12 xl:top-14 lg:right-3 xl:right-6 z-20">
              <div className="rounded-[22px] bg-white/25 hover:bg-white/30 backdrop-blur-2xl border border-white/60 p-3 sm:p-3.5 shadow-[0_14px_35px_rgba(15,35,25,0.07),inset_0_1px_1.5px_rgba(255,255,255,0.9)] transition-all hover:scale-105 duration-300">
                <div className="text-base sm:text-lg font-bold text-[#11231a] leading-tight">
                  50+
                </div>
                <div className="text-[0.72rem] text-[#33463c] font-medium mb-2 leading-tight">
                  Certified doctors
                </div>
                
                {/* 4 Overlapping Doctor Avatars + Circular Arrow */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {/* Doctor 1 */}
                    <span className="size-7.5 rounded-full overflow-hidden border-2 border-white/90 shadow-2xs bg-[#e0eae4] grid place-items-center">
                      <svg viewBox="0 0 36 36" fill="none" className="size-full">
                        <circle cx="18" cy="18" r="18" fill="#e2ede7" />
                        <circle cx="18" cy="14" r="6" fill="#c49a75" />
                        <path d="M12 11c0-4 12-4 12 0v3H12v-3z" fill="#362214" />
                        <path d="M6 34c0-7 6-11 12-11s12 4 12 11H6z" fill="#ffffff" />
                        <path d="M14 23v6h8v-6" stroke="#0c503b" strokeWidth="1.5" />
                      </svg>
                    </span>

                    {/* Doctor 2 */}
                    <span className="size-7.5 rounded-full overflow-hidden border-2 border-white/90 shadow-2xs bg-[#e2eaf4] grid place-items-center">
                      <svg viewBox="0 0 36 36" fill="none" className="size-full">
                        <circle cx="18" cy="18" r="18" fill="#e5eef7" />
                        <circle cx="18" cy="14" r="6" fill="#d2a884" />
                        <path d="M12 12c1-4 11-4 12 0 0 1-1 3-3 3h-6c-2 0-3-2-3-3z" fill="#1c2730" />
                        <rect x="14" y="13" width="8" height="3" rx="1" stroke="#1c2730" strokeWidth="1" fill="none" />
                        <path d="M6 34c0-7 6-11 12-11s12 4 12 11H6z" fill="#ffffff" />
                        <path d="M17 23l1 6 1-6" stroke="#1c4573" strokeWidth="1.5" />
                      </svg>
                    </span>

                    {/* Doctor 3 */}
                    <span className="size-7.5 rounded-full overflow-hidden border-2 border-white/90 shadow-2xs bg-[#f6eee2] grid place-items-center">
                      <svg viewBox="0 0 36 36" fill="none" className="size-full">
                        <circle cx="18" cy="18" r="18" fill="#f7efe4" />
                        <circle cx="18" cy="14" r="6" fill="#b98864" />
                        <path d="M11 10c2-5 12-5 14 0 1 4-2 7-3 7h-8c-1 0-4-3-3-7z" fill="#2d1d13" />
                        <path d="M6 34c0-7 6-11 12-11s12 4 12 11H6z" fill="#ffffff" />
                        <circle cx="18" cy="27" r="2.5" fill="#0c503b" />
                      </svg>
                    </span>

                    {/* Doctor 4 */}
                    <span className="size-7.5 rounded-full overflow-hidden border-2 border-white/90 shadow-2xs bg-[#ede5f2] grid place-items-center">
                      <svg viewBox="0 0 36 36" fill="none" className="size-full">
                        <circle cx="18" cy="18" r="18" fill="#eee7f4" />
                        <circle cx="18" cy="14" r="6" fill="#cca07e" />
                        <path d="M12 12c1-3 11-3 12 0v2H12v-2z" fill="#717a84" />
                        <path d="M6 34c0-7 6-11 12-11s12 4 12 11H6z" fill="#ffffff" />
                        <path d="M15 24v5h6v-5" stroke="#522b6d" strokeWidth="1.5" />
                      </svg>
                    </span>
                  </div>

                  <Link
                    href="/doctors"
                    aria-label="View all certified doctors"
                    className="size-6 rounded-full bg-white/40 hover:bg-[#0c503b] hover:text-white border border-white/70 backdrop-blur-md shadow-2xs grid place-items-center text-[#0c503b] transition-all"
                  >
                    <ArrowRight className="size-3 stroke-[2.2]" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Row: Doctor Card + Modality Pill (Sitting on the marble desk) */}
            <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-auto lg:pb-6 xl:pb-8">
              
              {/* Component A: Doctor Profile Booking Card (Bottom-Left) */}
              <div className="w-full sm:w-[310px] xl:w-[335px] shrink-0">
                <div className="rounded-[28px] bg-white/22 hover:bg-white/26 backdrop-blur-2xl border border-white/60 p-4.5 sm:p-5 shadow-[0_20px_45px_rgba(15,35,25,0.08),inset_0_1px_1.5px_rgba(255,255,255,0.9)] transition-all">
                  
                  {/* Doctor Avatar + Info + Online Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="size-11 rounded-full bg-white/40 backdrop-blur-md border border-white/80 shadow-xs text-[#0c503b] font-bold text-sm grid place-items-center shrink-0">
                        {featuredDoctor.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[0.98rem] font-bold text-[#11231a] leading-tight truncate">
                          {featuredDoctor.name}
                        </h3>
                        <p className="text-[0.73rem] text-[#3d5045] truncate mt-0.5">
                          {featuredDoctor.qualifications}
                        </p>
                        <p className="text-[0.73rem] font-semibold text-[#0c503b] truncate">
                          {featuredDoctor.specialty}
                        </p>
                      </div>
                    </div>

                    {/* Online Badge */}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 backdrop-blur-sm border border-emerald-500/25 px-2.5 py-0.5 text-[0.7rem] font-semibold text-emerald-950 shrink-0">
                      <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>Online</span>
                    </span>
                  </div>

                  {/* Rating Row */}
                  {featuredDoctor.rating ? (
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-black/[0.06]">
                      <div className="flex items-center text-[#e5a01d]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="size-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[0.78rem] font-semibold text-[#1e3228]">
                        {featuredDoctor.rating.value} ({featuredDoctor.rating.count})
                      </span>
                    </div>
                  ) : null}

                  {/* Next Available & Fee */}
                  <div className="mt-2.5 pt-2 border-t border-black/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#3d5045]">
                      <CalendarClock className="size-3.5 text-[#0c503b]" />
                      <div>
                        <span className="block text-[0.68rem] text-[#55695f]">Next available</span>
                        <span className="font-semibold text-[#11231a]">
                          {featuredDoctor.nextAvailable}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-[0.68rem] text-[#55695f]">Consultation</span>
                      <span className="font-bold text-[#11231a] text-sm">
                        {formatPrice(featuredDoctor.consultationFee)}
                      </span>
                    </div>
                  </div>

                  {/* Book Consultation CTA Button */}
                  <Link
                    href={`/book/${featuredDoctor.id}`}
                    className="mt-3.5 w-full rounded-full bg-[#0c503b] hover:bg-[#073627] py-2.5 text-xs sm:text-[0.82rem] font-semibold text-white shadow-[0_6px_20px_rgba(12,80,59,0.28)] transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Book consultation</span>
                    <ArrowRight className="size-3.5 stroke-[2]" />
                  </Link>

                </div>
              </div>

              {/* Component C: Consultation Modality Pill (Sitting directly under the laptop on the marble desk) */}
              <div className="hidden sm:inline-flex items-center gap-4 xl:gap-5 rounded-full bg-white/22 hover:bg-white/26 backdrop-blur-xl border border-white/60 px-5 py-2.5 shadow-[0_10px_30px_rgba(15,35,25,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.85)] text-[#14261e] mb-1 transition-all">
                <div className="flex items-center gap-1.5">
                  <Video className="size-3.5 text-[#0c503b]" />
                  <span className="text-xs font-semibold">Video</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-[#0c503b]" />
                  <span className="text-xs font-semibold">Chat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="size-3.5 text-[#0c503b]" />
                  <span className="text-xs font-semibold">Prescription</span>
                </div>
              </div>

            </div>

          </div>

          {/* ============================================================== */}
          {/* RIGHT EDITORIAL COLUMN (Cols 8-12: High Cohesion on Sunlit Wall)*/}
          {/* ============================================================== */}
          <div className="lg:col-span-5 w-full flex flex-col justify-center lg:pl-10 xl:pl-16 2xl:pl-20">
            
            {/* Eyebrow - Clean typography without generic AI dash lines */}
            <div data-r-eyebrow data-reveal className="text-[0.78rem] font-semibold tracking-[0.16em] text-forest uppercase">
              ONLINE CONSULTATION
            </div>

            {/* Display Headline */}
            <h2
              data-r-head
              data-reveal
              id="consultation-heading"
              className="mt-3 font-display text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.65rem] font-bold tracking-tight text-ink leading-[1.06]"
            >
              Expert Doctors.<br />Personalised Care.
            </h2>

            {/* Subtitle */}
            <p
              data-r-copy
              data-reveal
              className="mt-3.5 text-[0.94rem] sm:text-[0.98rem] text-[#2c4035] leading-relaxed max-w-lg font-normal"
            >
              Consult experienced homeopathic doctors from the comfort of your home. Get personalised guidance for a healthier, happier tomorrow.
            </p>

            {/* 4 Feature Items with Circular Frosted Badges and Hairline Dividers */}
            <div className="mt-6 flex flex-col divide-y divide-black/[0.06] border-y border-black/[0.06] max-w-lg">
              
              {/* Item 1: Video, audio or chat consultations */}
              <div data-r-item data-reveal className="flex items-center gap-3.5 sm:gap-4 py-2.5 sm:py-3">
                <span className="size-9.5 sm:size-10 rounded-full bg-white/45 backdrop-blur-md border border-white/70 shadow-2xs grid place-items-center text-forest shrink-0">
                  <Video className="size-4 stroke-[1.8]" />
                </span>
                <span className="text-[0.9rem] sm:text-[0.95rem] font-medium text-ink">
                  Video, audio or chat consultations
                </span>
              </div>

              {/* Item 2: Digital prescriptions */}
              <div data-r-item data-reveal className="flex items-center gap-3.5 sm:gap-4 py-2.5 sm:py-3">
                <span className="size-9.5 sm:size-10 rounded-full bg-white/45 backdrop-blur-md border border-white/70 shadow-2xs grid place-items-center text-forest shrink-0">
                  <FileText className="size-4 stroke-[1.8]" />
                </span>
                <span className="text-[0.9rem] sm:text-[0.95rem] font-medium text-ink">
                  Digital prescriptions
                </span>
              </div>

              {/* Item 3: Follow-up and long-term care */}
              <div data-r-item data-reveal className="flex items-center gap-3.5 sm:gap-4 py-2.5 sm:py-3">
                <span className="size-9.5 sm:size-10 rounded-full bg-white/45 backdrop-blur-md border border-white/70 shadow-2xs grid place-items-center text-forest shrink-0">
                  <CalendarDays className="size-4 stroke-[1.8]" />
                </span>
                <span className="text-[0.9rem] sm:text-[0.95rem] font-medium text-ink">
                  Follow-up and long-term care
                </span>
              </div>

              {/* Item 4: Verified and experienced doctors */}
              <div data-r-item data-reveal className="flex items-center gap-3.5 sm:gap-4 py-2.5 sm:py-3">
                <span className="size-9.5 sm:size-10 rounded-full bg-white/45 backdrop-blur-md border border-white/70 shadow-2xs grid place-items-center text-forest shrink-0">
                  <ShieldCheck className="size-4 stroke-[1.8]" />
                </span>
                <span className="text-[0.9rem] sm:text-[0.95rem] font-medium text-ink">
                  Verified and experienced doctors
                </span>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-5">
              <Link
                href="/doctors"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-forest px-7 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_6px_22px_rgba(12,80,59,0.3)] transition-all duration-300 hover:bg-forest-deep hover:shadow-[0_10px_30px_rgba(12,80,59,0.42)] active:scale-95"
              >
                <span>Find a Doctor</span>
                <ArrowRight className="size-4 stroke-[2]" />
              </Link>

              <Link
                href="/about#how-it-works"
                className="group inline-flex items-center gap-3 text-sm sm:text-base font-semibold text-ink hover:text-forest transition-colors"
              >
                <span className="size-8 rounded-full bg-forest text-white grid place-items-center shadow-xs group-hover:scale-105 group-hover:bg-forest-deep transition-all">
                  <Play className="size-3.5 fill-current ml-0.5" />
                </span>
                <span>How It Works</span>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
