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
import { useListPropertiesQuery } from '../api/propertiesApi'
import { Skeleton } from '@/components/ui/skeleton'

type Props = { mode?: 'create' | 'edit' | 'view' }

const StatsCard = ({
  icon: Icon,
  label,
  value,
  colorClass,
  bgClass,
  isLoading
}: {
  icon: any,
  label: string,
  value: number | string,
  colorClass: string,
  bgClass: string,
  isLoading: boolean
}) => (
  <div className="flex items-center gap-3 p-4 rounded-lg border bg-card shadow-sm">
    <div className={`p-2 rounded-full ${bgClass}`}>
      <Icon className={`h-4 w-4 ${colorClass}`} />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLoading ? (
        <Skeleton className="h-8 w-16 mt-1" />
      ) : (
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      )}
    </div>
  </div>
)

const PropertiesPage = ({ mode }: Props) => {
  const params = useParams()
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)
  const role = (user?.role as 'admin' | 'agent' | 'user') || (user?.agent_id ? 'agent' : 'admin')

  // Fetch stats
  // We use limit=1 to minimize data transfer, we just want the count
  const { data: allProps, isLoading: loadingAll } = useListPropertiesQuery({ limit: 1, ...(role === 'agent' && user?.agent_id ? { agent_id: user.agent_id } : {}) })
  const { data: availProps, isLoading: loadingAvail } = useListPropertiesQuery({ limit: 1, status: 'available', ...(role === 'agent' && user?.agent_id ? { agent_id: user.agent_id } : {}) })
  const { data: rentedProps, isLoading: loadingRented } = useListPropertiesQuery({ limit: 1, status: 'rented', ...(role === 'agent' && user?.agent_id ? { agent_id: user.agent_id } : {}) })

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            <div className="flex items-center gap-3 self-start md:self-auto">
              <Badge variant="secondary" className="px-3 py-1 hidden md:inline-flex">
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
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            <StatsCard
              icon={Home}
              label="Total Properties"
              value={allProps?.count || 0}
              isLoading={loadingAll}
              colorClass="text-primary"
              bgClass="bg-primary/10"
            />

            <StatsCard
              icon={TrendingUp}
              label="Available"
              value={availProps?.count || 0}
              isLoading={loadingAvail}
              colorClass="text-green-600"
              bgClass="bg-green-500/10"
            />

            <StatsCard
              icon={Users}
              label="Rented/Sold"
              value={rentedProps?.count || 0}
              isLoading={loadingRented}
              colorClass="text-blue-600"
              bgClass="bg-blue-500/10"
            />
          </div>
        </div>

        {/* Properties List */}
        <PropertyList />
      </div>
    </ErrorBoundary>
  )
}

export default PropertiesPage
