"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
} from "lucide-react";
import { formatRupees } from "@/lib/formatters/price";
import { istWhen } from "@/lib/care/consultation";
import { cn } from "@/lib/utils";
import type { ApiDoctorCard, ApiNextSlot } from "@/types/api/care";

export function DoctorCard({
  doctor,
  nextSlot,
}: {
  doctor: ApiDoctorCard;
  nextSlot: ApiNextSlot | null;
}) {
  const router = useRouter();

  const fees = [doctor.videoFee, doctor.audioFee].filter((f): f is number => f !== null);
  const minFee = fees.length ? Math.min(...fees) : 400;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    router.push(`/doctors/${doctor.slug}`);
  };

  const nextSlotLabel = nextSlot ? istWhen(nextSlot.startsAt) : "Tomorrow, 10:30 am";

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        "group relative flex h-full flex-col justify-between rounded-[32px] p-4 sm:p-5",
        "bg-white dark:bg-[#0c1e17] border border-black/[0.06] dark:border-white/10",
        "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]",
        "hover:shadow-[0_24px_48px_-12px_rgba(13,90,67,0.15)] hover:-translate-y-1.5",
        "transition-all duration-300 ease-out cursor-pointer overflow-hidden"
      )}
    >
      <div>
        {/* ============================================================== */}
        {/* 1. TOP PORTRAIT CONTAINER (Inspired by Dr. Maya Chen Reference) */}
        {/* ============================================================== */}
        <div className="relative w-full aspect-[4/4.7] rounded-[24px] overflow-hidden bg-[#f3f1e8] dark:bg-white/5">
          {doctor.photoUrl ? (
            <Image
              src={doctor.photoUrl}
              alt={doctor.displayName}
              fill
              quality={95}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-104 select-none pointer-events-none"
            />
          ) : (
            <div className="size-full bg-[#0d5a43]/10 grid place-items-center text-[#0d5a43] font-bold text-4xl">
              {doctor.displayName.charAt(0)}
            </div>
          )}

          {/* Frosted "Care team member" Pill (Top Right, matching Reference Image) */}
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 rounded-full bg-white/85 dark:bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Care team member</span>
          </div>

          {/* Rating Pill (Top Left) */}
          {doctor.ratingAverage ? (
            <div className="absolute top-3.5 left-3.5 flex items-center gap-1 rounded-full bg-white/85 dark:bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs">
              <Star className="size-3 fill-amber-500 text-amber-500" />
              <span>{doctor.ratingAverage.toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        {/* ============================================================== */}
        {/* 2. DOCTOR IDENTITY & 2-LINE BIO / SUMMARY                     */}
        {/* ============================================================== */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display text-xl font-bold tracking-tight text-neutral-900 dark:text-white group-hover:text-[#0d5a43] transition-colors truncate">
              {doctor.displayName}
            </h3>
            <span title="Verified Council Practitioner" className="inline-flex shrink-0">
              <CheckCircle2 className="size-4.5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950/40" />
            </span>
          </div>

          <p className="text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2 font-normal">
            {doctor.bio || `${doctor.specialization || "Classical Homoeopathy"}. ${doctor.qualification || ""}`}
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. METRICS ROW & FULL-WIDTH PILL BUTTON                        */}
      {/* ============================================================== */}
      <div className="mt-5 space-y-3 pt-3 border-t border-neutral-100 dark:border-white/5">
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f9f4] dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium px-2.5 py-0.5 text-[11px]">
            <CalendarDays className="size-3 text-emerald-600" />
            <span>Next: {nextSlotLabel}</span>
          </span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs tabular-nums">
            {formatRupees(minFee)} <span className="text-[10px] text-neutral-400 font-normal">/ 20m</span>
          </span>
        </div>

        {/* Full-width Black Pill Button (Directly inspired by Reference Image) */}
        <Link
          href={`/doctors/${doctor.slug}#booking-section`}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-11 rounded-full bg-[#171a1d] hover:bg-[#0d5a43] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-xs cursor-pointer group/btn"
        >
          <span>Book a visit</span>
          <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
