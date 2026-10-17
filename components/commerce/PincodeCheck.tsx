"use client";

import { useId, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, MapPin, XCircle } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { describeError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ApiServiceabilityResult } from "@/types/api/serviceability";

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "done"; result: ApiServiceabilityResult }
  | { kind: "error"; message: string };

/**
 * "Deliver to" check on the product page, through the serviceability
 * repository (GET /api/shop/pincode/:pincode). It reports only what the shop
 * answers: deliverable or not, pay on delivery, and a delivery estimate when
 * one is configured — never a promise the data does not make.
 */
export function PincodeCheck({ className }: { className?: string }) {
  const id = useId();
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const valid = /^[1-9]\d{5}$/.test(pincode);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid) {
      setStatus({ kind: "error", message: "Enter a 6-digit Indian pincode." });
      return;
    }
    setStatus({ kind: "checking" });
    try {
      setStatus({ kind: "done", result: await repositories.serviceability.checkPincode(pincode) });
    } catch (error) {
      setStatus({ kind: "error", message: describeError(error, "We couldn’t check that pincode just now. Try again in a moment.") });
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className={cn("rounded-2xl border border-line-soft bg-paper p-4 shadow-2xs", className)}>
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="grid size-6 place-items-center rounded-full bg-forest/10 text-forest">
          <MapPin aria-hidden className="size-3.5 text-forest" strokeWidth={2} />
        </span>
        Check delivery availability
      </label>
      <div className="mt-3 flex gap-2">
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="Enter pincode"
          value={pincode}
          aria-invalid={status.kind === "error" || undefined}
          aria-describedby={`${id}-result`}
          onChange={(event) => {
            setPincode(event.target.value.replace(/\D/g, "").slice(0, 6));
            if (status.kind !== "idle") setStatus({ kind: "idle" });
          }}
          className="h-11 flex-1 rounded-xl border-line bg-canvas/60 px-3.5 text-[0.9375rem] tracking-wider tabular-nums focus-visible:bg-white"
        />
        <Button type="submit" variant="brand" size="default" className="h-11 cursor-pointer rounded-xl px-5 font-semibold" disabled={status.kind === "checking"}>
          {status.kind === "checking" ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
          Check
        </Button>
      </div>
      <div id={`${id}-result`} role="status" className="mt-2.5 min-h-5 text-xs">
        {status.kind === "error" ? <p className="text-destructive">{status.message}</p> : null}
        {status.kind === "done" ? (
          status.result.deliverable ? (
            <p className="flex items-start gap-1.5 text-forest-deep font-medium">
              <CheckCircle2 aria-hidden className="mt-px size-3.5 shrink-0 text-forest" />
              <span>
                Delivers to {status.result.city ? `${status.result.city}, ` : ""}
                {status.result.pincode}
                {status.result.deliveryDays ? ` in about ${status.result.deliveryDays} days.` : ". Delivery confirmed on dispatch."}
                {status.result.codAvailable ? " Cash on delivery available." : " Prepaid only."}
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-1.5 text-destructive font-medium">
              <XCircle aria-hidden className="mt-px size-3.5 shrink-0" />
              We don’t deliver to {status.result.pincode} yet.
            </p>
          )
        ) : null}
        {status.kind === "idle" ? <p className="text-muted-ink text-[0.75rem]">Get delivery estimate, available offers and payment options.</p> : null}
      </div>
    </form>
  );
}
