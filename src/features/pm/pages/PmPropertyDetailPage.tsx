import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Building2, FileText, Settings2 } from 'lucide-react'
import type { ManagedPropertyStatus, ManagedPropertyUpdate } from '@/types/pm'
import {
  useGetPmPropertyDetailQuery,
  useUpdatePmPropertyMutation,
} from '@/features/pm/api/pmApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/ui/empty-state'
import { MANAGED_PROPERTY_STATUSES } from '@/features/pm/constants'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/errors'

const statusVariant = (status?: ManagedPropertyStatus | null) => {
  if (status === 'active') return 'default'
  if (status === 'draft') return 'secondary'
  return 'outline'
}

export default function PmPropertyDetailPage() {
  const { propertyId } = useParams()
  const propertyIdNum = Number(propertyId)
  const { toast } = useToast()

  const detail = useGetPmPropertyDetailQuery(propertyIdNum, { skip: !propertyIdNum })
  const [updatePmProperty, updateState] = useUpdatePmPropertyMutation()

  const prop = detail.data?.property
  const activeLease = detail.data?.active_lease

  const [open, setOpen] = useState(false)
  const [managementStatus, setManagementStatus] = useState<ManagedPropertyStatus>('active')
  const [paymentDueDay, setPaymentDueDay] = useState<string>('1')
  const [graceDays, setGraceDays] = useState<string>('5')
  const [lateFeePolicyJson, setLateFeePolicyJson] = useState<string>('{}')

  const lateFeePreview = useMemo(() => {
    if (!activeLease?.monthly_rent) return null
    try {
      const parsed = JSON.parse(lateFeePolicyJson || '{}') as Record<string, unknown>
      const type = parsed.type
      if (type === 'fixed' && typeof parsed.amount === 'number') {
        return `If rent is ₹${activeLease.monthly_rent.toLocaleString('en-IN')}, late fee = ₹${parsed.amount.toLocaleString('en-IN')}`
      }
      if (type === 'percentage' && typeof parsed.percent === 'number') {
        const fee = Math.round((activeLease.monthly_rent * parsed.percent) / 100)
        return `If rent is ₹${activeLease.monthly_rent.toLocaleString('en-IN')}, late fee ≈ ₹${fee.toLocaleString('en-IN')} (${parsed.percent}%)`
      }
      return null
    } catch {
      return null
    }
  }, [activeLease?.monthly_rent, lateFeePolicyJson])

  const openEdit = () => {
    if (!prop) return
    setManagementStatus((prop.management_status as ManagedPropertyStatus) || 'active')
    setPaymentDueDay(String(prop.payment_due_day ?? 1))
    setGraceDays(String(prop.grace_period_days ?? 5))
    setLateFeePolicyJson(JSON.stringify(prop.late_fee_policy ?? {}, null, 2))
    setOpen(true)
  }

  const submit = async () => {
    if (!prop) return
    let lateFeePolicy: Record<string, unknown> | null = null
    try {
      lateFeePolicy = JSON.parse(lateFeePolicyJson || '{}') as Record<string, unknown>
    } catch {
      toast({ title: 'Invalid JSON', description: 'Late fee policy must be valid JSON.', variant: 'destructive' })
      return
    }

    const dueDayNum = Number(paymentDueDay)
    if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 28) {
      toast({ title: 'Invalid due day', description: 'Payment due day must be between 1 and 28.', variant: 'destructive' })
      return
    }
    const graceDaysNum = Number(graceDays)
    if (isNaN(graceDaysNum) || graceDaysNum < 0 || graceDaysNum > 30) {
      toast({ title: 'Invalid grace period', description: 'Grace period must be between 0 and 30 days.', variant: 'destructive' })
      return
    }

    const payload: ManagedPropertyUpdate = {
      management_status: managementStatus,
      payment_due_day: dueDayNum,
      grace_period_days: graceDaysNum,
      late_fee_policy: lateFeePolicy,
    }

    try {
      await updatePmProperty({ property_id: prop.id, payload }).unwrap()
      toast({ title: 'Updated', description: 'Property settings updated.' })
      setOpen(false)
    } catch (e: unknown) {
      toast({ title: 'Failed', description: getErrorMessage(e, 'Could not update property.'), variant: 'destructive' })
    }
  }

  if (!propertyIdNum || Number.isNaN(propertyIdNum)) {
    return <EmptyState title="Invalid property id" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {detail.isLoading ? 'Loading…' : prop?.title || `Property #${propertyIdNum}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {(prop?.full_address || prop?.locality || prop?.city || '').toString() || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">ID: {propertyIdNum}</Badge>
          <Badge variant={statusVariant(prop?.management_status)}>{prop?.management_status || '—'}</Badge>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={openEdit} disabled={!prop}>
                <Settings2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit PM Settings</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Management status</Label>
                  <Select value={managementStatus} onValueChange={(v) => setManagementStatus(v as ManagedPropertyStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MANAGED_PROPERTY_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment due day (1-28)</Label>
                  <Input value={paymentDueDay} onChange={(e) => setPaymentDueDay(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Grace period days</Label>
                  <Input value={graceDays} onChange={(e) => setGraceDays(e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Late fee policy (JSON)</Label>
                  <Textarea value={lateFeePolicyJson} onChange={(e) => setLateFeePolicyJson(e.target.value)} rows={6} />
                  {lateFeePreview ? (
                    <div className="text-xs text-muted-foreground">{lateFeePreview}</div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Example: {`{"type":"fixed","amount":500}`} or {`{"type":"percentage","percent":2}`}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => { void submit() }} disabled={updateState.isLoading}>
                  {updateState.isLoading ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {detail.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : prop ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="font-medium">#{prop.owner_id}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Occupancy</span>
                  <Badge variant={prop.current_lease_id ? 'default' : 'outline'}>
                    {prop.current_lease_id ? 'occupied' : 'vacant'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Payment due day</span>
                  <span className="font-medium">{prop.payment_due_day ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Grace period</span>
                  <span className="font-medium">{prop.grace_period_days ?? '—'} days</span>
                </div>
              </>
            ) : (
              <EmptyState title="Property not found" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lease & Tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {detail.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : activeLease ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Lease</span>
                  <Button asChild variant="link" className="h-auto p-0">
                    <Link to={`/pm/leases/${activeLease.id}`}>#{activeLease.id}</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary">{activeLease.status}</Badge>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Tenant</span>
                  <span className="font-medium">{activeLease.tenant_name || activeLease.tenant_phone || '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Monthly rent</span>
                  <span className="font-medium">₹{activeLease.monthly_rent.toLocaleString('en-IN')}</span>
                </div>
              </>
            ) : (
              <EmptyState title="No active lease" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Rent</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link to="/pm/rent-ledger">Open rent ledger</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link to="/pm/documents">Open documents</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
