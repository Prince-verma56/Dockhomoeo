"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Heart, Minus, Plus, ShoppingBag, ShieldCheck, Truck, Star } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { ApiProductDetail, ApiProductVariant } from "@/types/api/product";
import { ProductCard } from "@/components/commerce/ProductCard";
import { mapApiCardToProduct } from "@/lib/adapters/product";
import { useCart } from "@/components/providers/CartProvider";
import { useFavourites } from "@/lib/favourites/favourites";

interface ProductDetailViewProps {
  product: ApiProductDetail;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedVariant, setSelectedVariant] = useState<ApiProductVariant>(
    product.variants.find(v => v.isDefault) || product.variants[0]
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(selectedVariant?.minQuantity || 1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const favourites = useFavourites();
  const favourited = favourites.isFavourite(product.slug);

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
      imageUrl: product.images[selectedImageIndex]?.url || product.images[0]?.url,
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
                    <span className="text-[#0a2015] font-semibold" aria-current="page">{t.name}</span>
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

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative w-full aspect-square rounded-[2rem] sm:rounded-[2.5rem] bg-[#f4efe4] border border-[#d9ddd3]/70 overflow-hidden shadow-sm group">
              {product.images.length > 0 ? (
                <Image 
                  src={product.images[selectedImageIndex]?.url || product.images[0].url} 
                  alt={product.images[selectedImageIndex]?.altText || product.name} 
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="z-10 text-center text-[#4b6b5a] flex flex-col items-center justify-center h-full">
                  <div className="size-24 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                    <span className="font-serif text-3xl font-bold text-[#0a2015] opacity-50">{product.name.charAt(0)}</span>
                  </div>
                  No image available
                </div>
              )}

              {/* Floating discount badge */}
              {selectedVariant.discountPercent > 0 && (
                <div className="absolute top-5 left-5 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0a2015]/90 text-white text-xs font-bold tracking-wider backdrop-blur-md shadow-sm border border-white/10 uppercase">
                  <span>{selectedVariant.discountPercent}% OFF</span>
                </div>
              )}

              {/* Floating favourite heart */}
              <button
                type="button"
                onClick={() => favourites.toggle(product.slug)}
                aria-pressed={favourited}
                aria-label={favourited ? `Remove ${product.name} from favourites` : `Save ${product.name} to favourites`}
                className="absolute top-5 right-5 z-20 size-11 rounded-full bg-white/90 backdrop-blur-md border border-black/5 shadow-md flex items-center justify-center text-[#14251f] hover:scale-110 active:scale-95 transition-all"
              >
                <Heart className={`size-5 transition-colors ${favourited ? "text-[#a63d2f] fill-[#a63d2f]" : "text-[#4b6b5a]"}`} />
              </button>
            </div>

            {/* Thumbnail strip if multiple images */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 pt-1 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={img.url + idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative size-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-[#f4efe4] ${
                      selectedImageIndex === idx
                        ? "border-[#0d5a43] ring-2 ring-[#0d5a43]/20 shadow-sm scale-102"
                        : "border-black/10 hover:border-black/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col">
            
            {/* Brand & Title */}
            <div className="mb-6">
              {product.brand && (
                <div className="flex items-center gap-2 mb-2">
                  <Link href={`/products?brand=${product.brand.slug}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d5a43]/10 text-xs font-bold text-[#0d5a43] hover:bg-[#0d5a43]/15 transition-colors tracking-wider uppercase">
                    <ShieldCheck className="size-3.5" />
                    {product.brand.name}
                  </Link>
                  <span className="text-xs font-medium text-[#66716c] uppercase tracking-wider">• {product.form}</span>
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold text-[#0a2015] tracking-tight mb-3">
                {product.name}
              </h1>
              
              {/* Reviews/Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-[#fffdf8] px-3 py-1 rounded-full border border-black/8 shadow-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`size-3.5 ${i < Math.round(product.ratingAverage) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} 
                    />
                  ))}
                  <span className="text-xs font-bold text-[#0a2015] ml-1">{product.ratingAverage.toFixed(1)}</span>
                </div>
                <span className="text-xs text-[#4b6b5a]">
                  ({product.ratingCount} verified ratings)
                </span>
              </div>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-[#4b6b5a] text-base leading-relaxed mb-6">
                {product.shortDescription}
              </p>
            )}

            <div className="h-px w-full bg-black/5 mb-6" />

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
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= selectedVariant.minQuantity}
                  className="size-10 rounded-full flex items-center justify-center text-[#0a2015] hover:bg-white disabled:opacity-30 transition-colors shadow-sm"
                >
                  <Minus aria-hidden className="size-4" />
                </button>
                <span aria-live="polite" aria-label={`Quantity ${quantity}`} className="text-base font-semibold text-[#0a2015] w-8 text-center select-none">
                  {quantity}
                </span>
                <button 
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= selectedVariant.maxQuantity}
                  className="size-10 rounded-full flex items-center justify-center text-[#0a2015] hover:bg-white disabled:opacity-30 transition-colors shadow-sm"
                >
                  <Plus aria-hidden className="size-4" />
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

              <button
                type="button"
                onClick={() => favourites.toggle(product.slug)}
                aria-pressed={favourited}
                aria-label={favourited ? `Remove ${product.name} from favourites` : `Save ${product.name} to favourites`}
                className={`h-14 w-14 shrink-0 rounded-full border flex items-center justify-center transition-all hover:text-red-500 hover:border-red-500/30 hover:bg-red-50 ${favourited ? "border-red-500/30 text-[#a63d2f]" : "border-black/10 text-[#4b6b5a]"}`}
              >
                <Heart className={`size-5 ${favourited ? "fill-current" : ""}`} />
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
              {product.related.map((item) => (
                <div key={item.id} className="w-[260px] sm:w-[280px] shrink-0 snap-start">
                  <ProductCard product={mapApiCardToProduct(item)} />
                </div>
              ))}
            </div>
          </div>
        )}

      </Container>
    </div>
  );
}
