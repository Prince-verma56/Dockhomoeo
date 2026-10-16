"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, MessageSquareQuote, ShieldCheck, Star } from "lucide-react";
import { Section } from "@/components/shared/Section";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { SplitHeading } from "@/components/shared/SplitHeading";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Rating } from "@/components/shared/Rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ApiProductReview } from "@/types/api/product";

/** An approved review from a product page (GET /api/shop/products/:slug), with the product it is about. */
export type HomeReview = ApiProductReview & { productName: string; productSlug: string };

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("") || "?";

/**
 * Social proof, composed as an editorial spread.
 *
 * The lead review is set as a large pull-quote rather than a card, and the
 * remaining reviews run in a carousel beside it — a different shape from every
 * other band on the page. The carousel does not auto-rotate: it advances only
 * on user input, with labelled previous/next controls
 * (brain/23_ACCESSIBILITY_SPEC.md).
 */
export function Testimonials({ reviews }: { reviews: HomeReview[] }) {
  // Only genuine reviews: approved product reviews from the shop. None yet, no section.
  if (reviews.length === 0) return <ReviewsComingSoon />;
  const [lead, ...supporting] = reviews;

  return (
    <Section tone="sage" labelledBy="testimonials-heading" space="default">
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-16">
          {/* ------------------------------------------------- lead quote */}
          <div>
            <Reveal>
              <Eyebrow>Customer reviews</Eyebrow>
            </Reveal>

            <SplitHeading
              id="testimonials-heading"
              lines={["What Our Customers Say"]}
              className="mt-4 text-[2.125rem] leading-[1.06] text-ink sm:text-[2.625rem]"
            />

            {lead ? (
              <Reveal delay={0.12} className="mt-9">
                <figure className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-8 -left-2 font-display text-[7rem] leading-none text-forest/12 select-none"
                  >
                    &ldquo;
                  </span>

                  <blockquote className="relative font-display text-[1.375rem] leading-[1.45] text-ink sm:text-[1.625rem]">
                    {lead.title ? <span className="block">{lead.title}</span> : null}
                    <span className={lead.title ? "mt-2 block text-[1.0625rem] leading-relaxed text-muted-ink sm:text-[1.125rem]" : undefined}>{lead.body}</span>
                  </blockquote>

                  <figcaption className="mt-7 flex items-center gap-3.5">
                    <Avatar className="size-11 rounded-full ring-1 ring-forest/12">
                      <AvatarFallback className="bg-cream text-[0.8125rem] font-medium text-forest-deep">
                        {initialsOf(lead.authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="leading-tight">
                      <span className="flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink">
                        {lead.authorName}
                        {lead.isVerifiedBuyer ? (
                          <BadgeCheck
                            aria-label="Verified buyer"
                            className="size-4 text-forest"
                            strokeWidth={1.7}
                          />
                        ) : null}
                      </span>
                      <Link href={`/product/${lead.productSlug}`} className="mt-1 block text-xs text-muted-ink underline-offset-4 hover:text-forest hover:underline">
                        On {lead.productName}
                      </Link>
                    </span>
                    <Rating
                      variant="full"
                      value={lead.rating}
                      className="ml-auto hidden sm:inline-flex"
                    />
                  </figcaption>
                </figure>
              </Reveal>
            ) : null}
          </div>

          {/* ------------------------------------------- supporting carousel */}
          {supporting.length > 0 ? (
          <Reveal delay={0.16} className="min-w-0">
            <Carousel
              opts={{ align: "start", loop: false }}
              className="w-full"
              aria-label="More customer reviews"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <Link
                  href="/products?sort=rating"
                  className="group inline-flex items-center gap-2 text-[0.875rem] font-medium text-forest"
                >
                  Shop top-rated remedies
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.8}
                  />
                </Link>

                <div className="flex items-center gap-2">
                  <CarouselPrevious className="static size-10 translate-y-0 rounded-full border-line bg-cream text-ink hover:border-forest/35 hover:text-forest" />
                  <CarouselNext className="static size-10 translate-y-0 rounded-full border-line bg-cream text-ink hover:border-forest/35 hover:text-forest" />
                </div>
              </div>

              <CarouselContent className="-ml-4">
                {supporting.map((testimonial) => (
                  <CarouselItem
                    key={testimonial.id}
                    className="basis-[86%] pl-4 sm:basis-[72%] xl:basis-1/2"
                  >
                    <TestimonialCard testimonial={testimonial} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </Reveal>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: HomeReview }) {
  return (
    <Card className="flex h-full flex-col gap-4 rounded-card border-line/60 bg-cream p-6 shadow-none">
      <Rating variant="full" value={testimonial.rating} />

      <blockquote className="flex-1 text-[0.875rem] leading-relaxed text-muted-ink">
        {testimonial.title ? <span className="mb-1 block font-medium text-ink">{testimonial.title}</span> : null}
        {testimonial.body}
      </blockquote>

      <div className="flex items-center gap-3">
        <Avatar className="size-9 rounded-full">
          <AvatarFallback className="bg-sage-tint text-[0.6875rem] font-medium text-forest-deep">
            {initialsOf(testimonial.authorName)}
          </AvatarFallback>
        </Avatar>
        <span className="leading-tight">
          <span className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink">
            {testimonial.authorName}
            {testimonial.isVerifiedBuyer ? (
              <BadgeCheck
                aria-label="Verified buyer"
                className="size-3.5 text-forest"
                strokeWidth={1.7}
              />
            ) : null}
          </span>
          <Link href={`/product/${testimonial.productSlug}`} className="mt-0.5 block text-xs text-muted-ink underline-offset-4 hover:text-forest hover:underline">
            On {testimonial.productName}
          </Link>
        </span>
      </div>
    </Card>
  );
}

/**
 * The section before the shop has any published reviews: same band, same
 * heading, no invented quote, reviewer or rating. Reviews reach the shop
 * through its moderation (there is no public review form yet), so the copy
 * promises only what is true: what is shown here will be real.
 */
function ReviewsComingSoon() {
  const promises = [
    { icon: ShieldCheck, title: "Only genuine reviews", detail: "Every review is moderated by DocHomoeo before it is published, and never written by us." },
    { icon: Star, title: "Ratings as given", detail: "Stars are shown exactly as the customer rated the product." },
    { icon: MessageSquareQuote, title: "Linked to the product", detail: "Each review names the remedy it is about, so you can read it in context." },
  ];
  return (
    <Section tone="sage" labelledBy="testimonials-heading" space="default">
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:items-center lg:gap-16">
          <div>
            <Reveal>
              <Eyebrow>Customer reviews</Eyebrow>
            </Reveal>
            <SplitHeading
              id="testimonials-heading"
              lines={["What Our Customers Say"]}
              className="mt-4 text-[2.125rem] leading-[1.06] text-ink sm:text-[2.625rem]"
            />
            <Reveal delay={0.12} className="mt-7">
              <figure className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-8 -left-2 font-display text-[7rem] leading-none text-forest/12 select-none"
                >
                  &ldquo;
                </span>
                <p className="relative max-w-xl font-display text-[1.375rem] leading-[1.45] text-ink sm:text-[1.5rem]">
                  Reviews from our customers will appear here as they are published.
                </p>
              </figure>
              <Link
                href="/products?sort=rating"
                className="group mt-7 inline-flex items-center gap-2 text-[0.875rem] font-medium text-forest"
              >
                Shop top-rated remedies
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.8}
                />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={0.16} stagger="[data-review-promise]" className="grid gap-4">
            {promises.map(({ icon: Icon, title, detail }) => (
              <Card key={title} data-review-promise className="flex flex-row items-start gap-4 rounded-card border-line/60 bg-cream p-5 shadow-none">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sage-tint text-forest">
                  <Icon aria-hidden className="size-4.5" strokeWidth={1.7} />
                </span>
                <span>
                  <span className="block text-[0.9375rem] font-medium text-ink">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-ink">{detail}</span>
                </span>
              </Card>
            ))}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
