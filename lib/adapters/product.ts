import { ApiProductCard, ApiProductDetail, ApiProductVariant } from "@/types/api/product";
import { ProductCardViewModel, ProductDetailViewModel, ProductVariantViewModel } from "@/types/view-models/product";

// Fallback image for UI presentation when backend image is null
const DEFAULT_PRODUCT_IMAGE = "/images/products/placeholder.jpg";

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function mapProductCardToViewModel(apiCard: ApiProductCard): ProductCardViewModel {
  const hasDiscount = apiCard.mrp > apiCard.price && apiCard.discountPercent > 0;

  return {
    id: apiCard.id.toString(),
    name: apiCard.name,
    slug: apiCard.slug,
    brand: apiCard.brandName || "DocHomo",
    form: apiCard.form || "Lotion",
    imageUrl: apiCard.imageUrl || DEFAULT_PRODUCT_IMAGE,
    displayPrice: formatPrice(apiCard.price),
    displayMrp: hasDiscount ? formatPrice(apiCard.mrp) : null,
    discountBadge: hasDiscount ? `${apiCard.discountPercent}% OFF` : null,
    ratingValue: apiCard.rating || 0,
    reviewCount: apiCard.ratingCount || 0,
    inStock: apiCard.inStock,
    isBestseller: apiCard.sold > 50, // UI derived presentation state
  };
}

export function mapVariantToViewModel(apiVariant: ApiProductVariant): ProductVariantViewModel {
  const hasDiscount = apiVariant.mrp > apiVariant.price && apiVariant.discountPercent > 0;
  
  return {
    id: apiVariant.id.toString(),
    sku: apiVariant.sku,
    title: apiVariant.title,
    packSize: apiVariant.packSize || "Standard",
    displayPrice: formatPrice(apiVariant.price),
    displayMrp: hasDiscount ? formatPrice(apiVariant.mrp) : null,
    discountBadge: hasDiscount ? `${apiVariant.discountPercent}% OFF` : null,
    inStock: apiVariant.inStock,
    stockMessage: apiVariant.stockLeft && apiVariant.stockLeft <= 5 ? `Only ${apiVariant.stockLeft} left in stock` : null,
    isDefault: apiVariant.isDefault,
  };
}

export function mapProductDetailToViewModel(apiDetail: ApiProductDetail): ProductDetailViewModel {
  return {
    id: apiDetail.id.toString(),
    name: apiDetail.name,
    slug: apiDetail.slug,
    brand: apiDetail.brand?.name || "DocHomo",
    form: apiDetail.form || "Lotion",
    description: apiDetail.description || apiDetail.shortDescription || "",
    composition: apiDetail.composition || "",
    indications: apiDetail.indications || "",
    directions: apiDetail.directions || "",
    safetyInfo: apiDetail.safetyInfo || "",
    ratingValue: apiDetail.ratingAverage || 0,
    reviewCount: apiDetail.ratingCount || 0,
    images: apiDetail.images.length > 0 
      ? apiDetail.images.map(img => ({ url: img.url, altText: img.altText || apiDetail.name }))
      : [{ url: DEFAULT_PRODUCT_IMAGE, altText: apiDetail.name }],
    variants: apiDetail.variants.map(mapVariantToViewModel),
    relatedProducts: apiDetail.related.map(mapProductCardToViewModel),
  };
}
