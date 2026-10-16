import type { StatusTone } from "@/lib/account/orderStatus";
import type { ApiAppointmentStatus, ApiBookableMode, ApiDoctorCard } from "@/types/api/care";

/** Doctors' hours and slots are in India time (backend/src/lib/slots.ts). */
export const IST = "Asia/Kolkata";

/** The modes the website books (POST /api/me/appointments accepts VIDEO or AUDIO). */
export const BOOKABLE_MODES: readonly ApiBookableMode[] = ["VIDEO", "AUDIO"];

export const MODE_LABEL: Record<string, string> = { VIDEO: "Video", AUDIO: "Audio", CHAT: "Chat", IN_CLINIC: "In clinic" };

type Fees = Pick<ApiDoctorCard, "videoFee" | "audioFee">;

export const feeFor = (doctor: Fees, mode: ApiBookableMode) => (mode === "VIDEO" ? doctor.videoFee : doctor.audioFee);

/** The modes this doctor charges for, so can be booked in. */
export const offeredModes = (doctor: Fees) => BOOKABLE_MODES.filter((mode) => feeFor(doctor, mode) !== null);

export function lowestFee(doctor: Fees): number | null {
  const fees = offeredModes(doctor).map((mode) => feeFor(doctor, mode) as number);
  return fees.length ? Math.min(...fees) : null;
}

export const isBookableMode = (mode: string): mode is ApiBookableMode => (BOOKABLE_MODES as readonly string[]).includes(mode);

const istDay = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(date);

/** "Today, 5:30 pm", "Tomorrow, 10:00 am" or "Thu 17 Oct, 10:00 am", in India time. */
export function istWhen(iso: string, now: Date = new Date()): string {
  const at = new Date(iso);
  const time = new Intl.DateTimeFormat("en-IN", { timeZone: IST, hour: "numeric", minute: "2-digit" }).format(at);
  if (istDay(at) === istDay(now)) return `Today, ${time}`;
  if (istDay(at) === istDay(new Date(now.getTime() + 86_400_000))) return `Tomorrow, ${time}`;
  const day = new Intl.DateTimeFormat("en-IN", { timeZone: IST, weekday: "short", day: "numeric", month: "short" }).format(at);
  return `${day}, ${time}`;
}

/** Every backend appointment status (prisma `AppointmentStatus`) in the patient's words. */
const STATUS: Record<ApiAppointmentStatus, { label: string; tone: StatusTone }> = {
  PENDING_PAYMENT: { label: "Awaiting payment", tone: "warning" },
  CONFIRMED: { label: "Booked", tone: "progress" },
  IN_PROGRESS: { label: "In progress", tone: "progress" },
  COMPLETED: { label: "Completed", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
  NO_SHOW: { label: "Missed", tone: "danger" },
};

export function appointmentStatus(status: string): { label: string; tone: StatusTone } {
  return STATUS[status as ApiAppointmentStatus] ?? { label: status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " "), tone: "neutral" };
}

/** Files a booking accepts (backend/src/modules/consultation-files.routes.ts). */
export const CONSULTATION_FILES = {
  accept: "application/pdf,image/jpeg,image/png,image/webp",
  maxBytes: 5 * 1024 * 1024,
  maxCount: 5,
  /** For people: what may be added. */
  describe: "PDF, JPG, PNG or WebP, up to 5 MB each, at most 5 files",
} as const;

/** How long the backend holds an unpaid slot. */
export const HOLD_MINUTES = 15;
/** A booked consultation can be cancelled until this many hours before it starts. */
export const CANCEL_HOURS = 2;
