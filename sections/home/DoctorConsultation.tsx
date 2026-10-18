"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  FileText,
  Phone,
  Play,
  ShieldCheck,
  Star,
  Stethoscope,
  Video,
} from "lucide-react";
import { formatRupees } from "@/lib/formatters/price";
import { Reveal } from "@/components/shared/Reveal";
import { SplitHeading } from "@/components/shared/SplitHeading";
import type { ApiDoctorCard, ApiNextSlot } from "@/types/api/care";

export type ConsultationData = {
  /** Verified doctors taking consultations (GET /api/care/doctors). */
  doctors: ApiDoctorCard[];
  /** The first doctor's next free slot, when there is one. */
  nextSlot: ApiNextSlot | null;
};

const initialsOf = (name: string) =>
  name
    .replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");

/** "Today, 5:30 pm", "Tomorrow, 10:00 am" or "Thu 17 Oct, 10:00 am", in India time. */
function slotLabel(startsAt: string): string {
  const zone = "Asia/Kolkata";
  const at = new Date(startsAt);
  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: zone }).format(d);
  const time = new Intl.DateTimeFormat("en-IN", { timeZone: zone, hour: "numeric", minute: "2-digit" }).format(at);
  const today = day(new Date());
  const tomorrow = day(new Date(Date.now() + 86_400_000));
  if (day(at) === today) return `Today, ${time}`;
  if (day(at) === tomorrow) return `Tomorrow, ${time}`;
  return `${new Intl.DateTimeFormat("en-IN", { timeZone: zone, weekday: "short", day: "numeric", month: "short" }).format(at)}, ${time}`;
}

/**
 * DoctorConsultation Section
 *
 * Implements the editorial layout matching the user's inspiration screenshot:
 * 1. Background Image: /Images/ConsultentBG.webp covering the section with the doctor
 *    at his marble desk on the left and the sunlit stone wall on the right.
 * 2. Left Scene Floating UI Components (True Frosted Glassmorphism):
 *    - Card A: Frosted glass doctor card at bottom-left: a real doctor from
 *      GET /api/care/doctors (name, qualification, rating only when rated,
 *      next free slot, fee), or an honest "opening soon" note when none is listed
 *    - Card B: Frosted glass bubble with the real number of verified doctors (hidden at zero)
 *    - Card C: Bottom modality pill (Video | Audio | Prescription), the modes the backend supports
 * 3. Right Editorial Column:
 *    - "ONLINE CONSULTATION" eyebrow with horizontal accent line
 *    - Display serif headline: "Expert Doctors. Personalised Care."
 *    - Description paragraph
 *    - 4 Capability items with circular frosted icon badges and hairline dividers
 *    - Action buttons: "[ Find a Doctor → ]" and "[ ▶ How It Works ]"
 */
export function DoctorConsultation({ doctors, nextSlot }: ConsultationData) {
  const featured = doctors[0] ?? null;
  const fees = featured ? [featured.videoFee, featured.audioFee].filter((fee): fee is number => fee !== null) : [];
  const fromFee = fees.length ? Math.min(...fees) : null;
  return (
    <section
      id="consultation-section"
      aria-labelledby="consultation-heading"
      className="relative min-h-[640px] lg:h-[720px] xl:h-[760px] max-h-[840px] text-ink overflow-hidden flex items-center py-10 lg:py-0"
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. SCENIC BACKGROUND IMAGE (ConsultentBG.webp)                     */}
      {/* ----------------------------------------------------------------- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <img
          src="/Images/ConsultentBG.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="size-full object-cover object-[24%_center] lg:object-center pointer-events-none select-none"
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
            
            {/* Component B: verified-doctor count bubble (real count; hidden when there are none) */}
            {doctors.length > 0 ? (
            <div className="self-end lg:absolute lg:top-12 xl:top-14 lg:right-3 xl:right-6 z-20">
              <div className="rounded-[22px] bg-white/25 hover:bg-white/30 backdrop-blur-2xl border border-white/60 p-3 sm:p-3.5 shadow-[0_14px_35px_rgba(15,35,25,0.07),inset_0_1px_1.5px_rgba(255,255,255,0.9)] transition-all hover:scale-105 duration-300">
                <div className="text-base sm:text-lg font-bold text-[#11231a] leading-tight">
                  {doctors.length}
                </div>
                <div className="text-[0.72rem] text-[#33463c] font-medium mb-2 leading-tight">
                  {doctors.length === 1 ? "Verified doctor" : "Verified doctors"}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {doctors.slice(0, 4).map((doctor) => (
                      <span
                        key={doctor.id}
                        className="relative size-7.5 rounded-full overflow-hidden border-2 border-white/90 shadow-2xs bg-[#e0eae4] grid place-items-center text-[0.6rem] font-bold text-[#0c503b]"
                      >
                        {doctor.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- doctor photos are admin uploads of any size
                          <img src={doctor.photoUrl} alt="" draggable={false} className="absolute inset-0 size-full object-cover pointer-events-none select-none" />
                        ) : (
                          initialsOf(doctor.displayName)
                        )}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/doctors"
                    aria-label="View all verified doctors"
                    className="size-6 rounded-full bg-white/40 hover:bg-[#0c503b] hover:text-white border border-white/70 backdrop-blur-md shadow-2xs grid place-items-center text-[#0c503b] transition-all"
                  >
                    <ArrowRight className="size-3 stroke-[2.2]" />
                  </Link>
                </div>
              </div>
            </div>
            ) : null}

            {/* Bottom Row: Doctor Card + Modality Pill (Sitting on the marble desk) */}
            <Reveal y={24} delay={0.1} className="relative z-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-auto lg:pb-6 xl:pb-8">
              
              {/* Component A: a real doctor (bottom-left), or an honest note while none is listed */}
              <div className="w-full sm:w-[310px] xl:w-[335px] shrink-0">
                <div className="rounded-[28px] bg-white/22 hover:bg-white/26 backdrop-blur-2xl border border-white/60 p-4.5 sm:p-5 shadow-[0_20px_45px_rgba(15,35,25,0.08),inset_0_1px_1.5px_rgba(255,255,255,0.9)] transition-all">
                  {featured ? (
                    <>
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="relative size-11 overflow-hidden rounded-full bg-white/40 backdrop-blur-md border border-white/80 shadow-xs text-[#0c503b] font-bold text-sm grid place-items-center shrink-0">
                            {featured.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element -- doctor photos are admin uploads of any size
                              <img src={featured.photoUrl} alt="" draggable={false} className="absolute inset-0 size-full object-cover pointer-events-none select-none" />
                            ) : (
                              initialsOf(featured.displayName)
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[0.98rem] font-bold text-[#11231a] leading-tight truncate">{featured.displayName}</h3>
                            {featured.qualification ? (
                              <p className="text-[0.73rem] text-[#3d5045] truncate mt-0.5">{featured.qualification}</p>
                            ) : null}
                            {featured.specialization ? (
                              <p className="text-[0.73rem] font-semibold text-[#0c503b] truncate">{featured.specialization}</p>
                            ) : null}
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 backdrop-blur-sm border border-emerald-500/25 px-2.5 py-0.5 text-[0.7rem] font-semibold text-emerald-950 shrink-0">
                          {featured.videoFee !== null ? <Video aria-hidden className="size-3" /> : <Phone aria-hidden className="size-3" />}
                          <span>{featured.videoFee !== null ? "Video" : "Audio"}</span>
                        </span>
                      </div>

                      {featured.ratingCount > 0 ? (
                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-black/[0.06]">
                          <Star aria-hidden className="size-3.5 fill-current text-[#e5a01d]" />
                          <span className="text-[0.78rem] font-semibold text-[#1e3228]">
                            {featured.ratingAverage.toFixed(1)} ({featured.ratingCount} {featured.ratingCount === 1 ? "rating" : "ratings"})
                          </span>
                        </div>
                      ) : null}

                      <div className="mt-2.5 pt-2 border-t border-black/[0.06] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[#3d5045]">
                          <CalendarClock className="size-3.5 text-[#0c503b]" />
                          <div>
                            <span className="block text-[0.68rem] text-[#55695f]">Next available</span>
                            <span className="font-semibold text-[#11231a]">{nextSlot ? slotLabel(nextSlot.startsAt) : "No open slots yet"}</span>
                          </div>
                        </div>

                        {fromFee !== null ? (
                          <div className="text-right">
                            <span className="block text-[0.68rem] text-[#55695f]">Consultation</span>
                            <span className="font-bold text-[#11231a] text-sm">
                              {fees.length > 1 ? "From " : ""}
                              {formatRupees(fromFee)}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <Link
                        href={doctors.length > 1 ? "/doctors" : `/doctors/${featured.slug}`}
                        className="mt-3.5 w-full rounded-full bg-[#0c503b] hover:bg-[#073627] py-2.5 text-xs sm:text-[0.82rem] font-semibold text-white shadow-[0_6px_20px_rgba(12,80,59,0.28)] transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span>{doctors.length > 1 ? `See all ${doctors.length} doctors` : "View doctor"}</span>
                        <ArrowRight className="size-3.5 stroke-[2]" />
                      </Link>
                    </>
                  ) : (
                    <div className="flex items-start gap-3">
                      <span className="size-11 rounded-full bg-white/40 backdrop-blur-md border border-white/80 shadow-xs text-[#0c503b] grid place-items-center shrink-0">
                        <Stethoscope aria-hidden className="size-5" strokeWidth={1.8} />
                      </span>
                      <div>
                        <h3 className="text-[0.98rem] font-bold text-[#11231a] leading-tight">Consultations are opening soon</h3>
                        <p className="mt-1 text-[0.78rem] leading-relaxed text-[#3d5045]">
                          Verified homoeopathic doctors will be listed here as they join DocHomoeo, with their fees and next free slot.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Component C: Consultation Modality Pill (Sitting directly under the laptop on the marble desk) */}
              <div className="hidden sm:inline-flex items-center gap-4 xl:gap-5 rounded-full bg-white/22 hover:bg-white/26 backdrop-blur-xl border border-white/60 px-5 py-2.5 shadow-[0_10px_30px_rgba(15,35,25,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.85)] text-[#14261e] mb-1 transition-all">
                <div className="flex items-center gap-1.5">
                  <Video className="size-3.5 text-[#0c503b]" />
                  <span className="text-xs font-semibold">Video</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-[#0c503b]" />
                  <span className="text-xs font-semibold">Audio</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="size-3.5 text-[#0c503b]" />
                  <span className="text-xs font-semibold">Prescription</span>
                </div>
              </div>

            </Reveal>

          </div>

          {/* ============================================================== */}
          {/* RIGHT EDITORIAL COLUMN (Cols 8-12: High Cohesion on Sunlit Wall)*/}
          {/* ============================================================== */}
          <div className="lg:col-span-5 w-full flex flex-col justify-center lg:pl-10 xl:pl-16 2xl:pl-20">
            
            {/* Eyebrow */}
            <Reveal y={12} delay={0}>
              <div className="text-[0.78rem] font-semibold tracking-[0.16em] text-forest uppercase">
                ONLINE CONSULTATION
              </div>
            </Reveal>

            {/* Display Headline */}
            <SplitHeading
              id="consultation-heading"
              lines={["Expert Doctors.", "Personalised Care."]}
              delay={0.06}
              className="mt-3 font-display text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.65rem] font-bold tracking-tight text-ink leading-[1.06]"
            />

            {/* Subtitle */}
            <Reveal y={16} delay={0.16}>
              <p className="mt-3.5 text-[0.94rem] sm:text-[0.98rem] text-[#2c4035] leading-relaxed max-w-lg font-normal">
                Consult experienced homeopathic doctors from the comfort of your home. Get personalised guidance for a healthier, happier tomorrow.
              </p>
            </Reveal>

            {/* 4 Feature Items with Circular Frosted Badges and Hairline Dividers */}
            <Reveal y={18} delay={0.22} stagger=":scope > *" className="mt-6 flex flex-col divide-y divide-black/[0.06] border-y border-black/[0.06] max-w-lg">
              
              {/* Item 1: the two modes the backend books (VIDEO, AUDIO) */}
              <div className="flex items-center gap-3.5 sm:gap-4 py-2.5 sm:py-3">
                <span className="size-9.5 sm:size-10 rounded-full bg-white/45 backdrop-blur-md border border-white/70 shadow-2xs grid place-items-center text-forest shrink-0">
                  <Video className="size-4 stroke-[1.8]" />
                </span>
                <span className="text-[0.9rem] sm:text-[0.95rem] font-medium text-ink">
                  Video or audio consultations
                </span>
              </div>

              {/* Item 2: Digital prescriptions */}
              <div className="flex items-center gap-3.5 sm:gap-4 py-2.5 sm:py-3">
                <span className="size-9.5 sm:size-10 rounded-full bg-white/45 backdrop-blur-md border border-white/70 shadow-2xs grid place-items-center text-forest shrink-0">
                  <FileText className="size-4 stroke-[1.8]" />
                </span>
                <span className="text-[0.9rem] sm:text-[0.95rem] font-medium text-ink">
                  Digital prescriptions
                </span>
              </div>

              {/* Item 3: Follow-up and long-term care */}
              <div className="flex items-center gap-3.5 sm:gap-4 py-2.5 sm:py-3">
                <span className="size-9.5 sm:size-10 rounded-full bg-white/45 backdrop-blur-md border border-white/70 shadow-2xs grid place-items-center text-forest shrink-0">
                  <CalendarDays className="size-4 stroke-[1.8]" />
                </span>
                <span className="text-[0.9rem] sm:text-[0.95rem] font-medium text-ink">
                  Follow-up and long-term care
                </span>
              </div>

              {/* Item 4: Verified and experienced doctors */}
              <div className="flex items-center gap-3.5 sm:gap-4 py-2.5 sm:py-3">
                <span className="size-9.5 sm:size-10 rounded-full bg-white/45 backdrop-blur-md border border-white/70 shadow-2xs grid place-items-center text-forest shrink-0">
                  <ShieldCheck className="size-4 stroke-[1.8]" />
                </span>
                <span className="text-[0.9rem] sm:text-[0.95rem] font-medium text-ink">
                  Doctors verified before they can consult
                </span>
              </div>

            </Reveal>

            {/* Action Buttons */}
            <Reveal y={16} delay={0.28}>
              <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-5">
                <Link
                  href="/doctors"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-forest px-7 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_6px_22px_rgba(12,80,59,0.3)] transition-all duration-300 hover:bg-forest-deep hover:shadow-[0_10px_30px_rgba(12,80,59,0.42)] active:scale-95"
                >
                  <span>Find a Doctor</span>
                  <ArrowRight className="size-4 stroke-[2]" />
                </Link>

                <Link
                  href="#how-it-works"
                  className="group inline-flex items-center gap-3 text-sm sm:text-base font-semibold text-ink hover:text-forest transition-colors"
                >
                  <span className="size-8 rounded-full bg-forest text-white grid place-items-center shadow-xs group-hover:scale-105 group-hover:bg-forest-deep transition-all">
                    <Play className="size-3.5 fill-current ml-0.5" />
                  </span>
                  <span>How It Works</span>
                </Link>
              </div>
            </Reveal>

          </div>

        </div>
      </div>
    </section>
  );
}
