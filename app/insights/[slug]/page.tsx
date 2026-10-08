import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { InsightCard } from "@/components/content/InsightCard";
import { ArrowLeft } from "lucide-react";

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
      <main id="main" className="flex-1 bg-ivory">
        <article>
          {/* Article Header */}
          <header className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-forest-abyss/5">
            <Container width="narrow" className="relative z-10 text-center">
              <Link
                href="/insights"
                className="mb-10 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-forest-abyss/60 transition-colors hover:text-leaf-800 uppercase"
              >
                <ArrowLeft className="size-4" />
                Back to Insights
              </Link>

              {insight.category && (
                <div className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-leaf-700">
                  {insight.category.name}
                </div>
              )}
              
              <h1 className="font-display text-4xl leading-tight text-forest-abyss sm:text-5xl md:text-6xl lg:text-7xl">
                {insight.title}
              </h1>
              
              <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-forest-abyss/70 md:text-2xl">
                {insight.excerpt}
              </p>

              <div className="mt-12 flex items-center justify-center gap-4 text-sm font-medium text-forest-abyss/60">
                {insight.authorName && (
                  <span className="text-forest-abyss/90">By {insight.authorName}</span>
                )}
                {formattedDate && (
                  <>
                    <span className="size-1.5 rounded-full bg-forest-abyss/20" />
                    <span>{formattedDate}</span>
                  </>
                )}
              </div>
            </Container>
            {/* Subtle header background */}
            <div className="absolute top-0 left-1/2 -z-10 h-full w-full max-w-4xl -translate-x-1/2 bg-gradient-to-b from-sage-100/40 to-transparent blur-3xl opacity-50" />
          </header>

          {/* Hero Image */}
          {insight.coverImageUrl && (
            <div className="bg-ivory -mt-8 relative z-20">
              <Container width="wide">
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[2rem] bg-[#F0F2EB] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-forest-abyss/5">
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

          <div className="py-16 md:py-24 bg-white relative z-10">
            <Container width="narrow">
              {/* Article Body */}
              <div 
                className="text-lg leading-[1.8] text-forest-abyss/80 [&>h2]:mt-16 [&>h2]:mb-6 [&>h2]:font-display [&>h2]:text-4xl [&>h2]:text-forest-abyss [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:font-display [&>h3]:text-2xl [&>h3]:text-forest-abyss [&>p]:mb-8 [&>ul]:mb-8 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-3 [&>a]:text-leaf-800 [&>a]:font-medium [&>a]:underline hover:[&>a]:text-leaf-700 max-w-3xl mx-auto"
                dangerouslySetInnerHTML={{ __html: insight.content }}
              />

              {/* Author Bio */}
              {insight.authorBio && (
                <div className="mt-20 rounded-[2rem] bg-[#F0F2EB] p-8 sm:p-12 flex flex-col sm:flex-row items-center sm:items-start gap-8 border border-forest-abyss/5">
                  {insight.authorImageUrl ? (
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-sm">
                      <Image src={insight.authorImageUrl} alt={insight.authorName || "Author"} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex size-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-sage-200 text-3xl font-display text-forest-abyss/60 shadow-sm">
                      {insight.authorName ? insight.authorName[0] : "A"}
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <h4 className="font-display text-2xl text-forest-abyss mb-3">{insight.authorName}</h4>
                    <p className="text-forest-abyss/70 leading-relaxed text-lg">{insight.authorBio}</p>
                  </div>
                </div>
              )}
            </Container>
          </div>
        </article>

        {/* Related Content */}
        {related && related.items.length > 0 && (
          <section className="py-20 md:py-32 bg-ivory border-t border-forest-abyss/5">
            <Container width="wide">
              <div className="mb-12 flex items-center justify-between border-b border-forest-abyss/10 pb-6">
                <h3 className="font-display text-3xl md:text-4xl text-forest-abyss">Read Next</h3>
                <Link href="/insights" className="text-sm font-semibold uppercase tracking-wider text-forest-abyss hover:text-leaf-800 transition-colors">
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
