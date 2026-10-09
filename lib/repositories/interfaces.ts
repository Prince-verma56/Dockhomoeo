import { ApiHomeResponse } from "@/types/api/home";
import { ApiProductDetail } from "@/types/api/product";
import { ApiProductListingResponse, ApiSearchFilters, ApiSuggestResponse } from "@/types/api/search";
import { ApiCheckoutPayload, ApiCheckoutResponse, ApiQuote, ApiQuoteLineInput } from "@/types/api/cart";

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

export interface ICartRepository {
  getQuote(lines: ApiQuoteLineInput[], couponCode?: string): Promise<ApiQuote>;
  checkout(payload: ApiCheckoutPayload): Promise<ApiCheckoutResponse>;
}
import { ApiInsightDetail, ApiInsightListingResponse } from "@/types/api/insight";

export interface IInsightRepository {
  getInsights(page?: number, pageSize?: number, category?: string): Promise<ApiInsightListingResponse>;
  getBySlug(slug: string): Promise<ApiInsightDetail | null>;
  getRelated(slug: string): Promise<ApiInsightListingResponse>;
}

import { ApiAuthResponse, ApiUser } from "@/types/api/auth";
import { ApiAccountProfile, ApiAddress, ApiOrder, ApiOrderSummary } from "@/types/api/account";

export interface IAuthRepository {
  requestOtp(phone: string): Promise<{ success: boolean; message?: string }>;
  verifyOtp(phone: string, code: string): Promise<ApiAuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<ApiUser | null>;
}

export interface IAccountRepository {
  getProfile(): Promise<ApiAccountProfile | null>;
  updateProfile(profile: Partial<ApiAccountProfile>): Promise<ApiAccountProfile>;
  
  getAddresses(): Promise<ApiAddress[]>;
  addAddress(address: Omit<ApiAddress, 'id'>): Promise<ApiAddress>;
  updateAddress(id: string, address: Partial<ApiAddress>): Promise<ApiAddress>;
  deleteAddress(id: string): Promise<void>;
  setDefaultAddress(id: string): Promise<void>;
  
  getOrders(): Promise<ApiOrderSummary[]>;
  getOrderById(id: string): Promise<ApiOrder | null>;
}
import { ApiPrescription } from "@/types/api/prescription";
import { ApiServiceabilityResult } from "@/types/api/serviceability";

export interface IServiceabilityRepository {
  checkPincode(pincode: string): Promise<ApiServiceabilityResult>;
}

export interface IPrescriptionRepository {
  getPrescriptions(): Promise<ApiPrescription[]>;
}
