import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, HeartPulse } from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us | DocHomoeo",
  description: "Learn about DocHomoeo's mission to provide transparent, trusted, and organized access to homoeopathic products.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-ivory">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
          <Container width="narrow" className="relative z-10 text-center">
            <h1 className="font-display text-5xl leading-tight tracking-tight text-forest-abyss sm:text-6xl md:text-7xl">
              Bringing clarity to <span className="italic text-leaf-800">natural healing.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-forest-abyss/80 md:text-2xl">
              We are on a mission to organize the world’s trusted homoeopathic remedies, making them accessible, transparent, and easy to discover for your family's health journey.
            </p>
          </Container>
          
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-1/2 -z-10 h-full w-full max-w-5xl -translate-x-1/2 bg-gradient-to-b from-sage-100/50 to-transparent blur-3xl" />
        </section>

        {/* Narrative Section */}
        <section className="py-16 md:py-24 bg-white">
          <Container width="default">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-24">
              <div className="relative aspect-[4/5] lg:aspect-square overflow-hidden rounded-[2.5rem] bg-[#F0F2EB] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-forest-abyss/5">
                <Image
                  src="/Images/Family_Health.webp" // Assuming this image exists from earlier context
                  alt="Family health and wellness"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="mb-6 text-sm font-semibold uppercase tracking-widest text-sage-600">
                  Our Philosophy
                </div>
                <h2 className="mb-6 font-display text-3xl leading-tight text-forest-abyss sm:text-4xl">
                  A modern approach to classical wellness
                </h2>
                <div className="space-y-6 text-lg leading-relaxed text-forest-abyss/70">
                  <p>
                    Navigating the world of homoeopathy can often feel overwhelming. With thousands of remedies, differing potencies, and various manufacturers, finding the right product requires both trust and clarity.
                  </p>
                  <p>
                    DocHomoeo was created to solve exactly this. We’ve built a curated, highly organized platform that treats product discovery with the respect and precision that healthcare demands.
                  </p>
                  <p>
                    Whether you are a seasoned practitioner or a parent looking for gentle natural care, our catalog is structured to help you make informed, confident choices.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Core Values */}
        <section className="py-16 md:py-24">
          <Container width="default">
            <div className="mb-16 text-center">
              <h2 className="font-display text-3xl text-forest-abyss sm:text-4xl">
                What drives us
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-sage-100 text-forest-abyss">
                  <ShieldCheck className="size-8" />
                </div>
                <h3 className="mb-4 font-display text-2xl text-forest-abyss">Trusted Sources</h3>
                <p className="text-forest-abyss/70 leading-relaxed">
                  We partner strictly with respected manufacturers who adhere to established homoeopathic pharmacopoeia standards.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-sage-100 text-forest-abyss">
                  <HeartPulse className="size-8" />
                </div>
                <h3 className="mb-4 font-display text-2xl text-forest-abyss">Empowered Care</h3>
                <p className="text-forest-abyss/70 leading-relaxed">
                  We provide transparent product information, clear ingredients, and health insights to support your wellness journey.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-sage-100 text-forest-abyss">
                  <Leaf className="size-8" />
                </div>
                <h3 className="mb-4 font-display text-2xl text-forest-abyss">Digital Clarity</h3>
                <p className="text-forest-abyss/70 leading-relaxed">
                  A seamless, noise-free shopping experience designed specifically for discovering and organizing natural remedies.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="border-t border-forest-abyss/5 bg-white py-24 text-center">
          <Container width="narrow">
            <h2 className="mb-6 font-display text-3xl text-forest-abyss sm:text-4xl">
              Ready to explore?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-forest-abyss/70">
              Browse our catalog of high-quality products or discover remedies by your specific health goals.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-forest-abyss text-white hover:bg-forest-abyss/90 h-14 px-8 text-base">
                <Link href="/products">
                  Shop All Products
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-forest-abyss/20 text-forest-abyss hover:bg-forest-abyss/5 h-14 px-8 text-base">
                <Link href="/categories">
                  Explore Categories
                </Link>
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
