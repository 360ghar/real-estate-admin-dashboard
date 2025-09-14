import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGetAgentProfileQuery, useGetSystemWorkloadQuery, useGetSystemStatsQuery } from '@/store/services/agentsApi'
import { useGetUserVisitsQuery } from '@/store/services/visitsApi'
import { useGetUserBookingsQuery } from '@/store/services/bookingsApi'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, Users, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {trend && (
        <div className={`flex items-center text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`h-3 w-3 mr-1 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`} />
          {trend.value}% from last month
        </div>
      )}
    </CardContent>
  </Card>
)

const AgentDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  // Fetch agent profile
  const { data: agentProfile, isLoading: profileLoading } = useGetAgentProfileQuery()

  // Fetch system workload and stats (admin only)
  const { data: systemWorkload } = useGetSystemWorkloadQuery(undefined, {
    skip: user?.role !== 'admin'
  })
  const { data: systemStats } = useGetSystemStatsQuery(undefined, {
    skip: user?.role !== 'admin'
  })

  // Fetch agent's visits and bookings
  const { data: visitsData } = useGetUserVisitsQuery()
  const { data: bookingsData } = useGetUserBookingsQuery()

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const agentWorkload = systemWorkload?.find(w => w.agent_id === agentProfile?.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {agentProfile?.user?.full_name || 'Agent'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
            size="sm"
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
            size="sm"
          >
            Month
          </Button>
          <Button
            variant={timeRange === 'year' ? 'default' : 'outline'}
            onClick={() => setTimeRange('year')}
            size="sm"
          >
            Year
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Clients"
          value={agentWorkload?.active_clients || 0}
          description="Currently assigned clients"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Upcoming Visits"
          value={visitsData?.upcoming || 0}
          description="Scheduled property visits"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Active Bookings"
          value={agentWorkload?.active_bookings || bookingsData?.upcoming || 0}
          description="Ongoing property bookings"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Completion Rate"
          value={`${agentProfile?.performance_metrics?.client_satisfaction_score || 0}%`}
          description="Client satisfaction"
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: 12,
            isPositive: true
          }}
        />
      </div>

      {/* Agent Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Profile</CardTitle>
          <CardDescription>Your professional information and performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
              <p className="text-lg">{agentProfile?.employee_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Specialization</p>
              <p className="text-lg capitalize">{agentProfile?.specialization}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Agent Type</p>
              <Badge variant="secondary" className="capitalize">
                {agentProfile?.agent_type}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Experience</p>
              <p className="text-lg">{agentProfile?.years_of_experience} years</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Availability</p>
            <Badge variant={agentProfile?.is_available ? "default" : "secondary"}>
              {agentProfile?.is_available ? "Available" : "Unavailable"}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Service Areas</p>
            <div className="flex flex-wrap gap-2">
              {agentProfile?.service_areas?.map((area, index) => (
                <Badge key={index} variant="outline">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Languages</p>
            <div className="flex flex-wrap gap-2">
              {agentProfile?.languages?.map((lang, index) => (
                <Badge key={index} variant="outline">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          {agentProfile?.bio && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Bio</p>
              <p className="text-sm">{agentProfile.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Your performance statistics and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {agentProfile?.performance_metrics?.total_properties_sold || 0}
              </p>
              <p className="text-sm text-muted-foreground">Properties Sold</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {agentProfile?.performance_metrics?.total_properties_rented || 0}
              </p>
              <p className="text-sm text-muted-foreground">Properties Rented</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {agentProfile?.performance_metrics?.visits_completed || 0}
              </p>
              <p className="text-sm text-muted-foreground">Visits Completed</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {agentProfile?.performance_metrics?.bookings_converted || 0}
              </p>
              <p className="text-sm text-muted-foreground">Bookings Converted</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {agentProfile?.commission_rate}%
              </p>
              <p className="text-sm text-muted-foreground">Commission Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {agentWorkload?.utilization_rate ? Math.round(agentWorkload.utilization_rate * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Utilization Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workload Alert */}
      {agentWorkload && agentWorkload.utilization_rate > 0.8 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">High Workload Alert</p>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              Your current workload is at {Math.round(agentWorkload.utilization_rate * 100)}%. Consider managing your schedule effectively.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
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

      {/* System Stats (Admin Only) */}
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
                <p className="text-2xl font-bold text-primary">
                  {systemStats.average_clients_per_agent.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Clients/Agent</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{systemStats.total_clients_assigned}</p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AgentDashboardPage
