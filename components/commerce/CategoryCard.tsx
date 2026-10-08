import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiCategory } from "@/types/api/home";

interface CategoryCardProps {
  category: ApiCategory;
  isFeatured?: boolean;
}

export function CategoryCard({ category, isFeatured = false }: CategoryCardProps) {
  // We navigate to the product listing page with the category filter applied
  const href = `/products?category=${category.slug}`;

  if (isFeatured) {
    return (
      <Link
        href={href}
        className="group relative flex min-h-[360px] w-full flex-col overflow-hidden rounded-[2rem] bg-white p-8 sm:p-12 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:min-h-[460px] lg:flex-row lg:items-center border border-forest-abyss/5 hover:border-forest-abyss/10"
      >
        <div className="relative z-10 flex flex-1 flex-col justify-center lg:pr-12">
          <div className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-leaf-700">
            <Sparkles className="size-4" />
            Featured Category
          </div>
          <h2 className="font-display text-4xl text-forest-abyss sm:text-5xl lg:text-6xl">
            {category.name}
          </h2>
          {category.productCount > 0 && (
            <p className="mt-6 text-lg text-forest-abyss/60 max-w-md leading-relaxed">
              Discover {category.productCount} trusted products specifically formulated for this category.
            </p>
          )}
          <div className="mt-10 flex items-center gap-2 text-base font-medium text-forest-abyss transition-colors group-hover:text-leaf-800 bg-sage-50 w-fit px-6 py-3 rounded-full">
            Explore Collection
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>

        {/* Visual / Image Area */}
        <div className="relative mt-10 h-64 w-full shrink-0 overflow-hidden rounded-2xl bg-sage-100 lg:mt-0 lg:h-[360px] lg:w-[45%]">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            // Elegant fallback if no image is present
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-sage-50 to-[#E8ECE2]">
               <div className="text-8xl font-display text-forest-abyss/5 select-none transition-transform duration-700 group-hover:scale-110">
                 {category.name.substring(0, 2)}
               </div>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Standard Card
  return (
    <Link
      href={href}
      className="group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-3xl bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] border border-forest-abyss/5 hover:border-forest-abyss/10"
    >
      <div className="relative z-10 flex h-full flex-col">
        <h3 className="mb-2 font-display text-2xl text-forest-abyss transition-colors group-hover:text-leaf-800">
          {category.name}
        </h3>
        
        {category.productCount > 0 && (
          <p className="text-sm text-forest-abyss/50 uppercase tracking-wider font-medium">
            {category.productCount} {category.productCount === 1 ? "Product" : "Products"}
          </p>
        )}
        
        <div className="mt-auto pt-8 flex items-center justify-between">
          <div className="text-sm font-medium text-forest-abyss/60 transition-colors group-hover:text-leaf-800">
            View products
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-sage-50 text-forest-abyss transition-all group-hover:bg-leaf-800 group-hover:text-white">
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:-rotate-45" />
          </div>
        </div>
      </div>
      
      {/* Abstract decorative background */}
      <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-sage-100/50 blur-3xl transition-transform duration-700 group-hover:scale-150" />
    </Link>
  );
}
