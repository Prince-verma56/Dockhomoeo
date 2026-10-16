"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Info } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Button } from "@/components/ui/button";
import { repositories } from "@/lib/repositories";
import { mapProductDetailToProduct } from "@/lib/adapters/product";
import { favouritesStore, useFavourites } from "@/lib/favourites/favourites";
import { CartBreadcrumb } from "@/sections/cart/CartView";
import type { Product } from "@/types/product";

/**
 * /favourites. Saved slugs live on this device; each product's current
 * details come from the catalogue (GET /api/shop/products/:slug). A product
 * the shop no longer sells is dropped from the list, and the page says so.
 */
export function FavouritesView() {
  const { slugs, hydrated } = useFavourites();
  // slug → product, or null once the shop said it is gone.
  const [known, setKnown] = useState<Record<string, Product | null>>({});
  const [dropped, setDropped] = useState(0);
  // Lookups that failed this visit; shown as a note, never as "gone".
  const [failed, setFailed] = useState<string[]>([]);

  const missing = slugs.filter((slug) => !(slug in known) && !failed.includes(slug));
  const missingKey = missing.join(",");

  useEffect(() => {
    if (!missingKey) return;
    let active = true;
    const wanted = missingKey.split(",");
    Promise.all(
      wanted.map((slug) =>
        repositories.product.getBySlug(slug).then(
          (detail) => [slug, detail ? mapProductDetailToProduct(detail) : null] as const,
          // A failed lookup is retried on the next visit rather than treated as gone.
          () => [slug, undefined] as const,
        ),
      ),
    ).then((entries) => {
      if (!active) return;
      const gone = entries.filter(([, product]) => product === null).map(([slug]) => slug);
      setKnown((current) => {
        const next = { ...current };
        for (const [slug, product] of entries) if (product !== undefined) next[slug] = product;
        return next;
      });
      const unreachable = entries.filter(([, product]) => product === undefined).map(([slug]) => slug);
      if (unreachable.length) setFailed((current) => [...current, ...unreachable]);
      if (gone.length) {
        setDropped((count) => count + gone.length);
        favouritesStore.remove(gone);
      }
    });
    return () => {
      active = false;
    };
  }, [missingKey]);

  const products = slugs.map((slug) => known[slug]).filter((product): product is Product => Boolean(product));
  const loading = !hydrated || missing.length > 0;

  return (
    <>
      <section aria-labelledby="favourites-heading" className="dh-page-top dh-section-b">
        <Container>
          <CartBreadcrumb current="Favourites" />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 id="favourites-heading" className="dh-title-page text-ink">
              Your favourites
            </h1>
            {hydrated && slugs.length > 0 ? (
              <p role="status" className="text-sm text-muted-ink">
                {slugs.length} saved
              </p>
            ) : null}
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-ink">
            <Info aria-hidden className="size-3.5" />
            Saved on this device. Favourites aren&apos;t linked to your account yet.
          </p>

          {dropped > 0 ? (
            <p role="status" className="mt-5 rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink">
              {dropped === 1 ? "A saved item is" : `${dropped} saved items are`} no longer sold and{" "}
              {dropped === 1 ? "was" : "were"} removed.
            </p>
          ) : null}

          {failed.some((slug) => slugs.includes(slug)) ? (
            <p role="status" className="mt-5 rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink">
              Some saved items couldn&apos;t be loaded just now. Refresh the page to try again.
            </p>
          ) : null}

          {loading && products.length === 0 && slugs.length > 0 ? (
            <div role="status" className="mt-8">
              <span className="sr-only">Loading your favourites…</span>
              <div aria-hidden className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {slugs.slice(0, 4).map((slug) => (
                  <div key={slug} className="aspect-4/5 rounded-card bg-cream-sunk motion-safe:animate-pulse" />
                ))}
              </div>
            </div>
          ) : !hydrated ? (
            <div role="status" className="mt-8 h-64 rounded-card bg-cream-sunk motion-safe:animate-pulse">
              <span className="sr-only">Loading your favourites…</span>
            </div>
          ) : slugs.length === 0 ? (
            <div className="mx-auto mt-10 max-w-lg text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-500">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-sage-tint text-forest">
                <Heart aria-hidden className="size-7" strokeWidth={1.6} />
              </span>
              <h2 className="mt-5 text-2xl font-semibold text-ink">Nothing saved yet</h2>
              <p className="mt-2 text-muted-ink">
                Tap the heart on any product to keep it here while you decide.
              </p>
              <Button asChild variant="brand" size="xl" className="mt-7">
                <Link href="/products">
                  Browse medicines
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <li key={product.slug} className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
