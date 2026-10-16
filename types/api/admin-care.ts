/**
 * The admin's clinical-care contracts, in the backend's exact shapes:
 * - doctors: backend/src/modules/doctors.routes.ts (list, verification),
 *   doctor-admin.routes.ts (register, edit, documents, hours, time off),
 *   onboarding-admin.routes.ts (onboarding state, streams, levels, reviews);
 * - prescriptions: consult-admin.routes.ts.
 * Money and experience arrive as numbers (`num`/`numOrNull` on the backend).
 */
import type { AdminPage } from "@/types/admin";

export type VerificationStatus = "DRAFT" | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";
/** The decisions `PATCH /admin/doctors/:id/verification` accepts. */
export type VerificationDecision = "APPROVED" | "REJECTED" | "SUSPENDED" | "UNDER_REVIEW";
export type ConsultationMode = "VIDEO" | "AUDIO" | "CHAT" | "IN_CLINIC";
export type DocumentType =
  | "DEGREE_CERTIFICATE"
  | "REGISTRATION_CERTIFICATE"
  | "GOVERNMENT_ID"
  | "CLINIC_PROOF"
  | "GST_CERTIFICATE"
  | "DRUG_LICENSE"
  | "SHOP_LICENSE"
  | "PHOTO"
  | "OTHER";
export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED";
export type WholesaleStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";

/** GET /api/admin/doctors */
export interface AdminDoctorListItem {
  id: number;
  displayName: string;
  photoUrl: string | null;
  qualification: string | null;
  specialization: string | null;
  experienceYears: number | null;
  languages: string[];
  registrationNumber: string | null;
  verificationStatus: VerificationStatus;
  acceptsConsultations: boolean;
  videoFee: number | null;
  audioFee: number | null;
  createdAt: string;
  phone: string | null;
  email: string | null;
  wholesaleStatus: WholesaleStatus | null;
  documentCount: number;
  appointmentCount: number;
}

export interface AdminDoctorList extends AdminPage<AdminDoctorListItem> {
  /** Per status, for the tabs; follows the search but not the status filter. */
  statusCounts: Partial<Record<VerificationStatus, number>>;
}

export interface AdminDoctorDocument {
  id: number;
  type: DocumentType;
  fileUrl: string;
  fileName: string | null;
  documentNumber: string | null;
  status: DocumentStatus;
  remarks: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface AdminAvailability {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  mode: ConsultationMode;
  isActive: boolean;
}

export interface AdminTimeOff {
  id: number;
  startsAt: string;
  endsAt: string;
  reason: string | null;
}

/** GET /api/admin/doctors/:id (bank details are also returned; the panel never shows them). */
export interface AdminDoctorDetail {
  id: number;
  slug: string;
  displayName: string;
  photoUrl: string | null;
  stream: string | null;
  qualification: string | null;
  specialization: string | null;
  specializationId: number | null;
  experienceYears: number | null;
  languages: string[];
  bio: string | null;
  registrationNumber: string | null;
  registrationCouncil: string | null;
  registrationYear: number | null;
  clinicName: string | null;
  clinicAddress: string | null;
  clinicCity: string | null;
  clinicState: string | null;
  clinicPincode: string | null;
  verificationStatus: VerificationStatus;
  submittedAt: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  acceptsConsultations: boolean;
  isListed: boolean;
  videoFee: number | null;
  audioFee: number | null;
  slotMinutes: number;
  commissionPercent: number;
  ratingAverage: number;
  ratingCount: number;
  testPassedAt: string | null;
  tierId: number | null;
  createdAt: string;
  updatedAt: string;
  phone: string | null;
  email: string | null;
  /** Same as acceptsConsultations. */
  consulting: boolean;
  wholesale: { id: number; status: WholesaleStatus; tier: string | null } | null;
  appointmentCount: number;
  prescriptionCount: number;
  documents: AdminDoctorDocument[];
  availability: AdminAvailability[];
  /** Only time off that has not ended yet. */
  timeOff: AdminTimeOff[];
}

/** The body of POST /api/admin/doctors and PATCH /api/admin/doctors/:id (doctorInput). */
export interface AdminDoctorInput {
  displayName: string;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  stream: string | null;
  qualification: string | null;
  specialization: string | null;
  specializationId: number | null;
  experienceYears: number | null;
  languages: string[];
  bio: string | null;
  registrationNumber: string | null;
  registrationCouncil: string | null;
  registrationYear: number | null;
  clinicName: string | null;
  clinicAddress: string | null;
  clinicCity: string | null;
  clinicState: string | null;
  clinicPincode: string | null;
  videoFee: number | null;
  audioFee: number | null;
  slotMinutes: number;
  commissionPercent: number;
  /** Offer consultations; only accepted for a verified doctor. */
  consulting: boolean;
  wholesale: boolean;
}

export interface AdminDoctorCreateInput extends AdminDoctorInput {
  approveNow: boolean;
  documents: { type: DocumentType; fileUrl: string; fileName: string | null }[];
}

/** GET /api/admin/doctors/:id/onboarding (onboardingOut). */
export interface AdminDoctorOnboarding {
  stream: { id: number; name: string; status: StreamStatus; questionsPerTest: number; passPercent: number } | null;
  specialization: { id: number; name: string } | null;
  verified: boolean;
  verificationStatus: VerificationStatus;
  testRequired: boolean;
  testPassed: boolean;
  streamOpen: boolean;
  hasFee: boolean;
  /** isListed: the wish to consult, remembered until every step is done. */
  wantsToConsult: boolean;
  consulting: boolean;
  ready: boolean;
  streamName: string | null;
  testPassedAt: string | null;
  tierId: number | null;
  tier: { id: number; name: string; description: string | null; minPatientsPerDay: number; maxPatientsPerDay: number; commissionPercent: number } | null;
  commissionPercent: number;
  ratingAverage: number;
  ratingCount: number;
  attempts: { id: number; score: number; total: number; passed: boolean; startedAt: string; submittedAt: string | null; streamName: string }[];
  /** Only on the PATCH answer. */
  consultingSwitchedOn?: boolean;
}

/** GET /api/admin/doctors/:id/slots answers `{ date, slots }` with the public slot shape (lib/slots.ts). */
export type { ApiDoctorSlot as AdminSlot } from "@/types/api/care";

// ─── streams and specializations ──────────────────────────────────────────────

export type StreamStatus = "OPEN" | "COMING_SOON" | "CLOSED";

export interface AdminStream {
  id: number;
  name: string;
  description: string | null;
  status: StreamStatus;
  questionsPerTest: number;
  passPercent: number;
  sortOrder: number;
  isActive: boolean;
  questionCount: number;
  specializationCount: number;
  activeQuestionCount: number;
  doctorCount: number;
  passedCount: number;
}

export interface AdminSpecialization {
  id: number;
  streamId: number;
  name: string;
  description: string | null;
  symptoms: string[];
  isGeneral: boolean;
  sortOrder: number;
  isActive: boolean;
  activeQuestionCount: number;
  doctorCount: number;
}

/** GET /api/admin/streams/:id/questions; the panel reads its specializations. */
export interface AdminStreamDetail {
  stream: AdminStream;
  /** True when the backend has a ready-made specialization set for this stream. */
  starterSet: boolean;
  specializations: AdminSpecialization[];
}

/** GET /api/admin/doctor-tiers */
export interface AdminDoctorTier {
  id: number;
  name: string;
  description: string | null;
  minPatientsPerDay: number;
  maxPatientsPerDay: number;
  commissionPercent: number;
  isActive: boolean;
  doctorCount: number;
}

// ─── reviews of doctors ───────────────────────────────────────────────────────

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminDoctorReview {
  id: number;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
  doctorId: number;
  appointmentId: number;
  doctorName: string;
  doctorPhotoUrl: string | null;
  patientName: string | null;
  patientPhone: string | null;
  appointmentNumber: string;
  consultedAt: string;
}

export interface AdminDoctorReviewList extends AdminPage<AdminDoctorReview> {
  statusCounts: Partial<Record<ReviewStatus, number>>;
  /** Only doctors who have been reviewed, for the filter. */
  doctors: { id: number; name: string }[];
}

// ─── prescriptions (issued only) ──────────────────────────────────────────────

export interface AdminPrescriptionListItem {
  id: number;
  prescriptionNumber: string;
  issuedAt: string | null;
  patientName: string;
  diagnosis: string | null;
  patientPhone: string | null;
  doctorId: number;
  doctorName: string;
  medicineCount: number;
  orderCount: number;
}

export interface AdminPrescriptionDetail {
  id: number;
  prescriptionNumber: string;
  patientName: string;
  diagnosis: string | null;
  advice: string | null;
  issuedAt: string | null;
  followUpDate: string | null;
  doctor: { id: number; name: string; qualification: string | null; specialization: string | null; registrationNumber: string | null };
  bookedBy: { id: number; name: string | null; phone: string | null };
  appointment: { id: number; appointmentNumber: string; scheduledAt: string; mode: ConsultationMode; patientAge: number | null; patientGender: string | null; symptoms: string | null } | null;
  items: {
    id: number;
    medicineName: string;
    potency: string | null;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
    instructions: string | null;
    quantity: number;
    variantId: number | null;
  }[];
  orders: { id: number; orderNumber: string; status: string; paymentStatus: string; grandTotal: number; placedAt: string }[];
}
