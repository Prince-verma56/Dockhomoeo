"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
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
  Sparkles,
  Star,
  UserCheck,
  Video,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
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
      {/* 1. EDITORIAL HERO SECTION                                       */}
      {/* --------------------------------------------------------------- */}
      <DoctorPageHero doctor={doctor} onBookConsult={scrollToBooking} />

      {/* --------------------------------------------------------------- */}
      {/* 2. MAIN 2-COLUMN SPACIOUS CONTENT AREA                          */}
      {/* --------------------------------------------------------------- */}
      <Container width="wide" className="py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
          
          {/* ============================================================ */}
          {/* LEFT / MAIN COLUMN (8 COLS): SCHEDULER, BIO, TIMELINE, REVIEWS */}
          {/* ============================================================ */}
          <div className="lg:col-span-8 space-y-12 lg:space-y-16">
            
            {/* ----------------------------------------------------------- */}
            {/* PRIMARY EXPERIENCE: REFINED APPOINTMENT SCHEDULER           */}
            {/* ----------------------------------------------------------- */}
            <Reveal y={20}>
              <section
                id="booking-section"
                aria-labelledby="slots-heading"
                className="scroll-mt-28 rounded-[32px] sm:rounded-[36px] border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-6 sm:p-9 lg:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-line-soft/70">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#0d5a43]/10 text-[#0d5a43] dark:text-emerald-400 shrink-0">
                      <CalendarDays className="size-5.5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 id="slots-heading" className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-white">
                          Select Appointment Time
                        </h2>
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          IST (India Time)
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-ink dark:text-white/60 mt-0.5">
                        Choose an available day and reserve an unhurried {doctor.slotMinutes}-minute private consultation
                      </p>
                    </div>
                  </div>

                  {/* Instant Modal Trigger Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-forest/[0.08] hover:bg-forest/15 text-[#0d5a43] dark:text-emerald-400 border border-[#0d5a43]/20 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="size-3.5" />
                    <span>Quick Form Booking</span>
                  </button>
                </div>

                {/* Day Selection Strip */}
                <div className="mb-7">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-ink block mb-3">
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
                              aria-current={isActive ? "date" : undefined}
                              className={cn(
                                "inline-flex flex-col items-center justify-center min-w-[88px] sm:min-w-[100px] h-14 rounded-2xl border px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-none cursor-pointer",
                                isActive
                                  ? "border-[#0d5a43] bg-[#0d5a43] text-white shadow-sm ring-2 ring-[#0d5a43]/20 scale-102"
                                  : "border-line-soft bg-paper/60 dark:bg-white/5 text-ink dark:text-white hover:border-[#0d5a43]/40 hover:bg-paper"
                              )}
                            >
                              <span className="text-[11px] font-medium opacity-90">
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

                {/* Booking Panel / Slot Selector */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-ink block mb-3">
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
            </Reveal>

            {/* ----------------------------------------------------------- */}
            {/* ABOUT THE DOCTOR (EDITORIAL ESSAY & CLINICAL PROFILE)       */}
            {/* ----------------------------------------------------------- */}
            {doctor.bio ? (
              <Reveal y={20}>
                <section aria-labelledby="about-heading" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-2xl bg-[#0d5a43]/10 text-[#0d5a43] dark:text-emerald-400">
                      <HeartHandshake className="size-5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#0d5a43] dark:text-emerald-400">
                        CLINICAL BACKGROUND & PHILOSOPHY
                      </span>
                      <h2 id="about-heading" className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white">
                        About {doctor.displayName}
                      </h2>
                    </div>
                  </div>

                  <div className="rounded-[32px] border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-7 sm:p-9 shadow-xs space-y-5">
                    <p className="text-sm sm:text-base leading-relaxed text-ink/85 dark:text-white/80 whitespace-pre-line font-normal">
                      {doctor.bio}
                    </p>

                    {/* Highlights Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-line-soft/70">
                      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-paper/60 dark:bg-white/5 border border-line-soft">
                        <ShieldCheck className="size-5 text-[#0d5a43] dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-ink dark:text-white">Council Certified Homoeopath</h4>
                          <p className="text-[11px] text-muted-ink dark:text-white/60 mt-0.5">
                            Formally accredited under Central Council of Homoeopathy (CCH) guidelines.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-paper/60 dark:bg-white/5 border border-line-soft">
                        <Clock className="size-5 text-[#0d5a43] dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-ink dark:text-white">Unhurried Case-Taking</h4>
                          <p className="text-[11px] text-muted-ink dark:text-white/60 mt-0.5">
                            Deep constitutional evaluation covering physiological, environmental, and emotional health factors.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </Reveal>
            ) : null}

            {/* ----------------------------------------------------------- */}
            {/* THE CONSULTATION JOURNEY (CONNECTED HORIZONTAL PROCESS)     */}
            {/* ----------------------------------------------------------- */}
            <Reveal y={24} stagger={0.08}>
              <section aria-labelledby="journey-heading" className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-[#0d5a43] dark:text-emerald-400">
                    SEAMLESS · CONFIDENTIAL · PERSONALISED
                  </span>
                  <h2 id="journey-heading" className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white mt-1">
                    How your teleconsultation works
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-ink dark:text-white/60 mt-1">
                    Four effortless steps to private holistic healthcare with {doctor.displayName}.
                  </p>
                </div>

                {/* Connected Step Track */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative">
                  {/* Step 1 */}
                  <div className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3.5 border-b border-line-soft/60">
                        <span className="inline-flex items-center justify-center size-8 rounded-xl bg-forest/10 text-[#0d5a43] dark:text-emerald-400 font-display font-extrabold text-xs">
                          01
                        </span>
                        <CalendarDays className="size-5 text-[#0d5a43] dark:text-emerald-400" />
                      </div>
                      <h3 className="font-display font-bold text-base text-ink dark:text-white mt-4">
                        Select Slot
                      </h3>
                      <p className="text-xs text-muted-ink dark:text-white/70 mt-1.5 leading-relaxed">
                        Choose an available consultation time on the calendar that fits your day.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3.5 border-b border-line-soft/60">
                        <span className="inline-flex items-center justify-center size-8 rounded-xl bg-forest/10 text-[#0d5a43] dark:text-emerald-400 font-display font-extrabold text-xs">
                          02
                        </span>
                        <FileText className="size-5 text-[#0d5a43] dark:text-emerald-400" />
                      </div>
                      <h3 className="font-display font-bold text-base text-ink dark:text-white mt-4">
                        Share Health Intake
                      </h3>
                      <p className="text-xs text-muted-ink dark:text-white/70 mt-1.5 leading-relaxed">
                        Submit your symptoms and prior medical reports via encrypted health intake.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3.5 border-b border-line-soft/60">
                        <span className="inline-flex items-center justify-center size-8 rounded-xl bg-forest/10 text-[#0d5a43] dark:text-emerald-400 font-display font-extrabold text-xs">
                          03
                        </span>
                        <Video className="size-5 text-[#0d5a43] dark:text-emerald-400" />
                      </div>
                      <h3 className="font-display font-bold text-base text-ink dark:text-white mt-4">
                        Private Teleconsult
                      </h3>
                      <p className="text-xs text-muted-ink dark:text-white/70 mt-1.5 leading-relaxed">
                        Join an HD video or direct phone call for unhurried case-taking with Dr. Amit.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3.5 border-b border-line-soft/60">
                        <span className="inline-flex items-center justify-center size-8 rounded-xl bg-forest/10 text-[#0d5a43] dark:text-emerald-400 font-display font-extrabold text-xs">
                          04
                        </span>
                        <PackageCheck className="size-5 text-[#0d5a43] dark:text-emerald-400" />
                      </div>
                      <h3 className="font-display font-bold text-base text-ink dark:text-white mt-4">
                        Prescription &amp; Delivery
                      </h3>
                      <p className="text-xs text-muted-ink dark:text-white/70 mt-1.5 leading-relaxed">
                        Instant digital prescription and 1-click doorstep delivery of genuine remedies.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>

            {/* ----------------------------------------------------------- */}
            {/* VERIFIED PATIENT REVIEWS & CLINICAL OUTCOMES                */}
            {/* ----------------------------------------------------------- */}
            <Reveal y={24} stagger={0.06}>
              <section aria-labelledby="reviews-heading" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold tracking-widest uppercase text-[#0d5a43] dark:text-emerald-400">
                      PATIENT EXPERIENCES
                    </span>
                    <h2 id="reviews-heading" className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white mt-1">
                      Verified Patient Reviews
                    </h2>
                  </div>

                  {/* Overall Rating Pill */}
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-[#0c1e17] border border-line-soft/80 shadow-2xs">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="size-4 fill-amber-500 text-amber-500" />
                      <span className="font-display font-bold text-base text-ink dark:text-white">
                        {doctor.ratingAverage.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-line-soft">·</span>
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      {doctor.ratingCount} verified consults
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {reviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="size-3.5 fill-current" />
                            ))}
                          </div>
                          <span className="text-[11px] text-muted-ink">{rev.date}</span>
                        </div>

                        <span className="inline-block rounded-full bg-forest/8 px-2.5 py-0.5 text-[11px] font-semibold text-[#0d5a43] dark:text-emerald-400">
                          {rev.tag}
                        </span>

                        <p className="text-xs sm:text-sm text-ink/85 dark:text-white/80 leading-relaxed italic">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      </div>

                      <div className="pt-3 border-t border-line-soft/60 flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-ink dark:text-white">{rev.author}</h4>
                          <span className="text-[11px] text-muted-ink">{rev.city}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="size-3" />
                          Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            {/* ----------------------------------------------------------- */}
            {/* FREQUENTLY ASKED QUESTIONS (ACCESSIBLE ACCORDION)           */}
            {/* ----------------------------------------------------------- */}
            <Reveal y={20}>
              <section aria-labelledby="faqs-heading" className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-[#0d5a43] dark:text-emerald-400">
                    COMMON QUESTIONS
                  </span>
                  <h2 id="faqs-heading" className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white mt-1">
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
                            : "border-line-soft/80 bg-paper/50 hover:border-line hover:bg-paper"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : i)}
                          className="w-full p-4.5 sm:p-5 text-left flex items-center justify-between gap-4 font-display text-sm sm:text-base font-bold text-ink dark:text-white cursor-pointer hover:text-[#0d5a43] transition-colors"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown
                            className={cn(
                              "size-4 shrink-0 text-muted-ink transition-transform duration-300",
                              isOpen && "rotate-180 text-[#0d5a43] dark:text-emerald-400"
                            )}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 text-xs sm:text-sm text-muted-ink dark:text-white/70 leading-relaxed border-t border-line-soft/60 pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </Reveal>

          </div>

          {/* ============================================================ */}
          {/* RIGHT / SUPPORTING COLUMN (4 COLS): STICKY CONSULTATION PANEL */}
          {/* ============================================================ */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <Reveal y={16}>
              <div className="space-y-6">
                {/* Consultation Modes & Pricing */}
                <div className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between pb-4 border-b border-line-soft/70">
                    <h3 className="font-display text-lg font-bold text-ink dark:text-white">
                      Consultation Modes
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                      Verified Fees
                    </span>
                  </div>

                  <ul className="mt-4 space-y-3 text-xs sm:text-sm">
                    {doctor.videoFee !== null ? (
                      <li className="flex items-center justify-between p-3.5 rounded-2xl bg-paper/60 dark:bg-white/5 border border-line-soft">
                        <span className="flex items-center gap-2.5 font-semibold text-ink dark:text-white">
                          <Video className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                          Video Consultation
                        </span>
                        <span className="font-bold text-base text-[#0d5a43] dark:text-emerald-400">
                          {formatRupees(doctor.videoFee)}
                        </span>
                      </li>
                    ) : null}

                    {doctor.audioFee !== null ? (
                      <li className="flex items-center justify-between p-3.5 rounded-2xl bg-paper/60 dark:bg-white/5 border border-line-soft">
                        <span className="flex items-center gap-2.5 font-semibold text-ink dark:text-white">
                          <Phone className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                          Direct Audio Call
                        </span>
                        <span className="font-bold text-base text-[#0d5a43] dark:text-emerald-400">
                          {formatRupees(doctor.audioFee)}
                        </span>
                      </li>
                    ) : null}

                    <li className="flex items-center gap-2.5 text-xs text-muted-ink pt-1">
                      <Clock className="size-4 text-[#0d5a43] dark:text-emerald-400 shrink-0" />
                      <span>{doctor.slotMinutes}-minute dedicated private session</span>
                    </li>

                    {doctor.experienceYears !== null ? (
                      <li className="flex items-center gap-2.5 text-xs text-muted-ink">
                        <Sparkles className="size-4 text-[#0d5a43] dark:text-emerald-400 shrink-0" />
                        <span>{doctor.experienceYears} years of clinical medical practice</span>
                      </li>
                    ) : null}

                    {doctor.languages.length ? (
                      <li className="flex items-center gap-2.5 text-xs text-muted-ink">
                        <Languages className="size-4 text-[#0d5a43] dark:text-emerald-400 shrink-0" />
                        <span>Speaks {doctor.languages.join(", ")}</span>
                      </li>
                    ) : null}

                    {doctor.clinicCity ? (
                      <li className="flex items-center gap-2.5 text-xs text-muted-ink">
                        <MapPin className="size-4 text-[#0d5a43] dark:text-emerald-400 shrink-0" />
                        <span>Clinic: {doctor.clinicCity}</span>
                      </li>
                    ) : null}
                  </ul>
                </div>

                {/* Weekly Practice Timetable */}
                {hoursByDay.length ? (
                  <div className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    <h3 className="font-display text-lg font-bold text-ink dark:text-white mb-3">
                      Weekly Consulting Hours
                    </h3>
                    <dl className="divide-y divide-line-soft/60 text-xs sm:text-[13px]">
                      {hoursByDay.map((day) => (
                        <div key={day.name} className="flex justify-between py-2">
                          <dt className="text-muted-ink font-medium">{day.name}</dt>
                          <dd className="text-right font-semibold text-ink dark:text-white tabular-nums">
                            {day.ranges.map((r) => `${clock(r.startTime)} – ${clock(r.endTime)}`).join(", ")}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}

                {/* Clinical Council Guarantee */}
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-xs text-ink dark:text-white shadow-2xs">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="size-5 shrink-0 text-[#0d5a43] dark:text-emerald-400 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#0d5a43] dark:text-emerald-400">
                        Clinical Council Vetted
                      </h4>
                      <p className="text-muted-ink dark:text-white/70 leading-relaxed text-[11px]">
                        All consultations strictly adhere to National Telemedicine Guidelines. Signed official digital prescriptions included with follow-up support.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </aside>

        </div>
      </Container>

      {/* --------------------------------------------------------------- */}
      {/* 3. CARE & SUPPORT CONCIERGE BANNER                              */}
      {/* --------------------------------------------------------------- */}
      <section className="py-14 sm:py-20 border-t border-line-soft/80">
        <Container width="wide">
          <Reveal y={24} scale={0.98}>
            <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-[#0a271e] via-[#0d3528] to-[#071d16] p-8 sm:p-12 lg:p-14 shadow-2xl text-white">
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className="relative size-20 sm:size-24 shrink-0 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-white/10">
                    <Image
                      src="/Images/doctors/care-banner-agent.jpg"
                      alt="Care Coordinator"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1 max-w-xl">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
                      CARE COORDINATION
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Need help choosing remedies or appointments?
                    </h3>
                    <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                      Our care coordinators are available 7 days a week to help with constitutional matching, dosage queries, and appointment scheduling.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 shrink-0 w-full sm:w-auto">
                  <Link
                    href="/products"
                    className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-full bg-white text-[#0c2a20] text-xs font-bold shadow-md hover:bg-white/90 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Browse Remedies
                  </Link>
                  <button
                    type="button"
                    onClick={scrollToBooking}
                    className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-full border border-white/30 text-white hover:bg-white/10 active:scale-[0.98] text-xs font-bold transition-all cursor-pointer"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* 4. UNIFIED CONSULTATION BOOKING MODAL                           */}
      {/* --------------------------------------------------------------- */}
      <ConsultationModal
        doctor={doctor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialDate={modalDate}
        initialSlot={modalSlot}
      />
    </div>
  );
}
