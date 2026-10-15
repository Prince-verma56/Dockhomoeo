"use client";

import Link from "next/link";
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductCard } from "@/components/commerce/ProductCard";
import { mapApiCardToProduct } from "@/lib/adapters/product";
import {
  NO_FILTERS,
  SORT_OPTIONS,
  activeFilterCount,
  formLabel,
  listingHref,
  type SearchState,
} from "@/lib/search/searchState";
import { useListingNavigation } from "@/sections/listing/ProductResults";
import type { ApiListingSort, ApiProductListingResponse } from "@/types/api/search";

interface ShopViewProps {
  /** The /products URL, parsed by lib/search/searchState (as /search and brand pages are). */
  state: SearchState;
  result: ApiProductListingResponse;
}

const shopHref = (state: SearchState) => listingHref("/products", state);

type FacetOption = { value: string; label: string; count: number };

/**
 * /products. The URL is the listing state: it is parsed and written through
 * lib/search/searchState, and cards come through the shared API adapter, so
 * this page, /search and brand pages send the repository the same filters.
 */
export function ShopView({ state, result }: ShopViewProps) {
  const { view, isPending, go, refine } = useListingNavigation(state, shopHref);

  const toggleFilter = (group: "brand" | "form", value: string) => {
    const current = view[group];
    refine({
      [group]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  const clearFilters = () => refine(NO_FILTERS);

  const filterCount = activeFilterCount(view);
  const brandOptions: FacetOption[] = result.facets.brands.map((b) => ({
    value: b.value,
    label: b.label ?? b.value,
    count: b.count,
  }));
  const formOptions: FacetOption[] = result.facets.forms.map((f) => ({
    value: f.value,
    label: formLabel(f.value),
    count: f.count,
  }));

  const filterGroups = (
    <div className="space-y-6">
      <FilterGroup
        title="Brands"
        options={brandOptions}
        onToggle={(val) => toggleFilter("brand", val)}
        selected={view.brand}
      />
      <div className="h-px bg-black/5" />
      <FilterGroup
        title="Forms & Formulations"
        options={formOptions}
        onToggle={(val) => toggleFilter("form", val)}
        selected={view.form}
      />
    </div>
  );

  const first = result.items.length > 0 ? (result.page - 1) * result.pageSize + 1 : 0;
  const last = Math.min(result.page * result.pageSize, result.total);

  return (
    <div className="py-6 lg:py-10">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-xs font-medium text-[#4b6b5a]">
            <li>
              <Link href="/" className="hover:text-[#1b7a54] transition-colors">Home</Link>
            </li>
            <li>
              <ChevronRight className="size-3 text-black/20" />
            </li>
            <li>
              <span className="text-[#0a2015] font-semibold" aria-current="page">Shop All Products</span>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/5">
          <div>
            <span className="inline-block text-[0.72rem] font-bold text-[#1b7a54] uppercase tracking-widest mb-1.5">
              DocHomoeo Apothecary
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#0a2015] tracking-tight mb-2">
              {state.q
                ? <>Search Results for &ldquo;{state.q}&rdquo;</>
                : result.category?.name ?? "All Products"}
            </h1>
            <p className="text-sm text-[#4b6b5a] max-w-xl">
              Authentic homoeopathic dilutions, mother tinctures, biocombinations, and wellness remedies direct from licensed labs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Sort Dropdown */}
            <div className="relative">
              <label htmlFor="shop-sort" className="sr-only">Sort products</label>
              <select
                id="shop-sort"
                aria-label="Sort by"
                className="appearance-none bg-white border border-[#d9ddd3] hover:border-[#1b7a54]/50 rounded-full h-11 pl-4 pr-10 text-xs sm:text-sm font-semibold text-[#0a2015] focus:outline-none focus:ring-2 focus:ring-[#1b7a54]/20 shadow-xs cursor-pointer transition-colors"
                value={view.sort}
                onChange={(e) => refine({ sort: e.target.value as ApiListingSort })}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-[#4b6b5a] pointer-events-none" />
            </div>

            {/* Mobile filters button */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label={filterCount > 0 ? `Filters, ${filterCount} active` : "Filters"}
                  className="lg:hidden relative flex items-center justify-center gap-2 h-11 px-4 rounded-full bg-white border border-[#d9ddd3] text-xs font-semibold text-[#0a2015] shadow-xs hover:border-[#1b7a54]/50 transition-colors"
                >
                  <SlidersHorizontal aria-hidden className="size-4" />
                  <span>Filters</span>
                  {filterCount > 0 && (
                    <span aria-hidden className="grid size-5 place-items-center rounded-full bg-[#1b7a54] text-[0.65rem] font-bold text-white">
                      {filterCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85dvh] gap-0 rounded-t-3xl bg-white p-0">
                <SheetHeader className="border-b border-black/5 px-5 py-4">
                  <SheetTitle className="text-lg font-bold text-[#0a2015]">Filters</SheetTitle>
                  <SheetDescription className="sr-only">Each choice applies immediately.</SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-6">
                  {filterGroups}
                </div>
                <SheetFooter className="flex-row gap-3 border-t border-black/5 p-4">
                  {filterCount > 0 && (
                    <Button type="button" variant="brandOutline" size="xl" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                  <SheetClose asChild>
                    <Button type="button" variant="brand" size="xl" className="flex-1">
                      Show {result.total} {result.total === 1 ? "product" : "products"}
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters Bar */}
        {filterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white rounded-2xl border border-black/5 shadow-xs">
            <span className="text-xs font-bold text-[#0a2015] uppercase tracking-wider mr-1">Active Filters:</span>
            {view.brand.map((b) => {
              const label = brandOptions.find((o) => o.value === b)?.label || b;
              return (
                <button
                  key={`brand-${b}`}
                  type="button"
                  onClick={() => toggleFilter("brand", b)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1b7a54]/10 text-[#1b7a54] hover:bg-[#1b7a54]/20 transition-colors"
                >
                  <span>{label}</span>
                  <X className="size-3" />
                </button>
              );
            })}
            {view.form.map((f) => {
              const label = formOptions.find((o) => o.value === f)?.label || formLabel(f);
              return (
                <button
                  key={`form-${f}`}
                  type="button"
                  onClick={() => toggleFilter("form", f)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1b7a54]/10 text-[#1b7a54] hover:bg-[#1b7a54]/20 transition-colors"
                >
                  <span>{label}</span>
                  <X className="size-3" />
                </button>
              );
            })}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-[#a63d2f] hover:underline ml-2"
            >
              Clear all filters
            </button>
          </div>
        )}

        <div className="flex gap-8 items-start">
          {/* Desktop Filter Sidebar Card */}
          <aside aria-labelledby="shop-filters-heading" className="hidden lg:block w-72 shrink-0 sticky top-28">
            <div className="bg-white rounded-3xl border border-[#d9ddd3]/80 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-black/5">
                <h2 id="shop-filters-heading" className="font-bold text-[#0a2015] flex items-center gap-2 text-base">
                  <SlidersHorizontal aria-hidden className="size-4 text-[#1b7a54]" />
                  Filter Remedies
                  {filterCount > 0 && (
                    <span className="size-5 rounded-full bg-[#1b7a54] text-[0.65rem] font-bold text-white flex items-center justify-center">
                      {filterCount}
                    </span>
                  )}
                </h2>
                {filterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-[#1b7a54] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {filterGroups}
            </div>
          </aside>

          {/* Product Grid */}
          <div
            aria-busy={isPending}
            className={cn("flex-1 min-w-0 transition-opacity duration-200", isPending && "opacity-60")}
          >
            {/* Results count text */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-[#4b6b5a]" aria-live="polite">
                Showing <strong className="font-semibold text-[#0a2015]">{first}–{last}</strong> of <strong className="font-semibold text-[#0a2015]">{result.total}</strong> remedies
              </p>
            </div>

            {result.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-black/10 rounded-3xl bg-white/70">
                <div aria-hidden className="size-16 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#1b7a54] mb-4">
                  <LayoutGrid className="size-8" />
                </div>
                <h2 className="text-xl font-bold text-[#0a2015] mb-2">No products found</h2>
                <p className="text-[#4b6b5a] max-w-sm mb-6 text-sm">
                  We couldn&apos;t find any remedies matching your current filter criteria. Try clearing some filters.
                </p>
                {filterCount > 0 ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="h-11 px-6 rounded-full bg-[#0a2015] text-white text-sm font-semibold hover:bg-[#153a27] transition-colors shadow-sm"
                  >
                    Clear all filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => go("/products")}
                    className="h-11 px-6 rounded-full bg-[#0a2015] text-white text-sm font-semibold hover:bg-[#153a27] transition-colors shadow-sm"
                  >
                    View all remedies
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {result.items.map((item, index) => (
                    <ProductCard key={item.id} product={mapApiCardToProduct(item)} eager={index < 4} />
                  ))}
                </div>

                <Pagination state={state} result={result} />
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

function Pagination({ state, result }: { state: SearchState; result: ApiProductListingResponse }) {
  if (result.pageCount <= 1) return null;
  const { page, pageCount } = result;
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => start + i);
  const stepClass =
    "size-10 rounded-full border border-black/10 flex items-center justify-center text-[#0a2015] transition-all";

  const step = (target: number, label: string, icon: React.ReactNode) =>
    target < 1 || target > pageCount ? (
      <span aria-hidden className={cn(stepClass, "opacity-30")}>
        {icon}
      </span>
    ) : (
      <Link href={shopHref({ ...state, page: target })} aria-label={label} className={cn(stepClass, "hover:bg-white")}>
        {icon}
      </Link>
    );

  return (
    <nav aria-label="Result pages" className="mt-16 flex items-center justify-center gap-2">
      {step(page - 1, "Previous page", <ChevronLeft aria-hidden className="size-4" />)}
      <div className="flex items-center gap-1">
        {pages.map((n) => (
          <Link
            key={n}
            href={shopHref({ ...state, page: n })}
            aria-label={`Page ${n}`}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              "grid size-10 place-items-center rounded-full text-sm font-medium transition-all",
              n === page
                ? "bg-[#0a2015] text-white shadow-md"
                : "text-[#4b6b5a] hover:bg-white hover:text-[#0a2015]",
            )}
          >
            {n}
          </Link>
        ))}
      </div>
      {step(page + 1, "Next page", <ChevronRight aria-hidden className="size-4" />)}
    </nav>
  );
}

function FilterGroup({
  title,
  options,
  onToggle,
  selected,
}: {
  title: string;
  options: FacetOption[];
  onToggle: (val: string) => void;
  selected: string[];
}) {
  if (options.length === 0) return null;

  return (
    <fieldset>
      <legend className="text-xs font-bold text-[#0a2015] uppercase tracking-wider mb-3">{title}</legend>
      <div className="space-y-1">
        {options.map((opt) => {
          const checked = selected.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={`flex items-center justify-between gap-3 px-2.5 py-2 -mx-2.5 rounded-xl cursor-pointer transition-colors ${
                checked ? "bg-[#1b7a54]/5 font-medium" : "hover:bg-[#f6f2ea]/80"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={checked}
                  onChange={() => onToggle(opt.value)}
                />
                <div
                  aria-hidden
                  className={`size-4.5 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#1b7a54] ${
                    checked
                      ? "bg-[#1b7a54] border-[#1b7a54]"
                      : "border-black/20 group-hover:border-[#1b7a54] bg-white"
                  }`}
                >
                  {checked && (
                    <svg viewBox="0 0 14 14" fill="none" className="size-3 text-white">
                      <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={`text-xs sm:text-sm truncate ${checked ? "text-[#0a2015] font-semibold" : "text-[#4b6b5a]"}`}>
                  {opt.label}
                </span>
              </div>
              <span className={`text-[0.7rem] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                checked ? "bg-[#1b7a54]/15 text-[#1b7a54]" : "bg-[#f4efe4] text-[#66716c]"
              }`}>
                {opt.count}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
