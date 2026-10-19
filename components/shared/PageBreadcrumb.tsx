import { Fragment } from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
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
 * Features an architectural frosted-glass pill container, Home visual icon,
 * clear active location badge, and smooth horizontal scrolling on mobile.
 */
export function PageBreadcrumb({
  items,
  className,
  structuredData = true,
  variant = "pill",
}: {
  items: Crumb[];
  className?: string;
  structuredData?: boolean;
  variant?: "pill" | "plain";
}) {
  const trail = buildCanonicalTrail(items);
  const isPill = variant === "pill";

  return (
    <>
      <Breadcrumb className={cn("w-fit max-w-full overflow-hidden", className)}>
        <BreadcrumbList
          className={cn(
            "flex items-center gap-1 sm:gap-1.5 text-xs sm:text-[13px] text-muted-ink overflow-x-auto scrollbar-none flex-nowrap py-0.5",
            isPill &&
              "px-3 sm:px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#0c1e17]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/10 shadow-[0_2px_10px_rgba(20,37,31,0.03)]"
          )}
        >
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1;
            const isHome = index === 0 && (crumb.name.toLowerCase() === "home" || crumb.href === "/");

            return isLast ? (
              <BreadcrumbItem key={`${crumb.href}-${crumb.name}-${index}`} className="min-w-0 shrink-0">
                <BreadcrumbPage
                  className={cn(
                    "font-semibold text-[#0d5a43] dark:text-emerald-400 max-w-[170px] sm:max-w-[280px] md:max-w-md truncate inline-block align-middle",
                    isPill && "bg-[#0d5a43]/10 dark:bg-emerald-400/15 px-2.5 py-0.5 rounded-full text-[11.5px] sm:text-xs"
                  )}
                  title={crumb.name}
                >
                  {crumb.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <Fragment key={`${crumb.href}-${crumb.name}-${index}`}>
                <BreadcrumbItem className="min-w-0 shrink-0">
                  <BreadcrumbLink
                    asChild
                    className="group -my-1 py-1 text-muted-ink hover:text-[#0d5a43] dark:hover:text-emerald-400 font-medium transition-colors max-w-[130px] sm:max-w-[200px] truncate inline-flex items-center gap-1.5 align-middle"
                  >
                    <Link href={crumb.href} title={crumb.name}>
                      {isHome ? (
                        <>
                          <Home className="size-3.5 text-[#0d5a43]/75 group-hover:text-[#0d5a43] transition-colors shrink-0" strokeWidth={2.2} />
                          <span className="hidden xs:inline">Home</span>
                        </>
                      ) : (
                        crumb.name
                      )}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-muted-ink/40 dark:text-emerald-400/40 shrink-0 mx-0.5">
                  <ChevronRight className="size-3 stroke-[2.2]" />
                </BreadcrumbSeparator>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      {structuredData ? <BreadcrumbJsonLd items={items} /> : null}
    </>
  );
}
