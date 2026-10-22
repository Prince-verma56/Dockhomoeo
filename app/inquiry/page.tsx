import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  FileCheck2,
  Truck,
  Headphones,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { InquiryForm } from "./InquiryForm";

export const metadata: Metadata = {
  title: "Bulk & Institutional Inquiries | DocHomoeo",
  description:
    "Direct wholesale supply, clinical dispensaries indenting, and institutional procurement for registered doctors, clinics, pharmacies, and healthcare establishments.",
};

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "100% Genuine Sealed Stock",
    desc: "Direct procurement from accredited manufacturers including SBL, Schwabe, Dr. Reckeweg, and Bakson.",
  },
  {
    icon: FileCheck2,
    title: "Batch COA & Traceability",
    desc: "Every batch verified with Certificate of Analysis, tamper-evident seals, and full shelf-life assurances.",
  },
  {
    icon: Truck,
    title: "Protected Glass Logistics",
    desc: "Specialized shock-resistant packaging designed specifically for fragile homoeopathic glass phials & liquids.",
  },
  {
    icon: Headphones,
    title: "Dedicated Account Support",
    desc: "Priority indent processing, scheduled recurring replenishment, and GST input credit documentation.",
  },
];

export default function BulkInquiryPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 overflow-x-clip bg-canvas">
        {/* Hero Band */}
        <section className="dh-band-sage relative overflow-hidden pt-28 pb-12 md:pt-36 md:pb-16">
          <Container width="default" className="relative z-10">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-deep/70 transition-colors hover:text-forest-deep"
              >
                <ArrowLeft className="size-3.5" />
                Return to Home
              </Link>
            </div>

            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-deep/20 bg-sage-wash/70 px-3 py-1 text-xs font-semibold text-forest-deep">
                <Building2 className="size-3.5" />
                Institutional Procurement Desk
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink">
                Wholesale & Bulk <span className="italic text-forest-deep">Supply</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-ink">
                Dedicated supply pipelines for registered homoeopathic practitioners,
                hospital OPDs, private clinics, and licensed chemists across India.
                Submit your indent specifications below for custom quotes and dispatch planning.
              </p>
            </div>

            {/* Value Highlights */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-line-soft bg-paper/80 p-5 shadow-xs backdrop-blur-sm"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-forest-deep text-white">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold text-sm text-ink">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-ink">{desc}</p>
                </div>
              ))}
            </div>
          </Container>

          {/* Decorative ambient gradient */}
          <div
            aria-hidden
            className="absolute top-0 right-0 -z-10 h-full w-full max-w-2xl bg-gradient-to-bl from-forest-deep/10 to-transparent blur-3xl opacity-60 pointer-events-none"
          />
        </section>

        {/* Form Section */}
        <section className="py-12 md:py-20">
          <Container width="narrow">
            <Reveal y={20}>
              <div className="mb-8 text-center sm:text-left">
                <h2 className="font-display text-2xl font-bold text-ink">
                  Institutional Indent & Inquiry Form
                </h2>
                <p className="mt-1 text-sm text-muted-ink">
                  Please provide your professional credentials and requisition profile.
                </p>
              </div>

              <InquiryForm />
            </Reveal>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
