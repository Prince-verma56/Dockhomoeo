import type { Metadata } from "next";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { CartView } from "@/sections/cart/CartView";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review the homoeopathic medicines in your cart before checkout.",
  // A cart is personal and transient: nothing here is worth indexing.
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-ivory">
        <CartView />
      </main>
      <SiteFooter />
    </>
  );
}
