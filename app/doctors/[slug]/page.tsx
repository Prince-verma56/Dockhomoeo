import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Languages, MapPin, Phone, ShieldCheck, Star, Video } from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { DoctorAvatar } from "@/components/doctors/DoctorAvatar";
import { BookingPanel } from "@/sections/doctors/BookingPanel";
import { repositories } from "@/lib/repositories";
import { getDoctor } from "@/lib/care/doctor";
import { formatRupees } from "@/lib/formatters/price";
import { cn } from "@/lib/utils";

const ZONE = "Asia/Kolkata";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
/** How many days ahead the availability strip offers. */
const DAYS_AHEAD = 7;

/** YYYY-MM-DD in India time, `offset` days from today. */
const istDay = (offset: number) => new Intl.DateTimeFormat("en-CA", { timeZone: ZONE }).format(new Date(Date.now() + offset * 86_400_000));

/** "10:00" → "10:00 am" */
const clock = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
};

export async function generateMetadata({ params }: PageProps<"/doctors/[slug]">): Promise<Metadata> {
  const doctor = await getDoctor((await params).slug);
  if (!doctor) return { title: "Doctor not found", robots: { index: false, follow: true } };
  const about = [doctor.qualification, doctor.specialization].filter(Boolean).join(", ");
  return {
    title: doctor.displayName,
    description: `${doctor.displayName}${about ? `, ${about}` : ""}: homoeopathic consultations on DocHomoeo.`,
    alternates: { canonical: `/doctors/${doctor.slug}` },
  };
}

/**
 * One verified doctor (GET /api/care/doctors/:slug) and their free slots for a
 * chosen day (GET /api/care/doctors/:slug/slots). The day is in the URL, so
 * refresh, Back and shared links all show the same day; `?slot=` keeps a
 * chosen time through signing in. A free time is booked in BookingPanel
 * (POST /api/me/appointments), which the backend checks again.
 */
export default async function DoctorPage({ params, searchParams }: PageProps<"/doctors/[slug]">) {
  const { slug } = await params;
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => istDay(i));
  const raw = (await searchParams).date;
  const requested = Array.isArray(raw) ? raw[0] : raw;
  const date = requested && days.includes(requested) ? requested : days[0];
  const rawSlot = (await searchParams).slot;
  const slotParam = (Array.isArray(rawSlot) ? rawSlot[0] : rawSlot) ?? null;

  const doctor = await getDoctor(slug);
  if (!doctor) notFound();
  const slots = await repositories.care.getSlots(slug, date);

  const hoursByDay = DAYS.map((name, day) => ({
    name,
    ranges: doctor.availability.filter((a) => a.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime)),
  })).filter((d) => d.ranges.length > 0);

  const dayLabel = (iso: string, index: number) =>
    index === 0
      ? "Today"
      : index === 1
        ? "Tomorrow"
        : new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", weekday: "short", day: "numeric" }).format(new Date(`${iso}T00:00:00Z`));

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas">
        <section className="dh-head-arc dh-page-top">
          <Container width="wide">
            <PageBreadcrumb items={[{ name: "Doctors", href: "/doctors" }, { name: doctor.displayName, href: `/doctors/${doctor.slug}` }]} className="mb-6" />
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <DoctorAvatar photoUrl={doctor.photoUrl} className="size-24 ring-4 ring-paper" />
              <div>
                <h1 className="dh-title-page text-ink">{doctor.displayName}</h1>
                <p className="mt-2 text-base text-muted-ink">
                  {[doctor.qualification, doctor.specialization].filter(Boolean).join(" · ") || "Homoeopathic doctor"}
                </p>
                {doctor.ratingCount > 0 ? (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-ink">
                    <Star aria-hidden className="size-4 fill-amber-500 text-amber-500" />
                    {doctor.ratingAverage.toFixed(1)} from {doctor.ratingCount} {doctor.ratingCount === 1 ? "rating" : "ratings"}
                  </p>
                ) : null}
              </div>
            </div>
          </Container>
        </section>

        <Container width="wide" className="dh-section-b">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="space-y-8">
              {doctor.bio ? (
                <section aria-labelledby="about-heading" className="rounded-[1.5rem] border border-line/70 bg-paper p-6 shadow-xs sm:p-8">
                  <h2 id="about-heading" className="font-display text-xl text-ink">About</h2>
                  <p className="mt-3 leading-relaxed whitespace-pre-line text-ink">{doctor.bio}</p>
                </section>
              ) : null}

              <section aria-labelledby="slots-heading" className="rounded-[1.5rem] border border-line/70 bg-paper p-6 shadow-xs sm:p-8">
                <h2 id="slots-heading" className="flex items-center gap-2 font-display text-xl text-ink">
                  <CalendarDays aria-hidden className="size-5 text-forest" strokeWidth={1.7} />
                  Book a time
                </h2>
                <nav aria-label="Choose a day" className="-mx-1 mt-4 overflow-x-auto px-1">
                  <ul className="flex gap-2">
                    {days.map((day, index) => (
                      <li key={day} className="shrink-0">
                        <Link
                          href={`/doctors/${doctor.slug}${index === 0 ? "" : `?date=${day}`}`}
                          scroll={false}
                          aria-current={day === date ? "date" : undefined}
                          className={cn(
                            "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none",
                            day === date ? "border-forest bg-forest text-cream" : "border-line bg-cream text-ink hover:border-forest/40",
                          )}
                        >
                          {dayLabel(day, index)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <BookingPanel key={date} doctor={doctor} date={date} slots={slots} initialSlot={slotParam} />
              </section>
            </div>

            <aside className="space-y-5">
              <p className="flex items-start gap-3 rounded-[1.25rem] border border-forest/15 bg-forest/6 px-5 py-4 text-sm text-ink">
                <ShieldCheck aria-hidden className="mt-0.5 size-4.5 shrink-0 text-forest" />
                <span>
                  Verified by DocHomoeo before they could consult. After your call, the prescription they write appears in your account.
                </span>
              </p>
              <div className="rounded-[1.5rem] border border-line/70 bg-paper p-6 shadow-xs">
                <h2 className="font-display text-lg text-ink">Consultation</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  {doctor.videoFee !== null ? (
                    <li className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-ink"><Video aria-hidden className="size-4 text-forest" /> Video</span>
                      <span className="font-semibold text-ink tabular-nums">{formatRupees(doctor.videoFee)}</span>
                    </li>
                  ) : null}
                  {doctor.audioFee !== null ? (
                    <li className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-ink"><Phone aria-hidden className="size-4 text-forest" /> Audio</span>
                      <span className="font-semibold text-ink tabular-nums">{formatRupees(doctor.audioFee)}</span>
                    </li>
                  ) : null}
                  <li className="flex items-center gap-2 text-muted-ink"><Clock aria-hidden className="size-4 text-forest" /> {doctor.slotMinutes}-minute consultation</li>
                  {doctor.experienceYears !== null ? <li className="text-muted-ink">{doctor.experienceYears} years of practice</li> : null}
                  {doctor.languages.length ? (
                    <li className="flex items-center gap-2 text-muted-ink"><Languages aria-hidden className="size-4 text-forest" /> {doctor.languages.join(", ")}</li>
                  ) : null}
                  {doctor.clinicCity ? <li className="flex items-center gap-2 text-muted-ink"><MapPin aria-hidden className="size-4 text-forest" /> {doctor.clinicCity}</li> : null}
                </ul>
              </div>

              {hoursByDay.length ? (
                <div className="rounded-[1.5rem] border border-line/70 bg-paper p-6 shadow-xs">
                  <h2 className="font-display text-lg text-ink">Weekly hours</h2>
                  <dl className="mt-4 space-y-2 text-sm">
                    {hoursByDay.map((day) => (
                      <div key={day.name} className="flex justify-between gap-3">
                        <dt className="text-muted-ink">{day.name}</dt>
                        <dd className="text-right text-ink tabular-nums">
                          {day.ranges.map((r) => `${clock(r.startTime)} – ${clock(r.endTime)}`).join(", ")}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </aside>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
