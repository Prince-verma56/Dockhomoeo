import { Metadata } from "next";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { CartView } from "@/sections/cart/CartView";

export const metadata: Metadata = {
  title: "Your Cart | DocHomo",
  description: "Review your selected homoeopathic medicines and health products.",
};

export default function CartPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <SiteHeader />
      <main className="flex-1 pt-[100px] pb-24">
        <CartView />
      </main>
      <SiteFooter />
    </div>
  );
}
