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
      <main id="main" className="flex-1 bg-ivory">
        <section className="pt-24 pb-16 md:pt-32 md:pb-24">
          <Container width="default">
            {/* Header */}
            <div className="mb-16 text-center md:mb-24">
              <h1 className="font-display text-4xl leading-tight text-forest-abyss sm:text-5xl md:text-6xl">
                How can we help?
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-forest-abyss/70 sm:text-xl">
                Whether you have a question about a product, need help with an order, or want to discuss a partnership, we’re here for you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px] lg:gap-24">
              {/* Form Column */}
              <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-10 md:p-12 border border-forest-abyss/5">
                <h2 className="mb-8 font-display text-3xl text-forest-abyss">
                  Send us a message
                </h2>
                <ContactForm />
              </div>

              {/* Info Column */}
              <div className="flex flex-col gap-10 lg:pt-12">
                <div>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-sage-100 text-forest-abyss">
                    <MessageSquare className="size-6" />
                  </div>
                  <h3 className="mb-2 font-display text-xl text-forest-abyss">Order Support</h3>
                  <p className="text-forest-abyss/70 leading-relaxed">
                    Need help tracking your order or managing a return? Contact our support team directly.
                  </p>
                </div>

                <div>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-sage-100 text-forest-abyss">
                    <Mail className="size-6" />
                  </div>
                  <h3 className="mb-2 font-display text-xl text-forest-abyss">General Enquiries</h3>
                  <p className="text-forest-abyss/70 leading-relaxed">
                    hello@dochomoeo.com<br/>
                    We aim to respond within 24-48 hours.
                  </p>
                </div>

                <div>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-sage-100 text-forest-abyss">
                    <MapPin className="size-6" />
                  </div>
                  <h3 className="mb-2 font-display text-xl text-forest-abyss">Corporate Office</h3>
                  <p className="text-forest-abyss/70 leading-relaxed">
                    DocHomoeo Wellness<br/>
                    (Demo Location)<br/>
                    Health & Commerce Hub
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
