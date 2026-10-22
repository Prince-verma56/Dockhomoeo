import { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/shared/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "DocHomoeo's terms and conditions governing use of the website and services.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    label: "Acceptance of Terms",
    content: (
      <>
        <p>
          By accessing or using the DocHomoeo website (
          <a
            href="https://dochomoeo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest-deep underline hover:text-forest-deep/80 font-medium"
          >
            dochomoeo.com
          </a>
          ), you agree to be bound by these Terms and Conditions. If you do not
          agree to these terms, please do not use or access our Website.
        </p>
        <p>
          By mere use of the Website, you expressly consent to our use and
          disclosure of your personal information in accordance with our{" "}
          <Link
            href="/privacy-policy"
            className="text-forest-deep underline hover:text-forest-deep/80 font-medium"
          >
            Privacy Policy
          </Link>
          . These Terms of Use are subject to change at any time without notice.
          Please review them periodically.
        </p>
      </>
    ),
  },
  {
    id: "services",
    label: "Services",
    content: (
      <>
        <p>
          DocHomoeo provides an online platform for purchasing homoeopathic
          medicines and related products, consulting with verified homoeopathic
          doctors, and accessing health-related information. Our key services
          include:
        </p>
        <ol className="list-decimal pl-5 space-y-2 my-3">
          <li>
            <strong>Online Homoeopathic Medicine Delivery:</strong> Door-to-door
            delivery of homoeopathic remedies.
          </li>
          <li>
            <strong>Online Doctor Consultations:</strong> Connecting patients with
            experienced homoeopathic practitioners for personalized consultations.
          </li>
          <li>
            <strong>Bulk Inquiry for Doctors:</strong> A bulk inquiry service with
            discounts for healthcare professionals.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: "accounts",
    label: "User Accounts",
    content: (
      <>
        <p>
          You will be required to register and create an account to access certain
          features. You are responsible for maintaining the confidentiality of
          your account credentials. You must provide accurate, current, and
          complete information during registration.
        </p>
        <p>
          You will be required to enter a valid phone number while placing an
          order on the Website. By registering your phone number with us, you
          consent to be contacted by us via phone calls, SMS notifications, mobile
          applications and/or any other electronic mode of communication in case
          of any order or shipment or delivery related updates.
        </p>
      </>
    ),
  },
  {
    id: "ordering",
    label: "Ordering & Payments",
    content: (
      <>
        <p>
          All payments made against the purchases/services on Website by you shall
          be compulsorily in Indian Rupees acceptable in the Republic of India.
          Website will not facilitate transaction with respect to any other form of
          currency.
        </p>
        <p>
          DocHomoeo reserves the right to refuse to process transactions by Buyers
          with a prior history of questionable charges including without
          limitation breach of any agreements by Buyer with DocHomoeo or
          breach/violation of any law.
        </p>
        <p>
          The Cash on Delivery feature for payment may be disabled for certain
          account users at the sole discretion of DocHomoeo.
        </p>
      </>
    ),
  },
  {
    id: "cancellation",
    label: "Cancellation & Returns",
    content: (
      <>
        <p>
          Packages cannot be cancelled once they are in transit. Packages can only
          be cancelled if a shipping label has not been created yet. For detailed
          return, replacement, and refund policies, please refer to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 my-3">
          <li>
            <Link
              href="/return-cancellation"
              className="text-forest-deep underline hover:text-forest-deep/80 font-medium"
            >
              Return &amp; Cancellation Policy
            </Link>
          </li>
          <li>
            <Link
              href="/refund-policy"
              className="text-forest-deep underline hover:text-forest-deep/80 font-medium"
            >
              Refund Policy
            </Link>
          </li>
          <li>
            <Link
              href="/shipping-policy"
              className="text-forest-deep underline hover:text-forest-deep/80 font-medium"
            >
              Shipping Policy
            </Link>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "intellectual-property",
    label: "Intellectual Property",
    content: (
      <>
        <p>
          This site is controlled and operated by DocHomoeo powered by Jyoti
          Homoeo Centre. All material on this site, including images,
          illustrations, audio clips, and video clips, are protected by
          copyrights, trademarks, and other intellectual property rights.
        </p>
        <p>
          Material on the Website is solely for your personal, non-commercial
          use. You must not copy, reproduce, republish, upload, post, transmit or
          distribute such material in any way without prior written consent.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    label: "Limitation of Liability",
    content: (
      <>
        <p>
          This Website, all materials and products and services are provided on
          an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without any
          representation or warranties, express or implied except otherwise
          specified in writing.
        </p>
        <p className="font-semibold text-ink">
          In no event shall DocHomoeo be liable for any special, incidental,
          indirect or consequential damages of any kind in connection with these
          Terms, even if the user has been informed in advance of the
          possibility of such damages.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    label: "Governing Law",
    content: (
      <p>
        These Terms shall be governed by and interpreted and construed in
        accordance with the laws of India. The place of jurisdiction shall be
        exclusively in New Delhi.
      </p>
    ),
  },
  {
    id: "contact",
    label: "Contact Information",
    content: (
      <p>
        For any questions or concerns regarding these Terms and Conditions,
        please contact us at{" "}
        <a
          href="mailto:contact.dochomoeo@gmail.com"
          className="text-forest-deep underline hover:text-forest-deep/80 font-medium"
        >
          contact.dochomoeo@gmail.com
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      intro="Please read these Terms and Conditions carefully before using the DocHomoeo website, clinical consultations, and delivery services."
      lastUpdated="October 2026"
      sections={SECTIONS}
      callout={
        <div className="flex items-start gap-3.5">
          <div className="size-2 rounded-full bg-[#0d5a43] shrink-0 mt-2" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Official Compliance Notice &amp; Archival Record
            </h4>
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
              The original legacy Terms &amp; Conditions were recorded as an authenticated scanned document (<span className="font-mono text-[11px] bg-white/70 dark:bg-white/10 px-1.5 py-0.5 rounded border border-black/[0.06]">form.pdf</span>). The text above reflects the comprehensive codified standard for DocHomoeo. For verified legal inquiries or copies of historical filings, reach out to our legal department at{" "}
              <a
                href="mailto:contact.dochomoeo@gmail.com"
                className="text-[#0d5a43] dark:text-emerald-400 font-semibold underline underline-offset-2 hover:text-[#074231]"
              >
                contact.dochomoeo@gmail.com
              </a>.
            </p>
          </div>
        </div>
      }
    />
  );
}
