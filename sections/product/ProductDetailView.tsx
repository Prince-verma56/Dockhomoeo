"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Heart, Minus, Plus, ShoppingBag, ShieldCheck, Truck, Star } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { ApiProductDetail, ApiProductVariant } from "@/types/api/product";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ProductBadgeKind, ProductForm } from "@/types/product";
import { useCart } from "@/components/providers/CartProvider";

interface ProductDetailViewProps {
  product: ApiProductDetail;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedVariant, setSelectedVariant] = useState<ApiProductVariant>(
    product.variants.find(v => v.isDefault) || product.variants[0]
  );
  const [quantity, setQuantity] = useState(selectedVariant?.minQuantity || 1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  // If no variants, fallback gracefully
  if (!selectedVariant) return null;

  const handleQuantityChange = (delta: number) => {
    const newQ = quantity + delta;
    if (newQ >= selectedVariant.minQuantity && newQ <= selectedVariant.maxQuantity) {
      setQuantity(newQ);
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    addItem({
      variantId: selectedVariant.id,
      quantity,
      title: product.name,
      price: selectedVariant.price,
      imageUrl: product.images[0]?.url,
      brand: product.brand?.name,
    });
    // Let the drawer handle success visually
    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  };

  return (
    <div className="py-8 lg:py-12 bg-white">
      <Container>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-[#4b6b5a]">
            {product.trail.map((t, i) => {
              const isLast = i === product.trail.length - 1;
              return (
                <li key={t.slug} className="flex items-center">
                  {isLast ? (
                    <span className="text-[#0a2015] font-medium" aria-current="page">{t.name}</span>
                  ) : (
                    <>
                      <Link href={`/${t.slug}`} className="hover:text-[#1b7a54] transition-colors">
                        {t.name}
                      </Link>
                      <ChevronRight className="size-4 mx-2 text-black/20" />
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative w-full aspect-square rounded-[2rem] bg-[#f4f7f5] border border-black/5 overflow-hidden flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent" />
              {product.images.length > 0 ? (
                <Image 
                  src={product.images[0].url} 
                  alt={product.images[0].altText || product.name} 
                  fill
                  className="object-contain p-12 z-10 hover:scale-105 transition-transform duration-500"
                  priority
                />
              ) : (
                <div className="z-10 text-center text-[#4b6b5a]">
                  <div className="size-24 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                    <span className="font-serif text-3xl font-bold text-[#0a2015] opacity-50">{product.name.charAt(0)}</span>
                  </div>
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col">
            
            {/* Brand & Title */}
            <div className="mb-6">
              {product.brand && (
                <Link href={`/products?brand=${product.brand.slug}`} className="inline-block text-sm font-semibold text-[#1b7a54] hover:underline mb-2 tracking-wide uppercase">
                  {product.brand.name}
                </Link>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold text-[#0a2015] tracking-tight mb-3">
                {product.name}
              </h1>
              
              {/* Reviews/Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`size-4 ${i < Math.round(product.ratingAverage) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} 
                    />
                  ))}
                  <span className="text-sm font-medium text-[#0a2015] ml-1">{product.ratingAverage.toFixed(1)}</span>
                </div>
                <span className="text-black/20">•</span>
                <button className="text-sm text-[#4b6b5a] hover:text-[#1b7a54] hover:underline transition-colors">
                  {product.ratingCount} reviews
                </button>
              </div>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-[#4b6b5a] text-base leading-relaxed mb-8">
                {product.shortDescription}
              </p>
            )}

            <div className="h-px w-full bg-black/5 mb-8" />

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-3xl font-bold text-[#0a2015]">
                  ₹{selectedVariant.price.toFixed(2)}
                </span>
                {selectedVariant.mrp > selectedVariant.price && (
                  <>
                    <span className="text-lg text-[#4b6b5a] line-through mb-1">
                      ₹{selectedVariant.mrp.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md mb-1.5">
                      {selectedVariant.discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-[#4b6b5a]">Inclusive of all taxes</p>
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#0a2015] mb-3">Select Size / Potency</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        selectedVariant.id === v.id 
                          ? 'border-[#1b7a54] bg-[#1b7a54]/5 text-[#1b7a54] shadow-sm'
                          : 'border-black/10 bg-white text-[#4b6b5a] hover:border-black/30'
                      }`}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Area */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center justify-between bg-[#f4f7f5] border border-black/5 rounded-full p-1 h-14 w-full sm:w-36 shrink-0">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= selectedVariant.minQuantity}
                  className="size-10 rounded-full flex items-center justify-center text-[#0a2015] hover:bg-white disabled:opacity-30 transition-colors shadow-sm"
                >
                  <Minus className="size-4" />
                </button>
                <span className="text-base font-semibold text-[#0a2015] w-8 text-center select-none">
                  {quantity}
                </span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= selectedVariant.maxQuantity}
                  className="size-10 rounded-full flex items-center justify-center text-[#0a2015] hover:bg-white disabled:opacity-30 transition-colors shadow-sm"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={!selectedVariant.inStock || isAdding}
                className="flex-1 h-14 rounded-full bg-[#0a2015] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#153a27] transition-all disabled:bg-gray-200 disabled:text-gray-400 active:scale-[0.98] shadow-lg shadow-[#0a2015]/20"
              >
                {isAdding ? (
                  <span className="animate-pulse">Adding...</span>
                ) : !selectedVariant.inStock ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingBag className="size-5" />
                    Add to Cart
                  </>
                )}
              </button>

              <button className="h-14 w-14 shrink-0 rounded-full border border-black/10 flex items-center justify-center text-[#4b6b5a] hover:text-red-500 hover:border-red-500/30 hover:bg-red-50 transition-all">
                <Heart className="size-5" />
              </button>
            </div>

            {/* Pincode Checker */}
            <div className="mb-8">
              {/* <PincodeChecker /> */}
            </div>

            {/* Trust Markers */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-black/5 mb-8">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-full bg-[#1b7a54]/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-4 text-[#1b7a54]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0a2015]">100% Authentic</div>
                  <div className="text-xs text-[#4b6b5a]">Direct from manufacturer</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-full bg-[#1b7a54]/10 flex items-center justify-center shrink-0">
                  <Truck className="size-4 text-[#1b7a54]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0a2015]">Fast Delivery</div>
                  <div className="text-xs text-[#4b6b5a]">Pan-India shipping</div>
                </div>
              </div>
            </div>

            {/* Content Accordions (Static visually for now, could use Radix UI) */}
            <div className="space-y-6">
              {product.description && (
                <div>
                  <h3 className="text-lg font-bold text-[#0a2015] mb-3">Description</h3>
                  <div className="text-[#4b6b5a] text-sm leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              )}
              {product.composition && (
                <div>
                  <h3 className="text-lg font-bold text-[#0a2015] mb-3">Composition</h3>
                  <div className="text-[#4b6b5a] text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: product.composition }} />
                </div>
              )}
              {product.indications && (
                <div>
                  <h3 className="text-lg font-bold text-[#0a2015] mb-3">Indications</h3>
                  <div className="text-[#4b6b5a] text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: product.indications }} />
                </div>
              )}
              {product.directions && (
                <div>
                  <h3 className="text-lg font-bold text-[#0a2015] mb-3">Directions for use</h3>
                  <div className="text-[#4b6b5a] text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: product.directions }} />
                </div>
              )}
              {product.safetyInfo && (
                <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-2xl">
                  <h3 className="text-sm font-bold text-amber-900 mb-2">Safety Information</h3>
                  <div className="text-amber-800 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: product.safetyInfo }} />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Related Products Rail */}
        {product.related && product.related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-black/5">
            <h2 className="text-2xl font-bold text-[#0a2015] mb-8">Frequently Bought Together</h2>
            <div className="w-full overflow-x-auto pb-8 flex gap-6 snap-x snap-mandatory hide-scrollbar">
              {product.related.map((apiItem) => {
                const productViewModel = {
                  id: String(apiItem.id),
                  slug: apiItem.slug,
                  name: apiItem.name,
                  brand: apiItem.brandName || "DocHomo",
                  form: (apiItem.form as ProductForm) || "drops",
                  variant: "Standard Pack",
                  price: { amount: apiItem.price, currency: "INR" as const },
                  compareAtPrice: apiItem.mrp > apiItem.price ? { amount: apiItem.mrp, currency: "INR" as const } : undefined,
                  rating: { value: apiItem.rating, count: apiItem.ratingCount },
                  badge: (apiItem.sold > 300 ? "bestseller" : undefined) as ProductBadgeKind | undefined,
                  tone: "amber" as const,
                  mediaLabel: apiItem.name,
                  image: apiItem.imageUrl || undefined,
                };

                return (
                  <div key={apiItem.id} className="w-[280px] sm:w-[300px] shrink-0 snap-start">
                    <ProductCard 
                      product={productViewModel} 
                      mediaRatio="aspect-square"
                      className="bg-white rounded-2xl border border-black/5 hover:border-[#1b7a54]/30 shadow-sm hover:shadow-lg transition-all duration-300"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </Container>
    </div>
  );
}
