import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/Section";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Parallax } from "@/components/shared/Parallax";
import { Reveal } from "@/components/shared/Reveal";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { ProductGlyph } from "@/components/commerce/ProductGlyph";
import { featuredCollections } from "@/data/mock/home";

/**
 * Featured collection, by dosage form.
 *
 * Distinct from the bestsellers grid: four tall product stages set on a zigzag
 * baseline, each drifting at its own parallax rate. The staggered offsets and
 * the differing speeds are what make the row read as a still life with depth
 * rather than four cards in a line (brain/11_ANIMATION_SPEC.md, pattern C).
 */

/** Alternating vertical offsets and parallax rates, by index. */
const RHYTHM = [
  { offset: "lg:mt-10", speed: -7 },
  { offset: "lg:mt-0", speed: -12 },
  { offset: "lg:mt-12", speed: -5 },
  { offset: "lg:mt-3", speed: -10 },
] as const;

export function FeaturedCollection() {
  return (
    <Section
      tone="ivory"
      labelledBy="collection-heading"
      space="none"
      className="py-16 md:py-20"
    >
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:items-center lg:gap-14 xl:gap-20">
          <div>
            <SectionHeading
              id="collection-heading"
              eyebrow="Featured collection"
              size="md"
              lines={["Nature's Care", "In Every Form"]}
              description="Explore our most trusted formulations, grouped by how you prefer to take them."
              action={
                <Button asChild variant="brand" size="pill">
                  <Link href="/products">
                    Shop All Products
                    <ArrowRight className="size-4" strokeWidth={1.8} />
                  </Link>
                </Button>
              }
            />
          </div>

          <Reveal
            stagger="[data-collection]"
            className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4"
          >
            {featuredCollections.map((collection, index) => {
              const rhythm = RHYTHM[index % RHYTHM.length];

              return (
                <div
                  key={collection.id}
                  data-collection
                  className={rhythm.offset}
                >
                  <Parallax speed={rhythm.speed} minWidth={1024}>
                    <Link
                      href={`/products?form=${collection.form}`}
                      className="group block"
                    >
                      <MediaPlaceholder
                        label={collection.mediaLabel}
                        tone={index % 2 === 0 ? "cream" : "sage"}
                        ratio="aspect-[4/5]"
                        className="rounded-frame transition-transform duration-500 ease-premium group-hover:-translate-y-2"
                      >
                        <ProductGlyph
                          form={collection.form}
                          tone={collection.tone}
                          size="md"
                        />
                      </MediaPlaceholder>

                      <div className="mt-4">
                        <h3 className="font-display text-[1.25rem] text-ink transition-colors group-hover:text-forest">
                          {collection.name}
                        </h3>
                        <p className="mt-1.5 text-[0.8125rem] leading-snug text-muted-ink">
                          {collection.tagline}
                        </p>
                        <p className="dh-eyebrow mt-3 text-muted-ink/75">
                          {collection.productCount}+ products
                        </p>
                      </div>
                    </Link>
                  </Parallax>
                </div>
              );
            })}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
