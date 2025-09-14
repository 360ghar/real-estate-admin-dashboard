import { useState } from 'react'
import { useAddReviewMutation, useCancelBookingMutation, useGetBookingQuery, useProcessPaymentMutation } from '@/store/services/bookingsApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

const BookingDetail = ({ id }: { id: number }) => {
  const { data } = useGetBookingQuery(id)
  const [open, setOpen] = useState<'cancel' | 'payment' | 'review' | null>(null)
  const [text, setText] = useState('')
  const [payment, setPayment] = useState({ method: 'upi', txn: '', amount: '' })
  const [cancel, cancelState] = useCancelBookingMutation()
  const [pay, payState] = useProcessPaymentMutation()
  const [review, reviewState] = useAddReviewMutation()
  const { toast } = useToast()

  const doCancel = async () => {
    try {
      await cancel({ id, reason: text || undefined }).unwrap()
      toast({ title: 'Cancelled', description: 'Booking cancelled' })
      setOpen(null)
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.data?.detail || 'Try again', variant: 'destructive' })
    }
  }
  const doPay = async () => {
    try {
      await pay({ id, payment_method: payment.method, transaction_id: payment.txn, amount: Number(payment.amount) }).unwrap()
      toast({ title: 'Payment processed', description: 'Payment recorded' })
      setOpen(null)
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.data?.detail || 'Try again', variant: 'destructive' })
    }
  }
  const doReview = async () => {
    try {
      const [ratingStr, ...rest] = text.split(' ')
      const rating = Number(ratingStr) || 5
      const reviewText = rest.join(' ') || 'Great stay.'
      await review({ id, rating, review: reviewText }).unwrap()
      toast({ title: 'Review added', description: 'Thank you' })
      setOpen(null)
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.data?.detail || 'Try again', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Booking Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div><span className="text-muted-foreground">Property:</span> #{data?.property_id}</div>
            <div><span className="text-muted-foreground">User:</span> #{data?.user_id}</div>
            <div><span className="text-muted-foreground">Stay:</span> {data ? `${new Date(data.check_in).toLocaleDateString()} – ${new Date(data.check_out).toLocaleDateString()}` : '-'}</div>
            <div><span className="text-muted-foreground">Nights:</span> {data?.nights}</div>
            <div><span className="text-muted-foreground">Amount:</span> ₹{data?.total_amount}</div>
            <div><span className="text-muted-foreground">Status:</span> {data?.status}</div>
            <div><span className="text-muted-foreground">Payment:</span> {data?.payment_status || '-'}</div>
          </div>
          <div className="mt-4 flex gap-2">
            {(data?.status === 'pending' || data?.status === 'confirmed') && (
              <>
                <Button onClick={() => setOpen('cancel')}>Cancel</Button>
                <Button variant="outline" onClick={() => setOpen('payment')}>Process Payment</Button>
              </>
            )}
            {data?.status === 'completed' && <Button onClick={() => setOpen('review')}>Add Review</Button>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{open}</DialogTitle>
          </DialogHeader>
          {open === 'payment' ? (
            <div className="grid gap-2">
              <label className="text-sm">Payment Method</label>
              <Select value={payment.method} onValueChange={(value) => setPayment({ ...payment, method: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
              <label className="text-sm">Transaction ID</label>
              <Input value={payment.txn} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayment({ ...payment, txn: e.target.value })} />
              <label className="text-sm">Amount</label>
              <Input type="number" value={payment.amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayment({ ...payment, amount: e.target.value })} />
            </div>
          ) : (
            <Input placeholder={open === 'cancel' ? 'Reason' : 'Rating 1-5 + review'} value={text} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>Close</Button>
            {open === 'cancel' && <Button onClick={doCancel} disabled={cancelState.isLoading}>{cancelState.isLoading ? 'Cancelling…' : 'Cancel Booking'}</Button>}
            {open === 'payment' && <Button onClick={doPay} disabled={payState.isLoading || !payment.txn || !payment.amount}>{payState.isLoading ? 'Processing…' : 'Process'}</Button>}
            {open === 'review' && <Button onClick={doReview} disabled={reviewState.isLoading}>{reviewState.isLoading ? 'Saving…' : 'Add Review'}</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BookingDetail
