# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **360Ghar Admin + Agent Portal** - a React-based admin dashboard for managing real estate operations. The project serves two user roles (admin/agent) and provides interfaces for managing properties, users, bookings, visits, and analytics.

## Key Development Commands

```bash
# Development
npm run dev              # Start dev server on port 5173

# Build & Type Check
npm run build            # TypeScript compilation + Vite build
npm run typecheck        # TypeScript type checking only
npm run preview          # Preview production build

# Setup
npm install              # Install dependencies
cp .env.example .env     # Copy environment variables
```

## Architecture Overview

### Core Stack
- **React 18** with TypeScript using **Vite** as build tool
- **Redux Toolkit** + **RTK Query** for state management and API calls
- **React Router v6** for client-side routing
- **Tailwind CSS** for styling with **Shadcn UI** component library (fully implemented)
- **Zod** + **React Hook Form** for form validation
- **Recharts** for data visualization
- **Leaflet** for map integration

### Authentication Flow
- JWT-based authentication with tokens stored in localStorage
- Role-based access control (admin/agent roles) determined by `user.agent_id` field
- Protected routes via `PrivateRoute` component
- Role-specific routes via `RoleBasedRoute` component
- Automatic token injection in API requests with 401/403 handling

### Project Structure
```
src/
├── components/
│   ├── auth/           # Authentication guards (PrivateRoute, RoleBasedRoute)
│   ├── layout/         # Dashboard layout (Sidebar, TopBar, DashboardLayout)
│   ├── ui/            # Shadcn UI components (fully configured)
│   ├── media/         # Media handling utilities (ImageUpload)
│   └── map/           # Map components (LocationPicker, MapPreview)
├── pages/             # Feature-based page components with sub-components
├── store/
│   ├── services/      # RTK Query API slices (auth, properties, users, etc.)
│   └── slices/        # Redux state slices (auth)
├── hooks/             # Custom React hooks (use-toast, useDebounce, redux)
├── lib/               # Utilities (API config, Supabase client, utils)
└── types/             # TypeScript type definitions
```

### API Integration Pattern
The project uses a centralized API setup:
- Base API configuration in `src/store/services/api.ts` with automatic auth
- Feature-specific API slices extend the base API using `api.injectEndpoints()`
- RTK Query handles data fetching, caching, and tag-based invalidation
- All API responses are type-safe through TypeScript generics

### Key Implementation Patterns

#### Page Organization
- Pages use a mode prop for different views (e.g., PropertiesPage supports 'create', 'edit', 'view')
- List components include search, filtering, pagination, and CRUD operations
- Form components use React Hook Form + Zod validation with Shadcn UI components

#### Select Component Usage
- Important: Select.Item cannot have empty string values. Use value="all" with conversion logic
- Pattern: `value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}`

#### Null Safety in Lists
- Always use optional chaining for API responses: `data?.results?.length`
- Pattern: `{!isFetching && (!data?.results || data.results.length === 0) && (...)}`

#### State Management
- Auth state managed through Redux slice with localStorage persistence
- API state managed through RTK Query with automatic caching
- Toast notifications implemented using custom hook pattern

## Key Conventions

### Component Development
- Feature-based organization: pages contain their own components in subdirectories
- Shadcn UI components are fully integrated and ready to use
- Follow established patterns for lists, forms, and detail views

### State Management
- Use RTK Query for all API interactions (no direct axios calls)
- Use Redux slices only for complex client state
- Implement proper tag-based cache invalidation for mutations

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=           # Optional for file storage
VITE_SUPABASE_ANON_KEY=      # Optional for file storage
```

### Type Safety
- Strict TypeScript mode enabled
- Define types in `src/types/` directory
- Use Zod schemas for form validation
- RTK Query provides full type safety for API responses

## Important Notes

- The backend API must be running and CORS configured to allow the dev server origin
- Admin users have access to all features, agents are restricted to their assigned properties/users
- All Shadcn UI components are installed and ready to use
- The application includes comprehensive error handling and loading states