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
import { SplitHeading } from "@/components/shared/SplitHeading";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { DemoContentNotice } from "@/components/shared/DemoContentNotice";
import { RisePanel } from "@/components/shared/RisePanel";
import { DepthImage } from "@/components/shared/DepthImage";
import { CategoryCard } from "@/components/commerce/CategoryCard";
import { ProductCard } from "@/components/commerce/ProductCard";
import { SearchCombobox } from "@/components/search/SearchCombobox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mapApiCardToProduct } from "@/lib/adapters/product";
import { describeNames, describeForms, getCategoryDirectory } from "@/lib/catalogue";
import { formLabel } from "@/lib/search/searchState";
import { FORM_MEDIA, categoryMedia } from "@/data/media";

const DESCRIPTION =
  "Browse homoeopathic medicines by health concern, by category, or by the form you prefer — drops, tablets, mother tinctures, creams and more.";

export const metadata: Metadata = {
  title: "Shop by category",
  description: DESCRIPTION,
  alternates: { canonical: "/categories" },
  openGraph: { title: "Shop by category · DocHomoeo", description: DESCRIPTION, url: "/categories", type: "website" },
};

const productHref = (params: Record<string, string>) => `/products?${new URLSearchParams(params)}`;

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** After the featured category, this many get the large image-led card; the rest are compact. */
const PROMINENT_COUNT = 2;

export default async function CategoriesPage() {
  const [categories, catalogue] = await Promise.all([
    getCategoryDirectory(),
    repositories.search.search({ pageSize: 1 }),
  ]);
  const [featured, ...rest] = categories;
  const featuredProducts = featured
    ? await repositories.search.search({ category: featured.slug, sort: "popular", pageSize: 4 })
    : null;
  const prominent = rest.slice(0, PROMINENT_COUNT);
  const compact = rest.slice(PROMINENT_COUNT);
  const forms = catalogue.facets.forms;
  const productTotal = catalogue.total;
  const featuredMedia = featured ? categoryMedia(featured.slug, featured.imageUrl) : null;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 overflow-x-clip bg-canvas">
        {/* Page head: the featured category's photograph sits across its arc. */}
        <section aria-labelledby="categories-heading" className="dh-head-arc dh-head-arc--overlap pt-28 sm:pt-32">
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
              <Reveal as="dl" y={14} delay={0.22} start="top 95%" className="flex divide-x divide-forest/15 text-sm text-muted-ink">
                {[
                  [categories.length, "categories"],
                  [productTotal, "products"],
                  [forms.length, "forms"],
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

        {/* Featured category: a full photograph with the copy set over its edge. */}
        {featured ? (
          <section aria-labelledby="featured-category" className="dh-overlap-up">
            <Container>
              <div className="relative grid lg:grid-cols-12 lg:items-center">
                <div className="relative lg:col-span-8 lg:col-start-1 lg:row-start-1">
                  {featuredMedia?.kind === "photo" ? (
                    <DepthImage
                      src={featuredMedia.src}
                      position={featuredMedia.position}
                      sizes="(min-width: 1024px) 900px, 100vw"
                      preload
                      speed={-10}
                      className="aspect-[4/3] rounded-[1.75rem] shadow-lift sm:aspect-[16/10] lg:aspect-auto lg:h-[34rem]"
                    />
                  ) : (
                    <div className="dh-study relative aspect-[4/3] overflow-hidden rounded-[1.75rem] sm:aspect-[16/10] lg:aspect-auto lg:h-[34rem]">
                      {featuredMedia ? (
                        <Image src={featuredMedia.src} alt="" fill preload sizes="(min-width: 1024px) 900px, 100vw" className="object-contain p-[6%]" />
                      ) : null}
                    </div>
                  )}
                </div>

                <Reveal
                  as="div"
                  y={24}
                  delay={0.12}
                  className="relative z-10 mx-4 -mt-16 flex flex-col gap-5 rounded-[1.5rem] border border-line-soft bg-paper p-6 shadow-float sm:mx-10 sm:-mt-24 sm:p-9 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:mx-0 lg:mt-0 lg:p-10"
                >
                  <Eyebrow rule>Most stocked concern</Eyebrow>
                  <h2 id="featured-category" className="font-display text-4xl leading-none tracking-tight text-ink sm:text-5xl">
                    {featured.name}
                  </h2>
                  <dl className="grid grid-cols-3 gap-3 border-y border-line-soft py-4 text-xs text-muted-ink">
                    {[
                      [featured.productCount, featured.productCount === 1 ? "product" : "products"],
                      [featured.forms.length, featured.forms.length === 1 ? "form" : "forms"],
                      [featured.brands.length, featured.brands.length === 1 ? "maker" : "makers"],
                    ].map(([value, label]) => (
                      <div key={String(label)} className="flex flex-col-reverse">
                        <dt>{label}</dt>
                        <dd className="font-display text-2xl text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-[0.9375rem] leading-relaxed text-muted-ink">
                    {capitalise(describeForms(featured.forms))}, from {describeNames(featured.brands)}.
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
                </Reveal>
              </div>
            </Container>
          </section>
        ) : null}

        {/* Every other category: the next most stocked large and image-led,
            the rest compact. */}
        {rest.length > 0 ? (
          <section aria-labelledby="all-categories" className="pt-16 pb-16 lg:pt-24 lg:pb-24">
            <Container>
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <Eyebrow>By health concern</Eyebrow>
                  <h2 id="all-categories" className="mt-1.5 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                    All categories
                  </h2>
                </div>
                <p className="text-sm text-muted-ink">{categories.length} with products</p>
              </div>

              {prominent.length > 0 ? (
                <Reveal
                  as="ul"
                  stagger=":scope > li"
                  y={22}
                  className={cn("grid gap-5 lg:gap-6", prominent.length > 1 && "md:grid-cols-12")}
                >
                  {prominent.map((category, index) => (
                    <li key={category.slug} className={cn(prominent.length > 1 && (index === 0 ? "md:col-span-7" : "md:col-span-5"))}>
                      <CategoryCard category={category} variant="feature" />
                    </li>
                  ))}
                </Reveal>
              ) : null}

              {compact.length > 0 ? (
                <Reveal
                  as="ul"
                  stagger=":scope > li"
                  y={16}
                  className="mt-5 grid gap-4 sm:grid-cols-2 lg:mt-6 lg:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] lg:gap-5"
                >
                  {compact.map((category) => (
                    <li key={category.slug}>
                      <CategoryCard category={category} variant="compact" />
                    </li>
                  ))}
                </Reveal>
              ) : null}
            </Container>
          </section>
        ) : null}

        {/* Forms rise on a sage surface that settles back into the canvas. */}
        {forms.length > 0 ? (
          <RisePanel aria-labelledby="by-form" tone="sage" settle className="pt-14 pb-20 lg:pt-20 lg:pb-28">
            <Container>
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-xl">
                  <Eyebrow>Shop by form</Eyebrow>
                  <h2 id="by-form" className="mt-1.5 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                    Browse by form
                  </h2>
                </div>
                <p className="text-muted-ink">Already know how you take your remedies? Start there.</p>
              </div>
              {/* A swipeable rail on phones, one row from large screens up. */}
              <Reveal
                as="ul"
                stagger=":scope > li"
                y={18}
                className="dh-no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0"
              >
                {forms.map((form, index) => {
                  const media = FORM_MEDIA[form.value];
                  return (
                    <li key={form.value} className={cn("w-[58%] shrink-0 snap-start sm:w-[34%] lg:w-auto", index % 2 === 1 && "lg:mt-10")}>
                      <Link href={productHref({ form: form.value })} className="group block">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-paper shadow-soft transition-shadow duration-500 group-hover:shadow-lift">
                          {media ? (
                            <Image
                              src={media.src}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 250px, 58vw"
                              style={media.position ? { objectPosition: media.position } : undefined}
                              className="object-cover transition-transform duration-[1.2s] ease-premium group-hover:scale-[1.05]"
                            />
                          ) : null}
                        </div>
                        <div className="flex items-baseline justify-between gap-3 px-1 pt-3">
                          <p className="text-[0.9375rem] font-semibold text-ink transition-colors group-hover:text-forest">
                            {formLabel(form.value)}
                          </p>
                          <p className="shrink-0 text-xs text-muted-ink">
                            {form.count} {form.count === 1 ? "product" : "products"}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </Reveal>
            </Container>
          </RisePanel>
        ) : null}

        {/* Featured category products */}
        {featured && featuredProducts && featuredProducts.items.length > 0 ? (
          <section aria-labelledby="featured-products" className="pb-14 lg:pb-20">
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

        {/* Search, as a closing line rather than another card. */}
        <section aria-labelledby="category-search" className="pb-16 lg:pb-24">
          <Container>
            <div className="flex flex-col gap-5 border-t border-line-soft pt-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <div>
                <h2 id="category-search" className="font-display text-2xl tracking-tight text-ink">
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
