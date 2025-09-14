# 360Ghar Admin + Agent Portal

A comprehensive Admin + Agent dashboard for the 360Ghar real estate and short stays booking platform. Built with React, TypeScript, and modern UI libraries, this portal allows Admins to manage the entire system while Agents act as sub-admins managing their assigned users and properties.

## Goal
Admins can manage the full platform (properties, users, bookings, reports, settings). Agents act as sub-admins, with full permissions to manage the properties and users assigned to them (add/edit/delete/update). The frontend integrates with an existing FastAPI backend and Supabase for authentication, storage, and row-level security (RLS).

## Tech Stack & Project Setup

**Framework**: React 18+ (using Vite for faster setup)  
**UI Library**: Shadcn/ui (built on Radix UI and Tailwind CSS)  
**State Management**: Redux Toolkit (RTK) with RTK Query for efficient data fetching, caching, and state management  
**Routing**: React Router DOM v6+  
**Styling**: Tailwind CSS for utility-first, responsive design  
**HTTP Client**: Axios + RTK Query (primary for data fetching)  
**Authentication**: Supabase Auth (JWT via Bearer token)  
**Type Safety**: TypeScript  
**Form Handling**: React Hook Form + Zod for validation  
**Icons**: Lucide React  
**Charts**: Recharts or Chart.js (optional for analytics)  
**Map Integration**: Leaflet or Mapbox GL JS (for property locations)

### Installation & Setup

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your values:
   # VITE_API_BASE_URL=https://api.360ghar.com/api/v1
   # VITE_SUPABASE_URL=your-supabase-url
   # VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Initialize Shadcn/ui**:
   ```bash
   npx shadcn-ui@latest init
   # Follow prompts to configure paths (src/components/ui, src/lib/utils, etc.)
   ```

4. **Install Shadcn Components** (as needed):
   ```bash
   npx shadcn-ui@latest add button card table form dialog input select label checkbox avatar dropdown-menu navigation-menu toast alert skeleton pagination combobox command popover sheet badge alert-dialog
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```

### Project Structure
- `src/components/layout/`: Sidebar, TopBar, DashboardLayout
- `src/components/auth/`: PrivateRoute, RoleBasedRoute
- `src/components/ui/`: Shadcn UI components
- `src/pages/`: Route pages (dashboard, properties, users, agents, visits, bookings, analytics)
- `src/store/`: Redux store, slices, and RTK Query APIs
- `src/types/`: TypeScript interfaces
- `src/lib/`: Utilities, Supabase client
- `src/hooks/`: Custom React hooks

## Authentication & Authorization

### Login Flow
- User enters phone and password at `/login`
- Frontend calls `POST /api/v1/auth/login/`
- Backend returns JWT token and user object
- Token stored in localStorage, user saved in Redux
- Role inferred from `user.agent_id` (null = Admin, present = Agent)
- Redirect to dashboard on success

### Protected Routes
- `PrivateRoute`: Checks authentication status
- `RoleBasedRoute`: Enforces role-based access (admin/agent)
- Access denied redirects to `/access-denied`

### API Integration
- RTK Query handles authenticated requests with Bearer token headers
- Auth slice manages token persistence and user state
- Logout clears credentials and redirects to login

## Core Features

### Dashboard
**Agent Dashboard**: Properties managed, active users, upcoming visits, pending bookings, satisfaction score  
**Admin Dashboard**: System health metrics, user growth, booking trends, agent workload distribution

### Property Management
- **List View**: Search, filters, pagination
- **CRUD Operations**: Create/edit/delete properties
- **Features**: Media uploads, location picker, amenities selection
- **Role-Based**: Agents see only their assigned users' properties

### User Management
- **List View**: Search and filter users
- **Profile Management**: View/edit user details
- **Agent Assignment**: Admins can assign/reassign agents to users
- **Role-Based**: Agents see only their assigned users

### Visit Management
- **Scheduling**: Create visits for users and properties
- **Actions**: Reschedule, cancel, mark as completed
- **Filtering**: By date, property, user, status

### Booking Management
- **List View**: Comprehensive booking overview
- **Actions**: Cancel, process payments, add reviews
- **Status Tracking**: Pending, confirmed, completed

### Agent Management (Admin Only)
- **CRUD Operations**: Create, edit, deactivate agents
- **Performance Stats**: KPIs, satisfaction scores, workload metrics
- **Assignment**: Manage user-agent relationships

### Analytics & Reporting (Admin Only)
- **System Metrics**: User growth, property trends, revenue
- **Agent Performance**: Leaderboards, completion rates
- **Charts**: Visual representations of key data

## Backend Integration

### Required Endpoints
- **Auth**: `POST /auth/login/`
- **Properties**: `GET/POST/PUT/DELETE /properties/`, `GET /properties/{id}/`
- **Users**: `GET /users/`, `GET /users/{id}/`, `PUT /users/{id}/`, `POST /users/{id}/assign-agent/`
- **Visits**: `GET /visits/`, `POST /visits/`, `GET /visits/{id}/`, `POST /visits/{id}/reschedule`, `POST /visits/{id}/cancel`, `POST /visits/{id}/complete`
- **Bookings**: `GET /bookings/`, `GET /bookings/{id}/`, `POST /bookings/cancel/`, `POST /bookings/payment/`, `POST /bookings/review/`
- **Agents**: `GET /agents/`, `POST /agents/`, `GET/PUT /agents/{id}/`, `GET /agents/{id}/stats/`
- **Analytics**: `GET /agents/system/stats/`, `GET /agents/system/workload/`
- **Amenities**: `GET /amenities/`
- **Storage**: File upload endpoint for Supabase Storage integration

### Assumptions
- Backend enforces role-based access control
- Agents can only access data for their assigned users/properties
- CORS configured for frontend origin
- Supabase handles authentication and file storage
- Row-level security (RLS) implemented in database

## Development Notes
- All API calls use real backend endpoints (no mocks)
- TypeScript for type safety across the application
- Progressive enhancement with Shadcn UI components
- Responsive design with Tailwind CSS
- Form validation with Zod schemas
- Toast notifications for user feedback

