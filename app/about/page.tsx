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
      <main id="main" className="flex-1 bg-[#f6f2ea]">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32 border-b border-forest-abyss/5">
          <Container width="narrow" className="relative z-10 text-center">
            <h1 className="font-display text-5xl leading-tight tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
              Bringing clarity to <span className="italic text-forest-deep">natural healing.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-muted-ink md:text-2xl">
              We are on a mission to organize the world’s trusted homoeopathic remedies, making them accessible, transparent, and easy to discover for your family's health journey.
            </p>
          </Container>
          
          <div className="absolute top-0 right-0 -z-10 h-full w-full max-w-3xl bg-gradient-to-bl from-forest-deep/10 to-transparent blur-3xl opacity-60" />
        </section>

        {/* Narrative Section */}
        <section className="py-20 md:py-32 bg-white relative">
          <Container width="wide">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-24">
              <div className="relative aspect-[4/5] lg:aspect-[4/4] overflow-hidden rounded-[2.5rem] bg-forest-deep/5 shadow-2xl border border-forest-abyss/5">
                <Image
                  src="/Images/Family_Health.webp" 
                  alt="Family health and wellness"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-forest-deep">
                  <Leaf className="size-4" />
                  Our Philosophy
                </div>
                <h2 className="mb-8 font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
                  A modern approach to classical wellness
                </h2>
                <div className="space-y-6 text-xl leading-relaxed text-muted-ink">
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
        <section className="py-20 md:py-32 bg-[#f6f2ea]">
          <Container width="wide">
            <div className="mb-20 text-center">
              <h2 className="font-display text-4xl text-ink sm:text-5xl">
                What drives us
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:gap-16">
              <div className="flex flex-col items-center text-center p-10 bg-white rounded-[2rem] border border-forest-abyss/5 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="mb-8 flex size-20 items-center justify-center rounded-full bg-forest-deep/10 text-forest-deep">
                  <ShieldCheck className="size-10" />
                </div>
                <h3 className="mb-4 font-display text-3xl text-ink">Trusted Sources</h3>
                <p className="text-muted-ink leading-relaxed text-lg">
                  We partner strictly with respected manufacturers who adhere to established homoeopathic pharmacopoeia standards.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-10 bg-white rounded-[2rem] border border-forest-abyss/5 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="mb-8 flex size-20 items-center justify-center rounded-full bg-forest-deep/10 text-forest-deep">
                  <HeartPulse className="size-10" />
                </div>
                <h3 className="mb-4 font-display text-3xl text-ink">Empowered Care</h3>
                <p className="text-muted-ink leading-relaxed text-lg">
                  We provide transparent product information, clear ingredients, and health insights to support your wellness journey.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-10 bg-white rounded-[2rem] border border-forest-abyss/5 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="mb-8 flex size-20 items-center justify-center rounded-full bg-forest-deep/10 text-forest-deep">
                  <Leaf className="size-10" />
                </div>
                <h3 className="mb-4 font-display text-3xl text-ink">Digital Clarity</h3>
                <p className="text-muted-ink leading-relaxed text-lg">
                  A seamless, noise-free shopping experience designed specifically for discovering and organizing natural remedies.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="bg-forest-abyss py-24 text-center">
          <Container width="narrow">
            <h2 className="mb-6 font-display text-4xl text-white sm:text-5xl">
              Ready to explore?
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-xl text-white/70">
              Browse our catalog of high-quality products or discover remedies by your specific health goals.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-2xl bg-white text-forest-abyss hover:bg-[#f6f2ea] h-14 px-10 text-lg font-bold">
                <Link href="/products">
                  Shop All Products
                  <ArrowRight className="ml-3 size-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/20 text-white hover:bg-white/10 h-14 px-10 text-lg font-bold bg-transparent">
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
