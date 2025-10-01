import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import PropertiesPage from './pages/properties/PropertiesPage'
import UsersPage from './pages/users/UsersPage'
import AgentsPage from './pages/agents/AgentsPage'
import VisitsPage from './pages/visits/VisitsPage'
import BookingsPage from './pages/bookings/BookingsPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import PrivateRoute from './components/auth/PrivateRoute'
import RoleBasedRoute from './components/auth/RoleBasedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import AccessDeniedPage from './pages/AccessDeniedPage'
import ProfilePage from './pages/ProfilePage'
import AgentProfilePage from './pages/AgentProfilePage'
import UserPreferencesPage from './pages/UserPreferencesPage'
import ErrorBoundary from './components/ErrorBoundary'
import AgentDashboardPage from './pages/agents/AgentDashboardPage'
import UserProfilePage from './pages/users/UserProfilePage'
import PropertyFormPage from './pages/properties/PropertyFormPage'
import VisitManagementPage from './pages/visits/VisitManagementPage'
import BookingManagementPage from './pages/bookings/BookingManagementPage'
import BugReportsPage from './pages/bug-reports/BugReportsPage'
import PagesManagementPage from './pages/pages/PagesManagementPage'
import AppUpdatesPage from './pages/app-updates/AppUpdatesPage'
import BlogsPage from './pages/blogs/BlogsPage'
import CategoriesPage from './pages/blogs/categories/CategoriesPage'
import TagsPage from './pages/blogs/tags/TagsPage'

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
