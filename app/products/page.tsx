import { Metadata } from "next";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { ShopView } from "@/sections/shop/ShopView";

export const metadata: Metadata = {
  title: "Shop Homoeopathic Remedies | DocHomo",
  description: "Browse our premium selection of authentic homoeopathic medicines and products.",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  
  // Parse search params for filters
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  
  const brand = typeof searchParams.brand === "string" 
    ? [searchParams.brand] 
    : Array.isArray(searchParams.brand) ? searchParams.brand : undefined;
    
  const form = typeof searchParams.form === "string" 
    ? [searchParams.form] 
    : Array.isArray(searchParams.form) ? searchParams.form : undefined;

  const inStock = searchParams.inStock === "true";
  
  // Fetch data
  const result = await repositories.search.search({
    q,
    category,
    brand,
    form,
    inStock,
    sort,
    page,
    pageSize: 24,
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <SiteHeader />
      <main className="flex-1 pt-[72px]">
        <ShopView result={result} searchQuery={q} />
      </main>
      <SiteFooter />
    </div>
  );
}
