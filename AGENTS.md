# Repository Guidelines

## Project Structure & Module Organization
- React + TypeScript SPA under `src/`.
- `src/components/` holds shared UI, layout, auth, map, media, and utility components.
- `src/pages/` contains feature-based routes (properties, users, bookings, analytics, auth, etc.).
- `src/store/` contains Redux Toolkit slices and RTK Query API services.
- `src/hooks/`, `src/lib/`, and `src/types/` hold shared hooks, utilities, and type definitions.
- Static entry files: `index.html`, `src/main.tsx`, `src/App.tsx`.

## Build, Test, and Development Commands
- `npm install` – install dependencies.
- `npm run dev` – start Vite dev server (default `http://localhost:5173`).
- `npm run build` – TypeScript project build (`tsc -b && vite build`).
- `npm run preview` – preview the production build locally.
- `npm run typecheck` – project-wide TypeScript type checking.
- `npm run lint` / `npm run lint:fix` – run ESLint / apply auto-fixes.
- A test runner is not yet wired; place tests under `src/**/__tests__` and expose them via an `npm test` script if you add one.

## Coding Style & Naming Conventions
- Use TypeScript everywhere; prefer functional React components (`.tsx`) with explicit prop types.
- Indent with 2 spaces; keep imports ordered: React/TS, third-party, then local (`@/*` alias or relative).
- Components and pages use PascalCase (`PropertyList.tsx`); hooks use `useX` naming.
- Reuse Tailwind + Shadcn UI patterns instead of custom CSS where possible.
- Run `npm run lint` and `npm run typecheck` before opening a PR.

## Testing Guidelines
- Existing examples live under `src/hooks/__tests__` and use React Testing Library.
- Name tests `*.test.ts` / `*.test.tsx` and colocate them in `__tests__` folders near the code.
- Focus on unit tests for hooks, utilities, and Redux logic; mock network interactions rather than calling real APIs.
- Aim to cover new logic you introduce; keep tests deterministic and fast.

## Commit & Pull Request Guidelines
- Use clear, imperative commit messages, e.g., `Add property filters to dashboard`.
- Keep commits focused; avoid mixing refactors and feature work in a single commit.
- PRs should describe what changed, why, and any API or schema impact.
- Include screenshots or GIFs for visible UI changes and reference related issues or tickets.
- Call out breaking changes and required environment/config updates in the PR description.

## Security & Configuration Tips
- Copy `.env.example` to `.env` for local setup; never commit secrets or `.env` files.
- Exposed config must be prefixed with `VITE_` (e.g., `VITE_API_BASE_URL`).
- Ensure the backend API and CORS are configured to allow the Vite dev origin.

