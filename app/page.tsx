import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";

import { HomeHero } from "@/sections/home/HomeHero";
import { CategoryDiscovery } from "@/sections/home/CategoryDiscovery";
import { CuratedProductRail } from "@/sections/home/CuratedProductRail";
import { BrandShowcase } from "@/sections/home/BrandShowcase";
import { TrustSection } from "@/sections/home/TrustSection";
import { HealthInsights } from "@/sections/home/HealthInsights";

export const revalidate = 3600; // revalidate every hour or whenever Next.js allows

export default async function HomePage() {
  const homeData = await repositories.home.getHomeData();

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6] font-sans">
      <SiteHeader />

      <main id="main" className="flex-1">
        <HomeHero banner={homeData.banners[0]} />
        
        {homeData.categories.length > 0 && (
          <CategoryDiscovery categories={homeData.categories} />
        )}
        
        {homeData.rails.length > 0 && (
          <CuratedProductRail rail={homeData.rails[0]} />
        )}
        
        {homeData.brands.length > 0 && (
          <BrandShowcase brands={homeData.brands} />
        )}

        <TrustSection />
        <HealthInsights />
      </main>

      <SiteFooter />
    </div>
  );
}
