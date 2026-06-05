import { Users, Building2, TrendingUp, UserCog, MessageSquare, Activity, Star } from 'lucide-react'
import { useGetSystemStatsQuery } from '@/features/core/api/systemApi'
import { useGetAgentStatsQuery } from '@/features/agents/api/agentsApi'
import { formatNumber, formatPercent } from '@/lib/format'
import { ErrorState } from '@/components/ui/error-state'
import { StatCard } from './StatCard'

export function AdminKpis() {
  const { data, isLoading, isError, refetch } = useGetSystemStatsQuery()

  if (isError) {
    return <ErrorState title="Couldn't load platform stats" onRetry={() => void refetch()} />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Agents"
        value={formatNumber(data?.active_agents)}
        icon={UserCog}
        hint={data?.total_agents !== undefined ? `of ${formatNumber(data.total_agents)} total` : undefined}
        isLoading={isLoading}
        to="/agents"
      />
      <StatCard
        title="Active Users"
        value={formatNumber(data?.active_users)}
        icon={Users}
        isLoading={isLoading}
        to="/users"
      />
      <StatCard
        title="Properties Listed"
        value={formatNumber(data?.properties_listed)}
        icon={Building2}
        isLoading={isLoading}
        to="/properties"
      />
      <StatCard
        title="Occupancy Rate"
        value={formatPercent(data?.occupancy_rate)}
        icon={TrendingUp}
        isLoading={isLoading}
      />
    </div>
  )
}

export function AgentKpis({ agentId }: { agentId?: number | null }) {
  const { data, isLoading, isError, refetch } = useGetAgentStatsQuery(agentId ?? 0, { skip: !agentId })
  const stats = data?.stats

  if (isError) {
    return <ErrorState title="Couldn't load your stats" onRetry={() => void refetch()} />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Assigned Users"
        value={formatNumber(stats?.total_users_assigned)}
        icon={Users}
        isLoading={isLoading}
        to="/users"
      />
      <StatCard
        title="Satisfaction"
        value={stats?.user_satisfaction_rating != null ? `${stats.user_satisfaction_rating.toFixed(1)}/5` : '—'}
        icon={Star}
        isLoading={isLoading}
      />
      <StatCard
        title="Active Conversations"
        value={formatNumber(stats?.active_conversations)}
        icon={MessageSquare}
        isLoading={isLoading}
      />
      <StatCard
        title="Weekly Interactions"
        value={formatNumber(stats?.weekly_interactions)}
        icon={Activity}
        isLoading={isLoading}
      />
    </div>
  )
}
