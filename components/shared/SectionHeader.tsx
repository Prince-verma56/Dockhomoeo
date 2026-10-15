import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/shared/Eyebrow";

type SectionHeaderProps = {
  id?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Trailing control aligned to the title's baseline: "View all", a count. */
  action?: ReactNode;
  /** `section` for a page section, `block` for a subordinate one. */
  size?: "section" | "block";
  as?: "h2" | "h3";
  className?: string;
};

/**
 * The heading block for interior sections. Fixed distances (eyebrow → title
 * → description), and a fixed gap to the content below (`dh-head-gap`), so
 * every section's header sits the same way on the grid.
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  action,
  size = "section",
  as: Tag = "h2",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("dh-head-gap flex flex-wrap items-end justify-between gap-x-8 gap-y-3", className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
        <Tag id={id} className={cn("text-ink", size === "section" ? "dh-title-section" : "dh-title-block")}>
          {title}
        </Tag>
        {description ? <p className="dh-body mt-2.5">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0 pb-1">{action}</div> : null}
    </div>
  );
}
