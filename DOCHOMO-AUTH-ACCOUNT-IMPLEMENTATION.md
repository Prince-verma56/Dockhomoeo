# DocHomo Auth + Account Foundation

## 1. Authentication Flow
- Created a simulated OTP-based login flow at `/login`.
- The user provides a phone number (step 1).
- The user provides an OTP (step 2). Entering `000000` simulates an error; any other code simulates success.
- Handled via `LocalAuthRepository` (no real backend calls are made).

## 2. Session Architecture
- Established an `AuthProvider` via context API.
- Stores the session state (`token`, `expiresAt`, `user`) in `localStorage` (`dochomoeo_session`).
- Provides `login`, `logout`, and `updateUser` methods to manipulate session state across the app.
- Protected routes use a unified strategy in `app/account/layout.tsx` to detect `status === "unauthenticated"` and redirect to `/login?callbackUrl=...`.

## 3. Account Routes
Implemented the customer dashboard UI using a unified side-navigation layout on desktop and fluid stacking on mobile.
Routes:
- `/account`: Account Overview
- `/account/orders`: Order history listing
- `/account/orders/[id]`: Order detail view
- `/account/addresses`: Saved addresses
- `/account/profile`: Edit profile

## 4. Order & Address Management
- Local static mock data provided by `LocalAccountRepository`.
- **Orders**: Displays order number, status, item count, date, totals, and variants correctly.
- **Addresses**: UI supports setting default address, adding/editing (simulated through local state), and deleting.
- **Profile**: Allows the user to edit `firstName`, `lastName`, and `email`. Changes sync back to the session context.

## 5. Favourites Decision
- Existing wishlist logic relies on `/user/favourites` placeholder.
- Given the instruction to avoid over-engineering outside the scope of Phase 10 unless strictly necessary, we left the wishlist link in the navbar pointing to `/user/favourites` (as per previous phases). Future iterations can integrate favourites into the unified `/account/favourites` structure if desired.

## 6. Repository Interfaces
Defined clear backend boundaries inside `lib/repositories/interfaces.ts`:
- `IAuthRepository`: `requestOtp`, `verifyOtp`, `logout`, `getCurrentUser`.
- `IAccountRepository`: `getProfile`, `updateProfile`, `getAddresses`, `addAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`, `getOrders`, `getOrderById`.
- Provided a `LocalAuthRepository` and `LocalAccountRepository` utilizing memory/delay to simulate network calls without modifying the backend.

## 7. Header/Account Integration
- Updated `SiteHeader.tsx` to utilize `useAuth()`.
- Added an `AccountMenu.tsx` which renders a custom Shadcn dropdown menu containing the user's initial and quick links to Account Overview, Orders, Addresses, and Logout.
- If signed out, it renders the existing "Login / Register" green pill button.

## 8. Backend & Reference Repository Integrity
- **CONFIRMED**: Zero modifications made to `docohomo-prince/angaar-labs/` (nested repo).
- **CONFIRMED**: Zero backend endpoints or database queries added.
- **CONFIRMED**: Zero API/network requests made to external services.
- **CONFIRMED**: The homepage (`/`) remains entirely untouched visually and structurally.

## 9. Future Backend Integration Points
- Replace `LocalAuthRepository` and `LocalAccountRepository` in `lib/repositories/index.ts` with API-backed implementations (e.g., `ApiAuthRepository`).
- Integrate real JWT token validation in Next.js Middleware if SSR protection is desired (currently, the protection is purely client-side within `AuthProvider` & `AccountLayout` to keep it unopinionated for the backend dev).
- When prescriptions become relevant, add `/account/prescriptions` mapping to the backend's patient prescription routes.
