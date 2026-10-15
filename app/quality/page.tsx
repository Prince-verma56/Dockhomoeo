import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Factory, Search, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Quality standards",
  description: "Learn about how DocHomoeo approaches product quality, transparency, and information accuracy.",
};

const principles = [
  {
    title: "Manufacturer Visibility",
    description: "We clearly display the brand and manufacturer for every product, so you always know the origin of your remedies.",
    icon: Factory,
  },
  {
    title: "Clear Formulations",
    description: "Where available, we provide detailed composition and ingredient information to help you and your practitioner make informed choices.",
    icon: Search,
  },
  {
    title: "Stock & Availability Clarity",
    description: "We maintain accurate inventory systems so you know exactly what is available, preventing delays in your health regimen.",
    icon: CheckCircle2,
  },
  {
    title: "Information Responsibility",
    description: "We focus on transparent product presentation without making exaggerated medical guarantees or unverified clinical claims.",
    icon: FileText,
  },
];

export default function QualityPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas">
        {/* Header */}
        <section className="dh-band-sage relative isolate overflow-hidden pt-28 pb-20 md:pt-40 md:pb-28">
          <Container width="narrow" className="text-center relative z-10">
            <div className="mb-6 mx-auto flex w-fit items-center gap-2 rounded-full border border-forest-deep/20 bg-forest-deep/5 px-4 py-1.5 text-sm font-bold tracking-wide text-forest-deep uppercase">
              <ShieldCheck className="size-4" />
              Our Commitment
            </div>
            <h1 className="font-display text-5xl leading-tight tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
              Quality & <span className="italic text-forest-deep">Transparency</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-muted-ink md:text-2xl">
              We believe that access to healthcare products should be built on a foundation of clear information, reliable sourcing, and responsible presentation.
            </p>
          </Container>
          {/* The brand's own scene photography (sunlit stone and sage, no
              product in shot), veiled toward the page so the copy stays crisp. */}
          <Image src="/Images/TestimonialsBg.webp" alt="" fill loading="eager" sizes="100vw" className="-z-10 object-cover object-[40%_50%]" />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(251,250,247,0.5)_0%,rgba(251,250,247,0.72)_55%,var(--dh-canvas)_100%)]"
          />
        </section>

        {/* Principles Grid */}
        <section className="py-16 md:py-24 bg-canvas">
          <Container width="wide">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
              {principles.map((principle) => {
                const Icon = principle.icon;
                return (
                  <div 
                    key={principle.title} 
                    className="group flex flex-col rounded-2xl bg-paper p-8 sm:p-10 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift border border-line-soft hover:border-forest/30"
                  >
                    <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-sage-wash text-forest-deep transition-colors duration-300 group-hover:bg-forest-deep group-hover:text-white">
                      <Icon className="size-8" />
                    </div>
                    <h3 className="mb-3 font-display text-2xl text-ink">
                      {principle.title}
                    </h3>
                    <p className="text-muted-ink leading-relaxed text-base">
                      {principle.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Disclaimer / Responsible Info section */}
        <section className="py-16 md:py-24 bg-canvas border-t border-line-soft">
          <Container width="narrow">
            <div className="rounded-2xl bg-paper p-8 sm:p-12 border border-line-soft shadow-soft text-center">
              <h2 className="mb-8 font-display text-4xl text-ink sm:text-5xl">
                Responsible Health Information
              </h2>
              <div className="space-y-6 text-xl text-muted-ink leading-relaxed max-w-2xl mx-auto">
                <p>
                  While we strive to provide comprehensive product details, DocHomoeo is a discovery and commerce platform, not a medical authority.
                </p>
                <p>
                  The information presented on our platform—including health insights, product descriptions, and category guides—is intended for educational and organizational purposes only. It is not meant to replace professional medical advice, diagnosis, or treatment.
                </p>
                <p className="font-bold text-ink">
                  Always seek the advice of your physician or qualified homoeopathic practitioner with any questions you may have regarding a medical condition or before starting any new treatment.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="py-24 text-center bg-forest-abyss">
          <Container width="narrow">
            <h2 className="mb-10 font-display text-4xl text-white sm:text-5xl">
              Trust in every step
            </h2>
            <div className="flex justify-center">
              <Button asChild size="lg" className="rounded-2xl bg-white text-forest-abyss hover:bg-sage-wash h-14 px-10 text-lg font-bold">
                <Link href="/brands">
                  View Our Brands
                  <ArrowRight className="ml-3 size-5" />
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
