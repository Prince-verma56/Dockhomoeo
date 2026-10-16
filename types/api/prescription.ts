/**
 * GET /api/me/prescriptions (care.routes.ts). Prescriptions are written by a
 * DocHomoeo doctor after a consultation; the backend returns issued ones only.
 * There is no customer upload.
 */
export interface ApiPrescriptionItem {
  id: number;
  medicineName: string;
  potency: string | null;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  quantity: number;
  /** What can be bought here, when the medicine is one the shop sells. */
  buy: { variantId: number; productName: string; title: string; price: number; inStock: boolean; imageUrl: string | null } | null;
}

export interface ApiPrescription {
  id: number;
  prescriptionNumber: string;
  patientName: string;
  diagnosis: string | null;
  advice: string | null;
  followUpDate: string | null;
  issuedAt: string;
  doctor: { displayName: string; qualification: string | null; registrationNumber: string | null };
  orders: { id: number; orderNumber: string; status: string }[];
  items: ApiPrescriptionItem[];
}
