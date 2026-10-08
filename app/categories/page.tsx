import { Metadata } from "next";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { CategoryCard } from "@/components/commerce/CategoryCard";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Categories | DocHomoeo",
  description: "Explore our wide range of homoeopathic product categories tailored to your health goals.",
};

export default async function CategoriesPage() {
  const homeData = await repositories.home.getHomeData();
  const { categories } = homeData;

  const featuredCategory = categories[0];
  const otherCategories = categories.slice(1);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-ivory">
        {/* Editorial Page Header */}
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 border-b border-forest-abyss/5">
          <Container width="wide" className="relative z-10 text-center">
            <h1 className="font-display text-5xl leading-tight tracking-tight text-forest-abyss sm:text-6xl md:text-7xl">
              Curated <span className="italic text-leaf-800">Categories</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-forest-abyss/70 sm:text-xl">
              Navigate our comprehensive catalog of trusted homoeopathic remedies organized intelligently around your wellness journey.
            </p>
          </Container>
          <div className="absolute top-0 left-1/2 -z-10 h-full w-full max-w-4xl -translate-x-1/2 bg-gradient-to-b from-sage-100/50 to-transparent blur-3xl opacity-50" />
        </section>

        <section className="py-16 md:py-24">
          <Container width="wide">
            <div className="flex flex-col gap-16 md:gap-24">
              
              {/* Featured category (if available) */}
              {featuredCategory && (
                <div className="w-full">
                  <div className="mb-8 flex items-center justify-between border-b border-forest-abyss/10 pb-4">
                    <h2 className="font-display text-2xl text-forest-abyss">Highlight Collection</h2>
                  </div>
                  <CategoryCard category={featuredCategory} isFeatured />
                </div>
              )}

              {/* Grid for remaining categories */}
              {otherCategories.length > 0 && (
                <div className="w-full">
                  <div className="mb-8 flex items-center justify-between border-b border-forest-abyss/10 pb-4">
                    <h2 className="font-display text-2xl text-forest-abyss">Explore Topics</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                    {otherCategories.map((category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Container>
        </section>

        {/* Secondary Navigation Area (Browse by Form) */}
        <section className="py-16 md:py-24 bg-white border-t border-forest-abyss/5">
          <Container width="narrow">
            <div className="rounded-[2rem] bg-[#F0F2EB] p-10 md:p-16 text-center">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white text-forest-abyss shadow-sm">
                <FileText className="size-8" />
              </div>
              <h2 className="mb-4 font-display text-3xl text-forest-abyss">Looking for specific forms?</h2>
              <p className="mx-auto mb-10 max-w-lg text-forest-abyss/70 leading-relaxed text-lg">
                Sometimes you know exactly what format you prefer. Discover remedies sorted by their medicinal preparation.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {["Drops", "Tablets", "Tincture", "Cream"].map((form) => (
                  <Link
                    key={form}
                    href={`/products?form=${form.toLowerCase()}`}
                    className="rounded-full bg-white px-6 py-3 text-sm font-medium text-forest-abyss shadow-sm transition-colors hover:bg-forest-abyss hover:text-white border border-forest-abyss/5"
                  >
                    {form}
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 md:py-24 text-center">
          <Container width="narrow">
            <h2 className="mb-8 font-display text-3xl text-forest-abyss">Not sure where to start?</h2>
            <Button asChild size="lg" className="rounded-full bg-forest-abyss text-white hover:bg-forest-abyss/90 h-14 px-8 text-base">
              <Link href="/products">
                Shop all products
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
