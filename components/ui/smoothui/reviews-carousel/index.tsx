"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const FRAME_OFFSET = -24;
const FRAMES_VISIBLE_LENGTH = 3;

function clamp(val: number, [min, max]: [number, number]): number {
  return Math.min(Math.max(val, min), max);
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("") || "?";

export interface Review {
  id: string | number;
  author: string;
  avatarUrl?: string;
  title?: string | null;
  body: string;
  rating?: number;
  roleOrLocation?: string;
  productName?: string;
  productSlug?: string;
  verifiedBuyer?: boolean;
}

interface ReviewCardProps {
  activeIndex: number;
  index: number;
  review: Review;
  totalCards: number;
}

function ReviewCard({
  review,
  index,
  activeIndex,
  totalCards,
}: ReviewCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const offsetIndex = index - activeIndex;

  // Depth logic
  const isPast = activeIndex > index;
  const isActive = index === activeIndex;

  const blur = isPast ? 3 : 0;
  const opacity = isPast ? 0 : clamp(1 - offsetIndex * 0.22, [0.35, 1]);
  const scale = shouldReduceMotion
    ? 1
    : isPast
    ? 0.92
    : clamp(1 - offsetIndex * 0.055, [0.82, 1]);
  const y = shouldReduceMotion
    ? 0
    : isPast
    ? 24
    : clamp(offsetIndex * FRAME_OFFSET, [
        FRAME_OFFSET * FRAMES_VISIBLE_LENGTH,
        0,
      ]);

  return (
    <motion.figure
      animate={{
        scale,
        opacity,
        y,
        transition: {
          damping: 22,
          duration: 0.35,
          mass: 0.5,
          stiffness: 240,
          type: "spring" as const,
        },
      }}
      className={cn(
        "absolute left-1/2 w-[calc(100%-1.5rem)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-2xl sm:rounded-3xl border border-line-soft bg-paper/95 p-5 sm:p-7 shadow-soft backdrop-blur-md transition-shadow hover:shadow-lift"
      )}
      initial={false}
      style={{
        borderWidth: 1,
        filter: `blur(${blur}px)`,
        pointerEvents: isActive ? "auto" : "none",
        top: "50%",
        transitionDuration: shouldReduceMotion ? "0ms" : "300ms",
        transitionProperty: "filter",
        zIndex: totalCards - index,
      }}
    >
      {/* Top Header: Star Rating & Verified Status */}
      <div className="flex items-center justify-between gap-3 border-b border-line-soft pb-3.5">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-amber-500">
            {Array.from({ length: review.rating ?? 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 sm:size-4 fill-amber-500 text-amber-500" />
            ))}
          </div>
          <span className="text-xs font-bold text-ink ml-1">{review.rating ?? 5}.0</span>
        </div>

        {review.verifiedBuyer !== false ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest bg-forest/8 border border-forest/15 px-2.5 py-0.5 rounded-full">
            <BadgeCheck className="size-3.5 text-forest" />
            <span>Verified Patient</span>
          </span>
        ) : null}
      </div>

      {/* Review Body */}
      <blockquote className="relative my-4">
        <span
          aria-hidden="true"
          className="absolute -top-3.5 -left-1 font-display text-4xl sm:text-5xl text-forest/15 leading-none select-none pointer-events-none"
        >
          &ldquo;
        </span>
        {review.title ? (
          <h4 className="font-display text-sm sm:text-base font-bold text-ink mb-1.5 leading-snug">
            {review.title}
          </h4>
        ) : null}
        <p className="relative text-ink/80 text-xs sm:text-sm leading-relaxed font-sans">
          {review.body}
        </p>
      </blockquote>

      {/* Author & Product attribution */}
      <figcaption className="mt-4 flex items-center justify-between gap-3 border-t border-line-soft pt-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-11 rounded-full ring-2 ring-forest/15 shrink-0">
            {review.avatarUrl ? (
              <AvatarImage
                src={review.avatarUrl}
                alt={review.author}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-sage-tint text-forest-deep text-xs font-bold">
              {initialsOf(review.author)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-ink text-xs sm:text-sm truncate">
                {review.author}
              </span>
            </div>
            {review.roleOrLocation ? (
              <p className="text-[11px] text-muted-ink truncate">
                {review.roleOrLocation}
              </p>
            ) : null}
          </div>
        </div>

        {review.productName ? (
          <div className="shrink-0 hidden xs:block">
            {review.productSlug ? (
              <Link
                href={`/product/${review.productSlug}`}
                className="group inline-flex items-center gap-1 rounded-full border border-forest/15 bg-forest/5 px-2.5 py-1 text-[11px] font-semibold text-forest hover:bg-forest/12 transition-colors"
              >
                <span className="max-w-[120px] sm:max-w-[160px] truncate">
                  {review.productName}
                </span>
                <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ) : (
              <span className="inline-block rounded-full border border-line-soft bg-canvas px-2.5 py-1 text-[11px] font-medium text-muted-ink max-w-[140px] truncate">
                {review.productName}
              </span>
            )}
          </div>
        ) : null}
      </figcaption>
    </motion.figure>
  );
}

export interface ReviewsCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  excludeIds?: (string | number)[];
  height?: string;
  reviews: Review[];
  showIndicators?: boolean;
  showNavigation?: boolean;
}

export default function ReviewsCarousel({
  reviews,
  className = "",
  height = "370px",
  excludeIds = [],
  showIndicators = true,
  showNavigation = true,
  autoPlay = true,
  autoPlayInterval = 6000,
}: ReviewsCarouselProps) {
  const filteredReviews = useMemo(() => {
    if (excludeIds.length === 0) return reviews;
    const excludeSet = new Set(excludeIds);
    return reviews.filter((r) => !excludeSet.has(r.id));
  }, [reviews, excludeIds]);

  const maxIndex = filteredReviews.length - 1;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || maxIndex <= 0 || isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, maxIndex, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        setActiveIndex((i) => clamp(i - 1, [0, maxIndex]));
      } else if (event.key === "ArrowRight") {
        setActiveIndex((i) => clamp(i + 1, [0, maxIndex]));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [maxIndex]);

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  if (filteredReviews.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("relative mx-auto w-full max-w-4xl", className)}
      style={{ height }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Stacked Cards Area */}
      <div className="relative h-full w-full py-6">
        <div className="grid h-full w-full place-items-center">
          {filteredReviews.map((review: Review, index: number) => (
            <ReviewCard
              key={review.id}
              activeIndex={activeIndex}
              index={index}
              review={review}
              totalCards={filteredReviews.length}
            />
          ))}
        </div>
      </div>

      {/* Navigation Controls: Previous Chevron, Elongated Pill Indicators, Next Chevron */}
      {(showNavigation || showIndicators) ? (
        <div className="absolute bottom-2 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3">
          {showNavigation ? (
            <button
              type="button"
              aria-label="Previous review"
              onClick={goToPrevious}
              className="grid size-8 sm:size-9 place-items-center rounded-full border border-forest/20 bg-white/90 text-forest shadow-xs hover:bg-forest hover:text-cream transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="size-4" />
            </button>
          ) : null}

          {showIndicators ? (
            <div className="flex items-center gap-2 px-1">
              {filteredReviews.map((review: Review, index: number) => (
                <button
                  key={review.id}
                  type="button"
                  aria-label={`Go to review ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 cursor-pointer",
                    index === activeIndex
                      ? "w-8 bg-forest shadow-xs"
                      : "w-2 bg-forest/25 hover:bg-forest/50"
                  )}
                />
              ))}
            </div>
          ) : null}

          {showNavigation ? (
            <button
              type="button"
              aria-label="Next review"
              onClick={goToNext}
              className="grid size-8 sm:size-9 place-items-center rounded-full border border-forest/20 bg-white/90 text-forest shadow-xs hover:bg-forest hover:text-cream transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="size-4" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
