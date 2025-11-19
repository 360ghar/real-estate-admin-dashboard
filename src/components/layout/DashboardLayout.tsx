import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { Toaster } from '@/components/ui/toaster'

const DashboardLayout = () => {
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-w-0 flex-1 overflow-y-auto bg-muted/40 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export default DashboardLayout
