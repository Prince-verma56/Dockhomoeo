import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { InsightCard } from "@/components/content/InsightCard";
import { ArrowLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const insight = await repositories.insight.getBySlug(params.slug);
  if (!insight) return { title: "Insight Not Found" };

  return {
    title: `${insight.seoTitle || insight.title} | DocHomoeo Insights`,
    description: insight.seoDescription || insight.excerpt,
    openGraph: insight.coverImageUrl ? { images: [insight.coverImageUrl] } : undefined,
  };
}

export default async function InsightDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const insight = await repositories.insight.getBySlug(params.slug);
  
  if (!insight) {
    notFound();
  }

  const related = await repositories.insight.getRelated(params.slug);

  const formattedDate = insight.publishedAt 
    ? new Intl.DateTimeFormat("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(insight.publishedAt))
    : null;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[#f6f2ea]">
        <article>
          {/* Article Header */}
          <header className="relative pt-28 pb-20 md:pt-36 md:pb-32 border-b border-forest-abyss/5">
            <Container width="narrow" className="relative z-10 text-center">
              {/* Breadcrumb */}
              <nav className="mb-10 flex items-center justify-center space-x-2 text-sm font-medium text-muted-ink">
                <Link href="/insights" className="hover:text-forest-deep transition-colors">Insights</Link>
                <ChevronRight className="size-4" />
                <Link href={`/insights?category=${insight.category?.name || "Topic"}`} className="hover:text-forest-deep transition-colors">
                  {insight.category?.name || "Topic"}
                </Link>
              </nav>
              
              <h1 className="font-display text-5xl leading-tight tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
                {insight.title}
              </h1>
              
              <p className="mx-auto mt-10 max-w-3xl text-xl leading-relaxed text-muted-ink md:text-2xl">
                {insight.excerpt}
              </p>

              <div className="mt-12 flex items-center justify-center gap-4 text-sm font-bold text-muted-ink uppercase tracking-widest">
                {insight.authorName && (
                  <span className="text-ink">By {insight.authorName}</span>
                )}
                {formattedDate && (
                  <>
                    <span className="size-1.5 rounded-full bg-forest-abyss/20" />
                    <span>{formattedDate}</span>
                  </>
                )}
              </div>
            </Container>
            <div className="absolute top-0 right-0 -z-10 h-full w-full max-w-3xl bg-gradient-to-bl from-forest-deep/10 to-transparent blur-3xl opacity-60" />
          </header>

          {/* Hero Image */}
          {insight.coverImageUrl && (
            <div className="bg-[#f6f2ea] -mt-12 relative z-20">
              <Container width="wide">
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[2rem] bg-forest-abyss/5 shadow-xl border border-forest-abyss/5">
                  <Image
                    src={insight.coverImageUrl}
                    alt={insight.title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              </Container>
            </div>
          )}

          <div className="py-20 md:py-32 bg-white relative z-10">
            <Container width="narrow">
              {/* Article Body */}
              <div 
                className="text-lg leading-[2] text-ink [&>h2]:mt-20 [&>h2]:mb-8 [&>h2]:font-display [&>h2]:text-4xl [&>h2]:text-ink [&>h3]:mt-12 [&>h3]:mb-6 [&>h3]:font-display [&>h3]:text-3xl [&>h3]:text-ink [&>p]:mb-8 [&>p]:text-muted-ink [&>ul]:mb-8 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-4 [&>ul>li]:text-muted-ink [&>a]:text-forest-deep [&>a]:font-bold [&>a]:underline hover:[&>a]:text-forest-abyss max-w-[720px] mx-auto"
                dangerouslySetInnerHTML={{ __html: insight.content }}
              />

              <hr className="my-16 border-forest-abyss/10 max-w-[720px] mx-auto" />

              {/* Author Bio */}
              {insight.authorBio && (
                <div className="rounded-[2rem] bg-[#f6f2ea] p-10 md:p-14 flex flex-col sm:flex-row items-center sm:items-start gap-8 border border-forest-abyss/5 max-w-[720px] mx-auto">
                  {insight.authorImageUrl ? (
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-sm">
                      <Image src={insight.authorImageUrl} alt={insight.authorName || "Author"} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex size-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-forest-deep/10 text-4xl font-display text-forest-deep shadow-sm">
                      {insight.authorName ? insight.authorName[0] : "A"}
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <h4 className="font-display text-3xl text-ink mb-3">{insight.authorName}</h4>
                    <p className="text-muted-ink leading-relaxed text-lg">{insight.authorBio}</p>
                  </div>
                </div>
              )}
            </Container>
          </div>
        </article>

        {/* Contextual CTA */}
        <section className="py-24 text-center border-t border-forest-abyss/5 bg-forest-abyss">
          <Container width="narrow">
            <h2 className="mb-6 font-display text-4xl text-white">
              Support Your {insight.category?.name || "Health"} Journey
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-white/70">
              Discover trusted homoeopathic remedies related to this topic.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-2xl bg-white text-forest-abyss hover:bg-[#f6f2ea] h-14 px-10 text-lg font-bold">
                <Link href={insight.category ? `/products?category=${insight.category.slug}` : "/products"}>
                  Explore Remedies
                  <ArrowRight className="ml-3 size-5" />
                </Link>
              </Button>
            </div>
          </Container>
        </section>

        {/* Related Content */}
        {related && related.items.length > 0 && (
          <section className="py-20 md:py-32 bg-[#f6f2ea] border-t border-forest-abyss/5">
            <Container width="wide">
              <div className="mb-16 flex items-end justify-between border-b border-forest-abyss/10 pb-6">
                <h3 className="font-display text-4xl md:text-5xl text-ink">Keep Reading</h3>
                <Link href="/insights" className="text-sm font-bold uppercase tracking-wider text-forest-deep hover:text-ink transition-colors pb-2">
                  View all &rarr;
                </Link>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                {related.items.map((item) => (
                  <InsightCard key={item.id} insight={item} />
                ))}
              </div>
            </Container>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
