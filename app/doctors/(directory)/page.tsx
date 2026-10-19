import type { Metadata } from "next";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  Sprout,
  Video,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { DoctorsDirectoryClient } from "@/sections/doctors/DoctorsDirectoryClient";
import { repositories } from "@/lib/repositories";
import type { ApiDoctorCard, ApiNextSlot } from "@/types/api/care";

export const metadata: Metadata = {
  title: "Consult Verified Homoeopathic Doctors Online",
  description:
    "Consult vetted, certified homoeopathic practitioners on DocHomoeo. Select live slots for video or audio care, receive digital prescriptions, and order authentic remedies.",
};

/** A request that may fail gracefully without taking the page down. */
async function optional<T>(request: Promise<T>, fallback: T): Promise<T> {
  try {
    return await request;
  } catch (error) {
    unstable_rethrow(error);
    return fallback;
  }
}

const JOURNEY_STEPS = [
  {
    step: "01",
    title: "Choose a doctor & slot",
    description: "Browse verified doctors and pick a free appointment slot.",
    icon: CalendarDays,
  },
  {
    step: "02",
    title: "Share your health details",
    description: "Tell the doctor about your concerns and upload reports if needed.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Pay & join consultation",
    description: "Complete the consultation fee and join the video or audio call.",
    icon: Video,
  },
  {
    step: "04",
    title: "Receive your prescription",
    description: "Your digital prescription will be available in your account.",
    icon: CheckCircle2,
  },
] as const;

export default async function DoctorsPage({ searchParams }: PageProps<"/doctors">) {
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 80) ?? "";

  const [all, matches] = await Promise.all([
    optional(repositories.care.listDoctors(), []),
    query ? optional(repositories.care.listDoctors(query), []) : Promise.resolve(undefined),
  ]);

  const doctors = query ? (matches ?? []) : (all ?? []);

  const nextSlots = new Map<number, ApiNextSlot | null>(
    await Promise.all(
      (doctors ?? []).map(async (doctor) => [doctor.id, await optional(repositories.care.getNextSlot(doctor.slug), null)] as const),
    ),
  );

  const nextSlotsObj: Record<number, ApiNextSlot | null> = Object.fromEntries(nextSlots.entries());

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1 bg-[#fbfaf6] dark:bg-[#07130e] overflow-x-hidden text-ink">
        {/* ============================================================== */}
        {/* SVG CLIP-PATHS: Organic Pebble & High Arch Mask Definitions    */}
        {/* ============================================================== */}
        <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <defs>
            {/* Hero Doctor Arched Pebble Shape — Extended gracefully towards the left to eliminate central gap */}
            <clipPath id="hero-doctor-clip" clipPathUnits="objectBoundingBox">
              <path d="M 0.01,0.48 C 0,0.16 0.26,0 0.62,0 C 0.94,0 1,0.18 1,0.5 C 1,0.85 0.82,1 0.46,1 C 0.14,1 0.01,0.82 0.01,0.48 Z" />
            </clipPath>

            {/* Consultation Journey Laptop Pebble Shape */}
            <clipPath id="journey-laptop-clip" clipPathUnits="objectBoundingBox">
              <path d="M 0.06,0.45 C 0.05,0.16 0.35,0 0.65,0 C 0.95,0 1,0.22 1,0.55 C 1,0.86 0.84,1 0.54,1 C 0.22,1 0.06,0.82 0.06,0.45 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* ============================================================== */}
        {/* 1. HERO SECTION: Editorial Layout Matching Reference Design     */}
        {/* ============================================================== */}
        <section aria-labelledby="doctors-heading" className="relative pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 lg:pb-20 overflow-hidden">
          {/* Background Ambient Accents to fill empty spaces */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
            <div
              aria-hidden="true"
              className="absolute -top-12 -left-12 size-96 rounded-full bg-emerald-100/40 dark:bg-emerald-950/20 blur-3xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute top-1/4 right-1/4 size-96 rounded-full bg-emerald-100/35 dark:bg-emerald-950/20 blur-3xl pointer-events-none"
            />
          </div>

          <Container width="wide" className="relative z-10">
            <PageBreadcrumb items={[{ name: "Doctors", href: "/doctors" }]} className="mb-6 sm:mb-8" />

            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              {/* Left Column (6 cols): Editorial Typography & Features */}
              <div className="lg:col-span-6 xl:col-span-6">
                <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d5a43]">
                  EXPERT CARE, NATURALLY.
                </span>

                <h1
                  id="doctors-heading"
                  className="mt-3 font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#14251f] dark:text-white leading-[1.08]"
                >
                  Homeopathic care, <br />
                  <em className="font-display italic text-[#0d5a43] dark:text-emerald-400 font-normal">
                    made
                  </em>{" "}
                  personal
                </h1>

                <p className="mt-4 max-w-xl text-base sm:text-lg text-ink/80 dark:text-white/80 leading-relaxed font-normal">
                  Consult verified homeopathic doctors and get personalised guidance from the comfort of your home.
                </p>

                {/* 3 Core Benefit Chips */}
                <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-3.5">
                  <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white/85 dark:bg-white/10 border border-black/8 dark:border-white/15 px-4 py-2.5 shadow-2xs backdrop-blur-md text-xs sm:text-sm font-semibold text-ink dark:text-white">
                    <Video className="size-4 text-forest dark:text-emerald-400 shrink-0" />
                    <span>Video &amp; audio consultations</span>
                  </div>

                  <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white/85 dark:bg-white/10 border border-black/8 dark:border-white/15 px-4 py-2.5 shadow-2xs backdrop-blur-md text-xs sm:text-sm font-semibold text-ink dark:text-white">
                    <FileText className="size-4 text-forest dark:text-emerald-400 shrink-0" />
                    <span>Share reports securely</span>
                  </div>

                  <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white/85 dark:bg-white/10 border border-black/8 dark:border-white/15 px-4 py-2.5 shadow-2xs backdrop-blur-md text-xs sm:text-sm font-semibold text-ink dark:text-white">
                    <CheckCircle2 className="size-4 text-forest dark:text-emerald-400 shrink-0" />
                    <span>Get digital prescriptions</span>
                  </div>
                </div>
              </div>

              {/* Right Column (6 cols): Clip-Path Arched Doctor Image with Floating Badges — bridging the gap */}
              <div className="lg:col-span-6 xl:col-span-6 relative flex justify-center lg:justify-end z-10">
                {/* Floating Handwritten Inspiration Text — Repositioned with comfortable headroom and without sprout icon */}
                <div className="hidden xl:block absolute -top-12 right-6 lg:right-10 text-right z-20 pointer-events-none">
                  <div className="font-signature text-2xl sm:text-[1.8rem] font-bold text-[#0d5a43] dark:text-emerald-400 leading-tight select-none -rotate-1 tracking-wide">
                    “A healthier tomorrow <br />with natural care”
                  </div>
                </div>

                {/* Main Hero Doctor Container — Expanded horizontally into the center gap */}
                <div className="relative w-full max-w-[520px] lg:max-w-[560px] xl:max-w-[590px] h-[490px] sm:h-[540px]">
                  {/* Subtle Botanical Aura Behind the Clip-Path */}
                  <div
                    aria-hidden
                    className="absolute -inset-6 rounded-full bg-gradient-to-tr from-forest/20 via-emerald-500/15 to-transparent blur-3xl pointer-events-none -z-10"
                  />

                  {/* Organic Clipped Doctor Portrait — Extended smoothly to the left */}
                  <div
                    style={{ clipPath: "url(#hero-doctor-clip)" }}
                    className="relative size-full overflow-hidden shadow-2xl bg-[#e3ece5]"
                  >
                    <img
                      src="/Images/doctors/hero-doctor-editorial.jpg"
                      alt="Verified DocHomoeo Doctor in consultation sanctuary"
                      draggable={false}
                      className="size-full object-cover object-[58%_22%] pointer-events-none select-none transition-transform duration-700 hover:scale-104"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Floating Badge A: Top-Left "Trusted Homeopathic Care" */}
                  <div className="absolute top-8 -left-3 sm:-left-6 lg:-left-6 z-20 flex items-center gap-3 rounded-2xl border border-white/85 dark:border-white/15 bg-white/95 dark:bg-[#0c1e17]/95 p-2.5 sm:px-3.5 sm:py-3 shadow-xl backdrop-blur-xl">
                    <span className="grid size-9 place-items-center rounded-xl bg-forest/10 text-forest dark:text-emerald-400 shrink-0 shadow-2xs">
                      <ShieldCheck className="size-5" />
                    </span>
                    <div className="min-w-0 leading-tight">
                      <span className="block text-xs font-bold text-ink dark:text-white">
                        Trusted Homeopathic Care
                      </span>
                      <span className="block text-[10.5px] text-muted-ink dark:text-white/60 mt-0.5">
                        Verified professionals
                      </span>
                    </div>
                  </div>

                  {/* Floating Badge B: Middle-Right "Safe & Private" */}
                  <div className="absolute top-52 -right-2 sm:-right-4 lg:-right-6 z-20 flex items-center gap-2.5 rounded-2xl border border-white/85 dark:border-white/15 bg-white/95 dark:bg-[#0c1e17]/95 p-2.5 sm:px-3 sm:py-2.5 shadow-xl backdrop-blur-xl">
                    <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest dark:text-emerald-400 shrink-0">
                      <Lock className="size-4 text-forest dark:text-emerald-400" />
                    </span>
                    <div className="min-w-0 leading-tight">
                      <span className="block text-xs font-bold text-ink dark:text-white">
                        Safe &amp; Private
                      </span>
                      <span className="block text-[10px] text-muted-ink dark:text-white/60">
                        Convenient online care
                      </span>
                    </div>
                  </div>

                  {/* Floating Badge C: Bottom-Right Video Call Action Preview */}
                  <div className="absolute -bottom-3 right-3 sm:right-6 z-20 flex items-center gap-2 rounded-2xl border border-white/85 dark:border-white/15 bg-white/95 dark:bg-[#0c1e17]/95 p-2 sm:p-2.5 shadow-xl backdrop-blur-xl">
                    <div className="relative size-11 overflow-hidden rounded-xl border border-white/80 shadow-2xs">
                      <img
                        src="/Images/doctors/step-video-call.jpg"
                        alt="Patient on video call"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="grid size-7 place-items-center rounded-full bg-forest text-white shadow-2xs">
                        <Phone className="size-3.5" />
                      </span>
                      <span className="grid size-7 place-items-center rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-400">
                        <Video className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ============================================================== */}
        {/* 2 & 3. SEARCH & OUR DOCTORS: Interactive Directory Client      */}
        {/* ============================================================== */}
        <DoctorsDirectoryClient
          doctors={doctors}
          nextSlots={nextSlotsObj}
          initialQuery={query}
        />

        {/* ============================================================== */}
        {/* 4. CONSULTATION JOURNEY: "Your consultation journey, simplified" */}
        {/* ============================================================== */}
        <section
          id="how-it-works"
          aria-labelledby="journey-simplified-heading"
          className="relative py-16 sm:py-20 lg:py-24 border-t border-line/40 bg-gradient-to-b from-white via-[#f7f5ed] to-[#fbfaf6] dark:from-[#0a1c15] dark:via-[#07130e] dark:to-[#07130e]"
        >
          <Container width="wide">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column (5 cols): Clip-Path Arched Laptop Telehealth Image */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-[440px] h-[380px] sm:h-[440px]">
                  {/* Soft Aura */}
                  <div
                    aria-hidden
                    className="absolute -inset-4 rounded-full bg-gradient-to-tr from-forest/15 via-sage/20 to-transparent blur-2xl pointer-events-none -z-10"
                  />

                  {/* Organic Clipped Laptop Telehealth Photo */}
                  <div
                    style={{ clipPath: "url(#journey-laptop-clip)" }}
                    className="relative size-full overflow-hidden shadow-2xl bg-[#e3ece5]"
                  >
                    <img
                      src="/Images/doctors/journey-laptop-consult.jpg"
                      alt="Teleconsultation on laptop with homoeopathic physician"
                      draggable={false}
                      className="size-full object-cover pointer-events-none select-none transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): Step-by-Step Connected Journey */}
              <div className="lg:col-span-7">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d5a43]">
                      SIMPLE. SECURE. PERSONALISED.
                    </span>
                    <h2
                      id="journey-simplified-heading"
                      className="mt-2 font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-ink dark:text-white leading-[1.12]"
                    >
                      Your consultation <br className="hidden sm:inline" />
                      journey,{" "}
                      <em className="font-display italic text-[#0d5a43] dark:text-emerald-400 font-normal">
                        simplified
                      </em>
                    </h2>
                  </div>

                  {/* Cursive quote flourish */}
                  <div className="hidden sm:block text-right pr-2">
                    <p className="font-signature text-xl sm:text-2xl font-bold text-[#0d5a43] dark:text-emerald-400 select-none -rotate-1">
                      “Natural conversations <br />for a healthier you”
                    </p>
                  </div>
                </div>

                {/* 4 Connected Vertical Nodes */}
                <div className="relative mt-10 space-y-7 pl-4 sm:pl-6 before:absolute before:left-[27px] sm:before:left-[35px] before:top-4 before:bottom-4 before:w-0.5 before:border-l-2 before:border-dashed before:border-[#0d5a43]/30">
                  {JOURNEY_STEPS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.step} className="relative flex items-start gap-4 sm:gap-5 group">
                        {/* Number Badge with Outer Ring */}
                        <span className="relative z-10 grid size-8 sm:size-10 place-items-center rounded-full bg-[#e6efe9] text-[#0d5a43] font-bold text-xs sm:text-sm ring-4 ring-[#fbfaf6] dark:ring-[#0a1c15] shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                          {item.step}
                        </span>

                        {/* Step Details */}
                        <div className="pt-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="grid size-6 place-items-center rounded-md bg-forest/10 text-forest dark:text-emerald-400">
                              <Icon className="size-3.5" />
                            </span>
                            <h3 className="font-display text-base sm:text-lg font-bold text-ink dark:text-white leading-snug">
                              {item.title}
                            </h3>
                          </div>
                          <p className="mt-1 text-xs sm:text-sm text-muted-ink dark:text-white/70 leading-relaxed max-w-lg">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </Container>
        </section>

        {/* ============================================================== */}
        {/* 5. CARE & SUPPORT CTA: Deep Forest Green Curved Banner          */}
        {/* ============================================================== */}
        <section aria-label="Care and Support Inquiries" className="py-12 sm:py-16">
          <Container width="wide">
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0c3c2e] via-[#093327] to-[#06261d] text-white p-6 sm:p-8 lg:p-10 shadow-xl">
              {/* Soft background ambient highlights */}
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-forest/25 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-emerald-500/15 blur-3xl" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8">
                {/* Left specialist photograph */}
                <div className="shrink-0 flex justify-center md:justify-start">
                  <div className="relative w-44 sm:w-52 aspect-[16/11] rounded-2xl overflow-hidden border border-white/20 shadow-float">
                    <img
                      src="/Images/doctors/care-support.jpg"
                      alt="DocHomoeo Care Specialist"
                      draggable={false}
                      className="size-full object-cover object-center pointer-events-none select-none"
                    />
                  </div>
                </div>

                {/* Center Editorial Copy */}
                <div className="flex-1 text-center md:text-left min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                    CARE &amp; SUPPORT
                  </span>
                  <h3 className="mt-2 font-display text-2xl sm:text-3xl lg:text-[2.1rem] font-bold text-white tracking-tight leading-snug">
                    Need help choosing your next step?
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
                    Our care team can help with remedies, schedules and ordering.
                  </p>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-cream text-[#093327] px-5 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition-all"
                  >
                    <span>Browse Remedies</span>
                    <span aria-hidden>→</span>
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/30 hover:bg-white/10 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all"
                  >
                    <span>Contact Care Team</span>
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
