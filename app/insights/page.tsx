import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { SplitHeading } from "@/components/shared/SplitHeading";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { DemoContentNotice } from "@/components/shared/DemoContentNotice";
import { InsightCard } from "@/components/content/InsightCard";
import { RisePanel } from "@/components/shared/RisePanel";
import { cn } from "@/lib/utils";

type Props = PageProps<"/insights">;

const DESCRIPTION =
  "Reading on homoeopathy, natural wellness and family care from DocHomoeo — written to help you prepare questions for your practitioner.";

/** Every article, for the topic list. Shared by metadata and page within one request. */
const allInsights = cache(() => repositories.insight.getInsights(1, 100));

async function topicsOf() {
  const { items } = await allInsights();
  const topics = new Map<string, { name: string; slug: string; count: number }>();
  for (const item of items) {
    if (!item.category) continue;
    const topic = topics.get(item.category.slug) ?? { ...item.category, count: 0 };
    topic.count += 1;
    topics.set(item.category.slug, topic);
  }
  return { total: items.length, topics: [...topics.values()] };
}

const topicParam = async (searchParams: Props["searchParams"]) => {
  const value = (await searchParams).category;
  return (Array.isArray(value) ? value[0] : value)?.trim() || null;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const slug = await topicParam(searchParams);
  if (!slug) {
    return {
      title: "Health insights",
      description: DESCRIPTION,
      alternates: { canonical: "/insights" },
      openGraph: { title: "Health insights · DocHomoeo", description: DESCRIPTION, url: "/insights", type: "website" },
    };
  }
  const topic = (await topicsOf()).topics.find((t) => t.slug === slug);
  // A topic is a real listing of its own; an unknown one is not worth indexing.
  if (!topic) return { title: "Health insights", robots: { index: false, follow: true } };
  const description = `Articles on ${topic.name.toLowerCase()} from DocHomoeo Health Insights.`;
  const url = `/insights?category=${encodeURIComponent(topic.slug)}`;
  return {
    title: `${topic.name} — health insights`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${topic.name} · DocHomoeo`, description, url, type: "website" },
  };
}

/** Columns that fit the count, so a short list never leaves a ragged last row. */
const gridColumns = (count: number) =>
  count === 1 ? "max-w-2xl" : count === 2 || count === 4 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";

export default async function InsightsPage({ searchParams }: Props) {
  const slug = await topicParam(searchParams);
  const [{ total, topics }, listing, home] = await Promise.all([
    topicsOf(),
    repositories.insight.getInsights(1, 12, slug ?? undefined),
    repositories.home.getHomeData(),
  ]);
  const activeTopic = topics.find((t) => t.slug === slug) ?? null;
  const [featured, ...latest] = listing.items;

  const pill = (active: boolean) =>
    cn(
      "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
      active
        ? "border-forest-deep bg-forest-deep text-cream"
        : "border-line bg-cream text-ink hover:border-forest/35 hover:text-forest",
    );

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 overflow-x-clip bg-canvas">
        <section
          aria-labelledby="insights-heading"
          className={cn("dh-head-arc pt-28 sm:pt-32", featured && "dh-head-arc--overlap")}
        >
          <Container>
            <PageBreadcrumb
              items={[
                { name: "Health insights", href: "/insights" },
                ...(activeTopic
                  ? [{ name: activeTopic.name, href: `/insights?category=${encodeURIComponent(activeTopic.slug)}` }]
                  : []),
              ]}
              className="mb-6"
            />
            <div className="max-w-2xl">
              <SplitHeading
                as="h1"
                id="insights-heading"
                immediate
                className="text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
                lines={[<span key="line">Health <span className="italic text-forest-deep">insights</span></span>]}
              />
              <p className="mt-4 text-base leading-relaxed text-muted-ink sm:text-lg">
                Reading on homoeopathy, natural wellness and family care — written to help you
                prepare questions for your practitioner, not to replace a consultation.
              </p>
            </div>

            {topics.length > 1 ? (
              <nav aria-label="Article topics" className="mt-8">
                <ul className="flex flex-wrap gap-2">
                  <li>
                    <Link href="/insights" aria-current={activeTopic ? undefined : "page"} className={pill(!activeTopic)}>
                      All topics
                      <span className="text-xs opacity-70">{total}</span>
                    </Link>
                  </li>
                  {topics.map((topic) => {
                    const active = topic.slug === activeTopic?.slug;
                    return (
                      <li key={topic.slug}>
                        <Link
                          href={`/insights?category=${encodeURIComponent(topic.slug)}`}
                          aria-current={active ? "page" : undefined}
                          className={pill(active)}
                        >
                          {topic.name}
                          <span className="text-xs opacity-70">
                            {topic.count}
                            <span className="sr-only"> {topic.count === 1 ? "article" : "articles"}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ) : null}
          </Container>
        </section>

        {/* The lead article sits across the head's arc. */}
        <section aria-label="Articles" className={cn("pb-16 lg:pb-24", featured ? "dh-overlap-up" : "pt-12 lg:pt-16")}>
          <Container>
            {featured ? (
              <>
                <InsightCard insight={featured} featured />
                {latest.length > 0 ? (
                  <div className="mt-12 lg:mt-16">
                    <div className="mb-6 flex items-end justify-between gap-4">
                      <h2 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
                        {activeTopic ? `More on ${activeTopic.name.toLowerCase()}` : "Latest articles"}
                      </h2>
                      <p className="text-sm text-muted-ink">
                        {latest.length} more {latest.length === 1 ? "article" : "articles"}
                      </p>
                    </div>
                    <Reveal as="ul" stagger=":scope > li" y={18} className={cn("grid gap-5 lg:gap-6", gridColumns(latest.length))}>
                      {latest.map((insight) => (
                        <li key={insight.id}>
                          <InsightCard insight={insight} />
                        </li>
                      ))}
                    </Reveal>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-card border border-dashed border-line bg-cream/60 px-6 py-14 text-center">
                <h2 className="text-xl font-semibold text-ink">No articles in this topic yet</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-ink">New reading is added regularly.</p>
                <Link href="/insights" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest">
                  See all articles
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            )}
          </Container>
        </section>

        {home.categories.length > 0 ? (
          <RisePanel aria-labelledby="insights-explore" settle className="pt-14 pb-16 lg:pt-16 lg:pb-20">
            <Container>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                <div className="max-w-md">
                  <h2 id="insights-explore" className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
                    Explore remedies by health concern
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-ink">
                    Talk to a practitioner first, then browse what we stock.
                  </p>
                </div>
                <ul className="flex flex-wrap gap-2 lg:justify-end">
                  {home.categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/products?category=${encodeURIComponent(category.slug)}`}
                        className="inline-flex min-h-10 items-center rounded-full border border-line bg-paper px-4 text-sm text-ink transition-colors hover:border-forest/35 hover:text-forest"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Container>
          </RisePanel>
        ) : null}
      </main>
      <DemoContentNotice />
      <SiteFooter />
    </>
  );
}
