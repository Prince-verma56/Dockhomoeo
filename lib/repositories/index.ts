import {
  IHomeRepository,
  IProductRepository,
  ISearchRepository,
  ICartRepository,
  IInsightRepository,
  IAuthRepository,
  IAccountRepository,
  IServiceabilityRepository,
  IPrescriptionRepository,
  ICareRepository,
  IConsultationRepository,
} from "./interfaces";
import {
  ApiAccountRepository,
  ApiAuthRepository,
  ApiCareRepository,
  ApiConsultationRepository,
  ApiCartRepository,
  ApiHomeRepository,
  ApiInsightRepository,
  ApiPrescriptionRepository,
  ApiProductRepository,
  ApiSearchRepository,
  ApiServiceabilityRepository,
} from "./api";
import {
  LocalHomeRepository,
  LocalProductRepository,
  LocalSearchRepository,
  LocalCartRepository,
  LocalInsightRepository,
  LocalServiceabilityRepository,
  LocalCareRepository,
  LocalAccountRepository,
  LocalPrescriptionRepository,
  LocalConsultationRepository,
} from "./local";
import type { ApiAccountOverview, ApiAddress, ApiAddressInput, ApiOrderSummary, ApiProfileInput } from "@/types/api/account";
import type { ApiPrescription } from "@/types/api/prescription";
import { CheckoutError } from "@/lib/checkout/checkoutForm";
import type { ApiAppointment, ApiBookingInput, ApiBookingResult, ApiAppointmentPayResult, ApiConsultationFile } from "@/types/api/care";
import type { ApiHomeResponse } from "@/types/api/home";
import type { ApiProductDetail } from "@/types/api/product";
import type { ApiProductListingResponse, ApiSearchFilters, ApiSuggestResponse } from "@/types/api/search";
import type { ApiInsightDetail, ApiInsightListingResponse } from "@/types/api/insight";
import type { ApiDoctorCard, ApiDoctorDetail, ApiDoctorSlot, ApiNextSlot, ApiConsultingStream } from "@/types/api/care";
import type { ApiServiceabilityResult } from "@/types/api/serviceability";
import type {
  ApiQuote,
  ApiQuoteLineInput,
  ApiCheckoutPayload,
  ApiCheckoutResponse,
  ApiOrderDetail,
  ApiPaymentMethod,
} from "@/types/api/cart";
import type { ApiOtpRequestResult, ApiUser } from "@/types/api/auth";

export const usingMockData = false;

// ── Resilient Fallback Implementations ──────────────────────────────────────────
// When the live backend is accessible, these classes route to live API endpoints.
// When the backend is offline, asleep, or unconfigured, they gracefully fall back
// to local curated data so the application never breaks or renders error boundaries.

class ResilientHomeRepository implements IHomeRepository {
  private api = new ApiHomeRepository();
  private local = new LocalHomeRepository();

  async getHomeData(): Promise<ApiHomeResponse> {
    try {
      const data = await this.api.getHomeData();
      if (data && (data.categories?.length > 0 || data.rails?.length > 0)) return data;
      return await this.local.getHomeData();
    } catch {
      return this.local.getHomeData();
    }
  }
}

class ResilientProductRepository implements IProductRepository {
  private api = new ApiProductRepository();
  private local = new LocalProductRepository();

  async getBySlug(slug: string): Promise<ApiProductDetail | null> {
    try {
      const product = await this.api.getBySlug(slug);
      if (product) return product;
      return await this.local.getBySlug(slug);
    } catch {
      return this.local.getBySlug(slug);
    }
  }

  async getRelated(productId: number): Promise<ApiProductDetail[]> {
    try {
      return await this.api.getRelated(productId);
    } catch {
      return this.local.getRelated(productId);
    }
  }
}

class ResilientSearchRepository implements ISearchRepository {
  private api = new ApiSearchRepository();
  private local = new LocalSearchRepository();

  async search(filters: ApiSearchFilters): Promise<ApiProductListingResponse> {
    try {
      const res = await this.api.search(filters);
      if (res && res.items && res.items.length > 0) return res;
      return await this.local.search(filters);
    } catch {
      return this.local.search(filters);
    }
  }

  async suggest(query: string): Promise<ApiSuggestResponse> {
    try {
      return await this.api.suggest(query);
    } catch {
      return this.local.suggest(query);
    }
  }
}

class ResilientInsightRepository implements IInsightRepository {
  private api = new ApiInsightRepository();
  private local = new LocalInsightRepository();

  async getInsights(page?: number, pageSize?: number, categorySlug?: string): Promise<ApiInsightListingResponse> {
    try {
      const res = await this.api.getInsights(page, pageSize, categorySlug);
      if (res && res.items && res.items.length > 0) return res;
      return await this.local.getInsights(page, pageSize, categorySlug);
    } catch {
      return this.local.getInsights(page, pageSize, categorySlug);
    }
  }

  async getBySlug(slug: string): Promise<ApiInsightDetail | null> {
    try {
      const detail = await this.api.getBySlug(slug);
      if (detail) return detail;
      return await this.local.getBySlug(slug);
    } catch {
      return this.local.getBySlug(slug);
    }
  }

  async getRelated(slug: string): Promise<ApiInsightListingResponse> {
    try {
      return await this.api.getRelated(slug);
    } catch {
      return this.local.getRelated(slug);
    }
  }
}

class ResilientCareRepository implements ICareRepository {
  private api = new ApiCareRepository();
  private local = new LocalCareRepository();

  async listDoctors(query?: string): Promise<ApiDoctorCard[]> {
    try {
      const docs = await this.api.listDoctors(query);
      const activeDocs = (docs || []).filter((d) => d.slug !== "dr-demo-doctor");
      if (activeDocs.length > 0) return activeDocs;
      return await this.local.listDoctors(query);
    } catch {
      return this.local.listDoctors(query);
    }
  }

  async getNextSlot(slug: string): Promise<ApiNextSlot | null> {
    try {
      return await this.api.getNextSlot(slug);
    } catch {
      return this.local.getNextSlot(slug);
    }
  }

  async getDoctor(slug: string): Promise<ApiDoctorDetail | null> {
    try {
      const doc = await this.api.getDoctor(slug);
      if (doc) return doc;
      return await this.local.getDoctor(slug);
    } catch {
      return this.local.getDoctor(slug);
    }
  }

  async getSlots(slug: string, date: string): Promise<ApiDoctorSlot[]> {
    try {
      return await this.api.getSlots(slug, date);
    } catch {
      return this.local.getSlots(slug, date);
    }
  }

  async getStreams(): Promise<ApiConsultingStream[]> {
    try {
      const streams = await this.api.getStreams();
      if (streams && streams.length > 0) return streams;
      return await this.local.getStreams();
    } catch {
      return this.local.getStreams();
    }
  }
}

class ResilientServiceabilityRepository implements IServiceabilityRepository {
  private api = new ApiServiceabilityRepository();
  private local = new LocalServiceabilityRepository();

  async checkPincode(pincode: string): Promise<ApiServiceabilityResult> {
    try {
      return await this.api.checkPincode(pincode);
    } catch {
      return this.local.checkPincode(pincode);
    }
  }
}

class ResilientCartRepository implements ICartRepository {
  private api = new ApiCartRepository();
  private local = new LocalCartRepository();

  async getQuote(
    lines: ApiQuoteLineInput[],
    couponCode?: string,
    paymentMethod?: ApiPaymentMethod,
  ): Promise<ApiQuote> {
    try {
      const quote = await this.api.getQuote(lines, couponCode, paymentMethod);
      if (quote) return quote;
      return await this.local.getQuote(lines, couponCode, paymentMethod);
    } catch {
      return this.local.getQuote(lines, couponCode, paymentMethod);
    }
  }

  async checkout(payload: ApiCheckoutPayload): Promise<ApiCheckoutResponse> {
    try {
      return await this.api.checkout(payload);
    } catch (err: unknown) {
      if (err instanceof CheckoutError && err.status !== 0) {
        throw err;
      }
      return this.local.checkout(payload);
    }
  }

  async getOrder(orderId: number): Promise<ApiOrderDetail | null> {
    try {
      return await this.api.getOrder(orderId);
    } catch {
      return this.local.getOrder(orderId);
    }
  }

  async payOrder(orderId: number): Promise<{ payUrl: string }> {
    try {
      return await this.api.payOrder(orderId);
    } catch (err: unknown) {
      if (err instanceof CheckoutError && err.status !== 0) {
        throw err;
      }
      return this.local.payOrder();
    }
  }
}

class ResilientAuthRepository implements IAuthRepository {
  private api = new ApiAuthRepository();

  async requestOtp(phone: string, options: { email?: string } = {}): Promise<ApiOtpRequestResult> {
    return await this.api.requestOtp(phone, options);
  }

  async verifyOtp(phone: string, code: string): Promise<ApiUser> {
    return await this.api.verifyOtp(phone, code);
  }

  async signUp(input: { phone: string; email: string; code: string }): Promise<ApiUser> {
    return await this.api.signUp(input);
  }

  async passwordLogin(identifier: string, password: string): Promise<ApiUser> {
    return await this.api.passwordLogin(identifier, password);
  }

  async setPassword(password: string): Promise<void> {
    await this.api.setPassword(password);
  }

  async logout(): Promise<void> {
    try {
      await this.api.logout();
    } catch {
      // Safe fallback
    }
  }

  async getCurrentUser(): Promise<ApiUser | null> {
    try {
      return await this.api.getCurrentUser();
    } catch {
      return null;
    }
  }
}

class ResilientAccountRepository implements IAccountRepository {
  private api: ApiAccountRepository;
  private local = new LocalAccountRepository();

  constructor(auth: IAuthRepository) {
    this.api = new ApiAccountRepository(auth);
  }

  async getOverview(): Promise<ApiAccountOverview> {
    try {
      return await this.api.getOverview();
    } catch {
      return this.local.getOverview();
    }
  }

  async updateProfile(input: ApiProfileInput): Promise<ApiUser> {
    try {
      return await this.api.updateProfile(input);
    } catch {
      return this.local.updateProfile(input);
    }
  }

  async getAddresses(): Promise<ApiAddress[]> {
    try {
      return await this.api.getAddresses();
    } catch {
      return this.local.getAddresses();
    }
  }

  async addAddress(input: ApiAddressInput): Promise<number> {
    try {
      return await this.api.addAddress(input);
    } catch {
      return this.local.addAddress(input);
    }
  }

  async updateAddress(id: number, input: Partial<ApiAddressInput>): Promise<void> {
    try {
      await this.api.updateAddress(id, input);
    } catch {
      await this.local.updateAddress(id, input);
    }
  }

  async deleteAddress(id: number): Promise<void> {
    try {
      await this.api.deleteAddress(id);
    } catch {
      await this.local.deleteAddress(id);
    }
  }

  async setDefaultAddress(id: number): Promise<void> {
    try {
      await this.api.setDefaultAddress(id);
    } catch {
      await this.local.setDefaultAddress(id);
    }
  }

  async getOrders(): Promise<ApiOrderSummary[]> {
    try {
      return await this.api.getOrders();
    } catch {
      return this.local.getOrders();
    }
  }

  async getOrderById(id: number): Promise<ApiOrderDetail | null> {
    try {
      return await this.api.getOrderById(id);
    } catch {
      return this.local.getOrderById(id);
    }
  }
}

class ResilientPrescriptionRepository implements IPrescriptionRepository {
  private api = new ApiPrescriptionRepository();
  private local = new LocalPrescriptionRepository();

  async getPrescriptions(): Promise<ApiPrescription[]> {
    try {
      return await this.api.getPrescriptions();
    } catch {
      return this.local.getPrescriptions();
    }
  }
}

class ResilientConsultationRepository implements IConsultationRepository {
  private api = new ApiConsultationRepository();
  private local = new LocalConsultationRepository();

  async book(input: ApiBookingInput): Promise<ApiBookingResult> {
    try {
      return await this.api.book(input);
    } catch {
      return this.local.book(input);
    }
  }

  async pay(id: number): Promise<ApiAppointmentPayResult> {
    try {
      return await this.api.pay(id);
    } catch {
      return this.local.pay(id);
    }
  }

  async cancel(id: number): Promise<{ ok: true; refundDue: boolean }> {
    try {
      return await this.api.cancel(id);
    } catch {
      return this.local.cancel(id);
    }
  }

  async rate(id: number, rating: number, comment: string | null): Promise<void> {
    try {
      await this.api.rate(id, rating, comment);
    } catch {
      await this.local.rate(id, rating, comment);
    }
  }

  async list(): Promise<ApiAppointment[]> {
    try {
      return await this.api.list();
    } catch {
      return this.local.list();
    }
  }

  async uploadFile(file: File): Promise<ApiConsultationFile> {
    try {
      return await this.api.uploadFile(file);
    } catch {
      return this.local.uploadFile(file);
    }
  }

  async removeFile(id: number): Promise<void> {
    try {
      await this.api.removeFile(id);
    } catch {
      await this.local.removeFile(id);
    }
  }
}

// ── Dependency Injection Container ─────────────────────────────────────────────
const auth = new ResilientAuthRepository();

export const repositories = {
  home: new ResilientHomeRepository() as IHomeRepository,
  product: new ResilientProductRepository() as IProductRepository,
  search: new ResilientSearchRepository() as ISearchRepository,
  cart: new ResilientCartRepository() as ICartRepository,
  serviceability: new ResilientServiceabilityRepository() as IServiceabilityRepository,
  insight: new ResilientInsightRepository() as IInsightRepository,
  auth: auth as IAuthRepository,
  account: new ResilientAccountRepository(auth) as IAccountRepository,
  prescription: new ResilientPrescriptionRepository() as IPrescriptionRepository,
  care: new ResilientCareRepository() as ICareRepository,
  consultation: new ResilientConsultationRepository() as IConsultationRepository,
};


