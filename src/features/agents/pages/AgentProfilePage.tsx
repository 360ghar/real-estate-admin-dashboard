import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/features/auth/slices/authSlice'
import { useGetAgentProfileQuery } from '@/features/agents/api/agentsApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Phone, Mail, Users, TrendingUp, Star } from 'lucide-react'

const AgentProfilePage = () => {
  const user = useAppSelector(selectCurrentUser)
  const { data: agentProfile, isLoading } = useGetAgentProfileQuery()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!agentProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">Unable to load agent profile information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your agent profile and view your performance metrics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-semibold text-primary">
                  {agentProfile.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{agentProfile.name}</h3>
                <p className="text-muted-foreground capitalize">{agentProfile.agent_type} Agent</p>
                <Badge variant={agentProfile.is_available ? 'default' : 'secondary'}>
                  {agentProfile.is_available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{agentProfile.contact_number || user?.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">Level: {agentProfile.experience_level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Users Assigned: {agentProfile.total_users_assigned}</span>
                </div>
              </div>
            </div>

            {agentProfile.description && (
              <div>
                <h4 className="font-medium mb-2">Bio</h4>
                <p className="text-sm text-muted-foreground">{agentProfile.description}</p>
              </div>
            )}

            {agentProfile.languages && agentProfile.languages.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {agentProfile.languages.map((lang, index) => (
                    <Badge key={index} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {agentProfile.user_satisfaction_rating || 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground">User Satisfaction</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Users Assigned</span>
                <span className="font-medium">{agentProfile.total_users_assigned || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Status</span>
                <Badge variant={agentProfile.is_active ? 'success' : 'secondary'}>
                   {agentProfile.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Working Hours */}
      {agentProfile.working_hours && (
        <Card>
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {Object.entries(agentProfile.working_hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="capitalize">{day}</span>
                  <span className="text-muted-foreground">{String(hours)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AgentProfilePage
