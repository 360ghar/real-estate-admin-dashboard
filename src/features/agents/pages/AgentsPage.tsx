import { Link, useParams } from 'react-router-dom'
import AgentList from '../components/AgentList'
import AgentForm from '../components/AgentForm'
import AgentStats from '../components/AgentStats'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'

const AgentsPage = ({ mode }: { mode?: 'create' | 'edit' | 'stats' }) => {
  const params = useParams()
  if (mode === 'create') return <AgentForm />
  if (mode === 'edit') return <AgentForm id={Number(params.id)} />
  if (mode === 'stats') return <AgentStats id={Number(params.id)} />
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            Agents
          </h1>
          <p className="text-muted-foreground">
            Manage agents, availability, and performance stats
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">Admin View</Badge>
          <Button asChild>
            <Link to="/agents/new">New Agent</Link>
          </Button>
        </div>
      </div>
      <AgentList />
    </div>
  )
}

export default AgentsPage
