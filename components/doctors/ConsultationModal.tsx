"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Globe,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
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

export function ConsultationModal({
  doctor,
  isOpen,
  onClose,
  initialDate,
  initialSlot,
}: ConsultationModalProps) {
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (doctor) {
      setMode(doctor.videoFee !== null ? "video" : "audio");
      setSelectedLanguage(doctor.languages[0] ?? "English");
      if (initialDate) setSelectedDate(initialDate);
      if (initialSlot) setSelectedSlot(initialSlot);
      setSubmitted(false);
      setError(null);
    }
  }, [doctor, initialDate, initialSlot]);

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
    // Simulate booking submission
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
      {/* Frosted Glass Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Dialog Container */}
      <div
        data-lenis-prevent
        className="relative w-full max-w-[560px] max-h-[88vh] sm:max-h-[85vh] flex flex-col rounded-[28px] border border-white/80 dark:border-white/15 bg-white dark:bg-[#0c1e17] shadow-[0_25px_70px_rgba(0,0,0,0.35)] overflow-hidden z-10 my-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-20 grid size-8 place-items-center rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-ink dark:text-white transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {submitted ? (
          /* Confirmation Success Screen */
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="p-6 sm:p-8 text-center space-y-4 min-h-0 flex-1 overflow-y-auto overscroll-contain dh-custom-scrollbar"
          >
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-xs">
              <CheckCircle2 className="size-8 stroke-[2.2]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-2xl font-bold text-ink dark:text-white">
                Consultation Confirmed!
              </h3>
              <p className="text-xs sm:text-sm text-muted-ink dark:text-white/70 max-w-sm mx-auto leading-relaxed">
                Your appointment with{" "}
                <strong className="text-forest font-semibold">
                  {doctor.displayName}
                </strong>{" "}
                has been reserved for{" "}
                <span className="font-semibold text-ink dark:text-white">
                  {selectedDate} at {selectedSlot}
                </span>. Meeting access details have been sent to{" "}
                <span className="font-semibold text-ink dark:text-white">
                  {email}
                </span>{" "}
                and via SMS to{" "}
                <span className="font-semibold text-ink dark:text-white">
                  +91 {phone}
                </span>.
              </p>
            </div>

            <div className="rounded-2xl border border-line-soft bg-paper/80 dark:bg-white/5 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-muted-ink">
                <span>Practitioner:</span>
                <span className="font-bold text-ink dark:text-white">
                  {doctor.displayName}
                </span>
              </div>
              <div className="flex justify-between text-muted-ink">
                <span>Appointment Slot:</span>
                <span className="font-bold text-forest">
                  {selectedDate} · {selectedSlot} ({doctor.slotMinutes} mins)
                </span>
              </div>
              <div className="flex justify-between text-muted-ink">
                <span>Consultation Mode:</span>
                <span className="font-bold text-ink dark:text-white capitalize">
                  {mode === "video" ? "High-Definition Video Call" : "Direct Phone Call"}
                </span>
              </div>
              <div className="flex justify-between text-muted-ink">
                <span>Preferred Language:</span>
                <span className="font-bold text-ink dark:text-white">
                  {selectedLanguage}
                </span>
              </div>
              <div className="flex justify-between border-t border-line/40 pt-2 text-sm font-bold text-ink dark:text-white">
                <span>Total Consultation Fee:</span>
                <span className="text-forest">{formatRupees(currentFee)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-[#0d5a43] hover:bg-[#074231] text-white py-3 text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer"
            >
              Done &amp; Return
            </button>
          </div>
        ) : (
          /* Consultation Booking Form with Fixed Header & Scrollable Body */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* 1. FIXED HEADER */}
            <div className="px-6 pt-5 pb-3 border-b border-line-soft shrink-0 text-center pr-12">
              <h2
                id="consult-modal-title"
                className="font-display text-xl sm:text-2xl font-bold text-ink dark:text-white"
              >
                Consultation Form
              </h2>
              <p className="text-[11px] text-muted-ink dark:text-white/60 mt-0.5">
                Quick booking with {doctor.displayName} ({doctor.specialization})
              </p>
            </div>

            {/* 2. SCROLLABLE FORM BODY */}
            <div
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 overscroll-contain dh-custom-scrollbar min-h-0"
            >
              {/* Doctor Card Snapshot in Modal */}
              <div className="flex items-center gap-3 rounded-2xl border border-forest/15 bg-forest/[0.04] p-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-white/80 shadow-2xs">
                  {doctor.photoUrl ? (
                    <Image
                      src={doctor.photoUrl}
                      alt={doctor.displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="size-full bg-forest/20 grid place-items-center text-forest font-bold text-sm">
                      {doctor.displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 leading-snug">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-sm font-bold text-ink dark:text-white truncate">
                      {doctor.displayName}
                    </h4>
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-forest/10 px-2 py-0.5 text-[9.5px] font-bold text-forest">
                      <ShieldCheck className="size-2.5" />
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-ink dark:text-white/70 truncate mt-0.5">
                    {doctor.qualification} · {doctor.specialization}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="flex items-center gap-2 text-[10.5px] text-forest font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {doctor.slotMinutes} mins
                      </span>
                      <span>·</span>
                      <span>⭐ {doctor.ratingAverage ? doctor.ratingAverage.toFixed(1) : "4.9"} ({doctor.ratingCount || 100}+)</span>
                    </div>

                    <a
                      href={`/doctors/${doctor.slug}`}
                      className="text-[10px] text-forest hover:underline font-semibold"
                    >
                      Full Profile →
                    </a>
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
                  <label className="block text-xs font-bold text-ink dark:text-white mb-1">
                    Your Name:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Please Enter your name"
                      className="w-full h-10 px-3.5 rounded-xl border border-line-soft bg-paper dark:bg-white/5 text-xs sm:text-sm text-ink dark:text-white placeholder:text-muted-ink/60 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-all"
                    />
                  </div>
                </div>

                {/* Your Email */}
                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white mb-1">
                    Your Email:
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Please Enter your Email"
                      className="w-full h-10 pl-3.5 pr-9 rounded-xl border border-line-soft bg-paper dark:bg-white/5 text-xs sm:text-sm text-ink dark:text-white placeholder:text-muted-ink/60 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-all"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Your Phone */}
              <div>
                <label className="block text-xs font-bold text-ink dark:text-white mb-1">
                  Your Phone:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-ink">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Please Enter your phone number"
                    maxLength={10}
                    className="w-full h-10 pl-11 pr-3.5 rounded-xl border border-line-soft bg-paper dark:bg-white/5 text-xs sm:text-sm text-ink dark:text-white placeholder:text-muted-ink/60 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-all"
                  />
                </div>
              </div>

              {/* Preferred Consultation Slot (Date & Time) */}
              <div className="space-y-2 rounded-2xl border border-line-soft bg-paper/60 dark:bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-ink dark:text-white">
                    <CalendarDays className="size-3.5 text-forest" />
                    <span>Choose Date &amp; Slot:</span>
                  </label>
                  <span className="text-[10.5px] font-semibold text-forest">
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
                        "py-1.5 px-2 rounded-xl text-center border transition-all cursor-pointer",
                        selectedDate === d.label
                          ? "bg-[#0d5a43] text-white border-[#0d5a43] shadow-xs"
                          : "bg-white dark:bg-white/10 border-line-soft text-ink dark:text-white hover:border-forest/40"
                      )}
                    >
                      <span className="block text-xs font-bold leading-tight">{d.label}</span>
                      <span className={cn("block text-[9.5px]", selectedDate === d.label ? "text-emerald-200" : "text-muted-ink")}>
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
                        "py-1 rounded-lg text-center text-[11px] font-semibold border transition-all cursor-pointer",
                        selectedSlot === timeSlot
                          ? "bg-forest/15 border-forest text-forest font-bold ring-1 ring-forest/30"
                          : "bg-white dark:bg-white/5 border-line-soft text-muted-ink hover:text-ink hover:border-line"
                      )}
                    >
                      {timeSlot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation Type Selector */}
              <div>
                <label className="block text-xs font-bold text-ink dark:text-white mb-1.5">
                  Consultation Type:
                </label>
                <div className="space-y-1.5">
                  {/* Video Option */}
                  <label
                    onClick={() => setMode("video")}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all",
                      mode === "video"
                        ? "border-forest/40 bg-forest/[0.07] ring-1 ring-forest/30"
                        : "border-line-soft bg-paper/50 hover:bg-paper"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "size-4 rounded-full border grid place-items-center transition-all",
                          mode === "video"
                            ? "border-forest bg-forest text-white"
                            : "border-muted-ink/40 bg-white"
                        )}
                      >
                        {mode === "video" && (
                          <span className="size-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-ink dark:text-white">
                        Video Call - {formatRupees(doctor.videoFee ?? 500)}
                      </span>
                    </div>
                    <Video className="size-4 text-forest/70" />
                  </label>

                  {/* Phone Option */}
                  <label
                    onClick={() => setMode("audio")}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all",
                      mode === "audio"
                        ? "border-forest/40 bg-forest/[0.07] ring-1 ring-forest/30"
                        : "border-line-soft bg-paper/50 hover:bg-paper"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "size-4 rounded-full border grid place-items-center transition-all",
                          mode === "audio"
                            ? "border-forest bg-forest text-white"
                            : "border-muted-ink/40 bg-white"
                        )}
                      >
                        {mode === "audio" && (
                          <span className="size-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-ink dark:text-white">
                        Phone Call - {formatRupees(doctor.audioFee ?? 400)}
                      </span>
                    </div>
                    <Phone className="size-4 text-forest/70" />
                  </label>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-ink dark:text-white mb-1">
                  Message:
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any message for the doctor"
                  className="w-full p-2.5 rounded-xl border border-line-soft bg-paper dark:bg-white/5 text-xs sm:text-sm text-ink dark:text-white placeholder:text-muted-ink/60 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-all resize-none"
                />
              </div>

              {/* Doctor's Preferred Languages */}
              <div>
                <label className="block text-xs font-bold text-ink dark:text-white mb-1">
                  Doctor&apos;s Preferred Languages:
                </label>
                <div className="flex flex-wrap gap-2 text-xs text-ink dark:text-white/80">
                  {doctor.languages.map((lang) => (
                    <span
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors",
                        selectedLanguage === lang
                          ? "bg-forest text-white border-forest shadow-2xs"
                          : "bg-paper/70 border-line-soft text-ink dark:text-white hover:border-forest/40"
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      <span>{lang}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. FIXED FOOTER WITH SUBMIT BUTTON */}
            <div className="px-6 py-3.5 border-t border-line-soft bg-paper/50 dark:bg-black/20 shrink-0 space-y-1.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#097969] hover:bg-[#075f53] active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <span>Submit · {formatRupees(currentFee)}</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-ink">
                <Lock className="size-3 text-forest" />
                <span>100% Confidential &amp; Verified Consultation</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
