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
import { PageHead, HeadStats } from "@/components/shared/PageHead";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { DemoContentNotice } from "@/components/shared/DemoContentNotice";
import { RisePanel } from "@/components/shared/RisePanel";
import { DepthImage } from "@/components/shared/DepthImage";
import { CategoryCard } from "@/components/commerce/CategoryCard";
import { ProductCard } from "@/components/commerce/ProductCard";
import { SearchCombobox } from "@/components/search/SearchCombobox";
import { OrbitalImageWheel, type OrbitalImageWheelItem } from "@/components/unlumen-ui/primitives/orbital-image-wheel";
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
const productCount = (count: number) => `${count} ${count === 1 ? "product" : "products"}`;

/** After the featured category, this many get the large card; the rest are compact. */
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

  const formItems: OrbitalImageWheelItem[] = forms.map((form) => ({
    id: form.value,
    label: formLabel(form.value),
    href: productHref({ form: form.value }),
    src: FORM_MEDIA[form.value]?.src,
    position: FORM_MEDIA[form.value]?.position,
    meta: productCount(form.count),
  }));

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 overflow-x-clip bg-canvas">
        <PageHead
          id="categories-heading"
          crumbs={[{ name: "Categories", href: "/categories" }]}
          animate
          title={
            <>
              Find your <span className="pe-[0.06em] italic text-forest-deep">natural care.</span>
            </>
          }
          description="Browse remedies by the health concern they are used for, by category, or by the form you prefer."
          aside={
            <HeadStats
              items={[
                [categories.length, "categories"],
                [productTotal, "products"],
                [forms.length, "forms"],
              ]}
            />
          }
          overlap={Boolean(featured)}
        />

        {/* Featured category: the photograph, with the copy panel set over its edge. */}
        {featured ? (
          <section aria-labelledby="featured-category" className="dh-overlap-up">
            <Container>
              <div className="relative grid lg:grid-cols-12 lg:items-center">
                <div className="relative lg:col-span-8 lg:col-start-1 lg:row-start-1">
                  {featuredMedia?.kind === "photo" ? (
                    <DepthImage
                      src={featuredMedia.src}
                      position={featuredMedia.position}
                      sizes="(min-width: 1024px) 880px, 100vw"
                      preload
                      speed={-8}
                      className="aspect-4/3 rounded-[1.75rem] shadow-lift sm:aspect-16/10 lg:aspect-auto lg:h-[30rem]"
                    />
                  ) : (
                    <div className="dh-study relative aspect-4/3 overflow-hidden rounded-[1.75rem] sm:aspect-16/10 lg:aspect-auto lg:h-[30rem]">
                      {featuredMedia ? (
                        <Image src={featuredMedia.src} alt="" fill preload sizes="(min-width: 1024px) 880px, 100vw" className="object-contain p-[6%]" />
                      ) : null}
                    </div>
                  )}
                </div>

                <Reveal
                  as="div"
                  y={20}
                  delay={0.1}
                  className="dh-pad-card-lg relative z-10 mx-4 -mt-14 rounded-[1.5rem] border border-line-soft bg-paper shadow-float sm:mx-8 sm:-mt-20 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:mx-0 lg:mt-0"
                >
                  <Eyebrow rule>Most stocked concern</Eyebrow>
                  <h2 id="featured-category" className="dh-title-page mt-4 text-ink">
                    {featured.name}
                  </h2>
                  <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-line-soft py-4">
                    {[
                      [featured.productCount, featured.productCount === 1 ? "product" : "products"],
                      [featured.forms.length, featured.forms.length === 1 ? "form" : "forms"],
                      [featured.brands.length, featured.brands.length === 1 ? "maker" : "makers"],
                    ].map(([value, label]) => (
                      <div key={String(label)} className="flex flex-col-reverse gap-0.5">
                        <dt className="dh-meta">{label}</dt>
                        <dd className="font-display text-2xl leading-none text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="dh-body mt-4">
                    {capitalise(describeForms(featured.forms))}, from {describeNames(featured.brands)}.
                  </p>

                  {featured.forms.length > 1 ? (
                    <ul aria-label={`Shop ${featured.name} by form`} className="mt-4 flex flex-wrap gap-2">
                      {featured.forms.map((form) => (
                        <li key={form}>
                          <Link
                            href={productHref({ category: featured.slug, form })}
                            className="inline-flex h-9 items-center rounded-full border border-line-soft bg-canvas px-3.5 text-[0.8125rem] font-medium text-ink transition-colors hover:border-forest/40 hover:text-forest"
                          >
                            {formLabel(form)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <Button asChild variant="brand" size="xl" className="mt-6">
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

        {/* The rest: the next two most stocked at 16:10, the others as 4:3 tiles. */}
        {rest.length > 0 ? (
          <section aria-labelledby="all-categories" className="dh-section">
            <Container>
              <SectionHeader
                id="all-categories"
                eyebrow="By health concern"
                title="All categories"
                action={<p className="dh-meta">{categories.length} with products</p>}
              />

              {prominent.length > 0 ? (
                <Reveal as="ul" stagger=":scope > li" y={20} className={cn("grid gap-5 lg:gap-6", prominent.length > 1 && "md:grid-cols-2")}>
                  {prominent.map((category) => (
                    <li key={category.slug}>
                      <CategoryCard category={category} variant="feature" />
                    </li>
                  ))}
                </Reveal>
              ) : null}

              {compact.length > 0 ? (
                <Reveal as="ul" stagger=":scope > li" y={16} className="mt-5 grid grid-cols-2 gap-4 lg:mt-6 lg:grid-cols-4 lg:gap-6">
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

        {/* Forms: an orbit that turns form by form as the page scrolls, then
            releases; a plain rail on phones, short screens and reduced motion. */}
        {forms.length > 0 ? (
          <RisePanel aria-labelledby="by-form" tone="sage" settle className="dh-section-t pb-(--dh-space-section-sm)">
            <Container>
              <SectionHeader
                id="by-form"
                eyebrow="Shop by form"
                title="Browse by form"
                description="Already know how you take your remedies? Start there."
                className="mb-0"
              />
            </Container>
            <OrbitalImageWheel
              label="Dosage forms"
              items={formItems}
              actionLabel="Shop {label}"
              fallback={
                <Container className="mt-(--dh-space-head)">
                  <FormRail items={formItems} />
                </Container>
              }
            />
          </RisePanel>
        ) : null}

        {featured && featuredProducts && featuredProducts.items.length > 0 ? (
          <section aria-labelledby="featured-products" className="dh-section-b pt-(--dh-space-section-sm)">
            <Container>
              <SectionHeader
                id="featured-products"
                eyebrow="From the featured category"
                title={`Shop ${featured.name}`}
                action={
                  <Link
                    href={productHref({ category: featured.slug })}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-forest-deep"
                  >
                    View all {featured.productCount}
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                }
              />
              <Reveal as="ul" stagger=":scope > li" y={18} className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
                {featuredProducts.items.map((item) => (
                  <li key={item.id}>
                    <ProductCard product={mapApiCardToProduct(item)} />
                  </li>
                ))}
              </Reveal>
            </Container>
          </section>
        ) : null}

        <section aria-labelledby="category-search" className="dh-section-b">
          <Container>
            <div className="flex flex-col gap-5 border-t border-line-soft pt-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <div>
                <h2 id="category-search" className="dh-title-block text-ink">
                  Know what you are looking for?
                </h2>
                <p className="dh-meta mt-1.5">Search by medicine name, brand or health concern.</p>
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

/** The forms as a swipeable rail (phones) or a five-up row: the orbit's fallback. */
function FormRail({ items }: { items: OrbitalImageWheelItem[] }) {
  return (
    <ul className="dh-no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:px-0">
      {items.map((item) => (
        <li key={item.id} className="w-[62%] shrink-0 snap-start sm:w-[36%] lg:w-auto">
          <Link href={item.href} className="group block">
            <div className="relative aspect-4/5 overflow-hidden rounded-[1.25rem] bg-sage-wash shadow-soft transition-shadow duration-500 group-hover:shadow-lift">
              {item.src ? (
                <Image
                  src={item.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 250px, 62vw"
                  style={item.position ? { objectPosition: item.position } : undefined}
                  className="object-cover transition-transform duration-[1.2s] ease-premium group-hover:scale-[1.05]"
                />
              ) : (
                <span className="grid h-full place-items-center p-4 text-center font-display text-lg text-forest-deep">{item.label}</span>
              )}
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-3 px-1">
              <p className="text-[0.9375rem] font-semibold text-ink transition-colors group-hover:text-forest">{item.label}</p>
              <p className="dh-meta shrink-0">{item.meta}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
