import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { SplitHeading } from "@/components/shared/SplitHeading";
import { PageBreadcrumb, type Crumb } from "@/components/shared/PageBreadcrumb";

type PageHeadProps = {
  /** id of the h1, for the section's aria-labelledby. */
  id: string;
  crumbs: Crumb[];
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Rise the title in on load (SplitHeading). Plain h1 otherwise. */
  animate?: boolean;
  /** Supporting copy under the title, set at lede size and measure. */
  description?: ReactNode;
  /** Right-hand column on desktop: figures, a search field, filters. */
  aside?: ReactNode;
  /** A full-width row under the title block: topic or category links. */
  children?: ReactNode;
  /** Reserve room for the next section to sit across the head's arc. */
  overlap?: boolean;
  className?: string;
};

/**
 * The opening of every interior route: pale sage ending in a shallow arc
 * (`dh-head-arc`), with breadcrumb, title and lede at fixed distances so
 * pages open identically and differ only in what follows.
 */
export function PageHead({
  id,
  crumbs,
  eyebrow,
  title,
  animate = false,
  description,
  aside,
  children,
  overlap = false,
  className,
}: PageHeadProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn("dh-head-arc dh-page-top", overlap && "dh-head-arc--overlap", className)}
    >
      <Container>
        <PageBreadcrumb items={crumbs} className="mb-6" />
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="min-w-0 max-w-3xl">
            {eyebrow ? <Eyebrow className="mb-3.5">{eyebrow}</Eyebrow> : null}
            {animate ? (
              <SplitHeading as="h1" id={id} immediate lines={[<Fragment key="title">{title}</Fragment>]} className="dh-title-page text-ink" />
            ) : (
              <h1 id={id} className="dh-title-page text-ink">
                {title}
              </h1>
            )}
            {description ? <div className="dh-lede mt-4">{description}</div> : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
        {children ? <div className="mt-7">{children}</div> : null}
      </Container>
    </section>
  );
}

/** Headline figures for a page head: large value over a small label, hairline between. */
export function HeadStats({ items }: { items: [value: number | string, label: string][] }) {
  return (
    <dl className="flex divide-x divide-forest/15">
      {items.map(([value, label]) => (
        <div key={label} className="flex flex-col-reverse gap-0.5 px-5 first:pl-0 last:pr-0 sm:px-6">
          <dt className="dh-meta">{label}</dt>
          <dd className="font-display text-[1.875rem] leading-none tracking-tight text-ink sm:text-[2.25rem]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
