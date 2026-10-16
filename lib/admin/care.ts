import { api } from "@/lib/api";
import type {
  AdminDoctorCreateInput,
  AdminDoctorDetail,
  AdminDoctorInput,
  AdminDoctorList,
  AdminDoctorOnboarding,
  AdminDoctorReviewList,
  AdminDoctorTier,
  AdminPrescriptionDetail,
  AdminPrescriptionListItem,
  AdminSlot,
  AdminSpecialization,
  AdminStream,
  AdminStreamDetail,
  ConsultationMode,
  DocumentStatus,
  DocumentType,
  ReviewStatus,
  StreamStatus,
  VerificationDecision,
  VerificationStatus,
} from "@/types/api/admin-care";
import type { AdminPage } from "@/types/admin";

/**
 * Clinical care in the admin: doctors, streams and specialties, reviews of
 * doctors, prescriptions. Each call is one existing endpoint under
 * /api/admin (mounted in backend/src/app.ts); nothing is computed here that
 * the backend decides.
 */

// ─── doctors ──────────────────────────────────────────────────────────────────

export const listDoctors = (query: { q?: string; status?: VerificationStatus; page?: number; pageSize?: number }) =>
  api<AdminDoctorList>("/admin/doctors", { query });

export const getDoctor = (id: number) => api<AdminDoctorDetail>(`/admin/doctors/${id}`);

export const createDoctor = (input: AdminDoctorCreateInput) =>
  api<{ id: number }>("/admin/doctors", { method: "POST", body: input });

export const updateDoctor = (id: number, input: AdminDoctorInput) =>
  api<{ id: number }>(`/admin/doctors/${id}`, { method: "PATCH", body: input });

export const decideVerification = (id: number, decision: VerificationDecision, reason?: string) =>
  api<{ ok: true; verificationStatus: VerificationDecision }>(`/admin/doctors/${id}/verification`, {
    method: "PATCH",
    body: { decision, reason: reason?.trim() || undefined },
  });

export const setDoctorSwitches = (id: number, switches: { consulting?: boolean; wholesale?: boolean }) =>
  api<{ ok: true }>(`/admin/doctors/${id}/switches`, { method: "PATCH", body: switches });

export const addDoctorDocument = (id: number, document: { type: DocumentType; fileUrl: string; fileName: string | null }) =>
  api<unknown>(`/admin/doctors/${id}/documents`, { method: "POST", body: document });

export const reviewDoctorDocument = (id: number, documentId: number, status: DocumentStatus, remarks?: string) =>
  api<{ ok: true }>(`/admin/doctors/${id}/documents/${documentId}`, {
    method: "PATCH",
    body: { status, remarks: remarks?.trim() || null },
  });

export interface WorkingHour {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  mode: ConsultationMode;
}

export const saveWorkingHours = (id: number, slotMinutes: number, hours: WorkingHour[]) =>
  api<{ ok: true }>(`/admin/doctors/${id}/availability`, { method: "PUT", body: { slotMinutes, hours } });

export const getDoctorSlots = (id: number, date: string) =>
  api<{ date: string; slots: AdminSlot[] }>(`/admin/doctors/${id}/slots`, { query: { date } });

export const addTimeOff = (id: number, from: string, to: string, reason: string) =>
  api<unknown>(`/admin/doctors/${id}/time-off`, { method: "POST", body: { from, to, reason } });

export const removeTimeOff = (id: number, timeOffId: number) =>
  api<{ ok: true }>(`/admin/doctors/${id}/time-off/${timeOffId}`, { method: "DELETE" });

export const getOnboarding = (id: number) => api<AdminDoctorOnboarding>(`/admin/doctors/${id}/onboarding`);

export const updateOnboarding = (id: number, change: { tierId?: number | null; testPassed?: boolean }) =>
  api<AdminDoctorOnboarding>(`/admin/doctors/${id}/onboarding`, { method: "PATCH", body: change });

export const listTiers = () => api<{ items: AdminDoctorTier[] }>("/admin/doctor-tiers");

// ─── streams and specialties ──────────────────────────────────────────────────

export const listStreams = () => api<{ items: AdminStream[] }>("/admin/streams");

/** The stream with its specializations (the endpoint also returns its test questions). */
export const getStream = (id: number) => api<AdminStreamDetail>(`/admin/streams/${id}/questions`);

export interface StreamInput {
  name?: string;
  description?: string | null;
  status?: StreamStatus;
  isActive?: boolean;
}

export const createStream = (input: StreamInput & { name: string }) =>
  api<AdminStream>("/admin/streams", { method: "POST", body: input });

export const updateStream = (id: number, input: StreamInput) =>
  api<AdminStream & { doctorsRenamed: number; doctorsSwitchedOn: number }>(`/admin/streams/${id}`, { method: "PATCH", body: input });

export interface SpecializationInput {
  name?: string;
  description?: string | null;
  symptoms?: string[];
  isGeneral?: boolean;
  isActive?: boolean;
}

export const createSpecialization = (streamId: number, input: SpecializationInput & { name: string }) =>
  api<AdminSpecialization>(`/admin/streams/${streamId}/specializations`, { method: "POST", body: input });

export const updateSpecialization = (streamId: number, id: number, input: SpecializationInput) =>
  api<AdminSpecialization>(`/admin/streams/${streamId}/specializations/${id}`, { method: "PATCH", body: input });

export const deleteSpecialization = (streamId: number, id: number) =>
  api<{ ok: true }>(`/admin/streams/${streamId}/specializations/${id}`, { method: "DELETE" });

export const addStarterSpecializations = (streamId: number) =>
  api<Record<string, unknown>>(`/admin/streams/${streamId}/specializations/starter`, { method: "POST" });

// ─── reviews of doctors ───────────────────────────────────────────────────────

export const listDoctorReviews = (query: { q?: string; status?: ReviewStatus; rating?: number; doctorId?: number; page?: number }) =>
  api<AdminDoctorReviewList>("/admin/doctor-reviews", { query });

export const setDoctorReviewStatus = (id: number, status: ReviewStatus) =>
  api<{ ok: true; status: ReviewStatus }>(`/admin/doctor-reviews/${id}`, { method: "PATCH", body: { status } });

export const deleteDoctorReview = (id: number) => api<{ ok: true }>(`/admin/doctor-reviews/${id}`, { method: "DELETE" });

// ─── prescriptions ────────────────────────────────────────────────────────────

export const listPrescriptions = (query: { q?: string; from?: string; to?: string; page?: number }) =>
  api<AdminPage<AdminPrescriptionListItem>>("/admin/prescriptions", { query: { ...query, tz: STORE_ZONE } });

export const getPrescription = (id: number) => api<AdminPrescriptionDetail>(`/admin/prescriptions/${id}`);

/** The store's timezone; the backend's DEFAULT_ZONE (lib/time.ts). */
export const STORE_ZONE = "Asia/Kolkata";
