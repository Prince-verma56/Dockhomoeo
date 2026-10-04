import { cn } from "@/lib/utils";
import { MediaPlaceholder, type MediaTone } from "@/components/shared/MediaPlaceholder";
import { ProductGlyph } from "@/components/commerce/ProductGlyph";
import type { Product } from "@/types/product";

type ProductMediaProps = {
  product: Pick<Product, "form" | "tone" | "mediaLabel"> & { image?: string };
  className?: string;
  ratio?: string;
  surface?: MediaTone;
  glyphSize?: "sm" | "md" | "lg";
  rounded?: string;
};

/**
 * The product image slot.
 *
 * Renders real product photography when available, or a graceful lit placeholder
 * frame with a CSS product silhouette glyph as fallback.
 */
export function ProductMedia({
  product,
  className,
  ratio = "aspect-[4/5]",
  surface = "cream",
  glyphSize = "md",
  rounded,
}: ProductMediaProps) {
  return (
    <MediaPlaceholder
      label={product.mediaLabel}
      tone={surface}
      ratio={ratio}
      rounded={rounded}
      className={cn(
        "transition-transform duration-500 ease-premium group-hover:scale-[1.03] relative overflow-hidden",
        className,
      )}
    >
      {product.image ? (
        <img
          src={product.image}
          alt={product.mediaLabel}
          className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <ProductGlyph form={product.form} tone={product.tone} size={glyphSize} />
      )}
    </MediaPlaceholder>
  );
}
