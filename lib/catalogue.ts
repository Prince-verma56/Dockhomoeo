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

const DEFAULT_CATEGORY_FALLBACKS: CategorySummary[] = [
  { name: "Immunity", slug: "immunity", imageUrl: "/Images/HealthGoals/immunity.webp", productCount: 124, forms: ["drops", "tablets"], brands: ["Dr. Reckeweg", "SBL"] },
  { name: "Skin Care", slug: "skin-care", imageUrl: "/Images/HealthGoals/skincare.webp", productCount: 86, forms: ["cream", "drops"], brands: ["Bakson", "SBL"] },
  { name: "Sleep & Stress", slug: "sleep-stress", imageUrl: "/Images/HealthGoals/sleep-stress.webp", productCount: 72, forms: ["tablets", "drops"], brands: ["Dr. Reckeweg", "Lord's"] },
  { name: "Digestive Health", slug: "digestive", imageUrl: "/Images/HealthGoals/digestive.webp", productCount: 64, forms: ["drops", "tablets"], brands: ["Schwabe", "ADEL"] },
  { name: "Women's Health", slug: "womens-health", imageUrl: "/Images/HealthGoals/womens-health.webp", productCount: 58, forms: ["tincture", "tablets"], brands: ["SBL", "Schwabe"] },
  { name: "Joint & Bone", slug: "joint-bone", imageUrl: "/Images/HealthGoals/joint-bone.webp", productCount: 46, forms: ["tablets", "cream"], brands: ["Bakson", "Dr. Reckeweg"] },
];

const DEFAULT_BRAND_FALLBACKS: BrandSummary[] = [
  { name: "ADEL", slug: "adel-test", productCount: 14, logoUrl: "/Images/brands/adel.png" },
  { name: "Bakson", slug: "bakson-test", productCount: 22, logoUrl: "/Images/brands/bakson.png" },
  { name: "Boiron", slug: "boiron-test", productCount: 18, logoUrl: "/Images/brands/boiron.png" },
  { name: "Dr. Reckeweg", slug: "dr-reckeweg-test", productCount: 36, logoUrl: "/Images/brands/reckeweg.png" },
  { name: "Lord's", slug: "lords-test", productCount: 19, logoUrl: "/Images/brands/lords.png" },
  { name: "Medisynth", slug: "medisynth-test", productCount: 12, logoUrl: "/Images/brands/medisynth.png" },
  { name: "SBL", slug: "sbl-test", productCount: 48, logoUrl: "/Images/brands/sbl.png" },
  { name: "Schwabe", slug: "schwabe-test", productCount: 30, logoUrl: "/Images/brands/schwabe.png" },
  { name: "Similia", slug: "similia-test", productCount: 8, logoUrl: "/Images/brands/similia.png" },
  { name: "Weleda", slug: "weleda-test", productCount: 16, logoUrl: "/Images/brands/weleda.png" },
];

export async function getCategoryDirectory(): Promise<CategorySummary[]> {
  try {
    const home = await repositories.home.getHomeData();
    if (!home.categories || home.categories.length === 0) return DEFAULT_CATEGORY_FALLBACKS;

    const listings = await Promise.all(
      home.categories.map((category) => repositories.search.search({ category: category.slug, pageSize: 1 })),
    );
    const result = home.categories
      .map((category, i) => ({
        name: category.name,
        slug: category.slug,
        imageUrl: category.imageUrl,
        productCount: listings[i]?.total || category.productCount || 0,
        forms: (listings[i]?.facets?.forms ?? []).map((form) => form.value),
        brands: (listings[i]?.facets?.brands ?? []).map((brand) => brand.label ?? brand.value),
      }))
      .filter((category) => category.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount);

    return result.length > 0 ? result : DEFAULT_CATEGORY_FALLBACKS;
  } catch {
    return DEFAULT_CATEGORY_FALLBACKS;
  }
}

/** Every brand that has products, A–Z. */
export async function getBrandDirectory(): Promise<BrandSummary[]> {
  try {
    const [home, catalogue] = await Promise.all([
      repositories.home.getHomeData(),
      repositories.search.search({ pageSize: 1 }),
    ]);
    const logos = new Map(home.brands.map((brand) => [brand.slug, brand.logoUrl]));

    const result = (catalogue?.facets?.brands ?? [])
      .map((brand) => ({
        name: brand.label ?? brand.value,
        slug: brand.value,
        productCount: brand.count,
        logoUrl: logos.get(brand.value) ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

    return result.length > 0 ? result : DEFAULT_BRAND_FALLBACKS;
  } catch {
    return DEFAULT_BRAND_FALLBACKS;
  }
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
