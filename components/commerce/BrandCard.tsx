"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/commerce/BrandMark";
import { TiltCard } from "@/components/ui/tilt-card";
import type { BrandSummary } from "@/lib/catalogue";

const countLabel = (count: number) => `${count} ${count === 1 ? "product" : "products"}`;

export type BrandMeta = {
  origin: string;
  specialty: string;
  badgeLabel: string;
  badgeVariant: "success" | "warning" | "brand";
  accentColor: string;
  imageSrc: string;
};

/**
 * Curated pharmacopoeia metadata & color themes for homoeopathic manufacturers.
 * Each brand receives a signature harmonious circular glow accent matching its heritage.
 */
export const BRAND_METADATA: Record<string, BrandMeta> = {
  sbl: {
    origin: "India",
    specialty: "Comprehensive Pharmacopoeia",
    badgeLabel: "Certified",
    badgeVariant: "success",
    accentColor: "#0d5a43", // DocHomoeo Forest
    imageSrc: "/Images/Products/boiron-arnica.webp",
  },
  "dr-reckeweg": {
    origin: "Bensheim, Germany",
    specialty: "Original R-Series Drops",
    badgeLabel: "Imported",
    badgeVariant: "warning",
    accentColor: "#d97706", // Amber
    imageSrc: "/Images/Products/reckeweg-r41.webp",
  },
  bakson: {
    origin: "India",
    specialty: "Apothecary & Herbal Care",
    badgeLabel: "Certified",
    badgeVariant: "success",
    accentColor: "#c2410c", // Terracotta
    imageSrc: "/Images/Products/bakson-arnica-oil.webp",
  },
  boiron: {
    origin: "Messimy, France",
    specialty: "World Leader in Single Dilutions",
    badgeLabel: "French Standard",
    badgeVariant: "brand",
    accentColor: "#4d7c0f", // Alpine Olive/Sage
    imageSrc: "/Images/Products/boiron-arnica.webp",
  },
  "doc-homeo": {
    origin: "DocHomoeo Labs",
    specialty: "Clinically Verified Formulations",
    badgeLabel: "Flagship",
    badgeVariant: "brand",
    accentColor: "#064e3b", // Deep Forest
    imageSrc: "/Images/HealthGoals/immunity.webp",
  },
  lords: {
    origin: "India",
    specialty: "Biochemic & Trituration Salts",
    badgeLabel: "Standardized",
    badgeVariant: "success",
    accentColor: "#0f766e", // Eucalyptus Teal
    imageSrc: "/Images/Products/lords-kali-phos.webp",
  },
  schwabe: {
    origin: "Karlsruhe, Germany",
    specialty: "German Homoeopathy Since 1866",
    badgeLabel: "German Standard",
    badgeVariant: "warning",
    accentColor: "#15803d", // Herbal Green
    imageSrc: "/Images/HealthGoals/digestive.webp",
  },
};

export const getBrandMeta = (brand: BrandSummary): BrandMeta => {
  if (BRAND_METADATA[brand.slug]) {
    return BRAND_METADATA[brand.slug];
  }
  const colors = ["#0d5a43", "#d97706", "#c2410c", "#0f766e", "#4d7c0f"];
  let hash = 0;
  for (let i = 0; i < brand.slug.length; i++) {
    hash = (hash << 5) - hash + brand.slug.charCodeAt(i);
  }
  const accentColor = colors[Math.abs(hash) % colors.length];
  return {
    origin: "Authentic Maker",
    specialty: "Homoeopathic Pharmacopoeia",
    badgeLabel: "Verified",
    badgeVariant: "brand",
    accentColor,
    imageSrc: "/Images/HealthGoals/immunity.webp",
  };
};

/**
 * A brand card on /brands and in "More brands".
 *
 * `featured` — vertical editorial card with BrandMark, thumbnail strip,
 *              description and CTA. Fits balanced 3-column spotlight grid.
 * `row`      — rich 3D TiltCard with mouse tracking, tilted floating packshot,
 *              split badge, and brand-tailored animated circular glow with motion.
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
  /** A data-derived description line, e.g. the forms and categories the brand is stocked in. */
  detail?: string;
  /** Product thumbnail images for the featured card strip */
  thumbnails?: string[];
  className?: string;
}) {
  const href = `/brands/${brand.slug}`;

  if (variant === "featured") {
    return (
      <FeaturedCard
        brand={brand}
        href={href}
        detail={detail}
        thumbnails={thumbnails}
        className={className}
      />
    );
  }

  return <DirectoryTile brand={brand} className={className} />;
}

// ─── Featured editorial vertical card ────────────────────────────────────────

function FeaturedCard({
  brand,
  href,
  detail,
  thumbnails,
  className,
}: {
  brand: BrandSummary;
  href: string;
  detail?: string;
  thumbnails?: string[];
  className?: string;
}) {
  const displayThumbnails = (thumbnails ?? []).filter(Boolean).slice(0, 3);

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col justify-between gap-5 rounded-2xl border border-line-soft bg-paper p-6 sm:p-7 shadow-soft",
        "transition-[border-color,box-shadow,transform] duration-400 ease-premium hover:-translate-y-1 hover:border-forest/30 hover:shadow-lift",
        className,
      )}
    >
      <div>
        {/* Brand identity row */}
        <div className="flex items-center gap-4">
          <BrandMark name={brand.name} logoUrl={brand.logoUrl} size="md" />
          <div className="min-w-0">
            <h3 className="truncate font-display text-2xl tracking-tight text-ink transition-colors duration-300 group-hover:text-forest">
              {brand.name}
            </h3>
            <p className="text-[0.8125rem] font-semibold text-forest">
              {countLabel(brand.productCount)} in catalogue
            </p>
          </div>
        </div>

        {/* Product thumbnail strip — real product imagery */}
        {displayThumbnails.length > 0 ? (
          <div className="mt-5 flex gap-2.5">
            {displayThumbnails.map((src, i) => (
              <div
                key={i}
                className="relative h-24 flex-1 overflow-hidden rounded-xl border border-line-soft/80 bg-canvas/60"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 33vw, 120px"
                  className="object-contain p-2 transition-transform duration-500 ease-premium group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : null}

        {/* Data-derived description */}
        {detail ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-ink line-clamp-2 first-letter:uppercase">
            {detail}
          </p>
        ) : null}
      </div>

      {/* CTA */}
      <div className="pt-2 border-t border-line-soft/60 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-colors duration-300 group-hover:text-forest-deep">
          Explore brand
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-300 ease-premium group-hover:translate-x-1"
          />
        </span>
        <span className="text-xs font-medium text-muted-ink">
          Verified pharmacopoeia
        </span>
      </div>
    </Link>
  );
}

// ─── Directory tile with TiltCard & animated circular effect ─────────────────

function DirectoryTile({
  brand,
  className,
}: {
  brand: BrandSummary;
  className?: string;
}) {
  const meta = getBrandMeta(brand);

  return (
    <TiltCard
      title={brand.name}
      origin={meta.origin}
      description={meta.specialty}
      price={countLabel(brand.productCount)}
      badgeLabel={meta.badgeLabel}
      badgeVariant={meta.badgeVariant}
      imageSrc={meta.imageSrc}
      imageAlt={`${brand.name} remedy packshot`}
      accentColor={meta.accentColor}
      icon={<BrandMark name={brand.name} logoUrl={brand.logoUrl} size="sm" />}
      href={`/brands/${brand.slug}`}
      ctaLabel="Explore catalogue"
      className={className}
    />
  );
}
