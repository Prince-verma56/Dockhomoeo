import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Reveal } from "@/components/shared/Reveal";
import { PageHead, HeadStats } from "@/components/shared/PageHead";
import { DemoContentNotice } from "@/components/shared/DemoContentNotice";
import { RisePanel } from "@/components/shared/RisePanel";
import { DepthImage } from "@/components/shared/DepthImage";
import { brandOrigin } from "@/components/commerce/BrandCard";
import { describeForms, describeNames, getBrandDirectory } from "@/lib/catalogue";
import { BrandDirectory } from "@/sections/brands/BrandDirectory";
import { FeaturedMakers, pickMakerPhotos, type FeaturedMaker } from "@/sections/brands/FeaturedMakers";
import { SCENE_MEDIA } from "@/data/media";

const DESCRIPTION =
  "Explore every homoeopathic manufacturer we stock on DocHomoeo, with the full product range we carry from each. Search by name, browse A–Z, or discover brands by health concern.";

export const metadata: Metadata = {
  title: "Shop by brand",
  description: DESCRIPTION,
  alternates: { canonical: "/brands" },
  openGraph: {
    title: "Shop by brand · DocHomoeo",
    description: DESCRIPTION,
    url: "/brands",
    type: "website",
  },
};

/** How many brands get the editorial featured treatment. */
const FEATURED_COUNT = 3;

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export default async function BrandsPage() {
  const [brands, home] = await Promise.all([getBrandDirectory(), repositories.home.getHomeData()]);

  // "Featured" means the brands with the widest range — a verifiable fact, not
  // an editorial ranking. Ties broken alphabetically for stability.
  const featured = [...brands]
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name))
    .slice(0, FEATURED_COUNT);
  const featuredSlugs = new Set(featured.map((brand) => brand.slug));

  // One listing per brand: forms for the index line; the featured makers also
  // use its products (for photographs) and categories.
  const ranges = await Promise.all(
    brands.map((brand) =>
      repositories.search.search({
        brand: [brand.slug],
        sort: "popular",
        pageSize: featuredSlugs.has(brand.slug) ? 24 : 1,
      }),
    ),
  );
  const rangeOf = new Map(brands.map((brand, i) => [brand.slug, ranges[i]]));

  const formLines = Object.fromEntries(
    brands.map((brand, i) => {
      const forms = ranges[i].facets.forms.map((form) => form.value);
      return [brand.slug, forms.length ? capitalise(describeForms(forms)) : ""];
    }),
  );

  const featuredRanges = featured.map((brand) => rangeOf.get(brand.slug)!);
  const photos = pickMakerPhotos(
    featuredRanges.map((range) => ({ items: range.items, forms: range.facets.forms.map((form) => form.value) })),
  );

  const makers: FeaturedMaker[] = featured.map((brand, i) => {
    const { facets } = featuredRanges[i];
    const forms = facets.forms.map((form) => form.value);
    const categories = facets.categories.map((category) => ({
      name: category.name,
      slug: category.slug,
      count: category.count,
    }));
    const summary = [
      forms.length ? capitalise(describeForms(forms)) : null,
      categories.length ? `for ${describeNames(categories.map((category) => category.name))}` : null,
    ]
      .filter(Boolean)
      .join(" ");
    return {
      brand,
      origin: brandOrigin(brand.slug),
      summary: summary ? `${summary}.` : "",
      categories,
      photo: photos[i],
    };
  });

  const productTotal = brands.reduce((sum, brand) => sum + brand.productCount, 0);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 overflow-x-clip bg-canvas">
        <PageHead
          id="brands-heading"
          crumbs={[{ name: "Brands", href: "/brands" }]}
          eyebrow="Authentic manufacturers"
          animate
          title={
            <>
              Discover <span className="pe-[0.06em] italic text-forest-deep">trusted</span> makers.
            </>
          }
          description="Licensed homoeopathic laboratories, and the full range of remedies we carry from each."
          aside={
            <HeadStats
              items={[
                [brands.length, brands.length === 1 ? "manufacturer" : "manufacturers"],
                [productTotal, "remedies stocked"],
              ]}
            />
          }
          overlap={makers.length > 0}
        />

        {makers.length > 0 ? (
          <section aria-labelledby="featured-brands" className="dh-overlap-up">
            <Container>
              <h2 id="featured-brands" className="sr-only">
                Featured manufacturers
              </h2>
              <FeaturedMakers makers={makers} />
            </Container>
          </section>
        ) : null}

        {/* The index rises from the canvas and tucks under the cards above,
            then settles back into the canvas after the health concerns. */}
        <RisePanel aria-labelledby="brand-directory" tuck={makers.length > 0} settle className="dh-section-b">
          <Container>
            <BrandDirectory brands={brands} ranges={formLines} headingId="brand-directory" />
          </Container>

          {home.categories.length > 0 ? (
            <Container className="mt-(--dh-space-section)">
              <section
                aria-labelledby="brands-goals"
                className="grid overflow-hidden rounded-[1.5rem] border border-line-soft bg-paper shadow-soft lg:grid-cols-2"
              >
                <DepthImage
                  src={SCENE_MEDIA.apothecary.src}
                  position={SCENE_MEDIA.apothecary.position}
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="aspect-video lg:aspect-auto lg:h-full lg:min-h-96"
                />
                <Reveal as="div" y={14} className="dh-pad-card-lg flex flex-col justify-center">
                  <Eyebrow rule>Across every maker</Eyebrow>
                  <h2 id="brands-goals" className="dh-title-section mt-3 text-ink">
                    Or start from a health concern
                  </h2>
                  <p className="dh-body mt-2.5">
                    See remedies for one concern side by side, whichever laboratory makes them.
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {home.categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={`/products?category=${encodeURIComponent(category.slug)}`}
                          className="inline-flex h-10 items-center gap-2 rounded-full border border-line-soft bg-canvas px-4 text-sm text-ink transition-colors hover:border-forest/40 hover:text-forest"
                        >
                          {category.name}
                          <span className="text-xs text-muted-ink">
                            {category.productCount}
                            <span className="sr-only"> products</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/categories"
                    className="group mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-forest transition-colors hover:text-forest-deep"
                  >
                    All categories
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Reveal>
              </section>
            </Container>
          ) : null}
        </RisePanel>
      </main>
      <DemoContentNotice />
      <SiteFooter />
    </>
  );
}
