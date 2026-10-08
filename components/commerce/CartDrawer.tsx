"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";

export function CartDrawer() {
  const { isOpen, setIsOpen, quote, items, updateQuantity, removeItem, isQuoteLoading } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className="relative w-full max-w-md bg-[#faf9f6] shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        <div className="flex items-center justify-between p-6 border-b border-black/5 bg-white">
          <h2 className="text-xl font-bold text-[#0a2015] flex items-center gap-2">
            <ShoppingBag className="size-5" />
            Your Cart
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 rounded-full hover:bg-black/5 transition-colors text-[#4b6b5a]"
            aria-label="Close cart"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#4b6b5a] space-y-4">
              <div className="size-20 rounded-full bg-black/5 flex items-center justify-center mb-2">
                <ShoppingBag className="size-10 text-black/20" />
              </div>
              <p className="text-lg font-medium text-[#0a2015]">Your cart is empty</p>
              <p className="text-sm">Looks like you haven't added anything yet.</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-4 px-6 py-3 rounded-full bg-[#1b7a54]/10 text-[#1b7a54] font-semibold hover:bg-[#1b7a54]/20 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => {
                // If quote is available, use real line data for accuracy
                const quoteLine = quote?.lines.find(l => l.variantId === item.variantId);
                const title = quoteLine?.productName || item.title;
                const price = quoteLine?.unitPrice || item.price;
                const variantTitle = quoteLine?.variantTitle || "";
                const image = quoteLine?.imageUrl || item.imageUrl;
                const mrp = quoteLine?.mrp || item.price;
                
                return (
                  <div key={item.variantId} className="flex gap-4 p-4 bg-white rounded-2xl border border-black/5">
                    <div className="relative size-20 rounded-xl bg-[#f4f7f5] overflow-hidden shrink-0 flex items-center justify-center">
                      {image ? (
                        <Image src={image} alt={title} fill className="object-contain p-2" />
                      ) : (
                        <span className="font-serif text-2xl text-[#0a2015] opacity-20">{title.charAt(0)}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-semibold text-[#0a2015] leading-tight text-sm line-clamp-2">
                            {title}
                          </h3>
                          <button 
                            onClick={() => removeItem(item.variantId)}
                            className="text-black/30 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
                            aria-label="Remove item"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                        {variantTitle && (
                          <p className="text-xs text-[#4b6b5a] mt-1">{variantTitle}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center bg-[#f4f7f5] rounded-lg p-0.5 border border-black/5">
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="size-7 flex items-center justify-center rounded-md hover:bg-white text-[#0a2015] transition-colors"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-[#0a2015]">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="size-7 flex items-center justify-center rounded-md hover:bg-white text-[#0a2015] transition-colors"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-[#0a2015]">₹{(price * item.quantity).toFixed(2)}</div>
                          {mrp > price && (
                            <div className="text-xs text-[#4b6b5a] line-through">₹{(mrp * item.quantity).toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-black/5">
            <div className="space-y-3 mb-6 text-sm text-[#4b6b5a]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#0a2015]">₹{quote?.subtotal?.toFixed(2) || "---"}</span>
              </div>
              {quote?.savings ? (
                <div className="flex justify-between text-emerald-600">
                  <span>Savings</span>
                  <span>-₹{quote.savings.toFixed(2)}</span>
                </div>
              ) : null}
              {quote?.shippingCharge !== undefined ? (
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{quote.shippingCharge === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `₹${quote.shippingCharge.toFixed(2)}`}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-bold text-[#0a2015] pt-3 border-t border-black/5">
                <span>Total</span>
                <span>
                  {isQuoteLoading ? "Calculating..." : `₹${quote?.grandTotal?.toFixed(2) || "---"}`}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link 
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="w-full h-12 flex items-center justify-center rounded-xl border border-[#0a2015] text-[#0a2015] font-semibold hover:bg-[#0a2015]/5 transition-colors"
              >
                View Cart
              </Link>
              <Link 
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-[#0a2015] text-white font-semibold hover:bg-[#153a27] transition-all shadow-lg shadow-[#0a2015]/20"
              >
                Checkout <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
