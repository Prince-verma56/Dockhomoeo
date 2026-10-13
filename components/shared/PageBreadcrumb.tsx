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

export type Crumb = { name: string; href: string };

/**
 * The visible breadcrumb and its BreadcrumbList structured data, from one
 * list so the two cannot disagree. "Home" is prepended; the last item is the
 * current page.
 */
export function PageBreadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
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
      <script
        type="application/ld+json"
        // Escaping "<" keeps the JSON from closing the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
