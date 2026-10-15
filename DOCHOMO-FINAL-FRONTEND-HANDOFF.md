# DocHomoeo — Final Frontend Handoff for Backend Integration

**Date:** 2026-10-15 · **Branch:** `integrate/backend-and-admin` (base `92e8a8f`) · **Next.js** 16.3.8 · **React** 19.2.8

**State at handoff:** every storefront repository is the local implementation (`usingMockData = true` in `lib/repositories/index.ts`). The storefront makes **zero** backend requests; this was verified in a headless browser across 25 routes × 5 widths and 24 scripted interactions. Ready-made API implementations exist for five repositories in `lib/repositories/api.ts`, but nothing is wired to them yet.

This file supersedes the earlier handoff notes in `project-docs/` and `brain/`, which are gitignored and local to one machine.

---

## 1. Project structure

| Path | Role | Touch during integration? |
|---|---|---|
| `app/`, `sections/`, `components/` | Storefront routes and UI | No. The UI talks only to repositories. |
| `lib/repositories/interfaces.ts` | **The contract.** One interface per domain. | Only to fix the contract gaps in §6. |
| `lib/repositories/local.ts` | Local implementations (mock data, deterministic). | Keep it as an offline/dev fallback. |
| `lib/repositories/api.ts` | API implementations: `ApiHomeRepository`, `ApiProductRepository`, `ApiSearchRepository`, `ApiCartRepository`, `ApiServiceabilityRepository`. | Extend it with the remaining domains. |
| `lib/repositories/index.ts` | DI container: the one place that picks Local or Api. | Swap point. |
| `lib/api.ts` | Typed `fetch` client (`ApiError`, credentials, `/api/*` rewrite, server-side origin). | Reuse it. |
| `lib/adapters/product.ts` | API card/detail → `Product` (the card UI model). | Only if the API shape changes. |
| `lib/search/searchState.ts` | URL ⇄ listing state ⇄ `ApiSearchFilters`, for `/products`, `/search` and brand pages. | Only to expose new filters (§5). |
| `types/api/*` | Wire types, mirroring `backend/src/modules/*.routes.ts`. | Keep them in step with the backend. |
| `data/mock/*` | Local data behind `local.ts`, and homepage section data (see §16, known gaps). | No. |
| `backend/` | Official Express 5 + Prisma 7 backend (imported in Phase 2). **Not modified by frontend phases.** | Backend work happens here. |
| `app/admin/*`, `components/admin/*`, `hooks/use-admin-session.ts` | Phase 2 staff panel. Already calls `/api/admin/*` and `/api/auth/*` live. | Outside the storefront contract. |
| `docohomo-prince/` | Legacy reference clone: **read-only**, gitignored, excluded from `tsconfig.json` and ESLint, never imported. | Never. |

## 2. Route map

| Route | Purpose | Data source | Auth |
|---|---|---|---|
| `/` | Homepage (locked design) | `data/mock/home` directly + static copy | – |
| `/products` | Catalogue listing, filters, sort, pagination | `search.search` (via `searchState`) | – |
| `/product/[slug]` | Product detail (PDP), related products | `product.getBySlug` → `notFound()` | – |
| `/search` | Search results / suggestions landing | `search.search`, `search.suggest` (header) | – |
| `/categories` | Health-goal and form browsing | `search.search` | – |
| `/brands`, `/brands/[slug]` | Brand directory, brand listing | `home.getHomeData`, `search.search` | – |
| `/insights`, `/insights/[slug]` | Blog listing and article | `insight.getInsights/getBySlug/getRelated` | – |
| `/cart` | Cart with live quote | `cart.getQuote` (via `CartProvider`) | – |
| `/checkout` | Address, pincode check, payment, place order | `serviceability.checkPincode`, `cart.checkout` | Signed in |
| `/thankyou?order=<id>` | Order confirmation (noindex) | `cart.getOrder` | Owner |
| `/checkout/success` | Permanent redirect → `/thankyou` | – | – |
| `/login` | OTP sign-in, `?callbackUrl=` | `auth.requestOtp/verifyOtp` | – |
| `/account`, `/account/orders`, `/account/orders/[id]`, `/account/addresses`, `/account/profile` | Customer area | `account.*` | Redirects to `/login?callbackUrl=…` |
| `/favourites` | Saved products (device-only) | `product.getBySlug` per saved slug | – |
| `/about`, `/quality`, `/contact` | Static trust pages | Static | – |
| any unknown URL / `notFound()` | Branded 404 (`app/not-found.tsx`) | – | – |

There are no `/category/[slug]` or `/brand/[slug]` routes. Category browsing is `/products?category=<slug>`; brands live at `/brands/[slug]`.

## 3. Repository map

`repositories` in `lib/repositories/index.ts`:

| Key | Interface | Local | API class today |
|---|---|---|---|
| `home` | `IHomeRepository.getHomeData()` | `LocalHomeRepository` | `ApiHomeRepository` ✅ |
| `product` | `IProductRepository.getBySlug(slug)`, `getRelated(id)` | `LocalProductRepository` | `ApiProductRepository` ✅ (`getRelated` returns `[]`; the PDP reads `detail.related`) |
| `search` | `ISearchRepository.search(filters)`, `suggest(q)` | `LocalSearchRepository` | `ApiSearchRepository` ✅ |
| `cart` | `ICartRepository.getQuote(lines, coupon?, payment?)`, `checkout(payload)`, `getOrder(id)` | `LocalCartRepository` | `ApiCartRepository` ✅ |
| `serviceability` | `IServiceabilityRepository.checkPincode(pin)` | `LocalServiceabilityRepository` | `ApiServiceabilityRepository` ✅ |
| `insight` | `IInsightRepository.getInsights(page?, size?, category?)`, `getBySlug`, `getRelated` | `LocalInsightRepository` | **to write** |
| `auth` | `IAuthRepository.requestOtp`, `verifyOtp`, `logout`, `getCurrentUser` | `LocalAuthRepository` | **to write** |
| `account` | `IAccountRepository` profile, addresses, orders | `LocalAccountRepository` | **to write** |
| `prescription` | `IPrescriptionRepository.getPrescriptions()` | `LocalPrescriptionRepository` | **to write** (no UI consumer yet) |

All of the UI imports `repositories` from `@/lib/repositories` and nothing else. No storefront component imports `lib/api.ts`, `lib/repositories/api.ts` or `docohomo-prince`.

## 4. Backend endpoint map

These are verified against `backend/src/app.ts` mount points and `backend/src/modules/*.routes.ts`. `/api/shop` is public with an optional session; `/api/me` requires a signed-in customer cookie.

| Repository method | Endpoint | Notes |
|---|---|---|
| `home.getHomeData` | `GET /api/shop/home` | `{ banners, categories, brands, rails }` |
| `search.search` | `GET /api/shop/products` | Query in §5 |
| `search.suggest` | `GET /api/shop/suggest?q=` | |
| `product.getBySlug` | `GET /api/shop/products/:slug` | 404 → `null` → `notFound()` |
| `insight.getInsights` | `GET /api/shop/blog?page&pageSize&category` | `pageSize` ≤ 50, `category` is a slug |
| `insight.getBySlug` | `GET /api/shop/blog/:slug` | `seo.path` comes back as `/blog/:slug`; rewrite it to `/insights/:slug` in the adapter |
| `insight.getRelated` | — | **No endpoint.** Derive it from `GET /api/shop/blog?category=<slug>`, excluding the current article. |
| `cart.getQuote` | `POST /api/shop/quote` | |
| `cart.checkout` | `POST /api/me/checkout` | 409 = prices moved (UI re-quotes) |
| `cart.getOrder` | `GET /api/me/orders/:id` | `ApiOrderDetail` |
| `serviceability.checkPincode` | `GET /api/shop/pincode/:pincode` | Unknown pincodes count as deliverable |
| `auth.requestOtp` | `POST /api/auth/otp/request` `{ phone }` | → `{ ok, testMode }`; staff numbers are refused |
| `auth.verifyOtp` | `POST /api/auth/otp/verify` `{ phone, code }` | Sets an **HTTP-only cookie**; → `{ user }` |
| `auth.getCurrentUser` | `GET /api/auth/session` | 401 when signed out |
| `auth.logout` | `POST /api/auth/user-logout` | |
| `account.getProfile` | `GET /api/auth/session` (user) or `GET /api/me/overview` | No dedicated `GET /me/profile` |
| `account.updateProfile` | `PATCH /api/me/profile` | Returns `{ ok: true }`, **not** the profile; re-read after saving |
| `account.getAddresses` | `GET /api/me/addresses` | Up to 10, default first |
| `account.addAddress` | `POST /api/me/addresses` | Body: `label?, fullName, phone, line1, landmark?, city, state, pincode, isDefault?` |
| `account.updateAddress` | `PATCH /api/me/addresses/:id` | |
| `account.setDefaultAddress` | `PATCH /api/me/addresses/:id` `{ isDefault: true }` | |
| `account.deleteAddress` | `DELETE /api/me/addresses/:id` | |
| `account.getOrders` | `GET /api/me/orders` | → `{ items: [...] }`, up to 50 |
| `account.getOrderById` | `GET /api/me/orders/:id` | Same endpoint as `cart.getOrder` (§6) |
| `prescription.getPrescriptions` | `GET /api/me/prescriptions` | Issued prescriptions only |
| (future) order from a prescription | `POST /api/me/prescriptions/:id/order` or checkout with `prescriptionId` | |
| (future) pay / cancel / invoice | `POST /api/me/orders/:id/pay`, `POST …/cancel`, `GET …/invoice` | No UI yet |

## 5. Request mapping

### Listing and search: one path for `/products`, `/search` and `/brands/[slug]`

```
URL (?q&category&brand&form&sort&page)
  → parseSearchState()        lib/search/searchState.ts
  → toSearchFilters()         → ApiSearchFilters (types/api/search.ts)
  → repositories.search.search()
  → ApiSearchRepository.toQuery()   → GET /api/shop/products?…
```

| Param | URL today | `ApiSearchFilters` | API query | Written by UI today |
|---|---|---|---|---|
| `q` | ✅ | `q` | `q` (≤ 80 chars) | header search, `/search` |
| `category` | ✅ | `category` | `category` (slug) | category links |
| `brand` | ✅ repeated key | `brand[]` | comma-joined | filter panels |
| `form` | ✅ repeated key | `form[]` | comma-joined | filter panels |
| `sort` | ✅ | `sort` | `relevance\|popular\|price-asc\|price-desc\|newest\|discount\|rating\|name` | sort control (legacy `price_asc` is still parsed) |
| `page` | ✅ | `page` | `page` | pagination |
| `pageSize` | fixed 24 | `pageSize` | `pageSize` | – |
| `potency`, `pack` | ❌ | `potency[]`, `pack[]` | comma-joined | – |
| `minPrice`, `maxPrice`, `discount`, `rating`, `inStock` | ❌ | typed | passed through (`inStock` → `"1"`) | – |

To expose a typed-only filter, add it to `SearchState`, `parseSearchState`, `toSearchFilters` and `listingHref` in `lib/search/searchState.ts`. Nothing else maps URL parameters. The facet groups to render are already returned in `ApiFacets` (`potencies`, `packs`, `prices`, `discounts`, `ratings`).

### Quote, `POST /api/shop/quote`

```ts
{ lines: { variantId: number; quantity: number }[]; couponCode?: string; paymentMethod?: "COD" | "ONLINE" | "CREDIT" }
```

The cart (`lib/cart/cartStore.ts`, localStorage `dochomo_cart`) persists only `variantId` and `quantity`, plus display hints. Every price, saving, shipping and COD charge, and the grand total, comes from the quote. The quote is debounced and only the latest answer is kept.

### Checkout, `POST /api/me/checkout` (`ApiCheckoutPayload`)

| Field | Sent today | Source |
|---|---|---|
| `lines` | ✅ | cart |
| `couponCode` | ✅ | applied quote coupon |
| `paymentMethod` | ✅ | payment step |
| `address` (`ApiCheckoutAddress`: fullName, phone, line1, landmark, city, state, pincode) | ✅ | form, validated with the backend's own rules |
| `saveAddress` | ✅ | checkbox |
| `note` | ✅ | optional, ≤ 500 chars |
| `expectedTotal` | ✅ | grand total shown to the customer |
| `prescriptionId` | ❌ typed only | no prescription picker exists (§12) |

### Auth, account and serviceability

These are listed in §4. Phone numbers are 10 digits (`^[6-9]\d{9}$`), OTPs 6 digits, pincodes 6 digits.

## 6. Response mapping

| Backend → wire type | Adapter | UI model → component |
|---|---|---|
| Product card → `ApiProductCard` | `mapApiCardToProduct` | `Product` → `ProductCard` (listing, search, brand, categories, PDP related) |
| Product detail → `ApiProductDetail` | none (rendered directly) | `ProductDetailView`; `mapProductDetailToProduct` for favourites |
| Listing → `ApiProductListingResponse` | `ResultCount`, facets → filter options | `ShopView`, `ProductResults` |
| Quote → `ApiQuote` | `lib/cart/cartView.ts` | `CartView`, `OrderSummary`, `CartDrawer` |
| Order → `ApiOrderDetail` | `toOrderConfirmation` | `OrderConfirmationView` |
| Blog → `ApiInsightCard/Detail` | none | `/insights` pages, `InsightCard` |
| Home → `ApiHomeResponse` | none | `/brands`, `/insights` sidebar. **Not yet the homepage** (§16) |

**Contract gaps the API repositories must absorb.** The UI should not change for these:

1. **Two order shapes for `GET /api/me/orders/:id`.** `cart.getOrder` returns `ApiOrderDetail` (matches the backend). `account.getOrderById(id: string)` returns the account mock's `ApiOrder` (string ids, nested address, `tax`). Either map `ApiOrderDetail` → `ApiOrder` in `ApiAccountRepository`, or, preferably, move `/account/orders/[id]` onto `ApiOrderDetail` and delete `ApiOrder`.
2. **Order list.** The backend returns `{ items: [{ id, orderNumber, status, paymentMethod, paymentStatus, grandTotal, placedAt, items[], shipments[] … }] }`. `ApiOrderSummary` needs `itemCount`, the sum of item quantities.
3. **IDs.** Account types use `string` ids (`ApiAddress.id`, `ApiOrder.id`); the backend uses numbers. Convert at the repository edge.
4. **`updateProfile`** must re-read the profile, because the backend answers `{ ok: true }`.
5. **Auth.** `ApiAuthResponse.session.token/expiresAt` exist only in the mock (§7).
6. **Blog SEO path** `/blog/:slug` → `/insights/:slug`.

## 7. Authentication

- **Today:** `LocalAuthRepository` accepts any 6-digit code except `000000`. `AuthProvider` keeps the returned session in localStorage (`dochomoeo_session`) through a `useSyncExternalStore` store. It reports `"loading"` on the server and during hydration, then the stored value, and stays in sync across tabs.
- **Backend:** the session is an HTTP-only cookie (`dh_user`) set by `POST /api/auth/otp/verify`. The browser never sees a token.
- **Integration:**
  1. Write `ApiAuthRepository`. `verifyOtp` returns success plus `user`, and `getCurrentUser` calls `GET /api/auth/session`.
  2. In `components/providers/AuthProvider.tsx`, replace `readSession()`, the localStorage read, with an async load from `repositories.auth.getCurrentUser()`. Then emit `authenticated` / `unauthenticated`.
  3. `login(session)` becomes `login(user)`.
  4. The context shape (`status`, `user`, `isAuthenticated`, `login`, `logout`, `updateUser`) stays, so `/account/*`, the header and checkout do not change.
- Browser calls go through the same-origin `/api/*` rewrite in `next.config.ts` with `credentials: "include"`. No CORS changes are needed.

## 8. Cart and quote

The work is already done on the frontend side: flip `cart` to `ApiCartRepository`. The UI handles these quote fields:

- `lines[].problem`: blocks checkout with the line's message
- `removed`: lines dropped from the cart, with a notice
- `couponError`
- `codAvailable` / `codCharge`
- `freeDeliveryFrom`
- `onlinePayment` / `onlineTest`
- `savings` / `mrpTotal`

Check before going live: the local mock refuses every coupon (by design), so test the real coupon path against `/api/shop/quote`.

## 9. Checkout

Flip `cart` to the API (`checkout` and `getOrder` are already implemented).

- **COD:** the response has `payUrl: null`, and the page goes to `/thankyou?order=<id>`.
- **Online:** `payUrl` is set, and the browser goes to the gateway (`window.location.assign`). `/api/pay/callback` handles the return.
- **409:** prices changed. The cart re-quotes and the customer confirms again.
- **400:** the message is shown verbatim (`CheckoutError`).
- **Before going live, decide where the PhonePe return lands.** The confirmation page reads `GET /api/me/orders/:id` and shows `canPay` / `paymentStatus`.

## 10. Orders

Add `ApiAccountRepository.getOrders` and `getOrderById` (§4, gaps 1–3 in §6).

Not yet in the UI:

- cancel (`POST /api/me/orders/:id/cancel`)
- pay again (`…/pay`)
- invoice download (`…/invoice`)
- shipment tracking (`shipments[]` in the list response)

## 11. Serviceability

`/checkout` checks a complete 6-digit pincode through `repositories.serviceability.checkPincode` and shows the result:

- deliverable / not deliverable
- COD availability (which also restricts the payment choice)
- `deliveryDays`, only when the shop returns it

Nothing is invented: when the check fails, the page says the shop will confirm when the order is placed.

The PDP has only a placeholder comment for a pincode checker. If one is wanted, use the same repository method. Flip `serviceability` to `ApiServiceabilityRepository`.

## 12. Prescription

- **Contract:** `IPrescriptionRepository.getPrescriptions()` → `GET /api/me/prescriptions`. `ApiCheckoutPayload.prescriptionId?: number`.
- **UI:** none. No page lists prescriptions and checkout never sends `prescriptionId`.
- **Uploads:** no upload behaviour exists or has been invented. The backend's patients receive prescriptions issued by doctors, not uploads.
- **To build later:**
  - a prescription picker in checkout that sets `prescriptionId`, or
  - a "buy this prescription" action via `POST /api/me/prescriptions/:id/order`.

  Gate the picker on `ApiProductDetail.requiresPrescription`, which the PDP does not display yet.

## 13. Insights (blog)

Write `ApiInsightRepository` (§4). The UI already consumes:

- `slug`, `title`, `excerpt`, `content`
- `category { name, slug }`
- `coverImageUrl`, `authorName`, `publishedAt`
- `seo`
- related articles

`/insights?category=` uses the category slug.

**Security:** `content` is rendered with `dangerouslySetInnerHTML` (`app/insights/[slug]/page.tsx`). It must be sanitised before it reaches the browser (§14).

## 14. Error handling

| State | Behaviour today |
|---|---|
| Loading | `app/search/loading.tsx`; client pages show inline loaders; listings dim with `aria-busy` during transitions |
| Empty | Listings: "No products found" with clear filters / view all. Cart: empty state. Account: "No orders yet". |
| Error | `app/error.tsx` (root) and `app/search/error.tsx`. Repositories throw; pages do not turn errors into empty results. Quote failures show "couldn't check prices" and retry. |
| Not found | `notFound()` for unknown product, insight and brand slugs → `app/not-found.tsx`. Unknown URLs → the same page. |
| Unauthorised | `/account/*` → `/login?callbackUrl=…`. Checkout asks the customer to sign in before the form is enabled. |
| Checkout refusal | `CheckoutError(message, status)`: 400 message shown, 409 re-quote |

Deterministic mock triggers for exercising these states locally:

- search query `__mock_error__`
- checkout note `__mock_error__`
- pincode `000000` (not deliverable)
- OTP `000000` (rejected)

**Must fix with the API — rich-text sanitisation.** The PDP (`description`, `composition`, `indications`, `directions`, `safetyInfo`) and the blog `content` are injected as raw HTML. The backend has no sanitiser on these fields; there is only a one-off `db:clean-html` script. Sanitise either on save in the backend or at render time (e.g. `sanitize-html`/DOMPurify) before switching `product` and `insight` to the API.

## 15. Environment variables

The storefront needs **none** today. When integrating:

| Variable | Where | Value |
|---|---|---|
| `API_URL` | Next server (rewrites + server-side `fetch` in `lib/api.ts`) | `http://localhost:4000` in dev; the backend's internal URL in production |
| `NEXT_PUBLIC_SITE_URL` | canonical / Open Graph URLs (`lib/site.ts`) | the public site origin |

`.env.local` also defines `NEXT_PUBLIC_API_URL`, but no code reads it. `NEXT_PUBLIC_DEV_LOGIN_EMAIL` is only for admin login pre-fill. **Never put a password in a `NEXT_PUBLIC_*` variable**, because those are compiled into the browser bundle. Backend variables (`DATABASE_URL`, `JWT_SECRET`, `OTP_DEV_CODE`, `PAYMENTS_TEST_MODE`, …) belong to `backend/.env` only.

## 16. Backend developer checklist

**Recommended order.** Do one domain at a time, and run the app against the API after each step.

1. **API base configuration.** Set `API_URL`, start the backend with the database seeded with the catalogue (the current seed has no catalogue records), and confirm `GET /api/health`.
2. **API client.** Reuse `lib/api.ts`. It already handles credentials, JSON, `ApiError(status)` and the server-side origin.
3. **API repositories.** Extend `lib/repositories/api.ts`: write `ApiInsightRepository`, `ApiAuthRepository`, `ApiAccountRepository` and `ApiPrescriptionRepository` against the interfaces, using the §4 endpoints and the §6 gaps.
4. **Replace `LocalHomeRepository`.** Flip `home`. The homepage sections still read `data/mock/home` directly (the homepage was design-locked). A ready patch that feeds HealthGoals, BestsellingProducts and TrustedBrands from `getHomeData()` is saved at `project-docs/patches/phase6-live-catalogue-activation.patch`. That folder is local and gitignored, so ask for the file. The patch also changes the brand copy, so get design sign-off first. Mark catalogue pages `export const dynamic = "force-dynamic"` (or use revalidation) once data is live.
5. **Replace product and search.** Flip `product` and `search`. Do this only after rich-text sanitisation (§14). Check facet counts, the `sort` keys and the `notFound` behaviour.
6. **Replace insights.** Flip `insight` and rewrite `seo.path` to `/insights/:slug`.
7. **Replace serviceability.** Flip `serviceability`.
8. **Replace auth.** Flip `auth` and convert `AuthProvider` to cookie sessions (§7).
9. **Replace account, orders and addresses.** Flip `account` and resolve the §6 gaps.
10. **Replace quote and checkout.** Flip `cart`, then test COD, the online `payUrl` round trip, 409 re-quotes and coupons.
11. **Validate production behaviour.** Set `usingMockData = false`, and remove `DemoContentNotice` (`components/shared/`) together with the mock-only labels it covers. Then:
    - run `npm run build`
    - repeat the route and interaction checks in §17
    - confirm the storefront sends no `localStorage` session
    - confirm 401s redirect correctly

## 17. Final QA matrix (local, 2026-10-15)

The routes were checked in headless Chrome at 1440, 1024, 768, 390 and 375px:

- no horizontal overflow
- no broken images
- no backend requests
- the only third-party host is `images.unsplash.com`, for the hero avatars

| Feature | Route | Repository | Local tested | Future endpoint | Auth | Status |
|---|---|---|---|---|---|---|
| Hero video (2×) + reveal | `/` | – | ✅ first and returning visit | – | – | Done |
| Listing, filter, sort, pagination | `/products` | search | ✅ brand filter → 7, price-asc ordered, page 2, legacy sort alias | `GET /shop/products` | – | Ready |
| Search + suggestions | `/search`, header | search | ✅ suggestions → `/search?q=arnica` | `GET /shop/products`, `/shop/suggest` | – | Ready |
| Product detail + related add-to-cart | `/product/[slug]` | product | ✅ incl. 404 | `GET /shop/products/:slug` | – | Ready, sanitise first |
| Categories / brands | `/categories`, `/brands(/[slug])` | home, search | ✅ | `/shop/home`, `/shop/products` | – | Ready |
| Insights | `/insights(/[slug])` | insight | ✅ card → article, 404 | `/shop/blog(/:slug)` | – | API repo to write |
| Add to cart, quantity, quote | cards, `/cart` | cart | ✅ qty 2 re-priced ₹110 → ₹220 | `POST /shop/quote` | – | Ready |
| Checkout (COD) | `/checkout` → `/thankyou` | cart, serviceability | ✅ order placed → confirmation | `POST /me/checkout`, `/shop/pincode/:pin` | ✅ | Ready (online flow untested) |
| OTP login + callback | `/login` | auth | ✅ → `/checkout`, → `/account/addresses` | `/auth/otp/*`, `/auth/session` | – | API repo to write |
| Logout | `/account` | auth | ✅ session cleared → `/login` | `POST /auth/user-logout` | ✅ | API repo to write |
| Orders list / detail | `/account/orders(/[id])` | account | ✅ | `GET /me/orders(/:id)` | ✅ | §6 gaps 1–3 |
| Addresses | `/account/addresses` | account | ✅ delete via row menu | `/me/addresses` | ✅ | API repo to write |
| Profile | `/account/profile` | account | ✅ edit + save | `PATCH /me/profile` | ✅ | §6 gap 4 |
| Favourites | `/favourites` | product | ✅ page renders | none (device-only) | – | No backend contract |
| Prescriptions | – | prescription | n/a (no UI) | `GET /me/prescriptions` | ✅ | Contract only |
| Unknown URL / slug | any | – | ✅ branded 404 | – | – | Done |

**Build and static checks:**

- `npm run build` passes: 33 routes; `/`, `/categories` and `/brands` are static.
- `tsc --noEmit` has 0 errors.
- ESLint has 0 storefront errors. 12 errors remain in the Phase 2 admin module (`app/admin/*`, `hooks/use-admin-session.ts`: `set-state-in-effect`, `no-explicit-any`). They were left untouched because the admin panel needs the live backend to verify.

### Known limitations

- **Homepage data:** the homepage still reads `data/mock/home` directly (§16 step 4), but since Phase 16 its bestseller cards are a slug selection from the catalogue, so ids, brands and prices match the shop, product page and cart quote.
- **Product photography:** since Phase 16, products get a photograph only through `data/productImagery.ts`, and only when the photo shows that same remedy and form; every other product renders the illustrated pack (`ProductPackshot`). Real per-product images will come from the API (`imageUrl`). See DOCHOMO-PHASE16-UI-UX-REFINEMENT.md §2.
- **Duplicate assets:** removed in Phase 16 (byte-identical product photos, `journal_*.jpg`, unused `Videos/HeroVideo.mp4`); `journal_*.webp` re-encoded as real WebP.
- **PDP fields:** since Phase 16 the product page shows `manufacturer`, `countryOfOrigin`, `requiresPrescription`, potency, pack size and the image gallery when supplied; `reviews[]` is still not displayed.
- **Dev-only console message:** on `notFound()` routes Next re-renders the root layout on the client, and React warns about the inline motion-gate `<script>` in `app/layout.tsx`. This does not occur in production. The script must stay inline to run before first paint.
