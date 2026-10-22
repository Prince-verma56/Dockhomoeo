"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  QrCode,
  Building2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Lock,
  Smartphone,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/formatters/price";

interface DemoPaymentClientProps {
  orderId: number | null;
  total: number;
  orderNumber: string;
}

export function DemoPaymentClient({ orderId, total, orderNumber }: DemoPaymentClientProps) {
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [simulating, setSimulating] = useState<string | null>(null);

  const handleSimulate = (outcome: "success" | "failed" | "pending") => {
    setSimulating(outcome);
    setTimeout(() => {
      if (orderId) {
        window.location.assign(`/patient/orders/${orderId}?payment=${outcome}`);
      } else {
        window.location.assign(`/account/orders`);
      }
    }, 700);
  };

  return (
    <Container className="max-w-2xl">
      {/* Dev Environment Notice Banner */}
      <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-ink">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-xs leading-relaxed">
            <strong className="block text-sm font-bold text-amber-900 dark:text-amber-200">
              [DEMO ENVIRONMENT] Simulated Payment Gateway
            </strong>
            This is a local development simulation for testing payment return states, authoritative confirmation handling, and order recovery.
            <span className="block mt-1 text-muted-ink">
              No real card or UPI details are processed, and no money moves. In production builds, this simulator is completely unavailable.
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Card */}
      <div className="rounded-3xl border border-line-soft bg-paper p-6 sm:p-8 shadow-sm">
        {/* Merchant & Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line-soft pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-forest/10 text-forest">
                <Lock className="size-4" />
              </span>
              <span className="text-xs font-bold tracking-wider text-muted-ink uppercase">
                DocHomoeo Telehealth Sandbox
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink">
              Payment Checkout Review
            </h1>
            <p className="mt-1 text-xs text-muted-ink">
              Order Reference: <span className="font-mono font-semibold text-ink">{orderNumber}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-canvas border border-line-soft p-4 sm:text-right">
            <span className="block text-[11px] font-semibold text-muted-ink uppercase">Amount Due</span>
            <span className="font-display text-2xl font-bold text-forest">
              {formatRupees(total || 0)}
            </span>
          </div>
        </div>

        {/* Payment Instruments Preview */}
        <div className="mt-6 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-ink">
            Select Simulated Instrument
          </label>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setMethod("upi")}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-semibold transition-all ${
                method === "upi"
                  ? "border-forest bg-forest/5 text-forest shadow-xs"
                  : "border-line-soft bg-canvas text-muted-ink hover:text-ink hover:border-line"
              }`}
            >
              <QrCode className="size-5" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("card")}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-semibold transition-all ${
                method === "card"
                  ? "border-forest bg-forest/5 text-forest shadow-xs"
                  : "border-line-soft bg-canvas text-muted-ink hover:text-ink hover:border-line"
              }`}
            >
              <CreditCard className="size-5" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("netbanking")}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-semibold transition-all ${
                method === "netbanking"
                  ? "border-forest bg-forest/5 text-forest shadow-xs"
                  : "border-line-soft bg-canvas text-muted-ink hover:text-ink hover:border-line"
              }`}
            >
              <Building2 className="size-5" />
              <span>Net Banking</span>
            </button>
          </div>

          {/* Instrument Details Mock */}
          <div className="rounded-2xl border border-line-soft bg-canvas p-4 text-xs text-muted-ink">
            {method === "upi" && (
              <div className="flex items-center gap-3">
                <Smartphone className="size-5 text-forest shrink-0" />
                <span>Simulated UPI Flow: Supports Google Pay, PhonePe, Paytm, and BHIM UPI intents.</span>
              </div>
            )}
            {method === "card" && (
              <div className="flex items-center gap-3">
                <CreditCard className="size-5 text-forest shrink-0" />
                <span>Simulated Card Flow: Supports 3D-Secure Visa, Mastercard, and RuPay OTP validations.</span>
              </div>
            )}
            {method === "netbanking" && (
              <div className="flex items-center gap-3">
                <Building2 className="size-5 text-forest shrink-0" />
                <span>Simulated NetBanking Flow: Supports SBI, HDFC, ICICI, and Axis Bank direct debits.</span>
              </div>
            )}
          </div>
        </div>

        {/* Test Outcome Actions */}
        <div className="mt-8 border-t border-line-soft pt-6 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-ink mb-2">
            Execute Simulated Outcome
          </label>

          <Button
            type="button"
            variant="brand"
            size="xl"
            disabled={simulating !== null}
            onClick={() => handleSimulate("success")}
            className="w-full gap-2 justify-center"
          >
            <CheckCircle2 className="size-4" />
            <span>Simulate Payment Success</span>
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={simulating !== null}
              onClick={() => handleSimulate("failed")}
              className="gap-2 justify-center border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle className="size-4" />
              <span>Simulate Gateway Failure</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={simulating !== null}
              onClick={() => handleSimulate("pending")}
              className="gap-2 justify-center border-line-soft text-muted-ink hover:text-ink hover:bg-cream"
            >
              <Clock className="size-4" />
              <span>Simulate Pending / Verification</span>
            </Button>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/checkout"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-ink hover:text-ink transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Cancel transaction and return to checkout</span>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
