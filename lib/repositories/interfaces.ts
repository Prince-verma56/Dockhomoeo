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
