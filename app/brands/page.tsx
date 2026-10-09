import { Metadata } from "next";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { BrandCard } from "@/components/commerce/BrandCard";
import Link from "next/link";
import { ArrowRight, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Brands | DocHomoeo",
  description: "Discover trusted homoeopathic brands and manufacturers available on DocHomoeo.",
};

export default async function BrandsPage() {
  const homeData = await repositories.home.getHomeData();
  
  // Sort brands alphabetically
  const brands = [...homeData.brands].sort((a, b) => a.name.localeCompare(b.name));

  // Extract featured brands (simulate by picking top 2)
  const featuredBrands = brands.slice(0, 2);
  const directoryBrands = brands.slice(2);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[#f6f2ea]">
        {/* Editorial Header */}
        <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 border-b border-forest-abyss/5">
          <Container width="wide" className="relative z-10">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center space-x-2 text-sm font-medium text-muted-ink">
              <Link href="/" className="hover:text-forest-deep transition-colors">Home</Link>
              <ChevronRight className="size-4" />
              <span className="text-ink">Brands</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="font-display text-5xl leading-tight tracking-tight text-ink sm:text-6xl md:text-7xl">
                Our <span className="italic text-forest-deep">Manufacturers</span>
              </h1>
              <p className="mt-6 text-xl leading-relaxed text-muted-ink">
                We partner strictly with respected manufacturers who adhere to established homoeopathic pharmacopoeia standards, bringing you authentic, pure, and effective remedies.
              </p>
            </div>
          </Container>
          <div className="absolute top-0 right-0 -z-10 h-full w-full max-w-2xl bg-gradient-to-bl from-forest-deep/10 to-transparent blur-3xl opacity-60" />
        </section>

        {/* Featured Brands */}
        {featuredBrands.length > 0 && (
          <section className="py-16 md:py-24 bg-white border-b border-forest-abyss/5">
            <Container width="wide">
              <div className="mb-12">
                <h2 className="font-display text-4xl text-ink">Recommended Partners</h2>
                <p className="mt-4 text-lg text-muted-ink max-w-2xl">Curated selections from our most trusted partners, chosen for their legacy and commitment to quality.</p>
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                {featuredBrands.map((brand) => (
                  <BrandCard key={`featured-${brand.id}`} brand={brand} isFeatured />
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Brand Directory */}
        <section className="py-16 md:py-24 bg-[#f6f2ea]">
          <Container width="wide">
            <div className="mb-12">
              <h2 className="font-display text-4xl text-ink">A-Z Directory</h2>
              <p className="mt-4 text-lg text-muted-ink max-w-2xl">Explore our complete catalog of manufacturers.</p>
            </div>

            {directoryBrands.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-8">
                {directoryBrands.map((brand) => (
                  <BrandCard key={`dir-${brand.id}`} brand={brand} />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center rounded-[2rem] bg-white border border-forest-abyss/5">
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-forest-abyss/5 text-forest-abyss/20">
                  <Search className="size-8" />
                </div>
                <h3 className="font-display text-3xl text-ink mb-2">No other brands found</h3>
                <p className="text-lg text-muted-ink">We are currently updating our manufacturer directory.</p>
              </div>
            )}
          </Container>
        </section>
        
        {/* CTA */}
        <section className="py-24 text-center bg-forest-abyss">
          <Container width="narrow">
            <h2 className="mb-8 font-display text-4xl text-white">Explore by Health Goal</h2>
            <Button asChild size="lg" className="rounded-2xl bg-white text-forest-abyss hover:bg-[#f6f2ea] h-14 px-10 text-lg font-bold">
              <Link href="/categories">
                View all categories
                <ArrowRight className="ml-3 size-5" />
              </Link>
            </Button>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
