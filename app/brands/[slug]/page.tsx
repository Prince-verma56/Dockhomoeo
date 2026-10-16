import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { PageHead } from "@/components/shared/PageHead";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { BrandCard, brandOrigin } from "@/components/commerce/BrandCard";
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
      <main id="main" className="flex-1 overflow-x-clip bg-canvas">
        <PageHead
          id="brand-heading"
          crumbs={[
            { name: "Brands", href: "/brands" },
            { name: brand.name, href: `/brands/${brand.slug}` },
          ]}
          eyebrow={brandOrigin(brand.slug) ? `Brand · ${brandOrigin(brand.slug)}` : "Brand"}
          title={brand.name}
          description={
            <p role="status">
              <ResultCount result={result} filtered={activeFilterCount(state) > 0} />
              {forms.length > 0 && activeFilterCount(state) === 0 ? <> · {describeForms(forms)}</> : null}
            </p>
          }
          aside={
            categories.length > 1 ? (
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
                            "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[0.8125rem] font-medium transition-colors",
                            active
                              ? "border-forest-deep bg-forest-deep text-cream"
                              : "border-line bg-paper text-ink hover:border-forest/35 hover:text-forest",
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
            ) : null
          }
        />

        <BrandListing slug={brand.slug} brandName={brand.name} state={state} result={result} />

        {otherBrands.length > 0 ? (
          <RisePanel aria-labelledby="other-brands" settle className="dh-section-sm">
            <Container>
              <SectionHeader
                id="other-brands"
                size="block"
                title="More brands"
                action={
                  <Link href="/brands" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-forest">
                    All brands
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                }
              />
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
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
      <SiteFooter />
    </>
  );
}
