import { type ReactNode } from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TONE_CLASSES, type StatusTone } from "@/lib/account/orderStatus";
import { cn } from "@/lib/utils";

/** The surface every account panel sits on. */
export const panelClass = "rounded-[1.5rem] border border-line/70 bg-paper shadow-xs";

/** Title row of an account page: heading on the left, an action on the right. */
export function AccountPageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display text-2xl text-ink sm:text-[1.75rem]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-ink">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Placeholder blocks while a page loads, shaped like the content to come. */
export function AccountLoading({ rows = 3, label = "Loading…" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden className={cn(panelClass, "h-28 motion-safe:animate-pulse bg-cream-sunk/60")} />
      ))}
    </div>
  );
}

export function AccountError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className={cn(panelClass, "flex flex-col items-center px-6 py-12 text-center")}>
      <span className="grid size-12 place-items-center rounded-full bg-destructive/8 text-destructive">
        <AlertCircle aria-hidden className="size-5" strokeWidth={1.8} />
      </span>
      <p className="mt-4 font-medium text-ink">{message}</p>
      <Button variant="brandOutline" size="xl" className="mt-5" onClick={onRetry}>
        <RotateCw aria-hidden />
        Try again
      </Button>
    </div>
  );
}

export function AccountEmpty({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={cn(panelClass, "flex flex-col items-center px-6 py-14 text-center")}>
      <span className="grid size-14 place-items-center rounded-full bg-sage-wash text-forest">{icon}</span>
      <h3 className="mt-5 font-display text-xl text-ink">{title}</h3>
      {children ? <p className="mt-2 max-w-sm text-sm text-muted-ink">{children}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function StatusPill({ label, tone, className }: { label: string; tone: StatusTone; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 w-fit items-center rounded-full border px-2.5 text-xs font-semibold whitespace-nowrap", TONE_CLASSES[tone], className)}>
      {label}
    </span>
  );
}
