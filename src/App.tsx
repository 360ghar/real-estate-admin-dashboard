import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from '@/features/auth/components/PrivateRoute'
import RoleBasedRoute from '@/features/auth/components/RoleBasedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { PageLoading } from '@/components/common/PageLoading'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const SignupPage = lazy(() => import('@/features/auth/pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'))
const DashboardPage = lazy(() => import('@/features/core/pages/DashboardPage'))
const PropertiesPage = lazy(() => import('@/features/properties/pages/PropertiesPage'))
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'))
const AgentsPage = lazy(() => import('@/features/agents/pages/AgentsPage'))
const VisitsPage = lazy(() => import('@/features/visits/pages/VisitsPage'))
const BookingsPage = lazy(() => import('@/features/bookings/pages/BookingsPage'))
const AnalyticsPage = lazy(() => import('@/features/core/pages/AnalyticsPage'))
const AccessDeniedPage = lazy(() => import('@/features/core/pages/AccessDeniedPage'))
const ProfilePage = lazy(() => import('@/features/core/pages/ProfilePage'))
const AgentProfilePage = lazy(() => import('@/features/agents/pages/AgentProfilePage'))
const UserPreferencesPage = lazy(() => import('@/features/core/pages/UserPreferencesPage'))
const AgentDashboardPage = lazy(() => import('@/features/agents/pages/AgentDashboardPage'))
const UserProfilePage = lazy(() => import('@/features/users/pages/UserProfilePage'))
const VisitManagementPage = lazy(() => import('@/features/visits/pages/VisitManagementPage'))
const BookingManagementPage = lazy(() => import('@/features/bookings/pages/BookingManagementPage'))
const BugReportsPage = lazy(() => import('@/features/core/pages/BugReportsPage'))
const PagesManagementPage = lazy(() => import('@/features/core/pages/PagesManagementPage'))
const AppUpdatesPage = lazy(() => import('@/features/core/pages/AppUpdatesPage'))
const BlogsPage = lazy(() => import('@/features/blog/pages/BlogsPage'))
const CategoriesPage = lazy(() => import('@/features/blog/pages/categories/CategoriesPage'))
const TagsPage = lazy(() => import('@/features/blog/pages/tags/TagsPage'))
const NotificationsPage = lazy(() => import('@/features/core/pages/NotificationsPage'))
const SwipePage = lazy(() => import('@/features/swipes/pages/SwipePage'))
function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              {/* All users */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/users/preferences" element={<UserPreferencesPage />} />
              <Route path="/users/profile" element={<UserProfilePage />} />

              {/* Staff-only (admin + agent) */}
              <Route element={<RoleBasedRoute allowedRoles={["admin", "agent"]} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/properties" element={<PropertiesPage />} />
                <Route path="/properties/new" element={<PropertiesPage mode="create" />} />
                <Route path="/properties/:id" element={<PropertiesPage mode="edit" />} />
                <Route path="/properties/:id/view" element={<PropertiesPage mode="view" />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/:id" element={<UsersPage mode="detail" />} />
                <Route path="/agents/me" element={<AgentProfilePage />} />
                <Route path="/agents/dashboard" element={<AgentDashboardPage />} />
                <Route path="/visits" element={<VisitsPage />} />
                <Route path="/visits/new" element={<VisitsPage mode="create" />} />
                <Route path="/visits/:id" element={<VisitsPage mode="detail" />} />
                <Route path="/visits/manage" element={<VisitManagementPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/bookings/:id" element={<BookingsPage mode="detail" />} />
                <Route path="/bookings/manage" element={<BookingManagementPage />} />
                <Route path="/swipes" element={<SwipePage />} />

                {/* Admin-only nested */}
                <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
                  <Route path="/agents" element={<AgentsPage />} />
                  <Route path="/agents/new" element={<AgentsPage mode="create" />} />
                  <Route path="/agents/:id" element={<AgentsPage mode="edit" />} />
                  <Route path="/agents/:id/stats" element={<AgentsPage mode="stats" />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/bug-reports" element={<BugReportsPage />} />
                  <Route path="/blogs" element={<BlogsPage />} />
                  <Route path="/blogs/new" element={<BlogsPage mode="create" />} />
                  <Route path="/blogs/:identifier" element={<BlogsPage mode="detail" />} />
                  <Route path="/blogs/:identifier/edit" element={<BlogsPage mode="edit" />} />
                  <Route path="/blogs/categories" element={<CategoriesPage />} />
                  <Route path="/blogs/tags" element={<TagsPage />} />
                  <Route path="/pages" element={<PagesManagementPage />} />
                  <Route path="/app-updates" element={<AppUpdatesPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  {/* Reviews module removed */}
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
