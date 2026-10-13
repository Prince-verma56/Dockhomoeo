import type { Metadata } from "next";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { CheckoutView } from "@/sections/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Delivery and payment details for your DocHomoeo order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-ivory">
        <CheckoutView />
      </main>
      <SiteFooter />
    </>
  );
}
