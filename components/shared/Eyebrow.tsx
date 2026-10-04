import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
  /** Adds the short rule that precedes an eyebrow in editorial settings. */
  rule?: boolean;
};

/** Small uppercase label that sits above a display heading. */
export function Eyebrow({ children, className, rule = false }: EyebrowProps) {
  return (
    <p
      className={cn(
        "dh-eyebrow flex items-center gap-3 text-muted-ink",
        className,
      )}
    >
      {rule ? (
        <span aria-hidden className="h-px w-8 bg-current opacity-40" />
      ) : null}
      {children}
    </p>
  );
}
