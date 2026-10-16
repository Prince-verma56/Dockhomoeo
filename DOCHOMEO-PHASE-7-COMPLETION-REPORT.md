# DocHomoeo Phase 7: Doctor Directory, Consultations and Integration Readiness

**Date:** 2026-10-16 · **Branch:** `main`, uncommitted (Phases 1–7; nothing committed or pushed) · **Scope:** active root frontend only

## Summary

- **Booking works end to end on the website.** The audit found the backend already supports consultation booking:
  - hold a slot, pay, cancel and rate;
  - list the patient's appointments;
  - attach private reports to a booking.

  Earlier phases had labelled booking "not open". This phase builds the full flow on those real endpoints.
- **The Doctor Directory is discoverable and complete.** It is reachable from the header, mobile menu, footer, homepage CTAs and search.
  - It has an editorial page with the consulting streams the backend actually offers.
  - Specialty filters and search use real data.
  - With zero doctors it shows a designed empty state.
- **A new `/account/consultations` page** shows appointments with their real status, call link, pay, cancel, rate, shared files and prescription.
- **Prescriptions:** "Issued" status, an honest statement about uploads, and ways on to consultations and the shop.
- **Product packs no longer guess a form.** A drawn pack shows a form only when the product's own name or pack title states it; otherwise a neutral carton. The same drawing is used from card to order.
- **Tests:** Phase 7 browser suite **105/105**. All earlier suites pass; the link crawl found 44 URLs, 0 broken. No success response was faked and nothing was charged.

---

## 1. Why the Doctor Directory was hard to find, and the fix

| Cause found in the audit | Fix |
|---|---|
| Until Phase 5–6, the header, mobile menu and footer did not link `/doctors`. The only ways in were two homepage buttons. | "Doctors" is in the shared nav (`components/navigation/navLinks.ts`), so it appears in both the header and the mobile menu. The footer has a **Care** column (Find a Doctor, My Prescriptions). The search palette offers "Search doctors for '…'". *Verified live at 1440 px (header) and at 768 and 390 px (mobile menu: a 44 px+ touch target, and the menu closes on navigation).* |
| With no doctors in the database, the page was a sparse note plus a search box that could find nothing. | The page is now a full editorial page (§2). The search box appears only when there are doctors to search. |
| The page said booking was "not open", although the backend supports it. | Booking is built (§2.3). |
| Homepage CTAs | The hero's "Consult a Doctor" and the consultation band's "Find a Doctor" both open `/doctors` (verified). The hero's video, timeline and layout were not touched. |

## 2. Doctor routes, components and entry points

### 2.1 Routes

| Route | Source | What it does |
|---|---|---|
| `/doctors` (`app/doctors/(directory)/page.tsx`) | `GET /api/care/doctors?q=`, `GET /api/care/streams`, `GET …/:slug/next-slot` | **Intro:** an editorial introduction and "What a consultation includes": video or audio, the doctor's own fee with a 15-minute hold, sharing reports, and a digital prescription.<br>**Streams:** the backend's consulting streams. Today "Homeopathy" is open and 11 others are coming later.<br>**Filters and search:** specialty chips built only from the specializations of listed doctors and open streams; search uses the backend's `q` (name, specialization or language).<br>**Doctor cards:** name, qualification, experience, languages and city. A rating appears only when the doctor has ratings. Also shown: the real next free slot and the fees per offered mode.<br>**Other content:** a "How it works" section and an emergency disclaimer.<br>**States:** loading skeleton, opening-soon (zero doctors), no-match, and shop-unreachable with retry. |
| `/doctors/[slug]` | `GET /api/care/doctors/:slug`, `…/slots?date=` | Profile, consultation fees, weekly hours and a 7-day strip. The day lives in the URL, and the chosen time survives sign-in through `?slot=`. A layout settles whether the doctor exists *before* the page streams, so an unknown doctor is a real **404**, not a 200 "not found" page. Profile-shaped loading skeleton. |
| `/account/consultations` (**new**) | `GET /api/me/appointments`, `/pay`, `/cancel`, `/review` | Upcoming (soonest first), then past and cancelled.<br>**Statuses** in the patient's words: Awaiting payment, Booked, In progress, Completed, Cancelled, Missed.<br>**Actions, only where the backend allows them:**<br>- "Join the call", only when it provides `meetingUrl`;<br>- Pay (`canPay`);<br>- Cancel (`canCancel`, after a confirmation step; says when a refund is due);<br>- Rate (`canRate`, 1–5 stars and an optional comment).<br>Also shows shared files (from the private endpoint), the prescription link and a refunded amount.<br>**Banners** after booking (`?booked=`, worded from that appointment's real status) and after the gateway (`?payment=`). |
| `/patient/consultations` (**new**) | Gateway `returnTo` | The backend returns patients to this path after PhonePe. It forwards to `/account/consultations?payment=success\|pending\|failed`, as `/patient/orders/[id]` already does for orders. |

### 2.2 Components and data layer

- **New components:**
  - `components/doctors/DoctorAvatar.tsx`: the real photo, or a neutral placeholder that implies no identity;
  - `sections/doctors/DoctorCard.tsx`;
  - `sections/doctors/BookingPanel.tsx`.
- **Helpers:**
  - `lib/care/consultation.ts`: modes, fees, India-time labels, status wording, file rules, the hold and cancel windows;
  - `lib/care/doctor.ts`: one cached doctor lookup per request.
- **Repositories:**
  - `ICareRepository.getStreams`;
  - new `IConsultationRepository` / `ApiConsultationRepository`: `book`, `pay`, `cancel`, `rate`, `list`, `uploadFile`, `removeFile`.

  These follow the existing interface → API class → `repositories` pattern, and no mock implementation was added.
- **Types:** `types/api/care.ts` now covers streams, booking input and result, pay result, files and appointments, all in the backend's exact shapes.
- **Uploads:** `lib/api.ts` now sends a `FormData` body as multipart, which the consultation upload needs.
- **Account entry points:** "Consultations" appears in the account sidebar and the header account menu. The overview has a tile using the real `counts.upcoming`. The overview's "Needs your attention" now shows every to-do kind the backend returns (pay a consultation, rate, order prescribed medicines, follow up), each linking to where it is done.

### 2.3 How booking works

1. **Choose a time.** Free VIDEO or AUDIO times are selectable. Taken, past and in-clinic or chat times are disabled, and the reason is announced. A doctor with no online fee has nothing to book.
2. **Sign in if needed.** A signed-out visitor sees "Sign in to book this time", which returns them to the same day and time.
3. **Fill in the form.**
   - **Mode:** only those the doctor charges for, preselected from the slot.
   - **Patient:** name (prefilled from the account), age and gender.
   - **Problem:** at least 5 characters.
   - **Optional files:** PDF, JPG, PNG or WebP, up to 5 MB, at most 5. They upload to the real private endpoint and can be removed.
4. **Book and pay.** `POST /api/me/appointments`, then `POST …/:id/pay`:
   - **Gateway connected:** go to the pay page.
   - **Test mode:** confirmed at once, then `/account/consultations?booked=`.
5. **Honest failures:**
   - **409** (taken meanwhile): the backend's message, and the times are re-read.
   - **401:** "session ended".
   - **400:** the backend's message, shown word for word.
   - **Pay failed after a successful hold:** "held as APT-…, not paid yet", linking to the consultations page. The form is locked so the same time cannot be booked twice.
   - **Double submission** is blocked.

## 3. Is real doctor data available?

- **Endpoint:** `GET /api/care/doctors`. It lists only doctors who are approved, listed, accept consultations and have working hours.
- **Today:** it returns **0 doctors**; the database has 0 `DoctorProfile` rows. The directory therefore shows its opening-soon state; this was verified live.
- **When doctors appear:** they show up automatically with no code change. This was verified by rendering doctor responses in the backend's exact shape through a test-only proxy (§6).
- **Consulting streams** (`GET /api/care/streams`) are real data today. Specializations and symptoms (`/api/care/symptoms`) are empty, so no specialty chips appear until doctors or specializations exist.
- **Guided matching** (`POST /api/me/match`, symptom-based suggestions) also exists in the backend. It was not built: with no doctors and no specializations it has nothing to match. It is the natural next feature once data exists.

## 4. Prescriptions

**Completed** (`/account/prescriptions`):
- **What each prescription shows:** doctor, issue date, diagnosis, advice, follow-up date, and each medicine's availability. Each also has an **Issued** status (the backend returns only issued ones) and an anchor (`#rx-ID`) used by consultations and the overview.
- **Ordering:** "Order available medicines", and selecting or linking a prescription at checkout, which sends `prescriptionId`. Verified again in the regression suite.
- **States:** loading, error with retry, and empty. The empty state now offers "Find a doctor" and "Shop remedies", and every page ends with links to consultations and the shop.
- **Session:** signed out or expired → sign-in, returning to the page. Verified for consultations and prescriptions; the backend answers 401 to every patient API without a session.

**Upload: honest, not faked.**
- There is no endpoint for uploading a prescription *for ordering medicines*. The page says so plainly and has no upload control.
- The backend's real upload is for consultations: reports or earlier prescriptions attached to a booking for the doctor to read. The page points there, and the booking form uses it.

**Contract the backend would need for prescription upload for orders:**

```
POST /api/me/prescriptions/uploads   multipart/form-data, field "file"
  accepts: application/pdf, image/jpeg, image/png, image/webp (checked by content, as consultation-files does); ≤ 5 MB; ≤ 5 per customer pending
  201 { id, fileName, kind, size, status: "PENDING_REVIEW", uploadedAt }
  400 { message } invalid type/size; 401 signed out
GET    /api/me/prescriptions/uploads        { items: [...same shape + status: PENDING_REVIEW | APPROVED | REJECTED, reviewNote] }
DELETE /api/me/prescriptions/uploads/:id    only while PENDING_REVIEW
Checkout: accept { uploadedPrescriptionId } alongside prescriptionId, and refuse Rx-only products without an approved one.
```

It also needs a staff review workflow (pharmacist approval) on the admin side.

## 5. Other fixes

| Area | Finding | Fix |
|---|---|---|
| **Product package form** | Listing cards, cart lines and order items carry no `form`. The frontend guessed one: any product whose name had no form word was drawn as a dropper bottle. The product page also defaulted to "drops". | **No guessing:**<br>- `packFormFromText` returns a form only when the name or pack title states it ("Tablets", "Tube", "Oil", "Q", "Drops", "Dilution"…); otherwise `null`.<br>- `ProductPackshot` then draws a **neutral carton**, still printed with the product's own name and brand.<br>- One rule everywhere: listing, search, product page, cart, checkout, confirmation and orders all draw the same pack.<br>- The product page still shows the shop's real `form` as text, and omits it when the shop gives none. |
| **Missing field** | `toCard` (`backend/src/lib/catalog-index.ts`), cart quote lines and order items lack `form`. | Documented in §7. Once added, authoritative packs can replace the carton. |
| **Health Insights, reviews, coupons** | Re-verified: the real blog and reviews are used, and nothing is invented. The database has 0 posts, 0 reviews and 0 coupons, so the honest empty states show. | No change needed. |
| **Payment states** | Order payment-return states were verified in Phase 4. For consultations, test-mode payment confirms at once, gateway mode follows `payUrl`, and `/patient/consultations?payment=` → banner (verified). | Real gateway verification remains pending (§7). |
| **Layout bug found by a stronger test** | At 390 px the doctor profile rendered 686 px wide: the day strip forced the grid column wider. The old overflow check missed it because mobile emulation widens the layout viewport. | The grid now uses a `minmax(0,1fr)` column. The overflow check in all suites now measures against the real device width. An audit of 27 routes at 390, 375 and 768 px found no other overflow. |
| **Unknown doctor returned 200** (caused by this phase's loading skeleton) | A streamed page cannot change its status code. | The directory moved into a route group, and the doctor lookup moved into a `[slug]` layout, so the lookup happens before streaming → a real 404. |

## 6. Tests and results

**Setup:**
- **Backend:** local, **safe test mode** (`PAYMENTS_TEST_MODE=true`, PhonePe, Shiprocket and Mongo keys set to empty strings). Started from Bash only; `onlineTest: true` was confirmed before each run.
- **Frontend:** `next build` + `next start`.
- **Browser:** Playwright Chromium from the npx cache.

| Check | Result |
|---|---|
| `tsc --noEmit` | Pass |
| `next build` | Pass |
| ESLint, all Phase 7 files | **0 errors** (warnings are `<img>` for admin-uploaded photos) |
| ESLint, whole project | The 2 errors in scope are in files unchanged from the last commit (`HeroPlaybackContext.tsx`, part of the locked hero; `components/ui/tilt-card.tsx`); the admin-page errors noted in Phase 5–6 are also unchanged |
| **Phase 7 browser suite** | **105/105** |
| Phase 5+6 suite (regression) | **149/149** |
| Phase 4 suite (regression) | **110/110** |
| Phase 2+3 suite (regression) | **67/67** |
| Phase 1 suite (regression) | **55/55** |
| Phase 1 API contract test | **44/44** |
| Populated rendering (fixture proxy) | **19/19** |
| Pack-form unit cases | **9/9** |
| Link crawl, signed out and in | **44 URLs, 0 non-200** |

**The Phase 7 suite covers each item of the brief:**
1. **`/doctors` loads and survives refresh:** loads directly with 200 and survives refresh. Streams match the API exactly; no card, rating, slot, fee or booking control is invented; the empty-state links work; no-match state; unknown doctor → 404.
2. **Entry points:** header (1440 px), mobile menu (768 and 390 px; touch target ≥ 44 px; closes after navigation), footer, hero and consultation-band CTAs.
3. **Empty doctor database:** the polished empty state, verified live.
4. **Genuine data appears automatically (fixture):**
   - cards show only returned fields; a rating only when rated;
   - next free slot;
   - fees per offered mode;
   - neutral placeholder;
   - the specialty filter narrows and is marked current;
   - language search uses `q`.
5. **No pretend booking:**
   - taken and in-clinic times are disabled;
   - signing in keeps the day and time;
   - validation;
   - a wrong file type is refused;
   - a **real photo uploads (201)**;
   - the booking payload matches the contract;
   - **the real backend's refusal is shown word for word** ("This doctor is not taking consultations right now"), with no redirect and **0 appointments created**;
   - removing the upload **deletes it on the backend (200)**.
6. **Consultations:**
   - live empty state;
   - Consultations in the account nav, the menu and the overview tile;
   - a fixture list renders statuses, the order, the booked banner, the call link only when provided, the under-2-hours cancel notice, the private file link, the prescription anchor and the refund;
   - **Pay and Cancel reach the real backend, and its refusals are shown**;
   - rating requires stars;
   - the gateway return route works.
7. **Prescriptions:** empty state with the upload limitation; no upload control; Issued pill and anchor; ways on.
8. **Unauthenticated:** both account pages → sign-in with a return; patient APIs → 401.
9. **Packs:** every drawn card follows only what its name states; no dropper without the word; product page and cart drawer show the same carton; the real form appears as text.
11. **Responsive:** 7 routes × 5 widths, measured against the real device width.

Also checked: no uncaught page errors.

**Test-only data, and its limits:**
- **What used fixtures:** a local proxy answered *doctor and slot reads* in the backend's exact shapes for a second `next start`. Playwright answered *the appointments and prescriptions lists* in two marked steps.
- **What stayed real:** every submission (sign-in, upload, delete, booking, pay, cancel) reached the real backend, and only its real answers were asserted.
- **No faked success:** no success response was faked, and nothing was charged.

**Test-data changes:**
- **Stock:** repeated Phase 2–7 test orders used up the "Natrum Muriaticum 30C (test)" 100 ml pack, which is now out of stock. The Phase 4 identity test now picks an in-stock pack; nothing was restocked.
- **Updated expectations:** Phase 4 and Phase 5+6 checks that asserted "booking not open", the old empty-state wording, the search box with zero doctors, or the old dropper guess now assert the new truthful behaviour.

**Database after all runs:** payments 15, all `TEST`/`SUCCESS`; shipments 0; appointments 0; consultation files 0; doctors 0.

## 7. What needs the backend owner or data

1. **Doctors:** add and approve doctor profiles with working hours (admin). The directory, booking and consultations then work with no frontend change. Until then the confirmed-booking path has been verified only up to the backend's refusal for a non-existent doctor.
2. **`form` on listing cards, cart quote lines and order items** (`toCard` in `backend/src/lib/catalog-index.ts`; the quote and order item selects). With it, packs can be authoritative everywhere instead of the neutral carton.
3. **Prescription upload for orders:** a new endpoint and review workflow (contract in §4).
4. **Real payment: PhonePe.**
   - **Needs:** gateway keys, `FRONTEND_URL` set to the public origin, and `PUBLIC_API_URL` for callbacks.
   - **Not verified yet:** both the order and consultation round trips. The consultation return route `/patient/consultations` is in place.
5. **Real shipping (Shiprocket):** needs credentials and a safe test account; "not deliverable" cannot occur without it.
6. **Content:** blog posts, product reviews and any real coupons (admin).
7. **Safety:** the local `backend/.env` holds **production** PhonePe and Shiprocket credentials, with shipping mode `auto`. Start the backend only with those keys set to empty strings, from a POSIX shell; in PowerShell and cmd, an empty assignment *removes* the variable.

## 8. Boundaries

- **Backend:** `backend/` is unmodified (`git status backend` is clean). No schema, migration, seed, `.env` or database record was edited directly. The rows that exist were created only through the app's own API during tests, and the one uploaded test file was deleted through the API.
- **Reference repo:** `docohomo-prince/` was not modified. Its two local changes (`.gitignore`, `serviceWorker.js`) date from 8 and 14 Oct, before Phase 1. It was used only to read contracts (booking → pay → `/patient/consultations`), with no imports.
- **Dependencies:** none added.

## 9. Genuinely remaining

- **Owner and backend:** the items in §7.
- **Guided doctor matching** (symptoms → suggested doctors): frontend work for when specializations and doctors exist.
- **Next.js 16.3.8 Back-after-refresh** behaviour (Phase 5–6 report §7): re-test after a framework upgrade.
- **Commit:** review and commit Phases 1–7 when ready.
