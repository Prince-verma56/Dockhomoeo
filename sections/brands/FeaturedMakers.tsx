import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/shared/Reveal";
import { DepthImage } from "@/components/shared/DepthImage";
import { BrandMark } from "@/components/commerce/BrandMark";
import { countLabel } from "@/components/commerce/BrandCard";
import { FORM_MEDIA } from "@/data/media";
import { formLabel } from "@/lib/search/searchState";
import type { BrandSummary } from "@/lib/catalogue";
import type { ApiProductCard } from "@/types/api/product";

export type MakerPhoto = {
  src: string;
  position?: string;
  /** What the photograph shows: a product of the brand's own, or one of its forms. */
  caption: string;
};

export type FeaturedMaker = {
  brand: BrandSummary;
  origin: string | null;
  /** Data-derived: "Drops, creams and tablets for First Aid, Body Care and 2 more." */
  summary: string;
  categories: { name: string; slug: string; count: number }[];
  photo: MakerPhoto | null;
};

/**
 * One photograph per featured maker, most specific first: a photograph of one
 * of its own products (the API's packshot), then the photograph for each form
 * it stocks, most stocked first. A photograph already used by an earlier maker
 * is skipped, so no two cards share an image.
 */
export function pickMakerPhotos(ranges: { items: ApiProductCard[]; forms: string[] }[]): (MakerPhoto | null)[] {
  const used = new Set<string>();
  return ranges.map(({ items, forms }) => {
    const candidates: MakerPhoto[] = [
      ...items.flatMap((item) => (item.imageUrl ? [{ src: item.imageUrl, caption: item.name }] : [])),
      ...forms.flatMap((form) => {
        const media = FORM_MEDIA[form];
        return media ? [{ src: media.src, position: media.position, caption: formLabel(form) }] : [];
      }),
    ];
    const photo = candidates.find((candidate) => !used.has(candidate.src)) ?? null;
    if (photo) used.add(photo.src);
    return photo;
  });
}

/**
 * The featured manufacturers on /brands: the widest range as a full-width
 * card (4:3 photograph beside its copy), the next two as a pair beneath it.
 * Each card's name is its one link, stretched over the card; category chips
 * sit above it as links of their own.
 */
export function FeaturedMakers({ makers }: { makers: FeaturedMaker[] }) {
  const [lead, ...others] = makers;
  if (!lead) return null;

  return (
    <div className="grid gap-5 lg:gap-6">
      <Reveal as="div" y={20}>
        <LeadCard maker={lead} />
      </Reveal>
      {others.length > 0 ? (
        <Reveal as="div" y={20} stagger=":scope > *" className={cn("grid gap-5 lg:gap-6", others.length > 1 && "md:grid-cols-2")}>
          {others.map((maker, i) => (
            <SideCard key={maker.brand.slug} maker={maker} flip={i % 2 === 1} />
          ))}
        </Reveal>
      ) : null}
    </div>
  );
}

const cardFrame =
  "group relative isolate overflow-hidden rounded-[1.5rem] border border-line-soft bg-paper shadow-soft transition-[border-color,box-shadow,transform] duration-500 ease-premium hover:-translate-y-1 hover:border-forest/25 hover:shadow-lift";

function TitleLink({ maker }: { maker: FeaturedMaker }) {
  return (
    <Link
      href={`/brands/${maker.brand.slug}`}
      className="transition-colors duration-300 before:absolute before:inset-0 before:z-0 before:content-[''] group-hover:text-forest"
    >
      {maker.brand.name}
    </Link>
  );
}

function Explore() {
  return (
    <span aria-hidden className="inline-flex items-center gap-2.5 text-sm font-semibold whitespace-nowrap text-forest">
      Explore range
      <span className="grid size-8 place-items-center rounded-full bg-forest text-cream transition-transform duration-400 ease-premium group-hover:translate-x-1">
        <ArrowRight className="size-4" />
      </span>
    </span>
  );
}

function Pictured({ photo }: { photo: MakerPhoto | null }) {
  return photo ? <p className="dh-meta text-muted-ink/80">Pictured: {photo.caption.toLowerCase()}</p> : null;
}

function Photo({ photo, sizes, className }: { photo: MakerPhoto | null; sizes: string; className?: string }) {
  if (!photo) return <div className={cn("bg-sage-wash", className)} />;
  return (
    <DepthImage
      src={photo.src}
      position={photo.position}
      sizes={sizes}
      speed={-6}
      className={className}
      imageClassName="transition-transform duration-[1.2s] ease-premium group-hover:scale-[1.03]"
    />
  );
}

function LeadCard({ maker }: { maker: FeaturedMaker }) {
  return (
    <article className={cn(cardFrame, "grid lg:grid-cols-2")}>
      <Photo photo={maker.photo} sizes="(min-width: 1024px) 640px, 100vw" className="aspect-4/3 lg:aspect-auto lg:min-h-104" />

      <div className="dh-pad-card-lg flex flex-col justify-center">
        <div className="flex items-start gap-4">
          {maker.brand.logoUrl ? <BrandMark name={maker.brand.name} logoUrl={maker.brand.logoUrl} size="md" /> : null}
          <div>
            <p className="dh-eyebrow text-muted-ink">
              {maker.origin ? `${maker.origin} · ` : null}Widest range
            </p>
            <h3 className="dh-title-page mt-3 text-ink">
              <TitleLink maker={maker} />
            </h3>
            <p className="dh-meta mt-2 font-semibold text-forest">{countLabel(maker.brand.productCount)} in stock</p>
          </div>
        </div>
        <p className="dh-body mt-4">{maker.summary}</p>
        {maker.categories.length > 0 ? (
          <ul aria-label={`${maker.brand.name} by category`} className="relative z-10 mt-5 flex flex-wrap gap-2">
            {maker.categories.slice(0, 4).map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/brands/${maker.brand.slug}?category=${encodeURIComponent(category.slug)}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-soft bg-canvas px-3 text-[0.8125rem] text-ink transition-colors hover:border-forest/40 hover:text-forest"
                >
                  {category.name}
                  <span className="text-xs text-muted-ink">
                    {category.count}
                    <span className="sr-only"> products</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <Explore />
          <Pictured photo={maker.photo} />
        </div>
      </div>
    </article>
  );
}

function SideCard({ maker, flip }: { maker: FeaturedMaker; flip: boolean }) {
  return (
    <article className={cn(cardFrame, "grid grid-cols-[42%_1fr]", flip && "grid-cols-[1fr_42%]")}>
      <Photo
        photo={maker.photo}
        sizes="(min-width: 768px) 280px, 42vw"
        className={cn("min-h-60 sm:min-h-64", flip && "order-last")}
      />
      <div className="dh-pad-card flex min-w-0 flex-col">
        <p className="dh-eyebrow truncate text-muted-ink">{maker.origin ?? "Manufacturer"}</p>
        <h3 className="dh-title-block mt-2.5 text-ink">
          <TitleLink maker={maker} />
        </h3>
        <p className="dh-meta mt-1.5 font-semibold text-forest">{countLabel(maker.brand.productCount)}</p>
        <p className="dh-meta mt-3 line-clamp-3">{maker.summary}</p>
        <div className="mt-auto flex flex-col gap-2 pt-5">
          <Explore />
          <Pictured photo={maker.photo} />
        </div>
      </div>
    </article>
  );
}
