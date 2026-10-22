"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  Video,
  X,
} from "lucide-react";
import { formatRupees } from "@/lib/formatters/price";
import { getLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/utils";
import type { ApiDoctorCard, ApiDoctorDetail } from "@/types/api/care";

interface ConsultationModalProps {
  doctor: (ApiDoctorCard | ApiDoctorDetail) | null;
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialSlot?: string;
}

const AVAILABLE_DATES = [
  { id: "today", label: "Today", detail: "Immediate" },
  { id: "tomorrow", label: "Tomorrow", detail: "Available" },
  { id: "day_after", label: "Day After", detail: "Open" },
];

const AVAILABLE_SLOTS = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

const emptySubscribe = () => () => {};

export function ConsultationModal({
  doctor,
  isOpen,
  onClose,
  initialDate,
  initialSlot,
}: ConsultationModalProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"video" | "audio">("video");
  const [selectedDate, setSelectedDate] = useState<string>("Today");
  const [selectedSlot, setSelectedSlot] = useState<string>("10:30 AM");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial parameters when modal opens
  const [prevOpen, setPrevOpen] = useState(false);
  if (isOpen && !prevOpen && doctor) {
    setPrevOpen(true);
    setMode(doctor.videoFee !== null ? "video" : "audio");
    setSelectedLanguage(doctor.languages[0] ?? "English");
    if (initialDate) setSelectedDate(initialDate);
    if (initialSlot) setSelectedSlot(initialSlot);
    setSubmitted(false);
    setError(null);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    // Stop Lenis while modal is active so mouse-wheel scrolls modal instead of background
    const lenis = getLenis();
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      lenis?.start();
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !doctor) return null;

  const currentFee =
    mode === "video"
      ? (doctor.videoFee ?? 500)
      : (doctor.audioFee ?? 400);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim().includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (phone.trim().replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consult-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden"
    >
      {/* Frosted Ambient Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/65 backdrop-blur-xl transition-opacity duration-300"
      />

      {/* Modal Dialog Container */}
      <div
        data-lenis-prevent
        className="relative w-full max-w-[560px] max-h-[90vh] sm:max-h-[86vh] flex flex-col rounded-[32px] border border-black/[0.08] dark:border-white/15 bg-white dark:bg-[#0c1e17] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.35)] overflow-hidden z-10 my-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-20 grid size-8.5 place-items-center rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {submitted ? (
          /* Confirmation Success Screen */
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="p-6 sm:p-8 text-center space-y-4 min-h-0 flex-1 overflow-y-auto overscroll-contain dh-no-scrollbar scrollbar-none"
          >
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-xs">
              <CheckCircle2 className="size-8 stroke-[2.2]" />
            </div>

            <div className="space-y-1.5">
              <div className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <span>Frontend Simulation Preview</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
                Consultation Request Prepared
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Your consultation request for{" "}
                <strong className="text-[#0d5a43] font-semibold">
                  {doctor.displayName}
                </strong>{" "}
                has been configured for{" "}
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {selectedDate} at {selectedSlot}
                </span>. In preview mode, proceed to the live booking panel to secure verified prescription privileges.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-100 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Practitioner:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {doctor.displayName}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Appointment Slot:</span>
                <span className="font-bold text-[#0d5a43] dark:text-emerald-400">
                  {selectedDate} · {selectedSlot} ({doctor.slotMinutes} mins)
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Consultation Mode:</span>
                <span className="font-bold text-neutral-900 dark:text-white capitalize">
                  {mode === "video" ? "High-Definition Video Call" : "Direct Phone Call"}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Preferred Language:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {selectedLanguage}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 dark:border-white/10 pt-2 text-sm font-bold text-neutral-900 dark:text-white">
                <span>Total Consultation Fee:</span>
                <span className="text-[#0d5a43] dark:text-emerald-400">{formatRupees(currentFee)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <a
                href={`/doctors/${doctor.slug}#booking-section`}
                onClick={onClose}
                className="w-full text-center rounded-full bg-[#0d5a43] hover:bg-[#074231] text-white py-3 text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer"
              >
                Go to Live Appointment Panel
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full border border-neutral-200 dark:border-white/10 bg-transparent text-neutral-700 dark:text-neutral-300 py-2 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        ) : (
          /* Consultation Booking Form */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* 1. FIXED HEADER */}
            <div className="px-6 pt-5 pb-3.5 border-b border-neutral-100 dark:border-white/10 shrink-0 pr-12">
              <h2
                id="consult-modal-title"
                className="font-display text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white"
              >
                Consultation Request
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Quick booking with {doctor.displayName}
              </p>
            </div>

            {/* 2. SCROLLABLE FORM BODY */}
            <div
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4.5 overscroll-contain dh-no-scrollbar scrollbar-none min-h-0"
            >
              {/* Doctor Card Snapshot in Modal (Minimalist Luxury Styling) */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-500/15 bg-[#eff8f3] dark:bg-emerald-950/25 p-3.5">
                <div className="relative size-12.5 shrink-0 overflow-hidden rounded-xl border border-white/80 dark:border-white/10 shadow-2xs bg-white">
                  {doctor.photoUrl ? (
                    <Image
                      src={doctor.photoUrl}
                      alt={doctor.displayName}
                      fill
                      sizes="50px"
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="size-full bg-[#0d5a43]/20 grid place-items-center text-[#0d5a43] font-bold text-sm">
                      {doctor.displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 leading-snug">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-display text-sm font-bold text-neutral-900 dark:text-white truncate">
                      {doctor.displayName}
                    </h4>
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-[9.5px] font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="size-2.5" />
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {[doctor.specialization, doctor.qualification].filter(Boolean).join(" · ")}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#0d5a43] dark:text-emerald-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {doctor.slotMinutes} mins session
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      {doctor.ratingAverage ? doctor.ratingAverage.toFixed(1) : "4.9"} ({doctor.ratingCount || 100}+)
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Error Banner */}
              {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-400 font-medium">
                  {error}
                </div>
              ) : null}

              {/* Inputs: Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Your Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-11 px-3.5 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#0d5a43] focus:ring-4 focus:ring-[#0d5a43]/10 transition-all"
                  />
                </div>

                {/* Your Email */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Your Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-11 pl-3.5 pr-9 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#0d5a43] focus:ring-4 focus:ring-[#0d5a43]/10 transition-all"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                  </div>
                </div>
              </div>

              {/* Your Phone */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Your Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full h-11 pl-11 pr-3.5 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#0d5a43] focus:ring-4 focus:ring-[#0d5a43]/10 transition-all"
                  />
                </div>
              </div>

              {/* Choose Date & Slot */}
              <div className="space-y-2.5 rounded-2xl border border-neutral-100 dark:border-white/10 bg-neutral-50/60 dark:bg-white/5 p-3.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
                    <CalendarDays className="size-3.5 text-[#0d5a43] dark:text-emerald-400" />
                    <span>Choose Date &amp; Slot</span>
                  </label>
                  <span className="text-[11px] font-semibold text-[#0d5a43] dark:text-emerald-400">
                    {selectedDate} · {selectedSlot}
                  </span>
                </div>

                {/* Date Pills */}
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_DATES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDate(d.label)}
                      className={cn(
                        "py-2 px-2 rounded-2xl text-center border transition-all cursor-pointer",
                        selectedDate === d.label
                          ? "bg-[#171a1d] text-white border-[#171a1d] shadow-xs font-bold"
                          : "bg-white dark:bg-white/10 border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                      )}
                    >
                      <span className="block text-xs font-bold leading-tight">{d.label}</span>
                      <span className={cn("block text-[9.5px]", selectedDate === d.label ? "text-neutral-300" : "text-neutral-400")}>
                        {d.detail}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Time Slot Chips */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                  {AVAILABLE_SLOTS.map((timeSlot) => (
                    <button
                      key={timeSlot}
                      type="button"
                      onClick={() => setSelectedSlot(timeSlot)}
                      className={cn(
                        "py-1.5 rounded-xl text-center text-[11px] font-semibold border transition-all cursor-pointer",
                        selectedSlot === timeSlot
                          ? "bg-[#0d5a43] border-[#0d5a43] text-white font-bold shadow-xs"
                          : "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 hover:border-neutral-300"
                      )}
                    >
                      {timeSlot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation Type Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Consultation Type
                </label>
                <div className="space-y-2">
                  {/* Video Option */}
                  <label
                    onClick={() => setMode("video")}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all",
                      mode === "video"
                        ? "border-[#0d5a43] bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-[#0d5a43]/20"
                        : "border-neutral-200 dark:border-white/10 bg-neutral-50/50 hover:bg-neutral-100"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "size-4 rounded-full border grid place-items-center transition-all",
                          mode === "video"
                            ? "border-[#0d5a43] bg-[#0d5a43] text-white"
                            : "border-neutral-300 bg-white"
                        )}
                      >
                        {mode === "video" && (
                          <span className="size-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
                        Video Consultation · {formatRupees(doctor.videoFee ?? 500)}
                      </span>
                    </div>
                    <Video className="size-4 text-emerald-600" />
                  </label>

                  {/* Phone Option */}
                  <label
                    onClick={() => setMode("audio")}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all",
                      mode === "audio"
                        ? "border-[#0d5a43] bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-[#0d5a43]/20"
                        : "border-neutral-200 dark:border-white/10 bg-neutral-50/50 hover:bg-neutral-100"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "size-4 rounded-full border grid place-items-center transition-all",
                          mode === "audio"
                            ? "border-[#0d5a43] bg-[#0d5a43] text-white"
                            : "border-neutral-300 bg-white"
                        )}
                      >
                        {mode === "audio" && (
                          <span className="size-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
                        Direct Phone Call · {formatRupees(doctor.audioFee ?? 400)}
                      </span>
                    </div>
                    <Phone className="size-4 text-emerald-600" />
                  </label>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your health symptoms or reason for visit"
                  className="w-full p-3 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#0d5a43] focus:ring-4 focus:ring-[#0d5a43]/10 transition-all resize-none"
                />
              </div>

              {/* Preferred Languages */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Preferred Language
                </label>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {doctor.languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors",
                        selectedLanguage === lang
                          ? "bg-[#171a1d] text-white border-[#171a1d] shadow-2xs font-bold"
                          : "bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                      )}
                    >
                      <span>{lang}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. FIXED FOOTER WITH SUBMIT BUTTON */}
            <div className="px-6 py-4 border-t border-neutral-100 dark:border-white/10 bg-neutral-50/60 dark:bg-black/20 shrink-0 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#0d5a43] hover:bg-[#074231] active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <span>Submit &amp; Reserve · {formatRupees(currentFee)}</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
                <Lock className="size-3 text-[#0d5a43] dark:text-emerald-400" />
                <span>100% Confidential · Council Accredited Telehealth</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
