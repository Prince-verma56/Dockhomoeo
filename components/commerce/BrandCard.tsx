import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2 } from "lucide-react";
import { ApiBrand } from "@/types/api/home";

interface BrandCardProps {
  brand: ApiBrand;
}

export function BrandCard({ brand }: BrandCardProps) {
  const href = `/products?brand=${brand.slug}`;
  
  // Create a monogram from the brand name if no logo exists
  const monogram = brand.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center overflow-hidden rounded-[2rem] bg-white p-8 text-center transition-all duration-300 hover:shadow-[0_16px_32px_rgba(0,0,0,0.04)] hover:-translate-y-1 sm:p-10 border border-forest-abyss/5 hover:border-forest-abyss/10"
    >
      <div className="absolute top-0 right-0 p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex size-8 items-center justify-center rounded-full bg-sage-50 text-leaf-800">
           <ArrowRight className="size-4 -rotate-45" />
        </div>
      </div>

      <div className="mb-6 flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-forest-abyss/5 bg-[#F0F2EB] shadow-sm sm:size-28">
        {brand.logoUrl ? (
          <Image
            src={brand.logoUrl}
            alt={brand.name}
            width={112}
            height={112}
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="font-display text-3xl tracking-widest text-forest-abyss/30 sm:text-4xl transition-colors duration-300 group-hover:text-leaf-800">
            {monogram}
          </span>
        )}
      </div>

      <h3 className="font-display text-2xl text-forest-abyss transition-colors duration-300 group-hover:text-leaf-800">
        {brand.name}
      </h3>
      
      {brand.productCount > 0 && (
         <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-abyss/50 bg-forest-abyss/5 px-3 py-1 rounded-full">
           <Building2 className="size-3.5" />
           {brand.productCount} {brand.productCount === 1 ? "Product" : "Products"}
         </div>
      )}

      {brand.description && (
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-forest-abyss/60">
          {brand.description}
        </p>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-forest-abyss opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-leaf-800">
        Explore Brand
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
