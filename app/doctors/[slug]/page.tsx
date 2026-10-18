import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { DoctorDetailClient } from "@/sections/doctors/DoctorDetailClient";
import { repositories } from "@/lib/repositories";
import { getDoctor } from "@/lib/care/doctor";

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

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[#fbfaf6] dark:bg-[#07130e]">
        <DoctorDetailClient
          doctor={doctor}
          days={days}
          date={date}
          slots={slots}
          slotParam={slotParam}
          hoursByDay={hoursByDay}
        />
      </main>
      <SiteFooter />
    </>
  );
}
