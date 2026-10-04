import { cn } from "@/lib/utils";

type StatProps = {
  value: string;
  label: string;
  className?: string;
  tone?: "light" | "dark";
};

/** A single compact metric. Values come from data, never from the component. */
export function Stat({ value, label, className, tone = "light" }: StatProps) {
  return (
    <div className={cn("leading-tight", className)}>
      <p
        className={cn(
          "font-display text-[1.375rem] tracking-tight",
          tone === "dark" ? "text-cream" : "text-ink",
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "mt-1 text-[0.6875rem] tracking-wide",
          tone === "dark" ? "text-cream/65" : "text-muted-ink",
        )}
      >
        {label}
      </p>
    </div>
  );
}
