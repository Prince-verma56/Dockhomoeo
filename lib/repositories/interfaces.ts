import { ApiHomeResponse } from "@/types/api/home";
import { ApiProductDetail } from "@/types/api/product";
import { ApiProductListingResponse, ApiSearchFilters, ApiSuggestResponse } from "@/types/api/search";
import {
  ApiCheckoutPayload,
  ApiCheckoutResponse,
  ApiOrderDetail,
  ApiPaymentMethod,
  ApiQuote,
  ApiQuoteLineInput,
} from "@/types/api/cart";

export interface IHomeRepository {
  getHomeData(): Promise<ApiHomeResponse>;
}

export interface IProductRepository {
  getBySlug(slug: string): Promise<ApiProductDetail | null>;
  getRelated(productId: number): Promise<ApiProductDetail[]>;
}

export interface ISearchRepository {
  search(filters: ApiSearchFilters): Promise<ApiProductListingResponse>;
  suggest(query: string): Promise<ApiSuggestResponse>;
}

/**
 * The shop's cart and order boundary. Maps onto, and only onto:
 *   POST /api/shop/quote      — price a cart (coupon, payment method)
 *   POST /api/me/checkout     — place an order (signed in)
 *   GET  /api/me/orders/:id   — read one of my orders (signed in)
 *   POST /api/me/orders/:id/pay — reopen the payment page for an unpaid online order
 * Implementations throw CheckoutError (lib/checkout/checkoutForm) with a
 * customer-facing message and the HTTP status when the shop refuses.
 */
export interface ICartRepository {
  getQuote(lines: ApiQuoteLineInput[], couponCode?: string, paymentMethod?: ApiPaymentMethod): Promise<ApiQuote>;
  checkout(payload: ApiCheckoutPayload): Promise<ApiCheckoutResponse>;
  getOrder(orderId: number): Promise<ApiOrderDetail | null>;
  /** Resolves to the gateway's pay page; the browser goes there. */
  payOrder(orderId: number): Promise<{ payUrl: string }>;
}
import { ApiInsightDetail, ApiInsightListingResponse } from "@/types/api/insight";

export interface IInsightRepository {
  getInsights(page?: number, pageSize?: number, category?: string): Promise<ApiInsightListingResponse>;
  getBySlug(slug: string): Promise<ApiInsightDetail | null>;
  getRelated(slug: string): Promise<ApiInsightListingResponse>;
}

import type { ApiOtpRequestResult, ApiUser } from "@/types/api/auth";
import type { ApiAccountOverview, ApiAddress, ApiAddressInput, ApiOrderSummary, ApiProfileInput } from "@/types/api/account";

/**
 * Customer sign-in. Maps onto /api/auth (otp-auth.routes.ts). The session is
 * an HTTP-only cookie the backend sets and clears; nothing here returns or
 * stores a token. Implementations throw ApiError (lib/api) with the backend's
 * own message on refusal.
 */
export interface IAuthRepository {
  /** POST /auth/otp/request. A code goes to the mobile number, and to `email` when given. */
  requestOtp(phone: string, options?: { email?: string }): Promise<ApiOtpRequestResult>;
  /** POST /auth/otp/verify. Signs in; an unknown number becomes a new customer account. */
  verifyOtp(phone: string, code: string): Promise<ApiUser>;
  /** POST /auth/signup. Creates (or completes) an account with a confirmed mobile and email. */
  signUp(input: { phone: string; email: string; code: string }): Promise<ApiUser>;
  /** POST /auth/password-login. `identifier` is a mobile number or an email. */
  passwordLogin(identifier: string, password: string): Promise<ApiUser>;
  /** POST /auth/password, signed in. Sets or replaces the password. */
  setPassword(password: string): Promise<void>;
  /** POST /auth/user-logout. */
  logout(): Promise<void>;
  /** GET /auth/session; null when signed out. */
  getCurrentUser(): Promise<ApiUser | null>;
}

/** The signed-in customer's own data under /api/me. */
export interface IAccountRepository {
  /** GET /me/overview */
  getOverview(): Promise<ApiAccountOverview>;
  /** PATCH /me/profile, then the session is read again and returned. */
  updateProfile(input: ApiProfileInput): Promise<ApiUser>;

  /** GET /me/addresses */
  getAddresses(): Promise<ApiAddress[]>;
  /** POST /me/addresses; resolves to the new id. */
  addAddress(input: ApiAddressInput): Promise<number>;
  /** PATCH /me/addresses/:id */
  updateAddress(id: number, input: Partial<ApiAddressInput>): Promise<void>;
  /** DELETE /me/addresses/:id */
  deleteAddress(id: number): Promise<void>;
  /** PATCH /me/addresses/:id { isDefault: true } */
  setDefaultAddress(id: number): Promise<void>;

  /** GET /me/orders (the latest 50). */
  getOrders(): Promise<ApiOrderSummary[]>;
  /** GET /me/orders/:id; null when it is not this customer's order. */
  getOrderById(id: number): Promise<ApiOrderDetail | null>;
}
import { ApiPrescription } from "@/types/api/prescription";
import { ApiServiceabilityResult } from "@/types/api/serviceability";

export interface IServiceabilityRepository {
  checkPincode(pincode: string): Promise<ApiServiceabilityResult>;
}

export interface IPrescriptionRepository {
  getPrescriptions(): Promise<ApiPrescription[]>;
}

import type {
  ApiAppointment,
  ApiAppointmentPayResult,
  ApiBookingInput,
  ApiBookingResult,
  ApiConsultationFile,
  ApiConsultingStream,
  ApiDoctorCard,
  ApiDoctorDetail,
  ApiDoctorSlot,
  ApiNextSlot,
} from "@/types/api/care";

/**
 * Public consultation data (GET /api/care/*). Read-only: booking, slots for a
 * chosen day and payments belong to the consultation phase.
 */
export interface ICareRepository {
  /** GET /care/doctors?q= — verified doctors taking consultations. */
  listDoctors(query?: string): Promise<ApiDoctorCard[]>;
  /** GET /care/doctors/:slug/next-slot — the next free slot, or null. */
  getNextSlot(slug: string): Promise<ApiNextSlot | null>;
  /** GET /care/doctors/:slug — null when not listed (404). */
  getDoctor(slug: string): Promise<ApiDoctorDetail | null>;
  /** GET /care/doctors/:slug/slots?date=YYYY-MM-DD */
  getSlots(slug: string, date: string): Promise<ApiDoctorSlot[]>;
  /** GET /care/streams — consulting streams and whether each is open. */
  getStreams(): Promise<ApiConsultingStream[]>;
}

/** The signed-in patient's consultations (`/api/me`, care.routes.ts and consultation-files.routes.ts). */
export interface IConsultationRepository {
  /** POST /me/appointments — holds the slot for 15 minutes. */
  book(input: ApiBookingInput): Promise<ApiBookingResult>;
  /** POST /me/appointments/:id/pay */
  pay(id: number): Promise<ApiAppointmentPayResult>;
  /** POST /me/appointments/:id/cancel */
  cancel(id: number): Promise<{ ok: true; refundDue: boolean }>;
  /** POST /me/appointments/:id/review — once, after a completed consultation. */
  rate(id: number, rating: number, comment: string | null): Promise<void>;
  /** GET /me/appointments */
  list(): Promise<ApiAppointment[]>;
  /** POST /me/consultation-files (multipart `file`) */
  uploadFile(file: File): Promise<ApiConsultationFile>;
  /** DELETE /me/consultation-files/:id — only a file not yet attached to a booking. */
  removeFile(id: number): Promise<void>;
}
