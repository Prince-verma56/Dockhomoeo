import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { ApiInsightCard } from "@/types/api/insight";

interface InsightCardProps {
  insight: ApiInsightCard;
  isFeatured?: boolean;
}

export function InsightCard({ insight, isFeatured = false }: InsightCardProps) {
  const href = `/insights/${insight.slug}`;
  
  const formattedDate = insight.publishedAt 
    ? new Intl.DateTimeFormat("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(insight.publishedAt))
    : null;

  if (isFeatured) {
    return (
      <Link
        href={href}
        className="group relative flex w-full flex-col-reverse overflow-hidden rounded-[2rem] bg-white transition-all duration-500 hover:shadow-xl lg:flex-row border border-forest-abyss/5 hover:border-forest-deep/20"
      >
        <div className="flex flex-1 flex-col justify-center p-8 sm:p-12 lg:p-16">
          <div className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-forest-deep">
            <BookOpen className="size-4" />
            {insight.category?.name || "Featured Read"}
          </div>
          <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl transition-colors duration-300 group-hover:text-forest-deep">
            {insight.title}
          </h2>
          <p className="mt-6 line-clamp-3 text-lg leading-relaxed text-muted-ink sm:text-xl max-w-2xl">
            {insight.excerpt}
          </p>
          
          <div className="mt-10 flex items-center gap-4 text-sm text-muted-ink font-medium">
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
          
          <div className="mt-8 flex items-center gap-2 text-base font-semibold text-ink transition-colors group-hover:text-white bg-forest-abyss/5 group-hover:bg-forest-deep w-fit px-6 py-3 rounded-full">
            Read article
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
        
        <div className="relative h-72 w-full shrink-0 overflow-hidden bg-[#f6f2ea] lg:h-auto lg:w-[45%]">
          {insight.coverImageUrl ? (
            <Image
              src={insight.coverImageUrl}
              alt={insight.title}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
          ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#f6f2ea] to-[#e8e4dc]">
                <BookOpen className="size-20 text-forest-deep/10 transition-transform duration-700 group-hover:scale-110" />
             </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-forest-abyss/5 hover:border-forest-deep/20"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f6f2ea]">
        {insight.coverImageUrl ? (
          <Image
            src={insight.coverImageUrl}
            alt={insight.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#f6f2ea] to-[#e8e4dc]">
              <BookOpen className="size-12 text-forest-deep/10" />
           </div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-8 sm:p-10">
        <div className="mb-4 text-xs font-bold uppercase tracking-widest text-forest-deep">
          {insight.category?.name || "Article"}
        </div>
        
        <h3 className="mb-4 font-display text-2xl leading-tight text-ink transition-colors duration-300 group-hover:text-forest-deep">
          {insight.title}
        </h3>
        
        <div className="mt-auto pt-6 flex items-center justify-between border-t border-forest-abyss/5">
          <div className="text-sm font-medium text-muted-ink">
            {formattedDate}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-forest-deep">
            Read <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
