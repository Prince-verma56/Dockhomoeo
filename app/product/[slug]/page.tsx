import { Metadata } from "next";
import { notFound } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { ProductDetailView } from "@/sections/product/ProductDetailView";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  const params = await props.params;
  const product = await repositories.product.getBySlug(params.slug);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  return {
    // The shop composes a full SEO title (site name included), so it replaces
    // the layout's template rather than getting the site name a second time.
    title: product.seo.title ? { absolute: product.seo.title } : product.name,
    description: product.seo.description || product.shortDescription || `Buy ${product.name} online at DocHomoeo.`,
  };
}

export default async function ProductPage(props: PageProps) {
  const params = await props.params;
  const product = await repositories.product.getBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <SiteHeader />
      <main className="flex-1 pt-[72px]">
        <ProductDetailView product={product} />
      </main>
      <SiteFooter />
    </div>
  );
}
