import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClipReveal } from "@/components/shared/ClipReveal";
import type { ApiInsightCard } from "@/types/api/insight";

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

/** Author and date only when the article really has them — never filled in. */
function metaFor(insight: ApiInsightCard) {
  return [insight.authorName ? `By ${insight.authorName}` : null, insight.publishedAt ? DATE.format(new Date(insight.publishedAt)) : null].filter(
    (part): part is string => part !== null,
  );
}

/**
 * An article in the Health Insights listing. The title is the card's one
 * link, stretched over the whole card, so the card is a single tab stop with
 * a sensible accessible name; "Read article" is its visual affordance.
 * The cover is decorative here: the title beside it already names the piece.
 */
export function InsightCard({ insight, featured = false }: { insight: ApiInsightCard; featured?: boolean }) {
  const href = `/insights/${insight.slug}`;
  const meta = metaFor(insight);
  const topic = insight.category?.name ?? "Article";

  const cover = insight.coverImageUrl ? (
    <Image
      src={insight.coverImageUrl}
      alt=""
      fill
      priority={featured}
      sizes={featured ? "(min-width: 1024px) 760px, 100vw" : "(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw"}
      draggable={false}
      className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.03] pointer-events-none select-none"
    />
  ) : (
    <span aria-hidden className="absolute inset-0 grid place-items-center bg-cream-sunk">
      <BookOpen className="size-10 text-forest/20" />
    </span>
  );

  const link = (
    <Link href={href} className="transition-colors before:absolute before:inset-0 before:content-[''] group-hover:text-forest">
      {insight.title}
    </Link>
  );

  const readMore = (
    <span
      aria-hidden
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-forest"
    >
      Read article
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </span>
  );

  if (featured) {
    return (
      <article className="group relative grid overflow-hidden rounded-[1.5rem] border border-line-soft bg-paper shadow-soft transition-shadow duration-400 hover:shadow-lift lg:grid-cols-[1.15fr_1fr]">
        <ClipReveal from="left" className="relative aspect-16/10 overflow-hidden lg:aspect-auto lg:min-h-104">
          {cover}
        </ClipReveal>
        <div className="dh-pad-card-lg flex flex-col justify-center">
          <p className="dh-eyebrow text-forest">{topic}</p>
          <h2 className="dh-title-section mt-4 text-ink">{link}</h2>
          {insight.excerpt ? <p className="dh-body mt-4">{insight.excerpt}</p> : null}
          {meta.length ? <p className="dh-meta mt-3">{meta.join(" · ")}</p> : null}
          <div className="mt-7">{readMore}</div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line-soft bg-paper shadow-soft",
        "transition-[border-color,box-shadow,transform] duration-400 ease-premium hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-lift",
      )}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-cream-sunk">{cover}</div>
      <div className="dh-pad-card flex flex-1 flex-col">
        <p className="dh-eyebrow text-forest">{topic}</p>
        <h3 className="dh-title-card mt-3 text-ink">{link}</h3>
        {insight.excerpt ? <p className="dh-meta mt-2.5 line-clamp-3 text-[0.875rem] leading-relaxed">{insight.excerpt}</p> : null}
        {meta.length ? <p className="dh-meta mt-2">{meta.join(" · ")}</p> : null}
        <div className="mt-auto pt-5">{readMore}</div>
      </div>
    </article>
  );
}
