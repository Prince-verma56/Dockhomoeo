import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Rating } from "@/components/shared/Rating";
import { formatPrice } from "@/lib/formatters/price";
import type { Doctor } from "@/types/doctor";

type DoctorCardProps = {
  doctor: Doctor;
  className?: string;
  /** `overlay` is the floating treatment used over the portrait frame. */
  variant?: "standalone" | "overlay";
};

/**
 * The profile card: person first, trust second, booking third.
 *
 * The avatar renders initials until portrait photography exists; swapping in
 * `<AvatarImage src=... />` is the only change needed later.
 */
export function DoctorCard({
  doctor,
  className,
  variant = "standalone",
}: DoctorCardProps) {
  const isOverlay = variant === "overlay";

  return (
    <Card
      className={cn(
        "flex w-full flex-col gap-4 rounded-card p-5",
        isOverlay
          ? "border-white/55 bg-cream/88 shadow-float backdrop-blur-md"
          : "border-line/70 bg-cream shadow-soft",
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <Avatar className="size-12 shrink-0 rounded-full ring-1 ring-forest/12">
          <AvatarFallback className="bg-sage-tint font-display text-base text-forest-deep">
            {doctor.initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.9375rem] leading-tight font-medium text-ink">
            {doctor.name}
          </p>
          <p className="mt-1 truncate text-xs text-muted-ink">
            {doctor.qualifications}
          </p>
          <p className="mt-0.5 truncate text-xs text-forest">
            {doctor.specialty}
          </p>
        </div>
      </div>

      {doctor.rating ? (
        <Rating
          variant="full"
          value={doctor.rating.value}
          count={doctor.rating.count}
        />
      ) : null}

      <Separator className="bg-line/70" />

      <dl className="flex items-end justify-between gap-3 text-xs">
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 text-muted-ink">
            <CalendarClock aria-hidden className="size-3.5" strokeWidth={1.6} />
            Next available
          </dt>
          <dd className="mt-1 truncate font-medium text-ink">
            {doctor.nextAvailable}
          </dd>
        </div>

        <div className="shrink-0 text-right">
          <dt className="text-muted-ink">Consultation</dt>
          <dd className="mt-1 font-medium text-ink">
            {formatPrice(doctor.consultationFee)}
          </dd>
        </div>
      </dl>

      <Button
        asChild
        size="lg"
        className="h-11 w-full rounded-xl bg-forest text-sm text-cream hover:bg-forest-deep"
      >
        <Link href={`/book/${doctor.id}`}>
          Book consultation
          <ArrowRight className="size-4" strokeWidth={1.8} />
        </Link>
      </Button>
    </Card>
  );
}
