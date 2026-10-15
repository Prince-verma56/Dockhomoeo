import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/commerce/BrandMark";
import type { BrandSummary } from "@/lib/catalogue";

export const countLabel = (count: number) => `${count} ${count === 1 ? "product" : "products"}`;

/**
 * Where each stocked manufacturer is based. Shown as a quiet line under the
 * name; a brand missing here simply shows no origin.
 */
export const BRAND_ORIGINS: Readonly<Record<string, string>> = {
  sbl: "India",
  "dr-reckeweg": "Bensheim, Germany",
  bakson: "India",
  boiron: "Messimy, France",
  "doc-homeo": "DocHomoeo Labs",
  lords: "India",
  schwabe: "Karlsruhe, Germany",
};

export const brandOrigin = (slug: string): string | null => BRAND_ORIGINS[slug] ?? null;

/**
 * A compact manufacturer card ("More brands" on a brand page). Typography
 * carries it: name, origin and range. The brand's licensed logo appears when
 * the data supplies one; no stand-in mark is drawn when it does not.
 */
export function BrandCard({ brand, className }: { brand: BrandSummary; className?: string }) {
  const origin = brandOrigin(brand.slug);

  return (
    <Link
      href={`/brands/${brand.slug}`}
      className={cn(
        "group flex h-full items-center gap-4 rounded-2xl border border-line-soft bg-paper p-5",
        "transition-[border-color,box-shadow,transform] duration-400 ease-premium hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-lift",
        className,
      )}
    >
      {brand.logoUrl ? <BrandMark name={brand.name} logoUrl={brand.logoUrl} size="sm" /> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-xl tracking-tight text-ink transition-colors group-hover:text-forest">
          {brand.name}
        </span>
        <span className="mt-0.5 block truncate text-[0.8125rem] text-muted-ink">
          {origin ? `${origin} · ` : null}
          {countLabel(brand.productCount)}
        </span>
      </span>
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-full border border-line-soft text-ink transition-colors duration-300 group-hover:border-forest group-hover:bg-forest group-hover:text-cream"
      >
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  );
}
