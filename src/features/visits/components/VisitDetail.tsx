import { useState } from 'react'
import { useGetVisitQuery, useRescheduleVisitMutation, useCancelVisitMutation, useCompleteVisitMutation } from '@/features/visits/api/visitsApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

const VisitDetail = ({ id }: { id: number }) => {
  const { data } = useGetVisitQuery(id)
  const [open, setOpen] = useState<'reschedule' | 'cancel' | 'complete' | null>(null)
  const [date, setDate] = useState('')
  const [text, setText] = useState('')
  const [reschedule, resState] = useRescheduleVisitMutation()
  const [cancel, cancelState] = useCancelVisitMutation()
  const [complete, compState] = useCompleteVisitMutation()
  const { toast } = useToast()
  const canManageVisit = data?.status ? ['scheduled', 'confirmed', 'rescheduled'].includes(data.status) : false

  const doReschedule = async () => {
    try {
      await reschedule({ visitId: id, newDate: new Date(date).toISOString(), reason: text || 'Rescheduled' }).unwrap()
      toast({ title: 'Rescheduled', description: 'Visit rescheduled' })
      setOpen(null)
    } catch (e: unknown) {
      toast({ title: 'Failed', description: (e as any)?.data?.detail || 'Try again', variant: 'destructive' })
    }
  }
  const doCancel = async () => {
    try {
      await cancel({ visitId: id, reason: text || 'Cancelled' }).unwrap()
      toast({ title: 'Cancelled', description: 'Visit cancelled' })
      setOpen(null)
    } catch (e: unknown) {
      toast({ title: 'Failed', description: (e as any)?.data?.detail || 'Try again', variant: 'destructive' })
    }
  }
  const doComplete = async () => {
    try {
      await complete({ visitId: id, visit_notes: text || undefined }).unwrap()
      toast({ title: 'Completed', description: 'Visit marked as completed' })
      setOpen(null)
    } catch (e: unknown) {
      toast({ title: 'Failed', description: (e as any)?.data?.detail || 'Try again', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Visit Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div><span className="text-muted-foreground">Property:</span> #{data?.property_id}</div>
            <div><span className="text-muted-foreground">User:</span> #{data?.user_id}</div>
            <div><span className="text-muted-foreground">Scheduled:</span> {data ? new Date(data.scheduled_date).toLocaleString() : '-'}</div>
            <div><span className="text-muted-foreground">Status:</span> {data?.status}</div>
          </div>
          <div className="mt-4 flex gap-2">
            {canManageVisit && (
              <>
                <Button onClick={() => setOpen('reschedule')}>Reschedule</Button>
                <Button variant="outline" onClick={() => setOpen('cancel')}>Cancel</Button>
                <Button variant="outline" onClick={() => setOpen('complete')}>Mark Completed</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{open}</DialogTitle>
          </DialogHeader>
          {open === 'reschedule' && (
            <Input type="datetime-local" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} />
          )}
          <Input placeholder={open === 'complete' ? 'Notes' : 'Reason'} value={text} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>Close</Button>
            {open === 'reschedule' && (
              <Button onClick={doReschedule} disabled={!date || resState.isLoading}>{resState.isLoading ? 'Saving…' : 'Reschedule'}</Button>
            )}
            {open === 'cancel' && <Button onClick={doCancel} disabled={cancelState.isLoading}>{cancelState.isLoading ? 'Cancelling…' : 'Cancel Visit'}</Button>}
            {open === 'complete' && <Button onClick={doComplete} disabled={compState.isLoading}>{compState.isLoading ? 'Saving…' : 'Complete'}</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VisitDetail
