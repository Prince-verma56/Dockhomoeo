# DocHomoeo Phase 5 + 6: Customer Experience, Remaining Features and Production Readiness

**Date:** 2026-10-16 · **Branch:** `main`, uncommitted (Phases 1–6 are all uncommitted; nothing was committed or pushed) · **Scope:** active root frontend only

## Summary

- **Doctors** now have a directory (`/doctors`) and profile pages (`/doctors/[slug]`) with live availability. Both read the real care API. Booking is shown as not yet open, because the website has no booking flow.
- **Prescriptions:**
  - The account page lists the customer's issued prescriptions, with each medicine's availability.
  - "Order available medicines" fills the cart and sends `prescriptionId` at checkout.
  - **New:** checkout lets a signed-in customer link any of their issued prescriptions.
- **Discoverability (new).** Doctors and Prescriptions can now be reached from:
  - the header and the mobile menu;
  - the footer and the "How it works" steps;
  - search: the palette offers "Search doctors for '…'", and `/search` links to the doctor search when nothing matches.

  Before this, the directory only appeared through two homepage buttons, which is why it looked missing.
- **Content integrity:**
  - The hero's unverified figures were replaced with factual promises. "10,000+ Happy Families" with stock portraits became "Maker on every pack". "4.8 App Rating" became "Delivery check by pincode". The video, timeline and layout are unchanged.
  - The offer band uses a drawn backdrop instead of a photo of a bottle the shop does not sell.
  - Insights and reviews show honest "coming soon" states. "Chat" consultations and "certified" doctors were removed, since the backend books video and audio and *verifies* doctors.
- **Tests:**
  - Phase 5+6 browser suite: **149/149**.
  - Earlier suites: **67/67, 110/110, 55/55** (browser); **44/44** (API contract).
  - **Link crawl:** 43 URLs, **0** broken.
  - **Build and typecheck:** pass.

---

## 1. Features and routes

| Feature | Route | Backend source | Notes |
|---|---|---|---|
| Doctor directory | `/doctors`, `/doctors?q=` | `GET /api/care/doctors?q=` | Shows real profile fields only: qualification, specialization, experience, languages, city, video and audio fees, consultation length. A rating appears only when the doctor has ratings. Search uses the backend's `q` (name, specialization or language). Empty and no-match states are designed. |
| Doctor profile | `/doctors/[slug]?date=` | `GET /api/care/doctors/:slug`, `…/slots?date=` | Seven-day strip; the day lives in the URL, so it survives refresh and links. Free and taken slots show as the shop reports them. Weekly hours in India time. An unknown slug returns 404. No booking button, because none exists. |
| Homepage consultation band | `/` | `GET /api/care/doctors`, `…/next-slot` | The first real doctor, the next free slot and the lowest fee. With no doctors: "Consultations are opening soon". |
| Prescriptions | `/account/prescriptions` | `GET /api/me/prescriptions` (ISSUED only) | Shows doctor, issue date, diagnosis, advice and follow-up date. For each medicine: dosage, and whether it is in stock, out of stock or not sold here. "Order available medicines" adds the in-stock packs at the prescribed quantity and links the prescription. Loading, error with retry, and empty states. |
| Prescription at checkout (**new**) | `/checkout` | `POST /api/me/checkout` `prescriptionId` | `sections/checkout/CheckoutPrescription.tsx`. The picker lists only `/me/prescriptions`, the same set the backend accepts: ISSUED, owned by the customer. A link left over from another account, or no longer issued, is dropped before submit. If the list fails to load, checkout still works and offers "Try again". Hidden when the customer has no prescriptions. |
| Health Insights | `/insights`, `/insights/[slug]` | `GET /api/shop/blog`, `/blog/:slug` | Unchanged since Phase 4. The homepage band shows three labelled "Coming soon" topics until the first post is published; these link to no article. |
| Register | `/register` | OTP sign-up | Linked from `/login` with the return address kept. |

**What the backend does not offer, so the website does not either:**
- Consultation booking.
- Prescription upload or deletion: the backend holds only prescriptions written by its own doctors.
- A testimonials source.
- Public promotions or coupon listings.

## 2. UI/UX and responsive work in this pass

- **Header:**
  - "Doctors" is a top-level item.
  - To keep the account button on screen from 1024 to 1399 px, "Contact" moves out of the header row below 1400 px. It stays in the footer and the mobile menu.
  - Item padding is tighter below 1400 px, labels never wrap, and the search field is 240 px from 1280 to 1399 px.
  - Verified at 1024, 1280, 1366, 1440 and 1536 px: Login is never clipped. Before this fix it overflowed by 63 px at 1024 and 71 px at 1280.
- **Mobile menu:**
  - Doctors is listed with the other main destinations.
  - The bottom row is now three even columns: Track Order, Prescriptions, Help.
  - Those three links now close the drawer when tapped; before, it stayed open over the new page.
- **Footer:** new "Care" column (Find a Doctor, My Prescriptions). Columns are 4-up on tablet, 2×2 beside the newsletter on desktop, and 4-up from 1536 px.
- **"How it works":**
  - Steps 01, 04 and 05 link to `/doctors`, `/account/prescriptions` and `/products`.
  - Copy now matches the backend: video or audio, verified doctors.
  - The "100% Genuine" badge became "Genuine · Licensed makers".
- **Search:** the palette's doctor row appears in the "All" scope only. It is not counted as a match, so "no matches" stays accurate. Keyboard navigation includes it.
- **Responsive:** no horizontal overflow and no failed image request on 19 routes at 1440, 1024, 768, 390 and 375 px (§4).

## 3. Files

**Created in this pass:** `sections/checkout/CheckoutPrescription.tsx`, `DOCHOMEO-PHASE-5-6-COMPLETION-REPORT.md`.

**Modified in this pass:**
- `components/navigation/navLinks.ts`: Doctors item; `wideOnly` flag.
- `components/navigation/SiteHeader.tsx`
- `components/navigation/MobileNav.tsx`
- `components/navigation/SiteFooter.tsx`
- `components/search/SearchPalette.tsx`
- `sections/search/SearchView.tsx`
- `sections/home/ConsultationJourney.tsx`
- `sections/checkout/CheckoutView.tsx`: the inline prescription note moved into the new component.

**Earlier in Phase 5** (same working tree, verified here):
- **Doctors and prescriptions:** `app/doctors/[slug]/page.tsx`, `app/account/prescriptions/page.tsx`, and the prescription link in `CartProvider`.
- **Repositories:** `ICareRepository.getDoctor`, `getSlots` and `getNextSlot`; `types/api/care.ts`.
- **Breadcrumbs:** shared trails for the visible breadcrumb and the JSON-LD (`lib/navigation/crumbs.ts`, `PageBreadcrumb`).
- **Errors:** route error page inside the site chrome, using `retry` as this Next.js version documents.
- **Hero:** text-only claim fixes.
- **Homepage sections now read the shop:**
  - offer band (drawn backdrop);
  - health goals (live categories);
  - featured collection (live counts, none invented when the shop is unreachable);
  - insights and reviews empty states.

**Not modified:**
- **Backend:** `backend/` (`git status backend` is clean), schema, migrations, seeds, `.env`.
- **Reference repo:** `docohomo-prince/`. Its two local modifications, `.gitignore` and `apps/dashboard/src/serviceWorker.js`, date from 8 and 14 Oct, before Phase 1, so they are not from this work.
- No runtime import from the reference repo, and no new dependencies.

## 4. Tests and results

**Setup:**
- **Backend:** run locally in **safe test mode**, with process env vars only: `PAYMENTS_TEST_MODE=true`, an OTP dev code, and PhonePe, Shiprocket and legacy Mongo keys blank. `POST /api/shop/quote` reported `onlineTest: true` before each run.
- **Frontend:** `next build` + `next start`.
- **Browser:** Playwright Chromium from the npx cache; nothing installed in the project.
- **Database after all runs:** 9 payments, all `TEST`/`SUCCESS`; **0 shipments**; no coupons, posts, doctors or reviews created.

| Check | Result |
|---|---|
| `tsc --noEmit` | Pass |
| `next build` | Pass; `/doctors` and `/doctors/[slug]` are request-time |
| ESLint, all files changed in Phases 5–6 | **0 errors**, 6 warnings (`<img>` for admin-uploaded doctor photos and background art, which are intended) |
| ESLint, whole project | 14 errors, all in files unchanged from the last commit: `app/admin/*`, `hooks/use-admin-session.ts`, `components/providers/HeroPlaybackContext.tsx` (locked hero), `components/ui/tilt-card.tsx` |
| **Phase 5+6 browser suite** | **149/149** |
| Phase 4 browser suite (regression) | **110/110** |
| Phase 2+3 browser suite (regression) | **67/67** |
| Phase 1 browser suite (regression) | **55/55** |
| Phase 1 API contract test (regression) | **44/44** |
| Populated-state rendering, fixture proxy (regression) | **19/19** |
| Pack-form unit cases | **7/7** |
| Link crawl from every page, signed out and in | **43 URLs, 0 non-200** |

**What the Phase 5+6 suite covers:**
- **Homepage:** all sections present; none of the removed figures or "Clinically" claims; hero video present; no stock portraits; offer matches the catalogue.
- **Doctors:**
  - live empty directory; unknown doctor → 404;
  - with fixtures: profile fields, free and taken slots, no booking button;
  - the day strip with Back, Forward and refresh; an out-of-range date falls back to today.
- **Prescriptions:**
  - live empty state;
  - with fixtures: per-item availability, and "Order available medicines" adds only the in-stock pack at the prescribed quantity;
  - `prescriptionId` in the checkout payload; the backend's refusal of an unknown prescription shown word for word, with no order created;
  - unlink, re-link through the **new picker**, place the order, and the link clears with the cart;
  - a stale link is dropped; no picker without prescriptions.
- **Discoverability:**
  - header Doctors link at five desktop widths, Login fully on screen, the active state;
  - mobile drawer has Doctors and Prescriptions and closes on navigation;
  - footer Care links; "How it works" links and copy;
  - palette → `/doctors?q=skin`; `/search` no-results link.
- **Accessibility:**
  - every visible control on `/`, `/products`, `/doctors`, `/cart`, `/login` and `/insights` has an accessible name;
  - the keyboard focus ring is visible.
- **Responsive:** 19 routes × 5 widths.
- **Console:** no hydration warnings and no uncaught page errors.

**Test-only mocks** (same rules as Phase 4):
- **Doctors and slots:** a local proxy answered with fixtures in the backend's exact shapes, rendered through a second `next start`.
- **`/api/me/prescriptions`:** a Playwright route answered with a fixture prescription (id 9901). The real backend correctly refused that id at checkout, and that refusal is part of the test.

The application never uses these mocks, and no fixture reached the database.

**Changed test expectation:** two Phase 4 checks expected the empty insights and reviews bands to be *hidden*. Phase 5 deliberately shows labelled empty states instead, so the checks now assert those states. Everything else in the earlier suites is unchanged.

## 5. Backend capabilities consumed

These are in use and verified:
- **Auth:** OTP and password sign-in and sign-up, session cookies.
- **Account:** profile, addresses (`/api/me/*`).
- **Shop:** home, listing, search, suggestions, product detail with reviews, brands, categories, blog.
- **Ordering:** quote (prices, stock, coupons, shipping, COD), pincode, checkout with `expectedTotal` and `prescriptionId`, order list and detail, the order payment-retry call (`/pay`).
- **Care:** doctors list and search, doctor detail, slots, next slot.
- **Patient:** prescriptions.

## 6. Remaining limitations: backend data or contracts

1. **No doctors, blog posts, reviews or coupons exist** in the development database. Those pages are correct but show their empty states; populated rendering is verified only with fixtures. The admin adds the content, and no frontend change is needed.
2. **Consultation booking:** there is no customer booking flow on the website. To build one, the frontend needs:
   - the booking endpoint, its payment step and its cancellation rules confirmed;
   - a consultation list for `/account`.
3. **Prescription upload:** not supported by the backend. Prescriptions come only from DocHomoeo doctors. An upload feature needs a new endpoint, storage and review workflow.
4. **Listing cards lack `form`** (`toCard` in `shop.routes.ts`). Pack drawings on cards are inferred from the product name, so a product whose name does not state its form could draw a different pack on its card than on its page. Fix at the source: add `form` to `toCard`.
5. **Serviceability without Shiprocket:** unknown pincodes are deliverable by backend rule, so "not deliverable" cannot occur in the safe setup.

## 7. Framework limitation found

**Back after a refresh (Next.js 16.3.8):**
- **What happens:** after a client-side navigation, a browser refresh, then Back, the router restores the earlier page and then writes the refreshed URL back into the history entry. The address bar stays where it was.
- **Where it was seen:**
  - the doctor-day strip;
  - `/insights` → `/brands` using only the header's standard links.
- **Cause:** no app code touches history; the only router calls are post-sign-in and post-checkout redirects.
- **What works:** plain Back and Forward without a refresh, and refresh itself.
- **Fix:** framework-level. Re-test after a Next.js upgrade; it is not patched in app code.

## 8. External production configuration (backend owner)

1. **Real PhonePe round trip: not verified.**
   - It needs gateway keys, `FRONTEND_URL` set to the public origin, and `PUBLIC_API_URL` for callbacks.
   - Payment-return screens were verified with test mocks in Phase 4.
2. **Production keys in the local `backend/.env`.** It holds production PhonePe and Shiprocket credentials, with shipping mode `auto`, so whoever runs it locally will create real payment pages and courier bookings.
   - Start the backend only from a POSIX shell with the keys set to empty strings.
   - In PowerShell and cmd, an empty assignment *removes* the variable, and dotenv then loads the production keys. This happened once during this phase. The process was stopped within a second, before any request reached it.
3. **The footer's card and UPI marks** assume the gateway is connected.
4. **Real pincode serviceability** requires the Shiprocket configuration.

## 9. Owner decisions

- The **lint errors** in the admin pages, `HeroPlaybackContext` (locked hero) and `tilt-card` were left alone, because those areas are outside this scope.
- **Test data** remains in the local database: 8 "(test)" products, test customers and orders from all phases. Nothing was deleted.

## 10. What genuinely remains

- **Consultation booking:** blocked on the backend contract (§6.2).
- **Prescription upload:** needs a new backend capability (§6.3).
- **`form` on listing cards:** a one-line backend change (§6.4).
- **PhonePe and Shiprocket:** live verification once public URLs and keys are configured (§8).
- **Content:** the admin needs to add doctors, blog posts, reviews and any real coupons.
- **Commit:** Phases 1–6 are uncommitted. Review, then commit when ready.
