import type { ApiListingSort, ApiSearchFilters } from "@/types/api/search";

/**
 * The /search URL is the search state. The server page parses it, the client
 * view writes it, and both go through this file so the two never drift.
 *
 * Multi-select filters repeat their key (`?brand=a&brand=b`), matching
 * /products. The shop API takes one comma-separated value instead; joining is
 * the API repository's job, not the URL's.
 */

export const SEARCH_PAGE_SIZE = 24;
/** The backend trims and caps `q` at 80 characters (listingSchema). */
export const MAX_QUERY_LENGTH = 80;

/** Every listing's sort control, with the backend's keys (listingSchema). */
export const SORT_OPTIONS: readonly { value: ApiListingSort; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest saving" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
];

/**
 * Every filter the listing contract accepts (GET /api/shop/products). A group
 * is only offered when the listing's facets say it has options.
 */
export type FilterSelection = {
  category: string | null;
  brand: string[];
  form: string[];
  potency: string[];
  pack: string[];
  /** Inclusive price bounds in rupees; null means unbounded. */
  minPrice: number | null;
  maxPrice: number | null;
  /** At least this percentage off MRP. */
  discount: number | null;
  /** At least this many stars. */
  rating: number | null;
  inStock: boolean;
};

export type SearchState = FilterSelection & {
  q: string;
  sort: ApiListingSort;
  page: number;
};

export const NO_FILTERS: FilterSelection = {
  category: null,
  brand: [],
  form: [],
  potency: [],
  pack: [],
  minPrice: null,
  maxPrice: null,
  discount: null,
  rating: null,
  inStock: false,
};

/** The filter part of a listing state, without query, sort or page. */
export const filtersOf = (state: FilterSelection): FilterSelection => ({
  category: state.category,
  brand: state.brand,
  form: state.form,
  potency: state.potency,
  pack: state.pack,
  minPrice: state.minPrice,
  maxPrice: state.maxPrice,
  discount: state.discount,
  rating: state.rating,
  inStock: state.inStock,
});

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const list = (value: string | string[] | undefined) => [
  ...new Set(
    (value === undefined ? [] : Array.isArray(value) ? value : [value])
      .map((v) => v.trim())
      .filter(Boolean),
  ),
];

/** A non-negative whole number from the URL, or null. */
const amount = (value: string | string[] | undefined) => {
  const parsed = Number.parseInt(first(value) ?? "", 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

export function parseSearchState(raw: RawParams): SearchState {
  // Older /products links spell the price sorts with an underscore (price_asc).
  const sort = first(raw.sort)?.replace("_", "-");
  const page = Number.parseInt(first(raw.page) ?? "", 10);
  let minPrice = amount(raw.minPrice);
  let maxPrice = amount(raw.maxPrice);
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];
  const rating = amount(raw.rating);
  const discount = amount(raw.discount);
  const inStock = first(raw.inStock);
  return {
    q: (first(raw.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH),
    category: first(raw.category)?.trim() || null,
    brand: list(raw.brand),
    form: list(raw.form),
    potency: list(raw.potency),
    pack: list(raw.pack),
    minPrice: minPrice || null,
    maxPrice,
    discount: discount && discount <= 100 ? discount : null,
    rating: rating && rating <= 5 ? rating : null,
    inStock: inStock === "1" || inStock === "true",
    sort: SORT_OPTIONS.find((option) => option.value === sort)?.value ?? "relevance",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

export function toSearchFilters(state: SearchState): ApiSearchFilters {
  return {
    q: state.q,
    category: state.category ?? undefined,
    brand: state.brand,
    form: state.form,
    potency: state.potency,
    pack: state.pack,
    minPrice: state.minPrice ?? undefined,
    maxPrice: state.maxPrice ?? undefined,
    discount: state.discount ?? undefined,
    rating: state.rating ?? undefined,
    inStock: state.inStock || undefined,
    sort: state.sort,
    page: state.page,
    pageSize: SEARCH_PAGE_SIZE,
  };
}

/** Writes only non-default values, so shared URLs stay short and readable. */
export function searchHref(state: Partial<SearchState>): string {
  return listingHref("/search", state);
}

/** The same URL scheme for any listing route, e.g. a brand page. */
export function listingHref(path: string, state: Partial<SearchState>): string {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);
  state.brand?.forEach((brand) => params.append("brand", brand));
  state.form?.forEach((form) => params.append("form", form));
  state.potency?.forEach((potency) => params.append("potency", potency));
  state.pack?.forEach((pack) => params.append("pack", pack));
  if (state.minPrice) params.set("minPrice", String(state.minPrice));
  if (state.maxPrice !== null && state.maxPrice !== undefined) params.set("maxPrice", String(state.maxPrice));
  if (state.discount) params.set("discount", String(state.discount));
  if (state.rating) params.set("rating", String(state.rating));
  if (state.inStock) params.set("inStock", "1");
  if (state.sort && state.sort !== "relevance") params.set("sort", state.sort);
  if (state.page && state.page > 1) params.set("page", String(state.page));
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export const activeFilterCount = (filters: FilterSelection) =>
  (filters.category ? 1 : 0) +
  filters.brand.length +
  filters.form.length +
  filters.potency.length +
  filters.pack.length +
  (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
  (filters.discount ? 1 : 0) +
  (filters.rating ? 1 : 0) +
  (filters.inStock ? 1 : 0);

/** "Q" alone means little to most shoppers; every other potency reads as printed. */
export const potencyLabel = (potency: string) => (potency.toUpperCase() === "Q" ? "Q (mother tincture)" : potency);

/** Display names for dosage forms, worded as in the header's Shop menu. */
export const FORM_LABELS: Record<string, string> = {
  drops: "Drops & Dilutions",
  tablets: "Tablets & Pellets",
  tincture: "Mother Tinctures",
  cream: "Creams & Ointments",
  oil: "Oils",
};

/** The same forms as plain nouns, for running text ("drops and creams"). */
export const FORM_NOUNS: Record<string, string> = {
  drops: "drops",
  tablets: "tablets",
  tincture: "mother tinctures",
  cream: "creams",
  oil: "oils",
};

export const formLabel = (form: string) =>
  FORM_LABELS[form] ?? form.charAt(0).toUpperCase() + form.slice(1);
