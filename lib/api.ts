import { unstable_rethrow } from "next/navigation";

/**
 * Central typed API client for DocHomeo.
 * Calls backend endpoints through Next.js rewrites at /api/* (see next.config.ts).
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /**
   * The backend answers bad input with `{ message: "Invalid input", details: ZodIssue[] }`.
   * This maps each issue to its top-level field, first message wins.
   */
  get fieldErrors(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!Array.isArray(this.details)) return errors;
    for (const issue of this.details as { path?: unknown[]; message?: string }[]) {
      const field = issue?.path?.[0];
      if (typeof field === "string" && issue.message && !errors[field]) errors[field] = issue.message;
    }
    return errors;
  }
}

/**
 * Fired on `window` when a request that needs the customer's session comes
 * back 401: the cookie has expired or was cleared. AuthProvider listens and
 * signs the page out.
 */
export const SESSION_EXPIRED_EVENT = "dochomoeo:session-expired";

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

const toQueryString = (query?: QueryParams): string => {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const text = params.toString();
  return text ? `?${text}` : "";
};

/** A customer-facing sentence for a refusal the backend did not word itself. */
function fallbackMessage(status: number): string {
  if (status === 429) return "Too many attempts. Please wait a few minutes and try again.";
  if (status === 401) return "Please sign in to continue.";
  if (status === 403) return "You do not have access to this.";
  if (status === 404) return "We could not find that.";
  if (status >= 500) return "Something went wrong on our side. Please try again in a moment.";
  return `Request failed with status ${status}`;
}

/**
 * One sentence to show for a failed request: the backend's own words, or the
 * first field problem when it answered with a generic "Invalid input".
 */
export function describeError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!(error instanceof ApiError)) return fallback;
  if (error.status === 400 && error.message === "Invalid input") {
    return Object.values(error.fieldErrors)[0] ?? "Some details are not valid. Check them and try again.";
  }
  return error.message || fallback;
}

export async function api<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    query?: QueryParams;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const relativeUrl = path.startsWith("/api")
    ? `${path}${toQueryString(options.query)}`
    : `/api${path}${toQueryString(options.query)}`;

  // Browsers keep using the Next.js same-origin rewrite, so sessions and the
  // public API share one origin. Server Components run in Node, where fetch
  // cannot resolve a relative URL; their equivalent request uses the very
  // same backend origin configured by that rewrite.
  const url =
    typeof window === "undefined"
      ? new URL(relativeUrl, process.env.API_URL ?? "http://localhost:4000").toString()
      : relativeUrl;

  // A FormData body (a file upload) is sent as multipart; the browser sets its boundary.
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.body && !isForm ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: isForm ? (options.body as FormData) : options.body ? JSON.stringify(options.body) : undefined,
      credentials: "include", // Ensures session cookies (dh_session, dh_user, dh_doctor) are sent
      cache: "no-store",
    });
  } catch (error) {
    // Next.js signals "render this route per request" (and similar) by
    // throwing from fetch; those must reach Next, not become a network error.
    unstable_rethrow(error);
    // Otherwise fetch only rejects when no answer came back at all (offline, server down).
    throw new ApiError(0, "We could not reach DocHomoeo. Check your connection and try again.");
  }

  const here = typeof window === "undefined" ? "" : window.location.pathname;

  // If unauthorized while on admin panel (and not already on login page), redirect to staff login
  if (response.status === 401 && here.startsWith("/admin") && !here.startsWith("/admin/login")) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  }

  // The customer's own data lives under /api/me; a 401 there means the session ended.
  if (response.status === 401 && typeof window !== "undefined" && /^\/api\/me(\/|$|\?)/.test(relativeUrl)) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      typeof data?.message === "string" ? data.message : fallbackMessage(response.status),
      data?.details,
    );
  }

  return data as T;
}
