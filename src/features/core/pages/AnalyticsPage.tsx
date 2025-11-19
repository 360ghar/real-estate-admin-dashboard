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
  const s = stats.data || {}
  const workloadData = (() => {
    const w = workload.data || {}
    // Support object map or array shape
    if (Array.isArray(w)) return w
    return Object.entries(w).map(([name, value]) => ({ name, value: Number(value) }))
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
            <KPI label="Active Agents" value={s.active_agents} isLoading={stats.isLoading} />
            <KPI label="Active Users" value={s.active_users} isLoading={stats.isLoading} />
            <KPI label="Properties Listed" value={s.properties_listed} isLoading={stats.isLoading} />
            <KPI label="Occupancy Rate" value={s.occupancy_rate} isLoading={stats.isLoading} />
          </div>
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
                <Bar dataKey="value" fill="#0ea5e9" name="Workload" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsPage
