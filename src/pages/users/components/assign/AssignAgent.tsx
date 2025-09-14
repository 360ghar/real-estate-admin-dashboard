import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import Combobox from '@/components/ui/combobox'
import { useListAgentsQuery } from '@/store/services/agentsApi'
import { usersApi } from '@/store/services/usersApi'
import { useAppDispatch } from '@/hooks/redux'

const AssignAgent = ({ userId }: { userId: number }) => {
  const [agentId, setAgentId] = useState<number | ''>('')
  const agents = useListAgentsQuery({})
  const { toast } = useToast()
  const dispatch = useAppDispatch()

  const assign = async () => {
    if (!agentId) return
    try {
      await dispatch(
        usersApi.endpoints.assignAgent.initiate({ userId, agentId: Number(agentId) })
      ).unwrap()
      toast({ title: 'Assigned', description: 'Agent assigned successfully' })
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.data?.detail || 'Please try again', variant: 'destructive' })
    }
  }

  return (
    <div className="flex gap-2">
      <div className="w-64">
        <Combobox
          items={(agents.data?.results || []).map((a) => ({ value: String(a.id), label: a.name }))}
          value={String(agentId)}
          onChange={(v) => setAgentId(v ? Number(v) : '')}
          placeholder="Search agent…"
        />
      </div>
      <Button onClick={assign} disabled={!agentId}>Assign</Button>
    </div>
  )
}

export default AssignAgent
