/**
 * The public origin, for canonical URLs, Open Graph and structured data.
 *
 * Set NEXT_PUBLIC_SITE_URL in every deployment. On Vercel the production
 * domain is used when it is missing; the localhost fallback exists only so
 * development builds resolve and must never reach production.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_NAME = "DocHomoeo";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
