import { ApiProductCard } from "./product";

export interface ApiFacetCategory {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  count: number;
}

export interface ApiFacetOption<T = string | number> {
  value: T;
  label?: string;
  count: number;
  selected?: boolean;
}

export interface ApiPriceBand {
  key: string;
  label: string;
  min: number;
  max: number | null;
  count: number;
}

export interface ApiFacets {
  categories: ApiFacetCategory[];
  brands: ApiFacetOption<string>[];
  forms: ApiFacetOption<string>[];
  potencies: ApiFacetOption<string>[];
  packs: ApiFacetOption<string>[];
  prices: ApiPriceBand[];
  priceRange: { min: number; max: number };
  discounts: ApiFacetOption<number>[];
  ratings: ApiFacetOption<number>[];
}

export interface ApiProductListingResponse {
  items: ApiProductCard[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  sort: string;
  category: {
    name: string;
    slug: string;
    trail: { name: string; slug: string }[];
  } | null;
  facets: ApiFacets;
  wholesale: boolean;
}

export interface ApiSuggestResponse {
  products: {
    name: string;
    slug: string;
    brandName: string | null;
    imageUrl: string | null;
    price: number;
  }[];
  categories: { name: string; slug: string }[];
  brands: { name: string; slug: string }[];
}

export interface ApiSearchFilters {
  q?: string;
  category?: string;
  brand?: string[];
  form?: string[];
  potency?: string[];
  pack?: string[];
  minPrice?: number;
  maxPrice?: number;
  discount?: number;
  rating?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
}
