import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
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
import type { ApiDoctorCard, ApiNextSlot } from "@/types/api/care";

/**
 * Editorial Doctor Profile Card:
 * Displays verified practitioner details returned by GET /api/care/doctors.
 * Strictly adheres to backend data — never fabricates ratings, fees or slots.
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
      ? `${doctor.experienceYears} yrs experience`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] border border-line/75 bg-paper p-6 shadow-xs transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-forest/35 hover:shadow-lift focus-within:border-forest/40">
      <div>
        {/* Top Header: Avatar, Verified Badge, Name & Specialty */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <DoctorAvatar
              photoUrl={doctor.photoUrl}
              className="size-16 sm:size-18 rounded-2xl ring-2 ring-forest/10"
            />
            <span
              title="Verified by DocHomoeo"
              className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-forest text-cream shadow-xs ring-2 ring-paper"
            >
              <ShieldCheck className="size-3" strokeWidth={2.5} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {doctor.specialization ? (
                <span className="inline-flex items-center rounded-md bg-sage-wash px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-forest uppercase">
                  {doctor.specialization}
                </span>
              ) : null}
              {doctor.ratingCount > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-amber-800">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  {doctor.ratingAverage.toFixed(1)}
                  <span className="text-amber-700/60 font-normal">
                    ({doctor.ratingCount})
                  </span>
                </span>
              ) : null}
            </div>

            <h3 className="mt-1.5 font-display text-lg sm:text-xl font-semibold leading-tight text-ink transition-colors group-hover:text-forest">
              <Link
                href={`/doctors/${doctor.slug}`}
                className="focus-visible:outline-none after:absolute after:inset-0 after:rounded-[1.75rem]"
              >
                {doctor.displayName}
              </Link>
            </h3>

            {credentials ? (
              <p className="mt-1 text-xs text-muted-ink leading-relaxed">
                {credentials}
              </p>
            ) : null}
          </div>
        </div>

        {/* Bio excerpt if provided */}
        {doctor.bio ? (
          <p className="mt-4 line-clamp-2 text-[0.84rem] leading-relaxed text-ink/80">
            {doctor.bio}
          </p>
        ) : null}

        {/* Details: Languages & Location */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-muted-ink">
          {doctor.languages.length ? (
            <div className="flex items-center gap-1.5">
              <Languages className="size-3.5 text-forest/80 shrink-0" />
              <span>{doctor.languages.join(", ")}</span>
            </div>
          ) : null}
          {doctor.clinicCity ? (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-forest/80 shrink-0" />
              <span>{doctor.clinicCity}</span>
            </div>
          ) : null}
        </div>

        {/* Availability Strip */}
        <div className="mt-5 rounded-xl border border-line-soft bg-canvas/70 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 shrink-0 text-forest" />
            <div className="min-w-0 flex-1 text-xs">
              {nextSlot ? (
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                  <span className="font-medium text-ink">
                    Next free:{" "}
                    <span className="font-semibold text-forest">
                      {istWhen(nextSlot.startsAt)}
                    </span>
                  </span>
                </div>
              ) : (
                <span className="text-muted-ink">
                  No slots open in next 14 days
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Fee Badges & CTA */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {doctor.videoFee !== null ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-forest/8 px-2.5 py-1 text-[0.72rem] font-semibold text-forest-deep">
              <Video className="size-3 text-forest" />
              Video {formatRupees(doctor.videoFee)}
            </span>
          ) : null}
          {doctor.audioFee !== null ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-forest/8 px-2.5 py-1 text-[0.72rem] font-semibold text-forest-deep">
              <Phone className="size-3 text-forest" />
              Audio {formatRupees(doctor.audioFee)}
            </span>
          ) : null}
          <span className="inline-flex items-center rounded-full bg-cream-sunk px-2.5 py-1 text-[0.72rem] text-muted-ink font-medium">
            {doctor.slotMinutes} min
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest transition-transform group-hover:translate-x-0.5">
          {nextSlot ? "Book" : "View"}
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </article>
  );
}
