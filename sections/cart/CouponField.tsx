"use client";

import { useEffect, useId, useState } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatRupees } from "@/lib/formatters/price";
import { AVAILABLE_COUPONS } from "@/lib/cart/availableCoupons";

/**
 * Coupon entry. The shop decides whether a code applies (the quote returns
 * `coupon` or `couponError`); nothing is checked or discounted here.
 */
export function CouponField() {
  const { couponCode, applyCoupon, removeCoupon, quote, quoteIsCurrent, quoteStatus, retryQuote } = useCart();
  const [draft, setDraft] = useState(couponCode ?? "");
  const [open, setOpen] = useState(Boolean(couponCode));
  const [removed, setRemoved] = useState<string | null>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  useEffect(() => {
    if (couponCode) {
      setDraft(couponCode);
      setOpen(true);
    }
  }, [couponCode]);

  const unreachable = couponCode !== null && quoteStatus === "error";
  const checking = couponCode !== null && !quoteIsCurrent && !unreachable;
  const applied = couponCode !== null && quoteIsCurrent && quote?.coupon ? quote.coupon : null;
  const refusal = couponCode !== null && quoteIsCurrent && !quote?.coupon ? quote?.couponError ?? null : null;

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
            removeCoupon();
          }}
          className="rounded-md px-1.5 py-1 text-[0.8125rem] font-semibold text-[#0d5a43] dark:text-emerald-400 underline-offset-4 hover:underline cursor-pointer"
        >
          Remove
        </button>
      </div>
    );
  }

  if (!open && couponCode === null) {
    return (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setRemoved(null);
            }}
            className="font-bold text-[#0d5a43] dark:text-emerald-400 underline-offset-4 hover:underline flex items-center gap-1.5"
          >
            <Tag className="size-3.5" />
            <span>Have a coupon code?</span>
          </button>
        </div>

        {/* Quick select coupon pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-muted-ink">Offers:</span>
          {AVAILABLE_COUPONS.slice(0, 3).map((coupon) => (
            <button
              key={coupon.code}
              type="button"
              onClick={() => {
                setOpen(true);
                setDraft(coupon.code);
                applyCoupon(coupon.code);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#0d5a43]/40 bg-emerald-500/10 dark:bg-emerald-950/20 px-2 py-0.5 text-[10px] font-bold text-[#0d5a43] dark:text-emerald-300 hover:bg-emerald-500/20 cursor-pointer transition-all"
            >
              <span>{coupon.code}</span>
              <span className="text-muted-ink font-normal">({coupon.discountType === "PERCENT" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`})</span>
            </button>
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          {removed ? `Coupon ${removed} removed.` : ""}
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (draft.trim()) applyCoupon(draft);
      }}
    >
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-xs font-bold text-ink dark:text-white flex items-center gap-1.5">
          <Tag className="size-3.5 text-[#0d5a43] dark:text-emerald-400" />
          <span>Apply Coupon Code</span>
        </label>
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
          {checking ? <Loader2 aria-hidden className="size-3.5 motion-safe:animate-spin" /> : null}
          Apply
        </button>
        <button
          type="button"
          aria-label="Close coupon entry"
          onClick={() => {
            setOpen(false);
            setDraft("");
            removeCoupon();
          }}
          className="grid size-10 shrink-0 place-items-center rounded-xl text-muted-ink hover:bg-ink/5 hover:text-ink cursor-pointer"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>

      <p id={errorId} role="status" className="min-h-4 text-xs text-destructive">
        {unreachable ? (
          <>
            We couldn&rsquo;t check this code with the shop just now.{" "}
            <button type="button" onClick={retryQuote} className="font-semibold text-forest underline-offset-4 hover:underline">
              Try again
            </button>
          </>
        ) : (
          refusal ?? (checking ? <span className="text-muted-ink">Checking with the shop…</span> : null)
        )}
      </p>

      {/* Available Coupons Quick Selection List */}
      <div className="pt-1 border-t border-line-soft/60 space-y-1.5">
        <p className="text-[11px] font-bold text-muted-ink">Available Offers:</p>
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="dh-custom-scrollbar space-y-1.5 max-h-44 overflow-y-auto overscroll-contain pr-1"
        >
          {AVAILABLE_COUPONS.map((coupon) => (
            <div
              key={coupon.code}
              className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-[#0d5a43]/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-2 text-xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#0d5a43] dark:text-emerald-300 text-[11px] bg-white dark:bg-black/50 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    {coupon.code}
                  </span>
                  <span className="font-semibold text-ink dark:text-white text-[11px] truncate">
                    {coupon.title}
                  </span>
                </div>
                <p className="text-[10px] text-muted-ink mt-0.5 truncate">
                  Min order: ₹{coupon.minOrderValue}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDraft(coupon.code);
                  applyCoupon(coupon.code);
                }}
                className="shrink-0 text-[11px] font-bold text-[#0d5a43] dark:text-emerald-400 hover:text-[#074231] bg-white dark:bg-black/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg hover:bg-emerald-50/70 cursor-pointer shadow-2xs"
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
