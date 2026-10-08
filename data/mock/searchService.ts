import { mockProducts } from "./products";
import type { Product } from "@/types/product";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface SearchResult {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  total: number;
}

/**
 * Clean integration boundary for search backend.
 */
export async function performSearch(query: string, limit = 24): Promise<SearchResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 150));
  
  if (!query || query.trim() === "") {
    return {
      products: [],
      brands: [],
      categories: [],
      total: 0
    };
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Filter products based on name, brand, category, or health goals
  const matchedProducts = mockProducts.filter((p) => {
    return (
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.brand.toLowerCase().includes(normalizedQuery) ||
      (p.category && p.category.toLowerCase().includes(normalizedQuery)) ||
      (p.healthGoals && p.healthGoals.some(hg => hg.toLowerCase().includes(normalizedQuery))) ||
      p.form.toLowerCase().includes(normalizedQuery)
    );
  });

  // Extract unique brands from matched products
  const brandsMap = new Map<string, number>();
  matchedProducts.forEach(p => {
    brandsMap.set(p.brand, (brandsMap.get(p.brand) || 0) + 1);
  });
  
  const brands: Brand[] = Array.from(brandsMap.entries()).map(([name, count]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    productCount: count
  }));

  // Extract unique categories from matched products
  const categoriesMap = new Map<string, number>();
  matchedProducts.forEach(p => {
    if (p.category) {
      categoriesMap.set(p.category, (categoriesMap.get(p.category) || 0) + 1);
    }
  });

  const categories: Category[] = Array.from(categoriesMap.entries()).map(([name, count]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    productCount: count
  }));

  return {
    products: matchedProducts.slice(0, limit),
    brands,
    categories,
    total: matchedProducts.length
  };
}
