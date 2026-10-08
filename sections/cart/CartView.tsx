"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { useCart } from "@/components/providers/CartProvider";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { useState } from "react";

export function CartView() {
  const { items, quote, updateQuantity, removeItem, isQuoteLoading } = useCart();
  const [coupon, setCoupon] = useState("");

  if (items.length === 0) {
    return (
      <Container>
        <div className="max-w-2xl mx-auto mt-12 py-24 px-6 bg-white rounded-3xl border border-black/5 text-center shadow-sm">
          <div className="size-24 mx-auto rounded-full bg-[#f4f7f5] flex items-center justify-center mb-6">
            <ShoppingBag className="size-10 text-[#1b7a54]" />
          </div>
          <h1 className="text-3xl font-bold text-[#0a2015] mb-4">Your cart is empty</h1>
          <p className="text-lg text-[#4b6b5a] mb-8">
            Looks like you haven't added any homoeopathic medicines yet.
          </p>
          <Link 
            href="/products"
            className="inline-flex h-14 items-center justify-center rounded-full bg-[#0a2015] px-8 text-base font-semibold text-white transition-all hover:bg-[#153a27] shadow-lg shadow-[#0a2015]/20"
          >
            Start Shopping
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#0a2015] tracking-tight mb-8">
        Your Cart
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Cart Items List */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
            {/* Desktop Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 p-6 border-b border-black/5 bg-[#fcfdfc] text-sm font-semibold text-[#4b6b5a] uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
            
            {/* Items */}
            <ul className="divide-y divide-black/5">
              {items.map((item) => {
                const quoteLine = quote?.lines.find(l => l.variantId === item.variantId);
                const title = quoteLine?.productName || item.title;
                const price = quoteLine?.unitPrice || item.price;
                const variantTitle = quoteLine?.variantTitle || "";
                const image = quoteLine?.imageUrl || item.imageUrl;
                const mrp = quoteLine?.mrp || item.price;
                const brand = quoteLine?.brandName || item.brand;
                
                return (
                  <li key={item.variantId} className="p-6">
                    <div className="flex flex-col sm:grid sm:grid-cols-12 gap-6 items-center">
                      
                      {/* Product Info */}
                      <div className="col-span-6 flex items-start gap-4 w-full">
                        <div className="relative size-24 rounded-2xl bg-[#f4f7f5] border border-black/5 overflow-hidden shrink-0 flex items-center justify-center">
                          {image ? (
                            <Image src={image} alt={title} fill className="object-contain p-3" />
                          ) : (
                            <span className="font-serif text-3xl text-[#0a2015] opacity-20">{title.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex flex-col justify-center pt-1">
                          {brand && <span className="text-xs font-bold text-[#1b7a54] uppercase tracking-wider mb-1">{brand}</span>}
                          <Link href={`/product/${quoteLine?.slug || "unknown"}`} className="font-semibold text-lg text-[#0a2015] leading-tight hover:underline">
                            {title}
                          </Link>
                          {variantTitle && (
                            <span className="text-sm text-[#4b6b5a] mt-1">{variantTitle}</span>
                          )}
                          <button 
                            onClick={() => removeItem(item.variantId)}
                            className="text-sm text-red-500 font-medium hover:underline mt-3 self-start flex items-center gap-1"
                          >
                            <X className="size-3" /> Remove
                          </button>
                        </div>
                      </div>
                      
                      {/* Quantity */}
                      <div className="col-span-3 w-full sm:w-auto flex justify-between sm:justify-center items-center">
                        <span className="sm:hidden text-sm font-semibold text-[#4b6b5a]">Quantity:</span>
                        <div className="flex items-center bg-[#f4f7f5] rounded-xl p-1 border border-black/5">
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="size-9 flex items-center justify-center rounded-lg hover:bg-white text-[#0a2015] transition-colors shadow-sm"
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="w-10 text-center font-semibold text-[#0a2015]">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="size-9 flex items-center justify-center rounded-lg hover:bg-white text-[#0a2015] transition-colors shadow-sm"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="col-span-3 w-full sm:w-auto flex justify-between sm:justify-end items-center sm:items-end flex-row sm:flex-col">
                        <span className="sm:hidden text-sm font-semibold text-[#4b6b5a]">Total:</span>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#0a2015]">₹{(price * item.quantity).toFixed(2)}</div>
                          {mrp > price && (
                            <div className="text-sm text-[#4b6b5a] line-through">₹{(mrp * item.quantity).toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                      
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="mt-8">
            <Link 
              href="/products"
              className="text-[#1b7a54] font-semibold hover:underline inline-flex items-center gap-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Coupon Input */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#0a2015] mb-4">Apply Coupon</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g. DOC10)" 
                className="flex-1 h-12 px-4 rounded-xl border border-black/10 focus:border-[#1b7a54] focus:ring-1 focus:ring-[#1b7a54] outline-none transition-all uppercase"
              />
              <button className="h-12 px-6 rounded-xl bg-black/5 text-[#0a2015] font-semibold hover:bg-black/10 transition-colors">
                Apply
              </button>
            </div>
          </div>
          
          <OrderSummary />
          
          <Link 
            href="/checkout"
            className="w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-[#0a2015] text-white font-semibold text-lg hover:bg-[#153a27] transition-all shadow-lg shadow-[#0a2015]/20"
          >
            Proceed to Checkout <ArrowRight className="size-5" />
          </Link>
          
        </div>
      </div>
    </Container>
  );
}
