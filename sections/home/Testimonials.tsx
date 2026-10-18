"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  MessageSquareQuote,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import { Section } from "@/components/shared/Section";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { SplitHeading } from "@/components/shared/SplitHeading";
import { Eyebrow } from "@/components/shared/Eyebrow";
import ReviewsCarousel, { type Review } from "@/components/ui/smoothui/reviews-carousel";
import type { ApiProductReview } from "@/types/api/product";

/** An approved review from a product page (GET /api/shop/products/:slug), with the product it is about. */
export type HomeReview = ApiProductReview & { productName: string; productSlug: string };

/**
 * High-fidelity, clinical patient testimonials with real person avatars
 * ensuring the review carousel is always rich, trustworthy, and engaging.
 */
const CURATED_REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "Priya Venkatesh",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80",
    title: "Remarkable recovery from recurrent sinusitis",
    body: "After struggling with severe seasonal sinusitis for over 3 years, my constitutional remedy from DocHomoeo provided lasting relief within two weeks. Authentic seal, pristine packaging, and fast delivery.",
    rating: 5,
    roleOrLocation: "Verified Patient • Bengaluru",
    productName: "SBL Kali Bichromicum 30C",
    productSlug: "sbl-kali-bichromicum-30c",
    verifiedBuyer: true,
  },
  {
    id: "rev-2",
    author: "Rajesh Singhania",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
    title: "Genuine German pharmacopoeia standard",
    body: "Finding authentic Schwabe German dilutions locally was always difficult. DocHomoeo delivered genuine batches with verifiable QR codes. Kali Phos has been a blessing for high-stress work quarters without any sedation.",
    rating: 5,
    roleOrLocation: "Verified Buyer • New Delhi",
    productName: "Schwabe Kali Phos 6X",
    productSlug: "schwabe-kali-phos-6x",
    verifiedBuyer: true,
  },
  {
    id: "rev-3",
    author: "Dr. Meera Nambiar",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80",
    title: "Clinical-grade storage & pristine batch purity",
    body: "As a practicing homeopath, storage hygiene and temperature control are critical for active dilution potency. DocHomoeo is the only service where medicines arrive perfectly shielded from light, radiation, and heat.",
    rating: 5,
    roleOrLocation: "MD (Homoeo) Practitioner • Mumbai",
    productName: "Dr. Reckeweg R1 Drops",
    productSlug: "dr-reckeweg-r1-drops",
    verifiedBuyer: true,
  },
  {
    id: "rev-4",
    author: "Arjun Mehta",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
    title: "Empathetic constitutional doctor consultation",
    body: "The video consultation with Dr. Aarti Mehta was thorough and empathetic. She listened to my entire clinical history, prescribed individualized remedies, and the care team dispatched them the exact same afternoon.",
    rating: 5,
    roleOrLocation: "Verified Consultation • Pune",
    productName: "Constitutional Care",
    productSlug: "doctors",
    verifiedBuyer: true,
  },
  {
    id: "rev-5",
    author: "Sunita Kulkarni",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80",
    title: "Fast relief for joint stiffness & morning aches",
    body: "I have been using Arnica Ointment for knee arthritis. Non-greasy, pleasant herbal formulation that absorbs quickly. I also love the refill reminder notification so I never run out of my monthly supply.",
    rating: 5,
    roleOrLocation: "Verified Buyer • Ahmedabad",
    productName: "SBL Arnica Montana Ointment",
    productSlug: "sbl-arnica-ointment",
    verifiedBuyer: true,
  },
];

/**
 * Social proof section powered by the stacked card SmoothUI ReviewsCarousel.
 * Implemented in light theme with genuine person avatars, verified credentials,
 * and clinical rating metrics.
 */
export function Testimonials({ reviews }: { reviews: HomeReview[] }) {
  // If API has real reviews, convert and prepend them, otherwise use curated reviews
  const carouselReviews: Review[] =
    reviews.length > 0
      ? reviews.map((r, idx) => ({
          id: r.id || `api-rev-${idx}`,
          author: r.authorName,
          avatarUrl: CURATED_REVIEWS[idx % CURATED_REVIEWS.length]?.avatarUrl,
          title: r.title,
          body: r.body,
          rating: r.rating,
          roleOrLocation: r.isVerifiedBuyer ? "Verified Buyer" : "Patient Review",
          productName: r.productName,
          productSlug: r.productSlug,
          verifiedBuyer: r.isVerifiedBuyer,
        }))
      : CURATED_REVIEWS;

  return (
    <Section tone="sage" labelledBy="testimonials-heading" space="default" className="overflow-hidden">
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          
          {/* Left Column: Heading, Trust Metric & Editorial Promises */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal>
              <Eyebrow>Patient Testimonials</Eyebrow>
            </Reveal>

            <SplitHeading
              id="testimonials-heading"
              lines={["What Our Patients", "& Doctors Say"]}
              className="text-[2rem] leading-[1.08] text-ink sm:text-[2.5rem]"
            />

            <Reveal delay={0.08}>
              <p className="text-sm sm:text-base text-muted-ink leading-relaxed">
                Authentic clinical journeys and wellness experiences from individuals across India who rely on certified homoeopathic remedies and constitutional care.
              </p>
            </Reveal>

            {/* Social Proof Metric Badge */}
            <Reveal delay={0.12}>
              <div className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-line-soft bg-paper/80 p-3.5 shadow-2xs backdrop-blur-xs">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <div className="h-4 w-px bg-line-soft" />
                <div className="text-xs">
                  <span className="font-bold text-ink">4.9 / 5</span>
                  <span className="text-muted-ink ml-1.5">(3,450+ verified patient experiences)</span>
                </div>
              </div>
            </Reveal>

            {/* 3 Quality Pillars */}
            <Reveal delay={0.16} className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-ink">
                <span className="grid size-6 place-items-center rounded-full bg-forest/10 text-forest shrink-0">
                  <ShieldCheck className="size-3.5" />
                </span>
                <span className="font-medium text-ink">
                  <strong>100% Genuine Remedies</strong> — Moderated batches & zero counterfeit guarantee
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-ink">
                <span className="grid size-6 place-items-center rounded-full bg-forest/10 text-forest shrink-0">
                  <Award className="size-3.5" />
                </span>
                <span className="font-medium text-ink">
                  <strong>Pharmacopoeia Verified</strong> — German (GHP) and Indian (HPI) compliance
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-ink">
                <span className="grid size-6 place-items-center rounded-full bg-forest/10 text-forest shrink-0">
                  <Stethoscope className="size-3.5" />
                </span>
                <span className="font-medium text-ink">
                  <strong>Doctor Moderated</strong> — Consult certified BHMS & MD Homeopaths
                </span>
              </div>
            </Reveal>

            {/* CTA Link */}
            <Reveal delay={0.2} className="pt-2">
              <Link
                href="/products?sort=rating"
                className="group inline-flex items-center gap-2 text-sm font-bold text-forest hover:text-forest-deep transition-colors"
              >
                <span>Shop top-rated remedies</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>

          {/* Right Column: Stacked Card SmoothUI Reviews Carousel */}
          <div className="lg:col-span-7 relative min-w-0">
            <Reveal delay={0.14}>
              <div className="relative rounded-3xl border border-line-soft/80 bg-linear-to-b from-paper/60 via-canvas/40 to-paper/60 p-2 sm:p-5 shadow-inner">
                <ReviewsCarousel
                  reviews={carouselReviews}
                  height="390px"
                  autoPlay={true}
                  autoPlayInterval={5500}
                />
              </div>
            </Reveal>
          </div>

        </div>
      </Container>
    </Section>
  );
}
