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
}

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

  const headers: Record<string, string> = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include", // Ensures session cookies (dh_session, dh_user, dh_doctor) are sent
    cache: "no-store",
  });

  const here = typeof window === "undefined" ? "" : window.location.pathname;

  // If unauthorized while on admin panel (and not already on login page), redirect to staff login
  if (response.status === 401 && here.startsWith("/admin") && !here.startsWith("/admin/login")) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message ?? `Request failed with status ${response.status}`,
      data?.details,
    );
  }

  return data as T;
}
