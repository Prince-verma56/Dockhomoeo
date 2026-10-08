export interface ProductCardViewModel {
  id: string;
  name: string;
  slug: string;
  brand: string;
  form: string;
  imageUrl: string;
  displayPrice: string;
  displayMrp: string | null;
  discountBadge: string | null;
  ratingValue: number;
  reviewCount: number;
  inStock: boolean;
  isBestseller: boolean;
}

export interface ProductVariantViewModel {
  id: string;
  sku: string;
  title: string;
  packSize: string;
  displayPrice: string;
  displayMrp: string | null;
  discountBadge: string | null;
  inStock: boolean;
  stockMessage: string | null;
  isDefault: boolean;
}

export interface ProductDetailViewModel {
  id: string;
  name: string;
  slug: string;
  brand: string;
  form: string;
  description: string;
  composition: string;
  indications: string;
  directions: string;
  safetyInfo: string;
  ratingValue: number;
  reviewCount: number;
  images: { url: string; altText: string }[];
  variants: ProductVariantViewModel[];
  relatedProducts: ProductCardViewModel[];
}
