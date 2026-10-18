import {
  IHomeRepository,
  IProductRepository,
  ISearchRepository,
  ICartRepository,
  IInsightRepository,
} from "./interfaces";
import { mockProducts, mockVariantId } from "@/data/mock/products";
import { ApiHomeResponse } from "@/types/api/home";
import { ApiProductDetail, ApiProductCard } from "@/types/api/product";
import { ApiProductListingResponse, ApiSearchFilters, ApiSuggestResponse } from "@/types/api/search";
import {
  ApiQuote,
  ApiQuoteLineInput,
  ApiCheckoutPayload,
  ApiCheckoutResponse,
  ApiOrderDetail,
  ApiPaymentMethod,
} from "@/types/api/cart";
import { CheckoutError } from "@/lib/checkout/checkoutForm";
import { ApiInsightDetail, ApiInsightListingResponse, ApiInsightCard } from "@/types/api/insight";
import { Product } from "@/types/product";
import type { Article } from "@/types/content";
import { articles, healthGoals } from "@/data/mock/home";
import { slugify } from "@/lib/formatters/slug";

// Simulated network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The development catalogue keeps two things the real card leaves out: the
 * dosage form (its own filter and "related" logic use it) and a sales count
 * for "most popular". Callers only ever see them as an ApiProductCard.
 */
type MockCard = ApiProductCard & { form: string | null; sold: number };

const mapToApiProductCard = (p: Product, index: number): MockCard => ({
  id: index + 1,
  name: p.name,
  slug: p.slug,
  form: p.form,
  brandName: p.brand,
  imageUrl: p.image || null,
  price: p.price.amount,
  mrp: p.compareAtPrice?.amount || p.price.amount,
  discountPercent: p.compareAtPrice ? Math.round((1 - p.price.amount / p.compareAtPrice.amount) * 100) : 0,
  rating: p.rating?.value || 0,
  ratingCount: p.rating?.count || 0,
  inStock: true,
  // Review count stands in for units sold, so "Most Popular" orders the same on every run.
  sold: p.rating?.count ?? 0,
  // Same id scheme as LocalProductRepository's default variant.
  variantId: mockVariantId(index),
  variantTitle: p.variant,
  variantCount: 1,
  requiresPrescription: false,
});

const mockApiCards = mockProducts.map(mapToApiProductCard);

// Search mirrors the verified official backend (backend/src/modules/shop.routes.ts and
// catalog-index.ts): every typed word must appear in one lower-cased string per
// product, and matches rank by where the query lands in the name. Health goals
// stand in for the backend's product tags.
type SearchEntry = { card: MockCard; nameLower: string; text: string };

const searchIndex = new Map<number, SearchEntry>(
  mockProducts.map((p, index) => {
    const card = mockApiCards[index];
    const text = [p.name, p.brand, p.form, p.category, ...(p.healthGoals ?? []), p.variant]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return [card.id, { card, nameLower: p.name.toLowerCase(), text }];
  }),
);

const toWords = (query: string) => query.split(/\s+/).filter(Boolean);

/** How well a product matches what was typed; 0 means it does not match. Same scale as the backend. */
const searchScore = (entry: SearchEntry, query: string, words: string[]) => {
  if (!words.every((word) => entry.text.includes(word))) return 0;
  if (entry.nameLower === query) return 100;
  if (entry.nameLower.startsWith(query)) return 80;
  if (entry.nameLower.includes(query)) return 60;
  if (words.every((word) => entry.nameLower.includes(word))) return 40;
  return 10;
};

// Slugs are kebab-case, like the backend's. Filters also accept the display
// name, so links written before slugs existed keep working.
const catalogueCategories = [...new Set(mockProducts.map((p) => p.category).filter((c): c is string => Boolean(c)))];
const catalogueBrands = [...new Set(mockProducts.map((p) => p.brand))];
const productBySlug = new Map(mockProducts.map((p) => [p.slug, p]));

/**
 * The mock catalogue has two category levels: health goals (the top level the
 * header, homepage and /categories browse by) and each product's own category.
 * A product sits in a category when either level matches — the backend gets
 * the same effect by counting a product in every ancestor of its category.
 */
const inCategory = (p: Product | undefined, slug: string) => {
  if (!p) return false;
  const c = slug.toLowerCase();
  if ((p.healthGoals ?? []).includes(c)) return true;
  return p.category !== undefined && (slugify(p.category) === c || p.category.toLowerCase() === c);
};

const categoryName = (slug: string) =>
  healthGoals.find((goal) => goal.id === slug)?.name ??
  catalogueCategories.find((name) => slugify(name) === slug || name.toLowerCase() === slug) ??
  slug;

const matchesBrand = (brandName: string | null, values: string[]) =>
  brandName !== null && values.some((value) => value === brandName || value === slugify(brandName));

// The backend's sort keys, plus the underscore spellings /products already sends.
const SORT_ALIASES: Record<string, string> = { price_asc: "price-asc", price_desc: "price-desc" };

const MOCK_MAX_QUANTITY = 20; // backend: min(stock, maxOrderQuantity ?? 20)

// The backend's facet steps and price bands (shop.routes.ts), word for word.
const DISCOUNT_STEPS = [10, 20, 30, 40];
const RATING_STEPS = [4, 3];
const PRICE_BANDS = [
  { key: "0-100", label: "Under ₹100", min: 0, max: 100 },
  { key: "100-250", label: "₹100 to ₹250", min: 100, max: 250 },
  { key: "250-500", label: "₹250 to ₹500", min: 250, max: 500 },
  { key: "500-1000", label: "₹500 to ₹1,000", min: 500, max: 1000 },
  { key: "1000-", label: "Above ₹1,000", min: 1000, max: null as number | null },
];

export class LocalHomeRepository implements IHomeRepository {
  async getHomeData(): Promise<ApiHomeResponse> {
    await delay(300);
    return {
      banners: [
        {
          id: 1,
          title: "Natural Healing",
          imageUrl: "/images/hero/banner1.jpg",
          linkUrl: "/products",
          platform: "HOME_HERO",
        },
      ],
      // Like the backend: top-level categories that hold products, counted
      // from the catalogue rather than made up.
      categories: healthGoals
        .map((goal, i) => ({
          id: i + 1,
          name: goal.name,
          slug: goal.id,
          imageUrl: goal.image || null,
          productCount: mockProducts.filter((p) => inCategory(p, goal.id)).length,
        }))
        .filter((category) => category.productCount > 0),
      // The brands the catalogue actually stocks, widest range first. The
      // backend returns no description; none is invented here.
      brands: catalogueBrands
        .map((name, i) => ({
          id: i + 1,
          name,
          slug: slugify(name),
          logoUrl: null,
          description: null,
          isActive: true,
          productCount: mockProducts.filter((p) => p.brand === name).length,
        }))
        .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name)),
      rails: [
        {
          key: "bestsellers",
          title: "Best Sellers",
          href: "/products?sort=popular",
          items: mockApiCards.slice(0, 10),
        },
      ],
      wholesale: false,
    };
  }
}

/**
 * Related cards as the backend chooses them (shop.routes.ts): other in-stock
 * products in the same category, then — because the mock catalogue is small —
 * ones that share a health concern, then the same dosage form.
 */
function relatedCards(product: Product, card: MockCard): ApiProductCard[] {
  const others = mockApiCards.filter((c) => c.id !== card.id && c.inStock);
  const bySlug = (c: MockCard) => productBySlug.get(c.slug);
  const goals = new Set(product.healthGoals ?? []);
  const tiers = [
    others.filter((c) => product.category !== undefined && bySlug(c)?.category === product.category),
    others.filter((c) => (bySlug(c)?.healthGoals ?? []).some((goal) => goals.has(goal))),
    others.filter((c) => c.form === card.form),
  ];
  const chosen: MockCard[] = [];
  for (const tier of tiers) for (const c of tier) if (chosen.length < 4 && !chosen.includes(c)) chosen.push(c);
  return chosen;
}

export class LocalProductRepository implements IProductRepository {
  async getBySlug(slug: string): Promise<ApiProductDetail | null> {
    await delay(300);
    const index = mockApiCards.findIndex((p) => p.slug === slug);
    const card = mockApiCards[index];
    const p = productBySlug.get(slug);
    if (!card || !p) return null;
    const brandName = card.brandName ?? null;

    return {
      id: card.id,
      name: card.name,
      slug: card.slug,
      form: card.form,
      // The mock catalogue holds no manufacturer copy. Rather than write
      // descriptions, indications, dosing or safety text for medicines, these
      // stay empty and the page shows only what the data knows. The shop API
      // fills them from the product record.
      shortDescription: null,
      description: null,
      composition: null,
      indications: null,
      directions: null,
      safetyInfo: null,
      allowCod: true,
      allowPrepaid: true,
      manufacturer: brandName,
      countryOfOrigin: null,
      requiresPrescription: false,
      ratingAverage: card.rating,
      ratingCount: card.ratingCount,
      brand: brandName ? { name: brandName, slug: slugify(brandName), logoUrl: null } : null,
      images: card.imageUrl ? [{ url: card.imageUrl, altText: p.mediaLabel, variantId: null }] : [],
      variants: [
        {
          // Same id scheme as the listing card's variantId, so "Add" on a card
          // and on this page add the same line.
          id: mockVariantId(index),
          sku: `${p.id}-VAR-1`,
          title: p.variant,
          packSize: p.packSize ?? null,
          potency: p.potency ?? null,
          isDefault: true,
          mrp: card.mrp,
          price: card.price,
          discountPercent: card.discountPercent,
          inStock: card.inStock,
          // The backend only reports stock when it is low (five or fewer).
          stockLeft: null,
          minQuantity: 1,
          maxQuantity: MOCK_MAX_QUANTITY,
          wholesale: null,
        },
      ],
      reviews: [],
      seo: {
        // The backend's productSeo shape: the full title, site name included.
        title: `${card.name} - Buy Online | DocHomoeo`,
        description: `Buy ${card.name}${brandName ? ` by ${brandName}` : ""} online at DocHomoeo.`,
        path: `/product/${card.slug}`,
        image: card.imageUrl,
      },
      trail: [
        { name: "Home", slug: "" },
        { name: "Products", slug: "products" },
        { name: card.name, slug: card.slug },
      ],
      related: relatedCards(p, card),
      wholesale: false,
    };
  }

  async getRelated(productId: number): Promise<ApiProductDetail[]> {
    void productId;
    await delay(200);
    return []; // Related cards arrive inside getBySlug, as from the backend.
  }
}

export class LocalSearchRepository implements ISearchRepository {
  async search(filters: ApiSearchFilters): Promise<ApiProductListingResponse> {
    await delay(400);

    const query = (filters.q ?? "").trim().toLowerCase().slice(0, 80);
    // Deterministic failure for exercising the /search error state, in the
    // spirit of the "000000" triggers in the auth and pincode mocks below.
    if (query === "__mock_error__") throw new Error("Simulated search failure");

    const words = toWords(query);
    const scores = new Map<number, number>();
    if (words.length) {
      for (const entry of searchIndex.values()) {
        const score = searchScore(entry, query, words);
        if (score > 0) scores.set(entry.card.id, score);
      }
    }
    const matchesQuery = (p: ApiProductCard) => words.length === 0 || scores.has(p.id);

    // Facets follow the backend (shop.routes.ts): each filter group is checked
    // on its own, and a product that fails exactly one group still counts
    // towards that group's numbers — so "Brand" shows what ticking another
    // brand would give within everything else that is chosen.
    type Group = "category" | "brand" | "form" | "potency" | "pack" | "price" | "discount" | "rating";
    const potencies = new Set(filters.potency ?? []);
    const packs = new Set(filters.pack ?? []);
    const checks: [Group, (p: MockCard, product: Product | undefined) => boolean][] = [
      ["category", (p, product) => !filters.category || inCategory(product, filters.category)],
      ["brand", (p) => !filters.brand?.length || matchesBrand(p.brandName, filters.brand)],
      ["form", (p) => !filters.form?.length || (p.form !== null && filters.form.includes(p.form))],
      ["potency", (p, product) => potencies.size === 0 || (product?.potency !== undefined && potencies.has(product.potency))],
      ["pack", (p, product) => packs.size === 0 || (product?.packSize !== undefined && packs.has(product.packSize))],
      [
        "price",
        (p) =>
          (filters.minPrice === undefined || p.price >= filters.minPrice) &&
          (filters.maxPrice === undefined || p.price <= filters.maxPrice),
      ],
      ["discount", (p) => filters.discount === undefined || p.discountPercent >= filters.discount],
      ["rating", (p) => filters.rating === undefined || p.rating >= filters.rating],
    ];
    const count = {
      category: new Map<string, number>(),
      brand: new Map<string, number>(),
      form: new Map<string, number>(),
      potency: new Map<string, number>(),
      pack: new Map<string, number>(),
      price: new Map<string, number>(),
      discount: new Map<number, number>(),
      rating: new Map<number, number>(),
    };
    const bump = <K,>(map: Map<K, number>, key: K) => map.set(key, (map.get(key) ?? 0) + 1);
    let lowest = Infinity;
    let highest = 0;

    const results: MockCard[] = [];
    for (const p of mockApiCards) {
      // typed text and "in stock only" are not facet groups: they always apply
      if (!matchesQuery(p) || (filters.inStock && !p.inStock)) continue;
      const product = productBySlug.get(p.slug);
      const failed = checks.filter(([, passes]) => !passes(p, product)).map(([group]) => group);
      if (failed.length > 1) continue;
      const counts = (group: Group) => failed.length === 0 || failed[0] === group;
      if (counts("category") && product?.category) bump(count.category, product.category);
      if (counts("brand") && p.brandName) bump(count.brand, p.brandName);
      if (counts("form") && p.form) bump(count.form, p.form);
      if (counts("potency") && product?.potency) bump(count.potency, product.potency);
      if (counts("pack") && product?.packSize) bump(count.pack, product.packSize);
      if (counts("price")) {
        const band = PRICE_BANDS.find((b) => p.price >= b.min && (b.max === null || p.price < b.max));
        if (band) bump(count.price, band.key);
        lowest = Math.min(lowest, p.price);
        highest = Math.max(highest, p.price);
      }
      if (counts("discount")) for (const step of DISCOUNT_STEPS) if (p.discountPercent >= step) bump(count.discount, step);
      if (counts("rating")) for (const step of RATING_STEPS) if (p.rating >= step) bump(count.rating, step);
      if (failed.length === 0) results.push(p);
    }

    // Chosen values first, then the most stocked — the backend's facetOptions order.
    const options = (map: Map<string, number>, chosen: Set<string>) =>
      [...map.entries()]
        .map(([value, n]) => ({ value, count: n, selected: chosen.has(value) }))
        .sort((a, b) => Number(b.selected) - Number(a.selected) || b.count - a.count);

    const facets = {
      categories: [...count.category.entries()]
        .map(([name, n]) => ({
          id: catalogueCategories.indexOf(name) + 1,
          parentId: null,
          name,
          slug: slugify(name),
          count: n,
        }))
        .sort((a, b) => b.count - a.count),
      brands: [...count.brand.entries()]
        .map(([name, n]) => ({ value: slugify(name), label: name, count: n, selected: matchesBrand(name, filters.brand ?? []) }))
        .sort((a, b) => Number(b.selected) - Number(a.selected) || b.count - a.count),
      forms: options(count.form, new Set(filters.form ?? [])),
      potencies: options(count.potency, potencies),
      packs: options(count.pack, packs),
      prices: PRICE_BANDS.map((band) => ({ ...band, count: count.price.get(band.key) ?? 0 })).filter((band) => band.count > 0),
      priceRange: { min: lowest === Infinity ? 0 : Math.floor(lowest), max: Math.ceil(highest) },
      discounts: DISCOUNT_STEPS.map((step) => ({ value: step, count: count.discount.get(step) ?? 0 })).filter((d) => d.count > 0),
      ratings: RATING_STEPS.map((step) => ({ value: step, count: count.rating.get(step) ?? 0 })).filter((r) => r.count > 0),
    };

    // Sorting, as the backend: with nothing typed, "relevance" means most popular.
    const requested = SORT_ALIASES[filters.sort ?? ""] ?? filters.sort ?? "relevance";
    const sort = requested === "relevance" && words.length === 0 ? "popular" : requested;
    const inStockFirst = (a: MockCard, b: MockCard) => Number(b.inStock) - Number(a.inStock);
    if (sort === "price-asc") results.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") results.sort((a, b) => b.price - a.price);
    else if (sort === "newest") results.sort((a, b) => b.id - a.id);
    else if (sort === "popular")
      results.sort((a, b) => inStockFirst(a, b) || b.sold - a.sold || a.name.localeCompare(b.name));
    else if (sort === "discount") results.sort((a, b) => b.discountPercent - a.discountPercent || b.sold - a.sold);
    else if (sort === "rating") results.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
    else if (sort === "name") results.sort((a, b) => a.name.localeCompare(b.name));
    else results.sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0) || inStockFirst(a, b) || b.sold - a.sold);

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 24;
    const total = results.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const items = results.slice((page - 1) * pageSize, page * pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      pageCount,
      sort,
      category: filters.category
        ? {
            name: categoryName(filters.category),
            slug: filters.category,
            trail: [{ name: "Home", slug: "" }, { name: categoryName(filters.category), slug: filters.category }],
          }
        : null,
      facets,
      wholesale: false,
    };
  }

  async suggest(query: string): Promise<ApiSuggestResponse> {
    await delay(200);
    const q = query.trim().toLowerCase().slice(0, 60);
    if (q.length < 2) return { products: [], categories: [], brands: [] };
    const words = toWords(q);

    const products = [...searchIndex.values()]
      .map((entry) => ({ entry, score: searchScore(entry, q, words) }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ entry: { card } }) => ({
        name: card.name,
        slug: card.slug,
        brandName: card.brandName,
        imageUrl: card.imageUrl,
        price: card.price,
      }));
    const named = (names: string[]) =>
      names.filter((name) => words.every((word) => name.toLowerCase().includes(word))).slice(0, 4);

    return {
      products,
      categories: named(catalogueCategories).map((name) => ({ name, slug: slugify(name) })),
      brands: named(catalogueBrands).map((name) => ({ name, slug: slugify(name) })),
    };
  }
}

/**
 * Development stand-in for the shop's cart and order endpoints. It follows the
 * backend's pricing (buildQuote) and refusals (POST /me/checkout) with what the
 * mock catalogue knows. Where the backend reads settings this mock does not
 * have, it behaves as the backend does with nothing configured:
 *   - shipping: no shipping rules → no delivery charge, pay on delivery allowed;
 *   - coupons: none can be checked, so every code is refused, saying why;
 *   - online payment: off (paymentsMode "off"), so only pay on delivery is offered.
 * Orders it accepts are previews: a "DEV-" reference, kept in this tab's
 * sessionStorage only (see the order store below), never charged and never sent anywhere.
 */
/**
 * Orders the mock shop knows: one delivered sample order, priced from the
 * catalogue, plus every preview placed in this tab. Previews are kept in
 * sessionStorage so the confirmation page and the account's order routes
 * still find them after a reload; they never leave the browser.
 *
 * One store serves GET /me/orders (list) and GET /me/orders/:id (detail), so an
 * order placed at checkout is the same record the account pages show.
 */
const ORDERS_KEY = "dochomo_preview_orders";

function sampleOrder(): ApiOrderDetail {
  const line = (slug: string, quantity: number, id: number) => {
    const card = mockApiCards.find((c) => c.slug === slug)!;
    const product = productBySlug.get(slug)!;
    return {
      id,
      productName: card.name,
      variantTitle: product.variant,
      brandName: card.brandName,
      imageUrl: card.imageUrl,
      quantity,
      mrp: card.mrp,
      unitPrice: card.price,
      lineTotal: roundMoney(card.price * quantity),
      slug,
    };
  };
  const items = [line("arnica-montana-30c", 2, 1), line("calendula-ointment", 1, 2)];
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
  return {
    id: 1,
    orderNumber: "DH-1001",
    channel: "D2C",
    status: "DELIVERED",
    paymentMethod: "COD",
    paymentStatus: "PAID",
    placedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    estimatedDelivery: null,
    subtotal,
    couponCode: null,
    couponDiscount: 0,
    shippingCharge: 0,
    codCharge: 0,
    grandTotal: subtotal,
    customerName: "Test User",
    customerPhone: "9876543210",
    shippingAddress: "123 Health Ave, Near Park",
    shippingCity: "Mumbai",
    shippingState: "Maharashtra",
    shippingPincode: "400001",
    items,
    billingName: null,
    billingGstNumber: null,
    cancelReason: null,
    invoiceNumber: null,
    history: [],
    shipments: [],
    canCancel: false,
    canPay: false,
  };
}

const memoryOrders: ApiOrderDetail[] = [];

function readPreviewOrders(): ApiOrderDetail[] {
  if (typeof window === "undefined") return memoryOrders;
  try {
    const parsed: unknown = JSON.parse(window.sessionStorage.getItem(ORDERS_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as ApiOrderDetail[]) : [];
  } catch {
    return memoryOrders;
  }
}

function savePreviewOrder(order: ApiOrderDetail) {
  const orders = [...readPreviewOrders().filter((o) => o.id !== order.id), order];
  memoryOrders.splice(0, memoryOrders.length, ...orders);
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // Storage blocked: the order still lives in memory for this page.
  }
}

/** Newest first, like the account's order list. */
const allOrders = (): ApiOrderDetail[] =>
  [...readPreviewOrders(), sampleOrder()].sort((a, b) => b.placedAt.localeCompare(a.placedAt));

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export class LocalCartRepository implements ICartRepository {
  async getQuote(lines: ApiQuoteLineInput[], couponCode?: string, paymentMethod: ApiPaymentMethod = "COD"): Promise<ApiQuote> {
    await delay(300);
    const known = lines.filter((l) => mockApiCards.some((c) => c.id === Math.floor(l.variantId / 1000)));
    const removed = lines.filter((l) => !known.includes(l)).map((l) => l.variantId);

    const quoteLines = known.map((l) => {
      const card = mockApiCards.find((c) => c.id === Math.floor(l.variantId / 1000))!;
      const p = mockProducts.find((prod) => prod.slug === card.slug);
      return {
        variantId: l.variantId,
        productId: card.id,
        productName: card.name,
        slug: card.slug,
        variantTitle: p?.variant ?? "",
        sku: `${p?.id ?? card.id}-VAR-1`,
        brandName: card.brandName,
        imageUrl: card.imageUrl,
        gstPercent: 12,
        quantity: l.quantity,
        mrp: Math.max(card.mrp, card.price),
        retailPrice: card.price,
        unitPrice: card.price,
        lineTotal: roundMoney(card.price * l.quantity),
        priceNote: null,
        allowCod: true,
        allowPrepaid: true,
        minQuantity: 1,
        maxQuantity: MOCK_MAX_QUANTITY,
        problem: l.quantity > MOCK_MAX_QUANTITY ? `You can buy up to ${MOCK_MAX_QUANTITY} of this` : null,
      };
    });

    const subtotal = roundMoney(quoteLines.reduce((sum, l) => sum + l.lineTotal, 0));
    const mrpTotal = roundMoney(quoteLines.reduce((sum, l) => sum + l.mrp * l.quantity, 0));
    const couponError =
      couponCode && quoteLines.length
        ? "Coupon codes are checked by the DocHomoeo shop, which this preview is not connected to."
        : null;
    // The backend adds the matching shipping rule's COD charge for COD orders;
    // with no rule configured that charge is zero.
    const ruleCodCharge = 0;
    const codCharge = paymentMethod === "COD" ? ruleCodCharge : 0;

    return {
      channel: "D2C",
      lines: quoteLines,
      removed,
      itemCount: quoteLines.reduce((sum, l) => sum + l.quantity, 0),
      mrpTotal,
      subtotal,
      savings: roundMoney(mrpTotal - subtotal),
      coupon: null,
      couponError,
      shippingCharge: 0,
      freeDeliveryFrom: null,
      codAvailable: true,
      codCharge,
      codNote: null,
      onlineNote: null,
      paymentConflict: null,
      grandTotal: roundMoney(subtotal + codCharge),
      wholesale: null,
      onlinePayment: false,
      onlineTest: false,
    };
  }

  async checkout(payload: ApiCheckoutPayload): Promise<ApiCheckoutResponse> {
    await delay(900);
    if (payload.note?.trim() === "__mock_error__") {
      // Deterministic failure for exercising the checkout error state.
      throw new CheckoutError("We could not place your order just now. Nothing was charged — please try again.", 503);
    }
    if (payload.lines.length === 0) throw new CheckoutError("Your cart is empty", 400);

    const paymentMethod = payload.paymentMethod ?? "COD";
    const quote = await this.getQuote(payload.lines, payload.couponCode, paymentMethod);
    const blocked = quote.lines.find((line) => line.problem);
    if (blocked) throw new CheckoutError(`${blocked.productName} (${blocked.variantTitle}): ${blocked.problem}`, 409);
    if (payload.couponCode && quote.couponError) throw new CheckoutError(quote.couponError, 400);
    if (payload.expectedTotal !== undefined && Math.abs(payload.expectedTotal - quote.grandTotal) > 0.5) {
      throw new CheckoutError("Prices changed while you were checking out. Please look at your cart again.", 409);
    }
    if (payload.address.pincode === "000000") throw new CheckoutError("We do not deliver to this pincode yet", 400);
    if (paymentMethod === "ONLINE") throw new CheckoutError("Online payment is not connected yet. Choose pay on delivery.", 501);
    if (paymentMethod === "CREDIT") throw new CheckoutError("Buying on credit is only for wholesale accounts", 400);

    // Preview ids start above the sample order and never repeat within a tab.
    const id = Math.max(1, ...readPreviewOrders().map((order) => order.id)) + 1;
    const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const orderNumber = `DEV-${stamp}-${String(id).padStart(4, "0")}`;
    const { address } = payload;
    savePreviewOrder({
      id,
      orderNumber,
      channel: "D2C",
      status: "CONFIRMED",
      paymentMethod,
      paymentStatus: "PENDING",
      placedAt: new Date().toISOString(),
      estimatedDelivery: null,
      subtotal: quote.subtotal,
      couponCode: null,
      couponDiscount: 0,
      shippingCharge: quote.shippingCharge,
      codCharge: quote.codCharge,
      grandTotal: quote.grandTotal,
      customerName: address.fullName,
      customerPhone: address.phone,
      shippingAddress: [address.line1, address.landmark ? `Near ${address.landmark}` : null].filter(Boolean).join(", "),
      shippingCity: address.city,
      shippingState: address.state,
      shippingPincode: address.pincode,
      items: quote.lines.map((line, index) => ({
        id: index + 1,
        productName: line.productName,
        variantTitle: line.variantTitle,
        brandName: line.brandName,
        imageUrl: line.imageUrl,
        quantity: line.quantity,
        mrp: line.mrp,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
        slug: line.slug,
      })),
      billingName: null,
      billingGstNumber: null,
      cancelReason: null,
      invoiceNumber: null,
      history: [],
      shipments: [],
      canCancel: false,
      canPay: false,
    });
    return { id, orderNumber, total: quote.grandTotal, paid: false, payUrl: null };
  }

  async getOrder(orderId: number): Promise<ApiOrderDetail | null> {
    await delay(250);
    return allOrders().find((order) => order.id === orderId) ?? null;
  }

  /** The development catalogue takes no payments. */
  async payOrder(): Promise<{ payUrl: string }> {
    throw new CheckoutError("Online payment is not connected in the development catalogue.", 501);
  }
}

const articleSlug = (article: Article) => article.href.split("/").pop() ?? article.id;

// The drafts in data/mock/home.ts have no author or publication date. The
// blog API can return both; until it does, none are shown rather than invented.
const mapToApiInsightCard = (article: Article): ApiInsightCard => ({
  id: Number(article.id.replace("a-", "")),
  title: article.title,
  slug: articleSlug(article),
  excerpt: article.excerpt ?? "",
  coverImageUrl: article.image ?? null,
  authorName: null,
  publishedAt: null,
  category: { name: article.category, slug: slugify(article.category) },
});

/** Labelled placeholder body: no outcome claims, nothing posing as finished copy. */
const developmentBody = (article: Article) => `
  <p><strong>Development content.</strong> This article has not been written yet. The page shows how a published article will read once its text arrives from the DocHomeo blog.</p>
  <h2>What this article will cover</h2>
  <p>${article.excerpt ?? article.title}</p>
  <h2>Before you choose a remedy</h2>
  <p>Homoeopathic remedies are chosen for the individual. Speak to a registered practitioner before starting, stopping or combining any medicine, and seek medical care for symptoms that are severe, persistent or getting worse.</p>
`;

export class LocalInsightRepository implements IInsightRepository {
  async getInsights(page = 1, pageSize = 12, category?: string): Promise<ApiInsightListingResponse> {
    await delay(300);

    // The blog API filters by category slug; the display name is accepted too.
    const filtered = category
      ? articles.filter((a) => slugify(a.category) === category || a.category.toLowerCase() === category.toLowerCase())
      : articles;
    const items = filtered.map(mapToApiInsightCard);

    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(items.length / pageSize)),
    };
  }

  async getBySlug(slug: string): Promise<ApiInsightDetail | null> {
    await delay(300);
    const article = articles.find((a) => articleSlug(a) === slug);
    if (!article) return null;

    const card = mapToApiInsightCard(article);
    return {
      ...card,
      content: developmentBody(article),
      authorBio: null,
      authorImageUrl: null,
      updatedAt: null,
      seoTitle: null,
      seoDescription: null,
      seo: {
        title: article.title,
        description: card.excerpt ?? "",
        path: `/insights/${slug}`,
        image: card.coverImageUrl,
      },
    };
  }

  async getRelated(slug: string): Promise<ApiInsightListingResponse> {
    await delay(200);
    const related = articles.filter((a) => articleSlug(a) !== slug).slice(0, 3);
    const items = related.map(mapToApiInsightCard);
    return {
      items,
      total: related.length,
      page: 1,
      pageSize: 3,
      pageCount: 1,
    };
  }
}

/*
 * Sign-in, the account (profile, addresses, orders) and prescriptions have no
 * local implementation: they always use the backend (ApiAuthRepository,
 * ApiAccountRepository, ApiPrescriptionRepository in ./api). A mock session
 * would show account screens that never persist anything.
 */

import { IServiceabilityRepository } from "./interfaces";
import { ApiServiceabilityResult } from "@/types/api/serviceability";

export class LocalServiceabilityRepository implements IServiceabilityRepository {
  /**
   * Like the backend for a pincode it has no record of: deliverable, pay on
   * delivery allowed, no delivery estimate, no city — nothing invented.
   * "000000" stands in for a pincode the shop does not deliver to.
   */
  async checkPincode(pincode: string): Promise<ApiServiceabilityResult> {
    await delay(400);
    const deliverable = pincode !== "000000";
    return { pincode, deliverable, codAvailable: deliverable, deliveryDays: null, city: null, state: null };
  }
}

import type { ICareRepository } from "./interfaces";
import type {
  ApiDoctorCard,
  ApiDoctorDetail,
  ApiDoctorSlot,
  ApiNextSlot,
  ApiConsultingStream,
} from "@/types/api/care";

export const mockDoctors: ApiDoctorCard[] = [
  {
    id: 1,
    slug: "dr-rajesh-sharma",
    displayName: "Dr. Rajesh Sharma",
    photoUrl: "/Images/ConsultentBG.webp",
    qualification: "BHMS, MD (Homeopathy)",
    specialization: "Chronic Diseases & Immunity",
    experienceYears: 16,
    languages: ["English", "Hindi"],
    bio: "Senior homeopathic consultant specializing in long-standing constitutional disorders, chronic allergies, and autoimmune support with 16+ years of clinical practice.",
    clinicCity: "Mumbai",
    videoFee: 500,
    audioFee: 400,
    slotMinutes: 20,
    ratingAverage: 4.9,
    ratingCount: 142,
  },
  {
    id: 2,
    slug: "dr-priya-nair",
    displayName: "Dr. Priya Nair",
    photoUrl: "/Images/doctors/care-banner-agent.jpg",
    qualification: "BHMS, Fellowship in Dermatology (Homeopathy)",
    specialization: "Skin, Hair & Hormonal Health",
    experienceYears: 12,
    languages: ["English", "Hindi", "Malayalam"],
    bio: "Specialist in dermatological homeopathy, treating eczema, psoriasis, acne, and hormonal hair disorders through individualized constitutional prescribing.",
    clinicCity: "Bangalore",
    videoFee: 600,
    audioFee: 450,
    slotMinutes: 20,
    ratingAverage: 4.8,
    ratingCount: 98,
  },
  {
    id: 3,
    slug: "dr-amit-verma",
    displayName: "Dr. Amit Verma",
    photoUrl: "/Images/doctors/step-doctor-laptop.jpg",
    qualification: "BHMS, PGCR",
    specialization: "Pediatrics & Respiratory Care",
    experienceYears: 14,
    languages: ["English", "Hindi"],
    bio: "Focused on gentle pediatric remedies, seasonal asthma, bronchitis, and recurrent respiratory tract infections in children and young adults.",
    clinicCity: "Delhi NCR",
    videoFee: 550,
    audioFee: 400,
    slotMinutes: 20,
    ratingAverage: 4.9,
    ratingCount: 115,
  },
  {
    id: 4,
    slug: "dr-sunita-kulkarni",
    displayName: "Dr. Sunita Kulkarni",
    photoUrl: "/Images/journal_women.webp",
    qualification: "BHMS, MD (Homoeopathic Materia Medica)",
    specialization: "Women's Wellness & Lifestyle Disorders",
    experienceYears: 18,
    languages: ["English", "Hindi", "Marathi"],
    bio: "Expert homoeopath addressing PCOS, thyroid imbalances, migraines, stress-related sleep disorders, and menopause support through natural holistic healing.",
    clinicCity: "Pune",
    videoFee: 650,
    audioFee: 500,
    slotMinutes: 20,
    ratingAverage: 5.0,
    ratingCount: 184,
  },
];

export const mockStreams: ApiConsultingStream[] = [
  {
    name: "Classical Homoeopathy",
    status: "OPEN",
    description: "Holistic, constitutional care focusing on long-term vitality and root-cause healing.",
    specializations: [
      { id: 1, name: "Chronic Diseases & Immunity", description: "Allergies, autoimmunity, joint health" },
      { id: 2, name: "Skin, Hair & Hormonal Health", description: "Psoriasis, acne, hair thinning" },
      { id: 3, name: "Pediatrics & Respiratory Care", description: "Asthma, cough, recurrent childhood infections" },
      { id: 4, name: "Women's Wellness & Lifestyle Disorders", description: "PCOS, migraine, stress management" },
    ],
  },
  {
    name: "Integrative Wellness",
    status: "COMING_SOON",
    description: "Complementary wellness guidance combining lifestyle adjustments with gentle therapeutics.",
    specializations: [],
  },
];

export class LocalCareRepository implements ICareRepository {
  async listDoctors(query?: string): Promise<ApiDoctorCard[]> {
    await delay(100);
    if (!query) return mockDoctors;
    const q = query.toLowerCase().trim();
    return mockDoctors.filter(
      (d) =>
        d.displayName.toLowerCase().includes(q) ||
        (d.specialization && d.specialization.toLowerCase().includes(q)) ||
        d.languages.some((l) => l.toLowerCase().includes(q)) ||
        (d.clinicCity && d.clinicCity.toLowerCase().includes(q)),
    );
  }

  async getNextSlot(slug: string): Promise<ApiNextSlot | null> {
    await delay(50);
    const doctor = mockDoctors.find((d) => d.slug === slug);
    if (!doctor) return null;
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayStr = tomorrow.toISOString().split("T")[0];
    return {
      startsAt: `${dayStr}T10:30:00+05:30`,
      time: "10:30",
      day: dayStr,
    };
  }

  async getDoctor(slug: string): Promise<ApiDoctorDetail | null> {
    await delay(100);
    const doctor = mockDoctors.find((d) => d.slug === slug);
    if (!doctor) return null;
    return {
      ...doctor,
      availability: [
        { dayOfWeek: 1, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 2, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 3, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 4, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 5, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 6, startTime: "10:00", endTime: "14:00" },
      ],
    };
  }

  async getSlots(slug: string, date: string): Promise<ApiDoctorSlot[]> {
    await delay(100);
    const doctor = mockDoctors.find((d) => d.slug === slug);
    if (!doctor) return [];
    return [
      { startsAt: `${date}T10:00:00+05:30`, time: "10:00", mode: "VIDEO", available: true, reason: null },
      { startsAt: `${date}T10:30:00+05:30`, time: "10:30", mode: "VIDEO", available: true, reason: null },
      { startsAt: `${date}T11:00:00+05:30`, time: "11:00", mode: "AUDIO", available: true, reason: null },
      { startsAt: `${date}T15:00:00+05:30`, time: "15:00", mode: "VIDEO", available: true, reason: null },
      { startsAt: `${date}T15:30:00+05:30`, time: "15:30", mode: "AUDIO", available: true, reason: null },
      { startsAt: `${date}T16:00:00+05:30`, time: "16:00", mode: "VIDEO", available: true, reason: null },
    ];
  }

  async getStreams(): Promise<ApiConsultingStream[]> {
    await delay(50);
    return mockStreams;
  }
}

