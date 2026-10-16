"use client";

import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SearchCombobox } from "@/components/search/SearchCombobox";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { activeFilterCount, searchHref, type SearchState } from "@/lib/search/searchState";
import type { ApiProductListingResponse } from "@/types/api/search";
import { ProductResults, ResultCount, useListingNavigation } from "@/sections/listing/ProductResults";

type SearchViewProps = {
  state: SearchState;
  /** Null on the bare /search landing, before anything has been asked. */
  result: ApiProductListingResponse | null;
  /** Searches known to return results, offered on the landing and on a miss. */
  suggestions: string[];
};

/**
 * /search. Products are the page: the header is kept compact so the first
 * row of results sits in the first viewport on a phone, and every control
 * writes to the URL so a result set can be shared, bookmarked or restored
 * with the back button.
 */
export function SearchView({ state, result, suggestions }: SearchViewProps) {
  const { view, isPending, go, refine } = useListingNavigation(state, searchHref);

  return (
    <>
      <section
        aria-labelledby="search-heading"
        className="dh-band-sage pt-28 pb-8 sm:pt-32 lg:pb-10"
      >
        <Container>
          <Breadcrumb className="mb-5">
            <BreadcrumbList className="text-[0.8125rem] text-muted-ink">
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="-my-2 py-2 hover:text-forest">
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-ink">Search</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {result === null ? (
            <div className="max-w-3xl">
              <h1
                id="search-heading"
                className="font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
              >
                Search <span className="italic text-forest-deep">medicines</span>
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-ink sm:text-lg">
                Look up a remedy by name, brand, dosage form or the health concern it
                is used for.
              </p>
              <SearchCombobox
                size="lg"
                autoFocus
                className="mt-8"
                onNavigate={go}
                pending={isPending}
              />
              <SuggestedSearches items={suggestions} className="mt-8" />
            </div>
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <div className="min-w-0">
                <h1
                  id="search-heading"
                  className="font-display text-3xl leading-tight tracking-tight wrap-break-word text-ink sm:text-4xl lg:text-[2.75rem]"
                >
                  {result.total === 0 && activeFilterCount(state) === 0 ? "No results for " : "Results for "}
                  <span className="italic text-forest-deep">“{state.q}”</span>
                </h1>
                <p role="status" className="mt-2 text-sm text-muted-ink">
                  <ResultCount result={result} filtered={activeFilterCount(state) > 0} />
                </p>
              </div>
              <SearchCombobox
                defaultQuery={state.q}
                className="lg:max-w-md"
                onNavigate={go}
                pending={isPending}
              />
            </div>
          )}
        </Container>
      </section>

      {result === null ? (
        <BrowseInstead />
      ) : (
        <ProductResults
          state={state}
          view={view}
          result={result}
          pending={isPending}
          hrefFor={searchHref}
          onRefine={refine}
          label="Search results"
          emptyState={<NoResults query={state.q} suggestions={suggestions} />}
        />
      )}

    </>
  );
}

function SuggestedSearches({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <div className={className}>
      <h2 className="dh-eyebrow text-muted-ink">Suggested searches</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((term) => (
          <li key={term}>
            <Link
              href={searchHref({ q: term })}
              className="inline-flex min-h-10 items-center rounded-full border border-line bg-cream px-4 text-sm text-ink transition-colors hover:border-forest/35 hover:text-forest"
            >
              {term}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NoResults({ query, suggestions }: { query: string; suggestions: string[] }) {
  return (
    <div className="mx-auto max-w-2xl rounded-card border border-dashed border-line bg-cream/60 px-6 py-12 text-center sm:px-12">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-sage-tint text-forest">
        <SearchX aria-hidden className="size-6" strokeWidth={1.6} />
      </span>
      <h2 className="mt-5 text-xl font-semibold text-ink">Nothing matched “{query}”</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-ink">
        Check the spelling, try a shorter or more general term, or search by brand or
        health concern instead.
      </p>
      <SuggestedSearches
        items={suggestions}
        className="mt-8 [&_ul]:justify-center"
      />
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="brandOutline" size="xl">
          <Link href="/products">
            Browse all products
            <ArrowRight aria-hidden />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="xl">
          <Link href={`/doctors?q=${encodeURIComponent(query)}`}>Search doctors instead</Link>
        </Button>
      </div>
    </div>
  );
}


function BrowseInstead() {
  const links = [
    { href: "/products", label: "All products" },
    { href: "/categories", label: "Shop by category" },
    { href: "/brands", label: "Shop by brand" },
    { href: "/doctors", label: "Find a doctor" },
  ];
  return (
    <section aria-labelledby="browse-heading" className="py-10 lg:py-14">
      <Container>
        <h2 id="browse-heading" className="dh-eyebrow text-muted-ink">
          Prefer to browse?
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex items-center justify-between rounded-2xl border border-line bg-cream px-5 py-4 text-[0.9375rem] font-semibold text-ink transition-[border-color,box-shadow] hover:border-forest/30 hover:shadow-soft"
              >
                {link.label}
                <ArrowRight
                  aria-hidden
                  className="size-4 text-muted-ink transition-transform duration-300 ease-premium group-hover:translate-x-0.5 group-hover:text-forest"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
