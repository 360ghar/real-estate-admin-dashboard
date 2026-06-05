import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/common/ErrorBoundary'

const DashboardLayout = () => {
  const location = useLocation()
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-cohere-sm focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main
          id="main-content"
          className="min-w-0 flex-1 overflow-y-auto bg-muted/40 p-4 pb-20 md:pb-4 lg:p-6 lg:pb-6"
        >
          {/* Keyed by route so a crash in one page is isolated and the
              boundary resets when the user navigates elsewhere. */}
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <BottomNav />
      <Toaster />
    </div>
  )
}

export default DashboardLayout
