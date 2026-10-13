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
import { BrandCard } from "@/components/commerce/BrandCard";
import { describeForms, describeNames, getBrandDirectory } from "@/lib/catalogue";
import { BrandDirectory } from "@/sections/brands/BrandDirectory";

const DESCRIPTION =
  "Explore every homoeopathic manufacturer we stock on DocHomeo, with the full product range we carry from each. Search by name, browse A–Z, or discover brands by health concern.";

export const metadata: Metadata = {
  title: "Shop by brand",
  description: DESCRIPTION,
  alternates: { canonical: "/brands" },
  openGraph: {
    title: "Shop by brand · DocHomeo",
    description: DESCRIPTION,
    url: "/brands",
    type: "website",
  },
};

/** How many brands get the roomy featured treatment. */
const FEATURED_COUNT = 3;

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
      <main id="main" className="flex-1 bg-ivory">

        {/* ── Section 1: Compact editorial header ─────────────────────── */}
        <section aria-labelledby="brands-heading" className="pt-24 pb-10 sm:pt-28 lg:pb-14">
          <Container>
            <PageBreadcrumb items={[{ name: "Brands", href: "/brands" }]} className="mb-6" />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <Reveal as="div" y={10} start="top 95%">
                  <Eyebrow className="mb-3">Our Manufacturers</Eyebrow>
                </Reveal>
                <SplitHeading
                  as="h1"
                  id="brands-heading"
                  immediate
                  className="text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
                  lines={[<span key="line">Discover <span className="italic text-forest-deep">trusted</span> brands.</span>]}
                />
                <Reveal as="p" y={12} delay={0.18} start="top 95%" className="mt-4 text-base leading-relaxed text-muted-ink sm:text-lg">
                  Explore manufacturers and the full product range we carry from each.
                </Reveal>
              </div>

              {/* Live stats derived from real data */}
              <Reveal as="dl" y={14} delay={0.28} start="top 95%" className="flex gap-8 text-sm text-muted-ink">
                {[
                  [brands.length, "brands"],
                  [productTotal, "products"],
                ].map(([value, label]) => (
                  <div key={label as string}>
                    <dt className="sr-only">{label}</dt>
                    <dd>
                      <span className="block font-display text-3xl text-ink">{value}</span>
                      {label}
                    </dd>
                  </div>
                ))}
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ── Section 2: Featured manufacturer showcase ─────────────────── */}
        {featured.length > 0 ? (
          <section aria-labelledby="featured-brands" className="pb-14 lg:pb-16">
            <Container>
              <Reveal as="div" y={10} className="mb-6">
                <Eyebrow>Widest ranges</Eyebrow>
                <h2
                  id="featured-brands"
                  className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl"
                >
                  Brands with the most products
                </h2>
              </Reveal>

              {/*
                Editorial featured composition:
                - If 3 brands: one larger primary card (col-span-2 on desktop) + two
                  side cards.
                - If 1–2 brands: equal-width grid.
                - The layout always uses real product thumbnails from the data.
              */}
              <Reveal
                as="ul"
                stagger=":scope > li"
                y={18}
                className={
                  featured.length >= 3
                    ? "grid gap-4 lg:grid-cols-5 lg:gap-5"
                    : "grid gap-4 md:grid-cols-2 lg:gap-5"
                }
              >
                {featured.map((brand, i) => {
                  const forms = ranges[i].facets.forms.map((f) => f.value);
                  const categories = ranges[i].facets.categories.map((c) => c.name);
                  const detail = [
                    forms.length ? describeForms(forms) : null,
                    categories.length ? `in ${describeNames(categories)}` : null,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  // Primary (first) card gets 2 of the 5 columns; the two side
                  // cards share the remaining 3 columns stacked.
                  const isPrimary = i === 0 && featured.length >= 3;
                  const isSecondary = i > 0 && featured.length >= 3;

                  return (
                    <li
                      key={brand.slug}
                      className={isPrimary ? "lg:col-span-2" : isSecondary ? "lg:col-span-3 first-of-type:lg:col-span-2" : ""}
                    >
                      <BrandCard
                        brand={brand}
                        variant="featured"
                        detail={detail}
                        thumbnails={brand.thumbnails}
                      />
                    </li>
                  );
                })}
              </Reveal>
            </Container>
          </section>
        ) : null}

        {/* ── Section 3 & 4: Browse all brands A–Z ─────────────────────── */}
        <section
          aria-labelledby="brand-directory"
          className="border-t border-line/60 bg-cream/50 py-12 lg:py-16"
        >
          <Container>
            <Reveal as="div" y={10} className="mb-6">
              <h2
                id="brand-directory"
                className="font-display text-3xl tracking-tight text-ink sm:text-4xl"
              >
                All brands A–Z
              </h2>
            </Reveal>
            <BrandDirectory brands={brands} />
          </Container>
        </section>

        {/* ── Section 5: Explore by health goal ────────────────────────── */}
        {home.categories.length > 0 ? (
          <section aria-labelledby="brands-goals" className="py-12 lg:py-16">
            <Container>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                <Reveal as="div" y={12} className="max-w-md">
                  <h2
                    id="brands-goals"
                    className="font-display text-2xl tracking-tight text-ink sm:text-3xl"
                  >
                    Or start from a health concern
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-ink">Every brand, narrowed to what you need.</p>
                </Reveal>
                <Reveal as="ul" stagger=":scope > li" y={10} className="flex flex-wrap gap-2 lg:justify-end">
                  {home.categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/products?category=${encodeURIComponent(category.slug)}`}
                        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-cream px-4 text-sm text-ink transition-colors hover:border-forest/35 hover:text-forest"
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
                      className="group inline-flex min-h-10 items-center gap-1.5 px-2 text-sm font-semibold text-forest"
                    >
                      All categories
                      <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
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
