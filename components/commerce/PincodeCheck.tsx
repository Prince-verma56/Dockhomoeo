"use client";

import { useId, useState, useEffect, type FormEvent } from "react";
import { Loader2, XCircle } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { describeError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiServiceabilityResult } from "@/types/api/serviceability";

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "done"; result: ApiServiceabilityResult }
  | { kind: "error"; message: string };

const STORAGE_KEY = "dochomoeo_delivery_pincode";

/**
 * "Deliver to" check on the product page, matching the reference design:
 * - 3 top feature badges (Delivery in 2 days*, COD available, Easy 7 days return)
 * - Pincode input with inline Check button
 * - Exact "Get by [Date]" calculation connected to backend & database
 * - Dynamic COD availability status with highlighted text
 */
export function PincodeCheck({ className }: { className?: string }) {
  const id = useId();
  const [pincode, setPincode] = useState("211011");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const valid = /^[1-9]\d{5}$/.test(pincode);

  // Auto-load and verify default/stored pincode on mount
  useEffect(() => {
    let active = true;
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const initialPin = stored || "211011";
    setPincode(initialPin);

    void repositories.serviceability.checkPincode(initialPin).then((result) => {
      if (active) {
        setStatus({ kind: "done", result });
      }
    }).catch(() => {});

    const onPincodeChanged = (e: Event) => {
      const detail = (e as CustomEvent<{ pincode: string; result?: ApiServiceabilityResult }>).detail;
      if (detail?.pincode) {
        setPincode(detail.pincode);
        if (detail.result) {
          setStatus({ kind: "done", result: detail.result });
        }
      }
    };

    window.addEventListener("dochomoeo:pincode-changed", onPincodeChanged);

    return () => {
      active = false;
      window.removeEventListener("dochomoeo:pincode-changed", onPincodeChanged);
    };
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid) {
      setStatus({ kind: "error", message: "Enter a valid 6-digit Indian pincode." });
      return;
    }
    setStatus({ kind: "checking" });
    try {
      const result = await repositories.serviceability.checkPincode(pincode);
      setStatus({ kind: "done", result });
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, pincode);
        window.dispatchEvent(
          new CustomEvent("dochomoeo:pincode-changed", { detail: { pincode, result } })
        );
      }
    } catch (error) {
      setStatus({
        kind: "error",
        message: describeError(error, "We couldn’t check that pincode just now. Try again in a moment."),
      });
    }
  };

  const currentDays = status.kind === "done" && status.result.deliverable && status.result.deliveryDays
    ? status.result.deliveryDays
    : 2;

  const currentCodAvailable = status.kind === "done" && status.result.deliverable
    ? status.result.codAvailable
    : true;

  return (
    <div className={cn("rounded-2xl border border-line-soft bg-paper dark:bg-[#0c1e17] p-4 sm:p-5 shadow-2xs", className)}>
      {/* 1. Top 3 Feature Highlights matching reference design */}
      <div className="grid grid-cols-3 divide-x divide-line-soft/80 border-b border-line-soft/80 pb-3 mb-3.5 text-center">
        {/* Delivery in X days */}
        <div className="flex flex-col items-center justify-center px-1 text-center">
          <div className="relative mb-1.5 size-9 sm:size-10 flex items-center justify-center">
            <svg className="size-7 sm:size-8 text-[#0d5a43] dark:text-emerald-400" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 14C6 11.7909 7.79086 10 10 10H28V34H10C7.79086 34 6 32.2091 6 30V14Z" fill="#e6f4ea" stroke="currentColor" strokeWidth="2.4" />
              <path d="M28 16H34.5858C35.6466 16 36.664 16.4214 37.4142 17.1716L41.8284 21.5858C42.5786 22.336 43 23.3534 43 24.4142V30C43 32.2091 41.2091 34 39 34H28V16Z" fill="#d1e7dd" stroke="currentColor" strokeWidth="2.4" />
              <circle cx="14" cy="34" r="4" fill="#0d5a43" />
              <circle cx="35" cy="34" r="4" fill="#0d5a43" />
              <circle cx="16" cy="18" r="5" fill="#fff" stroke="#0d5a43" strokeWidth="2" />
              <path d="M16 15.5V18L18 19" stroke="#0d5a43" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 20H4M1 24H5M2 28H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-ink dark:text-white leading-tight">
            Delivery in {currentDays} days*
          </span>
        </div>

        {/* COD Available */}
        <div className="flex flex-col items-center justify-center px-1 text-center">
          <div className="relative mb-1.5 size-9 sm:size-10 flex items-center justify-center">
            <svg className="size-7 sm:size-8 text-[#0d5a43] dark:text-emerald-400" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="18" y="10" width="22" height="12" rx="2" fill="#fff3cd" stroke="#d97706" strokeWidth="2" />
              <circle cx="29" cy="16" r="2.5" fill="#d97706" />
              <rect x="14" y="22" width="20" height="16" rx="2" fill="#e6f4ea" stroke="currentColor" strokeWidth="2.4" />
              <path d="M14 28H34" stroke="currentColor" strokeWidth="2" />
              <path d="M24 22V38" stroke="currentColor" strokeWidth="2" />
              <path d="M8 30C12 30 14 26 18 26H22" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-ink dark:text-white leading-tight">
            {currentCodAvailable ? "COD available" : "Prepaid only"}
          </span>
        </div>

        {/* Easy 7 days return */}
        <div className="flex flex-col items-center justify-center px-1 text-center">
          <div className="relative mb-1.5 size-9 sm:size-10 flex items-center justify-center">
            <svg className="size-7 sm:size-8 text-[#0d5a43] dark:text-emerald-400" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 18L24 11L36 18V32L24 39L12 32V18Z" fill="#e0f2fe" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M24 11V39M12 18L24 25L36 18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="24" cy="8" r="6" fill="#fff" stroke="#0284c7" strokeWidth="2" />
              <path d="M22 6L25 8L22 10" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M26 8C26 6.5 24.5 5 23 5" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-ink dark:text-white leading-tight">
            Easy 7 days return
          </span>
        </div>
      </div>

      {/* 2. Pincode Input Form with inline "Check" button matching reference design */}
      <form onSubmit={onSubmit} noValidate>
        <div className="relative flex items-center rounded-xl border border-line-soft bg-canvas/60 dark:bg-black/30 focus-within:border-[#0d5a43] focus-within:ring-2 focus-within:ring-[#0d5a43]/15 transition-all">
          <input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder="Enter pincode"
            value={pincode}
            aria-invalid={status.kind === "error" || undefined}
            aria-describedby={`${id}-result`}
            onChange={(event) => {
              const val = event.target.value.replace(/\D/g, "").slice(0, 6);
              setPincode(val);
              if (status.kind !== "idle") setStatus({ kind: "idle" });
            }}
            className="h-11 flex-1 bg-transparent px-3.5 text-[0.9375rem] font-semibold tracking-wider text-ink dark:text-white tabular-nums outline-hidden placeholder:text-muted-ink placeholder:font-normal"
          />
          <button
            type="submit"
            disabled={status.kind === "checking" || pincode.length !== 6}
            className="mr-1.5 h-8 px-4 text-xs font-bold text-[#0d5a43] dark:text-emerald-400 hover:text-[#063b2d] hover:bg-forest/10 rounded-lg transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            {status.kind === "checking" ? <Loader2 aria-hidden className="size-3.5 animate-spin" /> : null}
            <span>Check</span>
          </button>
        </div>
      </form>

      {/* 3. Output result display matching reference design */}
      <div id={`${id}-result`} role="status" className="mt-3 min-h-6 text-xs">
        {status.kind === "error" ? (
          <p className="text-destructive font-medium">{status.message}</p>
        ) : null}

        {status.kind === "done" ? (
          status.result.deliverable ? (
            <div className="space-y-1 animate-in fade-in duration-200">
              {/* Estimated Get By Date (matching Image 2) */}
              <p className="text-sm font-bold text-ink dark:text-white">
                Get by {status.result.estimatedDate || "within 2-4 days"}
              </p>

              {/* Cash on delivery status with highlighted styling (matching Image 2) */}
              <p className="text-xs text-muted-ink">
                Cash on delivery{" "}
                {status.result.codAvailable ? (
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">available</span>
                ) : (
                  <span className="font-bold text-orange-600 dark:text-orange-400">not available</span>
                )}{" "}
                for this location.
              </p>

              {/* City and State delivery destination */}
              {status.result.city || status.result.state ? (
                <p className="text-[11px] text-muted-ink flex items-center gap-1.5 pt-0.5">
                  <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    Delivers to {status.result.city ? `${status.result.city}, ` : ""}{status.result.state} ({status.result.pincode})
                  </span>
                </p>
              ) : null}
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-destructive font-medium">
              <XCircle aria-hidden className="size-3.5 shrink-0" />
              <span>We don’t deliver to {status.result.pincode} yet.</span>
            </p>
          )
        ) : null}

        {status.kind === "idle" && (
          <p className="text-muted-ink text-[0.75rem]">
            Enter pincode for exact delivery date &amp; courier options.
          </p>
        )}
      </div>
    </div>
  );
}
