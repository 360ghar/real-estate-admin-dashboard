import { Suspense, lazy, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from '@/features/auth/components/PrivateRoute'
import RoleBasedRoute from '@/features/auth/components/RoleBasedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { PageLoading } from '@/components/common/PageLoading'
import { useAppDispatch } from '@/hooks/redux'
import { clearCredentials, loadUserFromStorage, setCredentials, setInitialized } from '@/features/auth/slices/authSlice'
import { supabase } from '@/lib/supabase'
import { store } from '@/store'
import { fetchUserProfileWithToken } from '@/lib/auth'

/**
 * Module-level flag set by LoginPage.finishLogin before it dispatches credentials.
 * When true, the onAuthStateChange SIGNED_IN handler skips the redundant profile
 * fetch — the login flow is already handling it.
 */
export const isLoginInProgress = { current: false }

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const SignupPage = lazy(() => import('@/features/auth/pages/SignupPage'))
const AuthCallbackPage = lazy(() => import('@/features/auth/pages/AuthCallbackPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
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
const ModerationQueuePage = lazy(() => import('@/features/flatmates/pages/ModerationQueuePage'))
const ReportsReviewPage = lazy(() => import('@/features/flatmates/pages/ReportsReviewPage'))
const BookingManagementPage = lazy(() => import('@/features/bookings/pages/BookingManagementPage'))
const BugReportsPage = lazy(() => import('@/features/core/pages/BugReportsPage'))
const PagesManagementPage = lazy(() => import('@/features/core/pages/PagesManagementPage'))
const FaqsManagementPage = lazy(() => import('@/features/core/pages/FaqsManagementPage'))
const AppUpdatesPage = lazy(() => import('@/features/core/pages/AppUpdatesPage'))
const BlogsPage = lazy(() => import('@/features/blog/pages/BlogsPage'))
const CategoriesPage = lazy(() => import('@/features/blog/pages/categories/CategoriesPage'))
const TagsPage = lazy(() => import('@/features/blog/pages/tags/TagsPage'))
const NotificationsPage = lazy(() => import('@/features/core/pages/NotificationsPage'))
const SwipePage = lazy(() => import('@/features/swipes/pages/SwipePage'))
const NotFoundPage = lazy(() => import('@/features/core/pages/NotFoundPage'))

// Property Management (PM)
const PmDashboardPage = lazy(() => import('@/features/pm/pages/PmDashboardPage'))
const PmOwnersPage = lazy(() => import('@/features/pm/pages/PmOwnersPage'))
const PmOwnerDetailPage = lazy(() => import('@/features/pm/pages/PmOwnerDetailPage'))
const PmPropertiesPage = lazy(() => import('@/features/pm/pages/PmPropertiesPage'))
const PmPropertyDetailPage = lazy(() => import('@/features/pm/pages/PmPropertyDetailPage'))
const PmApplicationsPage = lazy(() => import('@/features/pm/pages/PmApplicationsPage'))
const PmApplicationDetailPage = lazy(() => import('@/features/pm/pages/PmApplicationDetailPage'))
const PmLeasesPage = lazy(() => import('@/features/pm/pages/PmLeasesPage'))
const PmLeaseDetailPage = lazy(() => import('@/features/pm/pages/PmLeaseDetailPage'))
const PmRentLedgerPage = lazy(() => import('@/features/pm/pages/PmRentLedgerPage'))
const PmExpensesPage = lazy(() => import('@/features/pm/pages/PmExpensesPage'))
const PmMaintenancePage = lazy(() => import('@/features/pm/pages/PmMaintenancePage'))
const PmDocumentsPage = lazy(() => import('@/features/pm/pages/PmDocumentsPage'))
const PmInspectionsPage = lazy(() => import('@/features/pm/pages/PmInspectionsPage'))
const PmInspectionDetailPage = lazy(() => import('@/features/pm/pages/PmInspectionDetailPage'))
const PmReportsPage = lazy(() => import('@/features/pm/pages/PmReportsPage'))
const PmAuditLogPage = lazy(() => import('@/features/pm/pages/PmAuditLogPage'))
const PmSettingsPage = lazy(() => import('@/features/pm/pages/PmSettingsPage'))

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!supabase) {
      dispatch(clearCredentials())
      dispatch(setInitialized(true))
      return
    }

    let isMounted = true
    const client = supabase

    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        // TOKEN_REFRESHED: prepareHeaders already reads the fresh token from
        // supabase.auth.getSession() on every API call — no Redux update needed.
        if (event === 'TOKEN_REFRESHED') return

        if (event === 'SIGNED_OUT') {
          dispatch(clearCredentials())
          return
        }

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (!session?.access_token) {
            dispatch(clearCredentials())
            if (event === 'INITIAL_SESSION') {
              dispatch(setInitialized(true))
            }
            return
          }

          // SIGNED_IN fires after LoginPage already set credentials in Redux.
          // Skip the redundant profile fetch — either credentials are already
          // set, or the login flow is mid-flight and will set them shortly.
          if (event === 'SIGNED_IN') {
            if (isLoginInProgress.current) return
            const { auth } = store.getState()
            if (auth.token && auth.user) return
          }

          const user = await fetchUserProfileWithToken(session.access_token)
          if (!isMounted) return

          if (user) {
            dispatch(setCredentials({ token: session.access_token, user }))
          } else {
            // Profile fetch failed — do NOT sign out of Supabase.
            // The session is still valid; the backend may be temporarily down.
            // Fall back to the cached user so the session survives a refresh.
            const cachedUser = loadUserFromStorage()
            if (cachedUser) {
              dispatch(setCredentials({ token: session.access_token, user: cachedUser }))
            } else {
              dispatch(clearCredentials())
            }
          }

          if (event === 'INITIAL_SESSION') {
            dispatch(setInitialized(true))
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [dispatch])

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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

                {/* PM Portal */}
                <Route path="/pm" element={<Navigate to="/pm/dashboard" replace />} />
                <Route path="/pm/dashboard" element={<PmDashboardPage />} />
                <Route path="/pm/owners" element={<PmOwnersPage />} />
                <Route path="/pm/owners/:ownerId" element={<PmOwnerDetailPage />} />
                <Route path="/pm/properties" element={<PmPropertiesPage />} />
                <Route path="/pm/properties/:propertyId" element={<PmPropertyDetailPage />} />
                <Route path="/pm/applications" element={<PmApplicationsPage />} />
                <Route path="/pm/applications/:applicationId" element={<PmApplicationDetailPage />} />
                <Route path="/pm/leases" element={<PmLeasesPage />} />
                <Route path="/pm/leases/:leaseId" element={<PmLeaseDetailPage />} />
                <Route path="/pm/rent-ledger" element={<PmRentLedgerPage />} />
                <Route path="/pm/expenses" element={<PmExpensesPage />} />
                <Route path="/pm/maintenance" element={<PmMaintenancePage />} />
                <Route path="/pm/documents" element={<PmDocumentsPage />} />
                <Route path="/pm/inspections" element={<PmInspectionsPage />} />
                <Route path="/pm/inspections/:inspectionId" element={<PmInspectionDetailPage />} />
                <Route path="/pm/reports" element={<PmReportsPage />} />

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
                  <Route path="/flatmates/moderation" element={<ModerationQueuePage />} />
                  <Route path="/flatmates/reports" element={<ReportsReviewPage />} />
                  <Route path="/bug-reports" element={<BugReportsPage />} />
                  <Route path="/blogs" element={<BlogsPage />} />
                  <Route path="/blogs/new" element={<BlogsPage mode="create" />} />
                  <Route path="/blogs/:identifier" element={<BlogsPage mode="detail" />} />
                  <Route path="/blogs/:identifier/edit" element={<BlogsPage mode="edit" />} />
                  <Route path="/blogs/categories" element={<CategoriesPage />} />
                  <Route path="/blogs/tags" element={<TagsPage />} />
                  <Route path="/pages" element={<PagesManagementPage />} />
                  <Route path="/faqs" element={<FaqsManagementPage />} />
                  <Route path="/app-updates" element={<AppUpdatesPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  {/* Reviews module removed */}

                  {/* PM admin-only */}
                  <Route path="/pm/audit" element={<PmAuditLogPage />} />
                  <Route path="/pm/settings" element={<PmSettingsPage />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
