import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/shared/Section";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { ClipReveal } from "@/components/shared/ClipReveal";
import { SplitHeading } from "@/components/shared/SplitHeading";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import type { ApiInsightCard } from "@/types/api/insight";

/**
 * Editorial journal.
 *
 * A magazine row, not an ecommerce grid: the lead article runs double width
 * with a landscape crop while the two that follow take portrait crops at half
 * the width. Varying the crop is what separates this band from the product
 * grids above it (brain/08_UI_SPEC.md: "three editorial cards with varied
 * image crops").
 */
export function HealthInsights({ articles }: { articles: ApiInsightCard[] }) {
  // Published articles only (GET /api/shop/blog). None yet: the band stays,
  // with the journal's topics and no invented titles.
  const [lead, ...rest] = articles.slice(0, 3);

  return (
    <Section
      labelledBy="insights-heading"
      space="none"
      className="py-14 md:py-16"
    >
      <Container width="wide">
        <div className="flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal>
              <Eyebrow>From the journal</Eyebrow>
            </Reveal>
            <SplitHeading
              id="insights-heading"
              lines={["Health Insights for a Better You"]}
              className="mt-4 text-[1.875rem] leading-[1.1] text-ink sm:text-[2.25rem]"
            />
          </div>

          <Reveal delay={0.1}>
            <Link
              href="/insights"
              className="group inline-flex items-center gap-2 text-[0.875rem] font-medium text-forest"
            >
              {articles.length > 0 ? "Read all articles" : "Visit the journal"}
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.8}
              />
            </Link>
          </Reveal>
        </div>

        <Reveal
          stagger="[data-article]"
          className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {lead ? (
            <div data-article className="lg:col-span-2">
              <ArticleCard article={lead} layout="lead" />
            </div>
          ) : (
            UPCOMING.map((topic, index) => (
              <div key={topic.title} data-article className={index === 0 ? "lg:col-span-2" : undefined}>
                <UpcomingTopic topic={topic} lead={index === 0} />
              </div>
            ))
          )}

          {rest.map((article) => (
            <div key={article.id} data-article>
              <ArticleCard article={article} layout="standard" />
            </div>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}

/** Journal topics shown before the first article is published. Photographs only; no article is implied. */
const UPCOMING = [
  { title: "Everyday immunity", category: "Wellness", image: "/Images/journal_immunity.webp" },
  { title: "Caring for children", category: "Family", image: "/Images/journal_children.webp" },
  { title: "Women’s wellness", category: "Women’s health", image: "/Images/journal_women.webp" },
] as const;

function UpcomingTopic({ topic, lead }: { topic: (typeof UPCOMING)[number]; lead: boolean }) {
  return (
    <article className="flex h-full flex-col">
      <div className="relative h-[12rem] w-full overflow-hidden rounded-frame sm:h-[13.5rem]">
        <Image
          src={topic.image}
          alt=""
          fill
          sizes={lead ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"}
          className="object-cover"
        />
        <span className="absolute top-3 left-3 rounded-full bg-paper/92 px-2.5 py-1 text-[0.6875rem] font-semibold text-ink shadow-2xs backdrop-blur-sm">
          Coming soon
        </span>
      </div>
      <div className="mt-5 flex flex-1 flex-col">
        <p className="dh-eyebrow text-forest">{topic.category}</p>
        <h3 className={cn("mt-3 leading-snug text-ink", lead ? "font-display text-[1.5rem] sm:text-[1.75rem]" : "text-[1.0625rem] font-medium")}>
          {topic.title}
        </h3>
        <p className="mt-auto pt-5 text-xs text-muted-ink">
          {lead
            ? "Our first articles are being written: practical reading to help you prepare questions for your practitioner."
            : "Articles on this topic are on their way."}
        </p>
      </div>
    </article>
  );
}

function ArticleCard({
  article,
  layout,
}: {
  article: ApiInsightCard;
  layout: "lead" | "standard";
}) {
  const isLead = layout === "lead";

  return (
    <article className="group h-full">
      <Link href={`/insights/${article.slug}`} className="flex h-full flex-col">
        <ClipReveal from="bottom">
          {article.coverImageUrl ? (
            <div className="relative w-full h-[12rem] sm:h-[13.5rem] rounded-frame overflow-hidden">
              <Image 
                src={article.coverImageUrl}
                alt=""
                fill
                sizes={isLead ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"}
                className="object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.015]"
              />
            </div>
          ) : (
            <MediaPlaceholder
              label={article.title}
              tone={isLead ? "clay" : "sage"}
              ratio="h-[12rem] sm:h-[13.5rem]"
              className="rounded-frame transition-transform duration-500 ease-premium group-hover:scale-[1.015]"
            >
              <span
                aria-hidden
                className="absolute bottom-0 left-[12%] h-[58%] w-[46%] rounded-t-[38%_30%] bg-ink/8"
              />
              <span
                aria-hidden
                className="absolute right-[14%] bottom-0 h-[34%] w-[28%] rounded-t-[50%_40%] bg-ink/5"
              />
            </MediaPlaceholder>
          )}
        </ClipReveal>

        <div className="mt-5 flex flex-1 flex-col">
          {article.category ? <p className="dh-eyebrow text-forest">{article.category.name}</p> : null}

          <h3
            className={cn(
              "mt-3 leading-snug text-ink transition-colors group-hover:text-forest",
              isLead
                ? "font-display text-[1.5rem] sm:text-[1.75rem]"
                : "text-[1.0625rem] font-medium",
            )}
          >
            {article.title}
          </h3>

          <p className="mt-auto flex items-center gap-2 pt-5 text-xs text-muted-ink">
            {article.publishedAt
              ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(article.publishedAt))
              : "Read article"}
            <ArrowUpRight
              aria-hidden
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.8}
            />
          </p>
        </div>
      </Link>
    </article>
  );
}
