import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiCategory } from "@/types/api/home";

interface CategoryCardProps {
  category: ApiCategory;
  size?: "large" | "medium" | "small";
}

export function CategoryCard({ category, size = "small" }: CategoryCardProps) {
  const href = `/products?category=${category.slug}`;

  if (size === "large") {
    return (
      <Link
        href={href}
        className="group relative flex min-h-[360px] w-full flex-col overflow-hidden rounded-[2rem] bg-white p-8 sm:p-12 transition-all duration-500 hover:shadow-xl sm:min-h-[460px] lg:flex-row lg:items-center border border-forest-abyss/5 hover:border-forest-deep/20"
      >
        <div className="relative z-10 flex flex-1 flex-col justify-center lg:pr-12">
          <div className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-forest-deep">
            <Sparkles className="size-4" />
            Featured Category
          </div>
          <h2 className="font-display text-4xl text-ink sm:text-5xl lg:text-6xl">
            {category.name}
          </h2>
          {category.productCount > 0 && (
            <p className="mt-6 text-lg text-muted-ink max-w-md leading-relaxed">
              Discover {category.productCount} trusted products specifically formulated for this category.
            </p>
          )}
          <div className="mt-10 flex items-center gap-2 text-base font-medium text-ink transition-colors group-hover:text-forest-deep bg-forest-deep/5 w-fit px-6 py-3 rounded-full">
            Explore Collection
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
        <div className="relative mt-10 h-64 w-full shrink-0 overflow-hidden rounded-2xl bg-forest-abyss/5 lg:mt-0 lg:h-[360px] lg:w-[45%]">
          {category.imageUrl ? (
            <Image src={category.imageUrl} alt={category.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-forest-abyss/5 to-forest-abyss/10">
               <div className="text-8xl font-display text-forest-abyss/10 select-none transition-transform duration-700 group-hover:scale-110">
                 {category.name.substring(0, 2).toUpperCase()}
               </div>
            </div>
          )}
        </div>
      </Link>
    );
  }

  if (size === "medium") {
    return (
      <Link
        href={href}
        className="group relative flex h-[320px] w-full flex-col justify-end overflow-hidden rounded-[2rem] p-8 transition-all duration-500 hover:shadow-lg"
      >
        <div className="absolute inset-0 bg-forest-abyss/5 z-0" />
        {category.imageUrl && (
          <Image src={category.imageUrl} alt={category.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105 z-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-abyss/90 via-forest-abyss/20 to-transparent z-10" />
        <div className="relative z-20 flex flex-col">
          <h3 className="mb-2 font-display text-3xl text-white">
            {category.name}
          </h3>
          <div className="flex items-center justify-between">
            {category.productCount > 0 && (
              <p className="text-sm text-white/80 font-medium">
                {category.productCount} Products
              </p>
            )}
            <div className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all group-hover:bg-white group-hover:text-forest-abyss">
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:-rotate-45" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-3xl bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-forest-abyss/5 hover:border-forest-deep/20"
    >
      <div className="relative z-10 flex h-full flex-col">
        <h3 className="mb-2 font-display text-2xl text-ink transition-colors group-hover:text-forest-deep">
          {category.name}
        </h3>
        
        {category.productCount > 0 && (
          <p className="text-sm text-muted-ink uppercase tracking-wider font-medium">
            {category.productCount} {category.productCount === 1 ? "Product" : "Products"}
          </p>
        )}
        
        <div className="mt-auto pt-8 flex items-center justify-between">
          <div className="text-sm font-medium text-muted-ink transition-colors group-hover:text-forest-deep">
            View products
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-forest-deep/5 text-forest-deep transition-all group-hover:bg-forest-deep group-hover:text-white">
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:-rotate-45" />
          </div>
        </div>
      </div>
      <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-forest-deep/10 blur-3xl transition-transform duration-700 group-hover:scale-150" />
    </Link>
  );
}
