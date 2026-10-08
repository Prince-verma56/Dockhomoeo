import { Metadata } from "next";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { BrandCard } from "@/components/commerce/BrandCard";
import Link from "next/link";
import { ArrowRight, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Brands | DocHomoeo",
  description: "Discover trusted homoeopathic brands and manufacturers available on DocHomoeo.",
};

export default async function BrandsPage() {
  const homeData = await repositories.home.getHomeData();
  
  // Sort brands alphabetically
  const brands = [...homeData.brands].sort((a, b) => a.name.localeCompare(b.name));

  // Extract featured brands (simulate by picking top 3 or specific ones)
  const featuredBrands = brands.slice(0, 2);
  const directoryBrands = brands; // All brands for the directory

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-ivory">
        {/* Editorial Header */}
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 border-b border-forest-abyss/5">
          <Container width="narrow" className="relative z-10 text-center">
             <div className="mb-6 mx-auto flex w-fit items-center gap-2 rounded-full border border-forest-abyss/10 bg-forest-abyss/5 px-4 py-1.5 text-sm font-semibold tracking-wide text-forest-abyss uppercase">
              <Building2 className="size-4" />
              Partners in Health
            </div>
            <h1 className="font-display text-5xl leading-tight tracking-tight text-forest-abyss sm:text-6xl md:text-7xl">
              Our <span className="italic text-leaf-800">Manufacturers</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-forest-abyss/70 sm:text-xl">
              We partner strictly with respected manufacturers who adhere to established homoeopathic pharmacopoeia standards.
            </p>
          </Container>
          <div className="absolute top-0 left-1/2 -z-10 h-full w-full max-w-5xl -translate-x-1/2 bg-gradient-to-b from-sage-100/50 to-transparent blur-3xl opacity-60" />
        </section>

        {/* Featured Brands */}
        {featuredBrands.length > 0 && (
          <section className="py-16 md:py-24 bg-white">
            <Container width="wide">
              <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-forest-abyss/10 pb-6 gap-4">
                <div>
                  <h2 className="font-display text-3xl text-forest-abyss">Recommended Brands</h2>
                  <p className="mt-2 text-forest-abyss/60">Curated selections from our most trusted partners.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:gap-8">
                {featuredBrands.map((brand) => (
                  <BrandCard key={`featured-${brand.id}`} brand={brand} />
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Brand Directory */}
        <section className="py-16 md:py-24">
          <Container width="wide">
            <div className="mb-12 border-b border-forest-abyss/10 pb-6">
              <h2 className="font-display text-3xl text-forest-abyss">A-Z Directory</h2>
              <p className="mt-2 text-forest-abyss/60">Explore our complete catalog of manufacturers.</p>
            </div>

            {directoryBrands.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-8">
                {directoryBrands.map((brand) => (
                  <BrandCard key={`dir-${brand.id}`} brand={brand} />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center">
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-forest-abyss/5 text-forest-abyss/20">
                  <Search className="size-8" />
                </div>
                <h3 className="font-display text-2xl text-forest-abyss mb-2">No brands found</h3>
                <p className="text-forest-abyss/60">We are currently updating our manufacturer directory.</p>
              </div>
            )}
          </Container>
        </section>
        
        {/* CTA */}
        <section className="py-16 md:py-24 text-center border-t border-forest-abyss/5 bg-white">
          <Container width="narrow">
            <h2 className="mb-8 font-display text-3xl text-forest-abyss">Explore by Health Goal</h2>
            <Button asChild size="lg" className="rounded-full bg-forest-abyss text-white hover:bg-forest-abyss/90 h-14 px-8 text-base">
              <Link href="/categories">
                View all categories
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
