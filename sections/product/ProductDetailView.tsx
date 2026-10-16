"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Heart, Info, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { productCrumbs } from "@/lib/navigation/crumbs";
import { SafeRichText } from "@/components/shared/SafeRichText";
import { Rating } from "@/components/shared/Rating";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ProductMedia } from "@/components/commerce/ProductMedia";
import { QuantityStepper } from "@/components/commerce/QuantityStepper";
import { PincodeCheck } from "@/components/commerce/PincodeCheck";
import { mapApiCardToProduct, packFormFromText } from "@/lib/adapters/product";
import { formatRupees } from "@/lib/formatters/price";
import { formLabel, potencyLabel } from "@/lib/search/searchState";
import { useCart } from "@/components/providers/CartProvider";
import { useFavourites } from "@/lib/favourites/favourites";
import type { ApiProductDetail, ApiProductVariant } from "@/types/api/product";
import type { ProductForm } from "@/types/product";

const FORMS: readonly ProductForm[] = ["drops", "tablets", "tincture", "cream", "oil"];
const ADDED_MS = 1600;

/**
 * /product/[slug]. Renders exactly what the product contract carries: copy
 * sections appear only when the shop supplies them, and nothing about
 * benefits, delivery or safety is written here on the product's behalf.
 */
export function ProductDetailView({ product }: { product: ApiProductDetail }) {
  const initial = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const [variant, setVariant] = useState<ApiProductVariant | undefined>(initial);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(initial?.minQuantity ?? 1);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number | undefined>(undefined);
  const mediaRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const favourites = useFavourites();
  const favourited = favourites.isFavourite(product.slug);
  // The shop's own dosage form, shown as a fact; left out when the shop gives none.
  const form = FORMS.find((value) => value === product.form) ?? null;
  // The illustration follows the card's rule (lib/adapters/product), so the
  // product looks the same from listing to order.
  const packForm = packFormFromText(initial?.title, product.name);

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  // A variant's own photo wins when the shop tags one; otherwise the gallery order.
  const variantImage = product.images.findIndex((image) => image.variantId !== null && image.variantId === variant?.id);
  const shownIndex = variantImage >= 0 && imageIndex === 0 ? variantImage : imageIndex;
  const image = product.images[shownIndex] ?? product.images[0];

  const chooseVariant = (next: ApiProductVariant) => {
    setVariant(next);
    setQuantity((q) => Math.min(Math.max(q, next.minQuantity), next.maxQuantity));
  };

  const onAdd = () => {
    if (!variant?.inStock) return;
    const accepted = addItem(
      {
        variantId: variant.id,
        quantity,
        title: product.name,
        price: variant.price,
        imageUrl: image?.url,
        brand: product.brand?.name,
        form: packForm ?? undefined,
      },
      { source: mediaRef.current?.querySelector<HTMLElement>("[data-product-media]") ?? mediaRef.current },
    );
    if (!accepted) return;
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), ADDED_MS);
  };

  // The shop's `trail` is the product's category chain, top level first
  // (GET /api/shop/products/:slug); each step opens that category's listing.
  const crumbs = productCrumbs(product);

  type DetailRow = { label: string; value: React.ReactNode };
  const rows: (DetailRow | null)[] = [
    product.brand ? { label: "Brand", value: <Link href={`/brands/${product.brand.slug}`} className="font-medium text-forest underline-offset-4 hover:underline">{product.brand.name}</Link> } : null,
    product.manufacturer ? { label: "Manufacturer", value: product.manufacturer } : null,
    form ? { label: "Form", value: formLabel(form) } : null,
    variant?.potency ? { label: "Potency", value: potencyLabel(variant.potency) } : null,
    variant?.packSize ? { label: "Pack size", value: variant.packSize } : null,
    variant?.sku ? { label: "SKU", value: variant.sku } : null,
    product.countryOfOrigin ? { label: "Country of origin", value: product.countryOfOrigin } : null,
  ];
  const details = rows.filter((row): row is DetailRow => row !== null);

  const copy = [
    { id: "description", title: "Description", body: product.description },
    { id: "composition", title: "Composition", body: product.composition },
    { id: "indications", title: "Indications", body: product.indications },
    { id: "directions", title: "Directions for use", body: product.directions },
    { id: "safety", title: "Safety information", body: product.safetyInfo },
  ].filter((section): section is { id: string; title: string; body: string } => Boolean(section.body?.trim()));

  return (
    <div className="bg-canvas pt-24 pb-16 sm:pt-28 lg:pb-24">
      <Container>
        <PageBreadcrumb items={crumbs} className="mb-6 lg:mb-8" structuredData={false} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
          {/* Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div ref={mediaRef} className="relative">
              <ProductMedia
                product={{ form: packForm, name: product.name, brand: product.brand?.name, mediaLabel: image?.altText ?? product.name, image: image?.url }}
                ratio="aspect-square"
                rounded="rounded-[1.75rem]"
                eager
                sizes="(max-width: 1024px) 100vw, 600px"
                className="border border-line/70"
              />
              {variant && variant.discountPercent > 0 ? (
                <span className="absolute top-4 left-4 z-3 rounded-full bg-forest-deep px-3 py-1.5 text-xs font-semibold tracking-wide text-cream">
                  {variant.discountPercent}% off
                </span>
              ) : null}
            </div>

            {product.images.length > 1 ? (
              <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-1" aria-label="Product photos">
                {product.images.map((img, index) => (
                  <li key={img.url + index}>
                    <button
                      type="button"
                      onClick={() => setImageIndex(index)}
                      aria-label={`Show photo ${index + 1} of ${product.images.length}`}
                      aria-current={index === shownIndex ? "true" : undefined}
                      className={cn(
                        "relative block size-20 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors",
                        index === shownIndex ? "border-forest" : "border-transparent opacity-75 hover:opacity-100",
                      )}
                    >
                      <ProductMedia
                        product={{ form: packForm, name: product.name, mediaLabel: "", image: img.url }}
                        ratio="aspect-square"
                        sizes="80px"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Purchase panel */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem]">
              {product.brand ? (
                <Link href={`/brands/${product.brand.slug}`} className="font-semibold tracking-[0.08em] text-forest uppercase hover:underline">
                  {product.brand.name}
                </Link>
              ) : null}
              {product.brand && form ? <span aria-hidden className="text-line">/</span> : null}
              {form ? (
                <Link href={`/products?form=${form}`} className="text-muted-ink hover:text-forest">
                  {formLabel(form)}
                </Link>
              ) : null}
            </div>

            <h1 className="mt-2 font-display text-[2.125rem] leading-[1.08] tracking-tight text-ink sm:text-[2.75rem]">{product.name}</h1>
            {product.shortDescription ? <p className="mt-3 text-base leading-relaxed text-muted-ink">{product.shortDescription}</p> : null}

            {product.ratingCount > 0 ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-ink">
                <Rating value={product.ratingAverage} variant="full" />
                <span>
                  {product.ratingCount} {product.ratingCount === 1 ? "rating" : "ratings"}
                </span>
              </div>
            ) : null}

            {variant ? (
              <div className="mt-6 rounded-2xl border border-line-soft bg-paper p-5 sm:p-6 shadow-soft">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display text-[2rem] leading-none tracking-tight text-ink tabular-nums">{formatRupees(variant.price)}</span>
                  {variant.mrp > variant.price ? (
                    <>
                      <span className="text-base text-muted-ink line-through tabular-nums">
                        <span className="sr-only">MRP </span>
                        {formatRupees(variant.mrp)}
                      </span>
                      <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-semibold text-forest-deep">
                        Save {formatRupees(variant.mrp - variant.price)}
                      </span>
                    </>
                  ) : null}
                </div>
                <p className={cn("mt-2 flex items-center gap-1.5 text-[0.8125rem] font-medium", variant.inStock ? "text-forest" : "text-destructive")}>
                  <span aria-hidden className={cn("size-1.5 rounded-full", variant.inStock ? "bg-forest" : "bg-destructive")} />
                  {variant.inStock ? (variant.stockLeft ? `Only ${variant.stockLeft} left` : "In stock") : "Out of stock"}
                </p>

                {product.variants.length > 1 ? (
                  <fieldset className="mt-5">
                    <legend className="mb-2.5 text-sm font-semibold text-ink">Choose a pack</legend>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((option) => {
                        const selected = option.id === variant.id;
                        return (
                          <label
                            key={option.id}
                            className={cn(
                              "relative flex min-h-11 cursor-pointer flex-col justify-center rounded-xl border px-4 py-2 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-forest",
                              selected ? "border-forest bg-forest/8 text-ink shadow-2xs font-medium" : "border-line-soft bg-canvas text-muted-ink hover:border-forest/40 hover:text-ink",
                              !option.inStock && "opacity-60",
                            )}
                          >
                            <input
                              type="radio"
                              name="variant"
                              className="sr-only"
                              checked={selected}
                              onChange={() => chooseVariant(option)}
                            />
                            <span className="font-medium">{option.title}</span>
                            <span className="text-xs tabular-nums">
                              {formatRupees(option.price)}
                              {option.inStock ? "" : " · out of stock"}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ) : (
                  <p className="mt-4 text-sm text-muted-ink">
                    Pack: <span className="font-medium text-ink">{variant.title}</span>
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <QuantityStepper
                    value={quantity}
                    min={variant.minQuantity}
                    max={variant.maxQuantity}
                    label={product.name}
                    onChange={setQuantity}
                    className="h-12 [&_button]:size-12"
                  />
                  <Button
                    type="button"
                    variant="brand"
                    size="pill"
                    onClick={onAdd}
                    disabled={!variant.inStock}
                    className="h-12 min-w-44 flex-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {added ? <Check aria-hidden strokeWidth={2.4} /> : <ShoppingBag aria-hidden />}
                    {!variant.inStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xl"
                    onClick={() => favourites.toggle(product.slug)}
                    aria-pressed={favourited}
                    aria-label={favourited ? `Remove ${product.name} from favourites` : `Save ${product.name} to favourites`}
                    className={cn("cursor-pointer border-line bg-white", favourited && "border-[#a63d2f]/30 text-[#a63d2f]")}
                  >
                    <Heart aria-hidden className={cn(favourited && "fill-current")} />
                  </Button>
                </div>
                {variant.maxQuantity > 0 ? (
                  <p className="mt-2.5 text-xs text-muted-ink">Up to {variant.maxQuantity} per order.</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-6 rounded-2xl border border-dashed border-line bg-cream p-5 text-sm text-muted-ink">
                This product has no pack on sale right now.
              </p>
            )}

            {product.requiresPrescription ? (
              <p className="mt-4 flex items-start gap-2 rounded-2xl border border-warm/40 bg-warm-soft/30 p-4 text-sm text-ink">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-warm" />
                This medicine is sold against a prescription.
              </p>
            ) : null}

            {!product.allowCod || !product.allowPrepaid ? (
              <p className="mt-4 flex items-start gap-2 rounded-2xl border border-line-soft bg-paper p-4 text-sm text-ink">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" />
                {product.allowCod ? "This product can only be paid for on delivery." : "This product can only be paid for online."}
              </p>
            ) : null}

            <div className="mt-4">
              <PincodeCheck />
            </div>

            <section aria-labelledby="details-heading" className="mt-8">
              <h2 id="details-heading" className="font-display text-xl tracking-tight text-ink">
                Product details
              </h2>
              <dl className="mt-3 divide-y divide-line-soft rounded-2xl border border-line-soft bg-paper shadow-soft text-sm">
                {details.map((row) => (
                  <div key={row.label} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 px-4 py-3">
                    <dt className="text-muted-ink">{row.label}</dt>
                    <dd className="text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>

              {copy.length > 0 ? (
                <Accordion type="multiple" defaultValue={[copy[0].id]} className="mt-4 rounded-2xl border border-line-soft bg-paper shadow-soft px-4">
                  {copy.map((section) => (
                    <AccordionItem key={section.id} value={section.id} className="border-line-soft">
                      <AccordionTrigger className="cursor-pointer py-4 text-[0.9375rem] font-semibold text-ink hover:no-underline">
                        {section.title}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 text-[0.9375rem] leading-relaxed text-muted-ink [&_a]:no-underline">
                        <SafeRichText content={section.body} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : null}

              <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-sage-tint/60 p-4 text-[0.8125rem] leading-relaxed text-forest-deep">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                Homoeopathic remedies are chosen for the individual. Speak to a registered practitioner before starting,
                stopping or combining any medicine.
              </p>
            </section>
          </div>
        </div>

        {product.reviews.length > 0 ? (
          <section aria-labelledby="reviews-heading" className="mt-16 border-t border-line/70 pt-12 lg:mt-24 lg:pt-16">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h2 id="reviews-heading" className="dh-title-block text-ink">
                Customer reviews
              </h2>
              {product.ratingCount > 0 ? (
                <p className="flex items-center gap-2 text-sm text-muted-ink">
                  <Rating value={product.ratingAverage} variant="full" />
                  <span>
                    {product.ratingCount} {product.ratingCount === 1 ? "rating" : "ratings"}
                  </span>
                </p>
              ) : null}
            </div>
            <ul className="grid gap-4 md:grid-cols-2">
              {product.reviews.map((review) => (
                <li key={review.id} className="rounded-2xl border border-line-soft bg-paper p-5 shadow-xs">
                  <div className="flex items-center justify-between gap-3">
                    <Rating value={review.rating} variant="full" />
                    <time dateTime={new Date(review.createdAt).toISOString()} className="text-xs text-muted-ink">
                      {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(review.createdAt))}
                    </time>
                  </div>
                  {review.title ? <p className="mt-3 font-semibold text-ink">{review.title}</p> : null}
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-ink">{review.body}</p>
                  <p className="mt-3 text-xs text-muted-ink">
                    {review.authorName}
                    {review.isVerifiedBuyer ? " · Verified buyer" : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {product.related.length > 0 ? (
          <section aria-labelledby="related-heading" className="mt-16 border-t border-line/70 pt-12 lg:mt-24 lg:pt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 id="related-heading" className="dh-title-block text-ink">
                You may also consider
              </h2>
              <Link href="/products" className="text-sm font-semibold text-forest underline-offset-4 hover:underline">
                All products
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {product.related.map((item) => (
                <li key={item.id}>
                  <ProductCard product={mapApiCardToProduct(item)} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
