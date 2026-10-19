"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ChevronRight, Sparkles, Tag, Percent, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AVAILABLE_COUPONS, type AvailableCoupon } from "@/lib/cart/availableCoupons";
import { useCart } from "@/components/providers/CartProvider";
import { getLenis } from "@/components/providers/SmoothScrollProvider";

export function AvailableCouponOffers({
  className,
  variant = "card",
  onApplyCode,
}: {
  className?: string;
  variant?: "card" | "compact" | "drawer";
  onApplyCode?: (code: string) => void;
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cart = useCart();

  // Stop Lenis while modal is open so mouse wheel scrolling inside the modal works smoothly
  useEffect(() => {
    if (!isModalOpen) return;
    const lenis = getLenis();
    lenis?.stop();
    return () => lenis?.start();
  }, [isModalOpen]);

  const handleCopy = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleApply = (code: string) => {
    if (onApplyCode) {
      onApplyCode(code);
    } else {
      cart.applyCoupon(code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink dark:text-white flex items-center gap-1.5">
            <Tag className="size-3.5 text-[#0d5a43] dark:text-emerald-400" />
            <span>Available Coupons ({AVAILABLE_COUPONS.length})</span>
          </span>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-[11px] font-bold text-[#0d5a43] dark:text-emerald-400 hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AVAILABLE_COUPONS.slice(0, 2).map((coupon) => (
            <div
              key={coupon.code}
              className="flex items-center justify-between rounded-xl border border-dashed border-[#0d5a43]/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 text-xs"
            >
              <div>
                <span className="font-mono font-bold text-[#0d5a43] dark:text-emerald-300 text-[11px] bg-white dark:bg-black/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {coupon.code}
                </span>
                <p className="text-[10px] text-muted-ink mt-0.5 truncate max-w-[120px]">{coupon.title}</p>
              </div>
              <button
                type="button"
                onClick={() => handleApply(coupon.code)}
                className="text-[11px] font-bold text-[#0d5a43] dark:text-emerald-300 hover:underline px-2 py-1 rounded-md hover:bg-emerald-500/10 cursor-pointer"
              >
                {copiedCode === coupon.code ? "Applied!" : "Apply"}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-line-soft bg-paper dark:bg-[#0c1e17]/80 p-4 shadow-2xs", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-line-soft/80">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-emerald-500/10 text-[#0d5a43] dark:text-emerald-400 grid place-items-center">
            <Percent className="size-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-ink dark:text-white flex items-center gap-1.5">
              <span>Available Offers & Coupons</span>
              <span className="rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2 py-0.2 text-[10px] font-extrabold">
                {AVAILABLE_COUPONS.length} Offers
              </span>
            </h4>
            <p className="text-[11px] text-muted-ink">Apply at checkout or copy code to save more</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-bold text-[#0d5a43] dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
        >
          <span>View all</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Offers 2x2 Grid */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {AVAILABLE_COUPONS.map((coupon) => {
          const isCopied = copiedCode === coupon.code;

          return (
            <div
              key={coupon.code}
              className="relative flex flex-col justify-between rounded-xl border border-dashed border-[#0d5a43]/30 bg-emerald-50/40 dark:bg-emerald-950/15 p-3 transition-all hover:border-[#0d5a43] hover:bg-emerald-50/70"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-bold tracking-wider text-[#0d5a43] dark:text-emerald-300 bg-white dark:bg-black/50 px-2 py-0.5 rounded-md border border-emerald-500/30 shadow-2xs">
                    <Tag className="size-3" />
                    <span>{coupon.code}</span>
                  </span>
                  {coupon.tag ? (
                    <span className="rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 px-2 py-0.2 text-[9px] font-bold">
                      {coupon.tag}
                    </span>
                  ) : null}
                </div>
                <h5 className="text-xs font-bold text-ink dark:text-white leading-tight">
                  {coupon.title}
                </h5>
                <p className="mt-1 text-[11px] text-muted-ink leading-relaxed line-clamp-2">
                  {coupon.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-emerald-500/15 flex items-center justify-between text-xs">
                <span className="text-[10px] text-muted-ink font-medium">
                  Min order: ₹{coupon.minOrderValue}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(coupon.code)}
                    className="inline-flex items-center gap-1 font-bold text-muted-ink hover:text-ink cursor-pointer"
                    title="Copy coupon code"
                  >
                    {isCopied ? (
                      <>
                        <Check className="size-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApply(coupon.code)}
                    className={cn(
                      "inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer shadow-2xs",
                      cart.couponCode === coupon.code
                        ? "bg-[#0d5a43] text-white"
                        : "bg-white dark:bg-black/50 text-[#0d5a43] dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-50/80"
                    )}
                  >
                    {cart.couponCode === coupon.code ? (
                      <>
                        <Check className="size-3" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <span>Apply</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* "View All Offers" Modal */}
      {isModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            data-lenis-prevent
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c1e17] p-5 sm:p-7 shadow-lift border border-line-soft my-8 text-left max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close offers modal"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 grid size-9 place-items-center rounded-full bg-canvas dark:bg-black/40 text-muted-ink hover:text-ink cursor-pointer z-10 transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-2 mb-1 shrink-0 pr-8">
              <Sparkles className="size-5 text-[#0d5a43] dark:text-emerald-400 shrink-0" />
              <h3 className="font-display text-xl font-bold text-ink dark:text-white">
                All Available Coupon Offers
              </h3>
            </div>
            <p className="text-xs text-muted-ink mb-4 shrink-0">
              Copy any coupon code or apply it directly at checkout for instant savings.
            </p>

            <div
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              className="dh-custom-scrollbar space-y-3 flex-1 overflow-y-auto overscroll-contain pr-2"
            >
              {AVAILABLE_COUPONS.map((coupon) => (
                <div
                  key={coupon.code}
                  className="rounded-2xl border border-dashed border-[#0d5a43]/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-black text-[#0d5a43] dark:text-emerald-300 bg-white dark:bg-black/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                          {coupon.code}
                        </span>
                        {coupon.tag ? (
                          <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                            {coupon.tag}
                          </span>
                        ) : null}
                      </div>
                      <h4 className="text-sm font-bold text-ink dark:text-white mt-1.5">{coupon.title}</h4>
                      <p className="text-xs text-muted-ink mt-1">{coupon.description}</p>
                      <div className="mt-2 text-[11px] text-muted-ink flex items-center gap-2">
                        <span>Min. purchase: <strong>₹{coupon.minOrderValue}</strong></span>
                        <span>•</span>
                        <span>{coupon.expiryNote || "Valid for all users"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(coupon.code)}
                        className="h-8.5 px-3 rounded-full border border-line-soft bg-paper dark:bg-white/10 text-muted-ink hover:text-ink text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedCode === coupon.code ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                        <span>{copiedCode === coupon.code ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleApply(coupon.code);
                          setIsModalOpen(false);
                        }}
                        className={cn(
                          "h-8.5 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs",
                          cart.couponCode === coupon.code
                            ? "bg-emerald-600 text-white"
                            : "bg-[#0d5a43] hover:bg-[#074231] text-white"
                        )}
                      >
                        {cart.couponCode === coupon.code ? (
                          <>
                            <Check className="size-3.5" />
                            <span>Applied</span>
                          </>
                        ) : (
                          <span>Apply</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
