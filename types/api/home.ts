import { ApiProductCard } from "./product";

export interface ApiBanner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  platform: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
}

export interface ApiBrand {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  isActive: boolean;
  productCount: number;
}

export interface ApiRail {
  key: string;
  title: string;
  href: string;
  items: ApiProductCard[];
}

export interface ApiHomeResponse {
  banners: ApiBanner[];
  categories: ApiCategory[];
  brands: ApiBrand[];
  rails: ApiRail[];
  wholesale: boolean;
}
