import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DepthImage } from "@/components/shared/DepthImage";
import { describeForms, describeNames, type CategorySummary } from "@/lib/catalogue";
import { categoryMedia, type Media } from "@/data/media";

const countLabel = (count: number) => `${count} ${count === 1 ? "product" : "products"}`;

/**
 * Fills its frame either way: a photograph covers it; a studio study is
 * contained on the sage surface it blends into (`dh-study`), so its white
 * sweep becomes the frame colour and nothing reads as an empty box.
 */
function CategoryMedia({
  media,
  sizes,
  depth = false,
  className,
}: {
  media: Media | null;
  sizes: string;
  depth?: boolean;
  className?: string;
}) {
  if (!media) return <div className={cn("bg-sage-wash", className)} />;

  const zoom = "transition-transform duration-[1.2s] ease-premium group-hover:scale-[1.04]";

  if (media.kind === "photo" && depth) {
    return (
      <DepthImage
        src={media.src}
        position={media.position}
        sizes={sizes}
        speed={-6}
        className={className}
        imageClassName={zoom}
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", media.kind === "study" && "dh-study", className)}>
      <Image
        src={media.src}
        alt=""
        fill
        sizes={sizes}
        style={media.position ? { objectPosition: media.position } : undefined}
        className={cn(media.kind === "photo" ? "object-cover" : "object-contain p-[6%]", zoom)}
      />
    </div>
  );
}

/**
 * A category in the /categories directory.
 *
 * `feature` — image-led: a large frame over the name, range and makers.
 *             Used for the most stocked concerns after the featured one.
 * `compact` — a square thumbnail beside the name and range, for the rest.
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
      <Link
        href={href}
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line-soft bg-paper shadow-soft",
          "transition-[border-color,box-shadow,transform] duration-500 ease-premium hover:-translate-y-1 hover:border-forest/25 hover:shadow-lift",
          className,
        )}
      >
        <CategoryMedia
          media={media}
          depth
          sizes="(min-width: 1024px) 720px, 100vw"
          className="relative h-60 sm:h-72 lg:h-[21rem]"
        />
        <div className="flex flex-1 flex-col gap-2 p-6 sm:p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl tracking-tight text-ink transition-colors group-hover:text-forest sm:text-3xl">
              {category.name}
            </h3>
            <span className="shrink-0 text-sm font-semibold text-forest">{countLabel(category.productCount)}</span>
          </div>
          {forms ? <p className="text-sm text-muted-ink first-letter:uppercase">{forms}</p> : null}
          {category.brands.length ? (
            <p className="text-sm text-muted-ink">From {describeNames(category.brands)}</p>
          ) : null}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-ink transition-colors group-hover:text-forest">
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
    <Link
      href={href}
      className={cn(
        "group flex h-full items-center gap-4 rounded-2xl border border-line-soft bg-paper p-3 pr-4 shadow-soft",
        "transition-[border-color,box-shadow,transform] duration-400 ease-premium hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-lift",
        className,
      )}
    >
      <CategoryMedia media={media} sizes="112px" className="relative size-24 shrink-0 rounded-xl sm:size-28 lg:size-20 xl:size-24" />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-display text-lg leading-tight tracking-tight text-ink transition-colors group-hover:text-forest sm:text-xl">
          {category.name}
        </span>
        <span className="text-[0.8125rem] font-semibold text-forest">{countLabel(category.productCount)}</span>
        {forms ? <span className="block text-[0.8125rem] leading-snug text-muted-ink first-letter:uppercase">{forms}</span> : null}
      </span>
      <ArrowUpRight
        aria-hidden
        className="size-4 shrink-0 text-muted-ink transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-forest"
      />
    </Link>
  );
}
