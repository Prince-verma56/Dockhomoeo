/**
 * The customer session, exactly as the backend returns it
 * (backend/src/modules/otp-auth.routes.ts, `sessionUser`). The session itself
 * is an HTTP-only cookie (`dh_user`) that the browser never reads; these are
 * only the details of whoever it belongs to.
 */
export type ApiUserRole = "CUSTOMER" | "DOCTOR";
export type ApiGender = "MALE" | "FEMALE" | "OTHER";

export interface ApiUser {
  id: number;
  role: ApiUserRole;
  phone: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: ApiGender | null;
  /** YYYY-MM-DD */
  dateOfBirth: string | null;
  /** First and last name joined, or a doctor's display name. */
  name: string | null;
  hasPassword: boolean;
  doctor: { id: number; verificationStatus: string; consulting: boolean } | null;
  /** True for an approved wholesale (B2B) account. */
  wholesale: boolean;
}

/** Why the customer is signed out, so the UI can say the right thing. */
export type ApiSignedOutReason = "logout" | "expired" | null;

export interface ApiAuthState {
  isAuthenticated: boolean;
  user: ApiUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  reason: ApiSignedOutReason;
}

/** POST /api/auth/otp/request. `testMode` is true while the backend uses a fixed development code and sends nothing. */
export interface ApiOtpRequestResult {
  ok: boolean;
  testMode: boolean;
}
