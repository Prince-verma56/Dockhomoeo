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

const mapToApiProductCard = (p: Product, index: number): ApiProductCard => ({
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
  sold: Math.floor(Math.random() * 500) + 10,
  // Same id scheme as LocalProductRepository's default variant.
  variantId: mockVariantId(index),
  variantTitle: p.variant,
});

const mockApiCards = mockProducts.map(mapToApiProductCard);

// Search mirrors the verified backend (docohomo-prince shop.routes.ts and
// catalog-index.ts): every typed word must appear in one lower-cased string per
// product, and matches rank by where the query lands in the name. Health goals
// stand in for the backend's product tags.
type SearchEntry = { card: ApiProductCard; nameLower: string; text: string };

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

export class LocalProductRepository implements IProductRepository {
  async getBySlug(slug: string): Promise<ApiProductDetail | null> {
    await delay(300);
    const card = mockApiCards.find((p) => p.slug === slug);
    const p = mockProducts.find((p) => p.slug === slug);
    if (!card || !p) return null;

    return {
      id: card.id,
      name: card.name,
      slug: card.slug,
      form: card.form,
      shortDescription: `A premium homoeopathic ${card.form} for your health goals.`,
      description: `Detailed description for ${card.name} by ${card.brandName}. Formulated according to classical homoeopathic principles.`,
      composition: null,
      indications: "General indications...",
      directions: "Take 5 drops in water 3 times a day or as prescribed.",
      safetyInfo: "Keep out of reach of children. Consult a physician before use.",
      manufacturer: card.brandName,
      countryOfOrigin: "India",
      requiresPrescription: false,
      ratingAverage: card.rating,
      ratingCount: card.ratingCount,
      brand: { name: card.brandName || "Generic", slug: (card.brandName || "generic").toLowerCase(), logoUrl: null },
      images: card.imageUrl ? [{ url: card.imageUrl, altText: card.name, variantId: 1 }] : [],
      variants: [
        {
          id: card.id * 1000 + 1,
          sku: `${p.id}-VAR-1`,
          title: p.variant,
          packSize: null,
          potency: null,
          isDefault: true,
          mrp: card.mrp,
          price: card.price,
          discountPercent: card.discountPercent,
          inStock: true,
          stockLeft: 50,
          minQuantity: 1,
          maxQuantity: 10,
          wholesale: null,
        }
      ],
      reviews: [],
      seo: {
        // The backend's productSeo shape: the full title, site name included.
        title: `${card.name} - Buy Online | DocHomoeo`,
        description: `Buy ${card.name} online.`,
        path: `/product/${card.slug}`,
        image: card.imageUrl,
      },
      trail: [
        { name: "Home", slug: "" },
        { name: "Products", slug: "products" },
        { name: card.name, slug: card.slug }
      ],
      related: mockApiCards.filter((c) => c.id !== card.id).slice(0, 4),
      wholesale: false,
    };
  }

  async getRelated(productId: number): Promise<ApiProductDetail[]> {
    await delay(200);
    return []; // For now, handled within getBySlug
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
    // brand would give within the chosen category and form.
    type Group = "category" | "brand" | "form";
    const checks: [Group, (p: ApiProductCard) => boolean][] = [
      ["category", (p) => !filters.category || inCategory(productBySlug.get(p.slug), filters.category)],
      ["brand", (p) => !filters.brand?.length || matchesBrand(p.brandName, filters.brand)],
      ["form", (p) => !filters.form?.length || (p.form !== null && filters.form.includes(p.form))],
    ];
    const categoryCounts = new Map<string, number>();
    const brandCounts = new Map<string, number>();
    const formCounts = new Map<string, number>();
    const bump = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) ?? 0) + 1);

    const results: ApiProductCard[] = [];
    for (const p of mockApiCards) {
      // typed text and "in stock only" are not facet groups: they always apply
      if (!matchesQuery(p) || (filters.inStock && !p.inStock)) continue;
      const failed = checks.filter(([, passes]) => !passes(p)).map(([group]) => group);
      if (failed.length > 1) continue;
      const counts = (group: Group) => failed.length === 0 || failed[0] === group;
      const category = productBySlug.get(p.slug)?.category;
      if (counts("category") && category) bump(categoryCounts, category);
      if (counts("brand") && p.brandName) bump(brandCounts, p.brandName);
      if (counts("form") && p.form) bump(formCounts, p.form);
      if (failed.length === 0) results.push(p);
    }

    const facets = {
      categories: [...categoryCounts.entries()]
        .map(([name, count]) => ({
          id: catalogueCategories.indexOf(name) + 1,
          parentId: null,
          name,
          slug: slugify(name),
          count,
        }))
        .sort((a, b) => b.count - a.count),
      brands: [...brandCounts.entries()]
        .map(([name, count]) => ({ value: slugify(name), label: name, count }))
        .sort((a, b) => b.count - a.count),
      forms: [...formCounts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      potencies: [],
      packs: [],
      prices: [],
      priceRange: { min: 0, max: 2000 },
      discounts: [],
      ratings: [],
    };

    // Sorting
    const sort = SORT_ALIASES[filters.sort ?? ""] ?? filters.sort ?? "relevance";
    if (sort === "price-asc") results.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") results.sort((a, b) => b.price - a.price);
    else if (sort === "newest") results.sort((a, b) => b.id - a.id);
    else if (sort === "popular") results.sort((a, b) => b.sold - a.sold);
    else if (sort === "discount") results.sort((a, b) => b.discountPercent - a.discountPercent);
    else if (sort === "rating") results.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
    else if (sort === "name") results.sort((a, b) => a.name.localeCompare(b.name));
    // relevance: best match first when there is a query, catalogue order otherwise
    else if (words.length) results.sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));

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
      sort: filters.sort || "relevance",
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
 * Orders it accepts are previews: a "DEV-" reference, kept in memory for this
 * tab only, never charged and never sent anywhere.
 */
const MOCK_MAX_QUANTITY = 20; // backend: min(stock, maxOrderQuantity ?? 20)
const previewOrders = new Map<number, ApiOrderDetail>();
let previewSequence = 0;

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
      accountId: null,
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

    previewSequence += 1;
    const id = previewSequence;
    const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const orderNumber = `DEV-${stamp}-${String(id).padStart(4, "0")}`;
    const { address } = payload;
    previewOrders.set(id, {
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
      canCancel: false,
      canPay: false,
    });
    return { id, orderNumber, total: quote.grandTotal, paid: false, payUrl: null };
  }

  async getOrder(orderId: number): Promise<ApiOrderDetail | null> {
    await delay(250);
    return previewOrders.get(orderId) ?? null;
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
        description: card.excerpt,
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

import { IAuthRepository, IAccountRepository } from "./interfaces";
import { ApiAuthResponse, ApiUser } from "@/types/api/auth";
import { ApiAccountProfile, ApiAddress, ApiOrder, ApiOrderSummary } from "@/types/api/account";

export class LocalAuthRepository implements IAuthRepository {
  async requestOtp(phone: string): Promise<{ success: boolean; message?: string }> {
    await delay(600);
    return { success: true, message: "OTP sent successfully" };
  }

  async verifyOtp(phone: string, code: string): Promise<ApiAuthResponse> {
    await delay(800);
    if (code === "000000") {
      return { success: false, message: "Invalid OTP" };
    }
    const mockUser: ApiUser = {
      id: 1,
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone,
      roles: ["USER"],
    };
    return {
      success: true,
      session: {
        token: "mock-jwt-token",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        user: mockUser,
      }
    };
  }

  async logout(): Promise<void> {
    await delay(400);
  }

  async getCurrentUser(): Promise<ApiUser | null> {
    await delay(300);
    return null;
  }
}

const mockAddresses: ApiAddress[] = [
  {
    id: "addr_1",
    fullName: "Test User",
    phone: "9876543210",
    line1: "123 Health Ave",
    landmark: "Near Park",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    isDefault: true,
  }
];

const mockOrders: ApiOrder[] = [
  {
    id: "ord_1",
    orderNumber: "DH-1001",
    status: "DELIVERED",
    placedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    subtotal: 450,
    shipping: 50,
    tax: 0,
    grandTotal: 500,
    items: [
      { id: "item_1", productId: 1, productName: "Arnica Montana", variantId: 1, variantName: "30 CH", quantity: 2, price: 225 }
    ],
    shippingAddress: mockAddresses[0],
    paymentMethod: "UPI",
    paymentStatus: "PAID",
  }
];

export class LocalAccountRepository implements IAccountRepository {
  async getProfile(): Promise<ApiAccountProfile | null> {
    await delay(300);
    return {
      id: 1,
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone: "9876543210",
      gender: "MALE",
    };
  }
  
  async updateProfile(profile: Partial<ApiAccountProfile>): Promise<ApiAccountProfile> {
    await delay(500);
    return { id: 1, firstName: "Test", lastName: "User", email: "test@example.com", phone: "9876543210", ...profile };
  }
  
  async getAddresses(): Promise<ApiAddress[]> {
    await delay(400);
    return [...mockAddresses];
  }
  
  async addAddress(address: Omit<ApiAddress, 'id'>): Promise<ApiAddress> {
    await delay(500);
    const newAddr = { ...address, id: "addr_" + Date.now() };
    if (newAddr.isDefault) {
      mockAddresses.forEach(a => a.isDefault = false);
    }
    mockAddresses.push(newAddr as ApiAddress);
    return newAddr as ApiAddress;
  }
  
  async updateAddress(id: string, address: Partial<ApiAddress>): Promise<ApiAddress> {
    await delay(500);
    const idx = mockAddresses.findIndex(a => a.id === id);
    if (idx >= 0) {
      if (address.isDefault) {
        mockAddresses.forEach(a => a.isDefault = false);
      }
      mockAddresses[idx] = { ...mockAddresses[idx], ...address } as ApiAddress;
      return mockAddresses[idx];
    }
    throw new Error("Address not found");
  }
  
  async deleteAddress(id: string): Promise<void> {
    await delay(400);
    const idx = mockAddresses.findIndex(a => a.id === id);
    if (idx >= 0) {
      mockAddresses.splice(idx, 1);
    }
  }
  
  async setDefaultAddress(id: string): Promise<void> {
    await delay(300);
    mockAddresses.forEach(a => a.isDefault = a.id === id);
  }
  
  async getOrders(): Promise<ApiOrderSummary[]> {
    await delay(500);
    return mockOrders.map(o => ({
      id: Number(o.id.split('_')[1]),
      orderNumber: o.orderNumber,
      status: o.status,
      grandTotal: o.grandTotal,
      placedAt: o.placedAt,
      itemCount: o.items.length
    }));
  }
  
  async getOrderById(id: string): Promise<ApiOrder | null> {
    await delay(500);
    return mockOrders.find(o => o.id === id || o.orderNumber === id) || null;
  }
}

import { IServiceabilityRepository, IPrescriptionRepository } from "./interfaces";
import { ApiServiceabilityResult } from "@/types/api/serviceability";
import { ApiPrescription } from "@/types/api/prescription";

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

const mockPrescriptions: ApiPrescription[] = [
  {
    id: "rx_1",
    patientId: 1,
    fileName: "prescription_oct_2023.pdf",
    fileUrl: "/mocks/prescription.pdf",
    status: "VERIFIED",
    uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    notes: "For recurring hair fall treatment"
  }
];

export class LocalPrescriptionRepository implements IPrescriptionRepository {
  async getPrescriptions(): Promise<ApiPrescription[]> {
    await delay(400);
    return mockPrescriptions;
  }

  async getPrescriptionById(id: string): Promise<ApiPrescription | null> {
    await delay(200);
    return mockPrescriptions.find(p => p.id === id) || null;
  }
}
