# 360Ghar Admin + Agent Portal — Project Tracker

## Goal
Implement a comprehensive Admin + Agent Dashboard for the 360Ghar Real Estate + Short Stays Booking App (competitor to Airbnb). Admins manage the full platform (properties, users, bookings, reports, settings). Agents act as sub-admins, with full permissions to manage the properties and users assigned to them (add/edit/delete/update). Use React + Shadcn UI + Redux Toolkit for the frontend, integrating with existing FastAPI backend and Supabase (Auth, Storage, RLS).

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

### Shadcn Integration (Phase 2)
- [x] Added comprehensive shadcn components: accordion, alert-dialog, avatar, badge, checkbox, combobox, command, data-table, dialog, dropdown-menu, pagination, popover, select, separator, sheet, skeleton, table, toast, toaster, tooltip
- [x] Replaced lightweight primitives with shadcn AlertDialog for confirmations
- [x] Replaced custom dropdowns with shadcn DropdownMenu (TopBar, row actions)
- [x] Replaced custom table with shadcn DataTable using @tanstack/react-table
- [x] Added shadcn Skeleton components for loading states
- [x] Added shadcn Avatar component (TopBar profile)
- [x] Replaced custom toast provider with shadcn Toast
- [ ] Remove custom UI components after full migration to shadcn

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
- [x] `/users/preferences` user preferences page with location settings
- [x] `/agents/me` agent profile page for agents

### Utilities
- [x] Toast provider migrated to shadcn Toast
- [x] Dialog migrated to shadcn AlertDialog for confirmations
- [x] Table migrated to shadcn DataTable with @tanstack/react-table
- [x] Pagination component and wiring across lists
- [x] TypeScript passes (`npm run typecheck`)
- [x] useDebounce hook for search optimization

---

## Pending / Next Up


### Validation & UX
- [x] Comprehensive Zod schemas implemented for all forms (PropertyForm, VisitForm, etc.)
- [x] Debounced search inputs implemented across all list views
- [ ] Display server validation errors inline
- [ ] Better empty/error states across all lists and details
- [ ] Add day/time pickers and constraints for visits
- [ ] Persist filter state per page (localStorage/sessionStorage)

### Media & Storage
- [x] Primary image selection implemented in ImageUpload component
- [x] Image reordering with drag & drop functionality
- [ ] Upload progress indicator and file size/type validation
- [ ] Backend delete hook to remove files from storage when properties are deleted (requires API support)

### Maps & Addressing
- [x] AddressAutocomplete component with Nominatim geocoding (address → lat/lng)
- [ ] Reverse geocoding (lat/lng → address)
- [ ] Persist location accuracy and address fields coherently

### Analytics & Charts
- [x] Recharts library integrated for data visualizations
- [x] Dashboard charts implemented (KPIs with trend indicators, multiple chart types: Bar, Line, Area, Pie)
- [x] Analytics page charts implemented (workload distribution with interactive views)
- [ ] Additional chart visualizations (trends over time, leaderboards, property analytics)

### Auth & Security
- [x] Global 401/403 handling implemented with automatic logout
- [ ] Token refresh mechanism (if backend supports refresh tokens)
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
1) UI cleanup: Remove custom UI components after full shadcn migration — medium
2) Validation/UX polish: Server error display, filter persistence, better empty states — high
3) Media improvements: Upload progress, file validation, backend cleanup hooks — medium
4) Enhanced analytics: Additional charts (trends, leaderboards, property analytics) — medium
5) Map features: Reverse geocoding, address field synchronization — medium
6) Performance: RTK Query optimization, virtualized tables if needed — low
7) Security: Token refresh, PII protection, accessibility audit — medium

---

## Running Locally
- Set `VITE_API_BASE_URL` and Supabase keys if using uploads (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- `npm install`
- `npm run dev`

---

## Blueprint Alignment
This project follows the comprehensive blueprint outlined in the planning document, covering:

### Core Modules Implemented
- ✅ Authentication & Authorization (login, role-based access, protected routes)
- ✅ Core Layout & Navigation (sidebar, topbar, role-aware navigation)
- ✅ Dashboard (agent and admin overview with KPIs)
- ✅ Property Management (full CRUD with media uploads, location picker, amenities)
- ✅ User Management (list, detail, agent assignment)
- ✅ Visit Management (scheduling, reschedule/cancel/complete actions)
- ✅ Booking Management (list, detail, payment/review actions)
- ✅ Agent Management (CRUD operations and performance stats)
- ✅ System Analytics (KPIs and workload metrics)

### Utility Components & Features
- ✅ Form validation with Zod schemas
- ✅ Toast notifications for user feedback
- ✅ Confirmation dialogs for destructive actions
- ✅ Image upload with Supabase Storage integration
- ✅ Location picker with Leaflet map integration
- ✅ Pagination across all list views
- ✅ Loading states and error handling

### Backend Integration
- ✅ All required API endpoints implemented and tested
- ✅ RTK Query for efficient data fetching and caching
- ✅ Supabase authentication and storage integration
- ✅ Role-based access control enforcement

---

## Notes
- No mock data. All pages call real backend endpoints.
- Shadcn components are partially integrated; more components will be added and pages refactored for a consistent design system.
- Implementation follows step-by-step blueprint with iterative development approach.

