import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Brand } from "@/types/content";

/**
 * A brand tile in the logo rail.
 *
 * The monogram is a typographic stand-in, not an imitation of any real mark.
 * When licensed logo assets arrive, replace the monogram block with an
 * `<Image>` and keep the tile, hover response and rail spacing intact.
 */
export function BrandCard({
  brand,
  className,
}: {
  brand: Brand;
  className?: string;
}) {
  return (
    <Link
      href={brand.href}
      className={cn(
        // Sized so the full set fits one desktop row without arrows, and
        // scrolls naturally below that. Logos stay small by design.
        "group flex h-[78px] w-[168px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-line/70 bg-cream px-5 transition-all duration-300 ease-premium",
        "hover:-translate-y-1 hover:border-forest/25 hover:shadow-soft",
        className,
      )}
    >
      <span
        aria-hidden
        className="font-display text-[1.5rem] leading-none tracking-[0.04em] text-ink/70 transition-colors duration-300 group-hover:text-forest"
      >
        {brand.monogram}
      </span>
      <span className="text-[0.8125rem] font-medium text-ink">{brand.name}</span>
      <span className="dh-eyebrow text-[0.5625rem] text-muted-ink/70">
        {brand.origin}
      </span>
    </Link>
  );
}
