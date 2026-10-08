"use client";

import { useCart } from "@/components/providers/CartProvider";
import { Loader2 } from "lucide-react";

export function OrderSummary() {
  const { quote, isQuoteLoading } = useCart();

  return (
    <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[#0a2015] mb-6">Order Summary</h3>
      
      {isQuoteLoading && !quote ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="size-6 text-[#1b7a54] animate-spin" />
        </div>
      ) : quote ? (
        <div className="space-y-4 text-sm text-[#4b6b5a]">
          <div className="flex justify-between">
            <span>Item Total ({quote.itemCount} items)</span>
            <span className="font-medium text-[#0a2015]">₹{quote.subtotal.toFixed(2)}</span>
          </div>
          
          {quote.savings > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Savings</span>
              <span>-₹{quote.savings.toFixed(2)}</span>
            </div>
          )}
          
          {quote.coupon && (
            <div className="flex justify-between text-emerald-600">
              <span>Coupon ({quote.coupon.code})</span>
              <span>-₹{quote.coupon.discount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{quote.shippingCharge === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `₹${quote.shippingCharge.toFixed(2)}`}</span>
          </div>
          
          <div className="h-px bg-black/5 my-4" />
          
          <div className="flex justify-between text-base font-bold text-[#0a2015]">
            <span>Grand Total</span>
            <span>₹{quote.grandTotal.toFixed(2)}</span>
          </div>
          
          {quote.savings > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg text-center">
              You are saving ₹{quote.savings.toFixed(2)} on this order!
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-black/50 text-center py-4">No items in cart</p>
      )}
    </div>
  );
}
