"use client";

import { useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ChevronLeft, ChevronRight, SearchX, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { formatRupees } from "@/lib/formatters/price";
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
  emptyState,
}: ProductResultsProps) {
  const resultsTopRef = useRef<HTMLDivElement>(null);
  const facets: ApiFacets = hideBrandFacet ? { ...result.facets, brands: [] } : result.facets;
  const filterCount = activeFilterCount(view);
  const showFilters = hasFacetOptions(facets) || filterCount > 0;

  const applyFilters = (filters: FilterSelection) => onRefine(filters);
  const clearFilters = () => {
    onRefine(NO_FILTERS);
    // The control that was pressed is about to disappear; keep focus nearby.
    resultsTopRef.current?.focus();
  };
  const onSort = (sort: ApiListingSort) => onRefine({ sort });

  if (!showFilters) {
    return (
      <section aria-label={label} className="py-10 lg:py-14">
        <Container>{emptyState}</Container>
      </section>
    );
  }

  return (
    <section aria-label={label} className="pt-6 pb-4 lg:pt-10 lg:pb-16">
      <Container>
        <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[16.5rem_minmax(0,1fr)] xl:gap-12">
          <aside aria-labelledby="filters-heading" className="hidden lg:block">
            {/* Sticky below the fixed header and never taller than the
                viewport; it scrolls on its own when every group is open. */}
            <div
              data-lenis-prevent
              className="dh-no-scrollbar sticky top-24 max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain rounded-2xl dh-card px-5 pt-4 pb-2"
            >
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
              "Clear all"): the next Tab reaches the first result. It is not in
              the tab order, so it carries no ring of its own. */}
          <div ref={resultsTopRef} tabIndex={-1} className="min-w-0 outline-none!">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p role="status" className="text-sm text-muted-ink">
                <ResultCount result={result} filtered={filterCount > 0} />
              </p>
              <SortSelect value={view.sort} onChange={onSort} className="hidden lg:flex" />
            </div>

            <ActiveFilters
              view={view}
              result={result}
              onApply={(filters) => {
                applyFilters(filters);
                // The chip that was pressed is gone; keep focus nearby.
                resultsTopRef.current?.focus();
              }}
              onClear={clearFilters}
            />

            {result.items.length > 0 ? (
              <ul
                aria-busy={pending || undefined}
                className={cn(
                  "grid grid-cols-2 gap-3 transition-opacity duration-200 sm:gap-5 md:grid-cols-3 xl:grid-cols-4",
                  pending && "opacity-60",
                )}
              >
                {result.items.map((item, index) => (
                  <li
                    key={item.id}
                    // A short, capped stagger: cards settle as one gesture rather
                    // than queueing, and reduced motion skips it entirely.
                    className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:fill-mode-both"
                    style={{
                      animationDelay: `${Math.min(index, 7) * 45}ms`,
                      animationDuration: "var(--duration-medium)",
                      animationTimingFunction: "var(--ease-premium)",
                    }}
                  >
                    <ProductCard product={mapApiCardToProduct(item)} eager={index < 4} />
                  </li>
                ))}
              </ul>
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
    <ul aria-label="Active filters" className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            aria-label={`Remove filter: ${chip.label}`}
            onClick={() => onApply(chip.next)}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-forest/25 bg-forest/6 pr-2 pl-3 text-[0.8125rem] font-medium text-forest-deep transition-colors hover:border-forest/45 hover:bg-forest/10"
          >
            {chip.label}
            <X aria-hidden className="size-3.5" />
          </button>
        </li>
      ))}
      {chips.length > 1 ? (
        <li>
          <button
            type="button"
            onClick={onClear}
            className="h-8 cursor-pointer rounded-full px-2 text-[0.8125rem] font-semibold text-forest underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        </li>
      ) : null}
    </ul>
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
  return (
    <div className={cn("items-center gap-2.5", className)}>
      <span id="sort-label" className="text-sm whitespace-nowrap text-muted-ink">
        Sort by
      </span>
      <Select value={value} onValueChange={(next) => onChange(next as ApiListingSort)}>
        <SelectTrigger
          aria-labelledby="sort-label"
          className="h-10! min-w-48 cursor-pointer rounded-full border-line bg-cream pr-3 pl-4 text-sm font-medium text-ink hover:border-forest/35"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="end" className="rounded-xl border-line bg-cream">
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="cursor-pointer rounded-lg py-2">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
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
  const { page, pageCount } = result;
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
    <nav aria-label="Result pages" className="mt-12 flex flex-col items-center gap-3">
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
              n === page ? "bg-forest-deep text-cream shadow-soft" : "text-muted-ink hover:bg-cream hover:text-ink",
            )}
          >
            {n}
          </Link>
        ))}
        {step(page + 1, "Next page", <ChevronRight aria-hidden className="size-4" />)}
      </div>
      <p className="text-xs text-muted-ink">
        Page {page} of {pageCount}
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
    <div className="rounded-card border border-dashed border-line bg-cream/70 px-6 py-14 text-center">
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
    </div>
  );
}
