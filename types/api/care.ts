/**
 * Public consultation data (backend/src/modules/care.routes.ts, `/api/care`).
 * Only doctors who are verified, accept consultations, are listed and have
 * working hours are returned.
 */
export interface ApiDoctorCard {
  id: number;
  slug: string;
  displayName: string;
  photoUrl: string | null;
  qualification: string | null;
  specialization: string | null;
  experienceYears: number | null;
  languages: string[];
  bio: string | null;
  clinicCity: string | null;
  /** Null when the doctor does not offer that mode. */
  videoFee: number | null;
  audioFee: number | null;
  slotMinutes: number;
  ratingAverage: number;
  ratingCount: number;
}

/** GET /api/care/doctors/:slug/next-slot */
export interface ApiNextSlot {
  /** ISO date-time. */
  startsAt: string;
  /** "10:30", in the clinic's time zone (IST). */
  time: string;
  /** YYYY-MM-DD */
  day: string;
}

/** GET /api/care/doctors/:slug — the card plus weekly working hours. */
export interface ApiDoctorDetail extends ApiDoctorCard {
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
}

/** GET /api/care/doctors/:slug/slots?date= */
export interface ApiDoctorSlot {
  startsAt: string;
  time: string;
  mode: string;
  available: boolean;
  /** Why it cannot be booked ("Doctor is away", "Booked"…), when not available. */
  reason: string | null;
}

/** GET /api/care/streams: the consulting streams, and whether each is open. */
export interface ApiConsultingStream {
  name: string;
  status: "OPEN" | "COMING_SOON" | string;
  description: string | null;
  specializations: { id: number; name: string; description: string | null }[];
}

/** The two modes the website can book (POST /api/me/appointments `mode`). */
export type ApiBookableMode = "VIDEO" | "AUDIO";

/** POST /api/me/appointments: holds a slot for 15 minutes until it is paid. */
export interface ApiBookingInput {
  doctorId: number;
  /** A slot's `startsAt`, exactly as GET …/slots returned it. */
  startsAt: string;
  mode: ApiBookableMode;
  patientName: string;
  patientAge: number;
  patientGender: "MALE" | "FEMALE" | "OTHER";
  /** At least 5 characters. */
  symptoms: string;
  /** Files uploaded with POST /api/me/consultation-files, at most 5. */
  fileIds?: number[];
}

export interface ApiBookingResult {
  id: number;
  appointmentNumber: string;
  fee: number;
}

/** POST /api/me/appointments/:id/pay. A gateway pay page when one is connected; null when paid at once (test mode). */
export interface ApiAppointmentPayResult {
  ok: true;
  payUrl: string | null;
}

/** A report or photo the patient added for the doctor (private; PDF, JPG, PNG or WebP, up to 5 MB). */
export interface ApiConsultationFile {
  id: number;
  fileName: string;
  kind: string;
  size: number;
}

export type ApiAppointmentStatus = "PENDING_PAYMENT" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

/** GET /api/me/appointments item. */
export interface ApiAppointment {
  id: number;
  appointmentNumber: string;
  patientName: string;
  mode: string;
  scheduledAt: string;
  durationMinutes: number;
  status: ApiAppointmentStatus;
  fee: number;
  /** Only handed out while the appointment is confirmed or in progress. */
  meetingUrl: string | null;
  symptoms: string;
  cancelledBy: string | null;
  cancelReason: string | null;
  files: ApiConsultationFile[];
  doctor: { displayName: string; photoUrl: string | null; specialization: string | null; slug: string };
  /** Only an issued prescription is returned. */
  prescription: { id: number; prescriptionNumber: string; status: string } | null;
  review: { rating: number } | null;
  paid: boolean;
  refunded: number;
  /** A held slot can be paid for 15 minutes, while it is still ahead. */
  canPay: boolean;
  /** Unpaid, or confirmed and at least 2 hours away. */
  canCancel: boolean;
  canRate: boolean;
}
