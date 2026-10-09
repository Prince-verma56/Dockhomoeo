import { Metadata } from "next";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | DocHomoeo",
  description: "Get in touch with DocHomoeo for order support, product inquiries, and general questions.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[#f6f2ea]">
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32 border-b border-forest-abyss/5">
          <Container width="default" className="relative z-10">
            {/* Header */}
            <div className="mb-16 text-center md:mb-24">
              <h1 className="font-display text-5xl leading-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
                How can we <span className="italic text-forest-deep">help?</span>
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-muted-ink md:text-2xl">
                Whether you have a question about a product, need help with an order, or want to discuss a partnership, we’re here for you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px] lg:gap-24">
              {/* Form Column */}
              <div className="rounded-[2.5rem] bg-white p-10 shadow-xl sm:p-12 md:p-14 border border-forest-abyss/5">
                <h2 className="mb-8 font-display text-3xl text-ink sm:text-4xl">
                  Send us a message
                </h2>
                <ContactForm />
              </div>

              {/* Info Column */}
              <div className="flex flex-col gap-12 lg:pt-12">
                <div>
                  <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-[#f6f2ea] text-forest-deep">
                    <MessageSquare className="size-8" />
                  </div>
                  <h3 className="mb-3 font-display text-2xl text-ink">Order Support</h3>
                  <p className="text-muted-ink leading-relaxed text-lg">
                    Need help tracking your order or managing a return? Contact our support team directly.
                  </p>
                </div>

                <div>
                  <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-[#f6f2ea] text-forest-deep">
                    <Mail className="size-8" />
                  </div>
                  <h3 className="mb-3 font-display text-2xl text-ink">General Enquiries</h3>
                  <p className="text-muted-ink leading-relaxed text-lg">
                    hello@dochomoeo.com<br/>
                    We aim to respond within 24-48 hours.
                  </p>
                </div>

                <div>
                  <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-[#f6f2ea] text-forest-deep">
                    <MapPin className="size-8" />
                  </div>
                  <h3 className="mb-3 font-display text-2xl text-ink">Corporate Office</h3>
                  <p className="text-muted-ink leading-relaxed text-lg">
                    DocHomoeo Wellness<br/>
                    (Demo Location)<br/>
                    Health & Commerce Hub
                  </p>
                </div>
              </div>
            </div>
          </Container>
          <div className="absolute top-0 right-0 -z-10 h-full w-full max-w-3xl bg-gradient-to-bl from-forest-deep/10 to-transparent blur-3xl opacity-60" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
