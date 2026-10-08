"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
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
import { testimonials } from "@/data/mock/home";
import type { Testimonial } from "@/types/content";

/**
 * Social proof, composed as an editorial spread.
 *
 * The lead review is set as a large pull-quote rather than a card, and the
 * remaining reviews run in a carousel beside it — a different shape from every
 * other band on the page. The carousel does not auto-rotate: it advances only
 * on user input, with labelled previous/next controls
 * (brain/23_ACCESSIBILITY_SPEC.md).
 */
export function Testimonials() {
  const [lead, ...supporting] = testimonials;

  return (
    <Section tone="sage" labelledBy="testimonials-heading" space="default">
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-16">
          {/* ------------------------------------------------- lead quote */}
          <div>
            <Reveal>
              <Eyebrow>Real people. Real care.</Eyebrow>
            </Reveal>

            <SplitHeading
              id="testimonials-heading"
              lines={["What Our Patients Say"]}
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
                    {lead.quote}
                  </blockquote>

                  <figcaption className="mt-7 flex items-center gap-3.5">
                    <Avatar className="size-11 rounded-full ring-1 ring-forest/12">
                      <AvatarFallback className="bg-cream text-[0.8125rem] font-medium text-forest-deep">
                        {lead.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="leading-tight">
                      <span className="flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink">
                        {lead.authorName}
                        {lead.verifiedBuyer ? (
                          <BadgeCheck
                            aria-label="Verified buyer"
                            className="size-4 text-forest"
                            strokeWidth={1.7}
                          />
                        ) : null}
                      </span>
                      <span className="mt-1 block text-xs text-muted-ink">
                        {lead.authorLocation}
                      </span>
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
          <Reveal delay={0.16} className="min-w-0">
            <Carousel
              opts={{ align: "start", loop: false }}
              className="w-full"
              aria-label="More patient reviews"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <Link
                  href="/reviews"
                  className="group inline-flex items-center gap-2 text-[0.875rem] font-medium text-forest"
                >
                  View all reviews
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
        </div>
      </Container>
    </Section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="flex h-full flex-col gap-4 rounded-card border-line/60 bg-cream p-6 shadow-none">
      <Rating variant="full" value={testimonial.rating} />

      <blockquote className="flex-1 text-[0.875rem] leading-relaxed text-muted-ink">
        {testimonial.quote}
      </blockquote>

      <div className="flex items-center gap-3">
        <Avatar className="size-9 rounded-full">
          <AvatarFallback className="bg-sage-tint text-[0.6875rem] font-medium text-forest-deep">
            {testimonial.initials}
          </AvatarFallback>
        </Avatar>
        <span className="leading-tight">
          <span className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink">
            {testimonial.authorName}
            {testimonial.verifiedBuyer ? (
              <BadgeCheck
                aria-label="Verified buyer"
                className="size-3.5 text-forest"
                strokeWidth={1.7}
              />
            ) : null}
          </span>
          <span className="mt-0.5 block text-xs text-muted-ink">
            {testimonial.authorLocation}
          </span>
        </span>
      </div>
    </Card>
  );
}
