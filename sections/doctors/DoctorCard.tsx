"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  Clock,
  Languages,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Video,
} from "lucide-react";
import { DoctorAvatar } from "@/components/doctors/DoctorAvatar";
import { formatRupees } from "@/lib/formatters/price";
import { istWhen } from "@/lib/care/consultation";
import { cn } from "@/lib/utils";
import type { ApiDoctorCard, ApiNextSlot } from "@/types/api/care";

/**
 * Minimalist, Luxury Glassmorphic Doctor Profile Card:
 * - Frosted glassmorphism container with subtle ambient botanical lighting
 * - Fully clickable and workable interactive actions (Doctor name, avatar, card body, and "Book Consult" CTA)
 * - Explicit cursor-pointer across all interactive surfaces
 * - Clean, uncluttered layout with breathing room and crisp hierarchy
 * - Refined metadata pills (Location, Languages, Duration, Video/Audio modes)
 * - Modern live slot indicator with radar pulse badge
 * - Purposeful bottom pricing and prominent, workable "Book Consult" button
 */
export function DoctorCard({
  doctor,
  nextSlot,
}: {
  doctor: ApiDoctorCard;
  nextSlot: ApiNextSlot | null;
}) {
  const router = useRouter();

  const credentials = [
    doctor.qualification,
    doctor.experienceYears !== null
      ? `${doctor.experienceYears} yrs exp`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const fees = [doctor.videoFee, doctor.audioFee].filter((f): f is number => f !== null);
  const minFee = fees.length ? Math.min(...fees) : 500;

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked directly on an interactive anchor or button, let native navigation handle it
    const target = e.target as HTMLElement;
    if (target.closest("a, button")) return;
    router.push(`/doctors/${doctor.slug}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        "group relative flex h-full flex-col justify-between rounded-[28px] p-5 sm:p-6",
        "bg-white/80 dark:bg-[#0c1e17]/85 backdrop-blur-xl border border-white/90 dark:border-white/10",
        "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)]",
        "hover:shadow-[0_20px_45px_-8px_rgba(12,80,59,0.12),0_4px_12px_rgba(0,0,0,0.03)]",
        "hover:-translate-y-1.5 hover:border-forest/35 transition-all duration-300 ease-out cursor-pointer",
        "overflow-hidden focus-within:ring-2 focus-within:ring-forest/30"
      )}
    >
      {/* Soft botanical ambient glow in top-right corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-gradient-to-br from-forest/10 via-emerald-500/8 to-transparent blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:from-forest/18"
      />

      <div className="relative z-10 space-y-4">
        {/* Top Header: Avatar, Rating & Doctor Identity */}
        <div className="flex items-start gap-4">
          <Link
            href={`/doctors/${doctor.slug}`}
            className="relative shrink-0 block cursor-pointer group/avatar"
            aria-label={`View profile of ${doctor.displayName}`}
          >
            <DoctorAvatar
              photoUrl={doctor.photoUrl}
              className="size-16 sm:size-17.5 rounded-2xl ring-2 ring-forest/15 group-hover/avatar:ring-forest/35 transition-all object-cover shadow-xs"
            />
            <span
              title="Verified by DocHomoeo"
              className="absolute -bottom-1 -right-1 grid size-5.5 place-items-center rounded-full bg-forest text-cream shadow-xs ring-2 ring-white dark:ring-[#0c1e17]"
            >
              <ShieldCheck className="size-3.5" strokeWidth={2.4} />
            </span>
          </Link>

          <div className="min-w-0 flex-1">
            {/* Top row: Specialization Tag + Rating Pill */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-forest uppercase tracking-wider bg-forest/8 px-2.5 py-0.5 rounded-full border border-forest/15 truncate max-w-[200px]">
                {doctor.specialization ?? "General Homeopathy"}
              </span>

              {doctor.ratingCount > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-500/20 shrink-0">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  <span>{doctor.ratingAverage.toFixed(1)}</span>
                  <span className="text-amber-800/60 font-medium text-[10px]">
                    ({doctor.ratingCount})
                  </span>
                </span>
              ) : null}
            </div>

            {/* Doctor Name */}
            <h3 className="mt-1.5 font-display text-lg sm:text-[1.22rem] font-bold leading-snug text-ink transition-colors group-hover:text-forest">
              <Link
                href={`/doctors/${doctor.slug}`}
                className="focus-visible:outline-none hover:underline decoration-forest/30 underline-offset-4 cursor-pointer"
              >
                {doctor.displayName}
              </Link>
            </h3>

            {/* Qualifications & Experience */}
            {credentials ? (
              <p className="mt-0.5 text-xs text-muted-ink font-medium leading-relaxed line-clamp-1">
                {credentials}
              </p>
            ) : null}
          </div>
        </div>

        {/* Minimalist Details Badges: Languages, City, Duration & Mode */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line-soft/60">
          {doctor.clinicCity ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-paper/80 border border-line-soft/80 px-2.5 py-1 text-[11px] font-medium text-ink/80">
              <MapPin className="size-3 text-forest shrink-0" />
              <span>{doctor.clinicCity}</span>
            </span>
          ) : null}

          {doctor.languages.length ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-paper/80 border border-line-soft/80 px-2.5 py-1 text-[11px] font-medium text-ink/80">
              <Languages className="size-3 text-forest shrink-0" />
              <span className="truncate max-w-[130px]">
                {doctor.languages.slice(0, 2).join(", ")}
                {doctor.languages.length > 2 ? ` +${doctor.languages.length - 2}` : ""}
              </span>
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-paper/80 border border-line-soft/80 px-2.5 py-1 text-[11px] font-medium text-ink/80">
            <Clock className="size-3 text-forest shrink-0" />
            <span>{doctor.slotMinutes} mins</span>
          </span>

          {doctor.videoFee !== null ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/8 border border-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-800">
              <Video className="size-3 text-emerald-600" />
              <span>Video</span>
            </span>
          ) : null}

          {doctor.audioFee !== null ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/8 border border-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-800">
              <Phone className="size-3 text-emerald-600" />
              <span>Audio</span>
            </span>
          ) : null}
        </div>

        {/* Live Slot Status Ribbon (Translucent Frosted Banner) */}
        <div className="rounded-2xl border border-forest/15 bg-gradient-to-r from-forest/[0.04] to-emerald-500/[0.02] p-3 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2 text-xs backdrop-blur-xs transition-colors group-hover:bg-forest/[0.07] group-hover:border-forest/25">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarClock className="size-3.5 text-forest shrink-0" />
            {nextSlot ? (
              <span className="font-medium text-ink truncate text-[11.5px] sm:text-xs">
                Next slot: <strong className="text-forest-deep font-semibold">{istWhen(nextSlot.startsAt)}</strong>
              </span>
            ) : (
              <span className="text-muted-ink text-xs truncate">
                Slots available on request
              </span>
            )}
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full shrink-0",
              nextSlot
                ? "bg-emerald-500/12 text-emerald-800 border border-emerald-500/25"
                : "bg-black/5 text-muted-ink"
            )}
          >
            <span className="relative flex size-1.5 shrink-0">
              {nextSlot ? (
                <>
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-600" />
                </>
              ) : (
                <span className="size-1.5 rounded-full bg-neutral-400" />
              )}
            </span>
            <span>{nextSlot ? "Available" : "Check slots"}</span>
          </span>
        </div>
      </div>

      {/* Footer: Fee & Action Button */}
      <div className="relative z-10 mt-5 flex items-center justify-between gap-3 border-t border-line-soft pt-3.5">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-ink block">
            Consultation fee
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display text-lg sm:text-xl font-extrabold text-ink leading-none">
              {formatRupees(minFee)}
            </span>
            {doctor.videoFee && doctor.audioFee && doctor.videoFee !== doctor.audioFee ? (
              <span className="text-[11px] text-muted-ink font-medium">
                (Video {formatRupees(doctor.videoFee)})
              </span>
            ) : (
              <span className="text-[11px] text-muted-ink font-medium">
                / session
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/doctors/${doctor.slug}`}
          className="relative z-20 inline-flex items-center justify-center gap-2 rounded-full bg-forest hover:bg-forest-deep px-5 py-2.5 text-xs sm:text-sm font-bold text-cream shadow-sm hover:shadow-md hover:brightness-105 active:scale-95 transition-all duration-200 cursor-pointer group/btn shrink-0"
        >
          <span>{nextSlot ? "Book Consult" : "View Profile"}</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
