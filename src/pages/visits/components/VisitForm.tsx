import { useState } from 'react'
import { useCreateVisitMutation } from '@/store/services/visitsApi'
import { useListUsersQuery } from '@/store/services/usersApi'
import { useListPropertiesQuery } from '@/store/services/propertiesApi'
// native select controls
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const VisitForm = () => {
  const [userId, setUserId] = useState<number | ''>('')
  const [propertyId, setPropertyId] = useState<number | ''>('')
  const [date, setDate] = useState('')
  const [requirements, setRequirements] = useState('')
  const { toast } = useToast()
  const [create, createState] = useCreateVisitMutation()
  const users = useListUsersQuery({})
  const properties = useListPropertiesQuery({})

  const submit = async () => {
    if (!userId || !propertyId || !date) return
    try {
      await create({ user_id: Number(userId), property_id: Number(propertyId), scheduled_date: new Date(date).toISOString(), status: 'scheduled', agent_id: undefined }).unwrap()
      toast({ title: 'Scheduled', description: 'Visit scheduled' })
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.data?.detail || 'Please try again', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Schedule Visit</h1>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">User</label>
              <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={String(userId)} onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Select user</option>
                {users.data?.results?.map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name || u.phone || `User ${u.id}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Property</label>
              <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={String(propertyId)} onChange={(e) => setPropertyId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Select property</option>
                {properties.data?.results?.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Date & Time</label>
              <Input type="datetime-local" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Special requirements</label>
              <Input value={requirements} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequirements(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={submit} disabled={createState.isLoading || !userId || !propertyId || !date}>{createState.isLoading ? 'Saving…' : 'Create Visit'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VisitForm
