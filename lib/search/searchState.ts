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

/** Same options and labels as the /products sort control, with the backend's keys. */
export const SORT_OPTIONS: readonly { value: ApiListingSort; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Arrivals" },
];

export type FilterSelection = {
  category: string | null;
  brand: string[];
  form: string[];
};

export type SearchState = FilterSelection & {
  q: string;
  sort: ApiListingSort;
  page: number;
};

export const NO_FILTERS: FilterSelection = { category: null, brand: [], form: [] };

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

export function parseSearchState(raw: RawParams): SearchState {
  // Older /products links spell the price sorts with an underscore (price_asc).
  const sort = first(raw.sort)?.replace("_", "-");
  const page = Number.parseInt(first(raw.page) ?? "", 10);
  return {
    q: (first(raw.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH),
    category: first(raw.category)?.trim() || null,
    brand: list(raw.brand),
    form: list(raw.form),
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
  if (state.sort && state.sort !== "relevance") params.set("sort", state.sort);
  if (state.page && state.page > 1) params.set("page", String(state.page));
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export const activeFilterCount = (filters: FilterSelection) =>
  (filters.category ? 1 : 0) + filters.brand.length + filters.form.length;

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
