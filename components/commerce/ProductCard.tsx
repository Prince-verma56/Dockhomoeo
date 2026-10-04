"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductMedia } from "@/components/commerce/ProductMedia";
import { ProductBadge } from "@/components/commerce/ProductBadge";
import { ProductPrice } from "@/components/commerce/ProductPrice";
import { Rating } from "@/components/shared/Rating";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  className?: string;
  /**
   * `featured` enlarges the name and price so the first card in a row carries
   * more weight than the ones beside it (brain/06_COMPONENT_SYSTEM.md).
   */
  variant?: "default" | "featured";
  /**
   * Sizing utility for the media box. Rows pass a fixed height rather than an
   * aspect ratio so cards of differing widths still line up, which is what lets
   * a row vary card width without going ragged along the bottom.
   */
  mediaRatio?: string;
};

/**
 * The commerce card: media-dominant, predictable controls, one add-to-cart.
 *
 * Cart and wishlist mutations are not wired yet — this component owns only the
 * pressed state of the favourite control and leaves the actual mutation to the
 * commerce layer, per the data-boundary rule in brain/03_ARCHITECTURE.md.
 */
export function ProductCard({
  product,
  className,
  variant = "default",
  mediaRatio = "aspect-[4/5]",
}: ProductCardProps) {
  const [favourited, setFavourited] = useState(false);
  const isFeatured = variant === "featured";
  const reducedMotion = useReducedMotion();

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col gap-0 overflow-hidden rounded-card border-line/70 bg-cream p-0 shadow-none transition-[box-shadow,transform,border-color] duration-400 ease-premium",
        "hover:-translate-y-1 hover:border-line hover:shadow-lift",
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <ProductMedia
          product={product}
          ratio={mediaRatio}
          glyphSize={isFeatured ? "lg" : "md"}
          rounded="rounded-none"
        />

        {product.badge ? (
          <div className="absolute top-3 left-3 z-3">
            <ProductBadge kind={product.badge} />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setFavourited((previous) => !previous)}
          aria-pressed={favourited}
          aria-label={
            favourited
              ? `Remove ${product.name} from favourites`
              : `Save ${product.name} to favourites`
          }
          className={cn(
            "absolute top-2.5 right-2.5 z-3 grid size-9 place-items-center rounded-full bg-cream/85 text-ink/55 backdrop-blur-[2px] transition-all duration-200",
            "hover:scale-105 hover:bg-cream hover:text-forest",
            favourited && "text-[#a63d2f]",
          )}
        >
          {/* Motion owns this one interaction because it is a state change,
              not a hover: the heart should overshoot and settle, and a spring
              is the one curve CSS transitions cannot express. Everything else
              on this card is a plain CSS transition, per
              brain/17_DECISIONS.md D007. */}
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={favourited ? "on" : "off"}
              initial={reducedMotion ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 520, damping: 16 }
              }
              className="grid place-items-center"
            >
              <Heart
                className={cn("size-4", favourited && "fill-current")}
                strokeWidth={1.6}
              />
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-1.5 border-t border-line/50 p-3.5 sm:p-4 bg-white",
          isFeatured && "gap-2 p-5",
        )}
      >
        <p className="text-[0.68rem] tracking-wider text-[#7a8882] uppercase font-semibold">{product.brand}</p>

        <h3
          className={cn(
            "leading-snug font-semibold text-ink line-clamp-1",
            isFeatured ? "text-[1.0625rem]" : "text-[0.92rem]",
          )}
        >
          {/* The whole card is reachable through this one link, so the card
              itself is not a nested interactive element. */}
          <Link
            href={`/product/${product.slug}`}
            className="before:absolute before:inset-0 before:content-[''] hover:text-forest transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        <p className="text-xs text-[#5f6f68] line-clamp-1">{product.variant}</p>

        {product.rating ? (
          <Rating value={product.rating.value} count={product.rating.count} />
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-line/40">
          <ProductPrice
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size={isFeatured ? "lg" : "md"}
          />

          <Button
            size="sm"
            aria-label={`Add ${product.name} to cart`}
            className="relative z-3 h-8 rounded-lg bg-forest px-3 text-[0.76rem] font-semibold text-white hover:bg-forest-deep shadow-xs inline-flex items-center gap-1.5 transition-all active:scale-95"
          >
            <ShoppingCart className="size-3.5" strokeWidth={2} />
            <span>Add</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
