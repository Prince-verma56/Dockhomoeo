import { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/shared/LegalPageLayout";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "DocHomoeo's refund policy for product purchases and online consultations.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "product-refund",
    label: "Product Refund",
    title: "Product Refund",
    content: (
      <p>
        In case we do not have the product at all, we will provide refund to the
        buyer and buyer shall be obligated to accept the refund in Lieu of
        replacement in his or her bank account.
      </p>
    ),
  },
  {
    id: "consultation-refund",
    label: "Consultation Refund",
    title: "Online Consultation Refund",
    content: (
      <>
        <p>
          In case of online consultation, a customer will be eligible to raise a
          request for Refund only in case the consultation query is not replied
          within specified timeline.
        </p>
        <p>
          The customer is required to raise the Refund request with DocHomoeo
          customer care within <strong>100 hours</strong> from the time of
          submission of query or receiving of response. The request for the Refund
          will be validated by DocHomoeo team.
        </p>
      </>
    ),
  },
  {
    id: "timeline",
    label: "Refund Timeline",
    title: "Refund Timeline",
    content: (
      <p>
        In case of valid Refund, the same will be done by crediting the bank
        account of the customer. Refund process shall be completed within{" "}
        <strong>30 (thirty) days</strong> from the date of submission of the
        request for Refund.
      </p>
    ),
  },
];

const CALLOUT = (
  <p>
    To request a refund, please contact our support team at{" "}
    <a href="mailto:contact.dochomoeo@gmail.com" className="font-semibold text-forest-deep underline">
      contact.dochomoeo@gmail.com
    </a>{" "}
    with your order number and transaction details.
  </p>
);

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      intro="Our refund policy ensures fair treatment for product purchases and online consultations."
      sections={SECTIONS}
      callout={CALLOUT}
    />
  );
}
