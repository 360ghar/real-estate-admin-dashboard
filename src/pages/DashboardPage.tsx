import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useGetSystemStatsQuery } from '@/store/services/systemApi'
import { useGetAgentStatsQuery } from '@/store/services/agentsApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Building2, Calendar } from 'lucide-react'

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend
}: {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: { value: number; label: string };
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p className="text-xs text-muted-foreground">
          {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
        </p>
      )}
    </CardContent>
  </Card>
)

const DashboardPage = () => {
  const user = useAppSelector(selectCurrentUser)
  const role = user?.agent_id ? 'agent' : 'admin'
  const system = useGetSystemStatsQuery(undefined, { skip: role !== 'admin' })
  const agentStats = useGetAgentStatsQuery(user?.agent_id!, { skip: role !== 'agent' || !user?.agent_id })
  // const workload = useGetWorkloadQuery(undefined, { skip: role !== 'admin' })

  // Mock data for charts (replace with real API data)
  const weeklyVisitData = [
    { day: 'Mon', visits: 12 },
    { day: 'Tue', visits: 19 },
    { day: 'Wed', visits: 8 },
    { day: 'Thu', visits: 15 },
    { day: 'Fri', visits: 22 },
    { day: 'Sat', visits: 18 },
    { day: 'Sun', visits: 10 }
  ]

  const propertyStatusData = [
    { name: 'Available', value: 45, color: '#10b981' },
    { name: 'Rented', value: 32, color: '#3b82f6' },
    { name: 'Maintenance', value: 15, color: '#f59e0b' },
    { name: 'Inactive', value: 8, color: '#ef4444' }
  ]

  const activityFeed = [
    { id: 1, action: 'User scheduled a visit', property: 'Sunset Villa', time: '2 mins ago' },
    { id: 2, action: 'New booking confirmed', property: 'Ocean View Apartment', time: '1 hour ago' },
    { id: 3, action: 'Property updated', property: 'Downtown Loft', time: '3 hours ago' },
    { id: 4, action: 'Agent assigned to user', user: 'John Doe', time: '5 hours ago' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{role === 'agent' ? 'Agent' : 'Admin'} Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your {role === 'agent' ? 'assigned properties' : 'platform'} today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {role === 'agent' ? (
          <>
            <StatCard
              title="Properties Managed"
              value={agentStats.data?.properties_managed ?? '--'}
              icon={Building2}
              trend={{ value: 12, label: 'from last month' }}
            />
            <StatCard
              title="Active Users"
              value={agentStats.data?.users_assigned ?? '--'}
              icon={Users}
              trend={{ value: 8, label: 'from last month' }}
            />
            <StatCard
              title="Upcoming Visits"
              value={agentStats.data?.upcoming_visits ?? '--'}
              icon={Calendar}
            />
            <StatCard
              title="Pending Bookings"
              value={agentStats.data?.pending_bookings ?? '--'}
              icon={TrendingUp}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Active Agents"
              value={system.data?.active_agents ?? '--'}
              icon={Users}
              trend={{ value: 5, label: 'from last month' }}
            />
            <StatCard
              title="Active Users"
              value={system.data?.active_users ?? '--'}
              icon={Users}
              trend={{ value: 18, label: 'from last month' }}
            />
            <StatCard
              title="Properties Listed"
              value={system.data?.properties_listed ?? '--'}
              icon={Building2}
              trend={{ value: 12, label: 'from last month' }}
            />
            <StatCard
              title="Occupancy Rate"
              value={`${system.data?.occupancy_rate ?? '--'}%`}
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Visit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyVisitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={propertyStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {propertyStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityFeed.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 rounded-md border p-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.property || activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
