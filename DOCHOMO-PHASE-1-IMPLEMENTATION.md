# DocHomoeo Phase 1: Customer Authentication and Account

**Date:** 2026-10-15 · **Branch:** `main` (uncommitted) · **Base:** `2e055d4`
**Scope:** customer sign-in, registration, session, profile, addresses, and the account area, integrated with the existing backend (`backend/`, Express + Prisma).

Phase 1 is integrated end to end against the real backend. The checks below were run against it. Catalogue, cart and checkout are unchanged and still use the local mocks (`usingMockData = true`), as planned for a later phase.

---

## 1. Routes and journeys

| Route | State | What it does |
|---|---|---|
| `/login` | **Rebuilt** | Two modes. **Mobile code:** number → code → signed in (an unknown number becomes a customer, as the backend does). **Password:** mobile number or email + password. Return-to via `?callbackUrl=` (guarded), "session ended" notice via `?reason=expired`, and a redirect to the destination when already signed in. |
| `/register` | **New** | First name, last name (optional), mobile, email, and an optional password. One code is sent to both mobile and email → `POST /auth/signup` → name saved to the profile → password set if given → `callbackUrl`. |
| `/account` | **Rebuilt** | Overview from `GET /me/overview`: greeting, counts (orders on the way, prescriptions, addresses), unpaid-order to-dos, the last 3 orders. Loading, error-with-retry and empty states. |
| `/account/profile` | **Rebuilt** | Edit first/last name, email, gender, date of birth; the mobile is shown read-only. Saved with `PATCH /me/profile`, then the session is re-read. Separate "Add / Change password" form (`POST /auth/password`). |
| `/account/addresses` | **Rebuilt** | List, add, edit (side sheet; bottom-friendly on phones), make default, delete with inline confirmation. Max 10, as the backend enforces. |
| `/account/orders` | **Now live** | `GET /me/orders`, with all 12 backend statuses labelled, item count, and the tracking number when the backend returns one. |
| `/account/orders/[id]` | **Now live** | `GET /me/orders/:id` through the account repository (it used the mock cart before). Distinct "not found" and "error, retry" states. |
| `/account/prescriptions` | **New, read-only** | `GET /me/prescriptions`: doctor, items, dosage, follow-up, linked orders. Ordering from a prescription is left for the consultation phase. |

Navigation:
- The account sidebar gains Prescriptions and becomes a scrollable chip row on phones, with `aria-current`.
- The header account menu lists every account section and has an accessible name.
- The mobile drawer shows "My account" when signed in.
- The utility bar's broken links are fixed: `/user/orders` → `/account/orders` and `/inquiry` → `/contact`.

The homepage, catalogue, cart and checkout views were not modified.

## 2. Files

**New**
- `app/register/page.tsx`, `app/register/layout.tsx`, `app/login/layout.tsx` (metadata, `noindex`)
- `app/account/prescriptions/page.tsx`
- `components/auth/AuthShell.tsx`: the split brand/form frame used by both auth pages
- `components/auth/OtpStep.tsx`: code entry, verify, 30 s resend cooldown, change number, test-mode notice
- `components/account/AccountStates.tsx`: page header, loading skeleton, error-with-retry, empty state, `StatusPill`
- `components/account/AddressFormSheet.tsx`: add/edit address form in a Radix sheet (focus trap, Esc)
- `components/shared/FormField.tsx`: `TextField`, `SelectField`, `FieldShell`, `FormNotice` (labels, `aria-invalid`, `aria-describedby`, hints, errors)
- `lib/auth/navigation.ts`: `safeCallbackUrl` (open-redirect guard), `loginHref`, mobile/OTP/email rules
- `lib/account/orderStatus.ts`: labels and tones for every backend order and payment status
- `lib/account/addressForm.ts`: address form model and validation mirroring the backend's `addressInput`
- `lib/hooks/useAsyncData.ts`: load / retry / quiet refresh for client pages

**Changed**
- `types/api/auth.ts`, `types/api/account.ts`, `types/api/prescription.ts`: rewritten to the backend's real shapes (numeric ids, `role`, no token, 12 order statuses)
- `lib/repositories/interfaces.ts`: new `IAuthRepository` and `IAccountRepository` contracts
- `lib/repositories/api.ts`: added `ApiAuthRepository`, `ApiAccountRepository`, `ApiPrescriptionRepository`
- `lib/repositories/local.ts`: **removed** `LocalAuthRepository`, `LocalAccountRepository`, `LocalPrescriptionRepository` and their mock data. These domains have no mock path any more (see §4).
- `lib/repositories/index.ts`: auth, account and prescription wired to the API classes
- `lib/api.ts`:
  - `ApiError.fieldErrors` (zod `details` mapped to fields) and `describeError()`
  - readable messages for network failure, 429 and 5xx
  - a session-expired event on any `/api/me` 401
- `components/providers/AuthProvider.tsx`: rewritten for cookie sessions (§3)
- `app/login/page.tsx`, `app/account/*`, `components/navigation/{AccountMenu,MobileNav,UtilityBar}.tsx`

## 3. Authentication and session behaviour

- **Source of truth:** the backend's HTTP-only `dh_user` cookie (7 days, `SameSite=Lax`, `Secure` in production), set and cleared only by the backend. The frontend never stores a token, session, OTP or password: no localStorage, sessionStorage, logs or URLs. The E2E run verifies this.
- **Restore:** `AuthProvider` starts as `loading` (server and hydration), then calls `GET /api/auth/session`. 401 → `unauthenticated`.
- **Keeping in step:**
  - the session is re-read when the tab becomes visible;
  - a `BroadcastChannel("dochomoeo-auth")` message, which carries no data, makes other tabs re-read after sign-in or sign-out.
- **Expiry:** any `/api/me/*` 401 fires `dochomoeo:session-expired`, and a signed-in page then signs out with reason `expired`. The account layout sends the user to `/login?callbackUrl=<here>&reason=expired`, which shows "Your session has ended."
- **Logout:** `POST /api/auth/user-logout`, then state `unauthenticated` with reason `logout`. Account pages go to `/`; the header returns to "Login / Register".
- **Protected routes:** `app/account/layout.tsx` renders nothing private until the session is confirmed, and redirects otherwise. This guard is for the reader only: the backend scopes every `/me` query to the cookie's user and answers 401 without a session. There is no redirect loop: `/login` and `/register` are refused as callbacks, and a signed-in visit to `/login` goes straight to the callback.
- **Open-redirect guard:** `callbackUrl` must be a same-site path. `//host`, `/\host`, absolute URLs, control characters and `/admin*` fall back to `/account`.
- **Panels:** shop requests send no `x-panel` header, so the backend uses the patient cookie. The doctor (`dh_doctor`) and staff (`dh_session`) cookies are separate and untouched. The admin panel's own `api()` 401 redirect is unchanged.
- **Duplicate submissions:** every submit is guarded by a ref plus a disabled button; "resend" has a 30 s cooldown.

## 4. Backend endpoints and contracts used

| Repository method | Endpoint | Notes verified in the backend source and by the tests |
|---|---|---|
| `auth.requestOtp(phone, {email?})` | `POST /api/auth/otp/request` | → `{ ok, testMode }`. 8 requests / 15 min per IP (429 with a message). Staff numbers refused. |
| `auth.verifyOtp(phone, code)` | `POST /api/auth/otp/verify` | → `{ user }`. A new number creates a CUSTOMER. Codes are 4-6 digits, last 10 min, allow 5 tries and are single-use. |
| `auth.signUp({phone,email,code})` | `POST /api/auth/signup` | → `{ user }`, 201. 409 if a doctor owns the number. |
| `auth.passwordLogin(identifier, password)` | `POST /api/auth/password-login` | Phone or email. 401 on mismatch. 20 tries / 15 min. |
| `auth.setPassword(password)` | `POST /api/auth/password` | ≥ 8 characters. |
| `auth.getCurrentUser()` | `GET /api/auth/session` | 401/403 → `null`. |
| `auth.logout()` | `POST /api/auth/user-logout` | |
| `account.getOverview()` | `GET /api/me/overview` | |
| `account.updateProfile(input)` | `PATCH /api/me/profile`, then `GET /api/auth/session` | PATCH answers `{ok}`. `firstName` is required; `""` clears the optional fields. |
| `account.getAddresses()` | `GET /api/me/addresses` | Default first, max 10. |
| `account.addAddress(input)` | `POST /api/me/addresses` | → `{ id }`. The first address becomes the default. |
| `account.updateAddress(id, input)` / `setDefaultAddress(id)` | `PATCH /api/me/addresses/:id` | |
| `account.deleteAddress(id)` | `DELETE /api/me/addresses/:id` | The backend promotes another address when the default is deleted. |
| `account.getOrders()` | `GET /api/me/orders` | Latest 50; `items[]`, `shipments[]`. |
| `account.getOrderById(id)` | `GET /api/me/orders/:id` | 404 → `null`. |
| `prescription.getPrescriptions()` | `GET /api/me/prescriptions` | ISSUED only. |

**Not used (and why):**
- `GET /api/auth/me` and `POST /api/auth/login`: staff only.
- Address `label`: the backend accepts it but its list endpoint never returns it, so it was left out rather than shown inconsistently.

**Mock path:** there is none for these domains. Running without the backend shows the real "We could not reach DocHomoeo" error and a signed-out header; nothing pretends to persist.

## 5. Tests and actual results

**Environment:**
- Backend: run locally from `backend/` (`tsx src/server.ts`) against its configured database `dochomoeo_v2` on `127.0.0.1:5433` (migrated; it held only the admin user beforehand).
- `OTP_DEV_CODE` was passed as a **process environment variable for the test run only**; `backend/.env` was not edited.
- Frontend: `next build` + `next start -p 3100` with `API_URL=http://localhost:4000`, so all browser traffic went through the same `/api` rewrite as production.

| Check | Result |
|---|---|
| `tsc --noEmit` | **Pass**, 0 errors (after `next typegen` refreshed route types for the two new layouts) |
| ESLint on every touched/new file | **Pass**, 0 errors. 1 warning, pre-existing: the admin `window.location.href` in `lib/api.ts` |
| `next build` (Turbopack) | **Pass.** `/register` and `/account/prescriptions` are added to the route list. |
| **Contract test:** the real `Api*Repository` classes against the live backend, with a cookie jar standing in for the browser | **44 / 44 pass** on the final tree: signed-out 401s, OTP request/verify/wrong/reused code, HttpOnly cookie, session restore, profile save/clear/validation, address add/default/edit/set-default/delete/promote/404/validation, orders, order 404, overview, prescriptions, set password, logout, password login by phone and email, tampered cookie → signed out, registration with email. |
| **Browser E2E** (Playwright/Chromium, 1440 px and 390 px mobile) | **55 / 55 pass** on the final build: signed-out redirect with callback; network-failure message; inline validation; test-mode notice; resend cooldown; wrong-code message; OTP sign-in returns to the requested page; no session data in web storage; `dh_user` HttpOnly + Lax; address empty state, validation with focus, add ×2, make default, edit, delete with confirm/cancel; reload keeps session; profile validation, save, persist across reload, header greeting; password rules and save; overview counts; orders/prescriptions empty states; unknown order → not found; account menu; **expired session → `/login?reason=expired` with notice**; wrong password; password login; off-site `callbackUrl` ignored; `/login` while signed in → `/account`; logout → home and cookie cleared; mobile registration → callback with name and email saved; no horizontal overflow at 390 px; `/`, `/products`, `/cart`, `/checkout`, `/insights`, `/brands`, `/about` all 200; no unexpected console errors. |
| Rate limiting | Observed for real: after 8 code requests the login page showed the backend's "Too many codes requested. Try again in a few minutes." The backend was restarted between runs to reset its in-memory limiter. |
| Visual review | Screenshots of login, register, OTP, overview, profile and address sheet were checked at both widths. On phones, the overview tiles were compacted into rows after the first review. |

The test scripts are kept outside the repo, in the session scratchpad, because the project has no test runner yet. Adding one is listed in §7.

**Not verified:**
- **Real SMS/email delivery:** MSG91/SMTP are not configured here. Without them and without `OTP_DEV_CODE`, the backend answers 503 ("not set up yet"), and the login page shows that message.
- **Production cookie flags behind HTTPS:** `Secure` is set by the backend only when `NODE_ENV=production`.
- Behaviour with a real (non-test) customer dataset.

## 6. Backend limitations and external prerequisites

1. **OTP delivery needs credentials.** Production needs MSG91 (SMS) and/or SMTP (email) in `backend/.env`, and `OTP_DEV_CODE` must be **empty** there.
2. **Customer emails are not unique, and the profile email is unverified.** `PATCH /me/profile` accepts any email without confirmation. `POST /auth/password-login` resolves an email with `findFirst` (`otp-auth.routes.ts:126`), so two accounts with the same email and password sign into whichever is found first. The tests reproduced this: test accounts were created with a repeated email. Fixing it needs a backend change: a unique index, or verification before an email is saved. The frontend cannot prevent it.
3. **Rate limits are per IP.** `app.ts` does not set `trust proxy`. Behind the Next rewrite or a hosting proxy, every customer may share one IP and therefore one 8-codes-per-15-minutes budget. This was not verified in production, but it is a launch risk.
4. **No "change mobile number" endpoint.** The mobile is shown read-only.
5. **No profile `GET`.** The profile is read from the session (by design).
6. **No account deletion or data export endpoint.**

## 7. Remaining issues and next steps

- **Test data left in the local dev database** `dochomoeo_v2`: 20 test CUSTOMER accounts (mobiles starting 91-94, emails `*@example.com`) and 10 addresses. There is no API to delete them. Remove them with a SQL cleanup when convenient (not done here: no DB changes without approval).
- **Checkout still uses the mock cart** while sign-in is live. A signed-in customer placing an order gets the existing "preview" confirmation (clearly labelled), and that order will not appear in `/account/orders`, which is live. This resolves when the cart and checkout repositories move to the API (storefront integration phase).
- **The orders pages are read-only.** Cancel, pay again, invoice and returns (all supported by the backend) belong to the orders phase.
- **Prescriptions are read-only.** "Order these medicines" belongs to the consultation phase.
- **A project test runner** (Vitest + Playwright) would let the two scratchpad suites live in the repo.
- `DOCHOMO-FINAL-FRONTEND-HANDOFF.md` §3/§7 still describe auth and account as local mocks; this file supersedes those rows.

**Not started:** Phase 2 and later.
