import { Link, useParams } from 'react-router-dom'
import AgentList from './components/AgentList'
import AgentForm from './components/AgentForm'
import AgentStats from './components/AgentStats'

const AgentsPage = ({ mode }: { mode?: 'create' | 'edit' | 'stats' }) => {
  const params = useParams()
  if (mode === 'create') return <AgentForm />
  if (mode === 'edit') return <AgentForm id={Number(params.id)} />
  if (mode === 'stats') return <AgentStats id={Number(params.id)} />
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Agents</h1>
        <Link to="/agents/new" className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/90">New Agent</Link>
      </div>
      <AgentList />
    </div>
  )
}

export default AgentsPage
