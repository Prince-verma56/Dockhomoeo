import { type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** The input styling used across sign-in and the account area. */
export const fieldInputClass =
  "h-12 rounded-xl border-line bg-paper px-4 text-base text-ink shadow-xs placeholder:text-muted-ink/70 focus-visible:border-forest/50 focus-visible:ring-forest/20 disabled:bg-cream-sunk md:text-[0.9375rem]";

type FieldShellProps = {
  id: string;
  label: string;
  error?: string | null;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

/** Label, control, then either the error or the hint, wired for screen readers. */
export function FieldShell({ id, label, error, hint, optional, className, children }: FieldShellProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
        {label}
        {optional ? <span className="text-xs font-normal text-muted-ink">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[0.8125rem] text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-muted-ink">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** ARIA props for the control inside a FieldShell. */
export function describedBy(id: string, error?: string | null, hint?: ReactNode) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}

type TextFieldProps = Omit<React.ComponentProps<"input">, "id" | "prefix"> & {
  id: string;
  label: string;
  error?: string | null;
  hint?: ReactNode;
  optional?: boolean;
  /** Shown inside the field before the value, e.g. "+91". */
  prefix?: string;
  fieldClassName?: string;
};

export function TextField({ id, label, error, hint, optional, prefix, className, fieldClassName, ...input }: TextFieldProps) {
  const control = (
    <Input
      id={id}
      {...describedBy(id, error, hint)}
      {...input}
      className={cn(fieldInputClass, prefix && "pl-14", className)}
    />
  );
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={fieldClassName}>
      {prefix ? (
        <div className="relative">
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[0.9375rem] text-muted-ink">
            {prefix}
          </span>
          {control}
        </div>
      ) : (
        control
      )}
    </FieldShell>
  );
}

type SelectFieldProps = Omit<React.ComponentProps<"select">, "id"> & {
  id: string;
  label: string;
  error?: string | null;
  hint?: ReactNode;
  optional?: boolean;
  fieldClassName?: string;
};

/** A native select (the phone's own picker, and autofill, keep working) styled like TextField. */
export function SelectField({ id, label, error, hint, optional, className, fieldClassName, children, ...select }: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={fieldClassName}>
      <div className="relative">
        <select
          id={id}
          {...describedBy(id, error, hint)}
          {...select}
          className={cn(
            fieldInputClass,
            "w-full appearance-none border pr-10 outline-none focus-visible:ring-3 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
            className,
          )}
        >
          {children}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-ink" />
      </div>
    </FieldShell>
  );
}

/** A notice above a form: an error, a success, or neutral information. Announced to screen readers. */
export function FormNotice({ tone, children, className }: { tone: "error" | "success" | "info"; children: ReactNode; className?: string }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tone === "error" && "border-destructive/25 bg-destructive/6 text-destructive",
        tone === "success" && "border-forest/25 bg-forest/6 text-forest-deep",
        tone === "info" && "border-line bg-cream text-muted-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}
