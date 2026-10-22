import { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/shared/LegalPageLayout";

export const metadata: Metadata = {
  title: "Return & Cancellation Policy",
  description:
    "DocHomoeo's return, replacement, and cancellation policy for orders and products.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "return",
    label: "Return Policy",
    title: "Return Policy",
    content: (
      <p>
        &ldquo;Return&rdquo; is defined as the action of giving back the item
        purchased by the Buyer to DocHomoeo on the DocHomoeo platform.
      </p>
    ),
  },
  {
    id: "replacement",
    label: "Replacement Guarantee",
    title: "Replacement Guarantee",
    content: (
      <p>
        &ldquo;Replacement&rdquo; is the action or process of replacing
        something in place of another. A Buyer can request for replacement
        whenever they are not satisfied with the item, reasons being damaged in
        shipping, defective preparation, items missing, wrong medicine shipped, and the
        like.
      </p>
    ),
  },
  {
    id: "reasons",
    label: "Reasons for Return",
    title: "Reasons for Return / Replacement",
    content: (
      <>
        <p>
          Buyer is asked for &ldquo;Reason for Return/Replacement&rdquo;. Among
          others, the following are the leading reasons:
        </p>
        <ul>
          <li>Item was defective or broken upon arrival</li>
          <li>Item was damaged during transit/shipping</li>
          <li>Products were missing from parcel</li>
          <li>Wrong item, potency or dilution was sent</li>
          <li>Item delivered had packaging seal compromised</li>
          <li>Item was expired</li>
        </ul>
        <p>
          Return could also result in a refund of money in most cases upon
          approval of the return/replacement request by our quality assurance desk.
        </p>
      </>
    ),
  },
  {
    id: "conditions",
    label: "Acceptance Conditions",
    title: "Return Acceptance Conditions",
    content: (
      <>
        <p>
          Conveniently place your return request online by raising an issue in
          your DocHomoeo account or by mailing us at:{" "}
          <a href="mailto:contact.dochomoeo@gmail.com" className="font-semibold text-forest-deep underline">
            contact@dochomoeo.com
          </a>
        </p>

        <h3 className="text-base font-bold text-ink mt-4 mb-2">Wrong Product / Size Exchange</h3>
        <p>
          In case of a Wrong Product/Size Exchange issue can be raised within{" "}
          <strong>7 days</strong> of order delivery along with photographs (of the
          parcel box as well as other products received) or other relevant proofs.
        </p>

        <h3 className="text-base font-bold text-ink mt-4 mb-2">Missing Items</h3>
        <p>
          If after opening the package, the customer discovers that the item is
          missing, the return request should be filed within{" "}
          <strong>2 days</strong> of delivery along with photographs (of the
          parcel box as well as other products received) on our email.
        </p>

        <h3 className="text-base font-bold text-ink mt-4 mb-2">Damaged / Defective Items</h3>
        <p>
          In case of damaged packaging, do not accept the delivery of that
          particular package. In case you have received it and later, after
          opening the package, discover that the item(s) are Damaged/Defective or
          the product is leaked, the return request should be filed within{" "}
          <strong>2 days</strong> of delivery along with photographs (of the
          received parcel box as well as the product) on our e-mail.
        </p>

        <h3 className="text-base font-bold text-ink mt-4 mb-2">Expired Products</h3>
        <p>
          In case products delivered are past or near their expiry date (medicines
          with an expiry date of less than 6 months shall be considered as near
          expiry), return request can be raised within <strong>7 days</strong> of
          order delivery along with photographs of products (Expiry date must be
          clearly visible in the attached photographs).
        </p>
      </>
    ),
  },
];

const CALLOUT = (
  <p>
    <strong>How to raise a return request:</strong> Log in to your
    DocHomoeo account and navigate to your order, or email us at{" "}
    <a href="mailto:contact.dochomoeo@gmail.com" className="font-semibold text-forest-deep underline">
      contact.dochomoeo@gmail.com
    </a>{" "}
    with your order number, product details, and parcel photographs.
  </p>
);

export default function ReturnCancellationPage() {
  return (
    <LegalPageLayout
      title="Return & Cancellation Policy"
      intro="Our return and replacement policies are designed to ensure you receive quality products and a hassle-free experience."
      sections={SECTIONS}
      callout={CALLOUT}
    />
  );
}
