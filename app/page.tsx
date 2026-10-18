import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { HeroPlaybackProvider } from "@/components/providers/HeroPlaybackContext";
import { unstable_rethrow } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { mapApiCardToProduct } from "@/lib/adapters/product";

import { HomeHero } from "@/sections/home/HomeHero";
import { HealthGoals } from "@/sections/home/HealthGoals";
import { BestsellingProducts, type HomeRail } from "@/sections/home/BestsellingProducts";
import { DoctorConsultation } from "@/sections/home/DoctorConsultation";
import { ConsultationJourney } from "@/sections/home/ConsultationJourney";
import { FeaturedCollection } from "@/sections/home/FeaturedCollection";
import { TrustedBrands } from "@/sections/home/TrustedBrands";
import { Testimonials, type HomeReview } from "@/sections/home/Testimonials";
import { CommunityFeedback } from "@/sections/home/CommunityFeedback";
import { HealthInsights } from "@/sections/home/HealthInsights";
import { OfferBanner, type CatalogueOffer } from "@/sections/home/OfferBanner";

/**
 * Revalidate the homepage every 60 seconds (ISR).
 * This enables instant sub-30ms global Edge delivery on Vercel while
 * keeping products, banners, and doctor schedules continuously up to date.
 */
export const revalidate = 60;

/** A request that may fail without taking the page down: its section is then left out. */
async function optional<T>(request: Promise<T>, fallback: T): Promise<T> {
  try {
    return await request;
  } catch (error) {
    // Next.js's own render signals must reach Next; only real failures fall back.
    unstable_rethrow(error);
    return fallback;
  }
}

/** Products whose reviews the homepage reads, from the top of the rails. */
const REVIEWED_PRODUCTS = 8;
const SHOWN_REVIEWS = 5;

export default async function HomePage() {
  // Every section reads the shop. If a source cannot be reached its section is
  // left out; nothing falls back to sample data.
  const [home, doctors, insights, deals] = await Promise.all([
    optional(repositories.home.getHomeData(), null),
    optional(repositories.care.listDoctors(), []),
    optional(repositories.insight.getInsights(1, 3), null),
    optional(repositories.search.search({ sort: "discount", pageSize: 1 }), null),
  ]);

  const rails: HomeRail[] = (home?.rails ?? []).map((rail) => ({
    key: rail.key,
    title: rail.title,
    href: rail.href,
    products: rail.items.map(mapApiCardToProduct),
  }));
  const brands = home?.brands ?? [];

  // Genuine reviews only: the approved reviews on the rail products' own pages
  // (the shop has no testimonials source of its own), newest first.
  const reviewedSlugs = [...new Set((home?.rails ?? []).flatMap((rail) => rail.items.map((item) => item.slug)))].slice(0, REVIEWED_PRODUCTS);
  const [details, nextSlot] = await Promise.all([
    Promise.all(reviewedSlugs.map((slug) => optional(repositories.product.getBySlug(slug), null))),
    doctors[0] ? optional(repositories.care.getNextSlot(doctors[0].slug), null) : Promise.resolve(null),
  ]);
  const reviews: HomeReview[] = details
    .flatMap((product) => (product ? product.reviews.map((review) => ({ ...review, productName: product.name, productSlug: product.slug })) : []))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, SHOWN_REVIEWS);

  // The offer is the catalogue's own biggest saving; nothing is shown when nothing is discounted.
  const topDiscount = deals?.items[0]?.discountPercent ?? 0;
  const offer: CatalogueOffer | null =
    topDiscount > 0 ? { maxDiscount: topDiscount, count: deals?.facets.discounts.find((step) => step.value === 10)?.count ?? 0 } : null;

  return (
    <HeroPlaybackProvider>
      <SiteHeader />

      <main id="main" className="flex-1">
        <HomeHero />
        <HealthGoals categories={home?.categories ?? []} />
        <BestsellingProducts rails={rails} brandNames={brands.map((brand) => brand.name)} unavailable={home === null} />
        <DoctorConsultation doctors={doctors} nextSlot={nextSlot} />
        <ConsultationJourney />
        <TrustedBrands brands={brands} />
        <FeaturedCollection />
        <Testimonials reviews={reviews} />
        <CommunityFeedback />
        <HealthInsights articles={insights?.items ?? []} />
        <OfferBanner offer={offer} />
      </main>

      <SiteFooter />
    </HeroPlaybackProvider>
  );
}
