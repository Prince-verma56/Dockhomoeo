import { Fragment } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site";
import type { Crumb } from "@/lib/navigation/crumbs";

export type { Crumb };

/**
 * Normalizes and deduplicates a breadcrumb trail:
 * 1. Filters empty or whitespace-only crumbs.
 * 2. Prepends "Home" if not already present.
 * 3. Removes consecutive identical names or duplicate non-root hrefs.
 */
function buildCanonicalTrail(items: Crumb[]): Crumb[] {
  const valid = (items || []).filter(
    (item) => item && typeof item.name === "string" && item.name.trim().length > 0 && typeof item.href === "string",
  );

  const raw: Crumb[] =
    valid.length > 0 && valid[0].name.trim().toLowerCase() === "home"
      ? valid
      : [{ name: "Home", href: "/" }, ...valid];

  const trail: Crumb[] = [];
  const seenHrefs = new Set<string>();

  for (const crumb of raw) {
    const cleanName = crumb.name.trim();
    const last = trail[trail.length - 1];

    // Skip consecutive identical names (case-insensitive)
    if (last && last.name.trim().toLowerCase() === cleanName.toLowerCase()) {
      continue;
    }
    // Skip duplicate hrefs (except root '/')
    if (crumb.href !== "/" && seenHrefs.has(crumb.href)) {
      continue;
    }
    seenHrefs.add(crumb.href);
    trail.push({ ...crumb, name: cleanName });
  }

  return trail;
}

/**
 * BreadcrumbList structured data for a trail. A <script> must come from a
 * server component: React 19 warns about one rendered by a client component,
 * so client views render the visible trail with `structuredData={false}`.
 */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const trail = buildCanonicalTrail(items);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.href),
    })),
  };
  return (
    <script
      type="application/ld+json"
      // Escaping "<" keeps the JSON from closing the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}

/**
 * The visible breadcrumb with route-aware hierarchy and DocHomoeo design tokens.
 * The active (current) page is rendered in deep green (#0d5a43) and is not clickable.
 */
export function PageBreadcrumb({
  items,
  className,
  structuredData = true,
}: {
  items: Crumb[];
  className?: string;
  structuredData?: boolean;
}) {
  const trail = buildCanonicalTrail(items);

  return (
    <>
      <Breadcrumb className={cn("w-full overflow-hidden", className)}>
        <BreadcrumbList className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs sm:text-[0.8125rem] text-muted-ink">
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1;
            return isLast ? (
              <BreadcrumbItem key={`${crumb.href}-${crumb.name}-${index}`} className="min-w-0">
                <BreadcrumbPage
                  className="font-semibold text-[#0d5a43] dark:text-emerald-400 max-w-[170px] sm:max-w-[280px] md:max-w-md truncate inline-block align-bottom"
                  title={crumb.name}
                >
                  {crumb.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <Fragment key={`${crumb.href}-${crumb.name}-${index}`}>
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbLink
                    asChild
                    className="-my-1.5 py-1.5 text-muted-ink hover:text-[#0d5a43] dark:hover:text-emerald-400 transition-colors max-w-[130px] sm:max-w-[200px] truncate inline-block align-bottom"
                  >
                    <Link href={crumb.href} title={crumb.name}>
                      {crumb.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-muted-ink/75 dark:text-emerald-400/70 shrink-0" />
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      {structuredData ? <BreadcrumbJsonLd items={items} /> : null}
    </>
  );
}
