# CRUSH.md

Guides Crush AI in 360Ghar Admin Portal: React/TS dashboard for real estate with admin/agent roles.

## Overview
React 18 + TS, Vite, Redux Toolkit/RTK Query, React Router, Tailwind + Shadcn UI, Zod + React Hook Form. JWT auth, role-based routes. No tests/lint (suggest Vitest + ESLint). No Cursor/Copilot rules found.

## Commands
```bash
npm run dev     # Dev server (localhost:5173)
npm run build   # tsc -b && vite build
npm run typecheck # tsc -b --pretty
npm run preview # vite preview

# Add lint/test: npm i -D eslint prettier vitest @testing-library/react jsdom
# Scripts: "lint": "eslint . --ext ts,tsx", "test": "vitest"
# Single test: npm run test -- src/pages/properties/PropertiesPage.test.tsx
```

## Code Style

### Imports
- Absolute: import { Button } from '@/components/ui/button'
- Order: React/TS > third-party > local. Use @/src alias.

### Formatting
- Prettier: 2 spaces, single quotes, no semicolons in JSX, 100 char lines.
- Tailwind: clsx + tailwind-merge for conditionals.

### Types/Naming
- TS: Interfaces for props, type for unions. Components: PascalCase, FC<Props>.
- camelCase vars/fns; UPPER_SNAKE_CASE consts. Files: PascalCase components.

### Error Handling
- RTK Query: isError + toasts (use-toast). Forms: Zod + react-hook-form errors.
- Nulls: ?., defaults []. Async: try-catch, console.error dev.

### Patterns
- Pages: mode='create/edit/view'. Lists: Shadcn Table + RTK Query.
- Forms: useForm + zodResolver; Select value="all" for empty, convert onChange.
- State: api.injectEndpoints with tags. Auth: PrivateRoute + RoleBasedRoute (user.agent_id).

### Best Practices
- Env: VITE_ prefix, no commits. Extend api.ts, no direct axios.
- Follow Shadcn; type-safe, immutable. Minimal changes, add types/tests.