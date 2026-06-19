import { Link, useParams } from 'react-router-dom'
import VisitList from '../components/VisitList'
import VisitForm from '../components/VisitForm'
import VisitDetail from '../components/VisitDetail'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const VisitsPage = ({ mode }: { mode?: 'create' | 'detail' }) => {
  const params = useParams()
  if (mode === 'create') return <VisitForm />
  if (mode === 'detail') return <VisitDetail id={Number(params.id)} />
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Visits</h1>
        <Button asChild className="gap-2">
          <Link to="/visits/new">
            <Plus className="h-4 w-4" />
            Schedule Visit
          </Link>
        </Button>
      </div>
      <VisitList />
    </div>
  )
}

export default VisitsPage
