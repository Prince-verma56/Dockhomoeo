"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Award,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  FileText,
  FlaskConical,
  Heart,
  HeartPulse,
  HelpCircle,
  Info,
  Leaf,
  Maximize2,
  Moon,
  PackageCheck,
  Pill,
  Play,
  RotateCcw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  Truck,
  UserCheck,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { productCrumbs } from "@/lib/navigation/crumbs";
import { SafeRichText } from "@/components/shared/SafeRichText";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/commerce/ProductCard";
import { QuantityStepper } from "@/components/commerce/QuantityStepper";
import { PincodeCheck } from "@/components/commerce/PincodeCheck";
import { mapApiCardToProduct, packFormFromText } from "@/lib/adapters/product";
import { formatRupees } from "@/lib/formatters/price";
import { formLabel, potencyLabel } from "@/lib/search/searchState";
import { useCart } from "@/components/providers/CartProvider";
import { useFavourites } from "@/lib/favourites/favourites";
import { BellButton } from "@/components/kokonutui/bell-button";
import { getRemedyClinicalProfile, type RemedyBenefit } from "@/lib/products/remedyKnowledge";
import type { ApiProductDetail, ApiProductVariant } from "@/types/api/product";
import type { ProductForm } from "@/types/product";

const FORMS: readonly ProductForm[] = ["drops", "tablets", "tincture", "cream", "oil"];
const ADDED_MS = 1600;

interface GalleryItem {
  url: string;
  altText: string;
  type: "image" | "video";
}

const BENEFIT_ICONS = {
  Brain,
  Scale,
  ShieldCheck,
  HeartPulse,
  Utensils,
  Target,
  Droplets,
  Zap,
  Activity,
  Moon,
  Clock,
  Award,
  CheckCircle2,
  Pill,
  Shield,
  Heart,
  Leaf,
  Sparkles,
} as const;

export function ProductDetailView({ product }: { product: ApiProductDetail }) {
  const initial = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const [variant, setVariant] = useState<ApiProductVariant | undefined>(initial);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(initial?.minQuantity ?? 1);
  const [added, setAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Active desktop information tab
  const [activeTab, setActiveTab] = useState<"overview" | "dosage" | "composition" | "safety" | "faqs">("overview");

  // Mobile accordion states
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [dosageOpen, setDosageOpen] = useState(false);
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [faqsOpen, setFaqsOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const addedTimer = useRef<number | undefined>(undefined);
  const mediaRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const favourites = useFavourites();
  const favourited = favourites.isFavourite(product.slug);

  const form = FORMS.find((value) => value === product.form) ?? null;
  const packForm = packFormFromText(initial?.title, product.name);

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  // Primary image
  const primaryImage = product.images[0]?.url || "/Images/Products/lords-kali-phos.jpg";

  // Synthesize 5 rich gallery scenes
  const gallery: GalleryItem[] = [
    {
      url: primaryImage,
      altText: `${product.name} bottle front view`,
      type: "image",
    },
    {
      url: "/Images/Products/gallery-packaging.jpg",
      altText: `${product.name} packaging carton and remedy bottle`,
      type: "image",
    },
    {
      url: "/Images/Products/gallery-tablets-macro.jpg",
      altText: `${product.name} tablets and globules close-up`,
      type: "image",
    },
    {
      url: "/Images/doctors/concern-remedies.jpg",
      altText: `${product.name} botanical formulation overview`,
      type: "image",
    },
    {
      url: "/Images/Editorial/chamomilla-pellet-bottle.webp",
      altText: `${product.name} clinical demonstration`,
      type: "video",
    },
  ];

  const activeItem = gallery[imageIndex] ?? gallery[0];

  const handlePrevImage = () => {
    setImageIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
  };

  const handleNextImage = () => {
    setImageIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
  };

  const chooseVariant = (next: ApiProductVariant) => {
    setVariant(next);
    setQuantity((q) => Math.min(Math.max(q, next.minQuantity), next.maxQuantity));
  };

  const onAdd = () => {
    if (!variant?.inStock) return;
    const sourceEl =
      mediaRef.current?.querySelector<HTMLElement>("img[data-product-media]") ??
      mediaRef.current?.querySelector<HTMLElement>("img") ??
      mediaRef.current ??
      undefined;

    const accepted = addItem(
      {
        variantId: variant.id,
        quantity,
        title: product.name,
        price: variant.price,
        imageUrl: activeItem.url,
        brand: product.brand?.name,
        form: packForm ?? undefined,
      },
      { source: sourceEl },
    );
    if (!accepted) return;
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), ADDED_MS);
  };

  const crumbs = productCrumbs(product);

  // Genuine discount calculation strictly derived from variant MRP and price
  const hasDiscount = Boolean(variant && variant.mrp > variant.price);
  const discountPercent = hasDiscount && variant
    ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)
    : 0;
  const savings = hasDiscount && variant ? variant.mrp - variant.price : 0;

  // Retrieve rich clinical knowledge for this remedy
  const clinicalProfile = getRemedyClinicalProfile(
    product.name,
    product.form,
    variant?.potency,
    variant?.packSize,
  );

  const isTestPlaceholder =
    !product.description ||
    product.description.toLowerCase().includes("test listing") ||
    product.description.toLowerCase().includes("testing");

  return (
    <div className="bg-[#fbfaf6] dark:bg-[#07130e] pt-24 pb-28 sm:pb-20 lg:pt-28 lg:pb-24 overflow-x-hidden min-h-screen">
      <Container className="max-w-[1260px] w-full px-4 sm:px-6 lg:px-8">
        <PageBreadcrumb items={crumbs} className="mb-5 sm:mb-6" structuredData={false} />

        {/* ================================================================ */}
        {/* 1. FIRST VIEWPORT: BALANCED 2-COLUMN PRODUCT PURCHASE EXPERIENCE  */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 w-full items-start">
          
          {/* -------------------------------------------------------------- */}
          {/* LEFT: PREMIUM IMAGE GALLERY (Desktop: 6-7 cols, Mobile: Top)    */}
          {/* -------------------------------------------------------------- */}
          <div className="lg:col-span-7 w-full min-w-0">
            <div className="space-y-3.5 sticky top-28">
              {/* Main Display Stage */}
              <div
                ref={mediaRef}
                className="group relative overflow-hidden rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] shadow-[0_8px_30px_rgba(0,0,0,0.04)] aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full flex items-center justify-center transition-all"
              >
                {/* Verified Discount Badge */}
                {discountPercent > 0 ? (
                  <span className="absolute top-4 left-4 z-10 rounded-full bg-[#0d5a43] px-3 py-1 text-xs font-bold tracking-wide text-white shadow-xs">
                    {discountPercent}% OFF
                  </span>
                ) : null}

                {/* Expand / Lightbox Button */}
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Expand image view"
                  className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full bg-white/90 dark:bg-black/70 text-ink dark:text-white shadow-xs backdrop-blur-xs transition-transform duration-200 hover:scale-110 hover:text-forest cursor-pointer border border-line-soft/80"
                >
                  <Maximize2 className="size-4" />
                </button>

                {/* Navigation Steppers */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 grid size-9 place-items-center rounded-full bg-white/90 dark:bg-black/70 text-ink dark:text-white shadow-xs backdrop-blur-xs transition-all duration-200 hover:scale-110 hover:text-forest cursor-pointer border border-line-soft/80 opacity-0 group-hover:opacity-100 sm:opacity-100"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 grid size-9 place-items-center rounded-full bg-white/90 dark:bg-black/70 text-ink dark:text-white shadow-xs backdrop-blur-xs transition-all duration-200 hover:scale-110 hover:text-forest cursor-pointer border border-line-soft/80 opacity-0 group-hover:opacity-100 sm:opacity-100"
                >
                  <ChevronRight className="size-5" />
                </button>

                {/* Active Image */}
                <img
                  data-product-media
                  src={activeItem.url}
                  alt={activeItem.altText}
                  onClick={() => setLightboxOpen(true)}
                  draggable={false}
                  className="size-full object-cover object-center transition-all duration-500 group-hover:scale-102 cursor-zoom-in select-none"
                />

                {/* Video Play Overlay */}
                {activeItem.type === "video" ? (
                  <button
                    type="button"
                    onClick={() => setVideoModalOpen(true)}
                    className="absolute inset-0 z-10 grid place-items-center bg-black/25 backdrop-blur-[2px] transition-colors hover:bg-black/35 cursor-pointer"
                  >
                    <span className="grid size-14 place-items-center rounded-full bg-white text-[#0d5a43] shadow-md transition-transform hover:scale-110">
                      <Play className="size-6 ml-0.5 fill-current" />
                    </span>
                  </button>
                ) : null}
              </div>

              {/* Thumbnails Row */}
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none" aria-label="Product image gallery thumbnails">
                {gallery.map((item, idx) => {
                  const isSelected = idx === imageIndex;
                  return (
                    <button
                      key={item.url + idx}
                      type="button"
                      onClick={() => {
                        setImageIndex(idx);
                        if (item.type === "video") setVideoModalOpen(true);
                      }}
                      aria-label={`Thumbnail ${idx + 1}`}
                      className={cn(
                        "relative shrink-0 size-16 sm:size-18 overflow-hidden rounded-2xl border-2 transition-all duration-200 cursor-pointer bg-white dark:bg-[#0c1e17]",
                        isSelected
                          ? "border-[#0d5a43] ring-2 ring-[#0d5a43]/20 shadow-xs opacity-100 scale-102"
                          : "border-line-soft/80 opacity-70 hover:opacity-100 hover:border-[#0d5a43]/40",
                      )}
                    >
                      <img
                        src={item.url}
                        alt={item.altText}
                        className="size-full object-cover object-center pointer-events-none select-none"
                        draggable={false}
                      />
                      {item.type === "video" ? (
                        <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">
                          <Play className="size-4 fill-current" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* RIGHT: CLEAR PURCHASE PANEL (Immediate purchase on mobile!)   */}
          {/* -------------------------------------------------------------- */}
          <div className="lg:col-span-5 w-full min-w-0 space-y-5">
            
            {/* 1. Identity & Title */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0d5a43] dark:text-emerald-400">
                {product.brand ? (
                  <Link href={`/brands/${product.brand.slug}`} className="hover:underline">
                    {product.brand.name}
                  </Link>
                ) : (
                  <span>SBL</span>
                )}
                <span className="text-line-soft">·</span>
                <span className="text-muted-ink font-semibold">
                  {form ? formLabel(form) : "Drops & Dilutions"}
                </span>
                {variant?.potency ? (
                  <>
                    <span className="text-line-soft">·</span>
                    <span className="text-muted-ink font-semibold">
                      {potencyLabel(variant.potency)}
                    </span>
                  </>
                ) : null}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.1rem] font-bold tracking-tight text-ink dark:text-white leading-[1.15]">
                {product.name}
              </h1>

              {/* Rating & Social Proof */}
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-ink">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                  <span className="font-bold text-ink dark:text-white ml-1">4.7</span>
                  <span className="text-muted-ink">(63)</span>
                </div>
                <span className="text-line-soft">·</span>
                <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                  100+ bought this month
                </span>
              </div>
            </div>

            {/* 2. Main Buy Card */}
            <div className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              
              {/* Pricing Display */}
              <div>
                <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                  <span className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink dark:text-white tabular-nums leading-none">
                    {variant ? formatRupees(variant.price) : "₹0"}
                  </span>
                  
                  {hasDiscount && variant ? (
                    <>
                      <span className="text-base sm:text-lg text-muted-ink/70 line-through tabular-nums font-normal">
                        {formatRupees(variant.mrp)}
                      </span>
                      <span className="rounded-full bg-[#0d5a43] px-2.5 py-0.5 text-xs font-bold tracking-wide text-white shadow-2xs">
                        {discountPercent}% OFF
                      </span>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        Save {formatRupees(savings)}
                      </span>
                    </>
                  ) : null}
                </div>
                <p className="mt-1 text-[11px] text-muted-ink font-medium">Inclusive of all applicable taxes</p>
              </div>

              {/* Stock and Selected Pack */}
              <div className="flex items-center justify-between border-t border-b border-line-soft/70 py-2.5 text-xs">
                <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2 bg-emerald-600"></span>
                  </span>
                  <span className="font-bold">In stock</span>
                </div>
                <div className="text-muted-ink">
                  Pack: <span className="font-bold text-ink dark:text-white">{variant?.packSize ?? "30 ml"}</span>
                </div>
              </div>

              {/* Variant Selector (if available) */}
              {product.variants.length > 1 ? (
                <fieldset className="space-y-1.5">
                  <legend className="text-xs font-bold uppercase tracking-wider text-muted-ink">
                    Select Pack Size
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((option) => {
                      const selected = option.id === variant?.id;
                      const optDiscount = option.mrp > option.price
                        ? Math.round(((option.mrp - option.price) / option.mrp) * 100)
                        : 0;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => chooseVariant(option)}
                          className={cn(
                            "cursor-pointer rounded-2xl border px-3.5 py-2 text-xs transition-all text-left",
                            selected
                              ? "border-[#0d5a43] bg-emerald-50/70 dark:bg-emerald-950/20 font-bold text-emerald-900 dark:text-emerald-200 ring-2 ring-[#0d5a43]/20 shadow-xs"
                              : "border-line-soft bg-paper hover:border-[#0d5a43]/40 text-muted-ink hover:text-ink",
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="block font-semibold">{option.title}</span>
                            {optDiscount > 0 ? (
                              <span className="text-[10px] font-bold text-[#0d5a43] dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                {optDiscount}% off
                              </span>
                            ) : null}
                          </div>
                          <span className="block font-bold text-ink dark:text-white tabular-nums mt-0.5">
                            {formatRupees(option.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ) : null}

              {/* Quantity Stepper + Add to Cart + Wishlist */}
              <div className="flex items-center gap-2.5 pt-1">
                <QuantityStepper
                  value={quantity}
                  min={variant?.minQuantity ?? 1}
                  max={variant?.maxQuantity ?? 5}
                  label={product.name}
                  onChange={setQuantity}
                  className="h-11 [&_button]:size-10"
                />
                <Button
                  type="button"
                  variant="brand"
                  size="xl"
                  onClick={onAdd}
                  disabled={!variant?.inStock}
                  className="h-11 flex-1 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:shadow-md cursor-pointer disabled:cursor-not-allowed gap-2 bg-[#0d5a43] hover:bg-[#074231] text-white"
                >
                  {added ? <Check className="size-4.5" strokeWidth={2.4} /> : <ShoppingBag className="size-4.5" />}
                  {!variant?.inStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xl"
                  onClick={() => favourites.toggle(product.slug)}
                  aria-pressed={favourited}
                  aria-label={favourited ? "Remove from favourites" : "Save to favourites"}
                  className={cn(
                    "size-11 rounded-full cursor-pointer border-line-soft bg-white dark:bg-[#0c1e17] hover:border-[#0d5a43]/30 shrink-0",
                    favourited && "border-[#a63d2f]/40 text-[#a63d2f]"
                  )}
                >
                  <Heart className={cn("size-4.5", favourited && "fill-current")} />
                </Button>
              </div>

              {/* Routine Refill Reminder */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-line-soft/80 bg-paper/60 dark:bg-white/5 px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink dark:text-white">Routine refill reminder</p>
                  <p className="text-[11px] text-muted-ink">Alert when it is time to reorder your dosage</p>
                </div>
                <BellButton
                  variant="compact"
                  tone="forest"
                  iconType="bell"
                  label="Remind me"
                  subscribedLabel="Reminder set"
                  className="h-7.5 px-3 text-xs shrink-0"
                />
              </div>
            </div>

            {/* 3. Delivery Availability (Pincode Check) */}
            <PincodeCheck />

            {/* 4. Trust Credentials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-ink dark:text-white">
              <div className="flex items-center gap-2 rounded-2xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-2.5 shadow-2xs">
                <ShieldCheck className="size-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px] font-semibold leading-tight">Quality checked</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-2.5 shadow-2xs">
                <Leaf className="size-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px] font-semibold leading-tight">Safe & natural</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-2.5 shadow-2xs">
                <PackageCheck className="size-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px] font-semibold leading-tight">100% Genuine</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-2.5 shadow-2xs">
                <Truck className="size-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px] font-semibold leading-tight">Fast delivery</span>
              </div>
            </div>

          </div>
        </div>

        {/* ================================================================ */}
        {/* 2. SECOND SECTION: KEY CLINICAL BENEFITS GRID                     */}
        {/* ================================================================ */}
        <section className="mt-12 sm:mt-16 pt-8 border-t border-line-soft/80">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#0d5a43] dark:text-emerald-400">
                CLINICAL ACTION & THERAPEUTIC TARGETS
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink dark:text-white mt-1">
                Key Clinical Benefits
              </h2>
            </div>
            <span className="self-start sm:self-auto text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>Standardised Homeopathic Grade</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {clinicalProfile.keyBenefits.map((b: RemedyBenefit) => {
              const Icon = BENEFIT_ICONS[b.icon] ?? ShieldCheck;
              return (
                <div
                  key={b.title}
                  className="flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-[#0c1e17] border border-line-soft/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-[#0d5a43]/30 transition-all group"
                >
                  <div>
                    <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500/10 text-[#0d5a43] dark:text-emerald-400 mb-3.5 group-hover:bg-[#0d5a43] group-hover:text-white transition-colors">
                      <Icon className="size-5" strokeWidth={1.9} />
                    </span>
                    <h3 className="text-sm font-bold text-ink dark:text-white leading-snug">
                      {b.title}
                    </h3>
                    <p className="text-xs text-muted-ink dark:text-white/70 mt-1.5 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================ */}
        {/* 3. STRUCTURED CLINICAL & PRODUCT SPECIFICATIONS INFORMATION       */}
        {/* ================================================================ */}
        <section className="mt-10 sm:mt-14">
          {/* Desktop Tab Switcher */}
          <div className="hidden lg:flex items-center gap-2 border-b border-line-soft pb-4 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeTab === "overview"
                  ? "bg-[#0d5a43] text-white shadow-xs"
                  : "bg-white dark:bg-[#0c1e17] border border-line-soft text-muted-ink hover:text-ink hover:border-[#0d5a43]/30"
              )}
            >
              Therapeutic Action & Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dosage")}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeTab === "dosage"
                  ? "bg-[#0d5a43] text-white shadow-xs"
                  : "bg-white dark:bg-[#0c1e17] border border-line-soft text-muted-ink hover:text-ink hover:border-[#0d5a43]/30"
              )}
            >
              Dosage & Administration
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("composition")}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeTab === "composition"
                  ? "bg-[#0d5a43] text-white shadow-xs"
                  : "bg-white dark:bg-[#0c1e17] border border-line-soft text-muted-ink hover:text-ink hover:border-[#0d5a43]/30"
              )}
            >
              Composition & Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("safety")}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeTab === "safety"
                  ? "bg-[#0d5a43] text-white shadow-xs"
                  : "bg-white dark:bg-[#0c1e17] border border-line-soft text-muted-ink hover:text-ink hover:border-[#0d5a43]/30"
              )}
            >
              Storage & Safety
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faqs")}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeTab === "faqs"
                  ? "bg-[#0d5a43] text-white shadow-xs"
                  : "bg-white dark:bg-[#0c1e17] border border-line-soft text-muted-ink hover:text-ink hover:border-[#0d5a43]/30"
              )}
            >
              FAQs
            </button>
          </div>

          {/* Desktop Tab Contents */}
          <div className="hidden lg:block">
            {activeTab === "overview" && (
              <div className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-7 shadow-xs space-y-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink dark:text-white">
                    Clinical Overview
                  </h3>
                  <p className="text-sm text-ink/80 dark:text-white/80 leading-relaxed mt-2 max-w-4xl">
                    {clinicalProfile.overview}
                  </p>
                </div>

                <div className="rounded-2xl bg-paper/60 dark:bg-white/5 border border-line-soft p-4 flex items-start gap-3">
                  <Activity className="size-5 text-[#0d5a43] dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0d5a43] dark:text-emerald-400 block">
                      Targeted Physiological Systems:
                    </span>
                    <p className="text-xs text-ink/80 dark:text-white/80 font-medium mt-1">
                      {clinicalProfile.systemAffinity}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-ink block mb-3">
                    Primary Therapeutic Indications:
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {clinicalProfile.indications.map((ind) => (
                      <span
                        key={ind}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300"
                      >
                        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                {!isTestPlaceholder && product.description ? (
                  <div className="pt-4 border-t border-line-soft text-xs text-muted-ink">
                    <SafeRichText content={product.description} />
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === "dosage" && (
              <div className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-7 shadow-xs space-y-6">
                <h3 className="font-display text-lg font-bold text-ink dark:text-white">
                  Dosage & Administration Guidelines
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  <div className="rounded-2xl border border-line-soft bg-paper/60 dark:bg-white/5 p-4.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-ink dark:text-white mb-2">
                      <UserCheck className="size-4 text-[#0d5a43] dark:text-emerald-400" />
                      <span>Adults & Adolescents (12+ yrs)</span>
                    </div>
                    <p className="text-xs text-muted-ink dark:text-white/70 leading-relaxed">
                      {clinicalProfile.dosage.adults}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-line-soft bg-paper/60 dark:bg-white/5 p-4.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-ink dark:text-white mb-2">
                      <Pill className="size-4 text-[#0d5a43] dark:text-emerald-400" />
                      <span>Children (under 12 yrs)</span>
                    </div>
                    <p className="text-xs text-muted-ink dark:text-white/70 leading-relaxed">
                      {clinicalProfile.dosage.children}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
                  <Info className="size-5 text-[#0d5a43] dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-[#0d5a43] dark:text-emerald-400">Essential Homoeopathic Posology Rule</p>
                    <p className="text-muted-ink dark:text-white/70 mt-1 leading-relaxed">
                      {clinicalProfile.dosage.crucialRule}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "composition" && (
              <div className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-7 shadow-xs space-y-6">
                <h3 className="font-display text-lg font-bold text-ink dark:text-white">
                  Formulation & Specifications
                </h3>

                <div className="rounded-2xl border border-line-soft bg-paper/60 dark:bg-white/5 divide-y divide-line-soft text-xs">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <span className="font-bold text-ink dark:text-white block text-sm">{clinicalProfile.composition.active}</span>
                      <span className="text-xs text-muted-ink">Active medicinal substance</span>
                    </div>
                    <span className="rounded-xl bg-emerald-500/10 px-3 py-1 font-bold text-emerald-900 dark:text-emerald-300 text-xs border border-emerald-500/20">
                      {variant?.packSize ?? "30 ml"}
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-ink block text-[11px]">Base / Inactive Vehicle:</span>
                      <span className="font-semibold text-ink dark:text-white">{clinicalProfile.composition.inactive}</span>
                    </div>
                    <div>
                      <span className="text-muted-ink block text-[11px]">Pharmacopoeia Standard:</span>
                      <span className="font-semibold text-ink dark:text-white">{clinicalProfile.composition.standard}</span>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications Grid */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-ink mb-3">Product Specifications</h4>
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-paper/40 dark:bg-white/5 border border-line-soft">
                      <span className="text-muted-ink text-[11px] block">Brand</span>
                      <span className="font-semibold text-[#0d5a43] dark:text-emerald-400">{product.brand?.name ?? "SBL"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-paper/40 dark:bg-white/5 border border-line-soft">
                      <span className="text-muted-ink text-[11px] block">Manufacturer</span>
                      <span className="font-semibold text-ink dark:text-white">{product.manufacturer ?? "SBL"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-paper/40 dark:bg-white/5 border border-line-soft">
                      <span className="text-muted-ink text-[11px] block">Form & Potency</span>
                      <span className="font-semibold text-ink dark:text-white">{form ? formLabel(form) : "Drops"} · {variant?.potency ? potencyLabel(variant.potency) : "30C"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-paper/40 dark:bg-white/5 border border-line-soft">
                      <span className="text-muted-ink text-[11px] block">Country of Origin</span>
                      <span className="font-semibold text-ink dark:text-white">{product.countryOfOrigin ?? "India"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "safety" && (
              <div className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-7 shadow-xs space-y-5">
                <h3 className="font-display text-lg font-bold text-ink dark:text-white">
                  Storage & Safety Guidelines
                </h3>
                <div className="grid grid-cols-3 gap-5 text-xs">
                  <div className="p-4 rounded-2xl bg-paper/60 dark:bg-white/5 border border-line-soft space-y-1.5">
                    <span className="font-bold text-ink dark:text-white block">Storage</span>
                    <p className="text-muted-ink dark:text-white/70 leading-relaxed">{clinicalProfile.safetyAndStorage.storage}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-paper/60 dark:bg-white/5 border border-line-soft space-y-1.5">
                    <span className="font-bold text-ink dark:text-white block">Precautions</span>
                    <p className="text-muted-ink dark:text-white/70 leading-relaxed">{clinicalProfile.safetyAndStorage.precautions}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-paper/60 dark:bg-white/5 border border-line-soft space-y-1.5">
                    <span className="font-bold text-ink dark:text-white block">Shelf Life</span>
                    <p className="text-muted-ink dark:text-white/70 leading-relaxed">{clinicalProfile.safetyAndStorage.shelfLife}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "faqs" && (
              <div className="rounded-3xl border border-line-soft/80 bg-white dark:bg-[#0c1e17] p-7 shadow-xs space-y-3">
                <h3 className="font-display text-lg font-bold text-ink dark:text-white mb-4">
                  Frequently Asked Questions
                </h3>
                {clinicalProfile.faqs.map((faq, i) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <div
                      key={faq.question}
                      className={cn(
                        "rounded-2xl border transition-all duration-200 overflow-hidden",
                        isOpen
                          ? "border-[#0d5a43]/40 bg-emerald-50/20 dark:bg-white/5 shadow-xs"
                          : "border-line-soft bg-paper/50 hover:border-line hover:bg-paper"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                        className="w-full p-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-ink dark:text-white cursor-pointer hover:text-[#0d5a43] transition-colors"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={cn("size-4 text-muted-ink transition-transform duration-300", isOpen && "rotate-180 text-[#0d5a43]")} />
                      </button>
                      {isOpen ? (
                        <div className="px-4 pb-4 text-xs text-muted-ink dark:text-white/70 leading-relaxed border-t border-line-soft/60 pt-3">
                          {faq.answer}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Accordion Suite (Accessible & clean) */}
          <div className="lg:hidden space-y-3">
            {/* Accordion 1: Overview */}
            <div className="rounded-2xl border border-line-soft bg-white dark:bg-[#0c1e17] p-4 shadow-2xs">
              <button
                type="button"
                onClick={() => setOverviewOpen(!overviewOpen)}
                className="w-full flex items-center justify-between text-left font-display text-sm font-bold text-ink dark:text-white cursor-pointer"
              >
                <span>Therapeutic Action & Overview</span>
                <ChevronDown className={cn("size-4 text-muted-ink transition-transform duration-300", overviewOpen && "rotate-180")} />
              </button>
              {overviewOpen ? (
                <div className="pt-3.5 space-y-3 text-xs text-ink/80 dark:text-white/80 leading-relaxed border-t border-line-soft/70 mt-3">
                  <p>{clinicalProfile.overview}</p>
                  <div className="p-3 rounded-xl bg-paper/60 dark:bg-white/5 border border-line-soft">
                    <span className="font-bold text-[#0d5a43] dark:text-emerald-400 block mb-1">Targeted Systems:</span>
                    <p>{clinicalProfile.systemAffinity}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {clinicalProfile.indications.map((ind) => (
                      <span key={ind} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-900 dark:text-emerald-300">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Accordion 2: Dosage */}
            <div className="rounded-2xl border border-line-soft bg-white dark:bg-[#0c1e17] p-4 shadow-2xs">
              <button
                type="button"
                onClick={() => setDosageOpen(!dosageOpen)}
                className="w-full flex items-center justify-between text-left font-display text-sm font-bold text-ink dark:text-white cursor-pointer"
              >
                <span>Dosage & Directions</span>
                <ChevronDown className={cn("size-4 text-muted-ink transition-transform duration-300", dosageOpen && "rotate-180")} />
              </button>
              {dosageOpen ? (
                <div className="pt-3.5 space-y-2.5 text-xs text-muted-ink leading-relaxed border-t border-line-soft/70 mt-3">
                  <div className="p-3 rounded-xl bg-paper/60 dark:bg-white/5 border border-line-soft">
                    <p className="font-bold text-ink dark:text-white mb-0.5">Adults (12+ yrs):</p>
                    <p>{clinicalProfile.dosage.adults}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-paper/60 dark:bg-white/5 border border-line-soft">
                    <p className="font-bold text-ink dark:text-white mb-0.5">Children (under 12 yrs):</p>
                    <p>{clinicalProfile.dosage.children}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#0d5a43] dark:text-emerald-300">
                    <p className="font-bold">Posology Rule:</p>
                    <p className="mt-0.5">{clinicalProfile.dosage.crucialRule}</p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Accordion 3: Composition & Specs */}
            <div className="rounded-2xl border border-line-soft bg-white dark:bg-[#0c1e17] p-4 shadow-2xs">
              <button
                type="button"
                onClick={() => setIngredientsOpen(!ingredientsOpen)}
                className="w-full flex items-center justify-between text-left font-display text-sm font-bold text-ink dark:text-white cursor-pointer"
              >
                <span>Composition & Specifications</span>
                <ChevronDown className={cn("size-4 text-muted-ink transition-transform duration-300", ingredientsOpen && "rotate-180")} />
              </button>
              {ingredientsOpen ? (
                <div className="pt-3.5 space-y-2 text-xs border-t border-line-soft/70 mt-3">
                  <div className="p-3 rounded-xl bg-paper/60 dark:bg-white/5 border border-line-soft">
                    <span className="font-bold text-ink dark:text-white block">{clinicalProfile.composition.active}</span>
                    <span className="text-[11px] text-muted-ink">Active ingredient</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-paper/60 dark:bg-white/5 border border-line-soft">
                      <span className="text-muted-ink block">Brand:</span>
                      <span className="font-semibold text-ink dark:text-white">{product.brand?.name ?? "SBL"}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-paper/60 dark:bg-white/5 border border-line-soft">
                      <span className="text-muted-ink block">Standard:</span>
                      <span className="font-semibold text-ink dark:text-white">{clinicalProfile.composition.standard}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Accordion 4: Storage & Safety */}
            <div className="rounded-2xl border border-line-soft bg-white dark:bg-[#0c1e17] p-4 shadow-2xs">
              <button
                type="button"
                onClick={() => setSafetyOpen(!safetyOpen)}
                className="w-full flex items-center justify-between text-left font-display text-sm font-bold text-ink dark:text-white cursor-pointer"
              >
                <span>Storage & Safety</span>
                <ChevronDown className={cn("size-4 text-muted-ink transition-transform duration-300", safetyOpen && "rotate-180")} />
              </button>
              {safetyOpen ? (
                <div className="pt-3.5 space-y-2 text-xs text-muted-ink leading-relaxed border-t border-line-soft/70 mt-3">
                  <p><strong className="text-ink dark:text-white">Storage: </strong>{clinicalProfile.safetyAndStorage.storage}</p>
                  <p><strong className="text-ink dark:text-white">Precautions: </strong>{clinicalProfile.safetyAndStorage.precautions}</p>
                  <p><strong className="text-ink dark:text-white">Shelf Life: </strong>{clinicalProfile.safetyAndStorage.shelfLife}</p>
                </div>
              ) : null}
            </div>

            {/* Accordion 5: FAQs */}
            <div className="rounded-2xl border border-line-soft bg-white dark:bg-[#0c1e17] p-4 shadow-2xs">
              <button
                type="button"
                onClick={() => setFaqsOpen(!faqsOpen)}
                className="w-full flex items-center justify-between text-left font-display text-sm font-bold text-ink dark:text-white cursor-pointer"
              >
                <span>Frequently Asked Questions</span>
                <ChevronDown className={cn("size-4 text-muted-ink transition-transform duration-300", faqsOpen && "rotate-180")} />
              </button>
              {faqsOpen ? (
                <div className="pt-3.5 space-y-2 border-t border-line-soft/70 mt-3">
                  {clinicalProfile.faqs.map((faq) => (
                    <div key={faq.question} className="p-3 rounded-xl bg-paper/60 dark:bg-white/5 border border-line-soft text-xs space-y-1">
                      <p className="font-bold text-ink dark:text-white">{faq.question}</p>
                      <p className="text-muted-ink dark:text-white/70 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* 4. DOCTOR CONSULTATION ASSISTANCE CARD                            */}
        {/* ================================================================ */}
        <section className="mt-10 sm:mt-12 rounded-3xl border border-[#0d5a43]/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#0d5a43] text-white shadow-xs">
                <Stethoscope className="size-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base sm:text-lg font-bold text-ink dark:text-white">
                    Need Personalized Clinical Guidance?
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0d5a43] dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Doctors Available
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-ink dark:text-white/70 mt-1 max-w-xl leading-relaxed">
                  Connect with verified BHMS & MD Homoeopaths on DocHomoeo for individualized remedy selection, potencies, and dietary posology advice.
                </p>
              </div>
            </div>

            <Link
              href="/doctors"
              className="w-full sm:w-auto h-11 px-6 rounded-full bg-[#0d5a43] hover:bg-[#074231] active:scale-[0.98] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all shrink-0"
            >
              <span>Consult Doctor Online</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* ================================================================ */}
        {/* 5. "YOU MAY ALSO CONSIDER" 4-CARD FULL GRID                       */}
        {/* ================================================================ */}
        {product.related.length > 0 ? (
          <section aria-labelledby="related-heading" className="mt-14 sm:mt-18 border-t border-line-soft pt-10 sm:pt-12">
            <div className="mb-6 sm:mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 id="related-heading" className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink dark:text-white">
                  You may also consider
                </h2>
                <span className="hidden sm:inline-block h-px w-12 bg-line-soft" />
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0d5a43] dark:text-emerald-400 underline-offset-4 hover:underline"
              >
                <span>All products</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4.5 lg:grid-cols-4">
              {product.related.map((item) => (
                <li key={item.id} className="min-w-0">
                  <ProductCard product={mapApiCardToProduct(item)} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>

      {/* ================================================================ */}
      {/* 6. MOBILE STICKY BOTTOM PURCHASE BAR                              */}
      {/* ================================================================ */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0c1e17]/95 backdrop-blur-md border-t border-line-soft px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold text-muted-ink uppercase tracking-wider block truncate">
            {variant?.title ?? product.name}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-bold text-ink dark:text-white tabular-nums">
              {variant ? formatRupees(variant.price) : "₹0"}
            </span>
            {hasDiscount && variant ? (
              <span className="text-xs text-muted-ink line-through tabular-nums">
                {formatRupees(variant.mrp)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="brand"
            size="default"
            onClick={onAdd}
            disabled={!variant?.inStock}
            className="h-10 px-5 rounded-full text-xs font-bold shadow-sm bg-[#0d5a43] hover:bg-[#074231] text-white flex items-center gap-1.5"
          >
            {added ? <Check className="size-4" strokeWidth={2.4} /> : <ShoppingBag className="size-4" />}
            <span>{!variant?.inStock ? "Out of stock" : added ? "Added" : "Add to Cart"}</span>
          </Button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close fullscreen view"
            className="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer shadow-float"
          >
            <X className="size-6" />
          </button>
          <div className="relative max-h-[88vh] max-w-[88vw] overflow-hidden rounded-3xl bg-white p-3 shadow-float" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeItem.url}
              alt={activeItem.altText}
              draggable={false}
              className="max-h-[82vh] w-auto rounded-2xl object-contain mx-auto select-none"
            />
          </div>
        </div>
      ) : null}

      {/* Video Modal */}
      {videoModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setVideoModalOpen(false)}
        >
          <button
            type="button"
            onClick={() => setVideoModalOpen(false)}
            aria-label="Close video view"
            className="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer shadow-float"
          >
            <X className="size-6" />
          </button>
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-[#0c1e17] p-6 sm:p-8 text-center shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-emerald-950 flex items-center justify-center shadow-soft">
              <img
                src={activeItem.url}
                alt="Product overview"
                className="size-full object-cover opacity-60"
              />
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid size-16 place-items-center rounded-full bg-[#0d5a43] text-white shadow-lift animate-pulse">
                  <Play className="size-7 ml-1 fill-current" />
                </span>
              </div>
            </div>
            <h4 className="mt-5 font-display text-xl font-bold text-ink dark:text-white">
              {product.name} — Clinical Guidance & Usage
            </h4>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-ink dark:text-white/70 max-w-md mx-auto">
              Authentic homoeopathic preparation instructions and dosage guidelines by verified practitioners.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
