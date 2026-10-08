import {
  IHomeRepository,
  IProductRepository,
  ISearchRepository,
  ICartRepository,
} from "./interfaces";
import { mockProducts } from "@/data/mock/products";
import { ApiHomeResponse } from "@/types/api/home";
import { ApiProductDetail, ApiProductCard } from "@/types/api/product";
import { ApiProductListingResponse, ApiSearchFilters, ApiSuggestResponse } from "@/types/api/search";
import { ApiQuote, ApiQuoteLineInput, ApiCheckoutPayload, ApiCheckoutResponse } from "@/types/api/cart";
import { Product } from "@/types/product";

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
      categories: [
        { id: 1, name: "First Aid", slug: "first-aid", imageUrl: null, productCount: 4 },
        { id: 2, name: "Digestion", slug: "digestion", imageUrl: null, productCount: 6 },
        { id: 3, name: "Wellness", slug: "wellness", imageUrl: null, productCount: 12 },
      ],
      brands: [
        { id: 1, name: "SBL", slug: "sbl", logoUrl: null, description: null, isActive: true, productCount: 10 },
        { id: 2, name: "Dr. Reckeweg", slug: "reckeweg", logoUrl: null, description: null, isActive: true, productCount: 8 },
        { id: 3, name: "Schwabe", slug: "schwabe", logoUrl: null, description: null, isActive: true, productCount: 5 },
      ],
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
