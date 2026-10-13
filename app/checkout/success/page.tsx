import { permanentRedirect } from "next/navigation";

/**
 * Order confirmation lives at /thankyou (brain/19_ROUTE_SPEC.md). This older
 * address forwards there; its `orderNumber` query never identified an order,
 * so it is not carried over.
 */
export default function CheckoutSuccessPage() {
  permanentRedirect("/thankyou");
}
