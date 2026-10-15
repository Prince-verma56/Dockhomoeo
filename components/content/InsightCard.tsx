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
      className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.03]"
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
      <article className="group relative grid overflow-hidden rounded-2xl border border-line-soft bg-paper shadow-soft transition-shadow duration-400 hover:shadow-lift lg:grid-cols-12">
        <ClipReveal from="left" className="relative aspect-16/10 overflow-hidden lg:col-span-7 lg:aspect-auto lg:min-h-110">
          {cover}
        </ClipReveal>
        <div className="flex flex-col justify-center gap-4 p-7 sm:p-10 lg:col-span-5 lg:p-12">
          <p className="dh-eyebrow text-forest">{topic}</p>
          <h2 className="font-display text-3xl leading-[1.1] tracking-tight text-ink sm:text-4xl">{link}</h2>
          {insight.excerpt ? <p className="text-base leading-relaxed text-muted-ink">{insight.excerpt}</p> : null}
          {meta.length ? <p className="text-sm text-muted-ink">{meta.join(" · ")}</p> : null}
          <div className="mt-2">{readMore}</div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line-soft bg-paper shadow-soft",
        "transition-[border-color,box-shadow,transform] duration-400 ease-premium hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-lift",
      )}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-cream-sunk">{cover}</div>
      <div className="flex flex-1 flex-col gap-2.5 p-6">
        <p className="dh-eyebrow text-[0.66rem] text-forest">{topic}</p>
        <h3 className="font-display text-xl leading-snug tracking-tight text-ink sm:text-[1.375rem]">{link}</h3>
        {insight.excerpt ? <p className="line-clamp-3 text-sm leading-relaxed text-muted-ink">{insight.excerpt}</p> : null}
        {meta.length ? <p className="text-xs text-muted-ink">{meta.join(" · ")}</p> : null}
        <div className="mt-auto pt-3">{readMore}</div>
      </div>
    </article>
  );
}
