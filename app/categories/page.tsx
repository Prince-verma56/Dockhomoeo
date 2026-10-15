import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Reveal } from "@/components/shared/Reveal";
import { SplitHeading } from "@/components/shared/SplitHeading";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { DemoContentNotice } from "@/components/shared/DemoContentNotice";
import { CategoryCard } from "@/components/commerce/CategoryCard";
import { ProductCard } from "@/components/commerce/ProductCard";
import { SearchCombobox } from "@/components/search/SearchCombobox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mapApiCardToProduct } from "@/lib/adapters/product";
import { describeNames, describeForms, getCategoryDirectory } from "@/lib/catalogue";
import { formLabel } from "@/lib/search/searchState";
import { FORM_MEDIA } from "@/data/media";

const DESCRIPTION =
  "Browse homoeopathic medicines by health concern, by category, or by the form you prefer — drops, tablets, mother tinctures, creams and more.";

export const metadata: Metadata = {
  title: "Shop by category",
  description: DESCRIPTION,
  alternates: { canonical: "/categories" },
  openGraph: { title: "Shop by category · DocHomoeo", description: DESCRIPTION, url: "/categories", type: "website" },
};

const productHref = (params: Record<string, string>) => `/products?${new URLSearchParams(params)}`;

/**
 * Tiles after the featured category sit in a four-column grid. Just enough
 * of them span two columns to fill the last row, so the directory never ends
 * on a half-empty line: 6 tiles → 2 wide, 5 → 3 wide, 7 → 1 wide.
 */
const wideTileCount = (count: number) => (4 - (count % 4)) % 4;

/** Map category slug to local botanical photograph for richer imagery */
const CATEGORY_PHOTOS: Record<string, string> = {
  "skin-care": "/Images/HealthGoals/skincare.webp",
  "skincare": "/Images/HealthGoals/skincare.webp",
  "digestive": "/Images/HealthGoals/digestive.webp",
  "digestion": "/Images/HealthGoals/digestive.webp",
  "immunity": "/Images/HealthGoals/immunity.webp",
  "hair-care": "/Images/HealthGoals/haircare.webp",
  "haircare": "/Images/HealthGoals/haircare.webp",
  "sleep-stress": "/Images/HealthGoals/sleep-stress.webp",
  "respiratory": "/Images/HealthGoals/respiratory.webp",
  "womens-health": "/Images/HealthGoals/womens-health.webp",
  "joint-bone": "/Images/HealthGoals/joint-bone.webp",
  "first-aid": "/Images/Products/boiron-arnica.webp",
  "body-care": "/Images/Products/bakson-arnica-oil.webp",
  "wellness": "/Images/HealthGoals/immunity.webp",
};

function categoryPhoto(slug: string, apiUrl: string | null): string | null {
  return apiUrl ?? CATEGORY_PHOTOS[slug] ?? null;
}

export default async function CategoriesPage() {
  const [categories, catalogue] = await Promise.all([
    getCategoryDirectory(),
    repositories.search.search({ pageSize: 1 }),
  ]);
  const [featured, ...rest] = categories;
  const featuredProducts = featured
    ? await repositories.search.search({ category: featured.slug, sort: "popular", pageSize: 4 })
    : null;
  const wide = wideTileCount(rest.length);
  const forms = catalogue.facets.forms;
  const productTotal = catalogue.total;

  const featuredPhoto = featured ? categoryPhoto(featured.slug, featured.imageUrl) : null;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas">

        {/* ── Section 1: Hero header — flows into canvas ─────────────────── */}
        <section aria-labelledby="categories-heading" className="dh-band-sage-flowing pt-28 sm:pt-32">
          <Container>
            <PageBreadcrumb items={[{ name: "Categories", href: "/categories" }]} className="mb-6" />
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <SplitHeading
                  as="h1"
                  id="categories-heading"
                  immediate
                  className="text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
                  lines={[<span key="line">Find your <span className="italic text-forest-deep">natural care.</span></span>]}
                />
                <Reveal as="p" y={12} delay={0.14} start="top 95%" className="mt-4 text-base leading-relaxed text-muted-ink sm:text-lg">
                  Browse remedies by the health concern they are used for, by category, or by the
                  form you prefer.
                </Reveal>
              </div>
              <Reveal as="dl" y={14} delay={0.22} start="top 95%" className="flex gap-8 text-sm text-muted-ink">
                {[
                  [categories.length, "categories"],
                  [productTotal, "products"],
                  [forms.length, "forms"],
                ].map(([value, label]) => (
                  <div key={String(label)}>
                    <dt className="sr-only">{label}</dt>
                    <dd>
                      <span className="block font-display text-3xl font-bold text-ink">{value}</span>
                      {label}
                    </dd>
                  </div>
                ))}
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ── Section 2: Featured Category — full editorial composition ──── */}
        {featured ? (
          <section aria-labelledby="featured-category" className="pt-2 pb-6 lg:pt-4 lg:pb-8">
            <Container>
              <Reveal as="div" y={14}>
                {/* 
                  Asymmetric two-pane card:
                  Left: rich copy with pill filters and CTA (60% width)
                  Right: full-bleed botanical photograph (40% width)
                  On mobile: stacked, image fills a generous 56vw-tall block.
                */}
                <div className="grid overflow-hidden rounded-2xl border border-line-soft bg-paper shadow-soft lg:grid-cols-[1.1fr_0.9fr]">

                  {/* Copy pane */}
                  <div className="flex flex-col justify-center gap-5 p-7 sm:p-10 lg:p-12">
                    <Eyebrow rule>Featured category</Eyebrow>
                    <h2 id="featured-category" className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
                      {featured.name}
                    </h2>
                    <p className="max-w-md text-base leading-relaxed text-muted-ink">
                      {featured.productCount} {featured.productCount === 1 ? "product" : "products"} across{" "}
                      {describeForms(featured.forms)}, from {describeNames(featured.brands)}.
                    </p>

                    {featured.forms.length > 1 ? (
                      <ul aria-label={`Shop ${featured.name} by form`} className="flex flex-wrap gap-2">
                        {featured.forms.map((form) => (
                          <li key={form}>
                            <Link
                              href={productHref({ category: featured.slug, form })}
                              className="inline-flex min-h-9 items-center rounded-full border border-line-soft bg-canvas px-3.5 text-[0.8125rem] font-medium text-ink transition-colors hover:border-forest/40 hover:text-forest"
                            >
                              {formLabel(form)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <Button asChild variant="brand" size="xl" className="mt-1 w-fit">
                      <Link href={productHref({ category: featured.slug })}>
                        Shop {featured.name}
                        <ArrowRight aria-hidden />
                      </Link>
                    </Button>
                  </div>

                  {/* Image pane — full bleed, covers the frame completely */}
                  <div className="relative min-h-64 overflow-hidden sm:min-h-80 lg:min-h-0">
                    {featuredPhoto ? (
                      <>
                        <Image
                          src={featuredPhoto}
                          alt=""
                          fill
                          priority
                          sizes="(min-width: 1024px) 560px, 100vw"
                          className="object-cover object-center"
                        />
                        {/* Subtle left-edge scrim so copy doesn't fight the image on smaller screens */}
                        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-paper/60 to-transparent lg:hidden" />
                      </>
                    ) : (
                      <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-sage-wash/80 to-sage-wash-deep/60">
                        <span className="font-display text-8xl font-black text-forest/10 select-none">
                          {featured.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </Reveal>
            </Container>
          </section>
        ) : null}

        {/* ── Section 3: All Categories Grid ────────────────────────────────
             Removed the separate "All categories" header for a seamless flow. */}
        {rest.length > 0 ? (
          <section aria-labelledby="all-categories" className="py-8 pb-14 lg:pb-20">
            <Container>
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 id="all-categories" className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
                  All categories
                </h2>
                <p className="text-sm text-muted-ink">{categories.length} with products</p>
              </div>
              <Reveal as="ul" stagger=":scope > li" y={18} className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                {rest.map((category, index) => (
                  <li key={category.slug} className={cn(index < wide && "col-span-2")}>
                    <CategoryCard category={category} variant={index < wide ? "wide" : "tile"} />
                  </li>
                ))}
              </Reveal>
            </Container>
          </section>
        ) : null}

        {/* ── Section 4: Browse by Form ──────────────────────────────────────
             Mist band with a gentle top blend. */}
        {forms.length > 0 ? (
          <section
            aria-labelledby="by-form"
            className="relative border-t border-line-soft/60 bg-mist py-14 lg:py-18"
          >
            {/* Soft blend from canvas into mist */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-canvas to-transparent"
            />
            <Container>
              <div className="mb-8 max-w-xl">
                <Eyebrow>Shop by form</Eyebrow>
                <h2 id="by-form" className="mt-1.5 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                  Browse by form
                </h2>
                <p className="mt-2 text-muted-ink">Already know how you take your remedies? Start there.</p>
              </div>
              {/* A swipeable rail on phones, one row from large screens up. */}
              <ul className="dh-no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0">
                {forms.map((form) => {
                  const media = FORM_MEDIA[form.value];
                  return (
                    <li key={form.value} className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-auto">
                      <Link
                        href={productHref({ form: form.value })}
                        className="group block overflow-hidden rounded-card border border-line-soft bg-paper transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-soft"
                      >
                        <div className="relative aspect-square overflow-hidden bg-sage-wash">
                          {media ? (
                            <Image
                              src={media.src}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 240px, 44vw"
                              style={media.position ? { objectPosition: media.position } : undefined}
                              className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.05]"
                            />
                          ) : (
                            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-sage-wash to-sage-wash-deep">
                              <span className="font-display text-4xl font-bold text-forest/20">{formLabel(form.value).charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-[0.9375rem] font-semibold text-ink transition-colors group-hover:text-forest">
                            {formLabel(form.value)}
                          </p>
                          <p className="text-xs text-muted-ink">
                            {form.count} {form.count === 1 ? "product" : "products"}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Container>
          </section>
        ) : null}

        {/* ── Section 5: Featured category products ────────────────────────── */}
        {featured && featuredProducts && featuredProducts.items.length > 0 ? (
          <section aria-labelledby="featured-products" className="relative py-14 lg:py-20 bg-canvas">
            {/* Soft blend from mist */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-mist to-transparent"
            />
            <Container>
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <Eyebrow>From the featured category</Eyebrow>
                  <h2 id="featured-products" className="mt-1.5 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                    Shop {featured.name}
                  </h2>
                </div>
                <Link
                  href={productHref({ category: featured.slug })}
                  className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-forest"
                >
                  View all {featured.productCount}
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <Reveal as="ul" stagger=":scope > li" y={18} className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                {featuredProducts.items.map((item) => (
                  <li key={item.id}>
                    <ProductCard product={mapApiCardToProduct(item)} />
                  </li>
                ))}
              </Reveal>
            </Container>
          </section>
        ) : null}

        {/* ── Section 6: Search call-to-action ─────────────────────────────── */}
        <section aria-labelledby="category-search" className="pb-16 lg:pb-24">
          <Container>
            <div className="flex flex-col gap-5 rounded-2xl border border-line-soft bg-paper p-6 shadow-soft sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <div>
                <h2 id="category-search" className="text-xl font-semibold text-ink">
                  Know what you are looking for?
                </h2>
                <p className="mt-1 text-sm text-muted-ink">Search by medicine name, brand or health concern.</p>
              </div>
              <SearchCombobox className="lg:max-w-md" />
            </div>
          </Container>
        </section>

      </main>
      <DemoContentNotice />
      <SiteFooter />
    </>
  );
}
