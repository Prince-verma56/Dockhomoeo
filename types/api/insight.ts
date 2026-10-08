export interface ApiInsightCategory {
  name: string;
  slug: string;
}

export interface ApiInsightCard {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  authorName: string | null;
  publishedAt: string; // ISO date string
  category: ApiInsightCategory | null;
}

export interface ApiInsightDetail extends ApiInsightCard {
  content: string; // HTML or Markdown content
  authorBio: string | null;
  authorImageUrl: string | null;
  updatedAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
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
