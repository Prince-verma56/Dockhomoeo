import { api } from "@/lib/api";
import { STORE_ZONE } from "@/lib/admin/care";
import type {
  AdminBlogCategory,
  AdminBlogInput,
  AdminBlogList,
  AdminBlogPost,
  AdminCoupon,
  AdminCouponInput,
  AdminCouponList,
  PostStatus,
} from "@/types/api/admin-content";

/**
 * Health Insights (the backend's blog) and coupons in the admin. Each call is
 * one existing endpoint: backend/src/modules/blog.routes.ts and
 * sales-settings.routes.ts.
 */

// ─── blog ─────────────────────────────────────────────────────────────────────

export const listPosts = (query: { q?: string; status?: PostStatus; categoryId?: number; page?: number }) =>
  api<AdminBlogList>("/admin/blog", { query });

export const getPost = (id: number) => api<AdminBlogPost>(`/admin/blog/${id}`);

export const createPost = (input: AdminBlogInput) => api<AdminBlogPost>("/admin/blog", { method: "POST", body: input });

export const updatePost = (id: number, input: Partial<AdminBlogInput>) =>
  api<AdminBlogPost>(`/admin/blog/${id}`, { method: "PATCH", body: input });

export const deletePost = (id: number) => api<{ ok: true }>(`/admin/blog/${id}`, { method: "DELETE" });

export const listBlogCategories = () => api<{ items: AdminBlogCategory[] }>("/admin/blog/categories");

export const createBlogCategory = (name: string) =>
  api<AdminBlogCategory>("/admin/blog/categories", { method: "POST", body: { name } });

export const renameBlogCategory = (id: number, name: string) =>
  api<AdminBlogCategory>(`/admin/blog/categories/${id}`, { method: "PATCH", body: { name } });

export const deleteBlogCategory = (id: number) => api<{ ok: true }>(`/admin/blog/categories/${id}`, { method: "DELETE" });

// ─── coupons ──────────────────────────────────────────────────────────────────

export const listCoupons = (query: { q?: string; status?: "ACTIVE" | "EXPIRED" | "OFF"; channel?: "D2C" | "B2B" | "BOTH"; page?: number }) =>
  api<AdminCouponList>("/admin/coupons", { query });

export const createCoupon = (input: Omit<AdminCouponInput, "tz">) =>
  api<AdminCoupon>("/admin/coupons", { method: "POST", body: { ...input, tz: STORE_ZONE } });

export const updateCoupon = (id: number, input: Partial<Omit<AdminCouponInput, "tz">>) =>
  api<AdminCoupon>(`/admin/coupons/${id}`, { method: "PATCH", body: { ...input, tz: STORE_ZONE } });

export const deleteCoupon = (id: number) => api<{ ok: true }>(`/admin/coupons/${id}`, { method: "DELETE" });

// ─── uploads ──────────────────────────────────────────────────────────────────

export type UploadFolder = "doctors" | "blog" | "documents" | "misc";

/**
 * POST /api/admin/uploads: one file, checked by its content on the backend
 * (JPG, PNG, WebP or GIF; PDF too in "documents"), at most 5 MB. Returns
 * the address the backend serves it from.
 */
export const uploadAdminFile = (file: File, folder: UploadFolder) => {
  const form = new FormData();
  form.append("folder", folder);
  form.append("file", file);
  return api<{ url: string }>("/admin/uploads", { method: "POST", body: form });
};
