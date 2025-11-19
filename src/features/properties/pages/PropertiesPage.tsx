import { Link, useNavigate, useParams } from 'react-router-dom'
import PropertyList from '../components/PropertyList'
import PropertyForm from '../components/PropertyForm'
import PropertyDetail from '../components/PropertyDetail'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, Home, TrendingUp, Users, MapPin } from 'lucide-react'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/features/auth/slices/authSlice'
import ErrorBoundary from '@/components/common/ErrorBoundary'

type Props = { mode?: 'create' | 'edit' | 'view' }

const PropertiesPage = ({ mode }: Props) => {
  const params = useParams()
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)
  const role = (user?.role as 'admin' | 'agent' | 'user') || (user?.agent_id ? 'agent' : 'admin')

  if (mode === 'create') {
    return <PropertyForm onSuccess={(id) => navigate(`/properties/${id}`)} />
  }
  if (mode === 'edit') {
    const id = Number(params.id)
    return <PropertyForm id={id} onSuccess={(pid) => navigate(`/properties/${pid}`)} />
  }
  if (mode === 'view') {
    const id = Number(params.id)
    return <PropertyDetail id={id} />
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                Properties
              </h1>
              <p className="text-muted-foreground">
                {role === 'agent'
                  ? 'Manage properties assigned to you and track their performance'
                  : 'Manage all properties in the system and oversee the real estate portfolio'
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                {role === 'admin' ? 'Admin View' : 'Agent View'}
              </Badge>
              <Button asChild className="gap-2">
                <Link to="/properties/new">
                  <Plus className="h-4 w-4" />
                  Add Property
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <div className="p-2 bg-primary/10 rounded-full">
                <Home className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <div className="p-2 bg-green-500/10 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">--</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rented</p>
                <p className="text-2xl font-bold text-blue-600">--</p>
              </div>
            </div>

            {role === 'admin' && (
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                <div className="p-2 bg-orange-500/10 rounded-full">
                  <MapPin className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Locations</p>
                  <p className="text-2xl font-bold text-orange-600">--</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties List */}
        <PropertyList />
      </div>
    </ErrorBoundary>
  )
}

export default PropertiesPage
