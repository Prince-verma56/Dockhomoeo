/**
 * The admin's content and sales contracts, in the backend's exact shapes:
 * - blog: backend/src/modules/blog.routes.ts (shown on the site as Health Insights);
 * - coupons: backend/src/modules/sales-settings.routes.ts.
 */
import type { AdminPage } from "@/types/admin";

// ─── blog ─────────────────────────────────────────────────────────────────────

export type PostStatus = "DRAFT" | "PUBLISHED";

export interface AdminBlogCategory {
  id: number;
  name: string;
  slug: string;
  postCount: number;
}

export interface AdminBlogListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  authorName: string | null;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
  category: { id: number; name: string } | null;
}

export interface AdminBlogList extends AdminPage<AdminBlogListItem> {
  statusCounts: Partial<Record<PostStatus, number>>;
}

/** GET/POST/PATCH answer (postOut): the post with its calendar day of publication. */
export interface AdminBlogPost extends Omit<AdminBlogListItem, "category"> {
  categoryId: number | null;
  category: { id: number; name: string } | null;
  content: string | null;
  authorBio: string | null;
  authorImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  /** YYYY-MM-DD in the store's timezone, or null for an undated draft. */
  publishedOn: string | null;
}

/** The body of POST/PATCH /api/admin/blog (postInput). Empty strings are read as "not set". */
export interface AdminBlogInput {
  title: string;
  slug: string | null;
  categoryId: number | null;
  excerpt: string | null;
  content: string | null;
  coverImageUrl: string | null;
  authorName: string | null;
  authorBio: string | null;
  authorImageUrl: string | null;
  status: PostStatus;
  publishedOn: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

// ─── coupons ──────────────────────────────────────────────────────────────────

export type CouponType = "PERCENT" | "FLAT" | "FREE_SHIPPING";
/** Worked out by the backend from the dates, the switch and the uses (couponStatus). */
export type CouponStatus = "ACTIVE" | "SCHEDULED" | "USED_UP" | "EXPIRED" | "OFF";
export type CouponChannel = "D2C" | "B2B" | null;

export interface AdminCoupon {
  id: number;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  maxDiscount: number | null;
  minOrderValue: number | null;
  /** null = both retail and trade. */
  channel: CouponChannel;
  usageLimit: number | null;
  perUserLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  status: CouponStatus;
}

export interface AdminCouponList extends AdminPage<AdminCoupon> {
  /** The three tabs the list filter supports. */
  statusCounts: { ACTIVE: number; EXPIRED: number; OFF: number };
}

/** The body of POST/PATCH /api/admin/coupons (couponInput). Dates are calendar days in `tz`. */
export interface AdminCouponInput {
  code: string;
  description: string | null;
  type: CouponType;
  value?: number;
  maxDiscount: number | null;
  minOrderValue: number | null;
  channel: CouponChannel;
  usageLimit: number | null;
  perUserLimit: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  tz: string;
}
