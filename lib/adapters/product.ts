import type { ApiProductCard, ApiProductDetail } from "@/types/api/product";
import type { Product, ProductForm } from "@/types/product";

const PRODUCT_FORMS: readonly ProductForm[] = ["drops", "tablets", "tincture", "cream", "oil"];

/**
 * Maps a listing card onto the `Product` shape `ProductCard` renders.
 *
 * No badge is derived: the API card carries no merchandising flag, and
 * types/product.ts forbids inferring one from sales or price. An unknown form
 * only picks the placeholder glyph, so it falls back rather than failing.
 */
export function mapApiCardToProduct(card: ApiProductCard): Product {
  return {
    id: String(card.id),
    slug: card.slug,
    name: card.name,
    brand: card.brandName ?? "",
    form: PRODUCT_FORMS.find((form) => form === card.form) ?? "drops",
    variant: card.variantTitle ?? "",
    price: { amount: card.price, currency: "INR" },
    compareAtPrice: card.mrp > card.price ? { amount: card.mrp, currency: "INR" } : undefined,
    rating: card.ratingCount > 0 ? { value: card.rating, count: card.ratingCount } : undefined,
    tone: "amber",
    mediaLabel: card.name,
    image: card.imageUrl ?? undefined,
    variantId: card.variantId,
  };
}

/**
 * A product page's data (GET /api/shop/products/:slug) as a card, priced by
 * its default pack. Null when nothing is on sale, so no card shows a price
 * that cannot be bought.
 */
export function mapProductDetailToProduct(detail: ApiProductDetail): Product | null {
  const pack = detail.variants.find((variant) => variant.isDefault) ?? detail.variants[0];
  if (!pack) return null;
  return {
    id: String(detail.id),
    slug: detail.slug,
    name: detail.name,
    brand: detail.brand?.name ?? "",
    form: PRODUCT_FORMS.find((form) => form === detail.form) ?? "drops",
    variant: pack.title,
    price: { amount: pack.price, currency: "INR" },
    compareAtPrice: pack.mrp > pack.price ? { amount: pack.mrp, currency: "INR" } : undefined,
    rating: detail.ratingCount > 0 ? { value: detail.ratingAverage, count: detail.ratingCount } : undefined,
    tone: "amber",
    mediaLabel: detail.name,
    image: detail.images[0]?.url,
    variantId: pack.inStock ? pack.id : undefined,
  };
}
