import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeForms, describeNames, type CategorySummary } from "@/lib/catalogue";
import { categoryMedia, type Media } from "@/data/media";

const countLabel = (count: number) => `${count} ${count === 1 ? "product" : "products"}`;

/**
 * Fills its frame either way: a photograph covers it; a studio study is
 * contained on the sage surface it blends into (`dh-study`), so its white
 * sweep becomes the frame colour and nothing reads as an empty box.
 */
function CategoryMedia({ media, sizes, className }: { media: Media | null; sizes: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", media?.kind === "study" ? "dh-study" : "bg-sage-wash", className)}>
      {media ? (
        <Image
          src={media.src}
          alt=""
          fill
          sizes={sizes}
          style={media.position ? { objectPosition: media.position } : undefined}
          className={cn(
            "transition-transform duration-[1.2s] ease-premium group-hover:scale-[1.04]",
            media.kind === "photo" ? "object-cover" : "object-contain p-[7%]",
          )}
        />
      ) : null}
    </div>
  );
}

const frame =
  "group flex h-full flex-col overflow-hidden border border-line-soft bg-paper shadow-soft transition-[border-color,box-shadow,transform] duration-500 ease-premium hover:-translate-y-1 hover:border-forest/25 hover:shadow-lift";

/**
 * A category in the /categories directory. Two sizes on one system:
 *
 * `feature` — 16:10 image over name, count, forms, makers and a link label.
 * `compact` — 4:3 image over name, count and forms.
 *
 * In both, the title row carries the count or arrow on its line, so names,
 * counts and descriptions line up across a row of cards.
 */
export function CategoryCard({
  category,
  variant = "compact",
  className,
}: {
  category: CategorySummary;
  variant?: "feature" | "compact";
  className?: string;
}) {
  const href = `/products?category=${encodeURIComponent(category.slug)}`;
  const forms = describeForms(category.forms);
  const media = categoryMedia(category.slug, category.imageUrl);

  if (variant === "feature") {
    return (
      <Link href={href} className={cn(frame, "rounded-[1.5rem]", className)}>
        <CategoryMedia media={media} sizes="(min-width: 768px) 640px, 100vw" className="aspect-16/10" />
        <div className="dh-pad-card flex flex-1 flex-col">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="dh-title-block text-ink transition-colors group-hover:text-forest">{category.name}</h3>
            <span className="dh-meta shrink-0 font-semibold text-forest">{countLabel(category.productCount)}</span>
          </div>
          {forms ? <p className="dh-meta mt-2 first-letter:uppercase">{forms}</p> : null}
          {category.brands.length ? <p className="dh-meta mt-0.5">From {describeNames(category.brands)}</p> : null}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-ink transition-colors group-hover:text-forest">
            Shop {category.name}
            <ArrowUpRight
              aria-hidden
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className={cn(frame, "rounded-[1.25rem]", className)}>
      <CategoryMedia media={media} sizes="(min-width: 1024px) 300px, 50vw" className="aspect-4/3" />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="dh-title-card text-ink transition-colors group-hover:text-forest">{category.name}</h3>
          <ArrowUpRight
            aria-hidden
            className="mt-1 size-4 shrink-0 text-muted-ink transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-forest"
          />
        </div>
        <p className="dh-meta mt-1.5 font-semibold text-forest">{countLabel(category.productCount)}</p>
        {forms ? <p className="dh-meta mt-0.5 first-letter:uppercase">{forms}</p> : null}
      </div>
    </Link>
  );
}
