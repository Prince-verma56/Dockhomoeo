# Frontend-Backend Handoff Guide

This document outlines the architecture established for the frontend to safely and cleanly integrate with the existing backend APIs without requiring massive UI rewrites. 

## 1. Repository Interfaces
The frontend relies entirely on repository abstractions to fetch data. The UI components **never** fetch data directly, nor do they know whether data is local or remote.
The interfaces are defined in `frontend/lib/repositories/interfaces.ts`:
- **`IHomeRepository`** (`getHomeData`)
- **`IProductRepository`** (`getBySlug`, `getRelated`)
- **`ISearchRepository`** (`search`, `suggest`)
- **`ICartRepository`** (`getQuote`, `checkout`)

## 2. Current Implementation
Currently, the frontend is injected with local, offline implementations that read from `frontend/data/mock/products.ts`:
- `LocalHomeRepository`
- `LocalProductRepository`
- `LocalSearchRepository`
- `LocalCartRepository`

These are exported in `frontend/lib/repositories/index.ts` via the `repositories` object.

## 3. Future Implementation (Backend Integration)
When it is time to connect the frontend to the backend, the backend developer should:
1. Create a `.env` variable `NEXT_PUBLIC_API_URL` mapping to the Express/Prisma backend.
2. Implement new classes in `lib/repositories/api.ts` (e.g., `ApiHomeRepository`, `ApiProductRepository`) that implement the exact same interfaces using `fetch()` or `axios`.
3. Update `lib/repositories/index.ts` to export instances of the `Api*` classes instead of the `Local*` classes.
4. **Delete** `data/mock/products.ts` and the `Local*` classes.

**The UI will seamlessly transition to live data without any component rewrites.**

## 4. Expected Backend Types and Structures
The frontend types in `types/api/*.ts` have been exactly modeled after the backend's `shop.routes.ts` schemas.
- **Product Slug Usage**: URLs like `/product/[slug]` map to `ProductRepository.getBySlug(slug)` which expects to call `GET /api/shop/products/:slug`.
- **Variant ID Usage**: Adding to cart requires `variantId`, not `productId`. The UI will send this via the `ICartRepository.getQuote` method.
- **Search Filters**: The `ISearchRepository.search` function accepts `ApiSearchFilters` which directly matches the query parameters for `GET /api/shop/products` (`q, category, brand, form, minPrice`, etc.).
- **Pagination**: The search response handles `total, page, pageSize, pageCount` which the UI relies on for its pagination components.
- **Quote Structure**: `POST /api/shop/quote` matches `ApiQuote`.
- **Checkout Structure**: `POST /api/me/checkout` matches `ApiCheckoutPayload`.

## 5. View Models and Adapters
Since the UI needs specific presentation formatting (e.g., `displayPrice` as "₹849", `discountBadge` as "15% OFF", or fallback placeholder images), we use Adapters.
- `frontend/lib/adapters/product.ts` contains functions like `mapProductCardToViewModel`.
- Backend responses are piped through these adapters inside the UI components or page files, decoupling the exact JSON shape from the React component props.

## 6. Phase 5 Requirements for Backend Hookup
The following UI flows are currently implemented entirely in the frontend using local mock repositories. When replacing them with actual backend connections, ensure these specific endpoints are wired correctly in your `Api*Repository` implementations:

### Product Listing, Filters, and Sorting (`/products`)
- Powered by `ISearchRepository.search(filters)`.
- The UI sends filters (`q`, `sort`, `page`, etc.) and expects an `ApiProductListingResponse`.
- The backend `GET /api/shop/products` endpoint must provide the correct `items` array, pagination metadata (`total`, `pageCount`), and crucially, the `facets` object which powers the filter UI (brands, forms).

### Global Search & Suggestions (`/search` & Search Overlay)
- **Live Search Overlay:** Uses `ISearchRepository.suggest(query)`. Must hook into `GET /api/shop/suggest?q=...` to return quick product and category matches without a full catalog query.
- **Search Results Page:** Uses `ISearchRepository.search(filters)` passing `q=query`.

### Product Detail Page (`/product/[slug]`)
- Powered by `IProductRepository.getBySlug(slug)`.
- The UI handles the layout (Hero, Accordions, Reviews, Ingredients), relying strictly on `ApiProductDetail`.
- **Variants:** Variant selection is handled entirely client-side. The UI tracks `selectedVariantId` from the `product.variants` array. It expects accurate pricing, MRP, and discount calculations directly on the variant objects.
- **Related Products:** Currently falls back to generic array processing. Must hook into `IProductRepository.getRelated(productId)` referencing `GET /api/shop/products/:id/related`.

### Cart Entry Point
- The "Add to Cart" interactions are currently local. They expect to interact with `ICartRepository.getQuote` and `ICartRepository.checkout`.
- The backend developer needs to implement these repository methods to actually sync cart state with the backend via `POST /api/shop/quote`.

## 7. Assumptions and Missing Information
- **Auth**: The `IAuthRepository` is omitted for now, but OTP auth (`/api/auth`) will need to be implemented following a similar repository pattern.
- **Cookies/Session**: The future `Api*` repositories must pass `credentials: 'include'` in their fetch calls to ensure the wholesale session works seamlessly.
- **Images**: Local mock data uses `/images/products/*`. Real backend URLs (e.g., `/uploads/...`) will be passed directly; the adapters will handle appending the base URL if necessary.

## 8. Phase 5 Requirements: Cart, Quote & Checkout
This phase implements the frontend Cart Domain Model, Quote generation, and Checkout process entirely offline, ready for backend injection.

### Cart
- **Required Data**: The UI relies on `items` tracked in a React Context (`CartProvider`). Each item requires `variantId` and `quantity`.
- **Repository Methods**: While items are tracked locally, the total/subtotal calculations always rely on `ICartRepository.getQuote`.

### Quote
- **Request Structure**: `ApiQuoteInput` (`{ lines: { variantId, quantity }[], couponCode, paymentMethod }`).
- **Response Structure**: `ApiQuote`. It must return fully calculated lines, subtotals, savings, shipping charges, and a grand total.
- **Implementation**: The UI calls `getQuote` implicitly as cart contents change to ensure accurate display of pricing and savings.

### Checkout
- **Required Information**: `fullName`, `phone`, `email` (currently local form state), `line1`, `landmark`, `city`, `state`, `pincode`, and `paymentMethod` (e.g., `"COD"`, `"ONLINE"`).
- **Request Structure**: `ApiCheckoutPayload`.

### Order
- **Expected Response**: `ApiCheckoutResponse` containing `orderNumber`, `total`, `paid`, and optionally `payUrl`.

### Integration Point
- **Where to Replace**: `lib/repositories/index.ts`.
- **Details**: The `LocalCartRepository` (which currently manages `getQuote` and `checkout` mocks) will need to be replaced by an `ApiCartRepository` connecting to `/api/shop/quote` and `/api/me/checkout`. 
- **NOTE**: The UI is designed such that swapping these implementations in `repositories.cart` will automatically wire up the Cart Drawer, Cart Page, Checkout Page, and Order Success views without any UI modifications.
