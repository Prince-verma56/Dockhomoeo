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
import { articles } from "@/data/mock/home";
import type { Article } from "@/types/content";

/**
 * Editorial journal.
 *
 * A magazine row, not an ecommerce grid: the lead article runs double width
 * with a landscape crop while the two that follow take portrait crops at half
 * the width. Varying the crop is what separates this band from the product
 * grids above it (brain/08_UI_SPEC.md: "three editorial cards with varied
 * image crops").
 */
export function HealthInsights() {
  const [lead, ...rest] = articles;

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
              href="/learn"
              className="group inline-flex items-center gap-2 text-[0.875rem] font-medium text-forest"
            >
              Read all articles
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
          ) : null}

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

function ArticleCard({
  article,
  layout,
}: {
  article: Article;
  layout: "lead" | "standard";
}) {
  const isLead = layout === "lead";

  return (
    <article className="group h-full">
      <Link href={article.href} className="flex h-full flex-col">
        <ClipReveal from="bottom">
          {article.image ? (
            <div className="relative w-full h-[12rem] sm:h-[13.5rem] rounded-frame overflow-hidden">
              <Image 
                src={article.image}
                alt={article.mediaLabel || ""}
                fill
                className="object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.015]"
              />
            </div>
          ) : (
            <MediaPlaceholder
              label={article.mediaLabel}
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
          <p className="dh-eyebrow text-forest">{article.category}</p>

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
            {article.readingMinutes} min read
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
