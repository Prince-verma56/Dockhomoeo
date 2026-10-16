import type { AdminArea, SessionStaffUser } from "@/types/admin";

/**
 * Mirrors `allows` in backend/src/lib/permissions.ts: "manage" includes
 * "view". `/api/auth/me` already expands the role into this list, so the
 * check is a lookup. The backend re-checks every request; this only decides
 * which links and buttons the panel offers.
 */
export function canAccess(user: SessionStaffUser | null, area: AdminArea, level: "view" | "manage"): boolean {
  if (!user) return false;
  const permissions = user.permissions ?? [];
  return permissions.includes(`${area}.manage`) || (level === "view" && permissions.includes(`${area}.view`));
}
