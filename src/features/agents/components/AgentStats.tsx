import { useGetAgentQuery, useGetAgentStatsQuery } from '@/features/agents/api/agentsApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const Stat = ({ label, value }: { label: string; value: any }) => (
  <div className="rounded-md border bg-card p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-lg font-semibold">{String(value ?? '--')}</div>
  </div>
)

const AgentStats = ({ id }: { id: number }) => {
  const agent = useGetAgentQuery(id)
  const stats = useGetAgentStatsQuery(id)
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Agent Stats</h1>
      <Card>
        <CardHeader>
          <CardTitle>{agent.data?.name || 'Agent'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Properties Handled" value={stats.data?.performance_metrics?.properties_handled} />
            <Stat label="Visits Completed" value={stats.data?.performance_metrics?.visits_completed} />
            <Stat label="Bookings Converted" value={stats.data?.performance_metrics?.bookings_converted} />
            <Stat label="Satisfaction" value={stats.data?.performance_metrics?.client_satisfaction_score} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AgentStats
