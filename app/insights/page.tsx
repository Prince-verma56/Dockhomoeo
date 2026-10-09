import { Metadata } from "next";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { InsightCard } from "@/components/content/InsightCard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Health Insights | DocHomoeo",
  description: "Explore our editorial health knowledge hub. Discover trusted homoeopathic remedies and wellness tips.",
};

export default async function InsightsPage(props: { searchParams: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams;
  const categoryFilter = searchParams.category;

  const allInsightsData = await repositories.insight.getInsights(1, 100);
  const categories = Array.from(
    new Set(allInsightsData.items.map((item) => item.category?.name).filter(Boolean))
  ) as string[];

  const pageData = await repositories.insight.getInsights(1, 12, categoryFilter);
  const items = pageData.items;

  const featuredInsight = items[0];
  const gridInsights = items.slice(1);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[#f6f2ea]">
        <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 border-b border-forest-abyss/5">
          <Container width="wide" className="relative z-10">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center space-x-2 text-sm font-medium text-muted-ink">
              <Link href="/" className="hover:text-forest-deep transition-colors">Home</Link>
              <ChevronRight className="size-4" />
              <span className="text-ink">Insights</span>
            </nav>
            
            <div className="max-w-4xl">
              <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-forest-deep/20 bg-forest-deep/5 px-4 py-1.5 text-sm font-bold tracking-wide text-forest-deep uppercase">
                <Sparkles className="size-4" />
                Editorial Hub
              </div>
              <h1 className="font-display text-5xl leading-tight tracking-tight text-ink sm:text-6xl md:text-7xl">
                Health <span className="italic text-forest-deep">Insights</span>
              </h1>
              <p className="mt-6 text-xl leading-relaxed text-muted-ink">
                Trusted editorial knowledge covering natural wellness, homoeopathy, and family health. Read expert advice to support your wellness journey.
              </p>
            </div>
          </Container>
          <div className="absolute top-0 right-0 -z-10 h-full w-full max-w-2xl bg-gradient-to-bl from-forest-deep/10 to-transparent blur-3xl opacity-60" />
        </section>

        <section className="py-12 md:py-16">
          <Container width="wide">
            {categories.length > 0 && (
              <div className="mb-12 flex flex-wrap items-center gap-3">
                <Link
                  href="/insights"
                  className={cn(
                    "rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300",
                    !categoryFilter
                      ? "bg-forest-abyss text-white shadow-md"
                      : "bg-white text-ink hover:bg-forest-deep/10 border border-forest-abyss/10"
                  )}
                >
                  All Topics
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/insights?category=${cat}`}
                    className={cn(
                      "rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300",
                      categoryFilter?.toLowerCase() === cat.toLowerCase()
                        ? "bg-forest-abyss text-white shadow-md"
                        : "bg-white text-ink hover:bg-forest-deep/10 border border-forest-abyss/10"
                    )}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-12 md:gap-20">
              {featuredInsight && (
                <div className="w-full">
                  <InsightCard insight={featuredInsight} isFeatured />
                </div>
              )}

              {gridInsights.length > 0 && (
                <div className="w-full">
                  <div className="mb-10">
                    <h2 className="font-display text-4xl text-ink">Latest Articles</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                    {gridInsights.map((insight) => (
                      <InsightCard key={insight.id} insight={insight} />
                    ))}
                  </div>
                </div>
              )}
              
              {items.length === 0 && (
                <div className="py-32 text-center rounded-[2rem] bg-white border border-forest-abyss/5">
                  <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-forest-abyss/5 text-forest-abyss/20">
                    <BookOpen className="size-10" />
                  </div>
                  <h3 className="font-display text-3xl text-ink mb-2">No insights found</h3>
                  <p className="text-lg text-muted-ink">Try selecting a different topic to explore more content.</p>
                </div>
              )}
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="py-24 text-center border-t border-forest-abyss/5 bg-forest-abyss">
          <Container width="narrow">
            <h2 className="mb-6 font-display text-4xl text-white">
              Apply what you've learned
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-white/70">
              Discover trusted homoeopathic remedies organized by the health goals discussed in our insights.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-2xl bg-white text-forest-abyss hover:bg-[#f6f2ea] h-14 px-10 text-lg font-bold">
                <Link href="/products">
                  Shop Remedies
                  <ArrowRight className="ml-3 size-5" />
                </Link>
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
