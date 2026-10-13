"use client";

import { listingHref, type SearchState } from "@/lib/search/searchState";
import type { ApiProductListingResponse } from "@/types/api/search";
import { ProductResults, useListingNavigation } from "@/sections/listing/ProductResults";

/**
 * A brand's products with the same filters, sort and pagination as /search.
 * The brand comes from the route, so it never appears in the URL or as a
 * filter group.
 */
export function BrandListing({
  slug,
  brandName,
  state,
  result,
}: {
  slug: string;
  brandName: string;
  state: SearchState;
  result: ApiProductListingResponse;
}) {
  const hrefFor = (next: SearchState) => listingHref(`/brands/${slug}`, { ...next, q: "", brand: [] });
  const { view, isPending, refine } = useListingNavigation(state, hrefFor);

  return (
    <ProductResults
      state={state}
      view={view}
      result={result}
      pending={isPending}
      hrefFor={hrefFor}
      onRefine={refine}
      label={`${brandName} products`}
      hideBrandFacet
      emptyState={
        <p className="rounded-card border border-dashed border-line bg-cream/60 px-6 py-12 text-center text-muted-ink">
          No {brandName} products are available right now.
        </p>
      }
    />
  );
}
