import type { ApiProductCard, ApiProductDetail } from "@/types/api/product";
import type { Product, ProductForm } from "@/types/product";

/**
 * The pack an illustration draws when the shop has no photo. Listing cards,
 * cart lines and order items carry no dosage form (the backend's `toCard`
 * leaves it out), so the one rule every context shares is what the product's
 * own name and pack title state ("… Tablets", "… Tube", "… Oil", "… Q").
 * Nothing is guessed: when they state no form the answer is null and a plain
 * carton is drawn. Used for that drawing only; never shown as a fact or used
 * to filter (the product page shows its real `form` as text).
 */
export function packFormFromText(...parts: (string | null | undefined)[]): ProductForm | null {
  const text = parts.filter(Boolean).join(" ").toLowerCase();
  if (/\b(tablets?|tabs?|pills?|pellets?|globules?|biochemics?)\b/.test(text)) return "tablets";
  if (/\b(creams?|ointments?|gels?|balms?|tubes?)\b/.test(text)) return "cream";
  if (/\boils?\b/.test(text)) return "oil";
  if (/\b(mother tinctures?|tinctures?|q)\b/.test(text)) return "tincture";
  if (/\b(drops|dilutions?)\b/.test(text)) return "drops";
  return null;
}

/**
 * Maps a listing card onto the `Product` shape `ProductCard` renders.
 *
 * No badge is derived: the API card carries no merchandising flag, and
 * types/product.ts forbids inferring one from sales or price. The card has no
 * dosage form, so the placeholder pack follows the shared rule (above).
 */
export function mapApiCardToProduct(card: ApiProductCard): Product {
  return {
    id: String(card.id),
    slug: card.slug,
    name: card.name,
    brand: card.brandName ?? "",
    form: packFormFromText(card.variantTitle, card.name),
    variant: card.variantTitle ?? "",
    price: { amount: card.price, currency: "INR" },
    compareAtPrice: card.mrp > card.price ? { amount: card.mrp, currency: "INR" } : undefined,
    rating: card.ratingCount > 0 ? { value: card.rating, count: card.ratingCount } : undefined,
    tone: "amber",
    mediaLabel: card.name,
    image: card.imageUrl ?? undefined,
    // Out of stock: nothing to add, so the card shows no Add button.
    variantId: card.inStock ? card.variantId : undefined,
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
    // The same drawing rule as the product's card, so it looks the same everywhere.
    form: packFormFromText(pack.title, detail.name),
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
