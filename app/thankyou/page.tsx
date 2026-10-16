import type { Metadata } from "next";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { OrderConfirmationView, type PaymentReturn } from "@/sections/checkout/OrderConfirmationView";

const PAYMENT_RETURNS: readonly PaymentReturn[] = ["success", "pending", "failed"];

export const metadata: Metadata = {
  title: "Order confirmation",
  description: "Your DocHomoeo order confirmation.",
  // Confirmations are private and one-off; none belong in a search index.
  robots: { index: false, follow: false },
};

/**
 * /thankyou?order=<id>[&payment=success|pending|failed]. Only the order's
 * numeric id and the gateway's one-word outcome travel in the URL, never
 * address, phone or payment details. The order itself is read from the shop
 * (GET /api/me/orders/:id), which only answers its owner, and the payment
 * status recorded there is what the page believes, not the `payment` word.
 */
export default async function ThankYouPage({ searchParams }: PageProps<"/thankyou">) {
  const params = await searchParams;
  const raw = params.order;
  const id = Number.parseInt(Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? ""), 10);
  const rawPayment = Array.isArray(params.payment) ? params.payment[0] : params.payment;
  const payment = PAYMENT_RETURNS.find((value) => value === rawPayment) ?? null;

  return (
    <>
      <SiteHeader />
      <main id="main" className="dh-page-top dh-section-b flex-1 bg-canvas">
        <OrderConfirmationView orderId={Number.isInteger(id) && id > 0 ? id : null} payment={payment} />
      </main>
      <SiteFooter />
    </>
  );
}
