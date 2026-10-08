"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "ORD-000000";

  return (
    <Container>
      <div className="max-w-2xl mx-auto py-12 md:py-24 text-center animate-in fade-in zoom-in-95 duration-500">
        
        <div className="size-24 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
          <CheckCircle className="size-12 text-emerald-500 relative z-10" />
        </div>
        
        <h1 className="text-4xl font-bold text-[#0a2015] mb-4 tracking-tight">
          Order Confirmed!
        </h1>
        
        <p className="text-lg text-[#4b6b5a] mb-8">
          Thank you for shopping with DocHomo. Your order <strong className="text-[#0a2015]">#{orderNumber}</strong> has been placed successfully and is being processed.
        </p>
        
        <div className="bg-white border border-black/5 rounded-3xl p-8 mb-10 shadow-sm text-left">
          <h2 className="text-xl font-bold text-[#0a2015] mb-6 border-b border-black/5 pb-4">Order Details</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-[#4b6b5a] uppercase tracking-wider mb-2">Order Number</h3>
              <p className="text-base text-[#0a2015] font-medium">{orderNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#4b6b5a] uppercase tracking-wider mb-2">Status</h3>
              <p className="text-base text-emerald-600 font-bold">Processing</p>
            </div>
            <div className="sm:col-span-2">
              <h3 className="text-sm font-semibold text-[#4b6b5a] uppercase tracking-wider mb-2">What happens next?</h3>
              <p className="text-sm text-[#0a2015] leading-relaxed">
                You will receive an order confirmation email with details of your order. Once the order is shipped, we will send you a tracking link. For any queries, please contact our support team.
              </p>
            </div>
          </div>
        </div>
        
        <Link 
          href="/products"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#0a2015] px-10 text-base font-semibold text-white transition-all hover:bg-[#153a27] shadow-lg shadow-[#0a2015]/20"
        >
          <ShoppingBag className="size-5" />
          Continue Shopping
        </Link>
        
      </div>
    </Container>
  );
}

export function SuccessView() {
  return (
    <Suspense fallback={
      <Container>
        <div className="py-32 flex justify-center">
          <div className="size-8 rounded-full border-2 border-[#1b7a54] border-t-transparent animate-spin" />
        </div>
      </Container>
    }>
      <SuccessContent />
    </Suspense>
  );
}
