import { useGetAgentQuery, useGetAgentStatsQuery } from '@/store/services/agentsApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const Stat = ({ label, value }: { label: string; value: any }) => (
  <div className="rounded-md border bg-white p-3">
    <div className="text-xs text-slate-500">{label}</div>
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
            <Stat label="Users Assigned" value={stats.data?.users_assigned} />
            <Stat label="Satisfaction" value={stats.data?.satisfaction} />
            <Stat label="Active Conversations" value={stats.data?.active_conversations} />
            <Stat label="Efficiency Score" value={stats.data?.efficiency_score} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AgentStats

