"use client";

import React, { useEffect, useId, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { describeError } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * The admin's shared building blocks, in the panel's existing look (white
 * cards on #f3f4f6, the #0d5a43 brand green, compact type). Pages compose
 * these so loading, empty, error and confirmation states read the same
 * everywhere.
 */

export const BRAND_BUTTON = "bg-[#0d5a43] hover:bg-[#093e2e] text-white";

export function AdminPanel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("bg-white rounded-xl border border-neutral-200/80 shadow-xs", className)}>
      {title || actions ? (
        <header className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <h2 className="text-sm font-semibold text-neutral-900">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-xs text-neutral-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function AdminLoading({ label = "Loading…", rows = 4 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3 p-5">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-100" />
      ))}
    </div>
  );
}

export function AdminEmpty({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: React.ElementType;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Icon className="mb-3 size-10 stroke-1 text-neutral-300" aria-hidden />
      <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      {children ? <div className="mt-1 max-w-md text-xs leading-relaxed text-neutral-500">{children}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function AdminError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <AlertCircle className="mb-3 size-9 stroke-[1.5] text-rose-400" aria-hidden />
      <h3 className="text-sm font-semibold text-neutral-800">This could not be loaded</h3>
      <p className="mt-1 max-w-md text-xs text-neutral-500">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 h-9 gap-1.5 text-xs">
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

type Tone = "success" | "error" | "info" | "warning";

const NOTICE_STYLE: Record<Tone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

const NOTICE_ICON: Record<Tone, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

/** An inline message. Errors are announced at once; the rest politely. */
export function AdminNotice({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  const Icon = NOTICE_ICON[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-xs leading-relaxed", NOTICE_STYLE[tone], className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export interface TabOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Status filters as a row of toggle buttons; the current one is pressed. */
export function StatusTabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#0d5a43]/40",
              active
                ? "border-[#0d5a43] bg-[#0d5a43] text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
            )}
          >
            {option.label}
            {option.count !== undefined ? (
              <span className={cn("rounded-full px-1.5 text-[10px] tabular-nums", active ? "bg-white/20" : "bg-neutral-100 text-neutral-500")}>
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function Pager({
  page,
  pageCount,
  total,
  onPage,
  noun = "records",
}: {
  page: number;
  pageCount: number;
  total: number;
  onPage: (page: number) => void;
  noun?: string;
}) {
  if (total === 0) return null;
  return (
    <nav aria-label="Pages" className="flex items-center justify-between gap-3 border-t border-neutral-100 px-5 py-3 text-xs text-neutral-500">
      <span>
        {total} {noun} · page {page} of {pageCount}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon-sm" disabled={page >= pageCount} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}

/**
 * A labelled control with its hint and error, wired by id so screen readers
 * read them with the control. `children` receives the props to spread.
 */
export function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean; required?: boolean }) => React.ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-xs font-semibold text-neutral-700">
        {label}
        {required ? <span className="ml-0.5 text-rose-600" aria-hidden>*</span> : null}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, required })}
      {error ? (
        <p id={errorId} className="text-[11px] font-medium text-rose-700">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="text-[11px] leading-relaxed text-neutral-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Input classes matching the panel (taller than the shadcn default, for touch). */
export const FIELD_INPUT = "h-10 text-sm bg-white";

/** A native select styled like the inputs: keyboard and screen-reader behaviour come for free. */
export const FIELD_SELECT =
  "h-10 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive";

/**
 * A button that asks before acting. The dialog stays open while the action
 * runs, shows the backend's refusal if there is one, and closes on success.
 */
export function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel,
  destructive,
  onConfirm,
  children,
  disabled,
}: {
  trigger: React.ReactElement;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  /** Throw to keep the dialog open; the error is shown in it. */
  onConfirm: () => Promise<void>;
  /** Extra fields (a reason…) shown between the text and the buttons. */
  children?: React.ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setError(null);
  }, [open]);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (err) {
      setError(describeError(err, "That did not work. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
      <AlertDialogTrigger asChild disabled={disabled}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        {error ? <AdminNotice tone="error">{error}</AdminNotice> : null}
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" className="h-9 text-xs" disabled={busy}>
              Cancel
            </Button>
          </AlertDialogCancel>
          {/* Not AlertDialogAction: that closes the dialog before the request finishes. */}
          <Button
            type="button"
            onClick={run}
            disabled={busy}
            className={cn("h-9 gap-1.5 text-xs", destructive ? "bg-rose-600 text-white hover:bg-rose-700" : BRAND_BUTTON)}
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Waits until typing stops before a search is sent. */
export function useDebounced<T>(value: T, ms = 300): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return settled;
}

export const rupees = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const shortDate = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(iso)) : "—";

export const dateTime = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(iso)) : "—";

/** YYYY-MM-DD of an instant in the store's timezone (the backend reads days in IST). */
export const istDay = (iso: string | Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
