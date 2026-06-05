# 360Ghar Admin + Agent Portal — Project Tracker

## Goal
Comprehensive Admin + Agent dashboard for the 360Ghar real-estate / short-stays platform. Admins manage the full platform; agents act as scoped sub-admins. React 18 + Vite + TypeScript, Redux Toolkit + RTK Query, shadcn/ui on the **Cohere** design system, integrating with the FastAPI backend + Supabase (Auth, Storage).

## Status
- All core CRUD flows (properties, users, visits, bookings, agents) and the full PM portal are wired to real backend endpoints — no mocks.
- `npm run typecheck`, `npm run lint` (`--max-warnings=0`), `npm run build`, and `npm run test` all pass.

---

## Done

### Foundation & robustness
- [x] Shared formatting (`lib/format.ts`): INR currency, number, percent, compact, date/time, relative time
- [x] Server-error → form mapping (`lib/formErrors.ts` `applyServerValidation` + `<FormRootError>`); applied to Notifications, FAQ, Agent, Visit, Profile forms
- [x] `<ErrorState onRetry>` component; route-level error boundary (resets on navigation) in `DashboardLayout`
- [x] PM optimistic updates fully typed via `pmApi.util.updateQueryData` (removed all `any` / eslint-disable blocks)
- [x] Global 401 → "session expired" toast (only when a session existed) before logout

### Dashboard & analytics (real data — no placeholders)
- [x] Role-aware KPIs (admin from `/agents/system/stats`; agent from `/agents/{id}/stats.stats`)
- [x] Property-status donut (composed from per-status count queries)
- [x] 7-day visits-vs-bookings trend (bucketed client-side) + recent activity feed (merged visits/bookings/listings)
- [x] Removed all fabricated trend deltas from Dashboard and Analytics
- [x] Pure, unit-tested transforms in `features/core/lib/dashboard.ts`

### Features
- [x] Notifications composer: Broadcast / Segment / Topic channels, RHF + Zod, inline + server validation
- [x] Property listing triage: real quick-stats, status badges, inline status change via supported PUT
- [x] FAQ management (`/faqs`): list/search + create/edit dialog + delete (new `Faq` API + tag)
- [x] Per-user notification send + history on the User detail page

### UI/UX & a11y
- [x] ⌘K command palette (`CommandPalette`) mounted in `TopBar`
- [x] Real 404 page; skip-to-content link; aria-labels on icon buttons; focus rings
- [x] Cohere token consistency on stat cards, charts, badges; dark-mode toggle (pre-existing) retained
- [x] ImageUpload: file type + 10 MB size validation, count-based progress bar, toast feedback (removed `alert()`)

### Build & tests
- [x] Vendor code-splitting via `manualChunks` (cleared the >500 kB chunk warning)
- [x] Vitest + Testing Library + jsdom runner; existing hook tests fixed to actually run; targeted tests for format/formErrors/dashboard

---

## Known gaps / not in scope (frontend-only constraints)
- General property **moderation_status** (pending/approve/reject) is stored in `listing_preferences` JSON with no list filter or response field — a true moderation queue needs backend support. Flatmates moderation (which has dedicated endpoints) remains the moderation surface; property listings use status/availability triage instead.
- Byte-level upload progress (fetchBaseQuery has no upload-progress hook) — current progress is per-file/count-based.
- Server-validation mapping is applied to the main forms; remaining smaller forms (blog/category/tag dialogs) can adopt `applyServerValidation` the same way.
- Broader surfaces the backend exposes but the dashboard intentionally omits: 360 Virtual Tours, Data Hub (scrapers/RERA/auctions), AI agent chat logs.

---

## Running locally
- Set `VITE_API_BASE_URL` (default `http://localhost:3600/api/v1`) + Supabase keys in `.env`.
- `npm install`, then `npm run dev`. Backend must be running with CORS allowing the dev origin.
