# Phase 16 — Storefront UI/UX refinement

Date: 2026-10-15 · Branch: `integrate/backend-and-admin` · Scope: the root frontend only. No backend, Prisma, database or reference-repo files were touched, no API calls were added, and every repository is still the `Local*` implementation (`usingMockData = true`).

Everything marked **Verified** below was checked in a running browser (headless Chrome driving the dev server), not just by compiling.

---

## 1. What the audit found

| Area | Finding |
|---|---|
| Product images | `public/Images/Products` holds **4 distinct photos** (the other 4 files are byte copies). Each shows a *labelled* pack: "Eucalyptus Radiata" drops, a Boiron "Arnica Montana 30C" tube, "Chamomilla 30C" pellets, an "Arnica & Rosehip" massage oil. 24 of 25 products displayed one of them, so e.g. *Arnica Montana 30C* showed a bottle reading *Eucalyptus Radiata*. |
| Listing | `/products` (`ShopView`) and `/search` + brand pages (`ProductResults`) were two separate implementations of filters, chips and pagination. Only category, brand and form were filterable, even though the contract supports more. |
| Cart sheet | `CartDrawer` was a hand-rolled modal, not the shadcn `Sheet` (no focus trap, manual scroll lock). |
| Product page | `dangerouslySetInnerHTML` on five fields. Mock data had invented copy for every product: identical "Take 5 drops in water 3 times a day" directions (including creams and tablets), "General indications…", "India" as the origin for German and French makers. It also showed unverifiable "100% Authentic" / "Fast Delivery" badges, "verified ratings", and a brand link with a wrong slug (`dr. reckeweg`). |
| Orders | `/account/orders` linked to `/account/orders/1`, but `getOrderById("1")` only matched `"ord_1"`, so the detail page always bounced back. Orders placed at checkout never appeared in the account. |
| Homepage data | The bestseller row used its own copies of catalogue products with different brands and prices (e.g. Digestive Care Drops at ₹235 by "DOC HOMEO" on the homepage vs ₹220 by Dr. Reckeweg in the shop and cart quote). |
| Insights | Article body used `dangerouslySetInnerHTML`. The topic breadcrumb linked by display name instead of slug, and the "Explore remedies" CTA could land on an empty listing. |
| Brands | Product photos stood in for brand logos. The featured grid had uneven 2+1 widths. |
| Assets | 4 duplicate product photos, 3 `.jpg` copies of the journal images, and an unused 6 MB `HeroVideo.mp4`. The journal `.webp` files were really ~870 KB JPEGs. |

---

## 2. Product imagery (Priority 2)

- **`data/productImagery.ts`** is the single map from product slug to photograph. A photo is attached only when the remedy and dosage form on its label are the product's own. Today that is one product: *Arnica Massage Oil* (the label's maker differs, so it is documented as representative until the manufacturer's packshot arrives).
- **`components/commerce/ProductPackshot.tsx`** is the deliberate fallback. It draws a container for the dosage form (dropper bottle, taller tincture bottle, pellet jar, standing tube, oil bottle) on a form-tinted studio backdrop and prints the product's **own** brand, name and potency on the label, e.g. "SBL · Arnica Montana · 30C". It is sized in container units, so the same markup works as a PDP hero, a grid card, a landscape homepage card and a 48px cart thumbnail (where the label type steps aside for rules).
- **`ProductMedia`** shows a photo when the data has one, otherwise the pack. It also falls back to the pack if a photo fails to load, so a frame is never blank or broken.
- **`ProductThumb`** gives the cart sheet, cart page, checkout, confirmation, account orders and search suggestions the same treatment. It shows a typographic tile when the form is unknown.
- When the shop API supplies `imageUrl`, that photo is used unchanged; the map only serves local data.

**Verified:** `/products?form=drops` shows 8 drops, each with its own name and potency on the label and no repeated photographs. The brand facet counts are SBL 3, Dr. Reckeweg 3, Schwabe 2.

---

## 3. Shop layout and filters (Priority 1)

- **One catalogue** (`sections/listing/ProductResults.tsx`) now serves `/products`, `/search` and `/brands/[slug]`. `ShopView` only adds a contextual header: breadcrumb, a title from the category, form or query, a description worded from the listing's own facets, and form shortcuts.
- **Filters** (`sections/search/SearchFilters.tsx`) use shadcn `Accordion`, `Checkbox` and a new `Slider` (`components/ui/slider.tsx`, built on the Radix primitive already in `radix-ui`, so no new dependency):
  - category, brand, form, price range, potency, pack size, discount, rating and availability;
  - each group appears only when the facets give it options;
  - each group shows its selected count;
  - a chosen value the facets no longer list stays visible, so it can be unticked.
- **Facets in the local repository** mirror `backend/src/modules/shop.routes.ts`: each group is checked independently, counts exclude only the group's own filter, and the price bands, discount steps (10/20/30/40) and rating steps (4/3) match. Sorting also matches, with "relevance" meaning "popular" when nothing is typed. Potency and pack data were added to the mock products, taken from each product's own name and variant text.
- **URL state** (`lib/search/searchState.ts`) parses and writes all filters with the backend's parameter names (`potency`, `pack`, `minPrice`, `maxPrice`, `discount`, `rating`, `inStock`). There is one parser, one serializer and one `filtersOf()`. `SORT_OPTIONS` adds "Biggest saving" and "Top rated", which the backend supports.
- **Desktop:** the sidebar sticks below the header, is capped to the viewport and scrolls internally (`data-lenis-prevent`). The toolbar has the result count (live region) and a shadcn `Select` for sort. There is a removable chip for every active filter type, an aligned 2/3/4-column grid with two-line name reservation, pagination with "Page X of Y", and an empty state that offers to remove individual filters.
- **Tablet and phone:** a sticky bar with a Filters sheet (staged choices, active count, Clear all, Show results) and a native sort picker.

**Verified:**
- Combined filters work, e.g. `?category=immunity&minPrice=100&rating=4`.
- Sorting and pagination update the results (25 products give 2 pages of 24).
- The mobile sheet applies `brand=lords&form=tablets` and returns 3 products, with focus kept inside the sheet.

---

## 4. Animated add to cart (Priority 3)

- **`lib/cart/flyToCart.ts`** handles the flight:
  - It clones the clicked product's media node (`[data-product-media]`) into an inert, `aria-hidden`, fixed-position copy on `<body>`; the original is never moved.
  - The copy lifts slightly while the sheet slides in.
  - It waits for the sheet's line thumbnail (`[data-cart-thumb]`) to mount and for the sheet's enter animation to finish, then measures it.
  - It flies along one quadratic arc (a lifted control point, left to right) with GSAP (`power3.inOut`, 0.62s), shrinking to the thumbnail's size with at most 4° of tilt.
  - It cross-fades into the real thumbnail, which settles with a small `back.out` pulse.
  - Every wait also ends on cancel, every tween is killed in cleanup, and if the sheet closes mid-flight the copy dissolves where it is.
- **`CartProvider.addItem(item, { source })`**:
  - updates the cart store exactly once, before any animation;
  - opens the sheet and announces the add in a polite live region;
  - absorbs repeat clicks on the same pack while its flight runs;
  - cancels a previous flight when a new one starts;
  - skips the flight entirely under `prefers-reduced-motion`.
- **`CartDrawer`** is rebuilt on the shadcn `Sheet`. It reads all figures from `lib/cart/cartView` (as the cart and checkout pages do) and uses `QuantityStepper` with the quote's bounds.
- The flight is wired into the product card (grid, homepage rows, related rail, favourites) and the PDP's Add to cart, which flies from the gallery image.

**Verified (path sampled every animation frame):**
- The copy starts at the card centre (755, 583, width 223px), arcs up to y = 124 (above the target), and lands exactly on the thumbnail centre (1086, 155) at its 80px width.
- Total ≈ 1.1s; the copy is removed afterwards and the thumbnail is visible.
- A rapid triple click added one line, not three.
- PDP quantity 2, then a related-card add, gave the correct lines and a ₹665 sheet total, and the cart persisted across reload.
- Under reduced motion no copy was created and the cart updated immediately.
- No console errors.

---

## 5. Product page (Priority 4)

`sections/product/ProductDetailView.tsx`:

- **Gallery:** sticky on desktop, with photo or pack and thumbnails when there are several images.
- **Purchase panel:**
  - brand and form links, title and rating;
  - price, MRP and saving;
  - availability from `inStock` / `stockLeft`;
  - a pack selector when there are several variants;
  - quantity within `min/maxQuantity`;
  - Add to cart with the flight, and favourites.
- **`PincodeCheck`** uses the serviceability repository and reports only what the shop answers.
- **Product details:** a table built from contract fields only (brand, manufacturer, form, potency, pack size, SKU, origin when present).
- **Copy sections** (description, composition, indications, directions, safety) render through `SafeRichText` in an accordion, only when the data supplies them.
- A short practitioner note, which mirrors existing site copy.
- Related products show as a grid titled "You may also consider" (previously the fabricated "Frequently bought together").

The local repository now returns `null` for copy it does not have, instead of invented medical text. Variant ids use the same scheme as listing cards, and related products follow the backend's rule (same category first).

---

## 6. Discovery pages (Priority 5)

- **Brands:**
  - Every brand card shows the logo when the data has one, otherwise the typographic `BrandMark` monogram; product photos are never used as logos.
  - The featured row is an even three columns.
  - `getBrandDirectory` no longer runs an extra search per brand just to collect thumbnails.
- **Categories:** checked; it renders correctly with distinct category art, and its product rail now shows correct packs.
- **Health-concern categories** (e.g. `?category=immunity`) show their proper name in the filter group and as the page title.

## 7. Health Insights (Priority 6)

- The article page has:
  - an editorial header (topic eyebrow, scaled title, excerpt, author and date when present, reading time counted from the text);
  - a cover image;
  - a 42rem reading column rendered by `SafeRichText`;
  - a note that insights are general reading, not medical advice;
  - back navigation and a "Keep reading" grid.
- The topic links use the category slug.
- The remedies CTA links to the product category only when it has products, and otherwise to `/categories`.
- The listing page was already structured (featured article, topic chips, grid) and was left as is.

## 8. Other routes and controls (Priorities 7–8)

- **Account orders** (see §9). The empty "Tracking" card and a non-functional "Invoice" button were removed.
- **Cart, checkout and confirmation** thumbnails use `ProductThumb`.
- **Global CSS:** actionable elements get `cursor: pointer` and disabled ones `not-allowed`; utilities still override.
- **Small fixes:**
  - The product card's Add button is genuinely disabled when a card has no pack.
  - Pagination's unavailable steps are marked `aria-disabled`.
  - The `/about` hero image loads eagerly, since it is the mobile LCP.
  - `/account/orders` no longer overflows at 768px.
- **Homepage:** composition, section order, the hero video (`HeroVideo2.mp4`, verified `playbackRate === 2`) and the first-visit/revisit timeline are untouched. Only the bestseller data source changed (§9).

## 9. Data integrity and audit risks (Priority 9)

| Risk | Status |
|---|---|
| Homepage vs shop vs cart data | **Fixed.** `bestsellingProducts` is now a slug selection from `mockProducts` (same ids, brands, prices, images and variant ids). The section component was not changed. |
| Checkout ↔ account orders | **Fixed and verified.** One order store in `LocalCartRepository` (sample order `DH-1001` priced from the catalogue, plus previews kept in `sessionStorage`) serves `getOrder`, `getOrders` and `getOrderById`. The order detail page reads `ApiOrderDetail` (GET `/me/orders/:id`). Verified flow: place an order → `/thankyou?order=2` → reload → listed in `/account/orders` → the detail shows the same lines and ₹495 total. `/account/orders/1` opens. |
| Unsafe HTML | **Fixed.** `components/shared/SafeRichText.tsx` tokenises markup into an allowlist of React elements. Scripts, styles, iframes, handlers and `javascript:` URLs are dropped (tested with an injection sample). The only remaining `dangerouslySetInnerHTML` uses are the static pre-paint gate script and JSON-LD built with `<` escaped. **Backend requirement:** sanitise product and blog HTML on write as well; the display layer is the second line, not the only one. |
| Prescriptions | The backend accepts an optional numeric `prescriptionId` on `POST /me/checkout` (ISSUED prescriptions only) and has **no upload endpoint**. `ApiCheckoutPayload.prescriptionId?: number` already matches. The checkout UI does not offer selection. `LocalPrescriptionRepository` uses string ids (`rx_1`), which must become numeric before selection is wired. No upload flow was invented. |
| Homepage repository bypass | Homepage sections still import static data directly. The data now agrees with the catalogue; moving them onto `repositories.home` was left out to avoid a broad refactor of locked sections. |
| Duplicate assets | **Removed** (all with zero references): `reckeweg-r89`, `sbl-calc-carb`, `sbl-natrum`, `schwabe-alfalfa`, `journal_*.jpg`, `Videos/HeroVideo.mp4`. The journal `.webp` files were re-encoded as real WebP (870 KB → 106–143 KB, same 1200×896). **Kept but unreferenced** (distinct, not duplicates, so left for a design decision): `NaturalWellBG`, `NaturesCareBG`, `TestimonialsBg`, `TestimonialsBg2`, and the create-next-app SVGs. |
| Console | No errors on any storefront route at any tested width. The 404 routes log the document's legitimate 404. `/product/<unknown>` logs React's dev-only "Encountered a script tag" notice. It comes from the root layout's pre-paint motion-gate script when a dynamic route calls `notFound()`; the script has already run from the server HTML. It was left as is because `next/script` `beforeInteractive` does not guarantee pre-paint execution, which the locked homepage depends on. |

## 10. Accessibility and responsive checks

- **Overflow sweep:** 29 routes × 5 widths (1440, 1024, 768, 390, 375). No horizontal overflow (after the orders fix) and no broken images.
- **Sheets:** both cart and filter sheets are Radix dialogs (focus moved in and trapped, Escape closes, labelled title and description). The cart sheet is full-width on phones.
- **Filter controls:** native radios, Radix checkboxes, `aria-pressed` potency toggles, and labelled slider thumbs ("Minimum price", "Maximum price").
- **Live regions:** result counts, add-to-cart announcements, sheet totals and pincode results.
- **Images:** the illustrated pack has an accessible name ("{name}, illustrated pack"); decorative thumbnails are `aria-hidden` beside visible names.

## 11. Build and lint

- `npx tsc --noEmit`: **pass**.
- `npm run build` (Next 16.3.8, Turbopack): **pass**, 33 routes.
- `npx eslint`:
  - **0 errors in changed or new files.**
  - 12 pre-existing errors remain in `app/admin/*` and `hooks/use-admin-session.ts` (`set-state-in-effect`, `no-explicit-any`). These are outside this phase's storefront scope and were not touched.
  - Warnings are pre-existing (`<img>` in homepage sections, unused admin imports, one unused mock parameter).

## 12. Limitations

- Only one catalogue product has a matching photograph. The rest use the illustrated pack until real packshots are supplied. Adding one is a single entry in `data/productImagery.ts`, and API data needs no change.
- Product copy sections are empty in local data by design; they will fill from the shop API.
- Preview orders live in this tab's `sessionStorage` and are never sent anywhere.
- Flight timing was measured in headless Chrome. It should be watched once on a real device, as feel is subjective.

## 13. Files

**New**
- `data/productImagery.ts`
- `components/commerce/ProductPackshot.tsx`
- `components/commerce/ProductThumb.tsx`
- `components/commerce/PincodeCheck.tsx`
- `components/shared/SafeRichText.tsx`
- `components/ui/slider.tsx`
- `lib/cart/flyToCart.ts`

**Modified**
- `app/about/page.tsx`
- `app/account/orders/page.tsx`
- `app/account/orders/[id]/page.tsx`
- `app/brands/page.tsx`
- `app/brands/[slug]/page.tsx`
- `app/globals.css`
- `app/insights/[slug]/page.tsx`
- `app/product/[slug]/page.tsx`
- `app/products/page.tsx`
- `components/commerce/{BrandCard,CartDrawer,ProductCard,ProductMedia}.tsx`
- `components/providers/CartProvider.tsx`
- `components/search/{GlobalSearch,SearchCombobox}.tsx`
- `data/mock/{home,products}.ts`
- `lib/cart/{cartStore,cartView}.ts`
- `lib/catalogue.ts`
- `lib/repositories/local.ts`
- `lib/search/searchState.ts`
- `sections/brands/BrandDirectory.tsx`
- `sections/cart/CartView.tsx`
- `sections/checkout/{CheckoutView,OrderConfirmationView}.tsx`
- `sections/listing/ProductResults.tsx`
- `sections/product/ProductDetailView.tsx`
- `sections/search/SearchFilters.tsx`
- `sections/shop/ShopView.tsx`
- `types/product.ts`
- `public/Images/journal_*.webp` (re-encoded)

**Deleted**
- `public/Images/Products/{reckeweg-r89,sbl-calc-carb,sbl-natrum,schwabe-alfalfa}.webp`
- `public/Images/journal_*.jpg`
- `public/Videos/HeroVideo.mp4`
