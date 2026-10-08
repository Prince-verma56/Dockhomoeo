"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Container } from "@/components/shared/Container";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ApiRail } from "@/types/api/home";
import { ProductBadgeKind, ProductForm } from "@/types/product";

interface CuratedProductRailProps {
  rail: ApiRail;
}

export function CuratedProductRail({ rail }: CuratedProductRailProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (!rail || !rail.items || rail.items.length === 0) return null;

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [rail.items]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-[#faf9f6] border-y border-black/5 overflow-hidden">
      <Container>
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-[#0a2015] tracking-tight mb-2">
              {rail.title}
            </h2>
            <p className="text-[#4b6b5a]">
              Handpicked premium remedies trusted by healthcare professionals.
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href={rail.href} 
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#1b7a54] hover:text-[#115539] transition-colors mr-4"
            >
              Shop Collection
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className="size-10 rounded-full border border-black/10 flex items-center justify-center bg-white text-[#0a2015] hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button 
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className="size-10 rounded-full border border-black/10 flex items-center justify-center bg-white text-[#0a2015] hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </Container>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="w-full overflow-x-auto pb-8 pt-4 px-4 sm:px-8 lg:px-12 xl:px-[max(3rem,calc((100vw-80rem)/2))] flex gap-6 snap-x snap-mandatory hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {rail.items.map((apiItem) => {
          // Adapt the ApiProductCard to the Product view-model expected by ProductCard
          const productViewModel = {
            id: String(apiItem.id),
            slug: apiItem.slug,
            name: apiItem.name,
            brand: apiItem.brandName || "DocHomo",
            form: (apiItem.form as ProductForm) || "drops",
            variant: "Standard Pack", // Or map from actual data if available
            price: { amount: apiItem.price, currency: "INR" as const },
            compareAtPrice: apiItem.mrp > apiItem.price ? { amount: apiItem.mrp, currency: "INR" as const } : undefined,
            rating: { value: apiItem.rating, count: apiItem.ratingCount },
            badge: (apiItem.sold > 300 ? "bestseller" : undefined) as ProductBadgeKind | undefined,
            tone: "amber" as const, // Default fallback
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
      
      {/* Mobile fallback link */}
      <div className="mt-4 px-6 md:hidden">
        <Link 
          href={rail.href} 
          className="flex h-12 w-full items-center justify-center rounded-xl border border-black/10 bg-white font-medium text-[#0a2015] hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          View Full Collection
        </Link>
      </div>
    </section>
  );
}
