"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Check, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, List, SearchX, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mapApiCardToProduct } from "@/lib/adapters/product";
import type { ApiProductCard } from "@/types/api/product";
import { formatRupees } from "@/lib/formatters/price";
import { getLenis } from "@/components/providers/SmoothScrollProvider";
import {
  NO_FILTERS,
  SORT_OPTIONS,
  activeFilterCount,
  filtersOf,
  formLabel,
  potencyLabel,
  type FilterSelection,
  type SearchState,
} from "@/lib/search/searchState";
import type { ApiFacets, ApiListingSort, ApiProductListingResponse } from "@/types/api/search";
import { SearchFilters, hasFacetOptions } from "@/sections/search/SearchFilters";

const FORM_CANONICAL_ORDER = ["drops", "tablets", "tincture", "oil", "cream"];

function getFormIcon(form: string) {
  switch (form) {
    case "drops":
      return (
        <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 2h4" />
          <path d="M12 2v3" />
          <rect x="7" y="5" width="10" height="16" rx="3" />
          <path d="M12 10v4" />
          <circle cx="12" cy="16" r="0.8" fill="currentColor" />
        </svg>
      );
    case "tablets":
      return (
        <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m10.5 4.5 9 9a5 5 0 0 1-7.1 7.1l-9-9a5 5 0 0 1 7.1-7.1z" />
          <line x1="8.5" y1="12.5" x2="15.5" y2="5.5" />
        </svg>
      );
    case "tincture":
      return (
        <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 2v5.5L4.5 18a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 7.5V2" />
          <path d="M8.5 2h7" />
          <path d="M7 16h10" />
        </svg>
      );
    case "oil":
      return (
        <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
        </svg>
      );
    case "cream":
      return (
        <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M7 21h10" />
          <path d="M8 21 9 9h6l1 12" />
          <rect x="9.5" y="4" width="5" height="5" rx="1.5" />
          <path d="M11 2h2" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Complementary remedies shelf shown when an active filter leaves few results (<= 2).
 * Fills the visual space naturally and introduces shoppers to popular remedies in other forms.
 */
function ComplementaryRemedies({
  excludeIds,
  onClearFilters,
  totalAll,
}: {
  excludeIds: (number | string)[];
  onClearFilters: () => void;
  totalAll: number;
}) {
  const [items, setItems] = useState<ApiProductCard[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/shop/products?sort=popular&pageSize=6")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.items) return;
        const normalizedExcludes = new Set(excludeIds.map((id) => String(id)));
        const filtered = data.items
          .filter((item: ApiProductCard) => !normalizedExcludes.has(String(item.id)))
          .slice(0, 4);
        setItems(filtered);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [excludeIds.join(",")]);

  if (items.length === 0) return null;

  return (
    <div className="mt-10 rounded-2xl border border-line-soft bg-paper/70 p-5 sm:p-6 shadow-2xs backdrop-blur-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-forest/10 text-forest text-xs font-bold">
              ✦
            </span>
            <h3 className="text-sm sm:text-base font-semibold text-ink">
              Complementary remedies in other forms
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-ink">
            Frequently paired remedies trusted by patients across our complete apothecary
          </p>
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          className="cursor-pointer text-xs font-semibold text-forest hover:text-forest-deep underline-offset-4 hover:underline"
        >
          View all {totalAll} remedies →
        </button>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <li key={item.id} className="h-full">
            <ProductCard product={mapApiCardToProduct(item)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * URL-driven listing state shared by /products, /search and brand pages:
 * controls update at once through `useOptimistic`, the server answers through
 * a transition, and the page tree is never remounted, so focus stays on the
 * control used.
 */
export function useListingNavigation(state: SearchState, hrefFor: (state: SearchState) => string) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useOptimistic(state);

  /** New query, product or page: an ordinary navigation, scrolled to the top. */
  const go = (href: string) => startTransition(() => router.push(href));

  /** Refinements keep the scroll position, so a ticked box stays under the pointer. */
  const refine = (patch: Partial<SearchState>) => {
    const next = { ...view, ...patch, page: 1 };
    startTransition(() => {
      setView(next);
      router.push(hrefFor(next), { scroll: false });
    });
  };

  return { view, isPending, go, refine };
}

export function ResultCount({ result, filtered }: { result: ApiProductListingResponse; filtered: boolean }) {
  if (result.total === 0) {
    return <>{filtered ? "No products match these filters" : "No products found"}</>;
  }
  const noun = result.total === 1 ? "product" : "products";
  if (result.pageCount <= 1) return <>{`${result.total} ${noun}`}</>;
  const first = (result.page - 1) * result.pageSize + 1;
  const last = Math.min(result.page * result.pageSize, result.total);
  return <>{`Showing ${first}–${last} of ${result.total} ${noun}`}</>;
}

type ProductResultsProps = {
  /** What the server last answered for. */
  state: SearchState;
  /** What the controls show, ahead of the server. */
  view: SearchState;
  result: ApiProductListingResponse;
  pending: boolean;
  hrefFor: (state: SearchState) => string;
  onRefine: (patch: Partial<SearchState>) => void;
  /** Accessible name of the results region. */
  label: string;
  /** A brand page fixes the brand, so its facet group is not offered. */
  hideBrandFacet?: boolean;
  /** When hero banner provides the remedy form pills, suppress duplicate inner tabs */
  hasHeroTabs?: boolean;
  /** Shown when nothing matched and there is nothing to filter. */
  emptyState: ReactNode;
};

/**
 * The catalogue: a sticky filter sidebar on desktop, a filter sheet on
 * tablets and phones, and a toolbar, chip row, grid and pagination that all
 * read and write the URL through lib/search/searchState. Filtering, counting
 * and sorting happen in the repository — never here.
 */
export function ProductResults({
  state,
  view,
  result,
  pending,
  hrefFor,
  onRefine,
  label,
  hideBrandFacet = false,
  hasHeroTabs = false,
  emptyState,
}: ProductResultsProps) {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const resultsTopRef = useRef<HTMLDivElement>(null);
  const facets: ApiFacets = hideBrandFacet ? { ...result.facets, brands: [] } : result.facets;
  const filterCount = activeFilterCount(view);
  const showFilters = hasFacetOptions(facets) || filterCount > 0;

  const applyFilters = (filters: FilterSelection) => {
    onRefine(filters);
  };

  const clearFilters = () => {
    onRefine(NO_FILTERS);
    // Keep focus nearby with preventScroll so native focus does not trigger harsh jumps
    resultsTopRef.current?.focus({ preventScroll: true });
  };

  const onSort = (sort: ApiListingSort) => {
    onRefine({ sort });
  };

  if (!showFilters) {
    return (
      <section aria-label={label} className="py-10 lg:py-14">
        <Container>{emptyState}</Container>
      </section>
    );
  }

  const allFormsTotal = facets.forms.reduce((sum, f) => sum + f.count, 0) || result.total;
  const sortedForms = [...facets.forms].sort((a, b) => {
    const ia = FORM_CANONICAL_ORDER.indexOf(a.value);
    const ib = FORM_CANONICAL_ORDER.indexOf(b.value);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.value.localeCompare(b.value);
  });

  return (
    <section
      aria-label={label}
      className="relative z-10 -mt-6 sm:-mt-8 rounded-t-[2.5rem] sm:rounded-t-[3rem] bg-canvas pt-8 sm:pt-10 pb-16 shadow-[0_-8px_30px_rgba(20,37,31,0.03)] border-t border-line/30"
    >
      <Container>
        <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[16.5rem_minmax(0,1fr)] xl:gap-12">
          <aside aria-labelledby="filters-heading" className="hidden lg:block">
            {/* Natural full height container without artificial height limitations or hidden scrollbars */}
            <div className="rounded-2xl dh-card px-5 pt-4 pb-5 border border-line-soft bg-paper shadow-soft">
              <div className="flex items-center justify-between border-b border-line/70 pb-3">
                <h2 id="filters-heading" className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
                  <SlidersHorizontal aria-hidden className="size-4 text-forest" strokeWidth={1.8} />
                  Filters
                </h2>
                {filterCount > 0 ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="cursor-pointer rounded-md px-1 text-[0.8125rem] font-semibold text-forest underline-offset-4 hover:underline"
                  >
                    Clear all
                  </button>
                ) : null}
              </div>
              <SearchFilters
                facets={facets}
                value={filtersOf(view)}
                onChange={applyFilters}
                categoryName={result.category?.name}
              />
            </div>
          </aside>

          {/* Focus lands here when a pressed control disappears (a removed chip,
              "Clear all"): preventScroll keeps viewport stable while tab order stays clean. */}
          <div ref={resultsTopRef} tabIndex={-1} className="min-w-0 outline-none!">
            {/* Form Filter Tabs */}
            {sortedForms.length > 0 ? (
              <div className="mb-6">
                <nav aria-label="Remedy form tabs" className="dh-no-scrollbar -mx-1 overflow-x-auto px-1 pb-1">
                  <ul className="flex items-center gap-1.5 sm:gap-2">
                    <li>
                      <button
                        type="button"
                        onClick={() => onRefine({ form: [] })}
                        className={cn(
                          "inline-flex h-9.5 cursor-pointer items-center gap-2 rounded-xl px-4 text-xs sm:text-[0.8125rem] font-medium transition-all duration-200 whitespace-nowrap",
                          view.form.length === 0
                            ? "bg-forest font-semibold text-white shadow-xs"
                            : "border border-line-soft bg-paper text-ink/80 hover:border-forest/30 hover:bg-forest/6 hover:text-forest",
                        )}
                      >
                        <span>All forms</span>
                        <span
                          className={cn(
                            "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] tabular-nums font-semibold",
                            view.form.length === 0 ? "bg-white/25 text-white" : "bg-[#f0f2eb] text-[#55645d]",
                          )}
                        >
                          {allFormsTotal}
                        </span>
                      </button>
                    </li>
                    {sortedForms.map((form) => {
                      const active = view.form.length === 1 && view.form[0] === form.value;
                      return (
                        <li key={form.value}>
                          <button
                            type="button"
                            onClick={() => onRefine({ form: active ? [] : [form.value] })}
                            aria-pressed={active}
                            className={cn(
                              "inline-flex h-9.5 cursor-pointer items-center gap-2 rounded-xl px-4 text-xs sm:text-[0.8125rem] font-medium transition-all duration-200 whitespace-nowrap",
                              active
                                ? "bg-forest font-semibold text-white shadow-xs"
                                : "border border-line-soft bg-paper text-ink/80 hover:border-forest/30 hover:bg-forest/6 hover:text-forest",
                            )}
                          >
                            {getFormIcon(form.value)}
                            <span>{formLabel(form.value)}</span>
                            <span
                              className={cn(
                                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] tabular-nums font-semibold",
                                active ? "bg-white/25 text-white" : "bg-[#f0f2eb] text-[#55645d]",
                              )}
                            >
                              {form.count}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            ) : null}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <p role="status" className="text-sm font-medium text-ink">
                <ResultCount result={result} filtered={filterCount > 0} />
              </p>
              <div className="flex items-center gap-3">
                <SortSelect value={view.sort} onChange={onSort} className="hidden lg:flex" />
                <div className="hidden sm:flex items-center gap-1 rounded-xl border border-line-soft bg-paper p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setLayout("grid")}
                    aria-label="Grid view"
                    className={cn(
                      "grid size-7.5 cursor-pointer place-items-center rounded-lg transition-colors",
                      layout === "grid" ? "bg-forest/10 text-forest font-semibold" : "text-muted-ink hover:text-ink",
                    )}
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout("list")}
                    aria-label="List view"
                    className={cn(
                      "grid size-7.5 cursor-pointer place-items-center rounded-lg transition-colors",
                      layout === "list" ? "bg-forest/10 text-forest font-semibold" : "text-muted-ink hover:text-ink",
                    )}
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            <ActiveFilters
              view={view}
              result={result}
              onApply={(filters) => {
                applyFilters(filters);
                resultsTopRef.current?.focus({ preventScroll: true });
              }}
              onClear={clearFilters}
            />

            {result.items.length > 0 ? (
              <div className="relative min-h-[400px]">
                {pending && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-24 bg-canvas/30 backdrop-blur-[0.5px] rounded-2xl transition-opacity duration-300">
                    <div className="flex items-center gap-2.5 rounded-full border border-forest/20 bg-paper/95 px-4 py-2 text-xs font-semibold text-forest shadow-md backdrop-blur-md">
                      <span className="size-2 rounded-full bg-forest animate-ping" />
                      Updating remedies…
                    </div>
                  </div>
                )}
                <AnimatePresence mode="wait">
                  <motion.ul
                    key={`${state.form.join(",")}-${state.category ?? ""}-${state.brand.join(",")}-${state.sort}-${result.page}-${layout}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    aria-busy={pending || undefined}
                    className={cn(
                      layout === "grid"
                        ? "grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4"
                        : "grid grid-cols-1 gap-4",
                      pending && "opacity-50",
                    )}
                  >
                    {result.items.map((item, index) => (
                      <li key={item.id} className="h-full">
                        <ProductCard
                          product={mapApiCardToProduct(item)}
                          eager={index < 4}
                          layout={layout}
                        />
                      </li>
                    ))}
                    {result.items.length === 1 && layout === "grid" ? (
                      <li className="h-full">
                        <div className="flex h-full min-h-[280px] flex-col justify-between rounded-2xl border border-forest/15 bg-gradient-to-br from-[#f2f7f3] to-paper p-5 sm:p-6 shadow-soft">
                          <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-forest">
                              Care & Guidance
                            </span>
                            <h4 className="mt-3 text-sm font-semibold text-ink sm:text-[0.9375rem] leading-snug">
                              Need personalized potency or dosage guidance?
                            </h4>
                            <p className="mt-2 text-xs text-muted-ink leading-relaxed">
                              Verified homeopathic physicians are available for instant audio and video consultations.
                            </p>
                          </div>
                          <div className="mt-5">
                            <Button asChild size="sm" variant="brand" className="w-full text-xs font-semibold">
                              <Link href="/care">Find a Doctor</Link>
                            </Button>
                          </div>
                        </div>
                      </li>
                    ) : null}
                  </motion.ul>
                </AnimatePresence>

                {/* Complementary remedies shelf when filter results are sparse */}
                {result.items.length > 0 && result.items.length < 4 && filterCount > 0 ? (
                  <ComplementaryRemedies
                    excludeIds={result.items.map((i) => i.id)}
                    onClearFilters={clearFilters}
                    totalAll={allFormsTotal}
                  />
                ) : null}
              </div>
            ) : (
              <FilteredEmpty view={view} result={result} onClear={clearFilters} onApply={applyFilters} />
            )}

            <Pagination state={state} result={result} hrefFor={hrefFor} />
          </div>
        </div>
      </Container>

      <MobileActionBar
        view={view}
        facets={facets}
        categoryName={result.category?.name}
        total={result.total}
        filterCount={filterCount}
        onApplyFilters={applyFilters}
        onSort={onSort}
      />
    </section>
  );
}

type Chip = { key: string; label: string; next: FilterSelection };

/** One removable chip per active filter, in the sidebar's order. */
function filterChips(view: SearchState, result: ApiProductListingResponse): Chip[] {
  const filters = filtersOf(view);
  const categoryName =
    result.facets.categories.find((c) => c.slug === filters.category)?.name ??
    (result.category?.slug === filters.category ? result.category?.name : null) ??
    filters.category;
  const brandName = (value: string) => result.facets.brands.find((b) => b.value === value)?.label ?? value;
  const without = <K extends keyof FilterSelection>(key: K, value: FilterSelection[K]) => ({ ...filters, [key]: value });

  const price =
    filters.minPrice !== null && filters.maxPrice !== null
      ? `${formatRupees(filters.minPrice)} – ${formatRupees(filters.maxPrice)}`
      : filters.minPrice !== null
        ? `From ${formatRupees(filters.minPrice)}`
        : filters.maxPrice !== null
          ? `Up to ${formatRupees(filters.maxPrice)}`
          : null;

  return [
    ...(filters.category ? [{ key: "category", label: categoryName ?? "", next: without("category", null) }] : []),
    ...filters.brand.map((brand) => ({
      key: `brand-${brand}`,
      label: brandName(brand),
      next: without("brand", filters.brand.filter((b) => b !== brand)),
    })),
    ...filters.form.map((form) => ({
      key: `form-${form}`,
      label: formLabel(form),
      next: without("form", filters.form.filter((f) => f !== form)),
    })),
    ...(price ? [{ key: "price", label: price, next: { ...filters, minPrice: null, maxPrice: null } }] : []),
    ...filters.potency.map((potency) => ({
      key: `potency-${potency}`,
      label: potencyLabel(potency),
      next: without("potency", filters.potency.filter((p) => p !== potency)),
    })),
    ...filters.pack.map((pack) => ({
      key: `pack-${pack}`,
      label: pack,
      next: without("pack", filters.pack.filter((p) => p !== pack)),
    })),
    ...(filters.discount ? [{ key: "discount", label: `${filters.discount}% off or more`, next: without("discount", null) }] : []),
    ...(filters.rating ? [{ key: "rating", label: `${filters.rating}★ & up`, next: without("rating", null) }] : []),
    ...(filters.inStock ? [{ key: "inStock", label: "In stock only", next: without("inStock", false) }] : []),
  ];
}

function ActiveFilters({
  view,
  result,
  onApply,
  onClear,
}: {
  view: SearchState;
  result: ApiProductListingResponse;
  onApply: (filters: FilterSelection) => void;
  onClear: () => void;
}) {
  const chips = filterChips(view, result);
  if (chips.length === 0) return null;

  return (
    <motion.div layout className="mb-5 overflow-hidden">
      <motion.ul layout aria-label="Active filters" className="flex flex-wrap items-center gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {chips.map((chip) => (
            <motion.li
              key={chip.key}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                aria-label={`Remove filter: ${chip.label}`}
                onClick={() => onApply(chip.next)}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-forest/25 bg-forest/6 pr-2 pl-3 text-[0.8125rem] font-medium text-forest-deep transition-colors hover:border-forest/45 hover:bg-forest/10"
              >
                {chip.label}
                <X aria-hidden className="size-3.5" />
              </button>
            </motion.li>
          ))}
          {chips.length > 1 ? (
            <motion.li
              key="clear-all"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                onClick={onClear}
                className="h-8 cursor-pointer rounded-full px-2 text-[0.8125rem] font-semibold text-forest underline-offset-4 hover:underline"
              >
                Clear all
              </button>
            </motion.li>
          ) : null}
        </AnimatePresence>
      </motion.ul>
    </motion.div>
  );
}

function SortSelect({
  value,
  onChange,
  className,
}: {
  value: ApiListingSort;
  onChange: (sort: ApiListingSort) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Relevance";

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative z-30 flex items-center gap-2.5", className)}>
      <span id="sort-label" className="text-sm whitespace-nowrap text-muted-ink">
        Sort by
      </span>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby="sort-label"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-10 min-w-48 cursor-pointer items-center justify-between gap-3 rounded-full border border-line bg-cream pr-3.5 pl-4 text-sm font-medium text-ink transition-all hover:border-forest/40 hover:bg-paper focus:outline-none focus:ring-2 focus:ring-forest/20"
        >
          <span className="truncate">{currentLabel}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-ink transition-transform duration-200",
              open && "rotate-180 text-forest",
            )}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              role="listbox"
              className="absolute right-0 top-full z-50 mt-2 min-w-52 overflow-hidden rounded-2xl border border-line-soft bg-paper p-1.5 shadow-[0_16px_40px_-8px_rgba(13,90,67,0.16),0_6px_16px_-4px_rgba(0,0,0,0.06)] ring-1 ring-ink/5"
            >
              {SORT_OPTIONS.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors duration-150",
                      isSelected
                        ? "bg-forest/10 font-semibold text-forest"
                        : "text-ink hover:bg-forest/6 hover:text-forest",
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="size-4 shrink-0 text-forest" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Tablets and phones get a thumb-reach bar instead of the sidebar. It is sticky
 * to the bottom of the results, so it follows the grid and then parks above
 * the footer instead of covering it. Filters are staged in the sheet and
 * applied together with "Show results".
 */
function MobileActionBar({
  view,
  facets,
  categoryName,
  total,
  filterCount,
  onApplyFilters,
  onSort,
}: {
  view: SearchState;
  facets: ApiFacets;
  categoryName?: string;
  total: number;
  filterCount: number;
  onApplyFilters: (filters: FilterSelection) => void;
  onSort: (sort: ApiListingSort) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterSelection>(NO_FILTERS);
  const sortLabel = SORT_OPTIONS.find((option) => option.value === view.sort)?.label ?? "Sort";
  const draftCount = activeFilterCount(draft);
  const changed = JSON.stringify(draft) !== JSON.stringify(filtersOf(view));

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    return () => lenis?.start();
  }, [open]);

  return (
    <div className="sticky bottom-0 z-30 mt-10 border-t border-line bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-2 divide-x divide-line">
        <Sheet
          open={open}
          onOpenChange={(next) => {
            if (next) setDraft(filtersOf(view));
            setOpen(next);
          }}
        >
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex h-14 cursor-pointer items-center justify-center gap-2 text-sm font-semibold text-ink"
            >
              <SlidersHorizontal aria-hidden className="size-4" strokeWidth={1.8} />
              Filters
              {filterCount > 0 ? (
                <span className="grid min-w-5 place-items-center rounded-full bg-forest px-1.5 text-[0.6875rem] leading-5 text-cream">
                  {filterCount}
                  <span className="sr-only"> active</span>
                </span>
              ) : null}
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[88dvh] gap-0 rounded-t-3xl border-line bg-cream p-0"
          >
            <SheetHeader className="flex-row items-center justify-between border-b border-line/70 px-5 py-4">
              <div>
                <SheetTitle className="text-lg font-semibold text-ink">Filters</SheetTitle>
                <SheetDescription className="text-[0.8125rem] text-muted-ink">
                  {draftCount === 0 ? "Nothing selected" : `${draftCount} selected`} · applied when you choose Show results
                </SheetDescription>
              </div>
            </SheetHeader>
            <div data-lenis-prevent className="dh-custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
              <SearchFilters facets={facets} value={draft} onChange={setDraft} categoryName={categoryName} />
            </div>
            <SheetFooter className="flex-row gap-3 border-t border-line/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button
                type="button"
                variant="brandOutline"
                size="xl"
                disabled={draftCount === 0}
                onClick={() => setDraft(NO_FILTERS)}
              >
                Clear all
              </Button>
              <Button
                type="button"
                variant="brand"
                size="xl"
                className="flex-1"
                onClick={() => {
                  if (changed) onApplyFilters(draft);
                  setOpen(false);
                }}
              >
                {changed ? "Show results" : `Show ${total} ${total === 1 ? "product" : "products"}`}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <div className="relative flex h-14 items-center justify-center gap-2 text-sm font-semibold text-ink">
          <ArrowUpDown aria-hidden className="size-4" strokeWidth={1.8} />
          <span aria-hidden className="truncate">
            {view.sort === "relevance" ? "Sort" : sortLabel}
          </span>
          {/* The native picker is the best sort control a phone has; it sits
              invisibly over the styled label and owns every interaction. */}
          <select
            aria-label="Sort by"
            value={view.sort}
            onChange={(event) => onSort(event.target.value as ApiListingSort)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  state,
  result,
  hrefFor,
}: {
  state: SearchState;
  result: ApiProductListingResponse;
  hrefFor: (state: SearchState) => string;
}) {
  if (result.pageCount <= 1) return null;
  const { page, pageCount, total, pageSize } = result;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => start + i);
  const pageClass = "grid size-10 place-items-center rounded-full text-sm font-medium transition-colors";

  const step = (target: number, label: string, icon: ReactNode) =>
    target < 1 || target > pageCount ? (
      <span aria-disabled="true" className={cn(pageClass, "cursor-not-allowed border border-line text-ink/25")}>
        {icon}
        <span className="sr-only">{label} (unavailable)</span>
      </span>
    ) : (
      <Link
        href={hrefFor({ ...state, page: target })}
        aria-label={label}
        className={cn(pageClass, "border border-line bg-cream text-ink hover:border-forest/40")}
      >
        {icon}
      </Link>
    );

  return (
    <nav aria-label="Result pages" className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line/40 pt-6">
      <div className="flex items-center gap-1.5">
        {step(page - 1, "Previous page", <ChevronLeft aria-hidden className="size-4" />)}
        {pages.map((n) => (
          <Link
            key={n}
            href={hrefFor({ ...state, page: n })}
            aria-label={`Page ${n}`}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              pageClass,
              n === page ? "bg-forest-deep text-cream shadow-soft font-semibold" : "text-muted-ink hover:bg-cream hover:text-ink",
            )}
          >
            {n}
          </Link>
        ))}
        {step(page + 1, "Next page", <ChevronRight aria-hidden className="size-4" />)}
      </div>
      <p className="text-xs text-muted-ink tabular-nums">
        Showing {first}–{last} of {total} products
      </p>
    </nav>
  );
}

function FilteredEmpty({
  view,
  result,
  onClear,
  onApply,
}: {
  view: SearchState;
  result: ApiProductListingResponse;
  onClear: () => void;
  onApply: (filters: FilterSelection) => void;
}) {
  const chips = filterChips(view, result);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-[380px] flex-col items-center justify-center rounded-card border border-dashed border-line bg-cream/70 px-6 py-14 text-center"
    >
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-sage-tint text-forest">
        <SearchX aria-hidden className="size-6" strokeWidth={1.6} />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-ink">No products match these filters</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-ink">
        {chips.length > 1
          ? "Remove one of the filters below, or clear them all to see every product."
          : "Clear the filter to see every product."}
      </p>
      {chips.length > 1 ? (
        <ul className="mt-5 flex flex-wrap justify-center gap-2">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => onApply(chip.next)}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-cream pr-2 pl-3 text-[0.8125rem] text-ink hover:border-forest/40"
              >
                Remove {chip.label}
                <X aria-hidden className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <Button type="button" variant="brand" size="xl" className="mt-6" onClick={onClear}>
        Clear all filters
      </Button>
    </motion.div>
  );
}
