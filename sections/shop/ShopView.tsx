"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, X } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ApiProductListingResponse, ApiFacetOption } from "@/types/api/search";
import { ProductBadgeKind, ProductForm } from "@/types/product";

interface ShopViewProps {
  result: ApiProductListingResponse;
  searchQuery?: string;
}

export function ShopView({ result, searchQuery }: ShopViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to construct URLs for pagination and filtering
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    if (name !== 'page') params.delete('page'); // Reset page on filter
    return params.toString();
  };

  const toggleFilter = (group: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(group);
    
    if (current.includes(value)) {
      const filtered = current.filter(v => v !== value);
      params.delete(group);
      filtered.forEach(v => params.append(group, v));
    } else {
      params.append(group, value);
    }
    
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(searchQuery ? `?q=${searchQuery}` : '?');
  };

  const activeFilterCount = Array.from(searchParams.keys()).filter(k => k !== 'page' && k !== 'sort' && k !== 'q').length;

  return (
    <div className="py-8 lg:py-12">
      <Container>
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            {searchQuery ? (
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0a2015] tracking-tight mb-2">
                Search Results for &quot;{searchQuery}&quot;
              </h1>
            ) : result.category ? (
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0a2015] tracking-tight mb-2">
                {result.category.name}
              </h1>
            ) : (
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0a2015] tracking-tight mb-2">
                All Products
              </h1>
            )}
            <p className="text-[#4b6b5a]">
              Showing {result.items.length > 0 ? (result.page - 1) * result.pageSize + 1 : 0} - {Math.min(result.page * result.pageSize, result.total)} of {result.total} products
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-black/10 rounded-full h-10 pl-4 pr-10 text-sm font-medium text-[#0a2015] focus:outline-none focus:ring-2 focus:ring-[#1b7a54]/20 cursor-pointer"
                value={result.sort || "relevance"}
                onChange={(e) => router.push(`?${createQueryString('sort', e.target.value)}`)}
              >
                <option value="relevance">Relevance</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#4b6b5a] pointer-events-none" />
            </div>
            
            {/* Mobile Filter Toggle */}
            <button className="lg:hidden flex items-center justify-center size-10 rounded-full bg-white border border-black/10 text-[#0a2015]">
              <SlidersHorizontal className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-28">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-[#0a2015] flex items-center gap-2">
                <SlidersHorizontal className="size-4" />
                Filters
              </h2>
              {activeFilterCount > 0 && (
                <button 
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[#1b7a54] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="space-y-8">
              <FilterGroup 
                title="Brands" 
                options={result.facets.brands} 
                groupKey="brand"
                onToggle={(val) => toggleFilter("brand", val)} 
                selected={searchParams.getAll("brand")}
              />
              <FilterGroup 
                title="Forms" 
                options={result.facets.forms} 
                groupKey="form"
                onToggle={(val) => toggleFilter("form", val)} 
                selected={searchParams.getAll("form")}
              />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {result.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-black/10 rounded-3xl bg-white/50">
                <div className="size-16 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#a7c5b6] mb-4">
                  <LayoutGrid className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-[#0a2015] mb-2">No products found</h3>
                <p className="text-[#4b6b5a] max-w-sm mb-6">
                  We couldn&apos;t find any products matching your current filters. Try adjusting them or clearing your search.
                </p>
                <button 
                  onClick={clearFilters}
                  className="h-10 px-6 rounded-full bg-[#0a2015] text-white text-sm font-medium hover:bg-[#153a27] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {result.items.map((apiItem) => {
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
                      <ProductCard 
                        key={apiItem.id} 
                        product={productViewModel} 
                        mediaRatio="aspect-[4/5]"
                        className="bg-white rounded-[20px] sm:rounded-3xl border border-black/5 hover:border-[#1b7a54]/30 shadow-sm hover:shadow-xl hover:shadow-[#1b7a54]/5 transition-all duration-300"
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {result.pageCount > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2">
                    <button 
                      onClick={() => router.push(`?${createQueryString('page', String(result.page - 1))}`)}
                      disabled={result.page === 1}
                      className="size-10 rounded-full border border-black/10 flex items-center justify-center text-[#0a2015] hover:bg-white disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, result.pageCount) }).map((_, i) => {
                        // Simple sliding window for pagination
                        let pageNum = i + 1;
                        if (result.pageCount > 5 && result.page > 3) {
                          pageNum = result.page - 2 + i;
                          if (pageNum > result.pageCount) return null;
                        }
                        
                        const isActive = pageNum === result.page;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => router.push(`?${createQueryString('page', String(pageNum))}`)}
                            className={`size-10 rounded-full text-sm font-medium transition-all ${
                              isActive 
                                ? "bg-[#0a2015] text-white shadow-md" 
                                : "text-[#4b6b5a] hover:bg-white hover:text-[#0a2015]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={() => router.push(`?${createQueryString('page', String(result.page + 1))}`)}
                      disabled={result.page === result.pageCount}
                      className="size-10 rounded-full border border-black/10 flex items-center justify-center text-[#0a2015] hover:bg-white disabled:opacity-30 transition-all"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          
        </div>
      </Container>
    </div>
  );
}

function FilterGroup({ 
  title, 
  options, 
  groupKey, 
  onToggle, 
  selected 
}: { 
  title: string, 
  options: ApiFacetOption<string>[], 
  groupKey: string,
  onToggle: (val: string) => void,
  selected: string[]
}) {
  if (!options || options.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#0a2015] mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={String(opt.value)} className="flex items-center gap-3 cursor-pointer group">
            <div className={`size-4 rounded-[4px] border flex items-center justify-center transition-colors ${
              selected.includes(String(opt.value))
                ? 'bg-[#1b7a54] border-[#1b7a54]'
                : 'border-black/20 group-hover:border-[#1b7a54]'
            }`}>
              {selected.includes(String(opt.value)) && (
                <svg viewBox="0 0 14 14" fill="none" className="size-3 text-white">
                  <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={`text-sm ${selected.includes(String(opt.value)) ? 'font-medium text-[#0a2015]' : 'text-[#4b6b5a] group-hover:text-[#0a2015]'}`}>
              {opt.label || opt.value} <span className="text-black/30 ml-1">({opt.count})</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
