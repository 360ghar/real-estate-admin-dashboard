import { Link, useNavigate, useParams } from 'react-router-dom'
import PropertyList from './components/PropertyList'
import PropertyForm from './components/PropertyForm'
import PropertyDetail from './components/PropertyDetail'

type Props = { mode?: 'create' | 'edit' | 'view' }

const PropertiesPage = ({ mode }: Props) => {
  const params = useParams()
  const navigate = useNavigate()
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Properties</h1>
        <Link to="/properties/new" className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/90">
          Add Property
        </Link>
      </div>
      <PropertyList />
    </div>
  )
}

export default PropertiesPage
