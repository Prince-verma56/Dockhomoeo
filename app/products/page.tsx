import { Metadata } from "next";
import { redirect } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { listingHref, parseSearchState, toSearchFilters } from "@/lib/search/searchState";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { ShopView } from "@/sections/shop/ShopView";

export const metadata: Metadata = {
  title: "Shop homoeopathic remedies",
  description: "Browse our premium selection of authentic homoeopathic medicines and products.",
};

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  // URL → listing state → repository filters: the same path /search and brand pages take.
  const state = parseSearchState(await searchParams);
  const result = await repositories.search.search(toSearchFilters(state));

  // A page past the end (an old link, a narrowed filter) goes to the last real one.
  if (result.items.length === 0 && result.total > 0) {
    redirect(listingHref("/products", { ...state, page: result.pageCount }));
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <SiteHeader />
      <main id="main" className="flex-1 pt-[72px]">
        <ShopView state={state} result={result} />
      </main>
      <SiteFooter />
    </div>
  );
}
