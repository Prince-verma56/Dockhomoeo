import { Metadata } from "next";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { ContactForm } from "./ContactForm";
import { ContactFaqs } from "@/sections/contact/ContactFaqs";
import { FAQ_GROUPS } from "@/data/faqs";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with DocHomoeo for order support, product inquiries, and general questions.",
};

/** FAQPage structured data, from the same questions the page shows. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((group) => group.items).map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 overflow-x-clip bg-canvas">
        <section className="dh-band-sage relative overflow-hidden dh-page-top pb-(--dh-space-section) md:pt-36">
          <Container width="default" className="relative z-10">
            {/* Header */}
            <div className="mb-12 text-center md:mb-16">
              <h1 className="dh-title-hero text-ink">
                How can we <span className="italic text-forest-deep">help?</span>
              </h1>
              <p className="dh-lede mx-auto mt-5 max-w-2xl">
                Whether you have a question about a product, need help with an order, or want to discuss a partnership, we’re here for you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
              {/* Form Column */}
              <div className="dh-pad-card-lg rounded-[1.5rem] border border-line-soft bg-paper shadow-soft">
                <h2 className="dh-title-section mb-7 text-ink">
                  Send us a message
                </h2>
                <ContactForm />
              </div>

              {/* Info Column */}
              <div className="flex flex-col gap-9 lg:pt-8">
                <div>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-sage-wash text-forest-deep">
                    <MessageSquare className="size-5" />
                  </div>
                  <h3 className="dh-title-card mb-2 text-ink">Order Support</h3>
                  <p className="dh-body">
                    Need help tracking your order or managing a return? Contact our support team directly.
                  </p>
                </div>

                <div>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-sage-wash text-forest-deep">
                    <Mail className="size-5" />
                  </div>
                  <h3 className="dh-title-card mb-2 text-ink">General Enquiries</h3>
                  <p className="dh-body">
                    hello@dochomoeo.com<br/>
                    We aim to respond within 24-48 hours.
                  </p>
                </div>

                <div>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-sage-wash text-forest-deep">
                    <MapPin className="size-5" />
                  </div>
                  <h3 className="dh-title-card mb-2 text-ink">Corporate Office</h3>
                  <p className="dh-body">
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

        <ContactFaqs groups={FAQ_GROUPS} />
        <script
          type="application/ld+json"
          // Escaped so no answer text can close the script element.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
