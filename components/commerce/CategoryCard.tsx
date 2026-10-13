import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeForms, type CategorySummary } from "@/lib/catalogue";

const countLabel = (count: number) => `${count} ${count === 1 ? "product" : "products"}`;

/**
 * A category in the /categories directory. Two compositions so a row of
 * them does not read as one repeated box: `wide` sets copy beside the
 * artwork, `tile` stacks the artwork over the copy. The artwork is a square
 * illustration on a soft grey vignette, so it fills its frame (cover) rather
 * than sitting as a visible box inside it.
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

  const media = (
    <div
      className={cn(
        "relative overflow-hidden bg-[#f2f2f1]",
        // Side by side at every width: stacked, a wide tile would be a phone screen tall.
        wide ? "min-h-40 w-[40%] sm:w-[46%]" : "aspect-4/3 border-b border-line/50",
      )}
    >
      {category.imageUrl ? (
        // Decorative: the category name sits right beside it.
        <Image
          src={category.imageUrl}
          alt=""
          fill
          sizes={wide ? "(min-width: 1024px) 300px, 46vw" : "(min-width: 1024px) 300px, 50vw"}
          className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.04]"
        />
      ) : (
        <span aria-hidden className="absolute inset-0 grid place-items-center font-display text-5xl text-forest/15">
          {category.name.charAt(0)}
        </span>
      )}
    </div>
  );

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full overflow-hidden rounded-card border border-line/70 bg-cream",
        "transition-[border-color,box-shadow,transform] duration-400 ease-premium hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-lift",
        wide ? "flex-row" : "flex-col",
        className,
      )}
    >
      {wide ? null : media}
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5 p-5", wide && "justify-center sm:p-7")}>
        <h3
          className={cn(
            "font-display tracking-tight text-ink transition-colors group-hover:text-forest",
            wide ? "text-2xl sm:text-[1.75rem]" : "text-lg sm:text-xl",
          )}
        >
          {category.name}
        </h3>
        <p className="text-[0.8125rem] font-semibold text-forest">{countLabel(category.productCount)}</p>
        {forms ? <p className="text-sm leading-snug text-muted-ink first-letter:uppercase">{forms}</p> : null}
        {/* Every tile says what clicking it does, not only the wide ones. */}
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
      {wide ? media : null}
    </Link>
  );
}
