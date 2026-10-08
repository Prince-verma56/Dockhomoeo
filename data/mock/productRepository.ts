import { mockProducts } from "./products";
import type { Product } from "@/types/product";

export function getProductBySlug(slug: string): Product | undefined {
  const product = mockProducts.find((p) => p.slug === slug);
  
  if (!product) return undefined;

  // Add rich mock data dynamically for the PDP demo if it doesn't have it
  if (!product.description) {
    return {
      ...product,
      description: `A premium homoeopathic formulation of ${product.name}, designed to provide natural and effective relief. Manufactured by ${product.brand} following strict pharmacopoeia standards, this remedy offers a gentle, non-habit-forming approach to wellness. Suitable for all ages when taken as directed.`,
      ingredients: [
        `${product.name.split(" ")[0]} 30C`,
        "Alcohol 30% v/v",
        "Purified Water Q.S."
      ],
      usage: "Take 4-5 drops in a teaspoon of water 3 times a day, or as directed by a homoeopathic physician. Keep a gap of 15 minutes before or after meals.",
      availability: "in_stock"
    };
  }

  return product;
}

export function getRelatedProducts(currentSlug: string, limit = 4): Product[] {
  return mockProducts
    .filter((p) => p.slug !== currentSlug)
    .slice(0, limit);
}
