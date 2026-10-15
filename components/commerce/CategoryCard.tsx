import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeForms, type CategorySummary } from "@/lib/catalogue";

const countLabel = (count: number) => `${count} ${count === 1 ? "product" : "products"}`;

/** Local botanical photographs for categories missing an API image. */
const CATEGORY_FALLBACK_PHOTOS: Record<string, string> = {
  "skin-care": "/Images/HealthGoals/skincare.webp",
  "skincare": "/Images/HealthGoals/skincare.webp",
  "digestive": "/Images/HealthGoals/digestive.webp",
  "digestion": "/Images/HealthGoals/digestive.webp",
  "immunity": "/Images/HealthGoals/immunity.webp",
  "hair-care": "/Images/HealthGoals/haircare.webp",
  "haircare": "/Images/HealthGoals/haircare.webp",
  "sleep-stress": "/Images/HealthGoals/sleep-stress.webp",
  "respiratory": "/Images/HealthGoals/respiratory.webp",
  "womens-health": "/Images/HealthGoals/womens-health.webp",
  "joint-bone": "/Images/HealthGoals/joint-bone.webp",
  "first-aid": "/Images/Products/boiron-arnica.webp",
  "body-care": "/Images/Products/bakson-arnica-oil.webp",
  "wellness": "/Images/HealthGoals/immunity.webp",
};

function resolveImage(category: CategorySummary): string | null {
  return category.imageUrl ?? CATEGORY_FALLBACK_PHOTOS[category.slug] ?? null;
}

/**
 * A category in the /categories directory.
 *
 * `wide` — side-by-side layout: image fills the right half, copy on the left.
 *           The image always covers its frame; never a tiny centered icon.
 * `tile` — stacked layout: image fills the top (aspect-[4/3]), copy below.
 *           Both variants use real botanical photographs where available.
 */
export function CategoryCard({
  category,
  variant = "tile",
  className,
}: {
  category: CategorySummary;
  variant?: "wide" | "tile";
  className?: string;
}) {
  const href = `/products?category=${encodeURIComponent(category.slug)}`;
  const forms = describeForms(category.forms);
  const wide = variant === "wide";
  const photo = resolveImage(category);

  // Botanical fallback tint — gives each empty category its own subtle hue
  // rather than a flat grey placeholder.
  const tints = [
    "from-[#e8f0e5] via-[#dce9d8] to-[#d0e3ca]",
    "from-[#edf3eb] via-[#e0ead8] to-[#d4e1cc]",
    "from-[#e6ece4] via-[#d9e5d5] to-[#cedfca]",
  ];
  const tint = tints[category.name.charCodeAt(0) % tints.length];

  const media = (
    <div
      className={cn(
        "relative overflow-hidden",
        wide
          ? // Side-by-side: image occupies the right portion at a fixed height.
            "min-h-44 w-[42%] shrink-0 sm:w-[45%]"
          : // Stacked: image fills a generous 4:3 area.
            "aspect-[4/3]",
      )}
    >
      {photo ? (
        <Image
          src={photo}
          alt=""
          fill
          sizes={wide ? "(min-width: 1024px) 320px, 46vw" : "(min-width: 1024px) 300px, 50vw"}
          className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.04]"
        />
      ) : (
        /* Botanical gradient fallback — fills the frame, never leaves white space */
        <div className={cn("absolute inset-0 bg-gradient-to-br", tint)}>
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #0d5a43 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-0 grid place-items-center font-display text-5xl font-black text-forest/20 select-none"
          >
            {category.name.charAt(0)}
          </span>
        </div>
      )}

      {/* Thin inner shadow on the image edge facing the copy, for better depth */}
      {wide && (
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-paper/40 to-transparent pointer-events-none" />
      )}
    </div>
  );

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full overflow-hidden rounded-2xl border border-line-soft bg-paper shadow-soft",
        "transition-[border-color,box-shadow,transform] duration-400 ease-premium hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-lift",
        wide ? "flex-row" : "flex-col",
        className,
      )}
    >
      {/* For wide tiles the image goes on the right */}
      {!wide && media}

      <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5 p-5", wide && "justify-center sm:p-7")}>
        <h3
          className={cn(
            "font-display tracking-tight text-ink transition-colors group-hover:text-forest",
            wide ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
          )}
        >
          {category.name}
        </h3>
        <p className="text-[0.8125rem] font-semibold text-forest">{countLabel(category.productCount)}</p>
        {forms ? <p className="text-sm leading-snug text-muted-ink first-letter:uppercase">{forms}</p> : null}
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-forest",
            wide ? "mt-4" : "mt-auto pt-3",
          )}
        >
          {wide ? `Shop ${category.name}` : "Browse"}
          <ArrowUpRight
            aria-hidden
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>

      {wide && media}
    </Link>
  );
}
