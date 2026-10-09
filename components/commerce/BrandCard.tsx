import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, Sparkles } from "lucide-react";
import { ApiBrand } from "@/types/api/home";

interface BrandCardProps {
  brand: ApiBrand;
  isFeatured?: boolean;
}

export function BrandCard({ brand, isFeatured = false }: BrandCardProps) {
  const href = `/products?brand=${brand.slug}`;
  
  const monogram = brand.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isFeatured) {
    return (
      <Link
        href={href}
        className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white p-8 transition-all duration-300 hover:shadow-lg sm:flex-row sm:items-center sm:p-10 border border-forest-abyss/5 hover:border-forest-deep/20"
      >
        <div className="mb-6 flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-forest-abyss/5 bg-[#f6f2ea] shadow-sm sm:mb-0 sm:mr-8 sm:size-32">
          {brand.logoUrl ? (
            <Image src={brand.logoUrl} alt={brand.name} width={128} height={128} className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <span className="font-display text-4xl tracking-widest text-forest-deep/40 transition-colors duration-300 group-hover:text-forest-deep">
              {monogram}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-forest-deep">
            <Sparkles className="size-3" />
            Featured Partner
          </div>
          <h3 className="mb-2 font-display text-3xl text-ink transition-colors duration-300 group-hover:text-forest-deep">
            {brand.name}
          </h3>
          {brand.description && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-ink max-w-sm">
              {brand.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto">
            {brand.productCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-ink bg-forest-abyss/5 px-3 py-1 rounded-full">
                <Building2 className="size-3.5" />
                {brand.productCount} Products
              </div>
            )}
            <div className="flex items-center gap-2 text-sm font-semibold text-forest-deep">
              Shop Brand
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center overflow-hidden rounded-[2rem] bg-white p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 sm:p-10 border border-forest-abyss/5 hover:border-forest-deep/20"
    >
      <div className="absolute top-0 right-0 p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex size-8 items-center justify-center rounded-full bg-forest-deep/10 text-forest-deep">
           <ArrowRight className="size-4 -rotate-45" />
        </div>
      </div>

      <div className="mb-6 flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-forest-abyss/5 bg-[#f6f2ea] shadow-sm sm:size-28">
        {brand.logoUrl ? (
          <Image src={brand.logoUrl} alt={brand.name} width={112} height={112} className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <span className="font-display text-3xl tracking-widest text-forest-deep/30 sm:text-4xl transition-colors duration-300 group-hover:text-forest-deep">
            {monogram}
          </span>
        )}
      </div>

      <h3 className="font-display text-2xl text-ink transition-colors duration-300 group-hover:text-forest-deep">
        {brand.name}
      </h3>
      
      {brand.productCount > 0 && (
         <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-ink bg-forest-abyss/5 px-3 py-1 rounded-full">
           <Building2 className="size-3.5" />
           {brand.productCount} Products
         </div>
      )}

      {brand.description && (
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-ink">
          {brand.description}
        </p>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-ink opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-forest-deep">
        Explore Brand
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
