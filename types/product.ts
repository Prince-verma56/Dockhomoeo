import type { IconName, Price, Rating } from "./common";
import type { GlassTone } from "@/components/commerce/ProductGlyph";

/** Dosage form. Drives both merchandising filters and the placeholder glyph. */
export type ProductForm = "drops" | "tablets" | "tincture" | "cream" | "oil";

/**
 * Badges are rendered only when the field is present. Nothing is inferred from
 * price or rating, so a product never shows a claim the data did not make
 * (brain/00_MASTER_RULES.md rule 10).
 */
export type ProductBadgeKind =
  | "bestseller"
  | "popular"
  | "trending"
  | "new"
  | "for-pain"
  | "for-skin";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  /** The pack the illustration draws; null when the product does not state its form (a plain carton). */
  form: ProductForm | null;
  /** Potency or pack size, shown as the card's secondary line. */
  variant: string;
  /**
   * The potency printed on the pack ("30C", "6X", "Q"), when the product has
   * one. Combination remedies, creams and oils have none. Feeds the listing's
   * potency facet, as a variant's `potency` does in the shop API.
   */
  potency?: string;
  /** The pack size as sold ("30 ml", "200 tablets"). Feeds the pack facet. */
  packSize?: string;
  price: Price;
  /** Strike-through reference price. Absent when the product is not discounted. */
  compareAtPrice?: Price;
  rating?: Rating;
  badge?: ProductBadgeKind;
  /** Placeholder art direction until real photography lands. */
  tone: GlassTone;
  /** Describes the photograph that will replace the placeholder. */
  mediaLabel: string;
  image?: string;
  /**
   * The purchasable pack behind the card. Only listing data carries it; a card
   * without one has nothing to add to the cart.
   */
  variantId?: number;
  category?: string;
  healthGoals?: string[];
  description?: string;
  ingredients?: string[];
  usage?: string;
  availability?: string;
};

/** A dosage-form collection, used by the featured collection section. */
export type ProductCollection = {
  id: string;
  name: string;
  form: ProductForm;
  tagline: string;
  productCount: number;
  tone: GlassTone;
  mediaLabel: string;
  image?: string;
  /** CSS object-position when the subject is not centred in the photograph. */
  imagePosition?: string;
};

/** A health goal entry in the category explorer. */
export type HealthGoal = {
  id: string;
  name: string;
  icon: IconName;
  href: string;
  image?: string;
};

