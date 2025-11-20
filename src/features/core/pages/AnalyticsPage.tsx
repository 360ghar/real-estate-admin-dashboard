import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useGetSystemStatsQuery, useGetWorkloadQuery } from '@/features/core/api/systemApi'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import { useState } from 'react'

const KPI = ({ label, value, isLoading }: { label: string; value: any; isLoading?: boolean }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{label}</CardTitle>
      {isLoading ? <Skeleton className="h-4 w-4" /> : <Home className="h-4 w-4 text-muted-foreground" />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-20" /> : String(value ?? '--')}</div>
      <p className="text-xs text-muted-foreground">+20.1% from last month</p>
    </CardContent>
  </Card>
)

const AnalyticsPage = () => {
  const [view, setView] = useState('workload')
  const stats = useGetSystemStatsQuery()
  const workload = useGetWorkloadQuery()
  const s = stats.data
  const workloadData = (() => {
    const w = workload.data || []
    if (Array.isArray(w)) {
      return w.map((item) => ({
        name: item.agent_name,
        value: item.utilization_percentage,
        current: item.current_users,
        queue: item.queue_length,
      }))
    }
    // Fallback if backend returns a map
    return Object.entries(w as Record<string, number>).map(([name, value]) => ({ name, value }))
  })()
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">System Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <KPI label="Total Agents" value={s?.total_agents} isLoading={stats.isLoading} />
            <KPI label="Active Agents" value={s?.active_agents} isLoading={stats.isLoading} />
            <KPI label="Users Served" value={s?.total_users_served} isLoading={stats.isLoading} />
            <KPI label="Satisfaction Score" value={s?.system_satisfaction_score} isLoading={stats.isLoading} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Agent Workload</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Metric: {view === 'utilization' ? 'Utilization %' : view === 'users' ? 'Current Users' : 'Queue Length'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setView('utilization')}>Utilization %</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('users')}>Current Users</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('queue')}>Queue Length</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          {workload.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Failed to load analytics</AlertTitle>
              <AlertDescription>Check your connection and try again.</AlertDescription>
            </Alert>
          )}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide={false} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey={view === 'users' ? 'current' : view === 'queue' ? 'queue' : 'value'}
                  fill="#0ea5e9"
                  name={view === 'users' ? 'Current Users' : view === 'queue' ? 'Queue Length' : 'Utilization %'}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsPage
