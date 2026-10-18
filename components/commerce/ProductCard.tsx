"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductMedia } from "@/components/commerce/ProductMedia";
import { ProductBadge } from "@/components/commerce/ProductBadge";
import { ProductPrice } from "@/components/commerce/ProductPrice";
import { Rating } from "@/components/shared/Rating";
import { useCart } from "@/components/providers/CartProvider";
import { useFavourites } from "@/lib/favourites/favourites";
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
   * Sizing utility for the media box. Every grid uses the default so cards
   * line up; a homepage row may pass its own to suit its layout.
   */
  mediaRatio?: string;
  /** First-row cards: load the photo immediately, it is likely the LCP element. */
  eager?: boolean;
  layout?: "grid" | "list";
};

/** How long the button says "Added" after a successful add. */
const ADDED_MS = 1400;

/**
 * The commerce card: media-dominant, predictable controls, one add-to-cart.
 *
 * "Add" hands the card's pack to the cart provider with the card's image as
 * the flight's starting point, so the image travels into the cart sheet. The
 * heart saves the product to favourites on this device (lib/favourites) — the
 * shop has no wishlist contract yet.
 */
export function ProductCard({
  product,
  className,
  variant = "default",
  mediaRatio = "aspect-[4/5]",
  eager = false,
  layout = "grid",
}: ProductCardProps) {
  const favourites = useFavourites();
  const favourited = favourites.isFavourite(product.slug);
  const isFeatured = variant === "featured";
  const reducedMotion = useReducedMotion();
  const { addItem } = useCart();
  const { variantId } = product;
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  const onAdd = (event: MouseEvent<HTMLButtonElement>) => {
    if (variantId === undefined) return;
    const source = event.currentTarget
      .closest<HTMLElement>("[data-product-card]")
      ?.querySelector<HTMLElement>("[data-product-media]");
    const accepted = addItem(
      {
        variantId,
        quantity: 1,
        title: product.name,
        price: product.price.amount,
        imageUrl: product.image,
        brand: product.brand,
        form: product.form ?? undefined,
      },
      { source },
    );
    if (!accepted) return;
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), ADDED_MS);
  };

  const hasCardDiscount = Boolean(
    product.compareAtPrice && product.compareAtPrice.amount > product.price.amount,
  );
  const cardDiscount = hasCardDiscount && product.compareAtPrice
    ? Math.round(((product.compareAtPrice.amount - product.price.amount) / product.compareAtPrice.amount) * 100)
    : 0;

  return (
    <Card
      data-product-card
      className={cn(
        // @container: the price row adapts to the card's own width, not the viewport's.
        "@container group relative flex h-full gap-0 overflow-hidden rounded-2xl border border-line-soft bg-paper p-0 shadow-soft transition-[box-shadow,transform,border-color] duration-400 ease-premium select-none",
        "hover:-translate-y-1 hover:border-forest/25 hover:shadow-lift focus-within:border-forest/30",
        layout === "list" ? "flex-col sm:flex-row" : "flex-col",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden", layout === "list" && "sm:w-52 sm:shrink-0")}>
        <ProductMedia product={product} ratio={layout === "list" ? "aspect-square sm:aspect-[4/5]" : mediaRatio} eager={eager} />

        {product.badge ? (
          <div className="absolute top-3 left-3 z-3">
            <ProductBadge kind={product.badge} />
          </div>
        ) : cardDiscount > 0 ? (
          <div className="absolute top-3 left-3 z-3">
            <span className="inline-flex h-[24px] items-center rounded-full bg-forest-deep px-2.5 text-[0.6875rem] font-bold tracking-wide text-cream shadow-xs">
              {cardDiscount}% OFF
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => favourites.toggle(product.slug)}
          aria-pressed={favourited}
          aria-label={
            favourited
              ? `Remove ${product.name} from favourites`
              : `Save ${product.name} to favourites`
          }
          className={cn(
            "absolute top-2.5 right-2.5 z-3 grid size-9 cursor-pointer place-items-center rounded-full bg-cream/90 text-ink/55 shadow-xs backdrop-blur-[2px] transition-all duration-200",
            "hover:scale-105 hover:bg-cream hover:text-forest",
            favourited && "text-[#a63d2f] hover:text-[#a63d2f]",
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
          "flex flex-1 flex-col gap-1 bg-white p-3.5 sm:p-4",
          layout === "list" ? "border-t sm:border-t-0 sm:border-l border-line/50" : "border-t border-line/50",
          isFeatured && "gap-2 p-5",
        )}
      >
        <p className="truncate text-[0.68rem] font-semibold tracking-wider text-[#5f6f68] uppercase">{product.brand}</p>

        <h3
          className={cn(
            // Two lines reserved, so names of any length keep rows aligned.
            "line-clamp-2 min-h-[2.6em] leading-[1.3] font-semibold text-ink",
            isFeatured ? "text-[1.0625rem]" : "text-[0.92rem]",
          )}
        >
          {/* The whole card is reachable through this one link, so the card
              itself is not a nested interactive element. */}
          <Link
            href={`/product/${product.slug}`}
            className="transition-colors before:absolute before:inset-0 before:content-[''] hover:text-forest"
          >
            {product.name}
          </Link>
        </h3>

        {/* Pack size */}
        <p className="truncate text-xs text-[#5f6f68]">{product.variant}</p>

        {/* Full 5-star rating with review count matching reference design */}
        {product.rating ? (
          <div className="mt-0.5 flex items-center">
            <Rating
              value={product.rating.value}
              count={product.rating.count}
              variant="full"
              className="text-xs"
            />
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-1.5 border-t border-line/40 pt-2.5">
          <ProductPrice
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size={isFeatured ? "lg" : "md"}
            showSaving={true}
          />

          <Button
            size="sm"
            type="button"
            aria-label={
              variantId === undefined
                ? `${product.name} is not available to add`
                : added
                  ? `${product.name} added to cart`
                  : `Add ${product.name} to cart`
            }
            disabled={variantId === undefined}
            onClick={onAdd}
            className={cn(
              "relative z-3 inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-forest px-2.5 sm:px-3 text-[0.76rem] font-semibold text-white shadow-xs transition-all hover:bg-forest-deep active:scale-95",
              "disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/50",
              added && "bg-forest-deep",
            )}
          >
            {added ? (
              <Check aria-hidden className="size-3.5" strokeWidth={2.4} />
            ) : (
              <ShoppingCart aria-hidden className="size-3.5" strokeWidth={2} />
            )}
            <span>{added ? "Added" : "Add"}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
