import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { SplitHeading } from "@/components/shared/SplitHeading";

type SectionHeadingProps = {
  /** One entry per visual line of the display heading. */
  lines: ReactNode[];
  id?: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Trailing control, usually a "view all" link. */
  action?: ReactNode;
  className?: string;
  headingClassName?: string;
  as?: "h1" | "h2" | "h3";
  size?: "sm" | "md" | "lg";
  align?: "start" | "center";
};

const SIZES = {
  sm: "text-[1.75rem] leading-[1.12] sm:text-[2rem] lg:text-[2.25rem]",
  md: "text-[2.125rem] leading-[1.06] sm:text-[2.625rem] lg:text-[3.25rem]",
  lg: "text-[2.5rem] leading-[1.02] sm:text-[3.25rem] lg:text-[4rem]",
} as const;

/**
 * The standard heading block: eyebrow, masked display heading, supporting
 * copy and an optional action. Every section composes this rather than
 * restating heading typography locally.
 */
export function SectionHeading({
  lines,
  id,
  eyebrow,
  description,
  action,
  className,
  headingClassName,
  as = "h2",
  size = "md",
  align = "start",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}

      <SplitHeading
        as={as}
        id={id}
        lines={lines}
        className={cn("text-ink", SIZES[size], headingClassName)}
      />

      {description ? (
        <p
          className={cn(
            "max-w-[46ch] text-[0.9375rem] leading-relaxed text-muted-ink",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}

      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
