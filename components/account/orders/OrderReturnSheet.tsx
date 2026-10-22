"use client";

import { useState } from "react";
import Image from "next/image";
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  Info,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRupees } from "@/lib/formatters/price";
import type { ApiOrderDetail } from "@/types/api/cart";

interface OrderReturnSheetProps {
  order: ApiOrderDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RETURN_REASONS = [
  "Damaged / Broken glass vial or liquid leakage",
  "Tampered packaging or manufacturer seal broken",
  "Wrong potency / dilution delivered (e.g. 200C instead of 30C)",
  "Different medicine brand / product sent",
  "Remedy past expiration date",
  "Missing medicine from parcel package",
  "Quality / colour inconsistency in globule or liquid",
];

export function OrderReturnSheet({ order, open, onOpenChange }: OrderReturnSheetProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [returnReason, setReturnReason] = useState<string>(RETURN_REASONS[0]);
  const [actionType, setActionType] = useState<"replacement" | "refund">("replacement");
  const [comments, setComments] = useState<string>("");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<"select" | "review" | "success">("select");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleItem = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
    if (error) setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newUrls = files.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prev) => [...prev, ...newUrls].slice(0, 4));
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProceedToReview = () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one medicine item to return or replace.");
      return;
    }
    setStep("review");
  };

  const handleSimulateSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("success");
    }, 700);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("select");
      setSelectedItems([]);
      setComments("");
      setPhotoPreviews([]);
      setError("");
    }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto p-6 bg-paper border-line-soft text-ink"
      >
        <SheetHeader className="border-b border-line-soft pb-4 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-forest-deep text-white shadow-soft">
              <RotateCcw className="size-5" />
            </div>
            <div>
              <SheetTitle className="font-display text-xl font-bold text-ink">
                Return & Replacement
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-ink">
                DocHomoeo 7-Day Quality Replacement Guarantee
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {step === "success" ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-forest-deep text-white shadow-soft">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-800">
              <Info className="size-3.5" />
              Frontend Simulation Preview
            </div>

            <h3 className="font-display text-xl font-bold text-ink">
              {actionType === "replacement"
                ? "Replacement Requisition Drafted"
                : "Return & Refund Request Drafted"}
            </h3>

            <p className="text-xs text-muted-ink leading-relaxed max-w-sm mx-auto">
              Your return verification docket has been formatted for Order #{order.orderNumber}.
              In this preview phase, no tickets are transmitted to courier reverse-logistics.
              Once integrated, our dispensary team reviews damage evidence within 24 hours.
            </p>

            <div className="rounded-xl border border-line-soft bg-canvas p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-ink">Order Number:</span>
                <span className="font-semibold text-ink">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-ink">Resolution Preference:</span>
                <span className="font-semibold text-forest-deep capitalize">{actionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-ink">Items Selected:</span>
                <span className="font-semibold text-ink">{selectedItems.length} item(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-ink">Reason:</span>
                <span className="font-semibold text-ink truncate max-w-[200px]">
                  {returnReason}
                </span>
              </div>
              {photoPreviews.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-ink">Verification Photos:</span>
                  <span className="font-semibold text-ink">{photoPreviews.length} attached</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button variant="brand" onClick={handleClose} className="w-full h-11 rounded-xl">
                Done & Return to Order
              </Button>
            </div>
          </div>
        ) : step === "review" ? (
          <div className="py-4 space-y-5">
            <div className="rounded-xl border border-line-soft bg-canvas p-4 space-y-3 text-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-ink block">
                Verification Summary
              </span>
              <div className="border-b border-line-soft pb-2 space-y-1">
                <span className="text-muted-ink block">Chosen Remedy Items:</span>
                <ul className="list-disc list-inside font-medium text-ink pl-1">
                  {order.items
                    .filter((item) => selectedItems.includes(item.id))
                    .map((item) => (
                      <li key={item.id} className="truncate">
                        {item.productName} ({item.variantTitle})
                      </li>
                    ))}
                </ul>
              </div>

              <div>
                <span className="text-muted-ink block">Reported Reason:</span>
                <span className="font-semibold text-ink">{returnReason}</span>
              </div>

              <div>
                <span className="text-muted-ink block">Desired Outcome:</span>
                <span className="font-semibold text-forest-deep capitalize">
                  {actionType === "replacement"
                    ? "Dispatch Free Replacement"
                    : "Reverse Pickup & Full Refund"}
                </span>
              </div>

              {comments && (
                <div>
                  <span className="text-muted-ink block">Dispensary Notes:</span>
                  <p className="text-ink mt-0.5 bg-paper p-2 rounded-lg border border-line-soft">
                    {comments}
                  </p>
                </div>
              )}

              {photoPreviews.length > 0 && (
                <div>
                  <span className="text-muted-ink block mb-1">
                    Proof Photos ({photoPreviews.length}):
                  </span>
                  <div className="flex gap-2">
                    {photoPreviews.map((url, i) => (
                      <div
                        key={i}
                        className="relative size-12 rounded-lg border border-line-soft overflow-hidden"
                      >
                        <Image
                          src={url}
                          alt="Evidence"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview notice */}
            <div className="rounded-xl border border-amber-300/40 bg-amber-50/70 p-3 text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold block mb-0.5">Preview Notification:</span>
              Submitting now confirms the local interaction test without initiating courier dispatch or inventory changes.
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep("select")}
                className="flex-1 rounded-xl border-line-soft"
              >
                Back & Edit
              </Button>
              <Button
                variant="brand"
                disabled={isSubmitting}
                onClick={handleSimulateSubmit}
                className="flex-1 rounded-xl"
              >
                {isSubmitting ? "Formatting..." : "Submit Requisition"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            {/* Step 1: Select Items */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-ink mb-2">
                1. Select items to return / replace <span className="text-red-500">*</span>
              </label>

              <div className="space-y-2">
                {order.items.map((item) => {
                  const isChecked = selectedItems.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        isChecked
                          ? "border-forest-deep bg-sage-wash/60 ring-2 ring-forest-deep/15"
                          : "border-line-soft bg-canvas hover:border-forest/30"
                      }`}
                    >
                      <div
                        className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                          isChecked
                            ? "border-forest-deep bg-forest-deep text-white"
                            : "border-line-soft bg-paper"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="size-3.5" />}
                      </div>

                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-semibold text-ink truncate">{item.productName}</p>
                        <p className="text-muted-ink">
                          {item.variantTitle} · Qty {item.quantity} · {formatRupees(item.lineTotal)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {error}
                </p>
              )}
            </div>

            {/* Step 2: Resolution Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-ink mb-2">
                2. Preferred Resolution
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActionType("replacement")}
                  className={`rounded-xl border p-3 text-left text-xs transition-all cursor-pointer ${
                    actionType === "replacement"
                      ? "border-forest-deep bg-sage-wash/60 font-semibold text-forest-deep ring-2 ring-forest-deep/15"
                      : "border-line-soft bg-canvas text-ink"
                  }`}
                >
                  <span className="block font-bold">Free Replacement</span>
                  <span className="text-[11px] text-muted-ink mt-0.5 block">
                    Expedited dispatch of identical item
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType("refund")}
                  className={`rounded-xl border p-3 text-left text-xs transition-all cursor-pointer ${
                    actionType === "refund"
                      ? "border-forest-deep bg-sage-wash/60 font-semibold text-forest-deep ring-2 ring-forest-deep/15"
                      : "border-line-soft bg-canvas text-ink"
                  }`}
                >
                  <span className="block font-bold">Return for Refund</span>
                  <span className="text-[11px] text-muted-ink mt-0.5 block">
                    Credited back to bank / original mode
                  </span>
                </button>
              </div>
            </div>

            {/* Step 3: Reason */}
            <div className="space-y-1.5">
              <label htmlFor="return-reason" className="text-xs font-semibold uppercase tracking-wider text-muted-ink">
                3. Reason for return / claim
              </label>
              <select
                id="return-reason"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="h-10 w-full rounded-xl border border-line-soft bg-canvas px-3 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-deep/30"
              >
                {RETURN_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 4: Photo Evidence */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-ink mb-1.5">
                4. Photos of damaged vial or parcel{" "}
                <span className="font-normal text-[11px] lowercase">(Optional but recommended)</span>
              </label>

              <div className="flex flex-wrap gap-2 mb-2">
                {photoPreviews.map((url, index) => (
                  <div
                    key={index}
                    className="relative size-16 rounded-xl border border-line-soft overflow-hidden group shadow-xs"
                  >
                    <Image
                      src={url}
                      alt="Upload preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}

                {photoPreviews.length < 4 && (
                  <label className="flex size-16 flex-col items-center justify-center rounded-xl border border-dashed border-line-soft bg-canvas text-muted-ink hover:border-forest-deep/40 hover:text-forest-deep cursor-pointer transition-colors">
                    <Upload className="size-4 mb-0.5" />
                    <span className="text-[10px] font-medium">Add photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>
              <p className="text-[11px] text-muted-ink/80">
                Supports JPG, PNG up to 4 images. Clear label & seal photos expedite approvals.
              </p>
            </div>

            {/* Step 5: Notes */}
            <div className="space-y-1.5">
              <label htmlFor="return-comments" className="text-xs font-semibold uppercase tracking-wider text-muted-ink">
                5. Additional notes
              </label>
              <Textarea
                id="return-comments"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Describe the issue with the phial, breakage or packaging condition..."
                className="rounded-xl bg-canvas border-line-soft text-xs"
              />
            </div>

            {/* CTA */}
            <div className="pt-2">
              <Button
                type="button"
                variant="brand"
                onClick={handleProceedToReview}
                className="w-full h-11 rounded-xl text-sm font-medium"
              >
                Review Requisition Request
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
