# DOCHOMO ROUTE AUDIT & PAGE IMPLEMENTATION PLAN

## 1. Current Frontend Routes

The following routes are currently implemented and working within the `docohomo/` root project:
- `/` (Home)
- `/products` (Shop / Product Listing)
- `/product/[slug]` (Product Detail Page)
- `/search` (Search Results)
- `/cart` (Shopping Cart)
- `/checkout` (Checkout Flow)
- `/checkout/success` (Order Confirmation)

## 2. Navigation Map

### SiteHeader
| Link | Destination | Exists | Status | Notes |
|---|---|---|---|---|
| Shop | `/products` | Yes | 🟢 Working | Primary product listing |
| Brands | `/brands` | No | 🔴 404 | Missing, needs visual grid or redirect |
| Categories | `/categories` | No | 🔴 404 | Missing, needs visual grid or redirect |
| Health Insights | `/insights` | No | 🔴 404 | Missing, backend refers to this as "Blog" |
| Drops & Dilutions | `/products?form=drops` | Yes | 🟢 Working | Powered by filters |
| Immunity | `/products?goal=immunity` | Yes | 🟢 Working | Powered by filters |
| Favourites | `/user/favourites` | No | 🔴 404 | Missing, optional feature |
| Login / Register | `/login` | No | 🔴 404 | Missing authentication flow |

### SiteFooter
| Link | Destination | Exists | Status | Notes |
|---|---|---|---|---|
| All Products | `/products` | Yes | 🟢 Working | |
| Brands | `/brands` | No | 🔴 404 | |
| Categories | `/categories` | No | 🔴 404 | |
| Our Story | `/about` | No | 🔴 404 | Missing static page |
| Quality Standards | `/quality` | No | 🔴 404 | Missing static page |
| Contact Us | `/contact` | No | 🔴 404 | Missing static page |
| Track Order | `/account/orders` | No | 🔴 404 | Missing account section |

## 3. Reference Backend Route/Domain Map

An audit of `docohomo-prince/angaar-labs/backend/` reveals the following real domain capabilities:
- **Shop (`shop.routes.ts`)**:
  - `GET /home` (Categories, brands, banners, rails)
  - `GET /products` (Handles ALL product listing, category filtering, and brand filtering. Returns facets.)
  - `GET /products/:slug` (Product Details, variants, related items)
  - `GET /blog` & `/blog/:slug` (Articles, clearly maps to "Health Insights")
  - `GET /pincode/:pincode` (Serviceability)
  - `POST /quote` (Cart pricing)
- **Shop Me (`shop.routes.ts`)**:
  - `POST /checkout` (Order creation)
  - `GET /orders/:id` (Order tracking & payment)
- **Account (`patient-panel.routes.ts`)**:
  - `GET /overview` (Dashboard with upcoming appts, prescriptions, orders)
  - `POST /addresses` (Address book)
- **Auth (`otp-auth.routes.ts`)**:
  - OTP & Password based authentication for patients.

## 4. Route Reconciliation

| Frontend Route | Backend/Domain Concept | Current State | Correct Route? | Action |
|---|---|---|---|---|
| `/` | `/home` | Existing + correct | Yes | Retain |
| `/products` | `/products` | Existing + correct | Yes | Retain |
| `/categories` | `/products?category=x` | Missing | Needs refinement | Implement as a visual hub, link to `/products?category=[slug]` |
| `/category/[slug]`| N/A | Should not exist | No | Backend handles categories via `/products` filters |
| `/brands` | `/products?brand=x` | Missing | Needs refinement | Implement as a visual hub, link to `/products?brand=[slug]` |
| `/brand/[slug]` | N/A | Should not exist | No | Backend handles brands via `/products` filters |
| `/insights` | `/blog` | Missing but required | Needs refinement| Rename internal data binding to map to Blog, keep URL as `/insights` |
| `/insights/[slug]`| `/blog/:slug` | Missing but required | Yes | The detail page for an insight |
| `/login` | `otp-auth` | Missing but required | Yes | Needs Auth flow |
| `/account/orders` | `patient-panel` | Missing but required | Yes | Needs Account dashboard |

## 5. Category Architecture

**Recommendation**: Do NOT build `/category/[slug]`. 
The backend explicitly handles category navigation through the `/products` endpoint using query filters (`?category=slug`).
- **Route**: `/categories` (Visual directory page)
  - **Purpose**: A visually engaging page showing all available categories (e.g. Drops, Mother Tinctures, Specialties).
  - **Data**: Driven by the categories returned in the `/home` API or `/products` facets.
  - **Interaction**: Clicking a category redirects the user to `/products?category=slug`, utilizing the existing `ShopView` to handle listing, pagination, and secondary filtering.

## 6. Brand Architecture

**Recommendation**: Do NOT build `/brand/[slug]`.
Like categories, the backend filters brands via the `/products` endpoint (`?brand=slug`).
- **Route**: `/brands` (Visual directory page)
  - **Purpose**: An A-Z or grid layout of partner brands and manufacturers.
  - **Data**: Driven by the brands returned in the `/home` API or `/products` facets.
  - **Interaction**: Clicking a brand redirects the user to `/products?brand=slug`.

## 7. Insights Architecture

The backend supports this feature under the `blog` domain (`/blog` and `/blog/:slug`).
- **Frontend Route**: `/insights` (Listing) and `/insights/[slug]` (Detail).
- **Purpose**: Content marketing, health tips, and SEO articles.
- **Data**: `ShopRepository.getInsights()` mapping to the backend `/blog` response.
- **UI Structure**:
  - Hero (Featured Insight)
  - Category Filter (e.g., Immunity, Digestion)
  - Masonry/Grid of Insight Cards
  - Pagination

## 8. Account/Order Architecture (Future)

- **Routes**: `/account`, `/account/orders`, `/account/orders/[id]`, `/account/addresses`, `/account/prescriptions`
- **Data Required**: Secured calls to `patient-panel.routes.ts` and `shop.routes.ts` (Me).
- **Implementation Priority**: P1. This requires the Auth layer to be finalized first.

## 9. Cart/Checkout Architecture

- **Current**: Fully scaffolded as `/cart`, `/checkout`, `/checkout/success`.
- **Future**: Validated against `quote` and `checkout` backend endpoints. The current architecture perfectly mirrors the required payloads (lines, address, coupon, etc.). Retain as-is until backend wiring phase.

## 10. Shared Components & Component Reuse

The following primitives are already built and should be leveraged heavily:
- **`Section` & `Container`**: For standardized page padding and backgrounds (Ivory/White).
- **`ProductCard`**: Reuse across category/brand hubs if featuring specific products.
- **`SiteHeader` / `SiteFooter`**: Global shell.
- **Typography**: `font-display`, `.dh-eyebrow`, `text-ink` for headings.
- **shadcn/ui**: 
  - `Tabs` (For switching between A-Z brand letters)
  - `Accordion` (For mobile category trees/filters)
  - `Button` (Standardized actions)
  - `Skeleton` (For loading states of missing pages)

## 11. Page Design System

Missing pages should follow the established "Natural & Premium" aesthetic:
- **Backgrounds**: Use Ivory (`bg-[#FAFAF7]`) as the default canvas, reserving scenic `.webp` backgrounds for rich hero headers.
- **Layouts**: Avoid generic "text left, image right" layouts. Use staggered grids, parallax reveals (like `FeaturedCollection`), and organic floating shapes for category/brand cards.
- **Typography**: Keep the large `text-[3.25rem] text-[#061c12]` for page headers.

## 12. Page-by-Page Implementation Order

1. **P0: `/categories` and `/brands` Hub Pages**
   - High visibility in the main header.
   - Requires no new API complexities (can use mock facets).
   - Solidifies the discovery journey leading into the existing `/products` page.
2. **P0: `/insights` and `/insights/[slug]`**
   - Completes the primary top-navigation links.
   - Validates the `blog` backend contract.
3. **P1: Static Pages (`/about`, `/quality`, `/contact`)**
   - Fills out the footer to make the site feel complete and trustworthy.
4. **P2: Auth & Account (`/login`, `/account/*`)**
   - Complex state management; should follow after the public-facing discovery phase is finalized.

## 13. Backend Handoff Notes

When wiring the frontend to the backend:
- `ShopRepository` will need to translate `/api/shop/blog` responses to `Insight` domain models.
- The `Category` and `Brand` hubs can fetch their lists by requesting `/api/shop/products?pageSize=1` and plucking the `facets.categories` and `facets.brands` objects from the response to guarantee an accurate count of active products.
