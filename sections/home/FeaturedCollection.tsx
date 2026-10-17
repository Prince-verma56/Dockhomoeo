import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/Section";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { repositories } from "@/lib/repositories";
import { formLabel } from "@/lib/search/searchState";
import { featuredCollections } from "@/data/mock/home";
import { FORM_MEDIA } from "@/data/media";
import { unstable_rethrow } from "next/navigation";
import LightboxGrid, { type LightboxImage } from "@/components/kokonutui/lightbox-grid";

/** Lines for forms the curated collection does not cover. */
const FALLBACK_TAGLINES: Record<string, string> = {
  oil: "Massage oils for topical care",
};

const IMAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "/Images/eucalyptus-dropper-bottle.webp": { width: 1024, height: 1024 },
  "/Images/chamomilla-pellet-bottle.webp": { width: 1024, height: 1024 },
  "/Images/NaturesCareBG.webp": { width: 1672, height: 941 },
  "/Images/massage-oil-bottle.webp": { width: 1024, height: 1024 },
  "/Images/arnica-cream-tube.webp": { width: 1024, height: 1024 },
};

type FormCard = {
  form: string;
  name: string;
  tagline: string | null;
  /** Null when the shop could not be asked: no number is shown rather than a made-up one. */
  count: number | null;
  src: string;
  position?: string;
};

/**
 * Featured collection, by dosage form: the most stocked form as a tall lead
 * photograph, the next four in a two-by-two beside it. Powered by Kokonut UI
 * LightboxGrid with seamless spring expansion, zero-drag image selection, and full-resolution view.
 */
export async function FeaturedCollection() {
  // Unreachable shop: the curated collections still show, without product counts.
  const catalogue = await repositories.search.search({ pageSize: 1 }).catch((error: unknown) => {
    unstable_rethrow(error);
    return null;
  });

  const curatedCards: FormCard[] = featuredCollections.flatMap((collection) =>
    collection.image
      ? [{ form: collection.form, name: formLabel(collection.form), tagline: collection.tagline, count: null, src: collection.image, position: collection.imagePosition }]
      : [],
  );

  const liveCards: FormCard[] = (catalogue?.facets.forms ?? []).flatMap((facet) => {
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

  const cards = liveCards.length > 0 ? liveCards : curatedCards;
  if (cards.length === 0) return null;

  const items: LightboxImage[] = cards.slice(0, 5).map((card) => {
    const dims = IMAGE_DIMENSIONS[card.src] ?? { width: 1200, height: 1200 };
    return {
      src: card.src,
      alt: card.name,
      width: dims.width,
      height: dims.height,
      name: card.name,
      form: card.form,
      tagline: card.tagline,
      count: card.count,
      position: card.position,
    };
  });

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

        <Reveal y={20}>
          <LightboxGrid items={items} />
        </Reveal>
      </Container>
    </Section>
  );
}
