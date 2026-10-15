import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/Section";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { DepthImage } from "@/components/shared/DepthImage";
import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";
import { repositories } from "@/lib/repositories";
import { formLabel } from "@/lib/search/searchState";
import { featuredCollections } from "@/data/mock/home";
import { FORM_MEDIA } from "@/data/media";

/** Lines for forms the curated collection does not cover. */
const FALLBACK_TAGLINES: Record<string, string> = {
  oil: "Massage oils for topical care",
};

type FormCard = {
  form: string;
  name: string;
  tagline: string | null;
  count: number;
  src: string;
  position?: string;
};

/**
 * Featured collection, by dosage form: the most stocked form as a tall lead
 * photograph, the next four in a two-by-two beside it. Names and counts come
 * from the catalogue's own form facets, so a "6 products" label is six
 * products; photographs and taglines from the curated collection.
 */
export async function FeaturedCollection() {
  const catalogue = await repositories.search.search({ pageSize: 1 });

  const cards: FormCard[] = catalogue.facets.forms.flatMap((facet) => {
    const curated = featuredCollections.find((collection) => collection.form === facet.value);
    const media = curated?.image
      ? { src: curated.image, position: curated.imagePosition }
      : FORM_MEDIA[facet.value];
    if (!media || facet.count === 0) return [];
    return [
      {
        form: facet.value,
        name: formLabel(facet.value),
        tagline: curated?.tagline ?? FALLBACK_TAGLINES[facet.value] ?? null,
        count: facet.count,
        src: media.src,
        position: media.position,
      },
    ];
  });

  const [lead, ...others] = cards;
  const rest = others.slice(0, 4);
  if (!lead) return null;

  return (
    <Section tone="ivory" labelledBy="collection-heading" space="none" className="py-16 md:py-22">
      <Container width="wide">
        <div className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="collection-heading"
            eyebrow="Featured collection"
            size="md"
            lines={["Nature's care,", "in every form."]}
            description="Remedies grouped by how you prefer to take them — from dilutions to ointments."
          />
          <Button asChild variant="brand" size="pill" className="w-fit shrink-0">
            <Link href="/products">
              Shop all products
              <ArrowRight className="size-4" strokeWidth={1.8} />
            </Link>
          </Button>
        </div>

        <Reveal
          stagger="[data-form-card]"
          y={20}
          className={cn("grid gap-4 sm:gap-5 lg:h-144", rest.length > 0 && "lg:grid-cols-12")}
        >
          <div data-form-card className="lg:col-span-5">
            <FormTile card={lead} lead />
          </div>
          {rest.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:col-span-7 lg:grid-rows-2">
              {rest.map((card, index) => (
                <div
                  key={card.form}
                  data-form-card
                  // An odd last tile spans the row rather than leaving a hole.
                  className={cn(rest.length % 2 === 1 && index === rest.length - 1 && "col-span-2")}
                >
                  <FormTile card={card} />
                </div>
              ))}
            </div>
          ) : null}
        </Reveal>
      </Container>
    </Section>
  );
}

function FormTile({ card, lead = false }: { card: FormCard; lead?: boolean }) {
  const media = lead ? (
    <DepthImage
      src={card.src}
      position={card.position}
      sizes="(min-width: 1024px) 560px, 100vw"
      speed={-8}
      className="absolute inset-0"
      imageClassName="transition-transform duration-[1.2s] ease-premium group-hover:scale-[1.04]"
    />
  ) : (
    <Image
      src={card.src}
      alt=""
      fill
      sizes="(min-width: 1024px) 380px, 50vw"
      style={card.position ? { objectPosition: card.position } : undefined}
      className="object-cover transition-transform duration-[1.2s] ease-premium group-hover:scale-[1.05]"
    />
  );

  return (
    <Link
      href={`/products?form=${card.form}`}
      className={cn(
        "group relative isolate block h-full overflow-hidden rounded-[1.5rem] bg-sage-wash shadow-soft transition-shadow duration-500 hover:shadow-lift",
        lead ? "aspect-4/3 sm:aspect-16/10 lg:aspect-auto" : "aspect-4/5 sm:aspect-4/3 lg:aspect-auto",
      )}
    >
      {media}
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-forest-abyss/80 via-forest-abyss/15 to-transparent" />

      <span className="absolute top-3.5 left-3.5 rounded-full bg-paper/92 px-2.5 py-1 text-[0.6875rem] font-semibold text-ink tabular-nums shadow-2xs backdrop-blur-sm sm:top-4 sm:left-4">
        {card.count} {card.count === 1 ? "product" : "products"}
      </span>

      <div className={cn("absolute inset-x-0 bottom-0 flex items-end justify-between gap-3", lead ? "p-6 sm:p-8" : "p-4 sm:p-5")}>
        <div className="min-w-0">
          <h3 className={cn("text-white", lead ? "dh-title-section" : "dh-title-card max-sm:text-[1rem]")}>{card.name}</h3>
          {card.tagline ? (
            <p className={cn("mt-1 text-white/80", lead ? "text-[0.9375rem]" : "hidden text-[0.8125rem] sm:block")}>
              {card.tagline}
            </p>
          ) : null}
        </div>
        <span
          aria-hidden
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-[background-color,color,transform] duration-300 group-hover:bg-white group-hover:text-forest-deep",
            lead ? "size-11" : "size-9",
          )}
        >
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
