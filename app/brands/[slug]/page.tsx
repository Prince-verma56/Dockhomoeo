import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { DemoContentNotice } from "@/components/shared/DemoContentNotice";
import { BrandCard } from "@/components/commerce/BrandCard";
import { RisePanel } from "@/components/shared/RisePanel";
import { cn } from "@/lib/utils";
import { describeForms, getBrandDirectory } from "@/lib/catalogue";
import {
  activeFilterCount,
  listingHref,
  parseSearchState,
  toSearchFilters,
  type SearchState,
} from "@/lib/search/searchState";
import { ResultCount } from "@/sections/listing/ProductResults";
import { BrandListing } from "@/sections/brands/BrandListing";

type Props = PageProps<"/brands/[slug]">;

/** Query keys that turn the brand page into a variation of itself. */
const REFINEMENTS = ["category", "form", "sort", "page"];

/** Shared by metadata and page within one request. */
const findBrand = cache(async (slug: string) => {
  const directory = await getBrandDirectory();
  return { brand: directory.find((b) => b.slug === slug) ?? null, directory };
});

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { brand } = await findBrand(slug);
  if (!brand) return { title: "Brand not found", robots: { index: false, follow: true } };

  const query = await searchParams;
  const refined = REFINEMENTS.some((key) => query[key] !== undefined);
  const noun = brand.productCount === 1 ? "product" : "products";
  const description = `Shop ${brand.productCount} ${brand.name} homoeopathic ${noun} on DocHomoeo, with filters by category and form.`;

  return {
    title: `${brand.name} homoeopathic medicines`,
    description,
    // Filtered, sorted and paged views are variations of this one page: they
    // stay out of the index, and only the plain page names itself canonical.
    ...(refined
      ? { robots: { index: false, follow: true } }
      : { alternates: { canonical: `/brands/${brand.slug}` } }),
    openGraph: {
      title: `${brand.name} · DocHomoeo`,
      description,
      url: `/brands/${brand.slug}`,
      type: "website",
    },
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { brand, directory } = await findBrand(slug);
  if (!brand) notFound();

  const state: SearchState = { ...parseSearchState(await searchParams), q: "", brand: [] };
  const result = await repositories.search.search({ ...toSearchFilters(state), q: undefined, brand: [brand.slug] });
  if (result.items.length === 0 && result.total > 0) {
    redirect(listingHref(`/brands/${brand.slug}`, { ...state, page: result.pageCount }));
  }

  const href = (patch: Partial<SearchState>) => listingHref(`/brands/${brand.slug}`, { ...state, ...patch, page: 1 });
  const categories = result.facets.categories;
  const forms = result.facets.forms.map((form) => form.value);
  const otherBrands = directory
    .filter((b) => b.slug !== brand.slug)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 4);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas">
        <section aria-labelledby="brand-heading" className="dh-head-arc pt-28 sm:pt-32">
          <Container>
            <PageBreadcrumb
              items={[
                { name: "Brands", href: "/brands" },
                { name: brand.name, href: `/brands/${brand.slug}` },
              ]}
              className="mb-6"
            />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <div className="flex items-center gap-5">
                <div>
                  <Eyebrow>Brand</Eyebrow>
                  <h1 id="brand-heading" className="mt-1 font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
                    {brand.name}
                  </h1>
                  <p role="status" className="mt-1 text-sm text-muted-ink">
                    <ResultCount result={result} filtered={activeFilterCount(state) > 0} />
                    {forms.length > 0 && activeFilterCount(state) === 0 ? (
                      <span className="first-letter:uppercase"> · {describeForms(forms)}</span>
                    ) : null}
                  </p>
                </div>
              </div>

              {categories.length > 1 ? (
                <nav aria-label={`${brand.name} by category`} className="lg:max-w-xl">
                  <ul className="flex flex-wrap gap-2 lg:justify-end">
                    {categories.map((category) => {
                      const active = state.category === category.slug;
                      return (
                        <li key={category.slug}>
                          <Link
                            href={href({ category: active ? null : category.slug })}
                            scroll={false}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 text-[0.8125rem] font-medium transition-colors",
                              active
                                ? "border-forest-deep bg-forest-deep text-cream"
                                : "border-line bg-cream text-ink hover:border-forest/35 hover:text-forest",
                            )}
                          >
                            {category.name}
                            <span className={cn("text-xs", active ? "text-cream/70" : "text-muted-ink")}>
                              {category.count}
                              <span className="sr-only"> products</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              ) : null}
            </div>
          </Container>
        </section>

        <BrandListing slug={brand.slug} brandName={brand.name} state={state} result={result} />

        {otherBrands.length > 0 ? (
          <RisePanel aria-labelledby="other-brands" settle className="pt-12 pb-14 lg:pt-14 lg:pb-20">
            <Container>
              <div className="mb-5 flex items-end justify-between gap-4">
                <h2 id="other-brands" className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
                  More brands
                </h2>
                <Link href="/brands" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-forest">
                  All brands
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {otherBrands.map((other) => (
                  <li key={other.slug}>
                    <BrandCard brand={other} />
                  </li>
                ))}
              </ul>
            </Container>
          </RisePanel>
        ) : null}
      </main>
      <DemoContentNotice />
      <SiteFooter />
    </>
  );
}
