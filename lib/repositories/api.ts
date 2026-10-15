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

import { api } from "@/lib/api";
import type {
  IHomeRepository,
  IProductRepository,
  ISearchRepository,
  ICartRepository,
  IServiceabilityRepository,
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
    return api<ApiCheckoutResponse>("/me/checkout", {
      method: "POST",
      body: payload,
    });
  }

  async getOrder(orderId: number): Promise<ApiOrderDetail | null> {
    try {
      return await api<ApiOrderDetail>(`/me/orders/${orderId}`);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 404) return null;
      throw err;
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
