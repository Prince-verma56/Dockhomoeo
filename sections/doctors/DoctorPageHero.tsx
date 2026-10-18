"use client";

import Image from "next/image";
import {
  CalendarDays,
  Clock,
  Globe,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { formatRupees } from "@/lib/formatters/price";
import type { ApiDoctorDetail } from "@/types/api/care";

interface DoctorPageHeroProps {
  doctor: ApiDoctorDetail;
  onBookConsult: () => void;
}

export function DoctorPageHero({ doctor, onBookConsult }: DoctorPageHeroProps) {
  const fees = [doctor.videoFee, doctor.audioFee].filter((f): f is number => f !== null);
  const minFee = fees.length ? Math.min(...fees) : 400;

  return (
    <section className="relative pt-24 sm:pt-28 pb-10 sm:pb-14 bg-[#fbfaf6] dark:bg-[#07130e] border-b border-black/[0.06] dark:border-white/10 overflow-hidden">
      {/* ------------------------------------------------------------- */}
      {/* 1. SCENIC TOP ATMOSPHERIC HEADER BANNER                       */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute inset-x-0 top-0 h-64 sm:h-72 overflow-hidden pointer-events-none select-none z-0">
        <img
          src="/Images/ConsultentBG.webp"
          alt=""
          aria-hidden="true"
          className="size-full object-cover object-[30%_center] opacity-40 dark:opacity-15"
        />
        {/* Soft top navbar contrast gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#fbfaf6] dark:from-[#07130e] via-[#fbfaf6]/90 dark:via-[#07130e]/90 to-transparent"
        />
        {/* Gentle bottom fade into body */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fbfaf6] dark:from-[#07130e] to-transparent"
        />
      </div>

      <Container width="wide" className="relative z-10">
        <PageBreadcrumb
          items={[
            { name: "Doctors", href: "/doctors" },
            { name: doctor.displayName, href: `/doctors/${doctor.slug}` },
          ]}
          className="mb-6 sm:mb-8"
        />

        {/* ------------------------------------------------------------- */}
        {/* 2. EDITORIAL DOCTOR PROFILE INTRO                             */}
        {/* ------------------------------------------------------------- */}
        <div className="rounded-[32px] sm:rounded-[36px] border border-white/80 dark:border-white/15 bg-white/90 dark:bg-[#0c1e17]/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(13,90,67,0.07),0_2px_8px_rgba(0,0,0,0.03)] p-6 sm:p-8 lg:p-10 transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
            
            {/* Left Column: Doctor Portrait + Clinical Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 flex-1">
              {/* Doctor Portrait */}
              <div className="relative size-36 sm:size-44 lg:size-48 shrink-0 rounded-3xl overflow-hidden border-2 border-white dark:border-white/20 shadow-lg bg-forest/10 ring-2 ring-[#0d5a43]/15">
                {doctor.photoUrl ? (
                  <Image
                    src={doctor.photoUrl}
                    alt={doctor.displayName}
                    fill
                    sizes="192px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="size-full grid place-items-center bg-forest/15 text-forest font-bold text-4xl">
                    {doctor.displayName.charAt(0)}
                  </div>
                )}

                {/* Live Availability Badge */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-[#0c1e17]/95 px-3 py-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 shadow-xs whitespace-nowrap">
                  <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Available Today</span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-2.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 border border-forest/15 px-3 py-0.5 text-xs font-semibold text-forest dark:text-emerald-400">
                    <ShieldCheck className="size-3.5" />
                    Verified Practitioner
                  </span>
                  {doctor.experienceYears !== null ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/10 px-3 py-0.5 text-xs font-medium text-ink dark:text-white/80">
                      <Clock className="size-3 text-muted-ink" />
                      {doctor.experienceYears}+ Years Clinical Practice
                    </span>
                  ) : null}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-[#14251f] dark:text-white tracking-tight leading-[1.12]">
                  {doctor.displayName}
                </h1>

                <p className="text-sm sm:text-base text-muted-ink dark:text-white/70 font-medium">
                  {[doctor.qualification, doctor.specialization].filter(Boolean).join(" · ") ||
                    "Senior Homoeopathic Practitioner"}
                </p>

                {/* Badges Row: Ratings, Location, Languages */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-ink/80 dark:text-white/80">
                  {doctor.ratingCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-950 dark:text-amber-300">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      <span>{doctor.ratingAverage.toFixed(1)}</span>
                      <span className="text-[11px] text-amber-800/80 dark:text-amber-400 font-normal">
                        ({doctor.ratingCount} verified reviews)
                      </span>
                    </span>
                  ) : null}

                  {doctor.clinicCity ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-paper/80 dark:bg-white/5 border border-line-soft px-3 py-1.5 font-medium">
                      <MapPin className="size-3.5 text-forest dark:text-emerald-400" />
                      <span>{doctor.clinicCity}</span>
                    </span>
                  ) : null}

                  {doctor.languages.length ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-paper/80 dark:bg-white/5 border border-line-soft px-3 py-1.5 font-medium">
                      <Globe className="size-3.5 text-forest dark:text-emerald-400" />
                      <span>{doctor.languages.join(", ")}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right Column: Quick Booking Callout */}
            <div className="lg:border-l lg:border-line-soft/80 lg:pl-10 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-5 shrink-0">
              <div className="lg:text-right space-y-1">
                <span className="text-[11px] font-bold text-muted-ink uppercase tracking-wider">
                  Consultation Fee
                </span>
                <div className="flex items-baseline gap-1.5 justify-start lg:justify-end">
                  <span className="text-xs text-muted-ink">from</span>
                  <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#0d5a43] dark:text-emerald-400 tabular-nums">
                    {formatRupees(minFee)}
                  </span>
                  <span className="text-xs text-muted-ink">/ session</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-ink justify-start lg:justify-end pt-0.5">
                  <Clock className="size-3.5 text-forest dark:text-emerald-400" />
                  <span>{doctor.slotMinutes} mins private session</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onBookConsult}
                className="w-full sm:w-auto lg:w-52 h-12 px-6 rounded-full bg-[#0d5a43] hover:bg-[#074231] active:scale-[0.98] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <CalendarDays className="size-4" />
                <span>Book Appointment</span>
              </button>
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}
