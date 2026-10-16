import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types/api/admin-care";
import { VERIFICATION_LABEL, VERIFICATION_TONE } from "./doctorLabels";

export function VerificationBadge({ status, className }: { status: VerificationStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", VERIFICATION_TONE[status], className)}>
      {VERIFICATION_LABEL[status]}
    </span>
  );
}

/** Whether patients can find and book the doctor right now (the public list's own rule). */
export function LiveBadge({ live }: { live: boolean }) {
  return live ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
      Consulting
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
      Not consulting
    </span>
  );
}
