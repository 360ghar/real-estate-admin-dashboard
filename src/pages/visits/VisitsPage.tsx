import { Link, useParams } from 'react-router-dom'
import VisitList from './components/VisitList'
import VisitForm from './components/VisitForm'
import VisitDetail from './components/VisitDetail'

const VisitsPage = ({ mode }: { mode?: 'create' | 'detail' }) => {
  const params = useParams()
  if (mode === 'create') return <VisitForm />
  if (mode === 'detail') return <VisitDetail id={Number(params.id)} />
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Visits</h1>
        <Link to="/visits/new" className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/90">Schedule Visit</Link>
      </div>
      <VisitList />
    </div>
  )
}

export default VisitsPage
