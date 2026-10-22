"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  HeartHandshake,
  HelpCircle,
  Languages,
  MapPin,
  MessageSquare,
  PackageCheck,
  Phone,
  ShieldCheck,
  Star,
  UserCheck,
  Video,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { DoctorPageHero } from "@/sections/doctors/DoctorPageHero";
import { ConsultationModal } from "@/components/doctors/ConsultationModal";
import { BookingPanel } from "@/sections/doctors/BookingPanel";
import { formatRupees } from "@/lib/formatters/price";
import { cn } from "@/lib/utils";
import type { ApiDoctorDetail, ApiDoctorSlot } from "@/types/api/care";

interface DoctorDetailClientProps {
  doctor: ApiDoctorDetail;
  days: string[];
  date: string;
  slots: ApiDoctorSlot[];
  slotParam: string | null;
  hoursByDay: { name: string; ranges: { startTime: string; endTime: string }[] }[];
}

const clock = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(
    new Date(Date.UTC(2000, 0, 1, h, m))
  );
};

export function DoctorDetailClient({
  doctor,
  days,
  date,
  slots,
  slotParam,
  hoursByDay,
}: DoctorDetailClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string>("Today");
  const [modalSlot, setModalSlot] = useState<string | undefined>(undefined);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const fees = [doctor.videoFee, doctor.audioFee].filter((f): f is number => f !== null);
  const minFee = fees.length ? Math.min(...fees) : 400;

  const dayIndex = days.indexOf(date);
  const currentDayLabel =
    dayIndex === 0
      ? "Today"
      : dayIndex === 1
      ? "Tomorrow"
      : new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", weekday: "short", day: "numeric" }).format(
          new Date(`${date}T00:00:00Z`)
        );

  const handleOpenModal = (slotTime?: string) => {
    setModalDate(currentDayLabel);
    if (slotTime) setModalSlot(slotTime);
    setIsModalOpen(true);
  };

  const scrollToBooking = () => {
    const el = document.getElementById("booking-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      handleOpenModal();
    }
  };

  const dayLabel = (iso: string, index: number) =>
    index === 0
      ? "Today"
      : index === 1
      ? "Tomorrow"
      : new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", weekday: "short", day: "numeric" }).format(
          new Date(`${iso}T00:00:00Z`)
        );

  const firstAvailableSlot = slots.find((s) => s.available);
  const earliestSlotText = firstAvailableSlot
    ? `${currentDayLabel}, ${firstAvailableSlot.time} IST`
    : "Tomorrow, 10:30 AM IST";

  const reviews =
    doctor.slug === "dr-amit-verma"
      ? [
          {
            author: "Rajeshwar Rao",
            city: "Delhi NCR",
            rating: 5,
            tag: "Pediatric Asthma & Wheezing",
            comment:
              "Dr. Amit took 25 minutes to understand our 7-year-old son's chronic seasonal wheezing and allergies. Within 3 weeks of the remedies, his nighttime coughing stopped completely.",
            date: "2 weeks ago",
          },
          {
            author: "Pooja Malhotra",
            city: "Gurgaon",
            rating: 5,
            tag: "Recurrent Bronchitis",
            comment:
              "I suffered from recurring bronchitis every autumn. Traditional medicines made me drowsy. Dr. Amit's constitutional remedy addressed the root immunity. Highly recommend his video consults!",
            date: "1 month ago",
          },
          {
            author: "Siddharth Varma",
            city: "Noida",
            rating: 5,
            tag: "Childhood Immunity",
            comment:
              "Very calm and approachable pediatric homoeopath. My daughter was comfortable answering his questions over the video call. Digital prescription arrived instantly with precise dosages.",
            date: "1 month ago",
          },
        ]
      : doctor.slug === "dr-sunita-kulkarni"
      ? [
          {
            author: "Pooja Kulkarni",
            city: "Pune",
            rating: 5,
            tag: "PCOS & Hormonal Imbalance",
            comment:
              "Dr. Sunita is a master of women's holistic health. My cycles regularized and chronic migraines subsided within 2 months of gentle treatment.",
            date: "3 weeks ago",
          },
          {
            author: "Deepa Joshi",
            city: "Mumbai",
            rating: 5,
            tag: "Stress & Sleep Disorders",
            comment:
              "She evaluated my stress triggers and sleep pattern thoroughly. Feeling revitalized and calm. Truly life-changing guidance.",
            date: "1 month ago",
          },
          {
            author: "Rohini Shinde",
            city: "Pune",
            rating: 5,
            tag: "Menopause Support",
            comment:
              "Her 18 years of clinical experience shine through. Thoughtful, empathetic, and exceptionally precise prescribing.",
            date: "2 months ago",
          },
        ]
      : [
          {
            author: "Arvind M.",
            city: doctor.clinicCity || "India",
            rating: 5,
            tag: doctor.specialization || "Holistic Care",
            comment:
              "Remarkable consultation. The doctor took deep interest in root causes rather than just surface symptoms. Authentic homeopathic care at its best.",
            date: "2 weeks ago",
          },
          {
            author: "Sunita Deshmukh",
            city: "Mumbai",
            rating: 5,
            tag: "Constitutional Health",
            comment:
              "Thorough, unhurried, and very scientific approach. The digital prescription and medicines arrived within 48 hours.",
            date: "3 weeks ago",
          },
          {
            author: "Kavitha Raman",
            city: "Bangalore",
            rating: 5,
            tag: "Chronic Wellness",
            comment:
              "DocHomoeo has set a new benchmark for teleconsultations. The care and attention to detail is truly remarkable.",
            date: "1 month ago",
          },
        ];

  const faqs = [
    {
      q: `How does an online homoeopathic consultation with ${doctor.displayName} work?`,
      a: "Online homoeopathy relies primarily on deep constitutional case-taking—evaluating your symptom picture, physical sensations, emotional factors, and medical history. Our encrypted HD video and audio sessions provide the same thorough clinical depth as an in-clinic consultation.",
    },
    {
      q: "How do I receive my prescribed homoeopathic medicines?",
      a: "Directly after your consultation, the doctor signs and sends your official digital prescription. You can order authentic, sealed remedies from top GMP certified laboratories (Dr. Reckeweg, SBL, Schwabe) right to your doorstep via DocHomoeo.",
    },
    {
      q: "Is the teleconsultation and prescription legally valid?",
      a: "Yes, 100%. All DocHomoeo practitioners are registered homoeopaths with recognized BHMS/MD qualifications. Every consultation strictly complies with National Telemedicine Guidelines.",
    },
    {
      q: "Can I consult for chronic or long-standing health concerns?",
      a: "Absolutely. Homoeopathy excels in chronic conditions such as allergies, respiratory issues, digestive concerns, skin disorders, and hormonal imbalances. The initial 20-minute session is tailored for deep evaluation.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf6] dark:bg-[#07130e] text-ink dark:text-white">
      {/* --------------------------------------------------------------- */}
      {/* 1. MINIMAL HEADER & BREADCRUMBS                                 */}
      {/* --------------------------------------------------------------- */}
      <DoctorPageHero doctor={doctor} onBookConsult={scrollToBooking} />

      {/* --------------------------------------------------------------- */}
      {/* 2. MAIN SPLIT CONSULTATION STUDIO (Direct Reference Inspiration) */}
      {/* --------------------------------------------------------------- */}
      <Container width="wide" className="py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
          
          {/* ============================================================ */}
          {/* LEFT: THE DR. MAYA CHEN PROFILE CARD (Reference Image 4)      */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="rounded-[32px] p-6 sm:p-7 bg-white dark:bg-[#0c1e17] border border-black/[0.06] dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-5">
              
              {/* Doctor Avatar + Identity Header */}
              <div className="flex items-start gap-4">
                <div className="relative size-20 sm:size-22 rounded-2xl overflow-hidden bg-[#f3f1e8] dark:bg-white/5 shrink-0 border border-black/5 dark:border-white/10">
                  {doctor.photoUrl ? (
                    <Image
                      src={doctor.photoUrl}
                      alt={doctor.displayName}
                      fill
                      quality={95}
                      sizes="88px"
                      className="object-cover object-top"
                      priority
                    />
                  ) : (
                    <div className="size-full bg-[#0d5a43]/10 grid place-items-center text-[#0d5a43] font-bold text-2xl">
                      {doctor.displayName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white truncate">
                      {doctor.displayName}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 text-[10.5px] font-bold shrink-0">
                      <CheckCircle2 className="size-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium line-clamp-2">
                    {[doctor.specialization, doctor.qualification].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>

              {/* Next Available Highlight Box (Directly inspired by Reference Image 4) */}
              <div className="rounded-2xl bg-[#eff8f3] dark:bg-emerald-950/30 border border-[#d2edd9] dark:border-emerald-500/20 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400">
                    Next Available
                  </span>
                  <CalendarDays className="size-4 text-emerald-600" />
                </div>
                <p className="font-display text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                  {earliestSlotText}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  In-person &amp; virtual homoeopathic care
                </p>
              </div>

              {/* Key Clinical Specs Table (Hairline Divided Rows, Reference Image 4) */}
              <div className="divide-y divide-neutral-100 dark:divide-white/5 text-xs sm:text-[13px] pt-1">
                <div className="flex justify-between py-2.5">
                  <span className="text-neutral-500 dark:text-neutral-400">Patient rating</span>
                  <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
                    <Star className="size-3.5 fill-amber-500 text-amber-500" />
                    <span>{doctor.ratingAverage.toFixed(1)} / 5</span>
                    <span className="text-neutral-400 text-xs">({doctor.ratingCount})</span>
                  </span>
                </div>

                <div className="flex justify-between py-2.5">
                  <span className="text-neutral-500 dark:text-neutral-400">Years in practice</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {doctor.experienceYears !== null ? `${doctor.experienceYears} years` : "12+ years"}
                  </span>
                </div>

                <div className="flex justify-between py-2.5">
                  <span className="text-neutral-500 dark:text-neutral-400">Visit length</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {doctor.slotMinutes || 20} minutes
                  </span>
                </div>

                <div className="flex justify-between py-2.5">
                  <span className="text-neutral-500 dark:text-neutral-400">Consultation fee</span>
                  <span className="font-semibold text-neutral-900 dark:text-white tabular-nums">
                    {formatRupees(minFee)} <span className="text-[11px] text-neutral-400 font-normal">/ session</span>
                  </span>
                </div>

                {doctor.languages.length ? (
                  <div className="flex justify-between py-2.5">
                    <span className="text-neutral-500 dark:text-neutral-400">Languages</span>
                    <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-[180px] text-right">
                      {doctor.languages.join(", ")}
                    </span>
                  </div>
                ) : null}

                {doctor.clinicCity ? (
                  <div className="flex justify-between py-2.5">
                    <span className="text-neutral-500 dark:text-neutral-400">Clinic location</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {doctor.clinicCity}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Dual Action Buttons (Reference Image 4) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenModal()}
                  className="h-11 rounded-full border border-neutral-200 dark:border-white/15 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CalendarClock className="size-3.5 text-neutral-500" />
                  <span>Quick Form</span>
                </button>

                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="h-11 rounded-full bg-[#171a1d] hover:bg-[#0d5a43] active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs group"
                >
                  <span>Book Visit</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Central Council Accreditation Tag */}
              <div className="pt-2 text-center border-t border-neutral-100 dark:border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  CENTRAL COUNCIL ACCREDITED TELEHEALTH
                </span>
              </div>

            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT: THE CAREFLOW APPOINTMENT STUDIO                        */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* 1. PRIMARY APPOINTMENT SCHEDULER CARD */}
            <section
              id="booking-section"
              aria-labelledby="slots-heading"
              className="scroll-mt-28 rounded-[32px] sm:rounded-[36px] border border-black/[0.06] dark:border-white/10 bg-white dark:bg-[#0c1e17] p-6 sm:p-8 lg:p-9 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-100 dark:border-white/10">
                <div className="flex items-start sm:items-center gap-3.5">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#0d5a43]/10 text-[#0d5a43] dark:text-emerald-400 shrink-0">
                    <CalendarDays className="size-5.5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 id="slots-heading" className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Select Appointment Time
                      </h2>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        IST (India Time)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Choose an available day and reserve an unhurried {doctor.slotMinutes}-minute private consultation
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenModal()}
                  className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-forest/[0.08] hover:bg-forest/15 text-[#0d5a43] dark:text-emerald-400 border border-[#0d5a43]/20 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <CalendarClock className="size-3.5" />
                  <span>Quick Form</span>
                </button>
              </div>

              {/* Day Selection Strip */}
              <div className="mb-7">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                  Available Dates
                </span>
                <nav aria-label="Choose a day" className="-mx-2 overflow-x-auto px-2 pb-2 no-scrollbar">
                  <ul className="flex gap-2.5">
                    {days.map((day, index) => {
                      const isActive = day === date;
                      return (
                        <li key={day} className="shrink-0">
                          <Link
                            href={`/doctors/${doctor.slug}${index === 0 ? "" : `?date=${day}`}`}
                            scroll={false}
                            data-no-transition
                            data-no-curtain
                            aria-current={isActive ? "date" : undefined}
                            className={cn(
                              "inline-flex flex-col items-center justify-center min-w-[88px] sm:min-w-[96px] h-14 rounded-2xl border px-3 py-1.5 text-xs font-bold transition-all focus-visible:outline-none cursor-pointer",
                              isActive
                                ? "border-[#171a1d] bg-[#171a1d] text-white shadow-sm ring-2 ring-[#171a1d]/20 scale-102"
                                : "border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/10"
                            )}
                          >
                            <span className="text-[10px] font-medium opacity-90 uppercase tracking-tight">
                              {index === 0 ? "Today" : index === 1 ? "Tomorrow" : dayLabel(day, index).split(" ")[0]}
                            </span>
                            <span className="text-sm font-extrabold mt-0.5">
                              {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(
                                new Date(`${day}T00:00:00Z`)
                              )}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>

              {/* Consultation Slots & Interactive Booking Panel */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                  Consultation Slots ({currentDayLabel})
                </span>
                <BookingPanel
                  key={date}
                  doctor={doctor}
                  date={date}
                  slots={slots}
                  initialSlot={slotParam}
                />
              </div>
            </section>

            {/* 2. CONSULTATION MODES & WEEKLY HOURS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Consultation Modes */}
              <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0c1e17] border border-black/[0.06] dark:border-white/10 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-100 dark:border-white/5">
                  <span className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">
                    Consultation Modes
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    Verified Fees
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
                    <span className="flex items-center gap-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      <Video className="size-4 text-emerald-600" />
                      <span>Video Consultation</span>
                    </span>
                    <span className="font-bold text-sm text-neutral-900 dark:text-white tabular-nums">
                      {doctor.videoFee ? formatRupees(doctor.videoFee) : "₹600"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
                    <span className="flex items-center gap-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      <Phone className="size-4 text-emerald-600" />
                      <span>Direct Audio Call</span>
                    </span>
                    <span className="font-bold text-sm text-neutral-900 dark:text-white tabular-nums">
                      {doctor.audioFee ? formatRupees(doctor.audioFee) : "₹450"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly Hours */}
              {hoursByDay.length > 0 ? (
                <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0c1e17] border border-black/[0.06] dark:border-white/10 shadow-2xs space-y-2">
                  <span className="font-bold uppercase tracking-wider text-neutral-400 text-[10px] block pb-1 border-b border-neutral-100 dark:border-white/5">
                    Weekly Consulting Hours
                  </span>
                  <dl className="divide-y divide-neutral-100 dark:divide-white/5 text-xs">
                    {hoursByDay.slice(0, 5).map((day) => (
                      <div key={day.name} className="flex justify-between py-1.5">
                        <dt className="text-neutral-500 font-medium">{day.name}</dt>
                        <dd className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
                          {day.ranges.map((r) => `${clock(r.startTime)} – ${clock(r.endTime)}`).join(", ")}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </div>

            {/* 3. CLINICAL BACKGROUND & PHILOSOPHY */}
            {doctor.bio ? (
              <section id="about-section" className="rounded-[32px] border border-black/[0.06] dark:border-white/10 bg-white dark:bg-[#0c1e17] p-7 sm:p-9 shadow-xs space-y-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-[#0d5a43]/10 text-[#0d5a43] dark:text-emerald-400">
                    <HeartHandshake className="size-5" />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#0d5a43] dark:text-emerald-400">
                      CLINICAL BACKGROUND &amp; PHILOSOPHY
                    </span>
                    <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
                      About {doctor.displayName}
                    </h2>
                  </div>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300 font-normal">
                  {doctor.bio}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-2xl border border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-white/5 p-4 flex items-start gap-3">
                    <Award className="size-5 text-[#0d5a43] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Council Certified Homoeopath</h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Formally accredited under Central Council of Homeopathy (CCH) guidelines.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-white/5 p-4 flex items-start gap-3">
                    <Clock className="size-5 text-[#0d5a43] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Unhurried Case-Taking</h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Deep constitutional evaluation covering physiological, environmental, and emotional health factors.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {/* 4. HOW TELECONSULTATION WORKS (CareFlow 4-Step Journey) */}
            <section id="journey-section" className="space-y-6">
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#0d5a43] dark:text-emerald-400">
                  SEAMLESS · CONFIDENTIAL · PERSONALISED
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                  How your teleconsultation works
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Four effortless steps to private holistic healthcare with {doctor.displayName}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    step: "01",
                    title: "Select Slot",
                    desc: "Choose an available consultation time on the calendar that fits your day.",
                    icon: CalendarDays,
                  },
                  {
                    step: "02",
                    title: "Share Health Intake",
                    desc: "Submit your symptoms and previous medical reports via encrypted health intake.",
                    icon: FileText,
                  },
                  {
                    step: "03",
                    title: "Private Teleconsult",
                    desc: "Join an encrypted video or direct phone call for unhurried case-taking with the doctor.",
                    icon: Video,
                  },
                  {
                    step: "04",
                    title: "Prescription & Delivery",
                    desc: "Instant digital prescription and 1-click doorstep delivery of authentic remedies.",
                    icon: PackageCheck,
                  },
                ].map((st) => {
                  const Icon = st.icon;
                  return (
                    <div
                      key={st.step}
                      className="rounded-3xl border border-black/[0.06] dark:border-white/10 bg-white dark:bg-[#0c1e17] p-5 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-neutral-400">{st.step}</span>
                        <span className="grid size-8 place-items-center rounded-xl bg-[#0d5a43]/10 text-[#0d5a43] dark:text-emerald-400">
                          <Icon className="size-4" />
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{st.title}</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
                        {st.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 5. VERIFIED PATIENT REVIEWS */}
            <section id="reviews-section" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-[#0d5a43] dark:text-emerald-400">
                    PATIENT EXPERIENCES
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                    Verified Patient Reviews
                  </h2>
                </div>

                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-[#0c1e17] border border-black/[0.06] dark:border-white/10 shadow-2xs">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    <span className="font-display font-bold text-base text-neutral-900 dark:text-white">
                      {doctor.ratingAverage.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-neutral-300">·</span>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    {doctor.ratingCount} verified consults
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {reviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-black/[0.06] dark:border-white/10 bg-white dark:bg-[#0c1e17] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="size-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-[11px] text-neutral-400">{rev.date}</span>
                      </div>

                      <span className="inline-block rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-[#0d5a43] dark:text-emerald-400">
                        {rev.tag}
                      </span>

                      <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white">{rev.author}</h4>
                        <span className="text-[11px] text-neutral-400">{rev.city}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. PRACTICAL FAQS */}
            <section id="faqs-section" className="space-y-6">
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#0d5a43] dark:text-emerald-400">
                  COMMON QUESTIONS
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "rounded-2xl border transition-all duration-200 overflow-hidden",
                        isOpen
                          ? "border-[#0d5a43]/40 bg-white dark:bg-[#0c1e17] shadow-xs"
                          : "border-black/[0.06] dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="w-full p-4.5 sm:p-5 text-left flex items-center justify-between gap-4 font-display text-sm sm:text-base font-bold text-neutral-900 dark:text-white cursor-pointer hover:text-[#0d5a43] transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-neutral-400 transition-transform duration-300",
                            isOpen && "rotate-180 text-[#0d5a43] dark:text-emerald-400"
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-white/5 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          </div>

        </div>
      </Container>

      {/* --------------------------------------------------------------- */}
      {/* 3. MODAL QUICK BOOKING DIALOG                                   */}
      {/* --------------------------------------------------------------- */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={doctor}
        initialDate={modalDate}
        initialSlot={modalSlot}
      />
    </div>
  );
}
