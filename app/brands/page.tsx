import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Reveal } from "@/components/shared/Reveal";
import { SplitHeading } from "@/components/shared/SplitHeading";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
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
    featured.map((_, i) => (i === 0 ? 2 : 1)),
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
      photos: photos[i],
    };
  });

  const productTotal = brands.reduce((sum, brand) => sum + brand.productCount, 0);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 overflow-x-clip bg-canvas">
        {/* Page head: ends in a shallow arc that the featured makers sit across. */}
        <section aria-labelledby="brands-heading" className="dh-head-arc dh-head-arc--overlap pt-28 sm:pt-32">
          <Container>
            <PageBreadcrumb items={[{ name: "Brands", href: "/brands" }]} className="mb-6" />
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <Reveal as="div" y={10} start="top 95%">
                  <Eyebrow className="mb-3">Authentic manufacturers</Eyebrow>
                </Reveal>
                <SplitHeading
                  as="h1"
                  id="brands-heading"
                  immediate
                  className="text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
                  lines={[
                    <span key="line">
                      Discover <span className="italic text-forest-deep">trusted</span> makers.
                    </span>,
                  ]}
                />
                <Reveal
                  as="p"
                  y={12}
                  delay={0.16}
                  start="top 95%"
                  className="mt-4 max-w-xl text-base leading-relaxed text-muted-ink sm:text-lg"
                >
                  Licensed homoeopathic laboratories, and the full range of remedies we carry from each.
                </Reveal>
              </div>

              <Reveal
                as="dl"
                y={14}
                delay={0.24}
                start="top 95%"
                className="flex divide-x divide-forest/15 text-sm text-muted-ink"
              >
                {[
                  [brands.length, brands.length === 1 ? "manufacturer" : "manufacturers"],
                  [productTotal, "remedies stocked"],
                ].map(([value, label]) => (
                  <div key={String(label)} className="flex flex-col-reverse px-6 first:pl-0 last:pr-0">
                    <dt>{label}</dt>
                    <dd className="font-display text-3xl text-ink sm:text-4xl">{value}</dd>
                  </div>
                ))}
              </Reveal>
            </div>
          </Container>
        </section>

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
        <RisePanel aria-labelledby="brand-directory" tuck settle className="pb-20 lg:pb-28">
          <Container>
            <BrandDirectory brands={brands} ranges={formLines} headingId="brand-directory" />
          </Container>

          {home.categories.length > 0 ? (
            <Container className="mt-20 lg:mt-28">
              <section
                aria-labelledby="brands-goals"
                className="grid items-center gap-8 overflow-hidden rounded-[1.75rem] bg-paper shadow-soft lg:grid-cols-12 lg:gap-0"
              >
                <DepthImage
                  src={SCENE_MEDIA.apothecary.src}
                  position={SCENE_MEDIA.apothecary.position}
                  sizes="(min-width: 1024px) 620px, 100vw"
                  className="aspect-video lg:col-span-6 lg:aspect-auto lg:h-full lg:min-h-88"
                />
                <Reveal as="div" y={14} className="px-6 pb-8 sm:px-10 lg:col-span-6 lg:px-12 lg:py-12">
                  <Eyebrow rule>Across every maker</Eyebrow>
                  <h2 id="brands-goals" className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                    Or start from a health concern
                  </h2>
                  <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-muted-ink">
                    See remedies for one concern side by side, whichever laboratory makes them.
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {home.categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={`/products?category=${encodeURIComponent(category.slug)}`}
                          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line-soft bg-canvas px-4 text-sm text-ink transition-colors hover:border-forest/40 hover:text-forest"
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
                    className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-colors hover:text-forest-deep"
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
