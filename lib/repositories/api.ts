/**
 * Live API repository implementations.
 *
 * Each class implements the same interface as the Local* counterpart in
 * local.ts. The UI only touches the interface, so no page or component needs
 * to change when we flip index.ts to use these classes.
 *
 * All calls go through Next.js /api/* rewrites → Express backend (port 4000).
 * The shared `api()` helper (lib/api.ts) handles credentials, JSON parsing
 * and error normalisation.
 */

import { api, ApiError, describeError } from "@/lib/api";
import { CheckoutError } from "@/lib/checkout/checkoutForm";
import type {
  IHomeRepository,
  IProductRepository,
  ISearchRepository,
  ICartRepository,
  IServiceabilityRepository,
  IAuthRepository,
  IAccountRepository,
  IPrescriptionRepository,
  IInsightRepository,
  ICareRepository,
  IConsultationRepository,
} from "./interfaces";
import type { ApiHomeResponse } from "@/types/api/home";
import type { ApiProductDetail } from "@/types/api/product";
import type {
  ApiProductListingResponse,
  ApiSearchFilters,
  ApiSuggestResponse,
} from "@/types/api/search";
import type {
  ApiCheckoutPayload,
  ApiCheckoutResponse,
  ApiOrderDetail,
  ApiPaymentMethod,
  ApiQuote,
  ApiQuoteLineInput,
} from "@/types/api/cart";
import type { ApiServiceabilityResult } from "@/types/api/serviceability";
import type { ApiOtpRequestResult, ApiUser } from "@/types/api/auth";
import type {
  ApiAccountOverview,
  ApiAddress,
  ApiAddressInput,
  ApiOrderSummary,
  ApiProfileInput,
} from "@/types/api/account";
import type { ApiPrescription } from "@/types/api/prescription";
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
import { MAX_INSIGHT_PAGE_SIZE, type ApiInsightDetail, type ApiInsightListingResponse } from "@/types/api/insight";

// ─── Home ────────────────────────────────────────────────────────────────────

export class ApiHomeRepository implements IHomeRepository {
  async getHomeData(): Promise<ApiHomeResponse> {
    return api<ApiHomeResponse>("/shop/home");
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export class ApiProductRepository implements IProductRepository {
  async getBySlug(slug: string): Promise<ApiProductDetail | null> {
    try {
      return await api<ApiProductDetail>(`/shop/products/${encodeURIComponent(slug)}`);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 404) return null;
      throw err;
    }
  }

  async getRelated(productId: number): Promise<ApiProductDetail[]> {
    // The backend returns related cards inside the product detail response.
    // We don't have a standalone "related products" endpoint, so this method
    // is kept for interface compatibility but is not called by the UI directly
    // (the product detail page reads product.related from getBySlug instead).
    void productId;
    return [];
  }
}

// ─── Search / Listing ────────────────────────────────────────────────────────

/** Converts array-valued filters to comma-separated strings for the backend. */
const toQuery = (
  filters: ApiSearchFilters,
): Record<string, string | number | boolean | undefined | null> => ({
  q: filters.q,
  category: filters.category,
  brand: filters.brand?.join(","),
  form: filters.form?.join(","),
  potency: filters.potency?.join(","),
  pack: filters.pack?.join(","),
  minPrice: filters.minPrice,
  maxPrice: filters.maxPrice,
  discount: filters.discount,
  rating: filters.rating,
  inStock:
    filters.inStock !== undefined ? (filters.inStock ? "1" : undefined) : undefined,
  sort: filters.sort,
  page: filters.page,
  pageSize: filters.pageSize,
});

export class ApiSearchRepository implements ISearchRepository {
  async search(filters: ApiSearchFilters): Promise<ApiProductListingResponse> {
    return api<ApiProductListingResponse>("/shop/products", {
      query: toQuery(filters),
    });
  }

  async suggest(query: string): Promise<ApiSuggestResponse> {
    return api<ApiSuggestResponse>("/shop/suggest", { query: { q: query } });
  }
}

// ─── Cart & Checkout ──────────────────────────────────────────────────────────

/**
 * A refusal from the shop as a CheckoutError carrying the backend's own words
 * and status (409 prices or stock moved, 400 bad input, 401 signed out,
 * 501 online payment not connected). A network failure becomes status 0.
 */
const asCheckoutError = (error: unknown, fallback: string): never => {
  if (error instanceof ApiError) throw new CheckoutError(describeError(error, fallback), error.status);
  throw new CheckoutError(fallback, 0);
};

export class ApiCartRepository implements ICartRepository {
  async getQuote(
    lines: ApiQuoteLineInput[],
    couponCode?: string,
    paymentMethod?: ApiPaymentMethod,
  ): Promise<ApiQuote> {
    return api<ApiQuote>("/shop/quote", {
      method: "POST",
      body: { lines, couponCode, paymentMethod: paymentMethod ?? "COD" },
    });
  }

  async checkout(payload: ApiCheckoutPayload): Promise<ApiCheckoutResponse> {
    try {
      return await api<ApiCheckoutResponse>("/me/checkout", { method: "POST", body: payload });
    } catch (error) {
      return asCheckoutError(error, "We couldn't place your order just now. Nothing was charged — please try again.");
    }
  }

  async getOrder(orderId: number): Promise<ApiOrderDetail | null> {
    try {
      return await api<ApiOrderDetail>(`/me/orders/${orderId}`);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  async payOrder(orderId: number): Promise<{ payUrl: string }> {
    try {
      return await api<{ payUrl: string }>(`/me/orders/${orderId}/pay`, { method: "POST" });
    } catch (error) {
      return asCheckoutError(error, "We couldn't open the payment page just now. Please try again.");
    }
  }
}

// ─── Serviceability ───────────────────────────────────────────────────────────

export class ApiServiceabilityRepository implements IServiceabilityRepository {
  async checkPincode(pincode: string): Promise<ApiServiceabilityResult> {
    return api<ApiServiceabilityResult>(
      `/shop/pincode/${encodeURIComponent(pincode)}`,
    );
  }
}

// ─── Customer sign-in ─────────────────────────────────────────────────────────

/** Requests made from the shop are the patient area: no `x-panel` header, so the backend uses the `dh_user` cookie. */
export class ApiAuthRepository implements IAuthRepository {
  async requestOtp(phone: string, options: { email?: string } = {}): Promise<ApiOtpRequestResult> {
    return api<ApiOtpRequestResult>("/auth/otp/request", {
      method: "POST",
      body: { phone, ...(options.email ? { email: options.email } : {}) },
    });
  }

  async verifyOtp(phone: string, code: string): Promise<ApiUser> {
    const { user } = await api<{ user: ApiUser }>("/auth/otp/verify", { method: "POST", body: { phone, code } });
    return user;
  }

  async signUp(input: { phone: string; email: string; code: string }): Promise<ApiUser> {
    const { user } = await api<{ user: ApiUser }>("/auth/signup", { method: "POST", body: input });
    return user;
  }

  async passwordLogin(identifier: string, password: string): Promise<ApiUser> {
    const { user } = await api<{ user: ApiUser }>("/auth/password-login", {
      method: "POST",
      body: { identifier, password },
    });
    return user;
  }

  async setPassword(password: string): Promise<void> {
    await api("/auth/password", { method: "POST", body: { password } });
  }

  async logout(): Promise<void> {
    await api("/auth/user-logout", { method: "POST" });
  }

  async getCurrentUser(): Promise<ApiUser | null> {
    try {
      const { user } = await api<{ user: ApiUser }>("/auth/session");
      return user;
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) return null;
      throw err;
    }
  }
}

// ─── Account ─────────────────────────────────────────────────────────────────

const blankToNull = (value: string | null | undefined) => (value && value.trim() ? value.trim() : null);

export class ApiAccountRepository implements IAccountRepository {
  constructor(private readonly auth: IAuthRepository) {}

  async getOverview(): Promise<ApiAccountOverview> {
    return api<ApiAccountOverview>("/me/overview");
  }

  async updateProfile(input: ApiProfileInput): Promise<ApiUser> {
    // The backend turns "" into null for every optional field.
    await api("/me/profile", {
      method: "PATCH",
      body: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim(),
        gender: input.gender,
        dateOfBirth: input.dateOfBirth,
      },
    });
    // PATCH answers { ok: true }; the session is the one place the profile can be read back.
    const user = await this.auth.getCurrentUser();
    if (!user) throw new ApiError(401, "Please sign in to continue.");
    return user;
  }

  async getAddresses(): Promise<ApiAddress[]> {
    const { items } = await api<{ items: ApiAddress[] }>("/me/addresses");
    return items;
  }

  async addAddress(input: ApiAddressInput): Promise<number> {
    const { id } = await api<{ id: number }>("/me/addresses", {
      method: "POST",
      body: { ...input, landmark: blankToNull(input.landmark) },
    });
    return id;
  }

  async updateAddress(id: number, input: Partial<ApiAddressInput>): Promise<void> {
    const body = "landmark" in input ? { ...input, landmark: blankToNull(input.landmark) } : input;
    await api(`/me/addresses/${id}`, { method: "PATCH", body });
  }

  async deleteAddress(id: number): Promise<void> {
    await api(`/me/addresses/${id}`, { method: "DELETE" });
  }

  async setDefaultAddress(id: number): Promise<void> {
    await api(`/me/addresses/${id}`, { method: "PATCH", body: { isDefault: true } });
  }

  async getOrders(): Promise<ApiOrderSummary[]> {
    const { items } = await api<{ items: ApiOrderSummary[] }>("/me/orders");
    return items;
  }

  async getOrderById(id: number): Promise<ApiOrderDetail | null> {
    try {
      return await api<ApiOrderDetail>(`/me/orders/${id}`);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }
}

// ─── Prescriptions ─────────────────────────────────────────────────────────────

export class ApiPrescriptionRepository implements IPrescriptionRepository {
  async getPrescriptions(): Promise<ApiPrescription[]> {
    const { items } = await api<{ items: ApiPrescription[] }>("/me/prescriptions");
    return items;
  }
}

// ─── Health Insights (blog) ─────────────────────────────────────────────────────

type ApiBlogDetail = Omit<ApiInsightDetail, "content" | "seoTitle" | "seoDescription"> & { content: string | null };

export class ApiInsightRepository implements IInsightRepository {
  async getInsights(page = 1, pageSize = 12, category?: string): Promise<ApiInsightListingResponse> {
    return api<ApiInsightListingResponse>("/shop/blog", {
      query: { page, pageSize: Math.min(Math.max(1, pageSize), MAX_INSIGHT_PAGE_SIZE), category },
    });
  }

  async getBySlug(slug: string): Promise<ApiInsightDetail | null> {
    try {
      const post = await api<ApiBlogDetail>(`/shop/blog/${encodeURIComponent(slug)}`);
      return {
        ...post,
        content: post.content ?? "",
        seoTitle: post.seo.title || null,
        seoDescription: post.seo.description || null,
        // The backend names its own path (/blog/:slug); this site's articles live at /insights/:slug.
        seo: { ...post.seo, path: `/insights/${post.slug}` },
      };
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  /** No related-articles endpoint: the newest others in the same category, up to three. */
  async getRelated(slug: string): Promise<ApiInsightListingResponse> {
    const article = await this.getBySlug(slug);
    if (!article?.category) return { items: [], total: 0, page: 1, pageSize: 3, pageCount: 1 };
    const listing = await this.getInsights(1, 4, article.category.slug);
    const items = listing.items.filter((item) => item.slug !== slug).slice(0, 3);
    return { items, total: items.length, page: 1, pageSize: 3, pageCount: 1 };
  }
}

// ─── Consultations (public, read-only) ─────────────────────────────────────────

export class ApiCareRepository implements ICareRepository {
  async listDoctors(query?: string): Promise<ApiDoctorCard[]> {
    const { items } = await api<{ items: ApiDoctorCard[] }>("/care/doctors", { query: { q: query?.trim() || undefined } });
    return items;
  }

  async getNextSlot(slug: string): Promise<ApiNextSlot | null> {
    try {
      const { slot } = await api<{ slot: ApiNextSlot | null }>(`/care/doctors/${encodeURIComponent(slug)}/next-slot`);
      return slot;
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  async getDoctor(slug: string): Promise<ApiDoctorDetail | null> {
    try {
      return await api<ApiDoctorDetail>(`/care/doctors/${encodeURIComponent(slug)}`);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  async getSlots(slug: string, date: string): Promise<ApiDoctorSlot[]> {
    const { slots } = await api<{ slots: ApiDoctorSlot[] }>(`/care/doctors/${encodeURIComponent(slug)}/slots`, { query: { date } });
    return slots;
  }

  async getStreams(): Promise<ApiConsultingStream[]> {
    const { items } = await api<{ items: ApiConsultingStream[] }>("/care/streams");
    return items;
  }
}

// ─── Consultations ─────────────────────────────────────────────────────────────

export class ApiConsultationRepository implements IConsultationRepository {
  book(input: ApiBookingInput): Promise<ApiBookingResult> {
    return api<ApiBookingResult>("/me/appointments", { method: "POST", body: input });
  }

  pay(id: number): Promise<ApiAppointmentPayResult> {
    return api<ApiAppointmentPayResult>(`/me/appointments/${id}/pay`, { method: "POST" });
  }

  cancel(id: number): Promise<{ ok: true; refundDue: boolean }> {
    return api<{ ok: true; refundDue: boolean }>(`/me/appointments/${id}/cancel`, { method: "POST" });
  }

  async rate(id: number, rating: number, comment: string | null): Promise<void> {
    await api(`/me/appointments/${id}/review`, { method: "POST", body: { rating, comment } });
  }

  async list(): Promise<ApiAppointment[]> {
    const { items } = await api<{ items: ApiAppointment[] }>("/me/appointments");
    return items;
  }

  uploadFile(file: File): Promise<ApiConsultationFile> {
    const body = new FormData();
    body.append("file", file);
    return api<ApiConsultationFile>("/me/consultation-files", { method: "POST", body });
  }

  async removeFile(id: number): Promise<void> {
    await api(`/me/consultation-files/${id}`, { method: "DELETE" });
  }
}
