import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { parseSearchState, searchHref, toSearchFilters } from "@/lib/search/searchState";
import { SearchView } from "@/sections/search/SearchView";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = parseSearchState(await searchParams);
  return {
    title: q ? `Search results for “${q}”` : "Search",
    description: q
      ? `Homoeopathic medicines matching “${q}” on DocHomoeo.`
      : "Search homoeopathic medicines by name, brand, dosage form or health concern.",
    // Result pages are thin, unbounded and built from whatever is typed, so
    // none of them belong in the index. `follow` still lets crawlers reach the
    // product pages they link to. No canonical: it would contradict noindex.
    robots: { index: false, follow: true },
  };
}

/**
 * Catalogue categories double as suggested searches: a category name is part
 * of every product's searchable text, so each one is known to return results.
 */
async function suggestedSearches() {
  const catalogue = await repositories.search.search({ pageSize: 1 });
  return catalogue.facets.categories.slice(0, 8).map((category) => category.name);
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const state = parseSearchState(await searchParams);

  if (!state.q) {
    return <SearchView state={state} result={null} suggestions={await suggestedSearches()} />;
  }

  const result = await repositories.search.search(toSearchFilters(state));
  // A page past the end (an old link, a narrowed search) goes to the last real one.
  if (result.items.length === 0 && result.total > 0) {
    redirect(searchHref({ ...state, page: result.pageCount }));
  }
  const suggestions = result.total === 0 ? await suggestedSearches() : [];

  return <SearchView state={state} result={result} suggestions={suggestions} />;
}
