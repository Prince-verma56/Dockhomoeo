# DocHomoeo Phase 2+3: Live Storefront, Cart, Checkout and Payment

**Date:** 2026-10-16 · **Branch:** `main` (uncommitted, not pushed) · **Base:** `2e055d4` + Phase 1 (uncommitted)
**Scope:** frontend only. The backend (`backend/`) was read and run, never edited.

## Summary

| Area | Result |
|---|---|
| Catalogue (home, listing, filters, search, product page) | **Live and verified** against the real backend |
| Cart and quote | **Live and verified**: every displayed total is the backend quote |
| Checkout (COD) | **Live and verified**: real orders created, shown in the account |
| Online payment | **Verified in the backend's test mode only.** The real PhonePe round trip was **not** run (by your instruction: production keys). |
| Payment return, retry | Implemented. The return route is verified; "pay again" can only be exercised with a gateway (see §7). |

---

## 1. Backend endpoints and contracts used

All of these were read from `backend/src/modules/*.routes.ts` and checked against live responses.

| Repository method | Endpoint | Notes |
|---|---|---|
| `home.getHomeData` | `GET /api/shop/home` | `{ banners, categories, brands (top 18), rails[{key,title,href,items}], wholesale }` |
| `search.search` | `GET /api/shop/products` | `q, category, brand,form,potency,pack (comma lists), minPrice, maxPrice, discount, rating, inStock=1, sort, page, pageSize ≤ 60`; disjunctive facets |
| `search.suggest` | `GET /api/shop/suggest?q=` | products, categories, brands (no ids, keyed by slug) |
| `product.getBySlug` | `GET /api/shop/products/:slug` | 404 → `notFound()` |
| `cart.getQuote` | `POST /api/shop/quote` | `{ lines[{variantId,quantity}], couponCode?, paymentMethod }` |
| `serviceability.checkPincode` | `GET /api/shop/pincode/:pin` | Unknown pincodes count as deliverable |
| `cart.checkout` | `POST /api/me/checkout` | `{ lines, couponCode?, paymentMethod, address, saveAddress, note?, expectedTotal }` → `{ id, orderNumber, total, paid, payUrl }` |
| `cart.getOrder` / `account.getOrderById` | `GET /api/me/orders/:id` | |
| `cart.payOrder` (**new**) | `POST /api/me/orders/:id/pay` | → `{ payUrl }`; gateway mode only |
| `account.getOrders` | `GET /api/me/orders` | Latest 50 |
| `account.getAddresses` | `GET /api/me/addresses` | Feeds the new checkout address picker |
| Payment return | `ALL /api/pay/return/:txn` (backend) → `${FRONTEND_URL}/patient/orders/:id?payment=…` | Now handled (§4.7) |

**Contract corrections made to the frontend types** (`types/api/*`):
- **Listing card (`ApiProductCard`):** the backend's `toCard` has **no `form` and no `sold`** field. It does have `variantCount` and `requiresPrescription`, so the type now matches.
- **Product detail:** added `allowCod` and `allowPrepaid`.
- **Quote:** added `codNote`, `onlineNote` and `paymentConflict`, plus each line's `allowCod`/`allowPrepaid`. Removed `accountId`, which the endpoint strips.
- **Order detail:** added `history`, `shipments`, `invoiceNumber`, `cancelReason` and `billing*`. `paymentMethod` now includes `BANK_TRANSFER`.

## 2. Files

**Created**
- `app/patient/orders/[id]/page.tsx`, `app/doctor/orders/[id]/page.tsx`: payment-return redirects into `/thankyou` (§4.7)

**Modified**

| Area | Files |
|---|---|
| Repositories and contracts | `lib/repositories/index.ts` (switch), `api.ts` (`ApiCartRepository` errors → `CheckoutError`, `payOrder`), `interfaces.ts`, `local.ts` (kept compiling against the corrected types; internal `MockCard`); `types/api/product.ts`, `types/api/cart.ts` |
| API client | `lib/api.ts`: Next's internal render signals are re-thrown (`unstable_rethrow`), §6 |
| Homepage | `app/page.tsx`, `sections/home/HealthGoals.tsx`, `BestsellingProducts.tsx`, `TrustedBrands.tsx`, `FeaturedCollection.tsx` |
| Product data and imagery | `lib/adapters/product.ts`, `components/commerce/ProductMedia.tsx`, `sections/product/ProductDetailView.tsx` |
| Cart | `lib/cart/cartStore.ts`, `lib/cart/flyToCart.ts`, `components/providers/CartProvider.tsx` |
| Checkout and confirmation | `sections/checkout/CheckoutView.tsx`, `sections/checkout/OrderConfirmationView.tsx`, `lib/checkout/orderConfirmation.ts`, `app/thankyou/page.tsx` |
| Development notices | `components/shared/DemoContentNotice.tsx` (scoped); notice removed from `app/brands/page.tsx`, `app/brands/[slug]/page.tsx`, `app/categories/page.tsx`, `app/product/[slug]/page.tsx`, `sections/cart/CartView.tsx`, `sections/favourites/FavouritesView.tsx`, `sections/search/SearchView.tsx`, `sections/shop/ShopView.tsx`; scope prop added in `app/insights/page.tsx`, `app/insights/[slug]/page.tsx` |

Phase 1 files are untouched by this phase, except `lib/api.ts` (see §6).

**Not modified:** anything under `backend/` (git shows no tracked change there), any database schema or migration, `backend/.env`, and `docohomo-prince/`. Its two pre-existing modifications are dated 8 and 14 October, before this work.

## 3. Architecture and data flow

```
Server components (/, /products, /search, /product/[slug], /brands, /categories)
   └─ repositories.{home,search,product} ── lib/api.ts (server: API_URL) ──► Express /api/shop/*
Client components (cart, drawer, checkout, confirmation, search box, account)
   └─ repositories.{cart,serviceability,account,auth} ── lib/api.ts (browser: same-origin /api rewrite, cookie) ──► /api/shop, /api/me
```

- **One switch:** `lib/repositories/index.ts` now wires `ApiHome/Product/Search/Cart/ServiceabilityRepository` and sets `usingMockData = false`. Insights alone stay local (`usingMockInsights = true`), because they are not part of this phase and the backend blog is empty.
- **No silent mock fallback.** If the shop can't be reached:
  - the homepage leaves its catalogue sections out;
  - listing and product pages show the existing error page;
  - the cart shows an error with "Retry";
  - the confirmation page shows "couldn't load your order, try again".
  - The local catalogue still exists for explicit offline work (swap the classes *and* the flag together).
- **API types vs view models:** wire types stay in `types/api/*`; `lib/adapters/product.ts` maps cards to `Product` for `ProductCard`.
- **Rendering:** every catalogue route is now `ƒ` (rendered per request, as the build output shows). The homepage declares it with `connection()`, and the others through their `no-store` fetches. So the build never needs the backend and never bakes a stale catalogue.

## 4. Features completed

### 4.1 Homepage
The design, hero video and section order are unchanged. Data now comes from one `GET /shop/home`:
- **Health Goals:** the live top-level categories, each linking to `/products?category=<slug>`. The existing botanical illustrations are reused where the slug matches (immunity, digestive, skin-care, …); otherwise the category image or initial is shown.
- **Bestsellers:**
  - The tabs are the backend's own rails ("Best sellers", "Trending now", "Picked for you", "Biggest savings", "Just added"), with their `href`s. Form tabs were dropped because live cards carry no dosage form.
  - The "Licensed manufacturers" line lists brands that actually exist.
- **Top brands:** the live brands, linking to `/brands/<slug>`. The hand-drawn logos are kept where a brand matches (SBL, Boiron, Reckeweg, Schwabe, Bakson…); others show their uploaded logo or a wordmark.
- **Featured collection:** already counted from live form facets; it now hides quietly if the shop is down.
- **Not shown when empty:** each section disappears instead of showing sample data.
- **Notice wording:** now names exactly what is still sample content (featured doctor, testimonials, articles, offers).

### 4.2 Shop, search and filters
- The existing URL-driven listing (`lib/search/searchState.ts` → backend query) now runs on live data.
- All supported filters, sort and pagination use the backend's facets and totals. Nothing is filtered in the browser.
- The mobile filter sheet, desktop sidebar, active-filter chips, clear-all and URL restore were all verified (§5).
- Search suggestions (header palette and `/search` combobox) were verified with keyboard selection to the product page.

### 4.3 Product page
- **Breadcrumb bug fixed.** The backend's `trail` is the category chain; the page used to link `/<categorySlug>`, which 404s. Breadcrumbs are now Products → category listings → product.
- **Payment rule:** the product's own restriction is shown ("can only be paid for online / on delivery").
- **Reviews:** approved reviews, which the API already returns, are now rendered.
- **Variants:** choosing a pack updates price, MRP, discount, stock and quantity limits, and adds the **exact variant id** (verified in the stored cart).
- **Imagery:** the local photo map (`data/productImagery.ts`, including its per-form fallback photos) is now used only in mock mode, so a live product never shows another product's photo (see §8 on those files).
- **Packshot form guess:** live cards have no form, so the illustrated packshot's shape is inferred from the pack and product name. This is used for drawing only (e.g. "Tablets" → tablet tube).

### 4.4 Cart
- **Quote is the authority.** The backend quote supplies every figure: subtotal, savings, delivery, COD charge, coupon and total. When it isn't current, figures are marked provisional.
- **Quote failures** now show the backend's actual reason, with Retry.
- **Obsolete carts:**
  - The storage key is versioned (`dochomoeo_cart_live_v1`), and the old `dochomo_cart` is deleted. A cart saved against the development catalogue (ids like 1001) can never be priced as a real product.
  - Unknown variant ids are dropped through the quote's `removed` list, with a notice.
- **Limits:** quantity limits come from the quote (verified: "+" stops at a pack's limit of 5).

### 4.5 Add-to-cart animation (`lib/cart/flyToCart.ts`)
The existing GSAP flight is kept: it tracks the live drawer position, cancels on rapid re-adds and honours reduced motion. Fixed:
- **Corner flash:** at the hand-off from lift to flight, `gsap.set(node, { x: 0, y: 0, scale: 1 })` rewrote the transform to `translate(0,0)`. That could flash the copy at the viewport's top-left for a frame, and it snapped the lift scale back to 1. Now the hand-off happens in place.
- **Shrink curve:** the shrink was piecewise-linear with kinks; it now follows a smooth curve, the lift scale eases out, and the flight uses a `power3.inOut` ease.
- **Order of events:** the cart still updates before any animation runs, so a skipped or failed flight never affects the cart.

### 4.6 Checkout
- **Saved addresses** (Phase 1) appear as a picker, with the default preselected. "Use a different address" restores the form. A saved address that fails validation opens prefilled for correcting, and a chosen saved address is not re-saved.
- **Payment rules from the backend:**
  - **Per-product notes:** `codNote`/`onlineNote` are shown.
  - **Conflicts:** `paymentConflict` blocks submit, with the backend's own words.
  - **Hidden methods:** COD is hidden for online-only items.
  - **Auto-select:** when only one method remains, it is selected automatically.
- **Errors come from the backend.** `ApiCartRepository` maps refusals to `CheckoutError` with the backend's message and status:
  - **409:** prices moved, so the page re-quotes;
  - **400:** shown verbatim;
  - **401:** "session ended, sign in again";
  - **501:** online payment not connected.
- **Existing safeguards:** `expectedTotal` is sent; a ref plus a disabled button prevent duplicate submission (verified: a double click creates exactly one order); and the cart is cleared only after the order exists.

### 4.7 Payment return, failure and retry
- **Return routes:** the backend returns shoppers to `/patient/orders/:id?payment=success|pending|failed` (`returnTo` in `shop.routes.ts`). Two thin server redirects forward this, and the doctor variant, to `/thankyou?order=<id>&payment=<outcome>`. Only the id and that one word travel.
- **The record decides:** `/thankyou` reads the **order record** (`paymentStatus`), not the URL word. "Payment failed" and "being confirmed" banners show only for an order that is really awaiting payment.
- **Pay again:** for an unpaid online order, the button calls `POST /api/me/orders/:id/pay`. That reopens payment for the **same** order and never creates a duplicate. It is shown only when the backend says `canPay`.

### 4.8 Orders in the account (the Phase 1 gap)
- **Resolved.** Checkout and the account read the same live orders. Orders placed at checkout appear in `/account/orders` and open at `/account/orders/:id` (verified).
- The account pages fetch on mount, so they never show a stale cached list.

## 5. Tests and results

**Environment:**
- **Backend:** `tsx src/server.ts` on `:4000` against the local dev database `dochomoeo_v2`. Process environment variables (no file edits) set:
  - `OTP_DEV_CODE`;
  - `PAYMENTS_TEST_MODE=true`;
  - empty `PHONEPE_MERCHANT_ID`/`PHONEPE_SALT_KEY`, `SHIPROCKET_EMAIL`/`SHIPROCKET_PASSWORD`/`SHIPROCKET_WEBHOOK_TOKEN` and `LEGACY_MONGODB_URI`.
- **Why the blanked keys:** `backend/.env` holds **production PhonePe and Shiprocket credentials**, and shipping mode defaults to `auto`. Without blanking them, any test order would have opened a real payment page and booked a real courier.
- **Proof nothing external was called:** the database afterwards holds 2 `TEST` payments, **no PhonePe payments, and 0 shipments**.
- **Frontend:** `next build` + `next start -p 3100`, `API_URL=http://localhost:4000`.
- **Browser:** Playwright 1.63 Chromium (from the npx cache; nothing installed in the project).

**Test catalogue:** by your choice, 8 clearly-labelled test products, 6 brands "… (test)" and 4 categories were created through the backend's **own admin API**: staff login with the seeded admin (credentials read from `.env`, never printed), `POST /api/admin/uploads|brands|categories|products`.
- **What they cover:** a two-pack product, an out-of-stock one, a low-stock one, an online-only one, a 5-per-order limit, and real discounts.
- **Photo correction:** the photos initially attached turned out to show *other* products (§8), so they were removed through `PATCH /api/admin/products/:id`. Only the one accurate photo was kept (Boiron Arnica tube).

| Check | Result |
|---|---|
| `tsc --noEmit` | **Pass**, 0 errors |
| ESLint on touched files | **Pass**, 0 errors (pre-existing `<img>` warnings only) |
| `next build` | **Pass**; catalogue routes `ƒ` |
| **Phase 2+3 browser suite** (live backend) | **67/67 pass** |
| Phase 1 browser suite (regression) | **55/55 pass** |
| Phase 1 API contract test (regression) | **44/44 pass** |
| Pack-form inference cases | 7/7 pass |

**The Phase 2+3 suite covered:**
- **Homepage:** health goals = live categories; tabs = live rails; brand rail = live brands; first card = rail's first product; a health goal opens its listing.
- **Listing and filters:**
  - every live product listed; form filter = backend; price-asc order = backend order;
  - filter and sort survive reload; chip removal updates the URL; Back restores it;
  - combined category + in-stock + price-range + sort URL = backend result.
- **Search:** suggestions → keyboard → product page; no-result state.
- **Product page:** category breadcrumb; pack change → price; stored line has the chosen **variant id and quantity**; flight clone removed; out-of-stock button disabled; unknown slug → 404.
- **Cart:**
  - total = backend quote; quantity stops at the backend limit, and that total still matches the quote;
  - remove works; the cart survives reload;
  - aborted quote → error and Retry, with no false total;
  - mock-era cart key removed; unknown variant dropped with a notice.
- **Checkout, signed out:** redirects to login and returns to checkout with the cart kept.
- **COD checkout:**
  - button amount = quote; confirmation shows the backend order number and total;
  - order CONFIRMED with payment PENDING; lines match;
  - **double click → exactly one order and one request**;
  - cart emptied; order in the account list and detail; address saved.
- **Second checkout:**
  - online-only rule on the product page; saved address preselected;
  - COD hidden; the backend note shown; online auto-selected;
  - **forced price drift → 409 message, no order created**;
  - then a test-mode online order → PAID and "Paid online".
- **Payment return:** `/patient/orders/:id?payment=failed` → `/thankyou?...`, with no false "failed" banner on a paid/COD order; a bad id → the account.
- **Layout:** no horizontal overflow on 7 routes at 390 px and 768 px; the mobile and tablet filter sheet opens; no uncaught page errors.

Screenshots were reviewed for the homepage sections, listing, product page (mobile), filter sheet (mobile), confirmation and account orders.

## 6. Bug found in the API client (from Phase 1), now fixed

- **The bug:** `lib/api.ts` turned *every* fetch exception into a network `ApiError`. During `next build`, a `no-store` fetch throws Next's internal "render per request" signal, and catching it made the build fail on `/brands`. In the homepage and `FeaturedCollection`, whose `.catch(() => null)` also swallowed it, it would have produced a **static homepage with no catalogue**.
- **The fix:** `api()` and those two catch sites now re-throw Next's internal errors (`unstable_rethrow`), and the homepage declares `connection()`.
- **Why it was hidden:** it never surfaced in Phase 1 because the catalogue still used local data then.

## 7. Missing configuration, provider requirements and backend blockers

1. **Real PhonePe flow: not verified.** Gateway mode is used whenever PhonePe keys are present. To verify:
   - **Keys:** sandbox or production keys with `PHONEPE_ENV` set.
   - **`FRONTEND_URL`:** must equal the public site origin, because the gateway returns to `${FRONTEND_URL}/api/pay/return/…`.
   - **`PUBLIC_API_URL`:** set it for server-to-server callbacks.
   - **Check:** an online order, a failed payment, and "Pay again".
2. **Production credentials in `backend/.env` on a development machine.** PhonePe (`PHONEPE_ENV=production`) and Shiprocket are live there, and shipping mode is `auto`. Anyone running the backend locally and placing an order will create real payment pages and real courier bookings. This is a **backend/ops decision**, not changed here.
3. **Listings lag edits by up to 60 s.** The backend catalogue index is cached for 60 s (`MAX_AGE_MS` in `catalog-index.ts`), so admin edits reach listings, home and search up to a minute later.
4. **Listing cards carry no dosage form** (`toCard`), so homepage tabs can't group by form, and placeholder packs are inferred from names. Adding `form` to `toCard` would make the cards exact.
5. **Doctor/patient return paths.** `/patient/consultations` (consultation fee payments) has no page yet; it belongs to the consultation phase. Payment return for orders is covered.
6. **Coupons:** the UI path exists and handles `couponError`. No coupons exist in the dev database, so a successful coupon was not exercised.
7. **Serviceability:** without Shiprocket (blanked for safety), every pincode counts as deliverable. The "not deliverable" and "no pay-on-delivery here" branches exist in the UI but were **not exercised live**.
8. **Wholesale (B2B) prices:** server-rendered pages fetch without the visitor's cookie, so an approved wholesale doctor sees retail prices on listings, while the quote and checkout use their real price. This is out of scope here; it needs cookie forwarding in server fetches.

## 8. Remaining mocks and where they are used

| What | Where | Status |
|---|---|---|
| Health Insights articles | `repositories.insight` = `LocalInsightRepository`; `/insights`, `/insights/[slug]`, homepage HealthInsights | Labelled "Draft articles" (own phase) |
| Featured doctor, consultation journey, testimonials, offer banner | `data/mock/home.ts` sections on `/` | Labelled on the homepage ("Sample content…") |
| Development catalogue | `LocalHome/Product/Search/Cart/ServiceabilityRepository` in `lib/repositories/local.ts` | **Not wired**; explicit offline use only |
| Local product photo map | `data/productImagery.ts` | Used only when `usingMockData` is true |

**Photo files are mislabelled.** `public/Images/Products/*.webp` contain only four distinct photos, and their names don't match their contents. For example, `reckeweg-r41.webp` is an "Eucalyptus Radiata" bottle, and `sbl-natrum.webp`, `sbl-calc-carb.webp` and `lords-kali-phos.webp` are all the same "Chamomilla 30C" bottle. Only `boiron-arnica.webp` shows its named product. They should not be attached to real products.

## 9. Unresolved items

- **Test data in the local dev database** `dochomoeo_v2`: 8 test products, 6 "(test)" brands, 4 categories, 4 test orders (2 COD, 2 test-mode online), and the Phase 1/2/3 test customers (26 customers in total). 8 photos are under `backend/uploads/products/`. **Nothing was deleted, as instructed.** They can be removed from the admin panel.
- **Not committed or pushed.** Phase 1 and Phase 2+3 are both uncommitted on `main`.
- **Not started:** the consultation phase, order cancel/returns/invoice UI, and the insights API.
