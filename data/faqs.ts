/**
 * Questions answered on /contact. Every answer describes something the site
 * actually does or already states elsewhere (the pincode check, order
 * history, the payment marks in the footer, the prescription note, the
 * manufacturer on every product, /quality's responsible-information note).
 * Nothing here promises a policy the shop has not published — there is no
 * return or refund question until that policy exists.
 *
 * Answers are plain text so they double as FAQPage structured data.
 */
export type Faq = {
  question: string;
  answer: string;
  /** An onward link shown after the answer. */
  link?: { href: string; label: string };
};

export type FaqGroup = { id: string; label: string; items: Faq[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "orders",
    label: "Orders & delivery",
    items: [
      {
        question: "Do you deliver to my area?",
        answer:
          "Open any product and enter your 6-digit pincode under “Deliver to”. The check tells you whether we deliver there, whether pay on delivery is offered, and an estimated delivery time where one is available.",
        link: { href: "/products", label: "Browse products" },
      },
      {
        question: "How do I track my order?",
        answer:
          "Sign in and open My account → Orders (the footer's “Track Order” link goes there too). Each order shows its status and items. For anything else about an order, write to us using the form on this page.",
        link: { href: "/account/orders", label: "Go to my orders" },
      },
      {
        question: "Which payment methods can I use?",
        answer:
          "Visa, Mastercard and American Express cards, and UPI. Pay on delivery depends on your pincode — the delivery check on each product page shows whether it is offered for your address.",
      },
      {
        question: "Some medicines say “sold against a prescription”. What does that mean?",
        answer:
          "Those remedies are supplied only with a valid prescription from a registered practitioner. The note appears on the product page so you know before you order. If you are unsure about a specific medicine, ask us before buying.",
      },
    ],
  },
  {
    id: "remedies",
    label: "Remedies & quality",
    items: [
      {
        question: "Are the medicines genuine?",
        answer:
          "We stock remedies from licensed homoeopathic manufacturers, and every product page names its manufacturer, so you always know where a remedy comes from.",
        link: { href: "/brands", label: "See all manufacturers" },
      },
      {
        question: "Can DocHomoeo tell me which remedy to take?",
        answer:
          "No. DocHomoeo is a discovery and commerce platform, not a medical authority. Product details and health insights are general information; please consult a physician or qualified homoeopathic practitioner before starting any new treatment.",
        link: { href: "/quality", label: "Read our quality standards" },
      },
      {
        question: "What is the quickest way to find a product?",
        answer:
          "Search by medicine name, brand or health concern — press “/” or Ctrl K on any page. You can also browse by health concern or dosage form on Categories, or start from a manufacturer on Brands.",
        link: { href: "/categories", label: "Browse categories" },
      },
    ],
  },
  {
    id: "account",
    label: "Account & support",
    items: [
      {
        question: "Are my favourites saved to my account?",
        answer:
          "Not yet. Favourites are saved on this device, so they stay in this browser but do not follow you to another device.",
        link: { href: "/favourites", label: "View favourites" },
      },
      {
        question: "How quickly will you reply?",
        answer: "Write to hello@dochomoeo.com or use the form on this page. We aim to respond within 24–48 hours.",
      },
    ],
  },
];
