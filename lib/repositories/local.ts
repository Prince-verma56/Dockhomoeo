import {
  IHomeRepository,
  IProductRepository,
  ISearchRepository,
  ICartRepository,
  IInsightRepository,
} from "./interfaces";
import { mockProducts } from "@/data/mock/products";
import { ApiHomeResponse } from "@/types/api/home";
import { ApiProductDetail, ApiProductCard } from "@/types/api/product";
import { ApiProductListingResponse, ApiSearchFilters, ApiSuggestResponse } from "@/types/api/search";
import { ApiQuote, ApiQuoteLineInput, ApiCheckoutPayload, ApiCheckoutResponse } from "@/types/api/cart";
import { ApiInsightDetail, ApiInsightListingResponse, ApiInsightCard } from "@/types/api/insight";
import { Product } from "@/types/product";
import { articles, healthGoals, brands as mockBrands } from "@/data/mock/home";

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
});

const mockApiCards = mockProducts.map(mapToApiProductCard);

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
      categories: healthGoals.map((goal, i) => ({
        id: i + 1,
        name: goal.name,
        slug: goal.id,
        imageUrl: goal.image,
        productCount: Math.floor(Math.random() * 50) + 10,
      })),
      brands: mockBrands.map((brand, i) => ({
        id: i + 1,
        name: brand.name,
        slug: brand.name.toLowerCase().replace(/ /g, '-'),
        logoUrl: null,
        description: `${brand.name} is a trusted homoeopathic brand.`,
        isActive: true,
        productCount: Math.floor(Math.random() * 30) + 5,
      })),
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
        title: card.name,
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
    
    let results = [...mockApiCards];
    
    if (filters.q) {
      const q = filters.q.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q) || (p.brandName?.toLowerCase().includes(q)));
    }
    
    if (filters.inStock) {
      results = results.filter((p) => p.inStock);
    }
    
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
      category: null,
      facets: {
        categories: [],
        brands: [],
        forms: [],
        potencies: [],
        packs: [],
        prices: [],
        priceRange: { min: 0, max: 2000 },
        discounts: [],
        ratings: [],
      },
      wholesale: false,
    };
  }

  async suggest(query: string): Promise<ApiSuggestResponse> {
    await delay(200);
    const q = query.toLowerCase();
    const products = mockApiCards
      .filter((p) => p.name.toLowerCase().includes(q))
      .map(p => ({
        name: p.name,
        slug: p.slug,
        brandName: p.brandName,
        imageUrl: p.imageUrl,
        price: p.price,
      }));
      
    return {
      products,
      categories: [],
      brands: [],
    };
  }
}

export class LocalCartRepository implements ICartRepository {
  async getQuote(lines: ApiQuoteLineInput[], couponCode?: string): Promise<ApiQuote> {
    await delay(300);
    const quoteLines = lines.map((l) => {
      const productId = Math.floor(l.variantId / 1000);
      const card = mockApiCards.find(c => c.id === productId);
      const p = mockProducts.find(prod => prod.slug === card?.slug);
      
      const productName = card?.name || "Mock Product";
      const slug = card?.slug || "mock";
      const variantTitle = p?.variant || "Mock";
      const sku = p ? `${p.id}-VAR-1` : "MOCK";
      const brandName = card?.brandName || "DocHomoeo";
      const imageUrl = card?.imageUrl || null;
      const mrp = card?.mrp || 100;
      const price = card?.price || 90;

      return {
        variantId: l.variantId,
        productId: productId || 0,
        productName,
        slug,
        variantTitle,
        sku,
        brandName,
        imageUrl,
        gstPercent: 12,
        quantity: l.quantity,
        mrp,
        retailPrice: price,
        unitPrice: price,
        lineTotal: price * l.quantity,
        priceNote: null,
        minQuantity: 1,
        maxQuantity: 10,
        problem: null,
      };
    });
    
    const subtotal = quoteLines.reduce((sum, l) => sum + l.lineTotal, 0);

    return {
      channel: "D2C",
      accountId: null,
      lines: quoteLines,
      removed: [],
      itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
      mrpTotal: quoteLines.reduce((sum, l) => sum + l.mrp * l.quantity, 0),
      subtotal,
      savings: 0,
      coupon: null,
      couponError: null,
      shippingCharge: subtotal > 500 ? 0 : 50,
      freeDeliveryFrom: 500,
      codAvailable: true,
      codCharge: 50,
      grandTotal: subtotal + (subtotal > 500 ? 0 : 50),
      wholesale: null,
      onlinePayment: true,
      onlineTest: true,
    };
  }

  async checkout(payload: ApiCheckoutPayload): Promise<ApiCheckoutResponse> {
    await delay(1000);
    return {
      id: Math.floor(Math.random() * 10000),
      orderNumber: `ORD-${Math.floor(Math.random() * 100000)}`,
      total: 0,
      paid: false,
      payUrl: null,
    };
  }
}

const mapToApiInsightCard = (article: any): ApiInsightCard => ({
  id: parseInt(article.id.replace('a-', '')),
  title: article.title,
  slug: article.href.replace('/learn/', '').replace('/insights/', ''),
  excerpt: `Learn more about ${article.title.toLowerCase()} and how to improve your health.`,
  coverImageUrl: article.image || null,
  authorName: "Dr. Jane Doe",
  publishedAt: new Date().toISOString(),
  category: { name: article.category, slug: article.category.toLowerCase() },
});

export class LocalInsightRepository implements IInsightRepository {
  async getInsights(page = 1, pageSize = 12, category?: string): Promise<ApiInsightListingResponse> {
    await delay(300);
    
    let filtered = articles;
    if (category) {
      filtered = filtered.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }
    
    const items = filtered.map(mapToApiInsightCard);
    
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
      page,
      pageSize,
      pageCount: Math.ceil(items.length / pageSize),
    };
  }
  
  async getBySlug(slug: string): Promise<ApiInsightDetail | null> {
    await delay(300);
    
    // Support both /learn/slug and /insights/slug styles in the mock data
    const article = articles.find(a => a.href.endsWith(`/${slug}`));
    
    if (!article) return null;
    
    const card = mapToApiInsightCard(article);
    
    return {
      ...card,
      content: `
        <h2>Understanding ${article.title}</h2>
        <p>This is a detailed article about ${article.title.toLowerCase()}. Homoeopathy provides a natural, holistic approach to maintaining wellness and treating ailments.</p>
        <p>According to classical principles, treatments are individualized. This means two people with similar symptoms might receive different remedies based on their overall constitution.</p>
        <h3>Key Benefits</h3>
        <ul>
          <li>Natural ingredients derived from plants and minerals</li>
          <li>Gentle action suitable for all ages</li>
          <li>Focuses on the root cause rather than just suppressing symptoms</li>
        </ul>
        <p>Always consult with a qualified homoeopathic practitioner before starting any new regimen.</p>
      `,
      authorBio: "Dr. Jane Doe is a senior homoeopathic consultant with 15 years of experience.",
      authorImageUrl: null,
      updatedAt: card.publishedAt,
      seoTitle: article.title,
      seoDescription: card.excerpt,
      seo: {
        title: article.title,
        description: card.excerpt,
        path: `/insights/${slug}`,
        image: card.coverImageUrl,
      }
    };
  }
  
  async getRelated(slug: string): Promise<ApiInsightListingResponse> {
    await delay(200);
    const related = articles.filter(a => !a.href.endsWith(`/${slug}`)).slice(0, 3);
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

