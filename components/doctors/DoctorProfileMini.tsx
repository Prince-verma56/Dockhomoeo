import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type DoctorProfileMiniProps = {
  /** Initials stand in for portraits until real avatars are available. */
  initials: string[];
  headline: string;
  detail: string;
  className?: string;
};

/**
 * The overlapping avatar cluster used as a trust cue beside the consultation
 * portrait. Decorative by design: the real figure lives in the text, and the
 * avatars are hidden from assistive technology.
 */
export function DoctorProfileMini({
  initials,
  headline,
  detail,
  className,
}: DoctorProfileMiniProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 rounded-full border border-white/55 bg-cream/88 py-2.5 pr-5 pl-3 shadow-float backdrop-blur-md",
        className,
      )}
    >
      <div aria-hidden className="flex -space-x-2.5">
        {initials.map((value, index) => (
          <Avatar
            key={`${value}-${index}`}
            className="size-9 rounded-full ring-2 ring-cream"
          >
            <AvatarFallback className="bg-forest/10 text-[0.6875rem] font-medium text-forest-deep">
              {value}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      <div className="leading-tight">
        <p className="text-[0.8125rem] font-medium text-ink">{headline}</p>
        <p className="mt-0.5 text-xs text-muted-ink">{detail}</p>
      </div>
    </div>
  );
}
