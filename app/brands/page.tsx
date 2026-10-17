import type { Metadata } from "next";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { getBrandDirectory } from "@/lib/catalogue";
import { BrandShowcaseView } from "@/sections/brands/BrandShowcaseView";

const DESCRIPTION =
  "Explore trusted homoeopathic manufacturers on DocHomoeo. Discover authentic German, Swiss, and Indian laboratories, browse every maker, and explore remedies by form and category.";

export const metadata: Metadata = {
  title: "Shop by Brand · Authentic Homeopathic Manufacturers",
  description: DESCRIPTION,
  alternates: { canonical: "/brands" },
  openGraph: {
    title: "Shop by Brand · DocHomoeo",
    description: DESCRIPTION,
    url: "/brands",
    type: "website",
  },
};

export default async function BrandsPage() {
  const brands = await getBrandDirectory();

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas">
        <BrandShowcaseView brands={brands} />
      </main>
      <SiteFooter />
    </>
  );
}
