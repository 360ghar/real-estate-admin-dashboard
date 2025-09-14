# 360Ghar Admin + Agent Portal (Frontend)

React + Vite + TypeScript app scaffold for the Admin/Agent dashboard. Uses Redux Toolkit + RTK Query, React Router v6, Tailwind CSS. Shadcn UI can be added following their CLI once dependencies are installed.

## Tech Stack
- React 18, Vite, TypeScript
- Redux Toolkit + RTK Query
- React Router v6
- Tailwind CSS
- Zod + React Hook Form
- Optional: Supabase client (for storage)

## Getting Started

1. Install dependencies:

```
npm install
```

2. Copy env and set API URL:

```
cp .env.example .env
# edit .env
# VITE_API_BASE_URL=http://localhost:8000/api/v1
```

3. Run dev server:

```
npm run dev
```

4. (Optional) Setup Shadcn UI later:

```
# After Tailwind is working
npx shadcn-ui@latest init
# Then add components as needed, e.g.:
npx shadcn-ui@latest add button card table form dialog input select label checkbox avatar dropdown-menu navigation-menu toast alert skeleton
```

## Auth Flow
- Login at `/login` using phone/password -> POST `/auth/login/`.
- Token is stored in localStorage, user is saved in Redux state.
- Private routes and role-based guard (admin/agent) are implemented.

## Structure
- `src/components/layout/*`: Sidebar, TopBar, and shell layout
- `src/pages/*`: Route pages (dashboard, properties, users, agents, visits, bookings, analytics)
- `src/store/*`: Redux store, auth slice, auth API (RTK Query)
- `src/types/*`: Shared interfaces
- `src/lib/supabase.ts`: Optional Supabase client for storage

## Notes
- This is a minimal scaffold—API slices and UI should be expanded per the blueprint.
- Shadcn UI is not bundled yet; you can progressively add components via the CLI.
- Ensure backend CORS allows the dev origin.

