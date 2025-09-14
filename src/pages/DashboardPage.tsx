import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useGetSystemStatsQuery } from '@/store/services/systemApi'
import { useGetAgentStatsQuery } from '@/store/services/agentsApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { TrendingUp, Users, Building2, Calendar, ArrowUpRight, ArrowDownRight, Activity, DollarSign, MapPin, Clock } from 'lucide-react'

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  isLoading = false
}: {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: { value: number; label: string };
  isLoading?: boolean;
}) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {Icon && (
        <div className="p-2 bg-primary/10 rounded-full">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      )}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {trend && (
            <div className="flex items-center text-xs mt-1">
              {trend.value > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={trend.value > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground ml-1">{trend.label}</span>
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
)

const DashboardPage = () => {
  const user = useAppSelector(selectCurrentUser)
  const role: 'admin' | 'agent' | 'user' = (user?.role as any) || (user?.agent_id ? 'agent' : 'admin')
  const system = useGetSystemStatsQuery(undefined, { skip: role !== 'admin' })
  const agentStats = useGetAgentStatsQuery(user?.agent_id!, { skip: role !== 'agent' || !user?.agent_id })

  // TODO: Replace with real API data for charts and activity feed
  // const weeklyVisitData = [] // Fetch from API endpoint
  // const propertyStatusData = [] // Fetch from API endpoint
  // const revenueData = [] // Fetch from API endpoint
  // const activityFeed = [] // Fetch from API endpoint

  const isLoading = system.isLoading || agentStats.isLoading

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {role === 'agent' ? 'Agent' : 'Admin'} Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back{user?.full_name ? `, ${user.full_name}` : ''}! Here's what's happening with your {role === 'agent' ? 'assigned properties' : 'platform'} today.
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {role === 'agent' ? (
          <>
            <StatCard
              title="Properties Managed"
              value={(agentStats.data as any)?.properties_managed ?? '--'}
              icon={Building2}
              trend={{ value: 12, label: 'from last month' }}
              isLoading={isLoading}
            />
            <StatCard
              title="Active Users"
              value={(agentStats.data as any)?.users_assigned ?? '--'}
              icon={Users}
              trend={{ value: 8, label: 'from last month' }}
              isLoading={isLoading}
            />
            <StatCard
              title="Upcoming Visits"
              value={(agentStats.data as any)?.upcoming_visits ?? '--'}
              icon={Calendar}
              trend={{ value: 15, label: 'from last week' }}
              isLoading={isLoading}
            />
            <StatCard
              title="Pending Bookings"
              value={(agentStats.data as any)?.pending_bookings ?? '--'}
              icon={DollarSign}
              trend={{ value: -3, label: 'from last month' }}
              isLoading={isLoading}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Active Agents"
              value={system.data?.active_agents ?? '--'}
              icon={Users}
              trend={{ value: 5, label: 'from last month' }}
              isLoading={isLoading}
            />
            <StatCard
              title="Active Users"
              value={system.data?.active_users ?? '--'}
              icon={Users}
              trend={{ value: 18, label: 'from last month' }}
              isLoading={isLoading}
            />
            <StatCard
              title="Properties Listed"
              value={system.data?.properties_listed ?? '--'}
              icon={Building2}
              trend={{ value: 12, label: 'from last month' }}
              isLoading={isLoading}
            />
            <StatCard
              title="Occupancy Rate"
              value={`${system.data?.occupancy_rate ?? '--'}%`}
              icon={TrendingUp}
              trend={{ value: 7, label: 'from last month' }}
              isLoading={isLoading}
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Weekly Activity Overview</CardTitle>
              <Badge variant="outline" className="text-xs">
                Last 7 days
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">Chart data will be available when API endpoints are implemented</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Visits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Bookings</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">Property status data will be available when API endpoints are implemented</p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="text-center text-muted-foreground text-sm">
                No data available
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart (Admin Only) */}
      {role === 'admin' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Monthly Revenue Trend</CardTitle>
              <Badge variant="outline" className="text-xs">
                6 months
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">Revenue data will be available when API endpoints are implemented</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Live Feed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Activity feed will be available when API endpoints are implemented</p>
            </div>
          </div>
          <div className="text-center mt-6">
            <div className="text-sm text-muted-foreground">
              No recent activity
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
