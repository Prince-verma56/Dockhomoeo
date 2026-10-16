# DocHomoeo Phase 4: Product Accuracy, Live Content and Storefront Hardening

**Date:** 2026-10-16 · **Branch:** `main` (uncommitted; Phases 1–4 are all uncommitted) · **Scope:** frontend only

## Summary

- **Product identity:** each product now keeps one image from the listing card to the account order page. A browser test verified this for three products across 8 contexts.
- **Product images:** the mislabelled photo map was deleted, and the 8 product image files, which held only 4 distinct photos showing *other* products, were de-duplicated and renamed after what they actually show.
- **Homepage sample content removed:** the demo doctor, placeholder testimonials and invented "Seasonal edit" offer are gone. The doctor, reviews, articles and offer sections now read the shop, and a section is not shown when its source has nothing.
- **Health Insights:** connected to the real blog API, with honest empty states.
- **New `/doctors` page:** a read-only directory on the public doctor endpoint. The homepage and hero "Find a Doctor" links no longer 404.
- **Serviceability and coupons:** states hardened. Payment-return states were verified with test-only mocks.
- **Blocked or owner decisions:** the hero's unconfirmed figures (hero locked), the offer band's background photo, and everything that needs a real PhonePe configuration (§7).

---

## 1. Product images

### Audit
`public/Images/Products/` held 8 files but only **4 distinct images** (by SHA-1). **None** shows the product its name suggests, except one:

| Old file(s) | What the photo actually shows | Now |
|---|---|---|
| `boiron-arnica.webp` | Boiron Arnica Montana 30C tube | `Images/Editorial/arnica-cream-tube.webp` |
| `reckeweg-r41.webp`, `reckeweg-r89.webp` (identical) | "Essential Flora Eucalyptus Radiata" dropper bottle | `Images/Editorial/eucalyptus-dropper-bottle.webp`; duplicate deleted |
| `lords-kali-phos.webp`, `sbl-natrum.webp`, `sbl-calc-carb.webp` (identical) | "Aura Wellness Chamomilla 30C" pellet bottle | `Images/Editorial/chamomilla-pellet-bottle.webp`; 2 duplicates deleted |
| `bakson-arnica-oil.webp`, `schwabe-alfalfa.webp` (identical) | "Aethel Restorative Massage Oil" | `Images/Editorial/massage-oil-bottle.webp`; duplicate deleted |

Moves used `git mv`, so history is kept.

### Mapping fixed
- **Deleted `data/productImagery.ts`.** It paired slugs with those mislabelled photos, for example "SBL Arnica Montana 30C" → the Chamomilla bottle, and it also attached a stock photo to *every* product of a dosage form.
- **Single source per product:** a product's image is now exactly the shop's `imageUrl` for that product, by product, from the API. Without one, the **illustrated pack** is drawn, printed with the product's own name, brand, potency and dosage form.
- **Same pack everywhere:** the illustrated pack replaced the **initials tiles** (e.g. "NM") that cart, checkout, confirmation, order and search thumbnails showed before. `ProductThumb` uses the same form logic as the card (`lib/adapters/product.ts › packFormFromText`), so a product draws the same pack on its card and in the cart. `ProductMedia`, `data/mock/products.ts` and `ProductPackshot` no longer refer to the deleted map.
- **Mood images only:** the four remaining photos are used only as **editorial mood images** for form collections and health-concern cards (`data/media.ts`, documented as such). They are never attached to a product, a card, the cart or an order.

### Verified identity (browser test, §5)
For a product with its own uploaded photo, a tablet pack and a two-pack dropper, the **same image signature** (photo URL, or pack form + printed label) appears in all of these:
- the `/products` card and the product page;
- the add-to-cart **flight clone**;
- the **drawer thumbnail** (hidden while the flight is in the air, revealed on landing);
- the `/cart` page and checkout summary;
- the order confirmation and the account order page.

No image anywhere loads from the old folder, and no image request failed at any of the five widths.

## 2. Content: sources and what replaced the samples

The backend contract was checked first (`backend/src/modules/shop.routes.ts`, `care.routes.ts`).

| Section | Was | Real source | Now |
|---|---|---|---|
| Health Insights pages + homepage band | 3 local drafts (`LocalInsightRepository`) | `GET /api/shop/blog`, `/blog/:slug` | `ApiInsightRepository`. Max page size 50 respected. `seo.path` rewritten to `/insights/:slug`, and the shop's SEO title used once. Related articles come from the same category. Empty blog: `/insights` says "No articles have been published yet", and the homepage band is hidden. Old sample URLs now 404. |
| Doctor consultation | "Dr. A. Demo", rating 4.8 (1200), "Today, 5:30 PM", ₹499, "50+ Certified doctors", "Online" badge, `/book/d-001` (404) | `GET /api/care/doctors`, `/doctors/:slug/next-slot` | Real first doctor: name, qualification, specialization, rating **only if rated**, next free slot in IST, lowest fee. The count bubble shows the real count and is hidden at 0. With no doctors: "Consultations are opening soon", with nothing invented. "Chat" removed (the backend books VIDEO/AUDIO only). "How it works" now goes to the on-page `#how-it-works`. |
| `/doctors` (**new**) | 404 (linked from hero and homepage) | `GET /api/care/doctors?q=` | Read-only directory: real profiles and fees, search by name, specialization or language (the backend's `q`), and empty and no-match states. States plainly that **online booking is not open yet**: no booking button. |
| Testimonials | "Sample Reviewer" ×4 | No testimonials endpoint; **approved product reviews** come with each product page | The newest approved reviews of the rail products, each linking to the product reviewed ("On …"). Verified-buyer badge only when the backend says so. Hidden when there are none (today: none). |
| Offer banner | "The Seasonal Wellness Edit" → `?collection=seasonal` (the backend ignores that parameter) | No public promotions source; the catalogue's discounts | "Save up to N%" with N = the catalogue's top discount, and "M remedies at least 10% below MRP" from the discount facet. Links to `/products?discount=10&sort=discount`. Benefits are now promises the shop keeps (maker named, pincode check, prices re-checked at checkout). Hidden if nothing is discounted. |
| Product data on the homepage | — | `GET /api/shop/home` | Unchanged since Phase 2+3; still live. |
| Homepage notice | "Sample content: doctor, testimonials, articles, offers…" | — | Now names only what is still unconfirmed: the **hero's** "10,000+ Happy Families", stock portraits and "4.8 App Rating" (§7). |

The obsolete sample exports were removed from `data/mock/home.ts`: `featuredDoctor`, `testimonials`, `offerCampaign`, `bestsellingProducts`, `productFilters`, `heroStats`, `heroTrustPoints` and `consultationCapabilities`. So they can't be re-rendered by accident. The hero was **not modified**: `sections/home/HomeHero.tsx` is untouched, and the video was verified present.

## 3. Serviceability, coupons and payment

| Area | Finding | Change |
|---|---|---|
| Pincode check (product page) | Said "Delivers to …" even when the backend only treats an unknown pincode as deliverable (no city, no ETA); generic error text | Says the delivery time is confirmed when the order ships unless the shop gave one; shows the backend's own error message |
| Pincode at checkout | A failed check could not be retried without retyping | "Check again" button |
| Coupon | If the quote failed while a code was entered, the field stayed on "Checking with the shop…" forever | Shows "We couldn't check this code… Try again" (retries the quote) |
| Coupon refusal | Already correct: the backend's `couponError` is shown verbatim and the total is unchanged | Verified live |
| Quote, totals, price drift, invalid cart lines | Already server-driven (Phase 2+3) | Re-verified by the regression suite |
| Payment return (`/patient/orders/:id?payment=`) | Phase 2+3 implementation | Verified states (test-only mocks, §5): failed → banner + "Pay ₹X now" → **one** `/pay` call → gateway URL; pending → "being confirmed", no pay button; gateway down (501) → backend message, stays on the order; a paid order ignores a "failed" word in the URL |

**Test data:** no coupon codes were invented and no database rows were created for this phase. The database still has 0 coupons, 0 blog posts, 0 doctors and 0 product reviews.

## 4. Files

**Created**
- `app/doctors/page.tsx`
- `types/api/care.ts`
- `public/Images/Editorial/` (4 renamed photos)

**Deleted**
- `data/productImagery.ts`
- 4 duplicate images in `public/Images/Products/`; the folder is now empty and gone

**Modified**

| Area | Files |
|---|---|
| Repositories and types | `lib/repositories/api.ts` (`ApiInsightRepository`, `ApiCareRepository`), `lib/repositories/interfaces.ts` (`ICareRepository`), `lib/repositories/index.ts` (insight live, `care` added, `usingMockInsights` removed), `lib/repositories/local.ts` (type fix), `types/api/insight.ts` |
| Homepage | `app/page.tsx`, `sections/home/DoctorConsultation.tsx`, `sections/home/Testimonials.tsx`, `sections/home/HealthInsights.tsx`, `sections/home/OfferBanner.tsx`, `components/shared/DemoContentNotice.tsx` |
| Insights | `app/insights/page.tsx`, `app/insights/[slug]/page.tsx` |
| Images | `components/commerce/ProductMedia.tsx`, `ProductThumb.tsx`, `ProductPackshot.tsx` (comment), `CartDrawer.tsx`; `sections/cart/CartView.tsx`; `sections/checkout/CheckoutView.tsx`, `OrderConfirmationView.tsx`; `app/account/orders/page.tsx`, `app/account/orders/[id]/page.tsx`; `data/media.ts`, `data/mock/home.ts`, `data/mock/products.ts` |
| Serviceability and coupons | `components/commerce/PincodeCheck.tsx`, `sections/checkout/CheckoutView.tsx`, `sections/cart/CouponField.tsx` |

**Not modified:** anything under `backend/` (git shows no tracked change), any database schema or migration, backend configuration, `docohomo-prince/`, and `sections/home/HomeHero.tsx`.

## 5. Tests and results

**Setup:**
- **Backend:** run locally in **safe test mode**. Process env vars only: `OTP_DEV_CODE`, `PAYMENTS_TEST_MODE=true`, and blank PhonePe, Shiprocket and legacy Mongo keys. `backend/.env` is untouched.
- **Frontend:** `next build` + `next start`.
- **Browser:** Playwright Chromium from the npx cache (not installed in the project).
- **Database after all runs:** payments are `TEST` only, with 0 shipments.

| Check | Result |
|---|---|
| `tsc --noEmit` | Pass |
| ESLint (all touched files) | 0 errors; the 10 warnings are pre-existing (`<img>` in hero/background, one unused var) |
| `next build` | Pass; `/doctors`, `/insights`, `/insights/[slug]` and `/` are request-time (`ƒ`) |
| **Phase 4 browser suite** (live backend) | **110/110** |
| Populated-state rendering (test-only fixture proxy) | **19/19** |
| Phase 2+3 browser suite (regression) | **67/67** |
| Phase 1 browser suite (regression) | **55/55** |
| Phase 1 API contract test (regression) | **44/44** |

**The Phase 4 suite covered:**
- **Homepage content:** no sample doctor, reviewer, offer or count. Every section matches its API, and the empty sections are hidden. The offer percentage equals the live top discount, and its link lists exactly the discounted products.
- **Hero:** the video is present.
- **Empty states:** `/doctors` (with backend search) and `/insights`; old sample article URLs → 404.
- **Image identity:** the full 8-context check described in §1.
- **Coupons:** the backend's refusal text with the total unchanged; the unreachable-shop state, then retry.
- **Pincodes:** validation; no invented delivery time; the backend's error text; checkout "Check again" recovers.
- **Order:** a real order appears in the account list and detail.
- **Payment-return states:** all those listed in §3.
- **Five widths** (1440, 1024, 768, 390, 375 px): no horizontal overflow, broken images or failed image requests on 8 routes.
- **Keyboard:** the pincode check works with Enter, and the doctor search shows a focus ring.

**Test-only mocks.** These were used only where the safe configuration cannot produce a state:
1. **Payment states:** Playwright route mocks of `GET /api/me/orders/:id` (an unpaid online order) and `POST …/pay` (a gateway URL or a 501). Test mode pays orders at once, and gateway mode would call real PhonePe.
2. **Populated sections:** a local proxy (`:4100`) that forwards everything to the real backend but answers doctors, blog posts and one product's reviews with fixtures in the backend's exact shapes. Rendered through a second `next start` whose server fetches use it.
   - **What it verified:** the populated doctor card (rating only when rated, IST slot, "From" lowest fee), the count bubble, reviews linking to their product, the insights band and pages, topic filter, related articles, and the SEO title used once.
   - **Security check:** a `<script>` inside post content is neither run nor shown.
   - **Limits:** the app never uses the proxy, and no fixture reached the database.

Screenshots were reviewed for the consultation section, the offer band and the bestsellers at all five widths, plus the populated doctor card, review spread, doctor directory and article.

## 6. Mock data in live mode

None. `usingMockData = false`, and every storefront repository, including Insights, is the API implementation. The development catalogue remains in `lib/repositories/local.ts` for explicit offline use and is not wired. `data/mock/home.ts` now holds only design content: form-collection artwork and taglines, journey steps, health-goal illustrations, and footer and nav data.

## 7. Remaining items needing the owner or the backend developer

1. **Hero figures (hero locked, so not changed).** "10,000+ Happy Families" with three Unsplash portraits, and "4.8 App Rating" (no app exists), have no data behind them. They are labelled by the homepage notice. Supply real figures or approve removing them.
2. **Offer band background (`/Images/SeasonalEditBG.webp`).** It shows a "DocHomoeo Immunity Support" bottle that is not in the catalogue, next to a real "Save up to N%" offer. Recommend replacing it with an unbranded scene (e.g. `NaturesCareBG.webp`); this is a design decision. The same image is the Tinctures collection artwork.
3. **Real PhonePe round trip: not verified.** It needs gateway keys plus `FRONTEND_URL` equal to the public origin and `PUBLIC_API_URL` for callbacks. The backend `.env` still holds **production** PhonePe and Shiprocket credentials with shipping mode `auto`, so whoever runs it locally will create real pay pages and courier bookings.
4. **No coupons in the database.** A successful coupon could not be tested without creating one (not allowed). The refusal path is verified.
5. **Serviceability without Shiprocket.** Unknown pincodes are deliverable by backend rule; the "not deliverable" answer could not occur live.
6. **No doctors, reviews or blog posts yet.** Those sections are correct but hidden or empty until the admin adds content. Populated rendering is verified only with the fixture proxy.
7. **Listing cards lack `form`** (`toCard`). Pack drawings are inferred from names, so a real product whose name and pack don't state the form could draw a different pack on its card than on its page (which has `form`). Adding `form` to `toCard` fixes it at the source.
8. **Consultation booking** (`/book`, slots, payment) is a later phase. `/doctors` says booking is not open yet.
9. **Unused legacy components** (`components/doctors/DoctorCard.tsx`, `DoctorProfileMini.tsx`, `components/navigation/UtilityBar.tsx`) are unrendered. They still hold old `/book` links and an unverified "Free shipping over ₹500" line; they should be removed or rewired before anyone renders them.
10. **The footer's "We accept Visa / Mastercard / Amex / UPI"** depends on the gateway being connected.
11. **Test data** remains in the local development database (8 test products, test customers and orders from all phases). Nothing was deleted.
