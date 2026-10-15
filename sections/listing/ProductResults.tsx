"use client";

import { useId, useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
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
import {
  NO_FILTERS,
  SORT_OPTIONS,
  activeFilterCount,
  formLabel,
  type FilterSelection,
  type SearchState,
} from "@/lib/search/searchState";
import type { ApiFacets, ApiListingSort, ApiProductListingResponse } from "@/types/api/search";
import { SearchFilters, hasFacetOptions } from "@/sections/search/SearchFilters";

/**
 * URL-driven listing state shared by /search and brand pages: controls update
 * at once through `useOptimistic`, the server answers through a transition,
 * and the page tree is never remounted, so focus stays on the control used.
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

const pickFilters = ({ category, brand, form }: FilterSelection): FilterSelection => ({
  category,
  brand,
  form,
});

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
    <section aria-label={label} className="pt-8 lg:py-10">
      <Container>
        <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 xl:gap-14">
          <aside aria-labelledby="filters-heading" className="hidden lg:block">
            <div className="dh-no-scrollbar sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pb-6">
              <div className="mb-5 flex items-center justify-between">
                <h2
                  id="filters-heading"
                  className="flex items-center gap-2 text-base font-semibold text-ink"
                >
                  <SlidersHorizontal aria-hidden className="size-4" strokeWidth={1.8} />
                  Filters
                </h2>
                {filterCount > 0 ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-md px-1 text-[0.8125rem] font-semibold text-forest underline-offset-4 hover:underline"
                  >
                    Clear all
                  </button>
                ) : null}
              </div>
              <SearchFilters facets={facets} value={view} onChange={applyFilters} />
            </div>
          </aside>

          {/* Focus lands here when a pressed control disappears (a removed chip,
              "Clear all"): the next Tab reaches the first result. It is not in
              the tab order, so it carries no ring of its own. */}
          <div ref={resultsTopRef} tabIndex={-1} className="min-w-0 outline-none!">
            <div
              className={cn(
                "mb-5 flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-lg",
                // On phones sort lives in the bottom bar, so with no filters to
                // show this row would be empty space above the first products.
                filterCount > 0 ? "flex" : "hidden lg:flex",
              )}
            >
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
              <SortControl value={view.sort} onChange={onSort} className="ml-auto hidden lg:flex" />
            </div>

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
              <FilteredEmpty onClear={clearFilters} />
            )}

            <Pagination state={state} result={result} hrefFor={hrefFor} />
          </div>
        </div>
      </Container>

      <MobileActionBar
        view={view}
        facets={facets}
        filterCount={filterCount}
        onApplyFilters={applyFilters}
        onSort={onSort}
      />
    </section>
  );
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
  const filters = pickFilters(view);
  if (activeFilterCount(filters) === 0) return null;

  const categoryName =
    result.facets.categories.find((c) => c.slug === filters.category)?.name ??
    (result.category?.slug === filters.category ? result.category?.name : null) ??
    filters.category;
  const brandName = (value: string) =>
    result.facets.brands.find((b) => b.value === value)?.label ?? value;

  const chips = [
    ...(filters.category
      ? [{ key: "category", label: categoryName ?? "", next: { ...filters, category: null } }]
      : []),
    ...filters.brand.map((brand) => ({
      key: `brand-${brand}`,
      label: brandName(brand),
      next: { ...filters, brand: filters.brand.filter((b) => b !== brand) },
    })),
    ...filters.form.map((form) => ({
      key: `form-${form}`,
      label: formLabel(form),
      next: { ...filters, form: filters.form.filter((f) => f !== form) },
    })),
  ];

  return (
    <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            aria-label={`Remove filter: ${chip.label}`}
            onClick={() => onApply(chip.next)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-forest/25 bg-forest/6 pr-2.5 pl-3.5 text-[0.8125rem] font-medium text-forest-deep transition-colors hover:border-forest/45 hover:bg-forest/10"
          >
            {chip.label}
            <X aria-hidden className="size-3.5" />
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={onClear}
          className="h-9 rounded-full px-2 text-[0.8125rem] font-semibold text-forest underline-offset-4 hover:underline"
        >
          Clear all
        </button>
      </li>
    </ul>
  );
}

function SortControl({
  value,
  onChange,
  className,
}: {
  value: ApiListingSort;
  onChange: (sort: ApiListingSort) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("items-center gap-3", className)}>
      <label htmlFor={id} className="text-sm whitespace-nowrap text-muted-ink">
        Sort by
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as ApiListingSort)}
          className="h-10 cursor-pointer appearance-none rounded-full border border-line bg-cream pr-10 pl-4 text-sm font-medium text-ink transition-colors hover:border-forest/30"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-ink"
        />
      </div>
    </div>
  );
}

/**
 * Phones get a thumb-reach bar instead of a squeezed sidebar. It is sticky to
 * the bottom of the results, so it follows the grid and then parks above the
 * footer instead of covering it. Filters are staged in the sheet and applied
 * together, which keeps the sheet open and the result count stable meanwhile.
 */
function MobileActionBar({
  view,
  facets,
  filterCount,
  onApplyFilters,
  onSort,
}: {
  view: SearchState;
  facets: ApiFacets;
  filterCount: number;
  onApplyFilters: (filters: FilterSelection) => void;
  onSort: (sort: ApiListingSort) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterSelection>(NO_FILTERS);
  const sortLabel = SORT_OPTIONS.find((option) => option.value === view.sort)?.label ?? "Sort";
  const draftCount = activeFilterCount(draft);

  return (
    <div className="sticky bottom-0 z-30 mt-10 border-t border-line bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-2 divide-x divide-line">
        <Sheet
          open={open}
          onOpenChange={(next) => {
            if (next) setDraft(pickFilters(view));
            setOpen(next);
          }}
        >
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex h-14 items-center justify-center gap-2 text-sm font-semibold text-ink"
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
            className="max-h-[85dvh] gap-0 rounded-t-3xl border-line bg-cream p-0"
          >
            <SheetHeader className="border-b border-line/70 px-5 py-4">
              <SheetTitle className="text-lg font-semibold text-ink">Filters</SheetTitle>
              <SheetDescription className="sr-only">
                {view.q ? `Narrow the results for “${view.q}”.` : "Narrow these products."} Changes
                apply when you choose Show results.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <SearchFilters facets={facets} value={draft} onChange={setDraft} />
            </div>
            <SheetFooter className="flex-row gap-3 border-t border-line/70 p-4">
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
                  onApplyFilters(draft);
                  setOpen(false);
                }}
              >
                Show results
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
  const pageClass =
    "grid size-10 place-items-center rounded-full text-sm font-medium transition-colors";

  const step = (target: number, label: string, icon: ReactNode) =>
    target < 1 || target > pageCount ? (
      <span aria-hidden className={cn(pageClass, "border border-line text-ink/30")}>
        {icon}
      </span>
    ) : (
      <Link
        href={hrefFor({ ...state, page: target })}
        aria-label={label}
        className={cn(pageClass, "border border-line text-ink hover:border-forest/40 hover:bg-cream")}
      >
        {icon}
      </Link>
    );

  return (
    <nav aria-label="Result pages" className="mt-12 flex items-center justify-center gap-1.5">
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
    </nav>
  );
}

function FilteredEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-cream/60 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-ink">No products match these filters</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-ink">
        Remove a filter above, or clear them all to see every result.
      </p>
      <Button type="button" variant="brand" size="xl" className="mt-6" onClick={onClear}>
        Clear all filters
      </Button>
    </div>
  );
}
