import { Metadata } from "next";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { SuccessView } from "@/sections/checkout/SuccessView";

export const metadata: Metadata = {
  title: "Order Confirmed | DocHomo",
  description: "Your order has been placed successfully.",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <SiteHeader />
      <main className="flex-1 pt-[100px] pb-24">
        <SuccessView />
      </main>
      <SiteFooter />
    </div>
  );
}
