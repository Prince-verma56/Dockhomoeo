"use client";

import { useEffect, useState, useId, type FormEvent } from "react";
import { Dialog } from "radix-ui";
import { Check, CheckCircle2, ChevronDown, Clock, Loader2, MapPin, Sparkles, Truck, X, XCircle } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { describeError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ApiServiceabilityResult } from "@/types/api/serviceability";

const STORAGE_PINCODE_KEY = "dochomoeo_delivery_pincode";
const STORAGE_META_KEY = "dochomoeo_delivery_location_meta";
const PINCODE_EVENT = "dochomoeo:pincode-changed";

const QUICK_PINCODES = [
  { pin: "211011", label: "Prayagraj" },
  { pin: "110001", label: "New Delhi" },
  { pin: "400001", label: "Mumbai" },
  { pin: "560001", label: "Bengaluru" },
  { pin: "700001", label: "Kolkata" },
  { pin: "600001", label: "Chennai" },
];

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "done"; result: ApiServiceabilityResult }
  | { kind: "error"; message: string };

export function DeliveryLocationSelector({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const baseId = useId();
  const inputId = `${baseId}-pincode-input`;

  const [open, setOpen] = useState(false);
  const [pincode, setPincode] = useState("211011");
  const [city, setCity] = useState<string | null>("Prayagraj");
  const [inputVal, setInputVal] = useState("211011");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // 1. Initial Load & Sync with LocalStorage and Global Events
  useEffect(() => {
    let active = true;

    const loadFromStorage = () => {
      try {
        const storedPin = localStorage.getItem(STORAGE_PINCODE_KEY);
        const storedMeta = localStorage.getItem(STORAGE_META_KEY);
        if (storedPin && /^[1-9]\d{5}$/.test(storedPin)) {
          setPincode(storedPin);
          setInputVal(storedPin);
          if (storedMeta) {
            const meta = JSON.parse(storedMeta) as ApiServiceabilityResult;
            if (meta && meta.pincode === storedPin) {
              setCity(meta.city);
              setStatus({ kind: "done", result: meta });
              return;
            }
          }
          // Fetch status in background if meta not cached
          void repositories.serviceability.checkPincode(storedPin).then((res) => {
            if (active) {
              setCity(res.city);
              setStatus({ kind: "done", result: res });
              localStorage.setItem(STORAGE_META_KEY, JSON.stringify(res));
            }
          }).catch(() => {});
        } else {
          // Default Prayagraj 211011
          setPincode("211011");
          setInputVal("211011");
          setCity("Prayagraj");
        }
      } catch {
        // Storage unreadable
      }
    };

    loadFromStorage();

    const handleExternalChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ pincode: string; result?: ApiServiceabilityResult }>;
      if (customEvent.detail?.pincode) {
        setPincode(customEvent.detail.pincode);
        setInputVal(customEvent.detail.pincode);
        if (customEvent.detail.result) {
          setCity(customEvent.detail.result.city);
          setStatus({ kind: "done", result: customEvent.detail.result });
        }
      }
    };

    window.addEventListener(PINCODE_EVENT, handleExternalChange);
    window.addEventListener("storage", loadFromStorage);

    return () => {
      active = false;
      window.removeEventListener(PINCODE_EVENT, handleExternalChange);
      window.removeEventListener("storage", loadFromStorage);
    };
  }, []);

  const verifyPincode = async (targetPin: string) => {
    const pin = targetPin.trim();
    if (!/^[1-9]\d{5}$/.test(pin)) {
      setStatus({ kind: "error", message: "Please enter a valid 6-digit Indian postal code." });
      return;
    }

    setStatus({ kind: "checking" });
    try {
      const res = await repositories.serviceability.checkPincode(pin);
      setStatus({ kind: "done", result: res });
      if (res.deliverable) {
        setPincode(pin);
        setCity(res.city);
        try {
          localStorage.setItem(STORAGE_PINCODE_KEY, pin);
          localStorage.setItem(STORAGE_META_KEY, JSON.stringify(res));
          window.dispatchEvent(
            new CustomEvent(PINCODE_EVENT, { detail: { pincode: pin, result: res } })
          );
        } catch {
          // LocalStorage fallback
        }
      }
    } catch (err: unknown) {
      setStatus({
        kind: "error",
        message: describeError(err, "We couldn't verify this pincode right now. Please check your connection and retry."),
      });
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    void verifyPincode(inputVal);
  };

  const handleQuickSelect = (quickPin: string) => {
    setInputVal(quickPin);
    void verifyPincode(quickPin);
  };

  const displayLocation = city ? `${city} ${pincode}` : pincode;

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* TRIGGER BUTTON (Rendered in Header)                                */}
      {/* ------------------------------------------------------------------ */}
      <button
        type="button"
        onClick={() => {
          setInputVal(pincode);
          setOpen(true);
        }}
        aria-label={`Deliver to ${displayLocation}. Click to change delivery location`}
        className={cn(
          "group flex h-10 items-center rounded-full transition-all cursor-pointer text-left shrink-0",
          compact
            ? "gap-1 px-2.5 border border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/10 hover:bg-white/60 backdrop-blur-xl dark:hover:bg-white/20 hover:border-[#0d5a43]/40"
            : "gap-2 px-3 border border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/10 hover:bg-white/60 backdrop-blur-xl dark:hover:bg-white/20 hover:border-[#0d5a43]/40 shadow-2xs",
          className
        )}
      >
        <span
          className={cn(
            "grid place-items-center rounded-full bg-[#0d5a43]/10 text-[#0d5a43] dark:text-emerald-400 shrink-0",
            compact ? "size-6" : "size-6.5"
          )}
        >
          <MapPin className={compact ? "size-3" : "size-3.5"} strokeWidth={2.2} />
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-[9px] font-semibold text-muted-ink uppercase tracking-wider">
            {compact ? "PIN" : "Deliver to"}
          </span>
          <span
            className={cn(
              "font-bold text-ink dark:text-white flex items-center gap-0.5 sm:gap-1 mt-0.5 truncate",
              compact
                ? "text-[11px] max-w-[70px]"
                : "text-xs sm:text-[0.8125rem] max-w-[120px] sm:max-w-[160px]"
            )}
          >
            {compact ? pincode : displayLocation}
            <ChevronDown className="size-2.5 sm:size-3 text-muted-ink group-hover:text-ink shrink-0 transition-transform duration-200" />
          </span>
        </div>
      </button>

      {/* ------------------------------------------------------------------ */}
      {/* DIALOG POPUP (Scaled-Up Minimalist & Responsive)                   */}
      {/* ------------------------------------------------------------------ */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-340 data-[state=closed]:duration-260 ease-out" />
          <Dialog.Content
            aria-describedby={`${baseId}-desc`}
            style={{
              backdropFilter: "blur(48px) saturate(200%) contrast(102%)",
              WebkitBackdropFilter: "blur(48px) saturate(200%) contrast(102%)",
            }}
            className={cn(
              "fixed z-[71] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-[min(94vw,490px)] rounded-[2rem] border border-white/90 dark:border-white/25",
              "bg-gradient-to-b from-white/92 via-white/86 to-white/90 dark:from-[#0c1e17]/92 dark:via-[#0c1e17]/86 dark:to-[#0c1e17]/90 p-6 sm:p-7 shadow-[0_30px_90px_-20px_rgba(13,90,67,0.22),0_12px_40px_-10px_rgba(0,0,0,0.12),inset_0_1.5px_1px_0_rgba(255,255,255,0.95)] outline-none",
              // Smooth, genuine opening & closing physical transitions
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[state=closed]:slide-out-to-top-[1.5%] data-[state=open]:slide-in-from-top-[1.5%]",
              "data-[state=open]:duration-340 data-[state=closed]:duration-260",
              "data-[state=open]:ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:ease-[cubic-bezier(0.25,1,0.5,1)]"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#0d5a43]/15 to-emerald-500/10 text-[#0d5a43] dark:text-emerald-400 ring-1 ring-[#0d5a43]/20 shrink-0">
                  <MapPin className="size-6" strokeWidth={2.2} />
                </span>
                <div>
                  <Dialog.Title className="font-display text-lg sm:text-xl font-bold text-ink dark:text-white leading-tight">
                    Choose Delivery Location
                  </Dialog.Title>
                  <p id={`${baseId}-desc`} className="text-xs sm:text-[13px] text-muted-ink mt-0.5">
                    Check item availability, delivery timeline & COD eligibility.
                  </p>
                </div>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close dialog"
                  className="grid size-8.5 place-items-center rounded-full text-muted-ink hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <X className="size-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Integrated Minimalist Pincode Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-wider text-muted-ink block">
                Enter 6-digit Indian Pincode
              </label>
              <div className="relative flex items-center rounded-2xl border border-black/[0.1] dark:border-white/15 bg-paper/70 dark:bg-white/5 p-1.5 focus-within:border-[#0d5a43] focus-within:ring-3 focus-within:ring-[#0d5a43]/15 focus-within:bg-white transition-all shadow-2xs">
                <span className="grid size-9 place-items-center text-muted-ink pl-1">
                  <MapPin className="size-4.5 text-[#0d5a43] dark:text-emerald-400" strokeWidth={2} />
                </span>
                <input
                  id={inputId}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={inputVal}
                  onChange={(e) => {
                    const next = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setInputVal(next);
                    if (status.kind === "error") setStatus({ kind: "idle" });
                  }}
                  placeholder="e.g. 211011"
                  className="flex-1 bg-transparent px-2 text-sm sm:text-base font-bold text-ink dark:text-white placeholder:font-normal placeholder:text-muted-ink/60 outline-none tracking-wider"
                />
                {inputVal.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputVal("");
                      setStatus({ kind: "idle" });
                    }}
                    className="grid size-7 place-items-center rounded-full text-muted-ink hover:text-ink hover:bg-black/5 mr-1 cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
                <Button
                  type="submit"
                  disabled={inputVal.trim().length !== 6 || status.kind === "checking"}
                  className="h-9.5 px-5 rounded-xl bg-gradient-to-r from-[#0d5a43] to-[#084533] hover:from-[#0a4835] hover:to-[#063b2c] text-white font-bold text-xs sm:text-sm shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {status.kind === "checking" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Check"
                  )}
                </Button>
              </div>
            </form>

            {/* Status Feedback Result */}
            <div className="mt-4">
              {status.kind === "checking" && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-paper dark:bg-white/5 border border-line-soft text-xs text-muted-ink animate-pulse">
                  <Loader2 className="size-4 animate-spin text-[#0d5a43] shrink-0" />
                  <span>Checking logistics network serviceability for {inputVal}…</span>
                </div>
              )}

              {status.kind === "error" && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-xs text-red-700 dark:text-red-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <XCircle className="size-4 shrink-0 text-red-600" />
                    <span>Check Failed</span>
                  </div>
                  <p className="pl-5.5 text-[11px] leading-relaxed">{status.message}</p>
                </div>
              )}

              {status.kind === "done" && (
                status.result.deliverable ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50 dark:from-emerald-950/20 dark:via-black/20 dark:to-emerald-950/10 border border-emerald-500/30 text-xs space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300 text-[13px]">
                        <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Available for Home Delivery</span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        Verified
                      </span>
                    </div>

                    <div className="space-y-1.5 pl-6.5 text-[12px] text-ink/80 dark:text-white/80">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="size-3.5 text-muted-ink shrink-0" />
                        <span>
                          {status.result.city ? `${status.result.city}, ` : ""}{status.result.state || "India"} <strong className="text-ink dark:text-white">({status.result.pincode})</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-[#0d5a43] dark:text-emerald-300">
                        <Truck className="size-3.5 shrink-0" />
                        <span>
                          {status.result.estimatedDate
                            ? `Get it by ${status.result.estimatedDayName ? `${status.result.estimatedDayName}, ` : ""}${status.result.estimatedDate}`
                            : `Estimated delivery in ${status.result.deliveryDays ?? 3} business days`}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-ink">
                        {status.result.codAvailable ? "✓ Cash on Delivery (COD) eligible" : "• Prepaid online payment only"}
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="w-full mt-2 h-9.5 rounded-xl bg-[#0d5a43] hover:bg-[#074231] text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs"
                    >
                      Deliver to this Location
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <XCircle className="size-4 text-amber-600 shrink-0" />
                      <span>Delivery Currently Unavailable</span>
                    </div>
                    <p className="pl-5.5 text-[11px] leading-relaxed">
                      We do not deliver to pincode <strong>{status.result.pincode}</strong> yet. We are actively expanding our network corridors.
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="mt-4 pt-3.5 border-t border-black/[0.06] dark:border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-ink block mb-2">
                Popular Cities & Pincodes
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {QUICK_PINCODES.map((item) => (
                  <button
                    key={item.pin}
                    type="button"
                    onClick={() => handleQuickSelect(item.pin)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5",
                      pincode === item.pin
                        ? "bg-[#0d5a43] text-white border-[#0d5a43] shadow-xs"
                        : "bg-paper/80 dark:bg-white/5 border-line-soft text-muted-ink hover:text-ink hover:border-[#0d5a43]/40 hover:bg-white"
                    )}
                  >
                    <span>{item.label}</span>
                    <span className={cn("text-[10px] font-normal", pincode === item.pin ? "text-white/80" : "text-muted-ink")}>
                      ({item.pin})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
