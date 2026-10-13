import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/commerce/BrandMark";
import type { BrandSummary } from "@/lib/catalogue";

const countLabel = (count: number) => `${count} ${count === 1 ? "product" : "products"}`;

/**
 * A brand on /brands.
 *
 * `featured` — editorial card for the widest-range brands. Shows real product
 *   thumbnails in a compact image strip so the card reads as an entry point into a
 *   genuine product collection rather than an avatar placeholder.
 *
 * `row` — compact directory entry with an optional single thumbnail.
 *
 * Nothing here is written about the brand that the data does not say.
 */
export function BrandCard({
  brand,
  variant = "row",
  detail,
  thumbnails,
  className,
}: {
  brand: BrandSummary;
  variant?: "featured" | "row";
  /** A data-derived description line, e.g. the forms the brand is stocked in. */
  detail?: string;
  /**
   * Absolute image URLs from real products belonging to this brand. Up to 3 are
   * shown in the featured variant; up to 1 in the row variant.
   */
  thumbnails?: string[];
  className?: string;
}) {
  const href = `/brands/${brand.slug}`;
  const activeThumbnails = (thumbnails ?? []).filter(Boolean);

  if (variant === "featured") {
    const displayThumbnails = activeThumbnails.slice(0, 3);

    return (
      <Link
        href={href}
        className={cn(
          "group flex h-full flex-col gap-5 rounded-card border border-line/70 bg-cream p-6 sm:p-7",
          "transition-[border-color,box-shadow,transform] duration-400 ease-premium hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-lift",
          className,
        )}
      >
        {/* Brand identity row */}
        <div className="flex items-center gap-4">
          <BrandMark name={brand.name} logoUrl={brand.logoUrl} size="md" />
          <div className="min-w-0">
            <h3 className="truncate font-display text-2xl tracking-tight text-ink transition-colors group-hover:text-forest">
              {brand.name}
            </h3>
            <p className="text-[0.8125rem] font-semibold text-forest">{countLabel(brand.productCount)}</p>
          </div>
        </div>

        {/* Product thumbnail strip — real product imagery, not decorative */}
        {displayThumbnails.length > 0 ? (
          <div className="flex gap-2">
            {displayThumbnails.map((src, i) => (
              <div
                key={i}
                className={cn(
                  "relative overflow-hidden rounded-lg border border-line/50 bg-ivory",
                  displayThumbnails.length === 1
                    ? "h-28 flex-1"
                    : displayThumbnails.length === 2
                      ? "h-24 flex-1"
                      : "h-20 flex-1",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 33vw, 120px"
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : null}

        {/* Data-derived description */}
        {detail ? <p className="text-sm leading-relaxed text-muted-ink first-letter:uppercase">{detail}</p> : null}

        {/* CTA */}
        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-forest">
          View brand
          <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </Link>
    );
  }

  // Row variant — compact directory entry with optional single thumbnail
  const thumb = activeThumbnails[0];

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-line/70 bg-cream p-3 pr-4",
        "transition-[border-color,box-shadow] duration-300 hover:border-forest/25 hover:shadow-soft",
        className,
      )}
    >
      {/* Thumbnail when available; brand mark when not */}
      {thumb ? (
        <div className="relative size-11 shrink-0 overflow-hidden rounded-[0.8rem] border border-line/50 bg-ivory">
          <Image
            src={thumb}
            alt=""
            fill
            sizes="44px"
            className="object-contain p-1.5"
          />
        </div>
      ) : (
        <BrandMark name={brand.name} logoUrl={brand.logoUrl} size="sm" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] font-semibold text-ink transition-colors group-hover:text-forest">
          {brand.name}
        </span>
        <span className="block text-xs text-muted-ink">{countLabel(brand.productCount)}</span>
      </span>
      <ArrowRight
        aria-hidden
        className="size-4 shrink-0 text-muted-ink transition-[transform,color] duration-300 group-hover:translate-x-0.5 group-hover:text-forest"
      />
    </Link>
  );
}
