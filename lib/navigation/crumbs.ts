import { formLabel, listingHref, type SearchState } from "@/lib/search/searchState";
import type { ApiProductDetail } from "@/types/api/product";
import type { ApiProductListingResponse } from "@/types/api/search";

export type Crumb = { name: string; href: string };

/**
 * Standardized Breadcrumb trails across the DocHomoeo storefront.
 * Canonical hierarchies:
 * - Product detail: Home > Products > Product Name
 * - Brand detail: Home > Brands > Brand Name
 * - Category directory: Home > Categories
 * - Brand directory: Home > Brands
 * - Search results: Home > Search > Search Query
 * - Cart: Home > Cart
 * - Checkout: Home > Cart > Checkout
 * - Order confirmation: Home > Cart > Checkout > Order Confirmation
 */

/** Product detail: Products -> Product Name */
export function productCrumbs(product: ApiProductDetail): Crumb[] {
  return [
    { name: "Products", href: "/products" },
    { name: product.name, href: `/product/${product.slug}` },
  ];
}

/** Cart: Home > Cart */
export function cartCrumbs(): Crumb[] {
  return [{ name: "Cart", href: "/cart" }];
}

/** Checkout: Home > Cart > Checkout */
export function checkoutCrumbs(): Crumb[] {
  return [
    { name: "Cart", href: "/cart" },
    { name: "Checkout", href: "/checkout" },
  ];
}

/** Order confirmation: Home > Cart > Checkout > Order Confirmation */
export function orderConfirmationCrumbs(): Crumb[] {
  return [
    { name: "Cart", href: "/cart" },
    { name: "Checkout", href: "/checkout" },
    { name: "Order Confirmation", href: "/thankyou" },
  ];
}

/** Brand detail: Home > Brands > Brand Name */
export function brandCrumbs(brandName: string, brandSlug: string): Crumb[] {
  return [
    { name: "Brands", href: "/brands" },
    { name: brandName, href: `/brands/${brandSlug}` },
  ];
}

/** Brand directory: Home > Brands */
export function brandDirectoryCrumbs(): Crumb[] {
  return [{ name: "Brands", href: "/brands" }];
}

/** Category directory: Home > Categories */
export function categoryDirectoryCrumbs(): Crumb[] {
  return [{ name: "Categories", href: "/categories" }];
}

/** Search results: Home > Search > Search Query */
export function searchCrumbs(query: string): Crumb[] {
  return [
    { name: "Search", href: "/search" },
    { name: query, href: `/search?q=${encodeURIComponent(query)}` },
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
  return { title: "All remedies", crumbs: [all] };
}
