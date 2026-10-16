# DocHomoeo: Backend vs Frontend Completeness Audit

**Audit date:** 2026-10-15 · **Branch:** `main` (clean tree at start; HEAD `2e055d4`) · **Mode:** read-only code inspection

**Method and limits.** Everything below comes from reading source (`backend/src/**`, `backend/prisma/schema.prisma`, `app/**`, `sections/**`, `components/**`, `lib/**`, `types/**`, `hooks/**`, `data/**`) and the existing docs. I made no API requests and ran no builds, tests, migrations or installs. `.env.local` was read with values redacted; `backend/.env` was not opened (only `backend/.env.example`). **Nothing here is a runtime verification.** "Complete" means the code path exists and its types match the backend source, not that it was exercised.

Existing docs (`brain/31_*`, `DOCHOMO-FINAL-FRONTEND-HANDOFF.md`) were treated as claims to check, not as evidence. Where they are stale, §8 says so.

---

## 1. Executive summary

**The frontend is a finished, design-complete shop front running entirely on local mocks, plus a thin read-only admin viewer. It has no consultation, doctor, or patient-health UI at all.**

| Area | Actual state |
|---|---|
| Catalogue, product detail, search, cart, checkout, order confirmation | UI complete. **Mock-backed** (`usingMockData = true`). Ready Api* classes exist for 5 repositories and match the backend wire contract (§5.1). Never exercised against the live backend. |
| Customer login, session, account, orders, addresses, profile | UI exists. **Mock-backed.** No Api repository written. The mock auth contract (`token`, `roles[]`, `localStorage` session) does not match the backend (HTTP-only cookie, `role`). |
| Insights (blog) | UI exists. Mock-backed, no Api repository. One **certain contract break**: the listing page asks for `pageSize=100`; the backend caps at 50 (§5.3). |
| Static pages (About, Quality, Contact) | About and Quality complete. **Contact form sends nothing**, and the backend has **no public endpoint** to receive it. |
| Doctors, consultations, booking, appointments, prescriptions, patient dashboard | **Backend is rich and complete-looking. Frontend: nothing.** No route, no repository, no type beyond an unused `Doctor` display type. Homepage doctor links (`/doctors`, `/book/d-001`) go to 404. |
| Payments | Backend PhonePe integration present. Its return URLs point at `/patient/orders/:id`, `/patient/consultations` and `/doctor/orders/:id`, **none of which exist in this frontend**. A real online payment would land on a 404. |
| Admin panel | 9 read-only list pages + login, against ~35 backend admin routers. **No mutations.** Several pages read fields the backend does not return (staff list is always empty; product price/brand blank). Errors are swallowed into empty/zero states. |

**What the client should hear:** the storefront looks done because it was built against mocks. Roughly one third of the backend's customer-facing surface (consultation, patient panel, returns, invoices, prescriptions, payment return) has no frontend, and the rest has never run against the real API.

**Highest-priority gaps**
1. **P0** Auth/session: no `ApiAuthRepository`; `AuthProvider` is localStorage-based; blocks every signed-in feature.
2. **P0** Payment return routes do not exist (`/patient/orders/:id` etc.), and the frontend ignores `?payment=` entirely.
3. **P0** Four missing Api repositories (insight, auth, account, prescription) and the `index.ts` swap.
4. **P1** Entire doctor and consultation journey is missing (§6).
5. **P1** Contract mismatches in account/order/auth types (§5.2) and the insights `pageSize=100` break.
6. **P2** Return requests, invoice download, order cancel/pay-again have no UI.
7. **P2** Contact form is fake and has no backend target.

---

## 2. Verified project structure and active backend

| Path | Verified role | Evidence |
|---|---|---|
| `D:\Angaar Labs\Dochomeo\dochomoeo` | **Active frontend** (Next.js app router, `next@16.x`, React 19) | `package.json`, `app/`, `next.config.ts` |
| `backend/` | **Active, current backend.** Express 5 + Prisma 7 + PostgreSQL, cookie-JWT auth, zod validation. Package `dochomoeo-backend`. 19 migrations (2026-10-05 to 2026-10-12). | `backend/package.json`, `backend/src/app.ts`, `backend/prisma/migrations/*` |
| `docohomo-prince/` | **Not the backend.** Legacy reference clone (`CODEING-BROS/docohomo-prince`): Express 4 + Mongoose + MongoDB API, Next 9 website, CRA dashboard. Gitignored, not imported. Untouched. | `docohomo-prince/README.md`, `.gitignore:50` |
| `docohomo-prince/angaar-labs/` | Nested reference mirror. Untouched. | directory listing |
| `brain/`, `project-docs/` | Local planning docs, gitignored. Partly stale (§8). | `.gitignore:5,53` |
| `next.config.ts` | `/api/*` and `/uploads/*` rewrite to `API_URL` (default `http://localhost:4000`). Same-origin cookies, no CORS needed from the browser. | `next.config.ts` |

**Not present:** any test files (no `*.test.*`, `*.spec.*`, Playwright/Vitest/Jest config) in frontend or backend. No `middleware.ts`/`proxy.ts`. No `sitemap.ts`/`robots.ts` in `app/`.

**Auth model (backend, verified in `backend/src/middleware/auth.ts`).** Three independent cookies: `dh_session` (staff), `dh_user` (patient area), `dh_doctor` (doctor area). Which one a request uses is chosen by the header `x-panel: doctor` (or `?panel=doctor`); anything else is the patient area. The patient frontend must therefore never send `x-panel: doctor`, and a future doctor area must send it on every call, including login.

---

## 3. Backend capability inventory

Source: `backend/src/app.ts` (mounts) and `backend/src/modules/*.routes.ts`. Auth column: **Pub** = no session; **Opt** = optional session (wholesale prices); **Pat** = `requireSignedIn` (CUSTOMER or DOCTOR cookie of the requesting panel); **Doc** = `requireDoctor`; **Staff** = staff cookie + per-area permission (`lib/permissions.ts`).

### 3.1 Public shop (`/api/shop`, `shop.routes.ts`)

| Endpoint | Auth | Request | Response (shape) | Status |
|---|---|---|---|---|
| `GET /home` | Opt | none | `{ banners, categories (top-level with products, max productCount), brands (top 18 by productCount), rails[{key,title,href,items[card]}], wholesale }` | Complete |
| `GET /products` | Opt | `q(≤80) category(slug) brand,form,potency,pack (comma lists) minPrice maxPrice discount rating inStock(1/true) sort(relevance\|popular\|price-asc\|price-desc\|newest\|discount\|rating\|name) page pageSize(1..60, default 24)` | `{ items, total, page, pageSize, pageCount, sort, category{name,slug,trail}\|null, facets{categories,brands,forms,potencies,packs,prices,priceRange,discounts,ratings}, wholesale }`. Facets are "disjunctive" (counts per group ignore that group's own filter). | Complete |
| `GET /suggest?q=` | Pub | q ≥ 2 chars | `{ products[6], categories[4], brands[4] }` | Complete |
| `GET /products/:slug` | Opt | slug | product + `variants[]`, `images[]`, `reviews[≤20 approved]`, `trail`, `related[≤10]`, `seo{title,description,path:"/products/:slug",image}`, `wholesale`. 404 if inactive or no active variant. | Complete |
| `GET /blog` | Pub | `page, pageSize(1..50), category(slug)` | `{ items[{id,title,slug,excerpt,coverImageUrl,authorName,publishedAt,category}], total, page, pageSize, pageCount }` | Complete |
| `GET /blog/:slug` | Pub | slug | card fields + `content, authorBio, authorImageUrl, updatedAt, seo{…path:"/blog/:slug"}` | Complete |
| `GET /sitemap` | Pub | none | `{ products, categories, brands, blog }` with paths `/products/:slug`, `/products?category=`, `/products?brand=`, `/blog/:slug` | Complete (paths differ from the frontend routes, §8) |
| `POST /quote` | Opt | `{ lines[{variantId,quantity}] (≤100), couponCode?, paymentMethod: COD\|ONLINE\|CREDIT (default COD) }` | priced lines (with `problem`, min/max qty), `removed[]`, `coupon`, `couponError`, `shippingCharge`, `freeDeliveryFrom`, `codAvailable`, `codCharge`, `codNote/onlineNote/paymentConflict`, `grandTotal`, `wholesale`, `onlinePayment`, `onlineTest` | Complete. Server recomputes every price. |
| `GET /pincode/:pincode` | Pub | 6 digits | `{ pincode, deliverable, codAvailable, deliveryDays, city, state }`. Unknown pincodes count as deliverable; Shiprocket lookup only if configured. | Complete (needs Shiprocket for live data) |

### 3.2 Signed-in shop (`/api/me`, `shop.routes.ts`, `patient-panel.routes.ts`, `care.routes.ts`, `returns.routes.ts`)

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /checkout` | Pat | `{ lines[≥1], couponCode?, paymentMethod, address{fullName,phone,line1,landmark?,city,state,pincode}, saveAddress=true, note?, expectedTotal?, prescriptionId? }` → `201 { id, orderNumber, total, paid, payUrl }`. 409 on price drift or stock race; 400 for coupon, COD/online conflicts, unserviceable pincode, credit limit; **501 when online payment is "off"**. Stock is decremented in a transaction. |
| `GET /orders` | Pat | `?channel=D2C\|B2B` → `{ items[{id,orderNumber,status,paymentMethod,paymentStatus,grandTotal,placedAt,channel,estimatedDelivery,prescription,items[],shipments[≤1]}] }`, last 50. **Defined in `care.routes.ts`, not `shop.routes.ts`.** |
| `GET /orders/:id` | Pat | full order + `history[]`, `shipments[]`, `canCancel`, `canPay`, `invoiceNumber`. |
| `POST /orders/:id/pay` | Pat | → `{ payUrl }` (gateway mode only). |
| `POST /orders/:id/cancel` | Pat | `{ reason? }`; allowed until courier pickup. |
| `GET /orders/:id/invoice` | Pat | PDF (inline) once an invoice number exists. |
| `GET /orders/:id/returns`, `POST /orders/:id/returns`, `POST /return-photo` | Pat | return eligibility, reasons, existing returns with pickup tracking; create with `{items, reason, description, photoUrls≤4}`; photo upload ≤ 5 MB (multipart). |
| `GET /addresses`, `DELETE /addresses/:id` | Pat | `shop.routes.ts`; list ≤ 10, default first. |
| `POST /addresses`, `PATCH /addresses/:id` | Pat | `patient-panel.routes.ts`; `{label?, fullName, phone, line1, landmark?, city, state, pincode, isDefault?}`; max 10; first becomes default. Returns `{id}` / `{ok}`. |
| `GET /overview` | Pat | patient dashboard: `upcoming[3]`, `counts`, `toDo[]`, `prescriptions[3]`, `orders[3]`. |
| `PATCH /profile` | Pat | `{ firstName (required), lastName?, email?, gender?, dateOfBirth? }` → `{ ok }`. No `GET /profile`. |

### 3.3 Authentication (`/api/auth`)

| Endpoint | Auth | Behaviour |
|---|---|---|
| `POST /otp/request` | Pub (rate-limited 8/15 min) | `{ phone (^[6-9]\d{9}$), email?, mustExist=false }` → `{ ok, testMode }`. Staff numbers refused. Refuses delivery (503/502) if SMS/email are not configured and `OTP_DEV_CODE` is unset. |
| `POST /otp/verify` | Pub (30/15 min) | `{ phone, code (4-6 digits) }` → sets cookie, `{ user }`. **Creates a CUSTOMER account for an unknown number** (so phone-only sign-in doubles as sign-up). |
| `POST /signup` | Pub | `{ phone, email, code }` → `201 { user }`. Rejects a number already attached to a doctor. |
| `POST /password-login` | Pub (20/15 min) | `{ identifier (phone or email), password }` → `{ user }`. |
| `POST /password` | Pat | set/change password (≥ 8 chars). |
| `GET /session` | Pat | `{ user: { id, role, phone, email, firstName, lastName, gender, dateOfBirth, name, hasPassword, doctor{id,verificationStatus,consulting}\|null, wholesale } }`; 401 if signed out. |
| `POST /user-logout` | Pub | clears the cookie of the requesting panel. |
| `POST /login`, `POST /logout`, `GET /me` | staff | staff login (`{email,password}`), used by the admin UI. |

### 3.4 Consultations, patient side (`/api/care` public; `/api/me` signed in)

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /care/streams` | Pub | open consulting streams + their specializations. |
| `GET /care/symptoms` | Pub | `{ symptoms[], specializations[{id,name,description,isGeneral,symptomCount}] }` |
| `POST /care/suggest-specialization` | Pub | `{ symptoms[], problem }` → suggestion. |
| `GET /care/doctors` | Pub | **only** `?q=` (matches name, specialization, language). No specialty/city/fee filter, no sort, no pagination. Only APPROVED + accepting + listed + has availability. Card: `id, slug, displayName, photoUrl, qualification, specialization, experienceYears, languages[], bio, clinicCity, videoFee, audioFee, slotMinutes, ratingAverage, ratingCount`. |
| `GET /care/doctors/:slug` | Pub | card + weekly `availability[{dayOfWeek,startTime,endTime}]`. |
| `GET /care/doctors/:slug/slots?date=YYYY-MM-DD` | Pub | `{ date, slots[{startsAt, available, reason}] }` |
| `GET /care/doctors/:slug/next-slot?after=` | Pub | `{ slot }` |
| `POST /me/match`, `POST /me/match/:id/opened` | Pat | guided doctor matching (2-3 suggestions) and click tracking. |
| `POST /me/appointments` | Pat | `{ doctorId, startsAt (ISO), mode: VIDEO\|AUDIO, patientName, patientAge, patientGender, symptoms (≥5 chars), intake?, fileIds[], matchSessionId? }` → `201 { id, appointmentNumber, fee }`. Holds the slot 15 min, `PENDING_PAYMENT`. |
| `POST /me/appointments/:id/pay` | Pat | gateway mode → `{ ok, payUrl }`; test/off mode confirms immediately → `{ ok, payUrl:null }`. |
| `POST /me/appointments/:id/cancel` | Pat | allowed for held slots, and confirmed slots until 2 h before. `{ ok, refundDue }`. |
| `POST /me/appointments/:id/review` | Pat | `{ rating 1-5, comment? }` once, after `COMPLETED`. |
| `GET /me/appointments` | Pat | last 100: status, mode, `meetingUrl` (only when CONFIRMED/IN_PROGRESS), `canPay`, `canCancel`, `canRate`, `paid`, `refunded`, `files[]`, `prescription` stub, doctor stub. |
| `POST/GET/DELETE /me/consultation-files` | Pat | patient report/photo upload (PDF/JPG/PNG/WebP ≤ 5 MB, ≤ MAX per booking), private download, delete before attach. |
| `GET /me/prescriptions` | Pat | issued prescriptions with items and a `buy{variantId,price,inStock}` per item. |
| `POST /me/prescriptions/:id/order` | Pat | one-step COD order of available items: `{ fullName, address, city, state, pincode }`. |

**Not in the backend (verified by search):** reschedule (no route or code), a single-appointment detail endpoint, patient medical history/records beyond appointments and prescriptions, patient notifications (admin-only), public product-review submission, wishlist/favourites routes (the model exists but no route), a public contact/enquiry submission, a public blog-category list.

### 3.5 Doctor area (`/api/doctor`, `/api/me/doctor-registration`) - requires `x-panel: doctor`

Registration: `POST /me/documents`, `POST /me/photo`, `POST /me/doctor-registration` (identity, stream, specialization, documents; creates a PENDING profile and a wholesale account).
Panel (`doctor-panel.routes.ts`): `GET /overview`, `GET /appointments?scope=upcoming|past`, `PATCH /appointments/:id {action: start|complete|no_show, doctorNotes}`, `GET /medicine-search`, `GET|PUT /appointments/:id/prescription`, `GET|PUT /availability`, `GET /slots`, `POST /time-off`, `DELETE /time-off/:id`, `GET /earnings`, `GET|PATCH /profile`, `GET /wholesale`, `POST /wholesale/request`, `GET /onboarding`, `POST /test/start`, `POST /test/:id/submit`, `GET /reviews`, `GET /stats`, `GET /consultation-files/:id`.

### 3.6 Payments, shipping, invoices

`POST /api/pay/callback` (gateway to server, verifies signature, asks PhonePe for status), `ALL /api/pay/return/:transactionId` (browser return; redirects to `${FRONTEND_URL}${returnTo}?payment=success|pending|failed`), `POST /api/ship/*` webhook. `paymentsMode()` is `gateway` (PhonePe keys), `test` (`PAYMENTS_TEST_MODE`), or `off`. Requires external credentials: PhonePe, Shiprocket, MSG91/SMTP/WhatsApp. **Blocked on credentials, not on code.**

### 3.7 Admin (`/api/admin/*`, staff cookie + permission area)

Routers: dashboard, reports (+ email), notifications, messages (automatic email/SMS/WhatsApp), shiprocket, invoices, returns (18 routes), refunds, products (+ form, + spreadsheet import), orders (+ create/quote/retail), discounts, coupons, customers (+ form), doctors (+ admin, onboarding), streams, doctor-tiers, doctor-reviews, appointments (+ files), prescriptions, payouts (+ auto), b2b, brands, categories, shipping, payments, inventory, enquiries, banners, blog (+ categories), staff and roles, uploads, bulk export/delete, data-import (owner only).

---

## 4. Frontend route inventory

Source: `app/**/page.tsx`. No `route.ts` handlers. No middleware.

| Route | File | Data source today | Auth | Notes |
|---|---|---|---|---|
| `/` | `app/page.tsx` | static `data/mock/home.ts` (not the repository) | - | Locked design. `featuredDoctor` "Dr. A. Demo" is mock. |
| `/products`, `/search` | `ShopView`, `SearchView` | `repositories.search` (Local) | - | |
| `/product/[slug]` | `ProductDetailView` | `repositories.product` (Local) | - | Shows `requiresPrescription`; `reviews[]` not rendered; has `PincodeCheck`. |
| `/categories`, `/brands`, `/brands/[slug]` | pages | `repositories.home` + `search` | - | |
| `/insights`, `/insights/[slug]` | pages | `repositories.insight` (Local) | - | Renders through `SafeRichText` (allow-list tokenizer, no raw HTML). |
| `/favourites` | `FavouritesView` | `localStorage` + `product.getBySlug` | - | Device-only. Backend has no wishlist route, so this is correct. |
| `/cart`, `/checkout` | `CartView`, `CheckoutView` | `repositories.cart`, `serviceability` | checkout: client redirect to `/login?callbackUrl=` | |
| `/thankyou` | `OrderConfirmationView` | `repositories.cart.getOrder` | owner | `?order=<id>` only. |
| `/checkout/success` | | `permanentRedirect("/thankyou")` | - | Orphan redirect, harmless. |
| `/login` | | `repositories.auth` (Local) | - | Phone then OTP only. No password login, no email field, no sign-up form. |
| `/account`, `/account/orders`, `/account/orders/[id]`, `/account/addresses`, `/account/profile` | | `repositories.account` (Local) | client-side redirect in `app/account/layout.tsx` | |
| `/about`, `/quality`, `/contact` | | static | - | Contact form is simulated. |
| `/admin` (+ `/login`, `/orders`, `/customers`, `/products`, `/categories`, `/brands`, `/inventory`, `/doctors`, `/payouts`, `/staff`) | `app/admin/**` | **live** `api()` calls to `/api/admin/*` | staff cookie, 401 redirects to `/admin/login` | Read-only lists. |
| `not-found`, `error` (root and `/search`), `loading` (only `/search`) | | | | |

### 4.1 Links whose destination does not exist (404)

| Target | Where used |
|---|---|
| `/doctors` | `sections/home/DoctorConsultation.tsx:138,318`, `sections/home/HomeHero.tsx:369`, `data/mock/home.ts` |
| `/book/{id}` | `sections/home/DoctorConsultation.tsx:217`, `components/doctors/DoctorCard.tsx:96` (card is unused) |
| `/inquiry` | `components/navigation/UtilityBar.tsx:40` |
| `/user/orders` | `components/navigation/UtilityBar.tsx:49` (should be `/account/orders`) |
| `/reviews` | `sections/home/Testimonials.tsx:106` |
| `/admin/prescriptions` | `components/admin/AdminSidebar.tsx` |
| `/wellness`, `/learn`, `/user`, `/shipping`, `/return-and-cancellation`, `/privacy-policy`, `/terms`, `/refund-policy`, `/disclaimer`, `/sitemap` | only inside `footerGroups` / nav arrays in `data/mock/home.ts`. **No importer of `footerGroups` found**, so these are dormant, but they are traps if anyone wires them in. |

Policy pages (privacy, terms, refund, shipping, returns, disclaimer) do not exist at all. For a pharmacy-adjacent shop that sells medicines and takes payment, that is a launch gap (legal content must come from the client).

### 4.2 Duplicate or conflicting routes

- `/checkout/success` vs `/thankyou`: redirect only; fine.
- `/search` and `/products` share `searchState`; intentional.
- Backend `seo.path` / sitemap use `/products/:slug` and `/blog/:slug`; frontend uses `/product/:slug` and `/insights/:slug` (§8).

---

## 5. Contract matrix (shop, auth, account, content)

Legend: Frontend status uses Complete / Partial / Missing / Broken / Unclear. "Mock" means a Local* repository serves it.

| # | Feature | Backend implementation | BE status | Frontend route | Frontend implementation | FE status | Contract mismatch | Missing work | Pri | Depends on |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Home rails, banners | `GET /shop/home` (`shop.routes.ts:47`) | Complete | `/` | Homepage reads `data/mock/home.ts` directly. `ApiHomeRepository` exists but is unused by the page. | **Partial** (mock; locked design) | `brands` capped at 18; `categories` top-level only | Optional: feed sections from `getHomeData()` (patch parked at `project-docs/patches/phase6-*.patch`, needs design sign-off) | P3 | catalogue data in DB |
| 2 | Product listing, filters, sort, pagination | `GET /shop/products` | Complete | `/products`, `/brands/[slug]`, `/search` | `ApiSearchRepository`, `searchState.ts`, `types/api/search.ts` | **Partial** (Api class matches; Local active) | None found: query keys, sort enum, facet shape and `inStock=1` all match | Swap, then test facet counts and 400s | P1 | Phase A |
| 3 | Search suggest | `GET /shop/suggest` | Complete | header, `/search` | `ApiSearchRepository.suggest` | Partial | None | Swap | P1 | - |
| 4 | Product detail | `GET /shop/products/:slug` | Complete | `/product/[slug]` | `ApiProductRepository`, `ApiProductDetail` | Partial | Type omits `allowCod`, `allowPrepaid`; `reviews[]` not rendered | Swap; render reviews; prescription banner exists | P1 | - |
| 5 | Brand directory | derived from `/shop/home` brands | Partial | `/brands` | `getBrandDirectory()` + `home.getHomeData()` | **Risk** | Live `home` returns max 18 brands, so the directory would be truncated | Needs an all-brands source. No public brands endpoint exists (only admin). Backend or facet-derived workaround | P1 | backend decision |
| 6 | Category directory | `/shop/home` (top-level only) + facets | Partial | `/categories` | `repositories.search.search({pageSize:1})` for facets | Partial | Only categories with products appear; no child tree beyond facets `parentId` | Verify against real taxonomy | P2 | catalogue |
| 7 | Cart quote, coupon | `POST /shop/quote` | Complete | `/cart`, drawer | `ApiCartRepository.getQuote`, `ApiQuote`, `cartView.ts` | Partial | Type matches. Frontend ignores `codNote`, `onlineNote`, `paymentConflict` (not in `ApiQuote`). A mixed prepaid-only plus COD-only cart yields a 400 at checkout with no earlier warning | Add the three fields to `ApiQuote` and surface them | P1 | - |
| 8 | Pincode serviceability | `GET /shop/pincode/:p` | Complete | `/checkout`, PDP | `ApiServiceabilityRepository` | Partial | Matches | Swap | P1 | Shiprocket for real data |
| 9 | Place order | `POST /me/checkout` | Complete | `/checkout` | `ApiCartRepository.checkout`, `CheckoutView` | Partial | Matches; `prescriptionId` never sent; `payUrl` handled via `location.assign`; **501 when payments "off"** is not specially handled | Swap; handle 501/409; prescription picker | P0 | Auth (row 12) |
| 10 | Order confirmation | `GET /me/orders/:id` | Complete | `/thankyou` | `ApiCartRepository.getOrder`, `ApiOrderDetail` | Partial | Type matches the select (misses `history`, `shipments`, `invoiceNumber`, `cancelReason`, `billing*`); `paymentMethod` type lacks `BANK_TRANSFER` | Swap; extend type | P0 | Auth |
| 11 | Online payment round trip | `startPayment`, `/api/pay/return`, `/callback` | Complete, **blocked** (PhonePe keys) | none | `window.location.assign(payUrl)` only | **Broken** | Backend returns to `${FRONTEND_URL}/patient/orders/:id?payment=…` (also `/doctor/orders/:id`, `/patient/consultations`). Frontend has none of these routes and never reads `?payment=` | Choose: add backend-agnostic frontend routes `/patient/*` redirecting into `/account/*`, or change `returnTo` in `shop.routes.ts:684,730` and `care.routes.ts:223`. Handle `payment=success\|pending\|failed` | P0 | PhonePe credentials to verify |
| 12 | Customer sign-in (OTP) | `POST /auth/otp/request`, `/otp/verify` | Complete | `/login` | `IAuthRepository` + `LocalAuthRepository`; `AuthProvider` (localStorage) | **Broken/mock** | See §5.2 | `ApiAuthRepository`; convert `AuthProvider` to cookie session via `GET /auth/session` | P0 | Backend OTP config |
| 13 | Password login, sign-up w/ email, set password | `/auth/password-login`, `/signup`, `/password` | Complete | none | none | **Missing** | - | Optional second tab on `/login`; "set password" in profile | P2 | row 12 |
| 14 | Session read, logout | `GET /auth/session`, `POST /auth/user-logout` | Complete | header, `/account` | `getCurrentUser()` returns `null` in Local | Missing (Api) | `ApiUser.roles[]` vs backend `role`; `ApiSession.token/expiresAt` do not exist | Rewrite types and provider | P0 | - |
| 15 | Profile | `PATCH /me/profile` (no GET) | Complete | `/account/profile` | `account.getProfile/updateProfile` | Broken (when live) | Backend requires `firstName`; returns `{ok}` not the profile; `ApiAccountProfile.email` non-null vs backend nullable; profile source must be `GET /auth/session` | Api repo that re-reads after save | P0 | row 14 |
| 16 | Addresses | `GET/DELETE /me/addresses` (`shop.routes`), `POST/PATCH` (`patient-panel`) | Complete | `/account/addresses` | `account.*Address*`, `ApiAddress` | Broken (when live) | `id: string` vs number; no `label`; POST returns `{id}` not the object; max 10; no edit UI beyond default/delete | Api repo + id conversion; add/edit form | P1 | row 14 |
| 17 | Order history | `GET /me/orders` (`care.routes.ts:386`) | Complete | `/account/orders` | `account.getOrders`, `ApiOrderSummary` | Broken (when live) | Backend returns `items[]` not `itemCount`; status enum 12 values vs frontend 5 (`OrderStatus` type; list badge prints raw status) | Map `itemCount`; extend status labels; show shipment tracking | P1 | row 14 |
| 18 | Order detail | `GET /me/orders/:id` | Complete | `/account/orders/[id]` | `account.getOrderById`, mock `ApiOrder` (string ids, nested address, `tax`) | Broken (when live) | `ApiOrder` ≠ `ApiOrderDetail` (same endpoint) | Move page onto `ApiOrderDetail`, delete `ApiOrder` | P1 | row 14 |
| 19 | Cancel / pay again / invoice | `POST …/cancel`, `POST …/pay`, `GET …/invoice` | Complete | none | none | **Missing** | `canCancel`, `canPay` already in `ApiOrderDetail` | Buttons and handlers on order detail | P2 | rows 14, 18 |
| 20 | Returns | `GET/POST /me/orders/:id/returns`, `/return-photo` | Complete | none | none | **Missing** | - | Return request flow on order detail | P2 | rows 14, 18 |
| 21 | Prescriptions (patient) | `GET /me/prescriptions`, `POST …/:id/order`, checkout `prescriptionId` | Complete | none | `IPrescriptionRepository` (mock shape `ApiPrescription` with upload-style fields) | **Missing** | `ApiPrescription` (ACTIVE/EXPIRED, `fileUrl`, `validUntil`) is invented; backend has `ISSUED` only, items with `buy{}`, `doctor`, `diagnosis`, `followUpDate` | Rewrite type from backend; list + order UI | P1 | doctor domain (§6) |
| 22 | Insights list | `GET /shop/blog` | Complete | `/insights` | `IInsightRepository`, Local only | **Broken (certain)** | `getInsights(1, 100)` at `app/insights/page.tsx:27`: backend `pageSize` max 50 → 400. No public category-list endpoint, so topics are derived from that call | Write `ApiInsightRepository`; fetch ≤ 50 (paginate) or ask backend for a categories endpoint | P1 | - |
| 23 | Insight detail | `GET /shop/blog/:slug` | Complete | `/insights/[slug]` | Local | Partial | `seo.path` is `/blog/:slug`; frontend type lists `seoTitle/seoDescription` the backend strips; no related-articles endpoint | Adapter: rewrite path; derive related from `?category=` | P1 | - |
| 24 | Contact / enquiry | **none** (admin read + update only; model supports CONTACT, WHOLESALE, DOCTOR_CONSULTATION, ORDER) | **Unavailable** | `/contact` | `ContactForm.tsx`: `setTimeout` then shows "Message Prepared" | **Blocked** | Nothing is sent | Backend needs a public `POST` (rate-limited); then wire the form | P2 | backend change |
| 25 | Favourites | none (model `WishlistItem` unused) | Unavailable | `/favourites` | localStorage | Complete (as device-only) | - | Optional later: server wishlist | P3 | backend change |
| 26 | Product reviews (submit) | none public (display only) | Unavailable | PDP | not rendered | Missing | - | Render approved reviews; submission needs backend | P3 | - |
| 27 | Banners | `GET /shop/home` banners | Complete | `/` | not displayed (homepage is static) | Missing | - | Decide whether the locked homepage uses them | P3 | design sign-off |
| 28 | SEO sitemap / robots | `GET /shop/sitemap` | Complete | none | no `app/sitemap.ts`, `robots.ts` | Missing | path shapes differ | Build `sitemap.ts` from the endpoint, mapping paths | P2 | - |

### 5.1 Reuse that is correct

Checked field by field: `ApiSearchFilters` ↔ `listingSchema`, `ApiProductListingResponse` ↔ the listing response, `ApiProductDetail` ↔ the product select, `ApiQuote`/`ApiQuoteLine` ↔ `buildQuote` (except the three payment-note fields), `ApiCheckoutPayload` ↔ `checkoutSchema`, `ApiCheckoutResponse` ↔ the 201 body, `ApiOrderDetail` ↔ the order select, `ApiServiceabilityResult` ↔ pincode response. `lib/api.ts` is sound for browser use (same-origin `/api`, `credentials: "include"`, `ApiError` with status) and falls back to `API_URL` on the server.

### 5.2 Auth type mismatch in detail

| Frontend (`types/api/auth.ts`, `LocalAuthRepository`) | Backend |
|---|---|
| `requestOtp(phone)` → `{success, message}` | `POST /auth/otp/request` → `{ok, testMode}`; errors are HTTP status + `message` |
| `ApiUser.roles: string[]` (mock `["USER"]`) | `user.role: "CUSTOMER"\|"DOCTOR"` |
| `ApiSession { token, expiresAt, user }`; stored in `localStorage` key `dochomoeo_session` | No token ever reaches JS; cookie `dh_user` is HTTP-only. `AuthProvider.readSession()` cannot work with the real API |
| mock accepts any code except `000000` | codes are 4-6 digits, rate-limited, expire in 10 min, 5 attempts |
| `getCurrentUser()` returns `null` | should call `GET /auth/session` and treat 401 as signed out |
| Route protection is client-side only (`app/account/layout.tsx`) | Backend enforces 401. Acceptable, but expect a loading flash and no SSR gating |

### 5.3 The insights `pageSize=100` break

`app/insights/page.tsx:27`: `repositories.insight.getInsights(1, 100)`; backend `shop.routes.ts:361` validates `pageSize` as `1..50`. The Local mock accepts it, so this is invisible today. Once the real repository is used, `/insights` returns 400. (Also, `/insights?category=` filters must pass a category **slug**.)

---

## 6. Doctor and consultation gap analysis

**Finding: the backend supports a full consultation product; the frontend has none of it.** Evidence: `components/doctors/DoctorCard.tsx` and `DoctorProfileMini.tsx` have **no importers**; `types/doctor.ts` is a presentation type (`id: string`, `nextAvailable: string` pre-formatted) with no relation to the backend's `DoctorProfile`; `lib/repositories/interfaces.ts` has no doctor/appointment/consultation repository; `app/` has no `doctors`, `book`, `consult`, `appointments` or `patient` route.

| Capability | Backend | Frontend | Gap (exact) |
|---|---|---|---|
| Doctor directory | `GET /care/doctors?q=` | none. Homepage CTA `/doctors` is 404 | Route `/doctors`; `IDoctorRepository.list(q)`; wire type from `publicDoctor`; `DoctorCard` needs the backend fields (slug, `videoFee`, `audioFee`, `clinicCity`, `languages`) |
| Specialty filter | **only free-text `q`** (matches name, specialization, language). `GET /care/streams` and `/care/symptoms` list streams/specializations; no `specialization=` filter on `/doctors` | none | Either filter client-side by `q=<specialization name>`, or ask backend for a `specializationId` param. **Report as a backend limitation**: no city, fee, language, rating, sort or pagination controls |
| Guided matching | `POST /me/match` (signed in), `/care/symptoms`, `/care/suggest-specialization` | none | Optional journey: symptoms → specialization → 2-3 doctors. Requires sign-in at the match step |
| Doctor profile | `GET /care/doctors/:slug` (+ weekly availability) | none | Route `/doctors/[slug]` (use the backend `slug`, not an `id`; homepage uses `/book/{id}`) |
| Availability / slots | `GET …/slots?date=`, `GET …/next-slot` | none | Date strip + slot picker; times are ISO UTC, day boundaries are IST (`Asia/Kolkata`) |
| Booking | `POST /me/appointments` (hold 15 min) | none | Booking form: patient name, age, gender, symptoms (≥ 5 chars), mode VIDEO/AUDIO (fee may be null for a mode), optional intake and file attachments. 409 "slot no longer free" handling |
| Report/photo upload | `POST /me/consultation-files` (multipart) | none | `FormData` upload ≤ 5 MB; `lib/api.ts` currently JSON-only (`Content-Type` forced when `body` set, `JSON.stringify`), needs a multipart path |
| Payment of fee | `POST /me/appointments/:id/pay` → `payUrl` or immediate confirm | none | Pay step; return page must read `?payment=`; backend `returnTo` is `/patient/consultations` |
| Confirmation / appointment details | no single-appointment endpoint; list only | none | Derive from `GET /me/appointments` |
| Appointment history, status | `GET /me/appointments` (`canPay`, `canCancel`, `canRate`, `meetingUrl`) | none | `/account/appointments` (or `/patient/consultations`) list with status chips, join link, files |
| Cancel | `POST …/cancel` (until 2 h before; `refundDue`) | none | Confirm dialog and refund notice |
| Reschedule | **not supported by the backend** | none | Limitation: model as cancel + rebook. Do not invent an API |
| Rating | `POST …/review` | none | Star form on completed rows |
| Prescriptions | `GET /me/prescriptions`, order-from-prescription, checkout `prescriptionId` | contract type only (and wrong, §5 row 21) | List/detail/"order medicines" |
| Patient dashboard | `GET /me/overview` | `/account` is the generic mock overview | Replace with `toDo[]`, `upcoming[]`, counts |
| Doctor sign-up and sign-in | `/auth/otp/request {mustExist}`, `/auth/password-login`, `/me/doctor-registration`, uploads | none | Needs `x-panel: doctor` on every call |
| Doctor dashboard | 21 `/api/doctor/*` routes (appointments, prescriptions, availability, earnings, profile, wholesale, onboarding test, reviews) | none | Whole product area. Decide scope with the client before building: the website may only need the patient side, with the doctor app staying elsewhere |
| Notifications | admin-only (`/api/admin/notifications`); outbound email/SMS/WhatsApp are server-side events | none | Nothing to build for patients unless backend adds a feed |
| Admin consultation tools | appointments, prescriptions, payouts, streams, tiers, onboarding, reviews | admin pages: doctors list (broken fields), payouts list (field mismatch); no appointments/prescriptions page; sidebar links `/admin/prescriptions` (404) | §7 |

**Backend limitations to report to the client (do not mock):** no reschedule, no doctor specialty/city filter on the list, no pagination on the doctor list, no single-appointment read, no patient health record store other than prescriptions.

**Identifier formats:** doctors are addressed by `slug` publicly and by numeric `id` in `POST /me/appointments`; the frontend `Doctor.id` is a string like `"d-001"`. Appointment and prescription ids are numbers; account types use string ids.

---

## 7. Other domain gaps

### 7.1 Admin panel (live code, outside the storefront repository layer)

`app/admin/**` calls `api()` directly (no repository) and is the only live-API frontend code. Findings:

| Page | Problem (verified against the backend response) |
|---|---|
| `/admin/staff` | Reads `res.items`; backend returns `{ me, staff[], roles[], areas }`. **Always renders empty.** Row fields also differ (`role` is an object `{id,name}`, name may be null) |
| `/admin/products` | `AdminProductItem` expects `price`, `mrp`, `brandName`, `categoryName`; backend returns `priceMin/priceMax`, `brand{id,name}`, `category{id,name}`, `stock`, `variantCount`. Price cell would throw on `undefined.toLocaleString` |
| `/admin/doctors` | Expects `stream`, `slug`, `submittedAt`; backend list returns none of those (it returns `createdAt`, `qualification`, `specialization`, `phone`, `email`, `documentCount`…). `verificationStatus` type omits `DRAFT/UNDER_REVIEW/SUSPENDED`. The page has no approve/reject action though `PATCH /admin/doctors/:id/verification` exists |
| `/admin/payouts` | Expects `batchNumber`, `consultationCount`; backend rows have `consultations`, `reference`, `doctorName`; no `batchNumber` column in `DoctorPayout` |
| `/admin` dashboard | `totalCustomers` is mapped from `totals.newCustomers` (new in range, not total). On any error it silently shows zeros, indistinguishable from real data |
| All lists | Errors are swallowed (`catch → []`), no error state, no pagination controls (backend paginates; default pageSize 20), no mutations anywhere |
| `AdminSidebar` | links `/admin/prescriptions`: no page |
| Auth | `GET /auth/me` + 401 redirect to `/admin/login` is sound. The dev prefill uses only `NEXT_PUBLIC_DEV_LOGIN_EMAIL` and is gated by `NODE_ENV` (older audit's password finding is no longer present in `.env.local` keys or the page code) |

Backend admin areas with **no** frontend: returns, refunds, invoices, shipping/Shiprocket, coupons/discounts, banners, blog, enquiries, B2B, reports, notifications, messages, streams, tiers, doctor reviews, appointments, prescriptions, inventory edits, product create/edit/import, order status changes. Whether the client wants these in this Next app (rather than the backend developer's own panel) is an open question (§10).

### 7.2 Commerce

- Online payment is `off` unless PhonePe keys or `PAYMENTS_TEST_MODE`; `quote.onlinePayment/onlineTest` already drive the UI. Checkout shows an honest mock banner (`usingMockData`). Wholesale (`CREDIT`) option is wired from `quote.wholesale`.
- Stock and price truth is server-side; `expectedTotal` is only a drift guard (backend tolerance 0.5). Good.
- `GET /me/orders` has no pagination (last 50).

### 7.3 Seed data

`DOCHOMO-FINAL-FRONTEND-HANDOFF.md` and project memory record that the backend DB "has no catalogue" after seeding (`backend/prisma/seed.ts` is 72 lines). I did not check the database. Live pages will be empty until the legacy import (`backend/src/scripts/import-legacy.ts`, owner-only `data-import` route) or product import has been run.

---

## 8. Broken routes, mismatches, mock-only features, risks

### 8.1 Mock-only features presented as functional

| Feature | Evidence | Labelled? |
|---|---|---|
| Entire storefront data | `lib/repositories/index.ts:usingMockData = true` | Yes: `DemoContentNotice` on 12 views; checkout banner |
| OTP login | `LocalAuthRepository` (any code ≠ `000000`) | Partly (no on-page notice on `/login`) |
| Account orders/addresses/profile | `LocalAccountRepository` | Notice not shown under `/account/*` |
| Contact form | `ContactForm.tsx` `setTimeout`, "Message Prepared" | **No.** A customer would believe the message was sent |
| Homepage doctor card | `featuredDoctor` "Dr. A. Demo", "Today, 5:30 PM", fee ₹499, "Book" link | Covered by notice, but links to dead routes |
| Homepage stats ("50+ expert doctors") | `data/mock/home.ts` | static copy |

### 8.2 Stale documentation

- `brain/31_FRONTEND_BACKEND_INTEGRATION_AUDIT.md` (2026-10-13) names `POST /api/auth/otp/send`, `GET /api/me/patient/overview`, `GET /api/me/favourites`, `PATCH /api/me/profile` with `GET /api/auth/me`: the real endpoints are `/auth/otp/request`, `/me/overview`, none, and `GET /auth/session`. It also reports a `NEXT_PUBLIC_DEV_LOGIN_PASSWORD` leak that is not in the current tree, and a different branch/commit.
- `DOCHOMO-FINAL-FRONTEND-HANDOFF.md` is mostly accurate against the source (endpoint map and shapes check out) but: says the PDP has "only a placeholder" pincode check (a `PincodeCheck` is rendered at `ProductDetailView.tsx:285`); never mentions that the backend hard-codes `/patient/*` and `/doctor/*` return paths; does not flag the `pageSize=100` break; omits all consultation work.

### 8.3 Integration risks

| Risk | Detail | Pri |
|---|---|---|
| Payment return 404 | §5 row 11 | P0 |
| `/patient/*` and `/doctor/*` URL convention | The backend was written for a frontend with `/patient/orders`, `/patient/consultations`, `/doctor/orders`. Decide the URL scheme once; it affects the payment return, emails sent by `events.*`, and notification links. Not verified: whether `lib/events.ts`/`lib/notifications.ts` embed frontend URLs | P0 |
| CORS / origin | Browser traffic goes through the Next rewrite, so CORS is bypassed. `FRONTEND_URL` is also used to build the PhonePe return redirect, so it **must** equal the public site origin. Old audit reported a port mismatch in `backend/.env`; I did not open `.env` | P1 |
| Server-side fetch has no cookie | `lib/api.ts` on the server (RSC) does not forward the user's cookie. Public `/shop/*` is fine; wholesale prices (doctors) and anything under `/me` must be fetched client-side or with forwarded cookies | P1 |
| Client-only route guards | no `proxy.ts`/middleware; account pages flash a spinner | P2 |
| 401 handling outside admin | `lib/api.ts` redirects only for `/admin`. A storefront 401 (expired 7-day cookie) is not turned into a sign-out | P1 |
| `api()` is JSON-only | uploads (consultation files, return photos) need multipart support | P1 |
| Rich text | Product/blog HTML rendered through `SafeRichText` (display-side allow-list). Backend does not sanitise on write (it has `db:clean-html` script). Acceptable, keep the component | P2 |
| Rate limits | OTP: 8 requests/15 min per IP, 30 verifies. IP-based limits behind the Next proxy see the proxy's IP unless `trust proxy` is set. **Not verified** (`app.ts` has no `trust proxy`) | P1 |
| Admin auth, permission model | Staff cookie plus per-area permissions; admin UI does not hide sections the role lacks | P3 |
| Order status vocabulary | backend 12 statuses vs frontend 5-value type; badges print raw text | P2 |
| Currency/dates | backend money is JSON numbers (rupees, 2 dp); dates ISO strings; appointment slot logic IST. Frontend formatters (`lib/formatters/price.ts`) assume rupees: consistent | - |
| No automated tests on either side | no regression net for the swap | P1 |

### 8.4 Security notes (code-level, no secrets handled)

- Client-supplied prices are **not** trusted: checkout and quote send only `variantId` and `quantity`; the server re-prices. Good.
- Authorization is entirely server-side (cookie roles + `userId` scoping in every `/me` query). Good. The frontend's localStorage "session" must not survive the swap, otherwise a user can appear signed in while all API calls 401.
- `/uploads/documents` is staff-only; other `/uploads/*` are public with immutable caching (random filenames).
- Backend error responses use a `message` field; `ApiError` reads `data.message`. Compatible.

---

## 9. Prioritised phased roadmap

Order below follows verified dependencies: nothing signed-in works until auth is real, and the doctor journey depends on auth, uploads and the payment-return decision.

### Phase A: Contract and foundation (Medium)
**Objective.** Make the repository layer, types and session model match the live backend so later phases are just UI.
**Missing features.**
1. `ApiAuthRepository`, `ApiAccountRepository`, `ApiInsightRepository`, `ApiPrescriptionRepository` in `lib/repositories/api.ts`.
2. Rewrite `types/api/auth.ts` (`role`, `hasPassword`, `doctor`, `wholesale`), `types/api/account.ts` (number ids, `ApiOrderDetail` reuse), `types/api/prescription.ts` (from `/me/prescriptions`).
3. `AuthProvider`: cookie session via `repositories.auth.getCurrentUser()` → `GET /auth/session`; `login(user)`; remove localStorage session.
4. `lib/api.ts`: multipart support, generic 401 → signed-out handling for storefront.
5. Decide and implement the payment return URL scheme (frontend `/patient/*` aliases or backend `returnTo` edits) and `?payment=` handling.
6. Fix `getInsights(1,100)`; add `codNote/onlineNote/paymentConflict` to `ApiQuote`.
7. Fix the admin field mismatches (§7.1) if admin stays in scope.
**Backend files.** `middleware/auth.ts`, `otp-auth.routes.ts`, `shop.routes.ts` (:578-760), `care.routes.ts` (:386), `patient-panel.routes.ts`, `payments.ts`, `pay.routes.ts`.
**Frontend files.** `lib/repositories/{interfaces,api,index}.ts`, `components/providers/AuthProvider.tsx`, `app/login/page.tsx`, `app/account/**`, `types/api/*`, `lib/api.ts`, `app/insights/page.tsx`.
**Prerequisites.** Backend running with DB; `OTP_DEV_CODE` set for dev; catalogue data imported. Decision on URL scheme.
**Acceptance.** Against a running backend: sign in/out via cookie persists across reload and tabs; `/account/*` data equals the API; 401 returns the user to `/login`; no `localStorage` session key; `tsc` clean.
**Validation.** Contract tests (recorded or live) for each repository method; manual cookie checks; one signed-in flow per method.

### Phase B: Critical storefront on live data (Medium)
**Objective.** Flip `home` (optional), `product`, `search`, `serviceability`, `cart`, `insight` to Api*; keep `usingMockData = false` only when every repository is live.
**Missing.** Swap + live QA of listing facets, 404 behaviour, coupon path, COD and online checkout, 409 re-quote, 501 message, order confirmation incl. `?payment=`. Brand directory source (row 5). Render product reviews. `app/sitemap.ts`.
**Prerequisites.** Phase A; catalogue loaded; PhonePe keys or `PAYMENTS_TEST_MODE`.
**Acceptance.** Place a COD order and an online (test-mode) order end to end; stock decrements; order appears in `/account/orders`; admin sees it.
**Validation.** Scripted e2e of cart → checkout → confirmation; compare facet counts to API JSON.

### Phase C: Patient account completeness (Medium)
Addresses add/edit; order list with tracking; order detail with cancel, pay again, invoice, returns; profile and set-password; password login and email sign-up tab; patient overview dashboard.
**Backend.** `shop.routes.ts`, `returns.routes.ts:214-263`, `patient-panel.routes.ts`, `otp-auth.routes.ts`.
**Acceptance.** Each backend `canCancel/canPay` flag drives the UI; a return request with photos is created; invoice PDF opens.

### Phase D: Doctor discovery and consultation (Large)
Patient side first: `/doctors`, `/doctors/[slug]`, slot picker, booking with files, payment, `/account/appointments`, cancel, rate, prescriptions list and order-from-prescription, homepage CTAs repointed. Doctor dashboard and registration only if the client confirms they belong in this app.
**Backend.** `care.routes.ts` (all), `consultation-files.routes.ts`, `doctor-register.routes.ts`, `doctor-panel.routes.ts`.
**Prerequisites.** Phase A (auth, multipart, payment return). At least one approved doctor with availability (`db:demo-doctor` script exists in the backend).
**Acceptance.** Book → pay → appears in appointments with join link → complete (via doctor panel or admin) → rate; prescription issued → order medicines.
**Backend limitations to settle first:** specialty filter, reschedule, pagination.

### Phase E: Additional capabilities (Medium-Large)
Contact/enquiry (needs a new public backend route), policy pages (client content), admin mutations (order status, doctor approvals, returns, refunds, coupons, blog), notifications, shipments tracking in the UI.

### Phase F: Integration verification and release readiness (Medium)
Automated tests (none exist), accessibility and responsive pass on new pages, error/empty/loading states (only `/search` has `loading.tsx`), performance and caching strategy for live data (`force-dynamic` vs revalidate), production env checklist (`FRONTEND_URL`, `PUBLIC_API_URL`, OTP/SMS, PhonePe, Shiprocket, `trust proxy`), remove `DemoContentNotice` and `usingMockData`.

---

## 10. Uncertainties and blocked items

1. **Scope of the doctor features in this app.** Backend has a full doctor panel. Is it expected in this Next.js site, or will the backend developer's own UI serve doctors/admin? This decides the size of Phase D and E.
2. **URL scheme** `/patient/*` vs `/account/*` (§8.3). Needs a decision.
3. **Database contents.** Not inspected; per project notes the seeded DB has no catalogue.
4. **External credentials** (PhonePe, Shiprocket, MSG91/SMTP/WhatsApp) not available to me; payment, serviceability data and real OTP delivery are **unverified**.
5. **`backend/.env`** not read (including `FRONTEND_URL`, `OTP_DEV_CODE`, `PAYMENTS_TEST_MODE` values).
6. **Whether `lib/events.ts` / `notifications.ts` put frontend URLs in emails/SMS.** Not read in detail.
7. **`trust proxy` / rate limiting behind the Next rewrite.** Not verified.
8. **Legal policy page content** must come from the client.
9. **Product reviews and wishlist on the server** would need backend work; confirm whether wanted.
10. **Backend limitations in §6** (no reschedule, doctor-list filters, public enquiry endpoint, public blog-category list, full brand list) need a client/backend decision.
11. No build, lint, or runtime run was performed in this audit. Prior claims of "build passes" in the existing docs were not re-verified.

---

## 11. Completion checklist

**Foundation**
- [ ] `ApiAuthRepository` written; `AuthProvider` uses `GET /auth/session`; localStorage session removed
- [ ] `ApiAccountRepository` (profile re-read after PATCH, address ids converted, order list `itemCount` mapped)
- [ ] `ApiInsightRepository` (page size ≤ 50, `seo.path` rewritten, related derived)
- [ ] `ApiPrescriptionRepository` and a type derived from `/me/prescriptions`
- [ ] `types/api/auth.ts`, `account.ts`, `prescription.ts` rewritten to backend shapes; `ApiOrder` retired
- [ ] `ApiQuote` gains `codNote`, `onlineNote`, `paymentConflict`; UI shows them
- [ ] `lib/api.ts`: multipart uploads; storefront 401 handling
- [ ] Payment return URL scheme decided and implemented; `?payment=` handled
- [ ] `repositories/index.ts` swapped; `usingMockData = false`; `DemoContentNotice` removed

**Storefront**
- [ ] Listing, search, PDP, categories, brands verified on live data
- [ ] Brand directory source resolved (home caps at 18)
- [ ] Coupon, COD, online checkout verified; 409/501 handled
- [ ] Reviews rendered on PDP
- [ ] `app/sitemap.ts` and `robots.ts`
- [ ] Broken links fixed: `/user/orders`, `/inquiry`, `/reviews`, `/doctors`, `/book/*`

**Account**
- [ ] Address add/edit/default/delete (max 10)
- [ ] Order list statuses (12) and tracking; order detail on `ApiOrderDetail`
- [ ] Cancel, pay again, invoice
- [ ] Returns flow with photos
- [ ] Password login, email sign-up, set password
- [ ] Patient overview dashboard

**Consultations**
- [ ] `/doctors` list and `/doctors/[slug]` profile
- [ ] Slot picker, booking, file upload, payment, appointment history
- [ ] Cancel, rate, prescriptions, order-from-prescription
- [ ] Decision recorded on doctor registration/dashboard scope

**Content and forms**
- [ ] Contact form backend route and wiring (or remove the form)
- [ ] Policy pages from client content

**Admin (if in scope)**
- [ ] Fix staff, products, doctors, payouts, dashboard field mismatches; error states; pagination
- [ ] Remove or build `/admin/prescriptions`
- [ ] Mutations: order status, doctor verification, returns, refunds, coupons, blog

**Release**
- [ ] Automated tests (repository contract, e2e happy paths)
- [ ] Accessibility and responsive check on new pages
- [ ] `loading`/`error`/empty states for every live route
- [ ] Production env checklist (`FRONTEND_URL`, `PUBLIC_API_URL`, gateway, SMS, couriers, `trust proxy`, `OTP_DEV_CODE` unset, test flags off)
