/**
 * Where to send someone after they sign in. Only a path on this site is
 * accepted ("/checkout", "/account/orders?x=1"); anything that could leave the
 * site ("//evil.com", "https://…", "/\\evil.com") or loop back to a sign-in
 * page falls back to the account.
 */
export function safeCallbackUrl(raw: string | null | undefined, fallback = "/account"): string {
  if (!raw) return fallback;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(value)) return fallback;
  const path = value.split(/[?#]/)[0];
  if (path === "/login" || path === "/register" || path.startsWith("/admin")) return fallback;
  return value;
}

/** The sign-in page for a destination, optionally saying the last session ended. */
export function loginHref(callbackUrl: string, reason?: "expired"): string {
  const params = new URLSearchParams({ callbackUrl });
  if (reason) params.set("reason", reason);
  return `/login?${params.toString()}`;
}

/** The same normalisation checkout uses: "+91 98765 43210" → "9876543210". */
export { normalisePhone as normaliseMobile } from "@/lib/checkout/checkoutForm";

/** The backend's rule for a sign-in number (otp-auth.routes.ts). */
export const isMobile = (value: string) => /^[6-9]\d{9}$/.test(value);

/** The backend accepts a 4 to 6 digit code. */
export const isOtp = (value: string) => /^\d{4,6}$/.test(value);

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/** The backend's minimum (otp-auth.routes.ts `newPassword`). */
export const MIN_PASSWORD = 8;
