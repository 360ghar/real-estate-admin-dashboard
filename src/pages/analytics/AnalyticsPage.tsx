import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useGetSystemStatsQuery, useGetWorkloadQuery } from '@/store/services/systemApi'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const KPI = ({ label, value }: { label: string; value: any }) => (
  <div className="rounded-md border bg-white p-3">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="text-lg font-semibold">{String(value ?? '--')}</div>
  </div>
)

const AnalyticsPage = () => {
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KPI label="Active Agents" value={s.active_agents} />
            <KPI label="Active Users" value={s.active_users} />
            <KPI label="Properties Listed" value={s.properties_listed} />
            <KPI label="Occupancy Rate" value={s.occupancy_rate} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Agent Workload</CardTitle>
        </CardHeader>
        <CardContent>
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
