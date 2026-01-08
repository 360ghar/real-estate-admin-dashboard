import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import { Toaster } from '@/components/ui/toaster'

const DashboardLayout = () => {
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-w-0 flex-1 overflow-y-auto bg-muted/40 p-4 pb-20 md:pb-4 lg:p-6 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <Toaster />
    </div>
  )
}

export default DashboardLayout
