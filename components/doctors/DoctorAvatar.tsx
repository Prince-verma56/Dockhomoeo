import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A doctor's photo when the shop has one; otherwise a neutral placeholder
 * that suggests no particular face or identity.
 */
export function DoctorAvatar({ photoUrl, className }: { photoUrl: string | null; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-sage-wash text-forest/60 ring-1 ring-forest/10", className)}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- doctor photos are admin uploads of any size
        <img src={photoUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <UserRound className="size-[52%]" strokeWidth={1.4} />
      )}
    </span>
  );
}
