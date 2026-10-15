"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductPackshot } from "@/components/commerce/ProductPackshot";
import type { ProductForm } from "@/types/product";

const FORMS: readonly ProductForm[] = ["drops", "tablets", "tincture", "cream", "oil"];

/** "Arnica Montana 30C" → "AM" */
const initials = (name: string) =>
  name
    .replace(/[^A-Za-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");

/**
 * A product's small square image in the cart, checkout, orders and search.
 * Photo when the data has one; the illustrated pack when the dosage form is
 * known; otherwise a typographic tile. Decorative: the name always sits beside it.
 */
export function ProductThumb({
  imageUrl,
  name,
  form,
  className,
  sizes = "96px",
  ...rest
}: {
  imageUrl?: string | null;
  name: string;
  form?: string | null;
  className?: string;
  sizes?: string;
} & Omit<React.ComponentProps<"span">, "children">) {
  const [failed, setFailed] = useState(false);
  const knownForm = FORMS.find((value) => value === form);

  return (
    <span
      aria-hidden
      {...rest}
      className={cn("relative block shrink-0 overflow-hidden rounded-xl bg-cream-sunk ring-1 ring-ink/6 ring-inset", className)}
    >
      {imageUrl && !failed ? (
        <Image src={imageUrl} alt="" fill sizes={sizes} className="object-cover" onError={() => setFailed(true)} />
      ) : knownForm ? (
        <ProductPackshot name={name} form={knownForm} />
      ) : (
        <span className="absolute inset-0 grid place-items-center bg-sage-tint font-display text-[0.95rem] tracking-[0.04em] text-forest-deep">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
