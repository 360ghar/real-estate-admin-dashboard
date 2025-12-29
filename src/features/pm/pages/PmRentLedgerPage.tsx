import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Download, Plus } from 'lucide-react'
import OwnerScopeGate from '@/features/pm/components/OwnerScopeGate'
import { useUserRole } from '@/hooks/useUserRole'
import { useAppSelector } from '@/hooks/redux'
import { selectSelectedOwnerId } from '@/features/pm/slices/pmSlice'
import {
  type DocumentType,
  type RentChargeWithTotals,
  type RentPayment,
  type RentPaymentCreate,
  type RentChargeStatus,
  type RentChargeGenerateRequest,
  useGenerateRentChargesMutation,
  useListPmLeasesQuery,
  useListRentChargesQuery,
  useListRentPaymentsQuery,
  useRecordRentPaymentMutation,
  useUploadPmDocumentMutation,
} from '@/features/pm/api/pmApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/errors'

const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

const downloadCsv = (filename: string, rows: Record<string, unknown>[]) => {
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))))
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    return `"${s.replaceAll('"', '""')}"`
  }
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function PmRentLedgerPage() {
  const { role } = useUserRole()
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId)
  const { toast } = useToast()

  const ownerId = selectedOwnerId

  const [tab, setTab] = useState<'charges' | 'payments'>('charges')

  const [chargeStatus, setChargeStatus] = useState<RentChargeStatus | ''>('')
  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)

  const charges = useListRentChargesQuery(
    { owner_id: ownerId, status: chargeStatus || undefined, limit, offset },
    { skip: role === 'agent' && !ownerId },
  )

  const payments = useListRentPaymentsQuery(
    { owner_id: ownerId, limit, offset },
    { skip: role === 'agent' && !ownerId },
  )

  const [recordPayment, recordState] = useRecordRentPaymentMutation()
  const [uploadDoc, uploadDocState] = useUploadPmDocumentMutation()

  // Payment modal state
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentChargeId, setPaymentChargeId] = useState<number | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null)

  const openPayment = (charge: RentChargeWithTotals) => {
    setPaymentChargeId(charge.charge.id)
    setPaymentAmount(String(charge.outstanding))
    setPaymentMethod('cash')
    setPaymentReference('')
    setPaymentNotes('')
    setPaymentReceipt(null)
    setPaymentOpen(true)
  }

  const submitPayment = async () => {
    if (!paymentChargeId) return
    if (!paymentAmount) {
      toast({ title: 'Missing amount', description: 'Enter an amount.', variant: 'destructive' })
      return
    }
    try {
      let receiptDocumentId: number | undefined
      if (paymentReceipt) {
        const charge = charges.data?.find((c) => c.charge.id === paymentChargeId)?.charge
        const fd = new FormData()
        fd.append('file', paymentReceipt)
        fd.append('document_type', 'receipt' satisfies DocumentType)
        fd.append('title', `Rent receipt • charge #${paymentChargeId}`)
        if (charge?.owner_id) fd.append('owner_id', String(charge.owner_id))
        else if (ownerId) fd.append('owner_id', String(ownerId))
        if (charge?.property_id) fd.append('property_id', String(charge.property_id))
        if (charge?.lease_id) fd.append('lease_id', String(charge.lease_id))
        fd.append('shared_with_agent', 'true')
        fd.append('shared_with_tenant', 'true')
        const doc = await uploadDoc(fd).unwrap()
        receiptDocumentId = doc.id
      }

      const payload: RentPaymentCreate = {
        charge_id: paymentChargeId,
        amount_paid: Number(paymentAmount),
        payment_method: paymentMethod,
        reference: paymentReference || undefined,
        notes: paymentNotes || undefined,
        receipt_document_id: receiptDocumentId,
      }
      await recordPayment(payload).unwrap()
      toast({ title: 'Recorded', description: 'Payment recorded.' })
      setPaymentOpen(false)
    } catch (e: unknown) {
      toast({ title: 'Failed', description: getErrorMessage(e, 'Could not record payment.'), variant: 'destructive' })
    }
  }

  // Generate charges modal
  const [generateOpen, setGenerateOpen] = useState(false)
  const [generateScope, setGenerateScope] = useState<'owner' | 'lease'>('owner')
  const [generateLeaseId, setGenerateLeaseId] = useState<string>('')
  const [generateStartMonth, setGenerateStartMonth] = useState('')
  const [generateMonths, setGenerateMonths] = useState('1')
  const [generateCharges, generateState] = useGenerateRentChargesMutation()

  const leasesForGenerate = useListPmLeasesQuery(
    { owner_id: ownerId, status: 'active', limit: 200, offset: 0 },
    { skip: role === 'agent' && !ownerId },
  )

  const submitGenerate = async () => {
    const payload: RentChargeGenerateRequest = {
      owner_id: generateScope === 'owner' ? ownerId || undefined : undefined,
      lease_id: generateScope === 'lease' ? Number(generateLeaseId) : undefined,
      start_month: generateStartMonth || undefined,
      months: Number(generateMonths),
    } as unknown as RentChargeGenerateRequest
    try {
      const res = await generateCharges(payload).unwrap()
      toast({ title: 'Generated', description: `Created ${res.created}, skipped ${res.skipped}.` })
      setGenerateOpen(false)
    } catch (e: unknown) {
      toast({ title: 'Failed', description: getErrorMessage(e, 'Could not generate charges.'), variant: 'destructive' })
    }
  }

  const chargeColumns = useMemo<ColumnDef<RentChargeWithTotals>[]>(() => {
    return [
      {
        id: 'billing',
        header: 'Billing Month',
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-medium">{new Date(row.original.charge.billing_month).toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">Due {new Date(row.original.charge.due_date).toLocaleDateString()}</div>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant="secondary">{row.original.charge.status}</Badge>,
      },
      {
        id: 'due',
        header: 'Due',
        cell: ({ row }) => <span className="text-sm">{formatINR(row.original.amount_due_total)}</span>,
      },
      {
        id: 'paid',
        header: 'Paid',
        cell: ({ row }) => <span className="text-sm">{formatINR(row.original.amount_paid_total)}</span>,
      },
      {
        id: 'outstanding',
        header: 'Outstanding',
        cell: ({ row }) => (
          <span className={row.original.outstanding > 0 ? 'text-sm font-medium' : 'text-sm text-muted-foreground'}>
            {formatINR(row.original.outstanding)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              onClick={() => openPayment(row.original)}
              disabled={row.original.outstanding <= 0}
            >
              Record payment
            </Button>
          </div>
        ),
      },
    ]
  }, [])

  const paymentColumns = useMemo<ColumnDef<RentPayment>[]>(() => {
    return [
      {
        accessorKey: 'paid_at',
        header: 'Paid at',
        cell: ({ row }) => new Date(row.original.paid_at).toLocaleString(),
      },
      {
        accessorKey: 'amount_paid',
        header: 'Amount',
        cell: ({ row }) => formatINR(row.original.amount_paid),
      },
      {
        accessorKey: 'payment_method',
        header: 'Method',
        cell: ({ row }) => row.original.payment_method || '—',
      },
      {
        accessorKey: 'reference',
        header: 'Reference',
        cell: ({ row }) => row.original.reference || '—',
      },
      {
        id: 'receipt',
        header: 'Receipt',
        cell: ({ row }) =>
          row.original.receipt_document_id ? (
            <Badge variant="outline">Doc #{row.original.receipt_document_id}</Badge>
          ) : (
            '—'
          ),
      },
    ]
  }, [])

  const canPrev = offset > 0
  const canNextCharges = (charges.data?.length ?? 0) >= limit
  const canNextPayments = (payments.data?.length ?? 0) >= limit

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Rent Ledger</h1>
            <p className="text-sm text-muted-foreground">Generate charges and record manual payments + receipts.</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Generate charges
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Generate rent charges</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Scope</Label>
                    <Select value={generateScope} onValueChange={(v) => setGenerateScope(v as 'owner' | 'lease')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner (all active leases)</SelectItem>
                        <SelectItem value="lease">Specific lease</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {generateScope === 'lease' ? (
                    <div className="space-y-2">
                      <Label>Lease</Label>
                      <Select value={generateLeaseId} onValueChange={setGenerateLeaseId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lease…" />
                        </SelectTrigger>
                        <SelectContent>
                          {(leasesForGenerate.data || []).map((l) => (
                            <SelectItem key={l.id} value={String(l.id)}>
                              #{l.id} • Property #{l.property_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Start month</Label>
                      <Input type="date" value={generateStartMonth} onChange={(e) => setGenerateStartMonth(e.target.value)} />
                      <div className="text-xs text-muted-foreground">Pick any day; backend uses month start.</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Months</Label>
                      <Input value={generateMonths} onChange={(e) => setGenerateMonths(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setGenerateOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => { void submitGenerate() }}
                      disabled={generateState.isLoading || (generateScope === 'lease' && !generateLeaseId)}
                    >
                      {generateState.isLoading ? 'Generating…' : 'Generate'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant={tab === 'charges' ? 'default' : 'outline'} size="sm" onClick={() => setTab('charges')}>
            Charges
          </Button>
          <Button variant={tab === 'payments' ? 'default' : 'outline'} size="sm" onClick={() => setTab('payments')}>
            Payments
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{tab === 'charges' ? 'Charges' : 'Payments'}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (tab === 'charges') {
                  const rows = (charges.data || []).map((c) => ({
                    charge_id: c.charge.id,
                    billing_month: c.charge.billing_month,
                    due_date: c.charge.due_date,
                    status: c.charge.status,
                    amount_due_total: c.amount_due_total,
                    amount_paid_total: c.amount_paid_total,
                    outstanding: c.outstanding,
                    property_id: c.charge.property_id,
                    lease_id: c.charge.lease_id,
                  }))
                  downloadCsv(`rent_charges_${new Date().toISOString().slice(0, 10)}.csv`, rows)
                } else {
                  const rows = (payments.data || []).map((p) => ({
                    payment_id: p.id,
                    paid_at: p.paid_at,
                    amount_paid: p.amount_paid,
                    method: p.payment_method,
                    reference: p.reference,
                    notes: p.notes,
                    charge_id: p.charge_id,
                    lease_id: p.lease_id,
                    property_id: p.property_id,
                    receipt_document_id: p.receipt_document_id,
                  }))
                  downloadCsv(`rent_payments_${new Date().toISOString().slice(0, 10)}.csv`, rows)
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {tab === 'charges' ? (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <Select value={chargeStatus} onValueChange={(v) => { setChargeStatus(v as RentChargeStatus | ''); setOffset(0) }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="pending">pending</SelectItem>
                      <SelectItem value="partial">partial</SelectItem>
                      <SelectItem value="paid">paid</SelectItem>
                      <SelectItem value="overdue">overdue</SelectItem>
                      <SelectItem value="waived">waived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setOffset(0) }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {charges.isLoading ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : charges.data?.length ? (
                  <>
                    <DataTable columns={chargeColumns} data={charges.data} />
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-muted-foreground">
                        Offset {offset} • Limit {limit}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canPrev}
                          onClick={() => setOffset(Math.max(0, offset - limit))}
                        >
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canNextCharges}
                          onClick={() => setOffset(offset + limit)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <EmptyState
                    title="No charges"
                    description="Generate charges or adjust filters."
                  />
                )}
              </>
            ) : (
              <>
                {payments.isLoading ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : payments.data?.length ? (
                  <>
                    <DataTable columns={paymentColumns} data={payments.data} />
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-muted-foreground">
                        Offset {offset} • Limit {limit}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canPrev}
                          onClick={() => setOffset(Math.max(0, offset - limit))}
                        >
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canNextPayments}
                          onClick={() => setOffset(offset + limit)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <EmptyState title="No payments" description="Record a payment to see it here." />
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Record payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Charge #{paymentChargeId}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">cash</SelectItem>
                      <SelectItem value="bank_transfer">bank_transfer</SelectItem>
                      <SelectItem value="check">check</SelectItem>
                      <SelectItem value="manual">manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reference (optional)</Label>
                  <Input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Receipt file (optional)</Label>
                  <Input type="file" onChange={(e) => setPaymentReceipt(e.target.files?.[0] ?? null)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Notes (optional)</Label>
                  <Input value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPaymentOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => { void submitPayment() }}
                  disabled={recordState.isLoading || uploadDocState.isLoading}
                >
                  {recordState.isLoading || uploadDocState.isLoading ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </OwnerScopeGate>
  )
}
