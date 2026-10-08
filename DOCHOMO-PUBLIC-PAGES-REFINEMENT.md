# Phase 9: Public Pages Visual Refinement

## Objective
Rework the existing public discovery and content pages (`/categories`, `/brands`, `/insights`, `/insights/[slug]`, `/about`, `/quality`, `/contact`) to create a more premium, intentional, and high-density experience, moving away from sparse MVPs to a polished brand aesthetic.

## Implementation Details

### 1. Reusable Component Refinements
- **`CategoryCard.tsx`**: Implemented a dual-state design (featured vs standard). Added premium typography, abstract decorative shapes, and smooth hover shadows.
- **`BrandCard.tsx`**: Added an elegant monogram fallback with custom typography, clean borders, subtle background tints, and micro-interactions (like the hover arrow).
- **`InsightCard.tsx`**: Updated with larger, higher-contrast typography, distinct featured layouts (horizontal stack), and refined metadata layouts.

### 2. Layout & Page Adjustments
- **`/categories`**: Added an editorial page header with background blurs. Created a distinct layout hierarchy separating a featured "Highlight Collection", standard "Explore Topics" grid, and a specific "Browse by Form" secondary section.
- **`/brands`**: Structured with a rich hero header. Segregated the content into "Recommended Brands" and an "A-Z Directory", providing better vertical rhythm.
- **`/insights`**: Applied an editorial-style hero section. Added category pills for filtering navigation. Staggered the layout into a featured insight followed by a latest articles grid.
- **`/insights/[slug]`**: Vastly improved reading experience. Added a subtle gradient background to the header, improved image sizing with a unique negative margin overlap (`-mt-8 relative z-20`), optimized reading width, and added a styled author bio section.
- **`/about`, `/quality`, `/contact`**: Adjusted the trust pages to ensure layout consistency. Added subtle box shadows, rounded corners (`rounded-[2rem]`), background shapes, and better hover states on interactive grid items (like the Quality Principles).

## Next Flow Preparation (Phase 10: Auth + Account)

### Audit of Auth/Account Routes
A deep audit of the reference repository (`docohomo-prince/angaar-labs/frontend/app`) reveals that the backend data model heavily segregates user personas:
1. **Admin**: (`/admin/*`)
2. **Doctor**: (`/doctor/login`, `/doctor/register`, `/doctor/(panel)/*`)
3. **Patient/Consumer**: (`/patient/login`, `/patient/(panel)/*`)

### Implementation Plan for DocHomo (Root App)
Since the new `docohomo/` app focuses on the consumer/patient experience, we need to map the consumer routes to our new architecture:

1. **Authentication Flow**:
   - Create `/login` and `/register` public routes.
   - We should use standard JWT or session-based cookies via Next.js Server Actions.
   - (Need to determine exact auth provider based on backend implementation, e.g., NextAuth/Auth.js or custom credentials).

2. **Account Dashboard (`/account/*`)**:
   - Replace `/patient/(panel)` with a cleaner `/account` routing group.
   - **`/account/profile`**: Personal information and settings.
   - **`/account/orders`**: Order history and tracking.
   - **`/account/addresses`**: Managing shipping and billing addresses.
   - **`/account/consultations`** & **`/account/prescriptions`**: Managing telemedicine components (if applicable in the new UI scope).

### Actionable Next Steps
1. **Mock Auth Repository**: Create an `IAuthRepository` and `LocalAuthRepository` to simulate login state without waiting for full backend wiring.
2. **Auth Context/Store**: Set up a lightweight client store (Zustand or Context) and server-side cookie verification for the `(auth)` group.
3. **Build the UI**: Construct the `/login` page and the base layout for `/account`.
