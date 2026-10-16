import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { InsightCard } from "@/components/content/InsightCard";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { SafeRichText } from "@/components/shared/SafeRichText";
import { Button } from "@/components/ui/button";
import { DepthImage } from "@/components/shared/DepthImage";
import { RisePanel } from "@/components/shared/RisePanel";
import { cn } from "@/lib/utils";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const insight = await repositories.insight.getBySlug(params.slug);
  if (!insight) return { title: "Article not found", robots: { index: false, follow: true } };

  // The shop's SEO title already carries the site name ("… | DocHomoeo"), so it
  // replaces the layout's template; a plain article title gets the template.
  const title = insight.seoTitle || insight.title;
  const description = insight.seoDescription || insight.excerpt || undefined;
  const url = `/insights/${insight.slug}`;
  return {
    title: insight.seoTitle ? { absolute: insight.seoTitle } : insight.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      ...(insight.publishedAt ? { publishedTime: insight.publishedAt } : {}),
      ...(insight.coverImageUrl ? { images: [insight.coverImageUrl] } : {}),
    },
  };
}

/** Minutes at ~220 words a minute, counted from the article's own text. */
function readingMinutes(content: string) {
  const words = content.replace(/<[^>]*>/g, " ").split(/s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export default async function InsightDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const insight = await repositories.insight.getBySlug(params.slug);

  if (!insight) {
    notFound();
  }

  const [related, remedies] = await Promise.all([
    repositories.insight.getRelated(params.slug),
    // Only point at a product category when the shop has products in it.
    insight.category ? repositories.search.search({ category: insight.category.slug, pageSize: 1 }) : null,
  ]);
  const remediesHref = insight.category && remedies && remedies.total > 0 ? `/products?category=${encodeURIComponent(insight.category.slug)}` : "/categories";

  const formattedDate = insight.publishedAt
    ? new Intl.DateTimeFormat("en-IN", { month: "long", day: "numeric", year: "numeric" }).format(new Date(insight.publishedAt))
    : null;
  const topicHref = insight.category ? `/insights?category=${encodeURIComponent(insight.category.slug)}` : "/insights";

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 overflow-x-clip bg-canvas">
        <article>
          <header className={cn("dh-head-arc dh-page-top", insight.coverImageUrl && "dh-head-arc--overlap")}>
            <Container width="narrow">
              <PageBreadcrumb
                items={[
                  { name: "Health insights", href: "/insights" },
                  ...(insight.category ? [{ name: insight.category.name, href: topicHref }] : []),
                  { name: insight.title, href: `/insights/${insight.slug}` },
                ]}
                className="mb-8"
              />
              <div className="max-w-3xl">
                {insight.category ? (
                  <Link href={topicHref} className="dh-eyebrow text-forest hover:underline">
                    {insight.category.name}
                  </Link>
                ) : null}
                <h1 className="dh-title-page mt-4 text-ink">
                  {insight.title}
                </h1>
                {insight.excerpt ? (
                  <p className="dh-lede mt-5">{insight.excerpt}</p>
                ) : null}
                <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-ink">
                  {insight.authorName ? <span className="font-medium text-ink">By {insight.authorName}</span> : null}
                  {formattedDate ? <time dateTime={insight.publishedAt ?? undefined}>{formattedDate}</time> : null}
                  <span>{readingMinutes(insight.content)} min read</span>
                </p>
              </div>
            </Container>
          </header>

          {insight.coverImageUrl ? (
            // The cover sits across the head's arc, drifting slightly inside its frame.
            <Container width="narrow" className="dh-overlap-up">
              <DepthImage
                src={insight.coverImageUrl}
                sizes="(max-width: 1100px) 100vw, 1040px"
                preload
                speed={-6}
                className="aspect-[16/8] w-full rounded-[1.75rem] bg-cream-sunk shadow-lift"
              />
            </Container>
          ) : null}

          <Container width="narrow" className="py-12 lg:py-16">
            <div className="mx-auto max-w-[42rem]">
              <SafeRichText
                content={insight.content}
                className="space-y-6 text-[1.0625rem] leading-[1.8] text-ink/85 [&_h2]:pt-6 [&_h2]:text-[1.75rem] [&_h3]:text-xl"
              />

              <aside className="mt-12 flex gap-3 rounded-2xl bg-sage-tint/60 p-5 text-sm leading-relaxed text-forest-deep">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                <p>
                  Health insights are general reading to help you prepare questions for a practitioner. They are not a
                  diagnosis or a substitute for professional medical advice.
                </p>
              </aside>

              {insight.authorBio ? (
                <div className="mt-8 flex flex-col items-center gap-6 rounded-[1.75rem] border border-line/70 bg-cream p-8 sm:flex-row sm:items-start">
                  {insight.authorImageUrl ? (
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-sm">
                      <Image src={insight.authorImageUrl} alt="" fill sizes="80px" className="object-cover" />
                    </div>
                  ) : null}
                  <div className="text-center sm:text-left">
                    <p className="font-display text-xl text-ink">{insight.authorName}</p>
                    <p className="mt-2 leading-relaxed text-muted-ink">{insight.authorBio}</p>
                  </div>
                </div>
              ) : null}

              <div className="mt-10 flex flex-col gap-3 border-t border-line/70 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/insights" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline">
                  <ArrowLeft aria-hidden className="size-4" />
                  All health insights
                </Link>
                <Button asChild variant="brand" size="xl">
                  <Link href={remediesHref}>
                    {remediesHref === "/categories" ? "Browse remedies by concern" : `Browse ${insight.category?.name.toLowerCase()} remedies`}
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </article>

        {related.items.length > 0 ? (
          <RisePanel aria-labelledby="keep-reading" settle className="pt-14 pb-16 lg:pt-20 lg:pb-24">
            <Container>
              <div className="mb-8 flex items-end justify-between gap-4">
                <h2 id="keep-reading" className="dh-title-section text-ink">
                  Keep reading
                </h2>
                <Link href="/insights" className="text-sm font-semibold text-forest hover:underline">
                  View all
                </Link>
              </div>
              <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${related.items.length > 2 ? "lg:grid-cols-3" : ""}`}>
                {related.items.map((item) => (
                  <InsightCard key={item.id} insight={item} />
                ))}
              </div>
            </Container>
          </RisePanel>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
