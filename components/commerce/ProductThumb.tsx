"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductPackshot } from "@/components/commerce/ProductPackshot";
import type { ProductForm } from "@/types/product";
import { packFormFromText } from "@/lib/adapters/product";
import { getRealFallbackImage } from "@/components/commerce/ProductMedia";

const FORMS: readonly ProductForm[] = ["drops", "tablets", "tincture", "cream", "oil"];

/**
 * A product's small square image in the cart, checkout, orders and search.
 * The shop's photo when there is one; otherwise the same illustrated pack the
 * product's card and page draw — the form as added to the cart, or read from
 * the name and pack exactly as the card does (lib/adapters/product) — so a
 * product looks the same from listing to order. Decorative: the name always
 * sits beside it.
 */
export function ProductThumb({
  imageUrl,
  name,
  form,
  variant,
  brand,
  className,
  sizes = "96px",
  ...rest
}: {
  imageUrl?: string | null;
  name: string;
  form?: string | null;
  /** The pack title ("30 ml", "25 g"), used to draw the right container when the form is unknown. */
  variant?: string | null;
  brand?: string | null;
  className?: string;
  sizes?: string;
} & Omit<React.ComponentProps<"span">, "children">) {
  const [failed, setFailed] = useState(false);
  const packForm = FORMS.find((value) => value === form) ?? packFormFromText(variant, name);
  const fallbackSrc = getRealFallbackImage({ name, form: packForm });
  const finalSrc = (imageUrl && !failed) ? imageUrl : fallbackSrc;

  return (
    <span
      aria-hidden
      {...rest}
      className={cn("relative block shrink-0 overflow-hidden rounded-xl bg-cream-sunk ring-1 ring-ink/6 ring-inset", className)}
    >
      <Image src={finalSrc} alt="" fill sizes={sizes} className="object-cover" onError={() => setFailed(true)} />
    </span>
  );
}
