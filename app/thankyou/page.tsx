import type { Metadata } from "next";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { OrderConfirmationView } from "@/sections/checkout/OrderConfirmationView";

export const metadata: Metadata = {
  title: "Order confirmation",
  description: "Your DocHomoeo order confirmation.",
  // Confirmations are private and one-off; none belong in a search index.
  robots: { index: false, follow: false },
};

/**
 * /thankyou?order=<id>. Only the order's numeric id travels in the URL —
 * never address, phone or payment details. The order itself is read from the
 * shop (GET /api/me/orders/:id), which only answers its owner.
 */
export default async function ThankYouPage({ searchParams }: PageProps<"/thankyou">) {
  const raw = (await searchParams).order;
  const id = Number.parseInt(Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? ""), 10);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas pt-28 pb-20 sm:pt-32 lg:pb-28">
        <OrderConfirmationView orderId={Number.isInteger(id) && id > 0 ? id : null} />
      </main>
      <SiteFooter />
    </>
  );
}
