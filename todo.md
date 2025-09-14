# 360Ghar Admin + Agent Portal — Project Tracker

## Goal
Build a production‑ready Admin + Agent dashboard for the 360Ghar real estate + short stays platform. Admins manage the entire system (properties, users, agents, visits, bookings, analytics). Agents act as sub‑admins, managing only their assigned users’ properties, visits, and bookings. Frontend uses React + Vite + TypeScript, Tailwind + shadcn/ui, Redux Toolkit + RTK Query, and integrates with the existing FastAPI backend and Supabase (auth/storage/RLS).

## Status Summary
- App scaffolding, state management, routing, auth, and core CRUD flows are implemented and wired to the real backend endpoints (no mocks).
- UI is functional with Tailwind and partially migrated to shadcn components (button, card, input, label, form). Remaining primitives still use minimal custom components.
- TypeScript typechecking passes and pages are navigable end‑to‑end after login.

---

## Completed

### Project Setup
- [x] Vite + React + TypeScript scaffolding
- [x] Tailwind config + base styles
- [x] Path alias `@/*` via Vite
- [x] Environment variables (`.env.example`)
- [x] README with setup steps

### State & Data Layer
- [x] Redux Toolkit store
- [x] RTK Query base (`api`) with auth token header
- [x] Auth API (`/auth/login/`)
- [x] Feature APIs: properties, users, visits, bookings, agents, system stats, amenities
- [x] Token + user persisted in localStorage; hydration on app start

### AuthN/AuthZ
- [x] Login (/login) with phone + password
- [x] Role inference: admin vs agent (`user.agent_id`)
- [x] PrivateRoute + RoleBasedRoute guards
- [x] Logout flow

### Layout & Navigation
- [x] Dashboard shell with Sidebar + TopBar
- [x] Role‑aware nav (Admin vs Agent)
- [x] TopBar dropdown (profile/logout)

### Shadcn Integration (phase 1)
- [x] CLI init completed on your side
- [x] Added: button, card, input, label, form
- [x] Refactored Login to shadcn form primitives

### Dashboard
- [x] Admin dashboard KPIs from `/agents/system/stats/`
- [x] Agent dashboard KPIs from `/agents/{agent_id}/stats/`

### Properties Module
- [x] List with filters (q, city, status) + pagination (`page`, `page_size`, `count`)
- [x] Create/Edit (React Hook Form + Zod)
- [x] Detail view (read‑only)
- [x] Delete with confirmation dialog
- [x] Media uploads using Supabase Storage (public URLs)
- [x] Owner selection (agent‑scoped for agents; all users for admin)
- [x] Location picker (Leaflet map; lat/lng sync)
- [x] Amenities multi‑select (from `/amenities/`)

### Users Module
- [x] List with search; admin filter by agent; agent auto‑scoped
- [x] Detail/Edit page
- [x] Assign/Reassign agent (admin) via `/users/{user_id}/assign-agent/`

### Visits Module
- [x] List with filters + pagination
- [x] Schedule (create)
- [x] Detail with actions: reschedule, cancel, complete

### Bookings Module
- [x] List with filters + pagination
- [x] Detail with actions: cancel, process payment, add review

### Agents Module (Admin)
- [x] List
- [x] Create/Edit
- [x] Stats page (`/agents/{id}/stats/`)

### Analytics (Admin)
- [x] KPIs and workload fetched and displayed

### Profile
- [x] `/profile` self‑edit; persists back to auth state

### Utilities
- [x] Toast provider (lightweight)
- [x] Dialog (lightweight)
- [x] Table (lightweight)
- [x] Pagination component and wiring across lists
- [x] TypeScript passes (`npm run typecheck`)

---

## Pending / Next Up

### Shadcn UI Migration (Phase 2)
- [ ] Replace lightweight primitives with shadcn components for consistency:
  - [ ] Table (sortable headers, empty state styles)
  - [ ] Dialog / AlertDialog (confirmations)
  - [ ] Toast (replace custom provider)
  - [ ] Select / Combobox (owner pickers, improved filters)
  - [ ] Dropdown menu (TopBar, row actions)
  - [ ] Avatar (TopBar)
  - [ ] Skeletons (loading states)
- [ ] Remove custom UI after replacement to avoid duplication

### Validation & UX
- [ ] Expand Zod schemas for all forms; display server validation errors inline
- [ ] Debounce search inputs and persist filter state per page
- [ ] Better empty/error states across all lists and details
- [ ] Add day/time pickers and constraints for visits

### Media & Storage
- [ ] Primary image selection; reorder images
- [ ] Upload progress indicator and file size/type validation
- [ ] Backend delete hook to remove files from storage when properties are deleted (requires API support)

### Maps & Addressing
- [ ] Geocoding (address → lat/lng) and reverse geocoding (optional; Nominatim/Mapbox/Google)
- [ ] Persist location accuracy and address fields coherently

### Analytics & Charts
- [ ] Choose chart lib (Recharts/Chart.js) and add visualizations
  - [ ] Dashboard charts (trends, breakdowns)
  - [ ] Analytics page charts (workload distribution, leaderboards)

### Auth & Security
- [ ] Global 401 handling; auto‑logout or token refresh
- [ ] Optional: HttpOnly cookie flow if backend supports it
- [ ] Scrub PII from logs; protect sensitive UI routes

### Performance
- [ ] Tune RTK Query caching and prefetch patterns
- [ ] Virtualized tables for large lists (react‑virtualized/react‑window) if needed

### Polish
- [ ] Accessibility audit (labels, ARIA, keyboard navigation)
- [ ] Date range pickers on lists (visits/bookings analytics)
- [ ] Consistent currency/number/date formatting (Intl APIs)
- [ ] 404 / Access Denied UX polish

### Docs & Dev Experience
- [ ] README updates (role matrix, endpoint mapping, env details)
- [ ] Contribution guide (formatting, conventions)
- [ ] Optional: OpenAPI client generation for type‑safe endpoints

---

## Backend Dependencies / Assumptions
- Endpoints exist and are CORS‑enabled for the dev origin:
  - Auth: `POST /auth/login/`
  - Properties: `GET/POST/PUT/DELETE /properties/`, `GET /properties/{id}/`
  - Users: `GET /users/`, `GET /users/{id}/`, `PUT /users/{id}/`, `POST /users/{id}/assign-agent/`
  - Visits: `GET /visits/`, `GET /visits/{id}/`, `POST /visits/`, `POST /visits/{id}/reschedule`, `POST /visits/{id}/cancel`, `POST /visits/{id}/complete`
  - Bookings: `GET /bookings/`, `GET /bookings/{id}/`, `POST /bookings/cancel/`, `POST /bookings/payment/`, `POST /bookings/review/`
  - Agents: `GET /agents/`, `GET/PUT /agents/{id}/`, `POST /agents/`, `GET /agents/{id}/stats/`
  - Analytics: `GET /agents/system/stats/`, `GET /agents/system/workload/`
  - Amenities: `GET /amenities/`
- Server‑side role enforcement in FastAPI must restrict agent access to their assigned scope (RLS + service checks).

---

## Milestones & Priorities
1) UI Consistency with shadcn (Table, Dialog, Select, Toast, Skeleton) — high
2) Validation/UX polish and error handling — high
3) Media improvements (primary/reorder/progress) — medium
4) Analytics charts (dashboards + analytics page) — medium
5) Map geocoding + address sync — medium
6) Performance and accessibility passes — medium

---

## Running Locally
- Set `VITE_API_BASE_URL` and Supabase keys if using uploads (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- `npm install`
- `npm run dev`

---

## Notes
- No mock data. All pages call real backend endpoints.
- Shadcn components are partially integrated; more components will be added and pages refactored for a consistent design system.

