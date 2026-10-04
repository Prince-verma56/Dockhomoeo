import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/shared/Section";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { SplitHeading } from "@/components/shared/SplitHeading";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { articles } from "@/data/mock/home";
import type { Article } from "@/types/content";

/**
 * Editorial Health Insights Journal.
 * 3-card photographic layout matching the user's desired design:
 * High-quality imagery, clean white rounded cards, bold headlines, and green read-more CTAs.
 */
export function HealthInsights() {
  return (
    <Section
      labelledBy="insights-heading"
      space="none"
      className="py-14 md:py-20 bg-[#fbf9f4]"
    >
      <Container width="wide">
        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-[#e5e1d5] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal>
              <Eyebrow>From the journal</Eyebrow>
            </Reveal>
            <SplitHeading
              id="insights-heading"
              lines={["Health Insights for a Better You"]}
              className="mt-3.5 font-sans text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-[#0d2118] tracking-tight leading-[1.1]"
            />
          </div>

          <Reveal delay={0.1}>
            <Link
              href="/learn"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#0c503b] hover:text-[#063b2d] transition-colors"
            >
              <span>Read all articles</span>
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 stroke-[2]"
              />
            </Link>
          </Reveal>
        </div>

        {/* 3-Card Editorial Grid */}
        <Reveal
          stagger="[data-article]"
          className="mt-8 sm:mt-10 grid gap-6 sm:gap-7 md:grid-cols-3"
        >
          {articles.map((article) => (
            <div key={article.id} data-article className="h-full">
              <ArticleCard article={article} />
            </div>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group h-full">
      <Link
        href={article.href}
        className="flex h-full flex-col overflow-hidden rounded-[20px] bg-white border border-[#eae6dc] shadow-[0_2px_12px_rgba(20,37,31,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_14px_30px_rgba(20,37,31,0.1)] hover:border-[#ded8cc]"
      >
        {/* Top Photographic Crop */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#efebe3]">
          {article.image ? (
            <Image
              src={article.image}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="size-full bg-linear-to-br from-[#e8eee3] to-[#d6ded0]" />
          )}
        </div>

        {/* Bottom Editorial Content */}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <h3 className="font-sans text-[1.08rem] sm:text-[1.18rem] font-bold text-[#0d2118] leading-[1.3] group-hover:text-[#0c503b] transition-colors line-clamp-2">
            {article.title}
          </h3>

          <div className="mt-4 sm:mt-5 flex items-center gap-1.5 text-xs sm:text-[0.82rem] font-bold text-[#0c503b] group-hover:text-[#063b2d] transition-colors">
            <span>{article.readingMinutes} min read</span>
            <ArrowRight className="size-3.5 stroke-[2.2] transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </article>
  );
}
