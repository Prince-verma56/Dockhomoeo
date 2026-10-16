import type { ConsultationMode, DocumentType, VerificationStatus } from "@/types/api/admin-care";

/** Staff-facing words for the backend's enums. */

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  DRAFT: "Registration started",
  PENDING: "Waiting for review",
  UNDER_REVIEW: "Under review",
  APPROVED: "Verified",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

export const VERIFICATION_TONE: Record<VerificationStatus, string> = {
  DRAFT: "bg-neutral-100 text-neutral-700 border-neutral-200",
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  UNDER_REVIEW: "bg-sky-50 text-sky-800 border-sky-200",
  APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 border-rose-200",
  SUSPENDED: "bg-rose-50 text-rose-800 border-rose-200",
};

export const DOCUMENT_LABEL: Record<DocumentType, string> = {
  DEGREE_CERTIFICATE: "Degree certificate",
  REGISTRATION_CERTIFICATE: "Registration certificate",
  GOVERNMENT_ID: "Government ID",
  CLINIC_PROOF: "Clinic proof",
  GST_CERTIFICATE: "GST certificate",
  DRUG_LICENSE: "Drug licence",
  SHOP_LICENSE: "Shop licence",
  PHOTO: "Photo",
  OTHER: "Other",
};

export const MODE_LABEL: Record<ConsultationMode, string> = {
  VIDEO: "Video",
  AUDIO: "Audio",
  CHAT: "Chat",
  IN_CLINIC: "In clinic",
};

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
