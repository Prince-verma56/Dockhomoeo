"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductPackshot } from "@/components/commerce/ProductPackshot";
import type { Product } from "@/types/product";

type ProductMediaProps = {
  product: Pick<Product, "form" | "mediaLabel" | "name"> & {
    image?: string | null;
    brand?: string | null;
    slug?: string | null;
  };
  className?: string;
  /** Sizing utility for the frame, e.g. "aspect-[4/5]". */
  ratio?: string;
  rounded?: string;
  /** Above-the-fold cards load their photo at once instead of lazily (likely LCP). */
  eager?: boolean;
  /** Passed to next/image so the browser picks a fitting width. */
  sizes?: string;
};

/**
 * The product image slot, shared by cards, the product page and rails.
 *
 * A photograph is shown only when the shop supplies one for this product
 * (`imageUrl` from the API). Otherwise, or if the photo fails to load, the
 * illustrated pack stands in, printed with the product's own name, brand and
 * potency, so no frame is ever blank, broken or showing another product.
 *
 * `data-product-media` marks the element the add-to-cart flight lifts off from.
 */
/**
 * Real product photography fallbacks mapped by dosage form and known remedy names/slugs.
 */
export function getRealFallbackImage(product: {
  slug?: string | null;
  name?: string;
  form?: string | null;
}): string {
  const text = `${product.slug || ""} ${product.name || ""}`.toLowerCase();
  if (text.includes("kali") || text.includes("phos") || text.includes("tablet")) {
    return "/Images/Products/lords-kali-phos.jpg";
  }
  if (text.includes("natrum") || text.includes("muriaticum")) {
    return "/Images/Products/sbl-natrum.jpg";
  }
  if (text.includes("boiron") || (text.includes("arnica") && (text.includes("tube") || text.includes("pellet")))) {
    return "/Images/Products/boiron-arnica.jpg";
  }
  if (text.includes("alfalfa") || text.includes("tincture") || text.includes(" q")) {
    return "/Images/Products/schwabe-alfalfa.jpg";
  }
  if (text.includes("oil") || text.includes("massage")) {
    return "/Images/Products/bakson-arnica-oil.jpg";
  }
  if (text.includes("r41") || text.includes("nerve") || text.includes("memory")) {
    return "/Images/Products/reckeweg-r41.jpg";
  }
  if (text.includes("r89") || text.includes("hair")) {
    return "/Images/Products/reckeweg-r89.jpg";
  }
  if (text.includes("calcarea") || text.includes("calc")) {
    return "/Images/Products/sbl-calc-carb.jpg";
  }
  if (product.form === "tablets") return "/Images/Products/lords-kali-phos.jpg";
  if (product.form === "cream") return "/Images/Products/boiron-arnica.jpg";
  if (product.form === "oil") return "/Images/Products/bakson-arnica-oil.jpg";
  if (product.form === "tincture") return "/Images/Products/schwabe-alfalfa.jpg";
  if (product.form === "drops") return "/Images/Products/reckeweg-r41.jpg";

  return "/Images/Products/sbl-natrum.jpg";
}

export function ProductMedia({
  product,
  className,
  ratio = "aspect-[4/5]",
  rounded = "rounded-none",
  eager = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px",
}: ProductMediaProps) {
  const [failed, setFailed] = useState(false);
  const fallbackSrc = getRealFallbackImage({ slug: product.slug, name: product.name, form: product.form });
  const imageSrc = (product.image && !failed) ? product.image : fallbackSrc;

  return (
    <div
      data-product-media
      className={cn("relative isolate overflow-hidden bg-cream-sunk select-none", ratio, rounded, className)}
    >
      <Image
        src={imageSrc}
        alt={product.mediaLabel || product.name}
        fill
        loading={eager ? "eager" : undefined}
        fetchPriority={eager ? "high" : undefined}
        sizes={sizes}
        onError={() => setFailed(true)}
        draggable={false}
        className="pointer-events-none select-none object-cover object-center transition-transform duration-700 ease-premium group-hover:scale-[1.04]"
      />
      {/* Inner hairline so photos share one clean edge treatment. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 z-2 rounded-[inherit] ring-1 ring-ink/6 ring-inset" />
    </div>
  );
}
