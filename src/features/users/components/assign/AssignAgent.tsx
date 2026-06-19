import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import Combobox from '@/components/ui/combobox'
import { useListAgentsQuery } from '@/features/agents/api/agentsApi'
import { useAssignAgentMutation } from '@/features/users/api/usersApi'
import { getErrorMessage } from '@/lib/errors'

const AssignAgent = ({ userId }: { userId: number }) => {
  const [agentId, setAgentId] = useState<number | ''>('')
  const agents = useListAgentsQuery({})
  const { toast } = useToast()
  const [assignAgent, { isLoading }] = useAssignAgentMutation()

  const assign = async () => {
    if (!agentId) return
    try {
      await assignAgent({ userId, agentId: Number(agentId) }).unwrap()
      toast({ title: 'Assigned', description: 'Agent assigned successfully' })
    } catch (e: unknown) {
      toast({ title: 'Failed', description: getErrorMessage(e, 'Please try again'), variant: 'destructive' })
    }
  }

  return (
    <div className="flex gap-2">
      <div className="w-64">
        <Combobox
          items={(agents.data?.items ?? []).map((a) => ({ value: a.id, label: a.name }))}
          value={agentId}
          onChange={(v) => setAgentId(v !== '' ? Number(v) : '')}
          placeholder="Search agent…"
        />
      </div>
      <Button onClick={() => { void assign() }} disabled={!agentId || isLoading}>{isLoading ? 'Assigning…' : 'Assign'}</Button>
    </div>
  )
}

export default AssignAgent
