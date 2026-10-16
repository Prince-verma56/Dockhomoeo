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
export function ProductMedia({
  product,
  className,
  ratio = "aspect-[4/5]",
  rounded = "rounded-none",
  eager = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px",
}: ProductMediaProps) {
  const [failed, setFailed] = useState(false);
  const imageSrc = product.image ?? null;
  const showPhoto = Boolean(imageSrc) && !failed;

  return (
    <div
      data-product-media
      className={cn("relative isolate overflow-hidden bg-cream-sunk", ratio, rounded, className)}
    >
      {showPhoto && imageSrc ? (
        <Image
          src={imageSrc}
          alt={product.mediaLabel || product.name}
          fill
          loading={eager ? "eager" : undefined}
          fetchPriority={eager ? "high" : undefined}
          sizes={sizes}
          onError={() => setFailed(true)}
          className="object-cover object-center transition-transform duration-700 ease-premium group-hover:scale-[1.04]"
        />
      ) : (
        <ProductPackshot
          name={product.name}
          brand={product.brand}
          form={product.form}
          label={`${product.name}, illustrated pack`}
          className="transition-transform duration-700 ease-premium group-hover:scale-[1.03]"
        />
      )}
      {/* Inner hairline so photos and packs share one edge treatment. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 z-2 rounded-[inherit] ring-1 ring-ink/6 ring-inset" />
    </div>
  );
}
