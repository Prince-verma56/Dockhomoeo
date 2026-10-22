import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/Section";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { repositories } from "@/lib/repositories";
import { unstable_rethrow } from "next/navigation";
import LightboxGrid, { type LightboxImage } from "@/components/kokonutui/lightbox-grid";

const IMAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "/Images/Editorial/eucalyptus-dropper-bottle.webp": { width: 1024, height: 1024 },
  "/Images/Editorial/chamomilla-pellet-bottle.webp": { width: 1024, height: 1024 },
  "/Images/NaturesCareBG.webp": { width: 1672, height: 941 },
  "/Images/Editorial/massage-oil-bottle.webp": { width: 1024, height: 1024 },
  "/Images/Editorial/arnica-cream-tube.webp": { width: 1024, height: 1024 },
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

const BASE_COLLECTIONS: {
  form: string;
  name: string;
  tagline: string;
  src: string;
  position?: string;
  facetKeys: string[];
}[] = [
  {
    form: "drops",
    name: "Drops & Dilutions",
    tagline: "Natural healing in every drop",
    src: "/Images/Editorial/eucalyptus-dropper-bottle.webp",
    facetKeys: ["drops", "dilution", "dilutions"],
  },
  {
    form: "tablets",
    name: "Tablets & Pellets",
    tagline: "Easy care for daily wellness",
    src: "/Images/Editorial/chamomilla-pellet-bottle.webp",
    facetKeys: ["tablets", "tablet", "pellets", "pellet"],
  },
  {
    form: "tinctures",
    name: "Mother Tinctures",
    tagline: "Pure botanical extracts for deeper support",
    src: "/Images/NaturesCareBG.webp",
    position: "40% 60%",
    facetKeys: ["mother tincture", "tincture", "tinctures"],
  },
  {
    form: "creams",
    name: "Creams & Ointments",
    tagline: "Gentle care for skin and topical relief",
    src: "/Images/Editorial/arnica-cream-tube.webp",
    facetKeys: ["cream", "creams", "ointment", "ointments"],
  },
  {
    form: "oil",
    name: "Massage Oils",
    tagline: "Therapeutic herbal oils for relief",
    src: "/Images/Editorial/massage-oil-bottle.webp",
    facetKeys: ["oil", "oils", "massage oil"],
  },
];

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

  const facetMap = new Map<string, number>();
  for (const facet of catalogue?.facets.forms ?? []) {
    facetMap.set(facet.value.toLowerCase().trim(), facet.count);
  }

  const cards: FormCard[] = BASE_COLLECTIONS.map((c) => {
    let count: number | null = null;
    let total = 0;
    let found = false;
    for (const key of c.facetKeys) {
      const val = facetMap.get(key.toLowerCase());
      if (val !== undefined) {
        total += val;
        found = true;
      }
    }
    if (found) count = total;

    return {
      form: c.form,
      name: c.name,
      tagline: c.tagline,
      count,
      src: c.src,
      position: c.position,
    };
  });

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
            className="max-w-xl"
          />

          {/* Right Header Alignment: Interactive Dosage Form Capsules & Shop CTA */}
          <Reveal y={16} delay={0.12} className="flex flex-col items-start lg:items-end gap-3.5 shrink-0 max-w-lg w-full lg:w-auto">
            {/* Quick Dosage Form Pills */}
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {cards.map((c) => (
                <Link
                  key={c.form}
                  href={`/products?form=${c.form}`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-white/85 px-3 py-1.5 text-xs font-medium text-forest hover:bg-forest hover:text-white transition-all duration-200 shadow-2xs backdrop-blur-xs"
                >
                  <span className="size-1.5 rounded-full bg-forest/40 group-hover:bg-white transition-colors" />
                  <span>{c.name}</span>
                  {c.count ? (
                    <span className="text-[10px] text-ink/45 group-hover:text-white/80 font-mono">
                      ({c.count})
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>

            {/* Bottom Row: Trust Guarantee + Primary CTA Button */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <span className="text-[11.5px] font-medium tracking-wide text-ink/50 uppercase hidden sm:inline-block">
                German & Indian Lab Standards
              </span>
              <Button asChild variant="brand" size="pill" className="w-fit shrink-0 shadow-xs">
                <Link href="/products">
                  Shop all products
                  <ArrowRight className="size-4" strokeWidth={1.8} />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal y={20}>
          <LightboxGrid items={items} />
        </Reveal>
      </Container>
    </Section>
  );
}
