import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { DemoContentNotice } from "@/components/shared/DemoContentNotice";
import { HeroPlaybackProvider } from "@/components/providers/HeroPlaybackContext";

import { HomeHero } from "@/sections/home/HomeHero";
import { HealthGoals } from "@/sections/home/HealthGoals";
import { BestsellingProducts } from "@/sections/home/BestsellingProducts";
import { DoctorConsultation } from "@/sections/home/DoctorConsultation";
import { ConsultationJourney } from "@/sections/home/ConsultationJourney";
import { FeaturedCollection } from "@/sections/home/FeaturedCollection";
import { TrustedBrands } from "@/sections/home/TrustedBrands";
import { Testimonials } from "@/sections/home/Testimonials";
import { HealthInsights } from "@/sections/home/HealthInsights";
import { OfferBanner } from "@/sections/home/OfferBanner";

/**
 * The homepage composes sections wrapped inside HeroPlaybackProvider
 * so the SiteHeader and HomeHero synchronize the hero video timeline:
 * - 0s - 5s: Cinematic video playthrough
 * - At 5s: Floating SiteHeader appears first
 * - Staggered right after: Hero headline, copy, CTAs, and trust cards appear
 * - Video pauses cleanly upon completion
 */
export default function HomePage() {
  return (
    <HeroPlaybackProvider>
      <SiteHeader />

      <main id="main" className="flex-1">
        <HomeHero />
        <HealthGoals />
        <BestsellingProducts />
        <DoctorConsultation />
        <ConsultationJourney />
        <TrustedBrands />
        <FeaturedCollection />
        <Testimonials />
        <HealthInsights />
        <OfferBanner />
      </main>

      <DemoContentNotice />
      <SiteFooter />
    </HeroPlaybackProvider>
  );
}
