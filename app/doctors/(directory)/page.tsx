import type { Metadata } from "next";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  Headset,
  HelpCircle,
  Info,
  LayoutGrid,
  Leaf,
  Phone,
  RotateCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { DoctorCard } from "@/sections/doctors/DoctorCard";
import { repositories } from "@/lib/repositories";
import { CANCEL_HOURS, HOLD_MINUTES } from "@/lib/care/consultation";
import { cn } from "@/lib/utils";
import type { ApiConsultingStream, ApiDoctorCard, ApiNextSlot } from "@/types/api/care";

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

/**
 * Consultation Journey: Four compact stages strictly matching
 * actual backend workflows with photographic device visuals.
 */
const JOURNEY_STEPS = [
  {
    step: "01",
    title: "Choose doctor & slot",
    description: "Browse verified doctors and pick a free appointment slot in India time (IST).",
    note: `Held for ${HOLD_MINUTES} min while booking`,
    icon: CalendarCheck,
    image: "/Images/doctors/step-doctor-laptop.jpg",
  },
  {
    step: "02",
    title: "Share health details",
    description: "Tell us about your health concerns and upload up to 5 past reports or prescriptions.",
    note: "PDF, JPG, PNG or WebP up to 5 MB",
    icon: FileText,
    image: "/Images/doctors/step-tablet-details.jpg",
  },
  {
    step: "03",
    title: "Pay & join consultation",
    description: "Pay the doctor's fee securely. Your call link appears in your account.",
    note: `Cancelable up to ${CANCEL_HOURS}h before slot`,
    icon: Video,
    image: "/Images/doctors/step-video-call.jpg",
  },
  {
    step: "04",
    title: "Receive digital prescription",
    description: "Access your doctor's prescription in your account and order medicines in one step.",
    note: "Instant checkout with home delivery",
    icon: CheckCircle2,
    image: "/Images/doctors/step-phone-prescription.jpg",
  },
] as const;

/**
 * /doctors directory: Verified homoeopathic doctors taking consultations.
 * Strictly frontend-only: reads GET /api/care/doctors and GET /api/care/streams.
 * When no doctors are currently listed, renders an intentional, elegant empty state.
 */
export default async function DoctorsPage({ searchParams }: PageProps<"/doctors">) {
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 80) ?? "";

  const [all, matches, streams] = await Promise.all([
    optional(repositories.care.listDoctors(), null),
    query ? optional(repositories.care.listDoctors(query), null) : Promise.resolve(undefined),
    optional(repositories.care.getStreams(), [] as ApiConsultingStream[]),
  ]);

  const doctors = query ? (matches ?? null) : all;
  const unavailable = doctors === null;
  const listed = all?.length ?? 0;

  const nextSlots = new Map<number, ApiNextSlot | null>(
    await Promise.all(
      (doctors ?? []).map(async (doctor) => [doctor.id, await optional(repositories.care.getNextSlot(doctor.slug), null)] as const),
    ),
  );

  // Filters extracted only from genuine data: active doctor specializations and open streams
  const specialties = [
    ...new Set([
      ...(all ?? []).map((doctor) => doctor.specialization?.trim()).filter((name): name is string => Boolean(name)),
      ...streams.filter((stream) => stream.status === "OPEN").flatMap((stream) => stream.specializations.map((s) => s.name)),
    ]),
  ].slice(0, 12);

  const searchable = listed > 0 || query !== "";

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas overflow-x-hidden">
        {/* ============================================================== */}
        {/* HERO SECTION: Asymmetric Editorial Composition                  */}
        {/* ============================================================== */}
        <section aria-labelledby="doctors-heading" className="dh-head-arc dh-page-top pb-8 sm:pb-12 lg:pb-16">
          <Container width="wide">
            <PageBreadcrumb items={[{ name: "Doctors", href: "/doctors" }]} className="mb-6 sm:mb-8" />

            <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12 xl:gap-16">
              {/* Left Column: Editorial Copy & Core Actions */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-forest/8 px-3.5 py-1 text-xs font-semibold tracking-wide text-forest-deep">
                  <span className="size-2 rounded-full bg-forest animate-pulse" />
                  Online Clinical Consultations
                </div>

                <h1
                  id="doctors-heading"
                  className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-ink lg:leading-[1.12]"
                >
                  Consult verified homoeopathic doctors online
                </h1>

                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-ink sm:text-lg">
                  Every practitioner here is thoroughly vetted by DocHomoeo before taking consultations. Book a confirmed slot,
                  consult via video or audio from home, and receive a digital prescription directly in your account.
                </p>

                {/* Primary Action Buttons */}
                <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
                  <Button asChild variant="brand" size="xl" className="rounded-full shadow-soft hover:shadow-lift">
                    <a href="#directory">
                      Find a Doctor
                      <ArrowRight className="size-4" />
                    </a>
                  </Button>
                  <Button asChild variant="brandOutline" size="xl" className="rounded-full">
                    <a href="#how-it-works">How It Works</a>
                  </Button>
                </div>

                {/* Trust Credentials Micro-Badges */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-line/60 pt-5 text-xs text-muted-ink">
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-full bg-forest/10 text-forest shrink-0">
                      <ShieldCheck className="size-4" />
                    </span>
                    <span className="font-medium text-ink">100% Vetted Doctors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-full bg-forest/10 text-forest shrink-0">
                      <Clock className="size-4" />
                    </span>
                    <span className="font-medium text-ink">Live Slots in IST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-full bg-forest/10 text-forest shrink-0">
                      <FileText className="size-4" />
                    </span>
                    <span className="font-medium text-ink">Digital Rx in Account</span>
                  </div>
                </div>

                {/* Search Bar (When searchable) */}
                {searchable ? (
                  <form action="/doctors" role="search" className="mt-6 flex max-w-xl items-center gap-2">
                    <label htmlFor="doctor-search" className="sr-only">
                      Search doctors by name, specialization or language
                    </label>
                    <div className="relative min-w-0 flex-1">
                      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-ink" />
                      <input
                        id="doctor-search"
                        name="q"
                        defaultValue={query}
                        maxLength={80}
                        placeholder="Search by name, specialization or language…"
                        className="h-11 sm:h-12 w-full rounded-full border border-line bg-paper pr-4 pl-11 text-[0.875rem] sm:text-[0.9375rem] text-ink shadow-xs outline-none placeholder:text-muted-ink/70 focus-visible:border-forest/50 focus-visible:ring-3 focus-visible:ring-forest/20"
                      />
                    </div>
                    <Button type="submit" variant="brand" size="default" className="h-11 sm:h-12 rounded-full px-5">
                      Search
                    </Button>
                  </form>
                ) : null}

                {/* Filter Chips */}
                {specialties.length > 0 ? (
                  <nav aria-label="Filter by specialization" className="mt-4">
                    <ul className="flex flex-wrap gap-2">
                      <li>
                        <FilterChip href="/doctors" active={query === ""}>
                          All doctors
                        </FilterChip>
                      </li>
                      {specialties.map((name) => (
                        <li key={name}>
                          <FilterChip href={`/doctors?q=${encodeURIComponent(name)}`} active={query.toLowerCase() === name.toLowerCase()}>
                            {name}
                          </FilterChip>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ) : null}
              </div>

              {/* Right Column: Generous Rounded Frame with Genuine Clinical Consultation Asset */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                  {/* Atmospheric soft background glow */}
                  <div
                    aria-hidden
                    className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-forest/15 via-sage/20 to-transparent blur-xl pointer-events-none -z-10"
                  />

                  {/* Framed consultation photograph */}
                  <div className="relative overflow-hidden rounded-[2rem] border border-line/80 bg-paper shadow-lift aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3.5]">
                    <img
                      src="/Images/ConsultentBG.webp"
                      alt="DocHomoeo doctor clinical consultation environment"
                      draggable={false}
                      className="size-full object-cover object-[26%_center] transition-transform duration-700 ease-premium hover:scale-105 pointer-events-none select-none"
                    />
                    {/* Balanced gradient overlay for docked card readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-abyss/70 via-black/15 to-transparent pointer-events-none" />

                    {/* Restrained secondary information card: genuinely supported consultation modes */}
                    <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 rounded-[1.25rem] border border-white/20 bg-white/90 p-3.5 sm:p-4 shadow-float backdrop-blur-md">
                      <div className="flex items-center justify-between border-b border-black/5 pb-2 mb-2.5">
                        <span className="text-[0.6875rem] font-bold tracking-wider uppercase text-forest">
                          Supported Consultation Modes
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-forest-deep">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          DocHomoeo Care
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                        <div className="flex items-center gap-2.5 rounded-xl bg-paper/85 p-2 sm:p-2.5 border border-line/40">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-forest/10 text-forest">
                            <Video className="size-4" strokeWidth={1.8} />
                          </span>
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-ink">Video Call</span>
                            <span className="block text-[0.6875rem] text-muted-ink truncate">Face-to-face video</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-xl bg-paper/85 p-2 sm:p-2.5 border border-line/40">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-forest/10 text-forest">
                            <Phone className="size-4" strokeWidth={1.8} />
                          </span>
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-ink">Audio Call</span>
                            <span className="block text-[0.6875rem] text-muted-ink truncate">Private phone call</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ============================================================== */}
        {/* DIRECTORY SECTION: Real Profiles or Intentional Empty State     */}
        {/* ============================================================== */}
        <section id="directory" aria-label="Doctors Directory" className="dh-section-b pt-4 pb-12 sm:pb-16">
          <Container width="wide">
            {/* Consultation Streams Indicator */}
            {streams.length > 0 ? <Streams streams={streams} /> : null}

            {unavailable ? (
              <Unavailable query={query} />
            ) : doctors.length === 0 ? (
              query ? (
                <NoMatch query={query} />
              ) : (
                <DirectoryOpeningSoon />
              )
            ) : (
              <>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-4">
                  <p className="text-sm font-medium text-ink" role="status">
                    Showing <span className="font-semibold text-forest">{doctors.length}</span>{" "}
                    {doctors.length === 1 ? "verified doctor" : "verified doctors"}
                    {query ? ` matching “${query}”` : " available for consultation"}
                  </p>
                  <span className="text-xs text-muted-ink">Appointments booked in India Time (IST)</span>
                </div>

                <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {doctors.map((doctor: ApiDoctorCard) => (
                    <li key={doctor.id} className="min-w-0">
                      <DoctorCard doctor={doctor} nextSlot={nextSlots.get(doctor.id) ?? null} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Container>
        </section>

        {/* ============================================================== */}
        {/* CONSULTATION JOURNEY: Connected Timeline Step-by-Step           */}
        {/* ============================================================== */}
        <section id="how-it-works" aria-labelledby="steps-heading" className="border-t border-line/60 bg-paper/60 py-16 sm:py-20">
          <Container width="wide">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="max-w-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-forest">The Process</span>
                <h2 id="steps-heading" className="mt-2 font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-bold text-ink leading-tight">
                  Your consultation, step by step
                </h2>
              </div>
              <p className="max-w-md text-xs sm:text-sm text-muted-ink leading-relaxed lg:text-right">
                Clear, transparent, and completely integrated into your DocHomoeo account — from selecting your practitioner to receiving
                your digital prescription.
              </p>
            </div>

            {/* 4 Connected Stages with Realistic Device Mockup Visuals */}
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {JOURNEY_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="group relative flex flex-col justify-between rounded-2xl border border-line-soft bg-paper p-4 sm:p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-forest/35 hover:shadow-soft"
                >
                  <div>
                    {/* Step Pill Badge */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center justify-center rounded-lg bg-forest/10 px-2.5 py-0.5 text-xs font-bold text-forest tracking-tight">
                        {item.step}
                      </span>
                    </div>

                    {/* Realistic Device Visual */}
                    <div className="relative mt-3.5 mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-line-soft bg-cream/30">
                      <img
                        src={item.image}
                        alt={item.title}
                        draggable={false}
                        className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none select-none"
                      />
                    </div>

                    <h3 className="font-display text-base font-bold text-ink leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs text-muted-ink leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 rounded-lg bg-canvas px-2.5 py-1 text-[0.7rem] font-medium text-forest-deep border border-line-soft">
                    {item.note}
                  </div>
                </div>
              ))}
            </div>

            {/* Medical Disclaimer Banner */}
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-line-soft bg-canvas/90 p-4 sm:p-5 text-xs text-muted-ink">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-forest-abyss text-white">
                <Info className="size-3" />
              </span>
              <p className="leading-relaxed text-[0.8125rem]">
                Consultations are provided by verified independent practitioners, not by DocHomoeo. DocHomoeo provides the platform for
                scheduling, secure connectivity, and digital prescription access. Online consultations are not intended for medical
                emergencies. If you require emergency care, please visit your nearest hospital immediately.
              </p>
            </div>
          </Container>
        </section>

        {/* ============================================================== */}
        {/* CARE & SUPPORT CTA: Premium Deep Forest Curved Banner          */}
        {/* ============================================================== */}
        <section aria-label="Care and Support Inquiries" className="border-t border-line/50 bg-canvas py-12 sm:py-16">
          <Container width="wide">
            <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#0c3c2e] via-[#093327] to-[#06261d] text-white p-6 sm:p-8 lg:p-9 shadow-lift">
              {/* Soft background ambient highlights */}
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-forest/20 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8">
                {/* Left specialist photograph */}
                <div className="shrink-0 flex justify-center md:justify-start">
                  <div className="relative w-48 sm:w-56 aspect-[16/11] rounded-2xl overflow-hidden border border-white/15 shadow-float">
                    <img
                      src="/Images/doctors/care-banner-agent.jpg"
                      alt="DocHomoeo Care Specialist"
                      draggable={false}
                      className="size-full object-cover object-center pointer-events-none select-none"
                    />
                  </div>
                </div>

                {/* Center Editorial Copy */}
                <div className="flex-1 text-center md:text-left min-w-0">
                  <span className="text-[0.72rem] font-bold uppercase tracking-widest text-emerald-300">
                    Care & Support
                  </span>
                  <h3 className="mt-2 font-display text-2xl sm:text-3xl lg:text-[2.1rem] font-bold text-white tracking-tight leading-snug">
                    Need help choosing your next step?
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
                    Our care team can help with remedies, schedules and ordering.
                  </p>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3.5 shrink-0">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-white text-forest-deep hover:bg-cream text-sm font-semibold shadow-sm transition-all hover:scale-102 cursor-pointer"
                  >
                    <span>Browse Remedies</span>
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-white/60 bg-white/10 text-white hover:bg-white hover:text-forest-deep text-sm font-semibold backdrop-blur-xs transition-all shadow-xs cursor-pointer"
                  >
                    Contact Care Team
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

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-8 sm:h-9 items-center rounded-full border px-3 sm:px-4 text-xs sm:text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none",
        active
          ? "border-forest bg-forest text-cream shadow-xs"
          : "border-line bg-paper text-ink hover:border-forest/40 hover:text-forest hover:bg-sage-wash/40",
      )}
    >
      {children}
    </Link>
  );
}

/** The consulting streams (GET /api/care/streams): which are open now, which come later. */
function Streams({ streams }: { streams: ApiConsultingStream[] }) {
  const open = streams.filter((stream) => stream.status === "OPEN");
  const later = streams.filter((stream) => stream.status !== "OPEN");

  return (
    <div className="mb-10 rounded-full border border-line-soft bg-paper/85 px-4 sm:px-6 py-2.5 sm:py-3 shadow-2xs backdrop-blur-sm">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-deep">
            <Activity className="size-4 text-forest" />
            <span>Consultation Stream:</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-forest/30 bg-forest/8 px-3.5 py-1 text-xs font-semibold text-forest-deep shadow-2xs">
            <span aria-hidden className="size-1.5 rounded-full bg-forest" />
            <span>{open[0]?.name ?? "Homeopathy"}</span>
            <ChevronDown className="size-3 text-forest/70" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-ink">
          <span className="hidden sm:inline-block h-3.5 w-px bg-line" />
          <Clock className="size-3.5 text-forest" />
          <span>More specialities coming soon</span>
        </div>
      </div>
    </div>
  );
}

const ALTERNATIVES = [
  {
    href: "/categories",
    icon: Leaf,
    title: "Browse by Health Concern",
    detail: "Doctor-curated remedies by wellness.",
    image: "/Images/doctors/concern-remedies.jpg",
  },
  {
    href: "/insights",
    icon: BookOpen,
    title: "Read Health Insights",
    detail: "Clinical homeopathy articles to guide your wellness.",
    image: "/Images/doctors/insights-books.jpg",
  },
  {
    href: "/contact",
    icon: Headset,
    title: "Contact Our Care Team",
    detail: "Inquire about upcoming doctor availability or remedies.",
    image: "/Images/doctors/care-support.jpg",
  },
] as const;

/**
 * Thoughtful Empty State:
 * Renders when no doctors are listed yet in the database.
 * Designed intentionally matching the high-fidelity editorial layout with 3 visual photo cards.
 */
function DirectoryOpeningSoon() {
  return (
    <div className="py-2">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start xl:gap-10">
        {/* Left Column: Announcement & CTAs */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-center pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-ink">
            Practitioner Onboarding
          </div>

          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-ink leading-[1.12]">
            Meet your<br className="hidden sm:inline" /> doctor soon
          </h2>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-ink">
            No doctors are currently available for booking as practitioners are completing credential verification and setting their
            schedules.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild variant="brand" size="xl" className="rounded-full shadow-soft hover:shadow-lift">
              <Link href="/products">
                Browse Remedies
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="brandOutline" size="xl" className="rounded-full">
              <Link href="/insights">
                <BookOpen aria-hidden className="size-4" />
                Health Insights
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Column: 3 Visual Photo Cards */}
        <div className="lg:col-span-8 xl:col-span-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {ALTERNATIVES.map(({ href, icon: Icon, title, detail, image }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line-soft bg-paper shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-forest/35 hover:shadow-soft"
              >
                {/* Visual Header with floating circular icon badge */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream/40">
                  <img
                    src={image}
                    alt={title}
                    draggable={false}
                    className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none select-none"
                  />
                  <span className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-paper/95 text-forest shadow-float backdrop-blur-xs transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-4" strokeWidth={1.8} />
                  </span>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm sm:text-[0.9375rem] font-bold text-ink leading-snug group-hover:text-forest transition-colors">
                        {title}
                      </h3>
                      <span className="grid size-6.5 shrink-0 place-items-center rounded-full border border-line-soft bg-canvas text-muted-ink transition-all duration-300 group-hover:border-forest group-hover:bg-forest group-hover:text-cream">
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-ink leading-relaxed">
                      {detail}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NoMatch({ query }: { query: string }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-line bg-paper/80 p-8 sm:p-12 text-center shadow-2xs">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-sage-wash text-forest">
        <Search aria-hidden className="size-6" strokeWidth={1.75} />
      </span>
      <h2 className="mt-5 font-display text-xl sm:text-2xl font-bold text-ink">No doctors match “{query}”</h2>
      <p className="mt-2 text-sm text-muted-ink max-w-md mx-auto">
        Try searching for a different doctor name, clinical specialization, or language.
      </p>
      <Button asChild variant="brandOutline" size="lg" className="mt-6 rounded-full">
        <Link href="/doctors">
          Show all doctors
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

/** Handled error when backend cannot be reached. */
function Unavailable({ query }: { query: string }) {
  return (
    <div role="alert" className="rounded-[1.75rem] border border-line bg-paper p-8 sm:p-12 text-center shadow-xs">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">We couldn’t load the doctors just now</h2>
      <p className="mt-2 text-sm text-muted-ink max-w-md mx-auto">
        This is a temporary connection issue reaching DocHomoeo care services. Please refresh to try again.
      </p>
      <Button asChild variant="brand" size="lg" className="mt-6 rounded-full">
        <Link href={query ? `/doctors?q=${encodeURIComponent(query)}` : "/doctors"}>
          <RotateCw aria-hidden className="size-4" />
          Try again
        </Link>
      </Button>
    </div>
  );
}
