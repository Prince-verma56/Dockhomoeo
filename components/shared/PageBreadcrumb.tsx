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
import { absoluteUrl } from "@/lib/site";
import type { Crumb } from "@/lib/navigation/crumbs";

export type { Crumb };

/**
 * BreadcrumbList structured data for a trail ("Home" prepended). A <script>
 * must come from a server component: React 19 warns about one rendered by a
 * client component, so client views render the visible trail with
 * `structuredData={false}` and their server page renders this.
 */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ name: "Home", href: "/" }, ...items];
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
 * The visible breadcrumb, plus its structured data unless `structuredData` is
 * false (inside a client component). "Home" is prepended; the last item is
 * the current page.
 */
export function PageBreadcrumb({ items, className, structuredData = true }: { items: Crumb[]; className?: string; structuredData?: boolean }) {
  const trail: Crumb[] = [{ name: "Home", href: "/" }, ...items];
  return (
    <>
      <Breadcrumb className={className}>
        <BreadcrumbList className="text-[0.8125rem] text-muted-ink">
          {trail.map((crumb, index) =>
            index === trail.length - 1 ? (
              <BreadcrumbItem key={crumb.href}>
                <BreadcrumbPage className="text-ink">{crumb.name}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {/* Padding widens the tap target without moving the line. */}
                  <BreadcrumbLink asChild className="-my-2 py-2 hover:text-forest">
                    <Link href={crumb.href}>{crumb.name}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </Fragment>
            ),
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {structuredData ? <BreadcrumbJsonLd items={items} /> : null}
    </>
  );
}
