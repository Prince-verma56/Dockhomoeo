import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Factory, Search } from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Quality Standards | DocHomoeo",
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
      <main id="main" className="flex-1 bg-ivory">
        {/* Header */}
        <section className="border-b border-forest-abyss/10 bg-white pt-24 pb-16 md:pt-32 md:pb-24">
          <Container width="narrow" className="text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-forest-abyss/10 bg-forest-abyss/5 px-4 py-1.5 text-sm font-medium text-forest-abyss">
              Our Commitment
            </div>
            <h1 className="font-display text-4xl leading-tight text-forest-abyss sm:text-5xl md:text-6xl">
              Quality & Transparency
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-forest-abyss/70 sm:text-xl">
              We believe that access to healthcare products should be built on a foundation of clear information, reliable sourcing, and responsible presentation.
            </p>
          </Container>
        </section>

        {/* Principles Grid */}
        <section className="py-16 md:py-24">
          <Container width="default">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
              {principles.map((principle) => {
                const Icon = principle.icon;
                return (
                  <div 
                    key={principle.title} 
                    className="group flex flex-col rounded-[2rem] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-forest-abyss/5 hover:border-forest-abyss/10 sm:p-10"
                  >
                    <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-[#F0F2EB] text-leaf-800 transition-colors duration-300 group-hover:bg-leaf-800 group-hover:text-white">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="mb-4 font-display text-2xl text-forest-abyss">
                      {principle.title}
                    </h3>
                    <p className="text-forest-abyss/70 leading-relaxed text-lg">
                      {principle.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Disclaimer / Responsible Info section */}
        <section className="py-16 md:py-24 bg-white border-t border-forest-abyss/5">
          <Container width="narrow">
            <div className="rounded-3xl bg-[#F0F2EB] p-8 sm:p-12 md:p-16">
              <h2 className="mb-6 font-display text-3xl text-forest-abyss">
                Responsible Health Information
              </h2>
              <div className="space-y-6 text-lg text-forest-abyss/75 leading-relaxed">
                <p>
                  While we strive to provide comprehensive product details, DocHomoeo is a discovery and commerce platform, not a medical authority.
                </p>
                <p>
                  The information presented on our platform—including health insights, product descriptions, and category guides—is intended for educational and organizational purposes only. It is not meant to replace professional medical advice, diagnosis, or treatment.
                </p>
                <p className="font-medium text-forest-abyss">
                  Always seek the advice of your physician or qualified homoeopathic practitioner with any questions you may have regarding a medical condition or before starting any new treatment.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <Container width="narrow">
            <h2 className="mb-6 font-display text-3xl text-forest-abyss">
              Trust in every step
            </h2>
            <div className="flex justify-center mt-8">
              <Button asChild size="lg" className="rounded-full bg-forest-abyss text-white hover:bg-forest-abyss/90 h-14 px-8 text-base">
                <Link href="/brands">
                  View Our Brands
                  <ArrowRight className="ml-2 size-5" />
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
