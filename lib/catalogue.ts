import { repositories } from "@/lib/repositories";
import { FORM_NOUNS } from "@/lib/search/searchState";

/**
 * Directory data for /categories and /brands, assembled from contracts the
 * shop API already has — there is no category or brand endpoint of its own:
 *
 * - categories: `GET /home` (top-level categories, image, count), then one
 *   listing per category for the forms and brands it holds;
 * - brands: listing facets (`GET /products?pageSize=1` → `facets.brands`,
 *   the only complete brand list), with logos from `GET /home` where given.
 *
 * Server-side only: each call is a repository request.
 */

export type CategorySummary = {
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
  /** Dosage-form keys present in the category, most stocked first. */
  forms: string[];
  /** Brand names present in the category, most stocked first. */
  brands: string[];
};

export type BrandSummary = {
  name: string;
  slug: string;
  productCount: number;
  logoUrl: string | null;
};

export async function getCategoryDirectory(): Promise<CategorySummary[]> {
  const home = await repositories.home.getHomeData();
  const listings = await Promise.all(
    home.categories.map((category) => repositories.search.search({ category: category.slug, pageSize: 1 })),
  );
  return home.categories
    .map((category, i) => ({
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      productCount: listings[i].total,
      forms: listings[i].facets.forms.map((form) => form.value),
      brands: listings[i].facets.brands.map((brand) => brand.label ?? brand.value),
    }))
    .filter((category) => category.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount);
}

/** Every brand that has products, A–Z. */
export async function getBrandDirectory(): Promise<BrandSummary[]> {
  const [home, catalogue] = await Promise.all([
    repositories.home.getHomeData(),
    repositories.search.search({ pageSize: 1 }),
  ]);
  const logos = new Map(home.brands.map((brand) => [brand.slug, brand.logoUrl]));

  return catalogue.facets.brands
    .map((brand) => ({
      name: brand.label ?? brand.value,
      slug: brand.value,
      productCount: brand.count,
      logoUrl: logos.get(brand.value) ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}

export async function getBrand(slug: string): Promise<BrandSummary | null> {
  return (await getBrandDirectory()).find((brand) => brand.slug === slug) ?? null;
}

const list = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

/** "drops, tablets and mother tinctures" — from data, never written by hand. */
export function describeForms(forms: string[], limit = 3): string {
  const nouns = forms.slice(0, limit).map((form) => FORM_NOUNS[form] ?? form);
  if (forms.length > limit) nouns.push("more");
  return list.format(nouns);
}

/** "SBL, Bakson and 2 more" */
export function describeNames(names: string[], limit = 3): string {
  const shown = names.slice(0, limit);
  if (names.length > limit) shown.push(`${names.length - limit} more`);
  return list.format(shown);
}
