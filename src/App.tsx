import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '@/features/auth/pages/LoginPage'
import SignupPage from '@/features/auth/pages/SignupPage'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage'
import DashboardPage from '@/features/core/pages/DashboardPage'
import PropertiesPage from '@/features/properties/pages/PropertiesPage'
import UsersPage from '@/features/users/pages/UsersPage'
import AgentsPage from '@/features/agents/pages/AgentsPage'
import VisitsPage from '@/features/visits/pages/VisitsPage'
import BookingsPage from '@/features/bookings/pages/BookingsPage'
import AnalyticsPage from '@/features/core/pages/AnalyticsPage'
import PrivateRoute from '@/features/auth/components/PrivateRoute'
import RoleBasedRoute from '@/features/auth/components/RoleBasedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AccessDeniedPage from '@/features/core/pages/AccessDeniedPage'
import ProfilePage from '@/features/core/pages/ProfilePage'
import AgentProfilePage from '@/features/agents/pages/AgentProfilePage'
import UserPreferencesPage from '@/features/core/pages/UserPreferencesPage'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import AgentDashboardPage from '@/features/agents/pages/AgentDashboardPage'
import UserProfilePage from '@/features/users/pages/UserProfilePage'
import VisitManagementPage from '@/features/visits/pages/VisitManagementPage'
import BookingManagementPage from '@/features/bookings/pages/BookingManagementPage'
import BugReportsPage from '@/features/core/pages/BugReportsPage'
import PagesManagementPage from '@/features/core/pages/PagesManagementPage'
import AppUpdatesPage from '@/features/core/pages/AppUpdatesPage'
import BlogsPage from '@/features/blog/pages/BlogsPage'
import CategoriesPage from '@/features/blog/pages/categories/CategoriesPage'
import TagsPage from '@/features/blog/pages/tags/TagsPage'
import NotificationsPage from '@/features/core/pages/NotificationsPage'
import SwipePage from '@/features/swipes/pages/SwipePage'

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default App
