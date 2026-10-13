import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Reveal } from "@/components/shared/Reveal";
import { ClipReveal } from "@/components/shared/ClipReveal";
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

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-ivory">
        <section aria-labelledby="categories-heading" className="pt-24 pb-10 sm:pt-28 lg:pb-12">
          <Container>
            <PageBreadcrumb items={[{ name: "Categories", href: "/categories" }]} className="mb-6" />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <SplitHeading
                  as="h1"
                  id="categories-heading"
                  immediate
                  className="text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
                  lines={[<span key="line">Find your <span className="italic text-forest-deep">natural care.</span></span>]}
                />
                <p className="mt-4 text-base leading-relaxed text-muted-ink sm:text-lg">
                  Browse remedies by the health concern they are used for, by category, or by the
                  form you prefer.
                </p>
              </div>
              <dl className="flex gap-8 text-sm text-muted-ink">
                {[
                  [categories.length, "categories"],
                  [productTotal, "products"],
                  [forms.length, "forms"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="sr-only">{label}</dt>
                    <dd>
                      <span className="block font-display text-3xl text-ink">{value}</span>
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Container>
        </section>

        {featured ? (
          <section aria-labelledby="featured-category" className="pb-12 lg:pb-16">
            <Container>
              <div className="grid overflow-hidden rounded-frame border border-line/70 bg-cream lg:grid-cols-[1.05fr_1fr]">
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
                            className="inline-flex min-h-9 items-center rounded-full border border-line bg-ivory px-3.5 text-[0.8125rem] font-medium text-ink transition-colors hover:border-forest/35 hover:text-forest"
                          >
                            {formLabel(form)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Button asChild variant="brand" size="xl" className="mt-2 w-fit">
                    <Link href={productHref({ category: featured.slug })}>
                      Shop {featured.name}
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                </div>
                <ClipReveal from="right" className="relative min-h-65 bg-[#f2f2f1] sm:min-h-85">
                  {featured.imageUrl ? (
                    <Image
                      src={featured.imageUrl}
                      alt=""
                      fill
                      priority
                      sizes="(min-width: 1024px) 640px, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                </ClipReveal>
              </div>
            </Container>
          </section>
        ) : null}

        {rest.length > 0 ? (
          <section aria-labelledby="all-categories" className="pb-14 lg:pb-20">
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

        {forms.length > 0 ? (
          <section aria-labelledby="by-form" className="border-y border-line/60 bg-cream py-12 lg:py-16">
            <Container>
              <div className="mb-6 max-w-xl">
                <h2 id="by-form" className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
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
                        className="group block overflow-hidden rounded-card border border-line/70 bg-ivory transition-[border-color,box-shadow] duration-300 hover:border-forest/25 hover:shadow-soft"
                      >
                        <div className="relative aspect-square overflow-hidden bg-cream-sunk">
                          {media ? (
                            <Image
                              src={media.src}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 240px, 44vw"
                              style={media.position ? { objectPosition: media.position } : undefined}
                              className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.05]"
                            />
                          ) : null}
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

        {featured && featuredProducts && featuredProducts.items.length > 0 ? (
          <section aria-labelledby="featured-products" className="py-12 lg:py-16">
            <Container>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <Eyebrow>From the featured category</Eyebrow>
                  <h2 id="featured-products" className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">
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

        <section aria-labelledby="category-search" className="pb-14 lg:pb-20">
          <Container>
            <div className="flex flex-col gap-5 rounded-frame border border-line/70 bg-cream p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
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


