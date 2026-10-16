/**
 * Health Insights, from the shop's blog (GET /api/shop/blog, /api/shop/blog/:slug;
 * backend/src/modules/shop.routes.ts). Only PUBLISHED posts are returned.
 */
export interface ApiInsightCategory {
  name: string;
  slug: string;
}

export interface ApiInsightCard {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  authorName: string | null;
  /** ISO date. Null until the article has a real publication date. */
  publishedAt: string | null;
  category: ApiInsightCategory | null;
}

export interface ApiInsightDetail extends ApiInsightCard {
  /** HTML from the admin editor; rendered only through SafeRichText. Empty when the post has none. */
  content: string;
  authorBio: string | null;
  authorImageUrl: string | null;
  updatedAt: string | null;
  /** From the backend's `seo` block (it does not send seoTitle/seoDescription themselves). */
  seoTitle: string | null;
  seoDescription: string | null;
  /** `path` is this site's address for the article (/insights/:slug). */
  seo: {
    title: string;
    description: string;
    path: string;
    image: string | null;
  };
}

export interface ApiInsightListingResponse {
  items: ApiInsightCard[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** The backend caps the blog listing at 50 per page (shop.routes.ts). */
export const MAX_INSIGHT_PAGE_SIZE = 50;
