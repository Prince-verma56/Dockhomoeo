import { FORM_LABELS } from "@/lib/search/searchState";

export type NavLink = { label: string; href: string };

/** Top-level destinations shared by the desktop header and the mobile drawer. */
export const primaryNav = [
  { label: "Shop", href: "/products" },
  { label: "Brands", href: "/brands" },
  { label: "Categories", href: "/categories" },
  { label: "Health Insights", href: "/insights" },
] as const satisfies readonly NavLink[];

const formLink = (form: string): NavLink => ({ label: FORM_LABELS[form], href: `/products?form=${form}` });

/**
 * The Shop menu. Destinations use the catalogue's own listing parameters
 * (backend `GET /api/shop/products`): `form` is a dosage form and `category`
 * a category slug — health goals are top-level categories.
 */
export const shopMenu = {
  byForm: ["drops", "tablets", "tincture", "cream"].map(formLink),
  byGoal: [
    { label: "Immunity", href: "/products?category=immunity" },
    { label: "Skin Care", href: "/products?category=skin-care" },
    { label: "Digestive", href: "/products?category=digestive" },
    { label: "Sleep & Stress", href: "/products?category=sleep-stress" },
  ],
  more: [
    { label: "Shop all products", href: "/products" },
    { label: "All categories", href: "/categories" },
  ],
} satisfies Record<string, NavLink[]>;

/** Which primary destination the current path belongs to. */
export function isActivePath(pathname: string, href: string) {
  if (href === "/products") return pathname === "/products" || pathname.startsWith("/product/");
  return pathname === href || pathname.startsWith(`${href}/`);
}
