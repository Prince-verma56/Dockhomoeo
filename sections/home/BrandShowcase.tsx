import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { ApiBrand } from "@/types/api/home";

interface BrandShowcaseProps {
  brands: ApiBrand[];
}

export function BrandShowcase({ brands }: BrandShowcaseProps) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="py-24 bg-white border-b border-black/5">
      <Container>
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0a2015] tracking-tight mb-4">
            Curated from Global Leaders
          </h2>
          <p className="text-[#4b6b5a] text-lg">
            We partner exclusively with certified, world-renowned homoeopathic laboratories to guarantee purity, efficacy, and strict pharmacopoeia standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.slice(0, 6).map((brand) => (
            <Link 
              key={brand.id}
              href={`/products?brand=${brand.slug}`}
              className="group flex flex-col p-8 rounded-3xl bg-[#f4f7f5] border border-black/5 hover:bg-[#e7f0ec] hover:border-[#1b7a54]/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center font-serif text-xl text-[#0a2015] font-bold overflow-hidden">
                  {brand.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    brand.name.charAt(0)
                  )}
                </div>
                
                <span className="flex items-center justify-center size-8 rounded-full bg-white text-[#4b6b5a] group-hover:bg-[#1b7a54] group-hover:text-white transition-colors">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-[#0a2015] mb-2">{brand.name}</h3>
                <p className="text-sm font-medium text-[#1b7a54] mb-3">
                  {brand.productCount} authentic {brand.productCount === 1 ? 'remedy' : 'remedies'}
                </p>
                {brand.description ? (
                  <p className="text-sm text-[#4b6b5a] line-clamp-3 leading-relaxed">
                    {brand.description}
                  </p>
                ) : (
                  <p className="text-sm text-[#4b6b5a] line-clamp-2 leading-relaxed">
                    Premium homoeopathic formulations manufactured under strict quality controls and global standards.
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            href="/brands"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-medium text-[#0a2015] border border-black/10 hover:bg-gray-50 transition-colors"
          >
            Explore all partners
          </Link>
        </div>
      </Container>
    </section>
  );
}
