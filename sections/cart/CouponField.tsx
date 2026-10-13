"use client";

import { useId, useState } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatRupees } from "@/lib/formatters/price";

/**
 * Coupon entry. The shop decides whether a code applies (the quote returns
 * `coupon` or `couponError`); nothing is checked or discounted here.
 */
export function CouponField() {
  const { couponCode, applyCoupon, removeCoupon, quote, quoteIsCurrent } = useCart();
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [removed, setRemoved] = useState<string | null>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const checking = couponCode !== null && !quoteIsCurrent;
  const applied = couponCode !== null && quoteIsCurrent && quote?.coupon ? quote.coupon : null;
  const refusal = couponCode !== null && quoteIsCurrent && !quote?.coupon ? quote?.couponError ?? null : null;

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-forest/25 bg-forest/6 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 text-forest-deep">
          <Tag aria-hidden className="size-4" />
          <span>
            <strong className="font-semibold">{applied.code}</strong> applied · −{formatRupees(applied.discount)}
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            setRemoved(applied.code);
            removeCoupon();
          }}
          className="rounded-md px-1.5 py-1 text-[0.8125rem] font-semibold text-forest underline-offset-4 hover:underline"
        >
          Remove
        </button>
      </div>
    );
  }

  if (!open && couponCode === null) {
    return (
      <div className="text-sm">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setRemoved(null);
          }}
          className="font-semibold text-forest underline-offset-4 hover:underline"
        >
          Have a coupon code?
        </button>
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
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        Coupon code
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value.toUpperCase())}
          autoComplete="off"
          spellCheck={false}
          maxLength={40}
          aria-invalid={refusal ? true : undefined}
          aria-describedby={refusal ? errorId : undefined}
          className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-ivory px-3.5 text-sm uppercase text-ink placeholder:normal-case placeholder:text-muted-ink/80 aria-invalid:border-destructive"
          placeholder="Enter code"
        />
        <button
          type="submit"
          disabled={checking || !draft.trim()}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-forest/30 px-4 text-sm font-semibold text-forest transition-colors hover:bg-forest/6 disabled:opacity-50"
        >
          {checking ? <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" /> : null}
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
          className="grid size-11 shrink-0 place-items-center rounded-xl text-muted-ink hover:bg-ink/5 hover:text-ink"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
      <p id={errorId} role="status" className="min-h-4 text-xs text-destructive">
        {refusal ?? (checking ? <span className="text-muted-ink">Checking with the shop…</span> : null)}
      </p>
    </form>
  );
}
