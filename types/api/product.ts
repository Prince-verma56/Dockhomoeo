/**
 * One product in a listing or rail: the backend's `toCard` (catalog-index.ts),
 * priced by the pack shown. It carries no dosage form and no sales count; the
 * listing's `facets.forms` is where forms are counted.
 */
export interface ApiProductCard {
  id: number;
  name: string;
  slug: string;
  brandName: string | null;
  imageUrl: string | null;
  /** The pack the card shows and adds to the cart. */
  variantId: number;
  variantTitle: string | null;
  /** How many packs the product has; more than one means the product page offers a choice. */
  variantCount: number;
  price: number;
  mrp: number;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  inStock: boolean;
  requiresPrescription: boolean;
  /** Only for an approved wholesale account. */
  wholesalePrice?: number;
}

export interface ApiProductVariant {
  id: number;
  sku: string;
  title: string;
  packSize: string | null;
  potency: string | null;
  isDefault: boolean;
  mrp: number;
  price: number;
  discountPercent: number;
  inStock: boolean;
  stockLeft: number | null;
  minQuantity: number;
  maxQuantity: number;
  wholesale: { unitPrice: number; source: string } | null;
}

export interface ApiProductImage {
  url: string;
  altText: string | null;
  variantId: number | null;
}

export interface ApiProductReview {
  id: number;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  isVerifiedBuyer: boolean;
  createdAt: string | Date;
}

export interface ApiSeo {
  title: string | null;
  description: string | null;
  path: string;
  image: string | null;
}

export interface ApiTrail {
  name: string;
  slug: string;
}

export interface ApiProductDetail {
  id: number;
  name: string;
  slug: string;
  form: string | null;
  shortDescription: string | null;
  description: string | null;
  composition: string | null;
  indications: string | null;
  directions: string | null;
  safetyInfo: string | null;
  manufacturer: string | null;
  countryOfOrigin: string | null;
  requiresPrescription: boolean;
  /** Pay-on-delivery allowed for this product. */
  allowCod: boolean;
  /** Online payment allowed for this product. */
  allowPrepaid: boolean;
  ratingAverage: number;
  ratingCount: number;
  brand: { name: string; slug: string; logoUrl: string | null } | null;
  images: ApiProductImage[];
  variants: ApiProductVariant[];
  reviews: ApiProductReview[];
  seo: ApiSeo;
  trail: ApiTrail[];
  related: ApiProductCard[];
  wholesale: boolean;
}
