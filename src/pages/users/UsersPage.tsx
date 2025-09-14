import { useParams } from 'react-router-dom'
import UserList from './components/UserList'
import UserDetail from './components/UserDetail'
import { Users, UserPlus, TrendingUp, Shield, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'

const UsersPage = ({ mode }: { mode?: 'detail' }) => {
  const params = useParams()
  const user = useAppSelector(selectCurrentUser)
  const role = (user?.role as 'admin' | 'agent' | 'user') || (user?.agent_id ? 'agent' : 'admin')

  if (mode === 'detail') {
    const id = Number(params.id)
    return <UserDetail id={id} />
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              Users
            </h1>
            <p className="text-muted-foreground">
              {role === 'agent'
                ? 'Manage users assigned to you and track their interactions'
                : 'Manage all users in the system and oversee user accounts'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1">
              {role === 'admin' ? 'Admin View' : 'Agent View'}
            </Badge>
            {role === 'admin' && (
              <Button asChild className="gap-2">
                <Link to="/users/new">
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">--</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
            <div className="p-2 bg-green-500/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-green-600">--</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
            <div className="p-2 bg-blue-500/10 rounded-full">
              <Phone className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone Verified</p>
              <p className="text-2xl font-bold text-blue-600">--</p>
            </div>
          </div>

          {role === 'admin' && (
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <div className="p-2 bg-orange-500/10 rounded-full">
                <Shield className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agents</p>
                <p className="text-2xl font-bold text-orange-600">--</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Users List */}
      <UserList />
    </div>
  )
}

export default UsersPage
