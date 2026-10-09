export interface ApiPrescriptionSummary {
  id: string;
  patientName: string;
  doctorName: string;
  issuedAt: string;
  validUntil: string;
  status: "ACTIVE" | "EXPIRED" | "USED";
  items: { productName: string; dosage: string }[];
}
export interface ApiPrescription {
  id: string;
  patientId?: string | number;
  patientName?: string;
  doctorName?: string;
  issuedAt?: string;
  validUntil?: string;
  status: "ACTIVE" | "EXPIRED" | "USED" | "VERIFIED" | "PENDING";
  items?: { productName: string; dosage: string }[];
  fileName?: string;
  fileUrl?: string;
  uploadedAt?: string;
  notes?: string;
}
