import { redirect } from "next/navigation";

/**
 * Where the backend sends a patient back after paying a consultation fee on
 * the gateway (`returnTo: "/patient/consultations"` in
 * backend/src/modules/care.routes.ts, then "?payment=success|pending|failed").
 * This site's list of consultations lives at /account/consultations, so the
 * visit is forwarded there with that one value; the page then shows each
 * appointment's real status.
 */
export default async function PatientConsultationsReturn({ searchParams }: PageProps<"/patient/consultations">) {
  const raw = (await searchParams).payment;
  const payment = Array.isArray(raw) ? raw[0] : raw;
  redirect(payment === "success" || payment === "pending" || payment === "failed" ? `/account/consultations?payment=${payment}` : "/account/consultations");
}
