import { formLabel, listingHref, type SearchState } from "@/lib/search/searchState";
import type { ApiProductDetail } from "@/types/api/product";
import type { ApiProductListingResponse } from "@/types/api/search";

export type Crumb = { name: string; href: string };

/**
 * Breadcrumb trails that both a client view (the visible trail) and its
 * server page (the JSON-LD) need, kept here so the two never disagree.
 */

/** Products → category chain (the shop's `trail`) → the product. */
export function productCrumbs(product: ApiProductDetail): Crumb[] {
  return [
    { name: "Products", href: "/products" },
    ...product.trail.map((step) => ({ name: step.name, href: `/products?category=${encodeURIComponent(step.slug)}` })),
    { name: product.name, href: `/product/${product.slug}` },
  ];
}

const shopHref = (state: SearchState) => listingHref("/products", state);

/** The /products heading and trail, worded from what is being browsed. */
export function shopHeading(state: SearchState, result: ApiProductListingResponse): { title: string; crumbs: Crumb[] } {
  const all: Crumb = { name: "Products", href: "/products" };
  if (state.q) return { title: `Results for “${state.q}”`, crumbs: [all, { name: "Search", href: shopHref(state) }] };
  if (result.category) {
    return {
      title: result.category.name,
      crumbs: [{ name: "Categories", href: "/categories" }, { name: result.category.name, href: shopHref({ ...state, page: 1 }) }],
    };
  }
  if (state.form.length === 1) {
    const name = formLabel(state.form[0]);
    return { title: name, crumbs: [all, { name, href: shopHref({ ...state, page: 1 }) }] };
  }
  return { title: "All products", crumbs: [all] };
}
