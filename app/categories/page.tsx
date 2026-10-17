import type { Metadata } from "next";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { CategoryShowcaseView } from "@/sections/categories/CategoryShowcaseView";
import { getCategoryDirectory } from "@/lib/catalogue";
import { mapApiCardToProduct } from "@/lib/adapters/product";

const DESCRIPTION =
  "Browse remedies by health concern or preferred form — drops, tablets, mother tinctures, creams and more from trusted homeopathic manufacturers.";

export const metadata: Metadata = {
  title: "Categories · DocHomoeo",
  description: DESCRIPTION,
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "Find your natural care · Categories · DocHomoeo",
    description: DESCRIPTION,
    url: "/categories",
    type: "website",
  },
};

export default async function CategoriesPage() {
  const [categories, catalogue, popularResults] = await Promise.all([
    getCategoryDirectory(),
    repositories.search.search({ pageSize: 1 }),
    repositories.search.search({ sort: "popular", pageSize: 8 }),
  ]);

  const popularProducts = popularResults.items.map(mapApiCardToProduct);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 overflow-x-clip bg-canvas">
        <CategoryShowcaseView
          categories={categories}
          totalProducts={catalogue.total}
          popularProducts={popularProducts}
        />
      </main>
      <SiteFooter />
    </>
  );
}
