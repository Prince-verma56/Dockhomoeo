import { Metadata } from "next";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { CategoryCard } from "@/components/commerce/CategoryCard";
import Link from "next/link";
import { ArrowRight, Pill, Droplet, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Categories | DocHomoeo",
  description: "Explore our wide range of homoeopathic product categories tailored to your health goals.",
};

export default async function CategoriesPage() {
  const homeData = await repositories.home.getHomeData();
  const { categories } = homeData;

  const featuredCategory = categories[0];
  const mediumCategories = categories.slice(1, 3);
  const smallCategories = categories.slice(3);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[#f6f2ea]">
        
        {/* Editorial Page Header */}
        <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
          <Container width="wide" className="relative z-10">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center space-x-2 text-sm font-medium text-muted-ink">
              <Link href="/" className="hover:text-forest-deep transition-colors">Home</Link>
              <ChevronRight className="size-4" />
              <span className="text-ink">Categories</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="font-display text-5xl leading-tight tracking-tight text-ink sm:text-6xl md:text-7xl">
                Curated <span className="italic text-forest-deep">Categories</span>
              </h1>
              <p className="mt-6 text-xl leading-relaxed text-muted-ink">
                Navigate our comprehensive catalog of trusted homoeopathic remedies, intelligently organized around your wellness journey and specific health goals.
              </p>
            </div>
          </Container>
          <div className="absolute top-0 right-0 -z-10 h-full w-full max-w-2xl bg-gradient-to-bl from-forest-deep/10 to-transparent blur-3xl opacity-60" />
        </section>

        <section className="pb-16 md:pb-24">
          <Container width="wide">
            <div className="flex flex-col gap-6 md:gap-8">
              
              {/* Featured category */}
              {featuredCategory && (
                <div className="w-full">
                  <CategoryCard category={featuredCategory} size="large" />
                </div>
              )}

              {/* Grid: 2 Medium, Rest Small */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {mediumCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} size="medium" />
                ))}
              </div>

              {smallCategories.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {smallCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} size="small" />
                  ))}
                </div>
              )}
            </div>
          </Container>
        </section>

        {/* Secondary Navigation Area (Browse by Form) */}
        <section className="py-20 md:py-28 bg-white">
          <Container width="narrow">
            <div className="rounded-[3rem] bg-[#f6f2ea] p-10 md:p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-forest-deep/5 via-transparent to-transparent opacity-60" />
              
              <div className="relative z-10">
                <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-[2rem] bg-white text-forest-deep shadow-sm">
                  <Pill className="size-10" />
                </div>
                <h2 className="mb-4 font-display text-4xl text-ink">Looking for specific forms?</h2>
                <p className="mx-auto mb-12 max-w-xl text-muted-ink leading-relaxed text-lg">
                  Sometimes you know exactly what format you prefer. Discover remedies sorted by their medicinal preparation for easier consumption.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {[
                    { label: "Drops", icon: Droplet },
                    { label: "Tablets", icon: Pill },
                    { label: "Tinctures", icon: Sparkles },
                    { label: "Creams", icon: Sparkles }
                  ].map((form) => (
                    <Link
                      key={form.label}
                      href={`/products?form=${form.label.toLowerCase()}`}
                      className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-ink shadow-sm transition-all hover:bg-forest-deep hover:text-white hover:shadow-md hover:-translate-y-1"
                    >
                      <form.icon className="size-5 text-forest-deep group-hover:text-white transition-colors" />
                      {form.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-24 text-center bg-forest-abyss">
          <Container width="narrow">
            <h2 className="mb-8 font-display text-4xl text-white">Not sure where to start?</h2>
            <Button asChild size="lg" className="rounded-2xl bg-white text-forest-abyss hover:bg-[#f6f2ea] h-14 px-10 text-lg font-bold">
              <Link href="/products">
                Shop all products
                <ArrowRight className="ml-3 size-5" />
              </Link>
            </Button>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
