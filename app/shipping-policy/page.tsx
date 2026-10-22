import { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, type LegalSection } from "@/components/shared/LegalPageLayout";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "DocHomoeo's shipping policy — where we ship from, delivery timelines, shipping costs, and how to track your package.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "ship-from",
    label: "Where We Ship From",
    title: "1. Where do you ship from?",
    content: (
      <p>
        We ship directly from our climate-controlled central dispensary warehouse in{" "}
        <strong>Prayagraj, Uttar Pradesh</strong>.
      </p>
    ),
  },
  {
    id: "service",
    label: "Shipping Service",
    title: "2. What shipping service do you use?",
    content: (
      <p>
        Most packages are shipped via accredited express courier partners including{" "}
        <strong>Shiprocket</strong>, <strong>Blue Dart</strong>, and{" "}
        <strong>Delhivery</strong>. For rural or interior locations, we utilize{" "}
        <strong>India Post (Speed Post)</strong> to ensure reliable delivery.
      </p>
    ),
  },
  {
    id: "timeline",
    label: "Delivery Timeline",
    title: "3. When will I receive my shipment?",
    content: (
      <>
        <p>
          We pack and hand over all orders placed before 12:00 PM IST Monday through Saturday.
          Orders placed over the weekend are scheduled for Monday dispatch.
        </p>
        <ul>
          <li>
            <strong>Metro & Tier-1 Cities:</strong> Packages typically arrive in{" "}
            <strong>2–4 business days</strong>.
          </li>
          <li>
            <strong>Rest of India:</strong> Delivery turnaround is typically{" "}
            <strong>3–7 business days</strong>.
          </li>
          <li>
            <strong>International Deliveries:</strong> Packages take approximately{" "}
            <strong>7–14 business days</strong> depending on destination customs clearance.
          </li>
        </ul>
        <div className="legal-callout mt-4">
          <p>
            <strong>Weather & Force Majeure:</strong> Extreme weather events, regional transit
            disruptions, or festive parcel volumes can affect delivery speeds. Real-time updates
            are trackable via courier carrier websites.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "cost",
    label: "Shipping Cost",
    title: "4. How much does shipping cost?",
    content: (
      <p>
        Standard shipping across India for orders above <strong>₹399</strong> is{" "}
        <strong>completely free</strong>. For orders below ₹399, a nominal delivery
        fee of ₹49 is applied at checkout.
      </p>
    ),
  },
  {
    id: "tracking",
    label: "Track Your Package",
    title: "5. How do I track my package?",
    content: (
      <p>
        You can check the live transit status of your package at any time by visiting your{" "}
        <Link href="/account/orders" className="font-semibold text-forest-deep underline">
          My Orders account page
        </Link>{" "}
        where your assigned AWB and carrier tracking links are updated in real-time.
      </p>
    ),
  },
  {
    id: "cancellation",
    label: "Shipment Cancellation",
    title: "6. Can I cancel my shipment?",
    content: (
      <p>
        Orders can be cancelled free of charge before the packaging and courier dispatch stage.
        Once parcels have been picked up and scanned by the courier, packages cannot be cancelled
        in transit. You may refuse delivery or request a return upon delivery.
      </p>
    ),
  },
];

const CALLOUT = (
  <p>
    For any shipping-related queries or urgent delivery coordination, please contact our logistics desk at{" "}
    <a href="mailto:contact.dochomoeo@gmail.com" className="font-semibold text-forest-deep underline">
      contact.dochomoeo@gmail.com
    </a>
    .
  </p>
);

export default function ShippingPolicyPage() {
  return (
    <LegalPageLayout
      title="Shipping Policy"
      intro="Everything you need to know about how your DocHomoeo medicines and wellness remedies are safely packed and delivered."
      sections={SECTIONS}
      callout={CALLOUT}
    />
  );
}
