import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useGetSystemStatsQuery, useGetWorkloadQuery } from '@/features/core/api/systemApi'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import { useState } from 'react'
import { formatNumber, formatPercent } from '@/lib/format'

const WORKLOAD_COLOR = 'hsl(218 77% 48%)'

type KPIValue = number | string | null | undefined

const KPI = ({ label, value, isLoading }: { label: string; value: KPIValue; isLoading?: boolean }) => (
  <Card className="rounded-cohere-md border-cohere-card-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      {isLoading ? <Skeleton className="h-4 w-4" /> : <Home className="h-4 w-4 text-muted-foreground" />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-semibold tracking-tight">
        {isLoading ? <Skeleton className="h-8 w-20" /> : String(value ?? '—')}
      </div>
    </CardContent>
  </Card>
)

const AnalyticsPage = () => {
  const [view, setView] = useState<'workload' | 'properties' | 'bookings'>('workload')
  const stats = useGetSystemStatsQuery()
  const workload = useGetWorkloadQuery()
  const s = stats.data ?? { active_agents: 0, active_users: 0, properties_listed: 0, occupancy_rate: 0 }
  const workloadData = workload.data?.map((w) => ({
    name: w.agent_name,
    value: w.current_users,
  })) ?? []
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">System Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.isError ? (
            <ErrorState title="Could not load KPIs" onRetry={() => void stats.refetch()} />
          ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <KPI label="Active Agents" value={formatNumber(s.active_agents)} isLoading={stats.isLoading} />
            <KPI label="Active Users" value={formatNumber(s.active_users)} isLoading={stats.isLoading} />
            <KPI label="Properties Listed" value={formatNumber(s.properties_listed)} isLoading={stats.isLoading} />
            <KPI label="Occupancy Rate" value={formatPercent(s.occupancy_rate)} isLoading={stats.isLoading} />
          </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Agent Workload</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                View: {view}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setView('properties')}>Properties</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('bookings')}>Bookings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('workload')}>Agent Workload</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          {workload.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : workload.isError ? (
            <ErrorState title="Failed to load analytics" onRetry={() => void workload.refetch()} />
          ) : view === 'workload' ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 3% 90%)" vertical={false} />
                  <XAxis dataKey="name" hide={false} interval={0} angle={-20} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={WORKLOAD_COLOR} name="Workload" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : view === 'properties' ? (
            <div className="flex h-64 w-full items-center justify-center">
              <p className="text-muted-foreground">Properties view — displaying property listing data</p>
            </div>
          ) : (
            <div className="flex h-64 w-full items-center justify-center">
              <p className="text-muted-foreground">Bookings view — displaying booking analytics data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsPage
