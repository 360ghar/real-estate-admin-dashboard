import { Activity } from 'lucide-react'
import { useUserRole } from '@/hooks/useUserRole'
import { Badge } from '@/components/ui/badge'
import { AdminKpis, AgentKpis } from '@/features/core/components/dashboard/DashboardKpis'
import { BusinessMetrics } from '@/features/core/components/dashboard/BusinessMetrics'
import { ActivityTrendCard, PropertyStatusCard } from '@/features/core/components/dashboard/DashboardCharts'
import { RecentActivityCard } from '@/features/core/components/dashboard/RecentActivityCard'
import { QuickActions } from '@/features/core/components/dashboard/QuickActions'
import { useDashboardActivity } from '@/features/core/hooks/useDashboardData'
import ErrorBoundary from '@/components/common/ErrorBoundary'

const DashboardPage = () => {
  const { user, role } = useUserRole()
  const activity = useDashboardActivity()

  return (
    <ErrorBoundary>
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {role === 'agent' ? 'Agent' : 'Admin'} Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back{user?.full_name ? `, ${user.full_name}` : '!'} Here's what's happening with your{' '}
            {role === 'agent' ? 'assigned portfolio' : 'platform'}.
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          <Activity className="mr-1 h-3 w-3" />
          Live
        </Badge>
      </div>

      {role === 'agent' ? <AgentKpis agentId={user?.agent_id} /> : <AdminKpis />}

      {role !== 'agent' && <BusinessMetrics />}

      <QuickActions role={role} />

      <div className="grid gap-6 lg:grid-cols-3">
        <ActivityTrendCard
          className="lg:col-span-2"
          trend={activity.trend}
          isLoading={activity.isLoading}
          isError={activity.isError}
          onRetry={activity.refetch}
        />
        <PropertyStatusCard />
      </div>

      <RecentActivityCard
        feed={activity.feed}
        isLoading={activity.isLoading}
        isError={activity.isError}
        onRetry={activity.refetch}
      />
    </div>
    </ErrorBoundary>
  )
}

export default DashboardPage
