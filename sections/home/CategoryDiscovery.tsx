"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { ApiCategory } from "@/types/api/home";
import Image from "next/image";

interface CategoryDiscoveryProps {
  categories: ApiCategory[];
}

export function CategoryDiscovery({ categories }: CategoryDiscoveryProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-white overflow-hidden">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0a2015] tracking-tight mb-4">
              Explore by Health Need
            </h2>
            <p className="text-[#4b6b5a] text-lg">
              Find precisely formulated homoeopathic remedies tailored to your specific health goals and conditions.
            </p>
          </div>
          
          <Link 
            href="/categories" 
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[#1b7a54] hover:text-[#115539] transition-colors"
          >
            View all categories
            <span className="flex items-center justify-center size-8 rounded-full bg-[#1b7a54]/10 group-hover:bg-[#1b7a54]/20 transition-colors">
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((category, index) => {
            // Give the first category a larger, featured treatment if there's an odd number, 
            // but for simplicity, we'll use a clean uniform grid that looks elegant.
            return (
              <Link 
                key={category.id} 
                href={`/products?category=${category.slug}`}
                className="group relative flex flex-col justify-end p-8 rounded-3xl overflow-hidden bg-[#f4f7f5] h-64 border border-black/5 hover:border-[#1b7a54]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#1b7a54]/10"
              >
                {/* Background Image / Gradient */}
                {category.imageUrl ? (
                  <>
                    <Image 
                      src={category.imageUrl} 
                      alt={category.name} 
                      fill 
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#e7f0ec] to-[#d5e5db] group-hover:scale-105 transition-transform duration-700 ease-out" />
                    {/* Decorative abstract shape */}
                    <div className="absolute -right-12 -top-12 size-40 rounded-full bg-white/40 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  </>
                )}

                {/* Content */}
                <div className="relative z-10 flex items-end justify-between w-full">
                  <div>
                    <h3 className={`text-2xl font-bold mb-1 ${category.imageUrl ? 'text-white' : 'text-[#0a2015]'}`}>
                      {category.name}
                    </h3>
                    <p className={`text-sm font-medium ${category.imageUrl ? 'text-white/80' : 'text-[#4b6b5a]'}`}>
                      {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
                    </p>
                  </div>
                  
                  <div className={`size-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 ${category.imageUrl ? 'bg-white/20 border-white/30 text-white' : 'bg-white/60 border-black/10 text-[#0a2015]'}`}>
                    <ArrowUpRight className="size-5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </Container>
    </section>
  );
}
