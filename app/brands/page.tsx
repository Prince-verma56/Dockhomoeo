import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Reveal } from "@/components/shared/Reveal";
import { SplitHeading } from "@/components/shared/SplitHeading";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { DemoContentNotice } from "@/components/shared/DemoContentNotice";
import { BrandCard } from "@/components/commerce/BrandCard";
import { describeForms, describeNames, getBrandDirectory } from "@/lib/catalogue";
import { BrandDirectory } from "@/sections/brands/BrandDirectory";
import { mockProducts } from "@/data/mock/products";

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

/** How many brands get the roomy editorial featured treatment. */
const FEATURED_COUNT = 3;

const FEATURED_THUMBNAILS: Record<string, string[]> = {
  sbl: [
    "/Images/Products/boiron-arnica.webp",
    "/Images/HealthGoals/joint-bone.webp",
    "/Images/HealthGoals/skincare.webp",
  ],
  "dr-reckeweg": [
    "/Images/Products/reckeweg-r41.webp",
    "/Images/HealthGoals/digestive.webp",
    "/Images/HealthGoals/respiratory.webp",
  ],
  bakson: [
    "/Images/Products/bakson-arnica-oil.webp",
    "/Images/HealthGoals/joint-bone.webp",
    "/Images/HealthGoals/haircare.webp",
  ],
  boiron: [
    "/Images/Products/boiron-arnica.webp",
    "/Images/HealthGoals/joint-bone.webp",
  ],
  "doc-homeo": [
    "/Images/HealthGoals/immunity.webp",
    "/Images/HealthGoals/sleep-stress.webp",
  ],
  lords: [
    "/Images/Products/lords-kali-phos.webp",
    "/Images/HealthGoals/sleep-stress.webp",
  ],
  schwabe: [
    "/Images/HealthGoals/digestive.webp",
    "/Images/HealthGoals/immunity.webp",
  ],
};

export default async function BrandsPage() {
  const [brands, home] = await Promise.all([getBrandDirectory(), repositories.home.getHomeData()]);

  // "Featured" means the brands with the widest range — a verifiable fact, not
  // an editorial ranking. Ties broken alphabetically for stability.
  const featured = [...brands]
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name))
    .slice(0, FEATURED_COUNT);

  // For each featured brand, get facets so we can describe their forms/categories.
  const ranges = await Promise.all(
    featured.map((brand) => repositories.search.search({ brand: [brand.slug], pageSize: 1 })),
  );

  const productTotal = brands.reduce((sum, brand) => sum + brand.productCount, 0);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas">

        {/* ── Section 1: Editorial Header — flows into the page canvas ──────── */}
        <section
          aria-labelledby="brands-heading"
          className="dh-band-sage-flowing pt-28 sm:pt-32"
        >
          <Container>
            <PageBreadcrumb items={[{ name: "Brands", href: "/brands" }]} className="mb-6" />
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <Reveal as="div" y={10} start="top 95%">
                  <Eyebrow className="mb-3">Authentic Manufacturers</Eyebrow>
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
                  className="mt-4 text-base leading-relaxed text-muted-ink sm:text-lg"
                >
                  Explore licensed homoeopathic laboratories and the full range of authentic remedies we carry from each.
                </Reveal>
              </div>

              {/* Verified catalogue metrics — now float on the sage band */}
              <Reveal
                as="div"
                y={14}
                delay={0.24}
                start="top 95%"
                className="grid grid-cols-3 gap-3 sm:flex sm:gap-4"
              >
                <div className="rounded-2xl border border-line-soft bg-paper/90 px-4 py-3 shadow-soft backdrop-blur-xs">
                  <span className="block font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {brands.length}
                  </span>
                  <span className="text-xs font-medium text-muted-ink">Verified makers</span>
                </div>
                <div className="rounded-2xl border border-line-soft bg-paper/90 px-4 py-3 shadow-soft backdrop-blur-xs">
                  <span className="block font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {productTotal}
                  </span>
                  <span className="text-xs font-medium text-muted-ink">Remedies in stock</span>
                </div>
                <div className="rounded-2xl border border-line-soft bg-paper/90 px-4 py-3 shadow-soft backdrop-blur-xs">
                  <span className="flex items-center gap-1 font-display text-2xl font-bold tracking-tight text-forest sm:text-3xl">
                    <ShieldCheck className="size-5 shrink-0 text-forest" /> 100%
                  </span>
                  <span className="text-xs font-medium text-muted-ink">Authentic sourcing</span>
                </div>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ── Section 2: Featured Editorial Manufacturer Showcase ──────────── */}
        {featured.length > 0 ? (
          <section aria-labelledby="featured-brands" className="py-14 lg:py-20">
            <Container>
              <Reveal as="div" y={10} className="mb-10">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                  <div>
                    <Eyebrow>Editorial Spotlight</Eyebrow>
                    <h2
                      id="featured-brands"
                      className="mt-1.5 font-display text-3xl tracking-tight text-ink sm:text-4xl"
                    >
                      Featured manufacturers
                    </h2>
                  </div>
                  <p className="text-sm text-muted-ink max-w-xs text-left sm:text-right">
                    Makers carrying our most comprehensive pharmacopoeia ranges
                  </p>
                </div>
              </Reveal>

              {/* Balanced 3-column editorial spotlight grid */}
              {featured.length >= 1 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.map((brand, i) => {
                    const forms = ranges[i].facets.forms.map((f) => f.value);
                    const categories = ranges[i].facets.categories.map((c) => c.name);
                    const detail = [
                      forms.length ? describeForms(forms) : null,
                      categories.length ? `in ${describeNames(categories)}` : null,
                    ]
                      .filter(Boolean)
                      .join(" ");
                    const brandThumbnails =
                      FEATURED_THUMBNAILS[brand.slug] ?? [];
                    return (
                      <Reveal key={brand.slug} as="div" y={18} delay={i * 0.08} className="h-full">
                        <BrandCard
                          brand={brand}
                          variant="featured"
                          detail={detail}
                          thumbnails={brandThumbnails}
                          className="h-full"
                        />
                      </Reveal>
                    );
                  })}
                </div>
              ) : null}
            </Container>
          </section>
        ) : null}

        {/* ── Section 3: Complete A–Z Manufacturer Directory ─────────────────
             Uses the mist band as a surface shift, but we soften the top border
             with a subtle inner fade so the white above and mist below blend. */}
        <section
          aria-labelledby="brand-directory"
          className="relative border-t border-line-soft/60 bg-mist py-14 lg:py-20"
        >
          {/* Soft blend from canvas into mist — no hard cut */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-canvas to-transparent"
          />
          <Container>
            <Reveal as="div" y={10} className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <Eyebrow>Complete Catalogue</Eyebrow>
                  <h2
                    id="brand-directory"
                    className="mt-1.5 font-display text-3xl tracking-tight text-ink sm:text-4xl"
                  >
                    All manufacturers A–Z
                  </h2>
                </div>
                <p className="text-sm text-muted-ink">
                  Filter by alphabet or search directly by brand name
                </p>
              </div>
            </Reveal>
            <BrandDirectory brands={brands} />
          </Container>
        </section>

        {/* ── Section 4: Explore by Health Concern ───────────────────────────
             Returns to the canvas surface, blends from mist above. */}
        {home.categories.length > 0 ? (
          <section
            aria-labelledby="brands-goals"
            className="relative py-14 lg:py-20 bg-canvas"
          >
            {/* Soft blend from mist into canvas */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-mist to-transparent"
            />
            <Container>
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
                <Reveal as="div" y={12} className="max-w-md">
                  <Eyebrow>Focused Discovery</Eyebrow>
                  <h2
                    id="brands-goals"
                    className="mt-1.5 font-display text-2xl tracking-tight text-ink sm:text-3xl"
                  >
                    Or start from a health concern
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-ink">
                    Discover remedies tailored by therapeutic goal across all manufacturers.
                  </p>
                </Reveal>
                <Reveal as="ul" stagger=":scope > li" y={10} className="flex flex-wrap gap-2 lg:justify-end">
                  {home.categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/products?category=${encodeURIComponent(category.slug)}`}
                        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line-soft bg-paper px-4 text-sm text-ink shadow-2xs transition-colors hover:border-forest/40 hover:text-forest"
                      >
                        {category.name}
                        <span className="text-xs text-muted-ink">
                          {category.productCount}
                          <span className="sr-only"> products</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/categories"
                      className="group inline-flex min-h-10 items-center gap-1.5 px-3 py-2 text-sm font-semibold text-forest hover:text-forest-deep transition-colors"
                    >
                      All categories
                      <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                </Reveal>
              </div>
            </Container>
          </section>
        ) : null}
      </main>
      <DemoContentNotice />
      <SiteFooter />
    </>
  );
}
