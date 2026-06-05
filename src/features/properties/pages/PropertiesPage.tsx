import { Link, useNavigate, useParams } from 'react-router-dom'
import PropertyList from '../components/PropertyList'
import PropertyForm from '../components/PropertyForm'
import PropertyDetail from '../components/PropertyDetail'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus } from 'lucide-react'
import { useUserRole } from '@/hooks/useUserRole'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { PropertyQuickStats } from '../components/PropertyQuickStats'

type Props = { mode?: 'create' | 'edit' | 'view' }

const PropertiesPage = ({ mode }: Props) => {
  const params = useParams()
  const navigate = useNavigate()
  const { role } = useUserRole()

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
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-cohere-sm">
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

          {/* Quick Stats — real counts from the search API */}
          <PropertyQuickStats />
        </div>

        {/* Properties List */}
        <PropertyList />
      </div>
    </ErrorBoundary>
  )
}

export default PropertiesPage
