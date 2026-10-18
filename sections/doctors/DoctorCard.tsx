"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock,
  Globe,
  MapPin,
  Phone,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import { formatRupees } from "@/lib/formatters/price";
import { istWhen } from "@/lib/care/consultation";
import { cn } from "@/lib/utils";
import type { ApiDoctorCard, ApiNextSlot } from "@/types/api/care";

export function DoctorCard({
  doctor,
  nextSlot,
  onBookConsult,
}: {
  doctor: ApiDoctorCard;
  nextSlot: ApiNextSlot | null;
  onBookConsult?: (doctor: ApiDoctorCard) => void;
}) {
  const router = useRouter();

  const fees = [doctor.videoFee, doctor.audioFee].filter((f): f is number => f !== null);
  const minFee = fees.length ? Math.min(...fees) : 400;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    router.push(`/doctors/${doctor.slug}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        "group relative flex h-full flex-col justify-between rounded-[26px] p-3 sm:p-3.5",
        "bg-white dark:bg-[#0c1e17] border border-black/[0.08] dark:border-white/10",
        "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]",
        "hover:shadow-[0_22px_45px_-8px_rgba(13,90,67,0.14)]",
        "hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-pointer",
        "overflow-hidden"
      )}
    >
      <div>
        {/* Top Portrait Image with Arched Rounded Corners */}
        <div className="relative w-full h-56 sm:h-60 rounded-[20px] overflow-hidden bg-cream/40 mb-3.5">
          {doctor.photoUrl ? (
            <Image
              src={doctor.photoUrl}
              alt={doctor.displayName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="size-full bg-forest/10 grid place-items-center text-forest font-bold text-2xl">
              {doctor.displayName.charAt(0)}
            </div>
          )}

          {/* Floating Availability Pill (Top Left) */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/92 dark:bg-[#0c1e17]/90 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 shadow-xs">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
            </span>
            <span>Available today</span>
          </div>

          {/* Floating Rating Pill (Top Right) */}
          {doctor.ratingAverage ? (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/92 dark:bg-[#0c1e17]/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-amber-950 dark:text-amber-300 border border-amber-500/20 shadow-xs">
              <Star className="size-3 fill-amber-500 text-amber-500" />
              <span>{doctor.ratingAverage.toFixed(1)}</span>
              {doctor.ratingCount ? (
                <span className="text-[10px] text-amber-800/70 dark:text-amber-400 font-medium">
                  ({doctor.ratingCount})
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Doctor Name & Qualifications */}
        <div className="px-1 space-y-1">
          <h3 className="font-display text-lg sm:text-[1.15rem] font-bold text-ink dark:text-white leading-snug group-hover:text-forest transition-colors truncate">
            {doctor.displayName}
          </h3>

          <p className="text-[11.5px] text-muted-ink dark:text-white/60 font-medium truncate">
            {doctor.qualification ?? "BHMS, MD (Homoeopathy)"}
          </p>

          {/* Specialization Badge */}
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/[0.07] border border-forest/15 px-3 py-0.5 text-[11px] font-semibold text-forest dark:text-emerald-400 truncate max-w-full">
              <Sparkles className="size-3 shrink-0" />
              <span className="truncate">{doctor.specialization ?? "General Homoeopathy"}</span>
            </span>
          </div>

          {/* Metadata Rows: Location, Languages, Modes, Next Slot */}
          <div className="pt-2.5 space-y-1.5 text-[11.5px] text-muted-ink dark:text-white/70">
            {/* City & Language */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 min-w-0">
                <MapPin className="size-3 text-forest shrink-0" />
                <span className="truncate">{doctor.clinicCity ?? "Mumbai"}</span>
              </span>

              <span className="flex items-center gap-1 shrink-0">
                <Globe className="size-3 text-forest shrink-0" />
                <span className="truncate max-w-[120px]">
                  {doctor.languages.slice(0, 2).join(", ")}
                </span>
              </span>
            </div>

            {/* Consultation Modes */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Video className="size-3 text-emerald-600" />
                <span>Video</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="size-3 text-emerald-600" />
                <span>Audio</span>
              </span>
            </div>

            {/* Next Slot */}
            <div className="flex items-center gap-1.5 pt-0.5 text-forest font-semibold text-[11px]">
              <Clock className="size-3 shrink-0" />
              <span className="truncate">
                {nextSlot ? `Next slot: ${istWhen(nextSlot.startsAt)}` : "Next slot: Tomorrow, 10:00 am"}
              </span>
            </div>

            {/* Profile Link */}
            <div className="pt-1">
              <Link
                href={`/doctors/${doctor.slug}`}
                data-profile-link="true"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] font-semibold text-forest/80 hover:text-forest dark:text-emerald-400/80 dark:hover:text-emerald-300 inline-flex items-center gap-1 hover:underline"
              >
                <span>View profile &amp; schedule</span>
                <ArrowRight className="size-2.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Pricing & Book Consultation Button */}
      <div className="mt-4 pt-3 border-t border-line-soft dark:border-white/10 flex items-center justify-between gap-2 px-1">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-lg sm:text-xl font-bold text-ink dark:text-white">
              {formatRupees(minFee)}
            </span>
            {doctor.videoFee && doctor.videoFee !== minFee ? (
              <span className="text-[10px] text-muted-ink dark:text-white/50 line-through">
                (Video {formatRupees(doctor.videoFee)})
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onBookConsult) {
              onBookConsult(doctor);
            } else {
              router.push(`/doctors/${doctor.slug}`);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#0d5a43] hover:bg-[#074231] active:scale-95 text-white px-3.5 sm:px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer group/btn"
        >
          <span>Book Consultation</span>
          <ArrowRight className="size-3 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </article>
  );
}
