import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGetAgentProfileQuery, useGetAgentStatsQuery } from '@/features/agents/api/agentsApi'
import { useGetWorkloadQuery, useGetSystemStatsQuery } from '@/features/core/api/systemApi'
import { useGetUserVisitsQuery } from '@/features/visits/api/visitsApi'
import { useGetUserBookingsQuery } from '@/features/bookings/api/bookingsApi'
import { useAuth } from '@/hooks/useAuth'
import { Users, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
import { LoadingState } from '@/components/ui/loading-state'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
)

const AgentDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: agentProfile, isLoading: profileLoading } = useGetAgentProfileQuery()
  const { data: agentStats } = useGetAgentStatsQuery(agentProfile?.id || 0, { skip: !agentProfile?.id })

  const { data: systemWorkload } = useGetWorkloadQuery(undefined, {
    skip: user?.role !== 'admin'
  })
  const { data: systemStats } = useGetSystemStatsQuery(undefined, {
    skip: user?.role !== 'admin'
  })

  const { data: visitsData } = useGetUserVisitsQuery()
  const { data: bookingsData } = useGetUserBookingsQuery()

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingState type="spinner" />
      </div>
    )
  }

  const stats = agentStats?.stats
  const agentWorkload = systemWorkload?.find((w) => w.agent_id === agentProfile?.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {agentProfile?.name || 'Agent'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned Users"
          value={stats?.total_users_assigned ?? agentProfile?.total_users_assigned ?? 0}
          description="Users mapped to this agent"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Upcoming Visits"
          value={visitsData?.upcoming || 0}
          description="Scheduled property visits"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Upcoming Bookings"
          value={bookingsData?.upcoming || 0}
          description="Bookings in progress"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Satisfaction"
          value={agentProfile?.user_satisfaction_rating ?? 0}
          description="Current rating"
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Profile</CardTitle>
          <CardDescription>Your profile information and availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{agentProfile?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact</p>
              <p className="text-lg">{agentProfile?.contact_number || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Agent Type</p>
              <Badge variant="secondary" className="capitalize">
                {agentProfile?.agent_type}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Experience</p>
              <p className="text-lg capitalize">{agentProfile?.experience_level || '-'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Availability</p>
            <Badge variant={agentProfile?.is_available ? 'default' : 'secondary'}>
              {agentProfile?.is_available ? 'Available' : 'Unavailable'}
            </Badge>
          </div>

          {agentProfile?.languages && agentProfile.languages.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {agentProfile.languages.map((lang, index) => (
                  <Badge key={index} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {agentProfile?.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
              <p className="text-sm">{agentProfile.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Service-level interaction stats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">{stats?.active_conversations || 0}</p>
              <p className="text-sm text-muted-foreground">Active Conversations</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">{stats?.daily_interactions || 0}</p>
              <p className="text-sm text-muted-foreground">Daily Interactions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">{stats?.weekly_interactions || 0}</p>
              <p className="text-sm text-muted-foreground">Weekly Interactions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">{stats?.efficiency_score || 0}</p>
              <p className="text-sm text-muted-foreground">Efficiency Score</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">{agentProfile?.total_users_assigned || 0}</p>
              <p className="text-sm text-muted-foreground">Total Users Assigned</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">{agentWorkload ? Math.round(agentWorkload.utilization_percentage) : 0}%</p>
              <p className="text-sm text-muted-foreground">Utilization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {agentWorkload && agentWorkload.utilization_percentage > 80 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">High Workload Alert</p>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              Your current workload is at {Math.round(agentWorkload.utilization_percentage)}%.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to perform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-3">
            <Button
              variant="outline"
              onClick={() => navigate('/properties')}
              className="justify-start"
            >
              View Properties
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/visits')}
              className="justify-start"
            >
              Manage Visits
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/bookings')}
              className="justify-start"
            >
              View Bookings
            </Button>
          </div>
        </CardContent>
      </Card>

      {user?.role === 'admin' && systemStats && (
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Agent system statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{systemStats.total_agents}</p>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{systemStats.active_agents}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{systemStats.total_users_served}</p>
                <p className="text-sm text-muted-foreground">Total Users Served</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{systemStats.system_satisfaction_score.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">System Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AgentDashboardPage
