import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { DemoPaymentClient } from "./DemoPaymentClient";

export const metadata: Metadata = {
  title: "Demo Payment Simulator | DocHomoeo",
  description: "Safe local development simulation for testing payment-return workflows.",
  robots: { index: false, follow: false },
};

export default async function DemoPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; total?: string; orderNumber?: string }>;
}) {
  // Never expose or allow the demo payment simulator in production builds
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const params = await searchParams;
  const orderId = Number.parseInt(params.order ?? "", 10);
  const total = Number.parseFloat(params.total ?? "0");
  const orderNumber = params.orderNumber ?? (orderId ? `DH-ORD-${orderId}` : "DEMO-ORD");

  return (
    <>
      <SiteHeader />
      <main id="main" className="dh-page-top dh-section-b flex-1 bg-canvas min-h-[calc(100vh-200px)]">
        <DemoPaymentClient
          orderId={Number.isInteger(orderId) && orderId > 0 ? orderId : null}
          total={!Number.isNaN(total) && total > 0 ? total : 0}
          orderNumber={orderNumber}
        />
      </main>
      <SiteFooter />
    </>
  );
}
