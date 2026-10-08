import { Metadata } from "next";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { CheckoutView } from "@/sections/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout | DocHomo",
  description: "Complete your purchase securely.",
};

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <SiteHeader />
      <main className="flex-1 pt-[100px] pb-24">
        <CheckoutView />
      </main>
      <SiteFooter />
    </div>
  );
}
