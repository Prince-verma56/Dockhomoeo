import Link from "next/link";
import Image from "next/image";
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
  photos: MakerPhoto[];
};

/**
 * Photographs for each featured maker, most specific first: a photograph of
 * one of its own products (the API's packshot, or a local mapping), then the
 * photograph for each form it stocks, most stocked first. A photograph used
 * by an earlier maker is skipped, so no two cards share an image.
 */
export function pickMakerPhotos(
  ranges: { items: ApiProductCard[]; forms: string[] }[],
  perMaker: number[],
): MakerPhoto[][] {
  const used = new Set<string>();
  return ranges.map(({ items, forms }, i) => {
    const candidates: MakerPhoto[] = [
      ...items.flatMap((item) => (item.imageUrl ? [{ src: item.imageUrl, caption: item.name }] : [])),
      ...forms.flatMap((form) => {
        const media = FORM_MEDIA[form];
        return media ? [{ src: media.src, position: media.position, caption: formLabel(form) }] : [];
      }),
    ];
    const picked: MakerPhoto[] = [];
    for (const photo of candidates) {
      if (picked.length >= (perMaker[i] ?? 1)) break;
      if (used.has(photo.src)) continue;
      used.add(photo.src);
      picked.push(photo);
    }
    return picked;
  });
}

/**
 * The featured manufacturers on /brands: one lead maker given a large,
 * photograph-led card, two more set beside it as horizontal cards with their
 * images on alternating sides. Each card's name is its one link, stretched
 * over the card; category chips sit above it as their own links.
 */
export function FeaturedMakers({ makers }: { makers: FeaturedMaker[] }) {
  const [lead, ...others] = makers;
  if (!lead) return null;

  return (
    <div className={cn("grid gap-5 lg:gap-6", others.length > 0 && "lg:grid-cols-12")}>
      <Reveal as="div" y={22} className={cn(others.length > 0 && "lg:col-span-7 lg:row-span-2")}>
        <LeadCard maker={lead} />
      </Reveal>
      {others.map((maker, i) => (
        <Reveal key={maker.brand.slug} as="div" y={22} delay={0.1 + i * 0.08} className="lg:col-span-5">
          <SideCard maker={maker} flip={i % 2 === 1} />
        </Reveal>
      ))}
    </div>
  );
}

const cardFrame =
  "group relative isolate h-full overflow-hidden rounded-[1.75rem] border border-line-soft bg-paper shadow-soft transition-[border-color,box-shadow,transform] duration-500 ease-premium hover:-translate-y-1 hover:border-forest/25 hover:shadow-lift";

function TitleLink({ maker, className }: { maker: FeaturedMaker; className?: string }) {
  return (
    <Link
      href={`/brands/${maker.brand.slug}`}
      className={cn(
        "transition-colors duration-300 before:absolute before:inset-0 before:z-0 before:content-[''] group-hover:text-forest",
        className,
      )}
    >
      {maker.brand.name}
    </Link>
  );
}

function Caption({ children }: { children: string }) {
  return (
    <span className="absolute bottom-4 left-4 z-10 max-w-[calc(100%-2rem)] truncate rounded-full bg-paper/92 px-3 py-1.5 text-[0.75rem] font-medium text-ink shadow-soft backdrop-blur-sm">
      {children}
    </span>
  );
}

function Explore({ name }: { name: string }) {
  return (
    <span aria-hidden className="inline-flex items-center gap-2 text-sm font-semibold text-forest">
      Explore {name}
      <span className="grid size-8 place-items-center rounded-full bg-forest text-cream transition-transform duration-400 ease-premium group-hover:translate-x-1">
        <ArrowRight className="size-4" />
      </span>
    </span>
  );
}

function CategoryChips({ maker, limit }: { maker: FeaturedMaker; limit: number }) {
  if (maker.categories.length === 0) return null;
  return (
    <ul aria-label={`${maker.brand.name} by category`} className="relative z-10 flex flex-wrap gap-2">
      {maker.categories.slice(0, limit).map((category) => (
        <li key={category.slug}>
          <Link
            href={`/brands/${maker.brand.slug}?category=${encodeURIComponent(category.slug)}`}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-line-soft bg-canvas px-3 text-[0.8125rem] text-ink transition-colors hover:border-forest/40 hover:text-forest"
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
  );
}

function LeadCard({ maker }: { maker: FeaturedMaker }) {
  const [main, inset] = maker.photos;

  return (
    <article className={cn(cardFrame, "flex flex-col")}>
      <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[22rem] lg:flex-1">
        {main ? (
          <>
            <DepthImage
              src={main.src}
              position={main.position}
              sizes="(min-width: 1024px) 760px, 100vw"
              preload
              className="absolute inset-0"
              imageClassName="transition-transform duration-[1.2s] ease-premium group-hover:scale-[1.03]"
            />
            <Caption>{main.caption}</Caption>
          </>
        ) : (
          <div className="absolute inset-0 bg-sage-wash" />
        )}

        {/* A second photograph set into the corner, overlapping the copy below:
            the card's one asymmetric gesture. */}
        {inset ? (
          <div className="absolute right-5 -bottom-12 z-10 hidden aspect-[4/5] w-32 overflow-hidden rounded-2xl shadow-lift ring-[5px] ring-paper sm:block lg:right-8 lg:w-40">
            <Image
              src={inset.src}
              alt=""
              fill
              sizes="160px"
              style={inset.position ? { objectPosition: inset.position } : undefined}
              className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.05]"
            />
            <span className="sr-only">{inset.caption}</span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex items-start gap-4 sm:pr-40 lg:pr-48">
          {maker.brand.logoUrl ? <BrandMark name={maker.brand.name} logoUrl={maker.brand.logoUrl} size="md" /> : null}
          <div>
            <p className="dh-eyebrow text-muted-ink">
              {maker.origin ? `${maker.origin} · ` : null}Widest range
            </p>
            <h3 className="mt-2 font-display text-4xl leading-none tracking-tight text-ink sm:text-5xl">
              <TitleLink maker={maker} />
            </h3>
            <p className="mt-2.5 text-sm font-semibold text-forest">{countLabel(maker.brand.productCount)} in stock</p>
          </div>
        </div>
        <p className="max-w-md text-[0.9375rem] leading-relaxed text-muted-ink">{maker.summary}</p>
        <CategoryChips maker={maker} limit={4} />
        <div className="pt-1">
          <Explore name={maker.brand.name} />
        </div>
      </div>
    </article>
  );
}

function SideCard({ maker, flip }: { maker: FeaturedMaker; flip: boolean }) {
  const [photo] = maker.photos;

  return (
    <article className={cn(cardFrame, "grid grid-cols-[40%_1fr] sm:grid-cols-[44%_1fr]", flip && "grid-cols-[1fr_40%] sm:grid-cols-[1fr_44%]")}>
      <div className={cn("relative min-h-56 sm:min-h-64", flip && "order-last")}>
        {photo ? (
          <>
            <DepthImage
              src={photo.src}
              position={photo.position}
              sizes="(min-width: 1024px) 260px, 44vw"
              speed={-6}
              className="absolute inset-0"
              imageClassName="transition-transform duration-[1.2s] ease-premium group-hover:scale-[1.04]"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-sage-wash" />
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3 p-5 sm:p-7">
        <p className="dh-eyebrow truncate text-muted-ink">{maker.origin ?? "Manufacturer"}</p>
        <h3 className="font-display text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
          <TitleLink maker={maker} />
        </h3>
        <p className="text-[0.8125rem] font-semibold text-forest">{countLabel(maker.brand.productCount)}</p>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-ink">{maker.summary}</p>
        {photo ? <p className="text-xs text-muted-ink/80">Pictured: {photo.caption.toLowerCase()}</p> : null}
        <div className="mt-auto pt-2">
          <Explore name={maker.brand.name} />
        </div>
      </div>
    </article>
  );
}
