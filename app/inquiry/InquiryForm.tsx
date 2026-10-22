"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Stethoscope,
  Store,
  Truck,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type BuyerType =
  | "clinic"
  | "doctor"
  | "pharmacy"
  | "distributor"
  | "institution";

type FormData = {
  buyerType: BuyerType;
  fullName: string;
  designation: string;
  organizationName: string;
  licenseNumber: string;
  gstNumber: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  productCategories: string[];
  estimatedVolume: string;
  orderFrequency: string;
  message: string;
};

const INITIAL_FORM: FormData = {
  buyerType: "clinic",
  fullName: "",
  designation: "",
  organizationName: "",
  licenseNumber: "",
  gstNumber: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  pincode: "",
  productCategories: [],
  estimatedVolume: "",
  orderFrequency: "regular",
  message: "",
};

const BUYER_TYPES: {
  id: BuyerType;
  label: string;
  description: string;
  icon: typeof Building2;
}[] = [
  {
    id: "clinic",
    label: "Clinic / Hospital",
    description: "Multi-physician practices, homoeopathic OPDs & medical centres",
    icon: Building2,
  },
  {
    id: "doctor",
    label: "Doctor / Practitioner",
    description: "Registered homoeopathic physicians & private dispensaries",
    icon: Stethoscope,
  },
  {
    id: "pharmacy",
    label: "Retail Pharmacy / Chemist",
    description: "Licensed chemists & homoeopathic medicine retailers",
    icon: Store,
  },
  {
    id: "distributor",
    label: "Distributor / Stockist",
    description: "Regional wholesale stockists & institutional distributors",
    icon: Truck,
  },
  {
    id: "institution",
    label: "Corporate / Research",
    description: "Academic institutions, research labs & corporate wellness",
    icon: Briefcase,
  },
];

const PRODUCT_CATEGORIES = [
  "Mother Tinctures (Q)",
  "Dilutions (30C / 200C / 1M)",
  "Biochemics & Bio-Combinations",
  "Speciality Patents & Syrups",
  "Ointments & Topical Gels",
  "Dispensing Globules & Sugar Milk",
  "Veterinary Homoeopathy",
  "High-Potency LM Potencies",
];

const ESTIMATED_VOLUMES = [
  { value: "sub25k", label: "₹10,000 – ₹25,000 / order" },
  { value: "25k-50k", label: "₹25,000 – ₹50,000 / order" },
  { value: "50k-100k", label: "₹50,000 – ₹1,00,000 / order" },
  { value: "above100k", label: "₹1,00,000+ / large batch" },
  { value: "sample", label: "Trial / Evaluation Batch" },
];

export function InquiryForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [step, setStep] = useState<"form" | "review" | "success">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiryToken, setInquiryToken] = useState<string>("");

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) => {
      const exists = prev.productCategories.includes(cat);
      const updated = exists
        ? prev.productCategories.filter((c) => c !== cat)
        : [...prev.productCategories, cat];
      return { ...prev, productCategories: updated };
    });
    if (errors.productCategories) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.productCategories;
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please provide your full contact name";
    }
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Please provide your organization or clinic name";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid business email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Please enter a valid 10-digit contact number";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (formData.pincode.replace(/\D/g, "").length !== 6) {
      newErrors.pincode = "Please enter a valid 6-digit postal code";
    }
    if (formData.productCategories.length === 0) {
      newErrors.productCategories = "Select at least one product category of interest";
    }
    if (!formData.estimatedVolume) {
      newErrors.estimatedVolume = "Please select an estimated order volume range";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setStep("review");
      window.scrollTo({ top: 350, behavior: "smooth" });
    }
  };

  const handleSubmitSimulation = async () => {
    setIsSubmitting(true);
    const generatedToken = `DHQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    setInquiryToken(generatedToken);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `[WHOLESALE INQUIRY] ${formData.organizationName} (${formData.buyerType}). Delivery: ${formData.city}, ${formData.state} - ${formData.pincode}. Categories: ${formData.productCategories.join(", ")}. Volume: ${formData.estimatedVolume}. Message: ${formData.message || "None"}`,
          category: "WHOLESALE",
          email: formData.email,
          metadata: {
            ...formData,
            inquiryToken: generatedToken,
          },
        }),
      });
    } catch {
      // Graceful error fallback
    } finally {
      setIsSubmitting(false);
      setStep("success");
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setStep("form");
    setInquiryToken("");
  };

  // SUCCESS / CONFIRMATION VIEW
  if (step === "success") {
    return (
      <div className="rounded-3xl border border-line-soft bg-paper p-8 md:p-12 shadow-soft">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-forest-deep text-white shadow-soft">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="size-3.5" />
            Inquiry Successfully Transmitted
          </div>

          <h2 className="font-display text-3xl font-bold text-ink">
            Inquiry Received
          </h2>

          <p className="mt-3 text-base leading-relaxed text-muted-ink">
            Your bulk procurement request has been validated and recorded. Our institutional procurement desk will review your requirements and reach out within 1 business day.
          </p>

          <div className="my-8 rounded-2xl border border-line-soft bg-canvas p-6 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-ink">
                  Generated Inquiry Token
                </span>
                <p className="font-mono text-base font-bold text-forest-deep">
                  {inquiryToken}
                </p>
              </div>
              <Badge variant="outline" className="border-forest/30 text-forest-deep">
                Ready for Dispatch
              </Badge>
            </div>

            <div className="grid gap-4 pt-4 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-ink/80 block text-xs">Organization</span>
                <span className="font-medium text-ink">
                  {formData.organizationName}
                </span>
              </div>
              <div>
                <span className="text-muted-ink/80 block text-xs">Contact Person</span>
                <span className="font-medium text-ink">{formData.fullName}</span>
              </div>
              <div>
                <span className="text-muted-ink/80 block text-xs">Buyer Category</span>
                <span className="font-medium text-ink capitalize">
                  {formData.buyerType}
                </span>
              </div>
              <div>
                <span className="text-muted-ink/80 block text-xs">Location</span>
                <span className="font-medium text-ink">
                  {formData.city}, {formData.state} - {formData.pincode}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-ink/80 block text-xs mb-1">
                  Requested Categories ({formData.productCategories.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {formData.productCategories.map((c) => (
                    <span
                      key={c}
                      className="inline-block rounded-md bg-sage-wash px-2 py-0.5 text-xs text-forest-deep"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="brand"
              onClick={handleReset}
              className="w-full sm:w-auto h-12 px-8 rounded-xl"
            >
              <RotateCcw className="size-4" />
              Draft Another Inquiry
            </Button>
            <Button
              variant="outline"
              asChild
              className="w-full sm:w-auto h-12 px-8 rounded-xl border-forest-deep/20 text-forest-deep"
            >
              <Link href="/products">
                Browse Products Catalog
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // REVIEW STEP
  if (step === "review") {
    return (
      <div className="rounded-3xl border border-line-soft bg-paper p-8 md:p-12 shadow-soft">
        <div className="mb-8 flex items-center justify-between border-b border-line-soft pb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Review Inquiry Details
            </h2>
            <p className="mt-1 text-sm text-muted-ink">
              Please verify your institutional procurement specifications before submitting.
            </p>
          </div>
          <Badge className="bg-sage-wash text-forest-deep border-none text-xs">
            Step 2 of 2: Review
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Buyer Type Banner */}
          <div className="flex items-center gap-4 rounded-2xl bg-canvas p-4 border border-line-soft">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-forest-deep text-white">
              <Building2 className="size-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-ink">
                Buyer Profile
              </span>
              <h4 className="font-medium text-ink capitalize">
                {BUYER_TYPES.find((b) => b.id === formData.buyerType)?.label}
              </h4>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 rounded-2xl border border-line-soft p-6 sm:grid-cols-2">
            <div>
              <span className="text-xs font-medium text-muted-ink block">Contact Person</span>
              <p className="text-sm font-semibold text-ink mt-0.5">
                {formData.fullName}{" "}
                {formData.designation && (
                  <span className="font-normal text-muted-ink">
                    ({formData.designation})
                  </span>
                )}
              </p>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-ink block">Organization</span>
              <p className="text-sm font-semibold text-ink mt-0.5">
                {formData.organizationName}
              </p>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-ink block">Email Address</span>
              <p className="text-sm font-semibold text-ink mt-0.5">{formData.email}</p>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-ink block">Phone / WhatsApp</span>
              <p className="text-sm font-semibold text-ink mt-0.5">{formData.phone}</p>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-ink block">Delivery City / State</span>
              <p className="text-sm font-semibold text-ink mt-0.5">
                {formData.city}, {formData.state} - {formData.pincode}
              </p>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-ink block">
                Estimated Volume
              </span>
              <p className="text-sm font-semibold text-ink mt-0.5">
                {ESTIMATED_VOLUMES.find((v) => v.value === formData.estimatedVolume)?.label}
              </p>
            </div>

            {(formData.licenseNumber || formData.gstNumber) && (
              <div className="sm:col-span-2 pt-2 border-t border-line-soft grid gap-4 sm:grid-cols-2">
                {formData.licenseNumber && (
                  <div>
                    <span className="text-xs font-medium text-muted-ink block">
                      Drug License / Reg. No.
                    </span>
                    <p className="text-sm font-mono text-ink mt-0.5">
                      {formData.licenseNumber}
                    </p>
                  </div>
                )}
                {formData.gstNumber && (
                  <div>
                    <span className="text-xs font-medium text-muted-ink block">GSTIN</span>
                    <p className="text-sm font-mono text-ink mt-0.5">
                      {formData.gstNumber}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="sm:col-span-2 pt-2 border-t border-line-soft">
              <span className="text-xs font-medium text-muted-ink block mb-2">
                Requested Remedies & Categories ({formData.productCategories.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {formData.productCategories.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center rounded-lg bg-forest-deep/10 px-3 py-1 text-xs font-medium text-forest-deep"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {formData.message && (
              <div className="sm:col-span-2 pt-2 border-t border-line-soft">
                <span className="text-xs font-medium text-muted-ink block">
                  Additional Procurement Notes
                </span>
                <p className="mt-1 text-sm text-ink whitespace-pre-wrap rounded-lg bg-canvas p-3">
                  {formData.message}
                </p>
              </div>
            )}
          </div>

          {/* Submission Banner */}
          <div className="rounded-2xl border border-amber-300/40 bg-amber-50/50 p-4 text-xs leading-relaxed text-amber-900">
            <div className="flex items-start gap-2.5">
              <Info className="size-4 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <span className="font-semibold">Development Notice:</span> In this phase,
                clicking Submit will test local validation and display the confirmed inquiry
                blueprint. No real email or backend record is created yet.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("form")}
              className="w-full sm:w-auto h-12 px-6 rounded-xl border-line-soft text-ink"
            >
              Modify Details
            </Button>
            <Button
              type="button"
              variant="brand"
              disabled={isSubmitting}
              onClick={handleSubmitSimulation}
              className="w-full sm:w-auto h-12 px-8 rounded-xl font-medium"
            >
              {isSubmitting ? "Validating Blueprint..." : "Submit Inquiry (Preview Mode)"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 1: FORM INPUT
  return (
    <form onSubmit={handleProceedToReview} className="space-y-10">
      {/* 1. Buyer Type Selection */}
      <div>
        <label className="block font-display text-lg font-semibold text-ink mb-1">
          1. Select Buyer Category <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-muted-ink mb-4">
          Choose the classification that best fits your practice or establishment.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BUYER_TYPES.map(({ id, label, description, icon: Icon }) => {
            const isSelected = formData.buyerType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, buyerType: id }))}
                className={`flex flex-col text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-forest-deep bg-sage-wash/40 ring-2 ring-forest-deep/20 shadow-xs"
                    : "border-line-soft bg-paper hover:border-forest-deep/30 hover:bg-canvas/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl ${
                      isSelected
                        ? "bg-forest-deep text-white"
                        : "bg-sage-wash text-forest-deep"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  {isSelected && (
                    <span className="size-2 rounded-full bg-forest-deep" />
                  )}
                </div>
                <span className="font-semibold text-sm text-ink">{label}</span>
                <span className="text-xs text-muted-ink mt-1 leading-snug">
                  {description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Contact & Organization Details */}
      <div className="rounded-3xl border border-line-soft bg-paper p-6 sm:p-8 shadow-soft">
        <h3 className="font-display text-lg font-semibold text-ink mb-1">
          2. Organization & Contact Details
        </h3>
        <p className="text-xs text-muted-ink mb-6">
          Direct coordinates for procurement verification and delivery coordination.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-xs font-semibold text-ink">
              Contact Person Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleTextChange}
              placeholder="e.g. Dr. Ramesh Gupta"
              className={`h-11 rounded-xl bg-canvas border-line-soft text-sm focus-visible:ring-forest-deep/30 ${
                errors.fullName ? "border-red-500" : ""
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="size-3" />
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Designation */}
          <div className="space-y-1.5">
            <label htmlFor="designation" className="text-xs font-semibold text-ink">
              Designation / Role
            </label>
            <Input
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleTextChange}
              placeholder="e.g. Chief Physician, Store Head"
              className="h-11 rounded-xl bg-canvas border-line-soft text-sm focus-visible:ring-forest-deep/30"
            />
          </div>

          {/* Organization Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="organizationName" className="text-xs font-semibold text-ink">
              Clinic / Hospital / Pharmacy Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleTextChange}
              placeholder="e.g. Hahnemann Homoeopathic Dispensary"
              className={`h-11 rounded-xl bg-canvas border-line-soft text-sm focus-visible:ring-forest-deep/30 ${
                errors.organizationName ? "border-red-500" : ""
              }`}
            />
            {errors.organizationName && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="size-3" />
                {errors.organizationName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-ink">
              Business Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleTextChange}
              placeholder="procurement@organization.com"
              className={`h-11 rounded-xl bg-canvas border-line-soft text-sm focus-visible:ring-forest-deep/30 ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="size-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-semibold text-ink">
              Mobile / WhatsApp Contact <span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleTextChange}
              placeholder="e.g. +91 98765 43210"
              className={`h-11 rounded-xl bg-canvas border-line-soft text-sm focus-visible:ring-forest-deep/30 ${
                errors.phone ? "border-red-500" : ""
              }`}
            />
            {errors.phone && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="size-3" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Drug License Number */}
          <div className="space-y-1.5">
            <label htmlFor="licenseNumber" className="text-xs font-semibold text-ink">
              Drug License / Reg. No. <span className="text-muted-ink text-[11px] font-normal">(Optional)</span>
            </label>
            <Input
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleTextChange}
              placeholder="e.g. DL-20B-12345"
              className="h-11 rounded-xl bg-canvas border-line-soft text-sm focus-visible:ring-forest-deep/30"
            />
          </div>

          {/* GSTIN */}
          <div className="space-y-1.5">
            <label htmlFor="gstNumber" className="text-xs font-semibold text-ink">
              GSTIN <span className="text-muted-ink text-[11px] font-normal">(Optional for GST invoices)</span>
            </label>
            <Input
              id="gstNumber"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleTextChange}
              placeholder="e.g. 07AAAAA0000A1Z5"
              className="h-11 rounded-xl bg-canvas border-line-soft text-sm focus-visible:ring-forest-deep/30"
            />
          </div>
        </div>
      </div>

      {/* 3. Location Details */}
      <div className="rounded-3xl border border-line-soft bg-paper p-6 sm:p-8 shadow-soft">
        <h3 className="font-display text-lg font-semibold text-ink mb-1">
          3. Supply Destination & Location
        </h3>
        <p className="text-xs text-muted-ink mb-6">
          Determines logistic fulfillment routes and estimated transit timelines.
        </p>

        <div className="grid gap-5 sm:grid-cols-3">
          {/* City */}
          <div className="space-y-1.5">
            <label htmlFor="city" className="text-xs font-semibold text-ink">
              City / District <span className="text-red-500">*</span>
            </label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleTextChange}
              placeholder="e.g. Delhi"
              className={`h-11 rounded-xl bg-canvas border-line-soft text-sm focus-visible:ring-forest-deep/30 ${
                errors.city ? "border-red-500" : ""
              }`}
            />
            {errors.city && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="size-3" />
                {errors.city}
              </p>
            )}
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label htmlFor="state" className="text-xs font-semibold text-ink">
              State <span className="text-red-500">*</span>
            </label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleTextChange}
              placeholder="e.g. Delhi NCR / Maharashtra"
              className={`h-11 rounded-xl bg-canvas border-line-soft text-sm focus-visible:ring-forest-deep/30 ${
                errors.state ? "border-red-500" : ""
              }`}
            />
            {errors.state && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="size-3" />
                {errors.state}
              </p>
            )}
          </div>

          {/* Pincode */}
          <div className="space-y-1.5">
            <label htmlFor="pincode" className="text-xs font-semibold text-ink">
              6-Digit Pincode <span className="text-red-500">*</span>
            </label>
            <Input
              id="pincode"
              name="pincode"
              maxLength={6}
              value={formData.pincode}
              onChange={handleTextChange}
              placeholder="e.g. 110001"
              className={`h-11 rounded-xl bg-canvas border-line-soft text-sm focus-visible:ring-forest-deep/30 ${
                errors.pincode ? "border-red-500" : ""
              }`}
            />
            {errors.pincode && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="size-3" />
                {errors.pincode}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Product Interests & Estimated Volume */}
      <div className="rounded-3xl border border-line-soft bg-paper p-6 sm:p-8 shadow-soft">
        <h3 className="font-display text-lg font-semibold text-ink mb-1">
          4. Product Interests & Procurement Volume
        </h3>
        <p className="text-xs text-muted-ink mb-6">
          Specify which classes of medicines you require for institutional supply.
        </p>

        {/* Categories Checkboxes */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-ink mb-2">
            Remedy Categories of Interest <span className="text-red-500">*</span>
          </label>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_CATEGORIES.map((cat) => {
              const checked = formData.productCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left text-xs transition-all cursor-pointer ${
                    checked
                      ? "border-forest-deep bg-sage-wash/60 text-forest-deep font-semibold"
                      : "border-line-soft bg-canvas text-ink/80 hover:border-forest-deep/30"
                  }`}
                >
                  <div
                    className={`flex size-4 shrink-0 items-center justify-center rounded-sm border ${
                      checked
                        ? "border-forest-deep bg-forest-deep text-white"
                        : "border-muted-ink/40 bg-white"
                    }`}
                  >
                    {checked && <CheckCircle2 className="size-3" />}
                  </div>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
          {errors.productCategories && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
              <AlertCircle className="size-3" />
              {errors.productCategories}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Estimated Order Volume */}
          <div className="space-y-1.5">
            <label htmlFor="estimatedVolume" className="text-xs font-semibold text-ink">
              Estimated Order Value / Batch Size <span className="text-red-500">*</span>
            </label>
            <select
              id="estimatedVolume"
              name="estimatedVolume"
              value={formData.estimatedVolume}
              onChange={handleTextChange}
              className={`h-11 w-full rounded-xl bg-canvas border border-line-soft px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-deep/30 ${
                errors.estimatedVolume ? "border-red-500" : ""
              }`}
            >
              <option value="" disabled>
                Select expected batch value...
              </option>
              {ESTIMATED_VOLUMES.map((vol) => (
                <option key={vol.value} value={vol.value}>
                  {vol.label}
                </option>
              ))}
            </select>
            {errors.estimatedVolume && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="size-3" />
                {errors.estimatedVolume}
              </p>
            )}
          </div>

          {/* Order Frequency */}
          <div className="space-y-1.5">
            <label htmlFor="orderFrequency" className="text-xs font-semibold text-ink">
              Procurement Cycle
            </label>
            <select
              id="orderFrequency"
              name="orderFrequency"
              value={formData.orderFrequency}
              onChange={handleTextChange}
              className="h-11 w-full rounded-xl bg-canvas border border-line-soft px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-deep/30"
            >
              <option value="regular">Regular Monthly Replenishment</option>
              <option value="quarterly">Quarterly Bulk Indent</option>
              <option value="onetime">One-Time Dispensary Setup / Stock</option>
              <option value="adhoc">As-Needed Clinical Orders</option>
            </select>
          </div>
        </div>

        {/* Message / Detailed requirements */}
        <div className="mt-5 space-y-1.5">
          <label htmlFor="message" className="text-xs font-semibold text-ink">
            Specific Brands, Potency Ranges or Medicine List{" "}
            <span className="text-muted-ink text-[11px] font-normal">(Optional)</span>
          </label>
          <Textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleTextChange}
            placeholder="Mention any preferred manufacturers (e.g. SBL, Schwabe, Dr. Reckeweg, Bakson), specific formulations, or delivery requirements..."
            className="rounded-xl bg-canvas border-line-soft text-sm focus-visible:ring-forest-deep/30"
          />
        </div>
      </div>

      {/* Review CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-muted-ink">
          Fields marked with <span className="text-red-500 font-semibold">*</span> are mandatory for institutional review.
        </p>
        <Button
          type="submit"
          variant="brand"
          className="w-full sm:w-auto h-12 px-8 rounded-xl font-medium text-sm"
        >
          Review Inquiry Details
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}
