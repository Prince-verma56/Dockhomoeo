import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Clock,
  Languages,
  MapPin,
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
 * Minimalist, Luxury Editorial Doctor Profile Card:
 * - Uncluttered, balanced visual hierarchy with zero text overflow
 * - Crisp doctor identity with verified check and clean specialization tag
 * - Streamlined metadata row (Languages, City, Session Duration)
 * - Refined, compact availability status pill
 * - Purposeful bottom pricing and "Book Consult" action button
 */
export function DoctorCard({
  doctor,
  nextSlot,
}: {
  doctor: ApiDoctorCard;
  nextSlot: ApiNextSlot | null;
}) {
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

  return (
    <article className="group relative flex h-full flex-col justify-between rounded-3xl border border-line-soft bg-paper p-5 sm:p-6 shadow-2xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-forest/30 hover:shadow-soft focus-within:border-forest/40">
      <div className="space-y-4">
        {/* Top Header: Avatar, Rating & Doctor Credentials */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <DoctorAvatar
              photoUrl={doctor.photoUrl}
              className="size-16 sm:size-17 rounded-2xl ring-2 ring-forest/15 object-cover"
            />
            <span
              title="Verified by DocHomoeo"
              className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-forest text-cream shadow-xs ring-2 ring-paper"
            >
              <ShieldCheck className="size-3" strokeWidth={2.4} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            {/* Top row: Specialization Tag + Rating Pill */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-forest uppercase tracking-wider truncate">
                {doctor.specialization ?? "General Homeopathy"}
              </span>

              {doctor.ratingCount > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-500/20 shrink-0">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  <span>{doctor.ratingAverage.toFixed(1)}</span>
                  <span className="text-amber-800/60 font-medium text-[10px]">
                    ({doctor.ratingCount})
                  </span>
                </span>
              ) : null}
            </div>

            {/* Doctor Name */}
            <h3 className="mt-1 font-display text-lg sm:text-[1.18rem] font-bold leading-snug text-ink transition-colors group-hover:text-forest truncate">
              <Link
                href={`/doctors/${doctor.slug}`}
                className="focus-visible:outline-none after:absolute after:inset-0 after:rounded-3xl"
              >
                {doctor.displayName}
              </Link>
            </h3>

            {/* Qualifications & Experience */}
            {credentials ? (
              <p className="mt-0.5 text-xs text-muted-ink truncate font-medium">
                {credentials}
              </p>
            ) : null}
          </div>
        </div>

        {/* Minimalist Details Row: Languages, City & Duration */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-ink pt-1 border-t border-line-soft/60">
          {doctor.clinicCity ? (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-forest/70 shrink-0" />
              <span className="font-medium text-ink/80">{doctor.clinicCity}</span>
            </div>
          ) : null}

          {doctor.languages.length ? (
            <div className="flex items-center gap-1.5">
              <Languages className="size-3.5 text-forest/70 shrink-0" />
              <span>
                {doctor.languages.slice(0, 2).join(", ")}
                {doctor.languages.length > 2 ? ` +${doctor.languages.length - 2}` : ""}
              </span>
            </div>
          ) : null}

          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-forest/70 shrink-0" />
            <span>{doctor.slotMinutes} mins</span>
          </div>
        </div>

        {/* Compact Integrated Availability Strip */}
        <div className="rounded-xl border border-line-soft/80 bg-canvas/70 px-3.5 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarClock className="size-3.5 text-forest shrink-0" />
            {nextSlot ? (
              <span className="font-medium text-ink truncate">
                Next: <strong className="text-forest-deep">{istWhen(nextSlot.startsAt)}</strong>
              </span>
            ) : (
              <span className="text-muted-ink text-xs truncate">
                Next slot on request
              </span>
            )}
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full shrink-0",
              nextSlot
                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                : "bg-black/5 text-muted-ink"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                nextSlot ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
              )}
            />
            <span>{nextSlot ? "Available" : "Check slots"}</span>
          </span>
        </div>
      </div>

      {/* Footer: Fee & Action Button */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line-soft pt-3.5">
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

        <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-bold text-cream shadow-2xs hover:bg-forest-deep group-hover:shadow-xs transition-all duration-200 shrink-0">
          <span>{nextSlot ? "Book Consult" : "View Profile"}</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
