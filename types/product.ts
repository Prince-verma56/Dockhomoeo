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
  form: ProductForm;
  /** Potency or pack size, shown as the card's secondary line. */
  variant: string;
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
};

/** A health goal entry in the category explorer. */
export type HealthGoal = {
  id: string;
  name: string;
  icon: IconName;
  href: string;
  image?: string;
};

