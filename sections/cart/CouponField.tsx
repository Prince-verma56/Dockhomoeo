"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Tag, X } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatRupees } from "@/lib/formatters/price";
import { AVAILABLE_COUPONS } from "@/lib/cart/availableCoupons";
import TearButton from "@/components/kokonutui/tear-button";

/**
 * Coupon entry. The shop decides whether a code applies (the quote returns
 * `coupon` or `couponError`); nothing is checked or discounted here.
 * Collapsible by default to preserve immediate visibility of total charges and checkout CTA.
 * Available offers render as spacious, minimalistic Kokonut UI TearButton tickets.
 */
export function CouponField({ isCheckout = false }: { isCheckout?: boolean }) {
  void isCheckout;
  const { couponCode, applyCoupon, removeCoupon, quote, quoteIsCurrent, quoteStatus, retryQuote } = useCart();
  const [draft, setDraft] = useState(couponCode ?? "");
  const [open, setOpen] = useState(true);
  const [removed, setRemoved] = useState<string | null>(null);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [resetCounter, setResetCounter] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(320);

  const inputId = useId();
  const errorId = `${inputId}-error`;

  useEffect(() => {
    if (couponCode) {
      setDraft(couponCode);
      setOpen(true);
    }
  }, [couponCode]);

  // Responsive width measurement for TearButton within order summary card
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth || 320);
    return () => observer.disconnect();
  }, [open]);

  const unreachable = couponCode !== null && quoteStatus === "error";
  const checking = couponCode !== null && !quoteIsCurrent && !unreachable;
  const applied = couponCode !== null && quoteIsCurrent && quote?.coupon ? quote.coupon : null;
  const refusal = couponCode !== null && quoteIsCurrent && !quote?.coupon ? quote?.couponError ?? null : null;

  // If a coupon application fails (e.g. min order not met), restore the button stub immediately
  useEffect(() => {
    if (refusal || unreachable) {
      setPendingCode(null);
      setResetCounter((c) => c + 1);
    }
  }, [refusal, unreachable]);

  // When coupon is successfully applied, clear pending state
  useEffect(() => {
    if (applied) {
      setPendingCode(null);
    }
  }, [applied]);

  const handleTearCoupon = (code: string) => {
    if (checking || quoteStatus === "loading") return;
    setPendingCode(code);
    setDraft(code);
    applyCoupon(code);
  };

  const stubWidth = 72;
  // Calculate dynamic body width: containerWidth minus stubWidth - 20px safe margin for padding and custom scrollbar
  const tearBodyWidth = Math.max(160, Math.min(260, containerWidth - stubWidth - 20));

  // 1. Compact Applied State (Keeps price summary and charges in clear view)
  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 text-[#0d5a43] dark:text-emerald-300">
          <Tag aria-hidden className="size-4 text-[#0d5a43] dark:text-emerald-400" />
          <span>
            <strong className="font-semibold">{applied.code}</strong> applied · −{formatRupees(applied.discount)}
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            setRemoved(applied.code);
            setDraft("");
            setPendingCode(null);
            setResetCounter((c) => c + 1);
            removeCoupon();
          }}
          className="rounded-md px-1.5 py-1 text-[0.8125rem] font-semibold text-[#0d5a43] dark:text-emerald-400 underline-offset-4 hover:underline cursor-pointer"
        >
          Remove
        </button>
      </div>
    );
  }

  // 2. Closed / Collapsible State (Default on checkout to guarantee total amount is always visible)
  if (!open && couponCode === null) {
    return (
      <div className="space-y-2 text-sm">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setRemoved(null);
          }}
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#0d5a43]/35 bg-emerald-50/40 dark:bg-emerald-950/20 px-3.5 py-2.5 text-xs text-left transition-all hover:bg-emerald-50/70 hover:border-[#0d5a43]/60 cursor-pointer shadow-2xs group"
        >
          <span className="flex items-center gap-2 font-bold text-[#0d5a43] dark:text-emerald-400">
            <Tag className="size-3.5 text-[#0d5a43] dark:text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>Apply Coupon or Offer</span>
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-ink">
            <span className="rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-extrabold">
              {AVAILABLE_COUPONS.length} available
            </span>
            <ChevronDown className="size-3.5 text-muted-ink group-hover:text-ink transition-colors" />
          </span>
        </button>

        {/* Quick select preview pills */}
        <div className="flex flex-wrap items-center gap-1.5 px-0.5">
          <span className="text-[10.5px] font-medium text-muted-ink">Quick apply:</span>
          {AVAILABLE_COUPONS.slice(0, 3).map((coupon) => (
            <button
              key={coupon.code}
              type="button"
              onClick={() => {
                setOpen(true);
                setDraft(coupon.code);
                handleTearCoupon(coupon.code);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#0d5a43]/30 bg-white/70 dark:bg-black/30 px-2 py-0.5 text-[10px] font-bold text-[#0d5a43] dark:text-emerald-300 hover:bg-emerald-500/15 cursor-pointer transition-all"
            >
              <span>{coupon.code}</span>
              <span className="text-muted-ink font-normal text-[9.5px]">
                ({coupon.discountType === "PERCENT" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`})
              </span>
            </button>
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          {removed ? `Coupon ${removed} removed.` : ""}
        </p>
      </div>
    );
  }

  // 3. Open State: Clean manual input + Spacious, Standalone TearButton Tickets
  return (
    <div ref={containerRef} className="space-y-3">
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (draft.trim() && !checking) {
            setPendingCode(draft.trim().toUpperCase());
            applyCoupon(draft);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="text-xs font-bold text-ink dark:text-white flex items-center gap-1.5">
            <Tag className="size-3.5 text-[#0d5a43] dark:text-emerald-400" />
            <span>Apply Coupon Code</span>
          </label>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-ink hover:text-ink cursor-pointer transition-colors"
          >
            <span>Hide offers</span>
            <ChevronUp className="size-3.5" />
          </button>
        </div>

        <div className="flex gap-2">
          <input
            id={inputId}
            value={draft}
            onChange={(event) => setDraft(event.target.value.toUpperCase())}
            autoComplete="off"
            spellCheck={false}
            maxLength={40}
            aria-invalid={refusal || unreachable ? true : undefined}
            aria-describedby={refusal || unreachable ? errorId : undefined}
            className="h-10 min-w-0 flex-1 rounded-xl border border-line-soft bg-paper dark:bg-black/30 px-3.5 text-xs font-mono font-bold uppercase text-ink dark:text-white placeholder:normal-case placeholder:font-sans placeholder:text-muted-ink/80 aria-invalid:border-destructive"
            placeholder="Enter code (e.g. DOCTOR15)"
          />
          <button
            type="submit"
            disabled={checking || !draft.trim()}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0d5a43] px-4 text-xs font-bold text-white transition-colors hover:bg-[#074231] disabled:opacity-50 cursor-pointer"
          >
            {checking && !pendingCode ? <Loader2 aria-hidden className="size-3.5 motion-safe:animate-spin" /> : null}
            Apply
          </button>
        </div>

        {/* Real Backend Error or Refusal Message */}
        <p id={errorId} role="status" className="min-h-4 text-xs text-destructive">
          {unreachable ? (
            <>
              We couldn&rsquo;t check this code with the shop just now.{" "}
              <button
                type="button"
                onClick={retryQuote}
                className="font-semibold text-forest underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </>
          ) : (
            refusal ?? (checking ? <span className="text-muted-ink">Checking with the shop…</span> : null)
          )}
        </p>
      </form>

      {/* Available Offers: Spacious, Standalone Minimalist Tear Tickets */}
      <div className="pt-1.5 border-t border-line-soft/60 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-muted-ink flex items-center gap-1">
            <Tag className="size-3 text-[#0d5a43] dark:text-emerald-400" />
            <span>Available Offers ({AVAILABLE_COUPONS.length}):</span>
          </p>
          <span className="text-[10px] text-muted-ink/80 flex items-center gap-1">
            <span>Drag or tap stub to tear</span>
          </span>
        </div>

        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="dh-custom-scrollbar space-y-2.5 max-h-56 overflow-y-auto overflow-x-hidden overscroll-contain p-0.5"
        >
          {AVAILABLE_COUPONS.map((coupon) => {
            const isPendingThis = checking && pendingCode === coupon.code;

            return (
              <div key={coupon.code} className="relative flex justify-center w-full max-w-full overflow-hidden">
                <TearButton
                  tone="ivory"
                  icon={<Tag className="size-4 text-[#0d5a43] dark:text-emerald-400" />}
                  label={`${coupon.code} · ${coupon.discountType === "PERCENT" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}`}
                  description={`Min order ₹${coupon.minOrderValue} · ${coupon.tag || coupon.title}`}
                  stubLabel="Tear"
                  confirmedLabel="Redeeming…"
                  confirmedDescription="Applying to your order…"
                  height={58}
                  bodyWidth={tearBodyWidth}
                  stubWidth={stubWidth}
                  disabled={checking}
                  loading={isPendingThis}
                  resetKey={resetCounter}
                  onConfirm={() => handleTearCoupon(coupon.code)}
                  className="max-w-full shadow-2xs hover:shadow-xs transition-shadow"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

