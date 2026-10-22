"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRupees } from "@/lib/formatters/price";
import type { ApiOrderDetail } from "@/types/api/cart";

interface OrderCancelDialogProps {
  order: ApiOrderDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CANCEL_REASONS = [
  "Ordered incorrect remedy or potency",
  "Found alternative / purchased from local dispensary",
  "Doctor modified prescription",
  "Need to modify delivery address",
  "Expected faster delivery timeframe",
  "Duplicate order placed accidentally",
  "Other reason",
];

export function OrderCancelDialog({ order, open, onOpenChange }: OrderCancelDialogProps) {
  const [reason, setReason] = useState<string>(CANCEL_REASONS[0]);
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const canCancel = order.canCancel && !["CANCELLED", "DELIVERED", "SHIPPED"].includes(order.status.toUpperCase());

  const handleSimulateCancel = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsSubmitted(false);
      setNote("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl bg-paper p-6 border-line-soft">
        <DialogHeader className="pr-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-ink">
                Cancel Order #{order.orderNumber}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-ink mt-0.5">
                Review cancellation terms and specify your reason
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-forest-deep text-white shadow-soft">
              <CheckCircle2 className="size-7" />
            </div>
            <h4 className="font-display text-lg font-bold text-ink">
              Cancellation Request Formatted
            </h4>
            <div className="my-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-800">
              <Info className="size-3.5" />
              Preview Mode (No backend mutation)
            </div>
            <p className="text-xs text-muted-ink leading-relaxed max-w-sm mx-auto">
              In this UI audit phase, your cancellation request has been validated and
              recorded locally. When live backend cancellation endpoints are integrated,
              this will trigger automated inventory release and refund initiation.
            </p>
            <div className="mt-6">
              <Button variant="brand" onClick={handleClose} className="rounded-xl px-6">
                Close Preview
              </Button>
            </div>
          </div>
        ) : !canCancel ? (
          <div className="py-3 space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-xs text-red-800 leading-relaxed">
              <span className="font-semibold block mb-1">Cancellation Ineligible</span>
              This order has already progressed past the packaging stage (current status:{" "}
              <strong className="capitalize">{order.status}</strong>). According to DocHomoeo policy, once
              medicines are dispatched with the courier, orders cannot be cancelled mid-transit. You can request a return or refuse delivery upon arrival.
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="w-full rounded-xl">
                Understood
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Order snapshot */}
            <div className="rounded-xl border border-line-soft bg-canvas p-3.5 text-xs">
              <div className="flex justify-between text-muted-ink">
                <span>Items count:</span>
                <span className="font-medium text-ink">{order.items.length} items</span>
              </div>
              <div className="flex justify-between text-muted-ink mt-1">
                <span>Refundable value:</span>
                <span className="font-semibold text-ink">{formatRupees(order.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-muted-ink mt-1">
                <span>Payment method:</span>
                <span className="capitalize font-medium text-ink">
                  {order.paymentMethod.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Refund policy note */}
            <div className="rounded-xl border border-amber-300/40 bg-amber-50/60 p-3 text-xs leading-relaxed text-amber-900">
              <p className="font-semibold mb-0.5">Refund Commitment:</p>
              Prepaid orders cancelled before dispatch receive a 100% refund initiated to the original payment source within 7-10 business days.
            </div>

            {/* Reason selector */}
            <div className="space-y-1.5">
              <label htmlFor="cancel-reason" className="text-xs font-semibold text-ink">
                Reason for cancellation <span className="text-red-500">*</span>
              </label>
              <select
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10 w-full rounded-xl border border-line-soft bg-canvas px-3 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-deep/30"
              >
                {CANCEL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label htmlFor="cancel-notes" className="text-xs font-semibold text-ink">
                Additional Comments <span className="text-muted-ink font-normal">(Optional)</span>
              </label>
              <Textarea
                id="cancel-notes"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Help us improve our dispensary service..."
                className="rounded-xl bg-canvas border-line-soft text-xs"
              />
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                variant="outline"
                type="button"
                onClick={handleClose}
                className="rounded-xl border-line-soft"
              >
                Keep Order
              </Button>
              <Button
                variant="destructive"
                type="button"
                disabled={isSubmitting}
                onClick={handleSimulateCancel}
                className="rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                {isSubmitting ? "Processing..." : "Confirm Cancellation (Preview)"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
