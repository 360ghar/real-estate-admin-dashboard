import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertCircle, Download, Plus } from 'lucide-react'
import { EXPENSE_CATEGORIES, PAGE_SIZES } from '@/features/pm/constants'
import OwnerScopeGate from '@/features/pm/components/OwnerScopeGate'
import { useUserRole } from '@/hooks/useUserRole'
import { useAppSelector } from '@/hooks/redux'
import { selectSelectedOwnerId } from '@/features/pm/slices/pmSlice'
import {
  type DocumentType,
  type Expense,
  type ExpenseCategory,
  type ExpenseCreate,
  type ExpenseUpdate,
  useCreatePmExpenseMutation,
  useListPmExpensesQuery,
  useListPmPropertiesQuery,
  useUpdatePmExpenseMutation,
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

export default function PmExpensesPage() {
  const { role } = useUserRole()
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId)
  const { toast } = useToast()

  const ownerId = selectedOwnerId

  const [category, setCategory] = useState<ExpenseCategory | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)

  const expenses = useListPmExpensesQuery(
    {
      owner_id: ownerId,
      category: category || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      limit,
      offset,
    },
    { skip: role === 'agent' && !ownerId },
  )

  const properties = useListPmPropertiesQuery(
    { owner_id: ownerId, limit: 200, offset: 0 },
    { skip: role === 'agent' && !ownerId },
  )

  const [createExpense, createState] = useCreatePmExpenseMutation()
  const [updateExpense, updateState] = useUpdatePmExpenseMutation()
  const [uploadDoc, uploadDocState] = useUploadPmDocumentMutation()

  const columns = useMemo<ColumnDef<Expense>[]>(() => {
    return [
      {
        accessorKey: 'expense_date',
        header: 'Date',
        cell: ({ row }) => new Date(row.original.expense_date).toLocaleDateString(),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>,
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => formatINR(row.original.amount),
      },
      {
        accessorKey: 'property_id',
        header: 'Property',
        cell: ({ row }) => <span className="text-sm">#{row.original.property_id}</span>,
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
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Edit</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit expense</DialogTitle>
                </DialogHeader>
                <ExpenseEditForm
                  expense={row.original}
                  onUploadReceipt={async (file) => {
                    const fd = new FormData()
                    fd.append('file', file)
                    fd.append('document_type', 'receipt' satisfies DocumentType)
                    fd.append('title', `Expense receipt • #${row.original.id}`)
                    fd.append('owner_id', String(row.original.owner_id))
                    fd.append('property_id', String(row.original.property_id))
                    fd.append('shared_with_agent', 'true')
                    const doc = await uploadDoc(fd).unwrap()
                    return doc.id
                  }}
                  onSubmit={async (payload) => {
                    await updateExpense({ expense_id: row.original.id, payload }).unwrap()
                  }}
                  isSubmitting={updateState.isLoading || uploadDocState.isLoading}
                />
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ]
  }, [updateExpense, updateState.isLoading, uploadDoc, uploadDocState.isLoading])

  // Create modal
  const [createOpen, setCreateOpen] = useState(false)
  const [propertyId, setPropertyId] = useState('')
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('maintenance')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  const resetCreateForm = useCallback(() => {
    setPropertyId('')
    setNewCategory('maintenance')
    setAmount('')
    setExpenseDate('')
    setDescription('')
    setNotes('')
    setReceiptFile(null)
  }, [])

  const handleCreateOpenChange = useCallback(
    (open: boolean) => {
      setCreateOpen(open)
      if (!open) {
        resetCreateForm()
      }
    },
    [resetCreateForm],
  )

  const submitCreate = async () => {
    if (!propertyId || !amount || !expenseDate) {
      toast({ title: 'Missing fields', description: 'Property, amount, and date are required.', variant: 'destructive' })
      return
    }

    const amountNum = Number(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: 'Invalid amount', description: 'Amount must be a positive number.', variant: 'destructive' })
      return
    }

    try {
      const selectedPropertyOwnerId = (properties.data || []).find((p) => String(p.id) === String(propertyId))?.owner_id
      const effectiveOwnerId = ownerId ?? selectedPropertyOwnerId ?? null

      let receiptDocumentId: number | undefined
      if (receiptFile) {
        const fd = new FormData()
        fd.append('file', receiptFile)
        fd.append('document_type', 'receipt' satisfies DocumentType)
        fd.append('title', description || `Expense receipt • ${expenseDate}`)
        if (effectiveOwnerId) fd.append('owner_id', String(effectiveOwnerId))
        fd.append('property_id', propertyId)
        fd.append('shared_with_agent', 'true')
        const doc = await uploadDoc(fd).unwrap()
        receiptDocumentId = doc.id
      }

      const payload: ExpenseCreate = {
        owner_id: effectiveOwnerId || undefined,
        property_id: Number(propertyId),
        category: newCategory,
        amount: amountNum,
        expense_date: expenseDate,
        description: description || undefined,
        notes: notes || undefined,
        receipt_document_id: receiptDocumentId,
      }
      await createExpense(payload).unwrap()
      toast({ title: 'Added', description: 'Expense added.' })
      handleCreateOpenChange(false)
    } catch (e: unknown) {
      toast({ title: 'Failed', description: getErrorMessage(e, 'Could not add expense.'), variant: 'destructive' })
    }
  }

  const canPrev = offset > 0
  const canNext = (expenses.data?.length ?? 0) >= limit

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-sm text-muted-foreground">Track expenses and attach receipts.</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add expense</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Property</Label>
                    <Select value={propertyId} onValueChange={setPropertyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property…" />
                      </SelectTrigger>
                      <SelectContent>
                        {(properties.data || []).map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            #{p.id} • {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newCategory} onValueChange={(v) => setNewCategory(v as ExpenseCategory)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expense date</Label>
                    <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1200" />
                  </div>
                  <div className="space-y-2">
                    <Label>Receipt (optional)</Label>
                    <Input type="file" onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description (optional)</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes (optional)</Label>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => { void submitCreate() }} disabled={createState.isLoading || uploadDocState.isLoading}>
                    {createState.isLoading || uploadDocState.isLoading ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() => {
                const rows = (expenses.data || []).map((e) => ({
                  id: e.id,
                  expense_date: e.expense_date,
                  category: e.category,
                  amount: e.amount,
                  property_id: e.property_id,
                  receipt_document_id: e.receipt_document_id,
                  description: e.description,
                  notes: e.notes,
                }))
                downloadCsv(`expenses_${new Date().toISOString().slice(0, 10)}.csv`, rows)
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Expense List</CardTitle>
            <Badge variant="secondary" className="h-fit">
              {expenses.data?.length ?? 0} shown
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Select value={category || "all"} onValueChange={(v) => { setCategory(v === "all" ? "" : (v as ExpenseCategory)); setOffset(0) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setOffset(0) }} />
              <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setOffset(0) }} />
              <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setOffset(0) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {expenses.isError ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  Failed to load expenses
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { void expenses.refetch() }}
                >
                  Retry
                </Button>
              </div>
            ) : expenses.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : expenses.data?.length ? (
              <>
                <DataTable columns={columns} data={expenses.data} />
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
                      disabled={!canNext}
                      onClick={() => setOffset(offset + limit)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState title="No expenses" description="Add an expense to track costs." />
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerScopeGate>
  )
}

function ExpenseEditForm({
  expense,
  onUploadReceipt,
  onSubmit,
  isSubmitting,
}: {
  expense: Expense
  onUploadReceipt: (file: File) => Promise<number>
  onSubmit: (payload: ExpenseUpdate) => Promise<void>
  isSubmitting: boolean
}) {
  const { toast } = useToast()
  const [category, setCategory] = useState<ExpenseCategory>(expense.category)
  const [amount, setAmount] = useState(String(expense.amount))
  const [expenseDate, setExpenseDate] = useState(expense.expense_date)
  const [description, setDescription] = useState(expense.description || '')
  const [notes, setNotes] = useState(expense.notes || '')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  const save = async () => {
    try {
      let receiptDocumentId: number | undefined
      if (receiptFile) {
        receiptDocumentId = await onUploadReceipt(receiptFile)
      }
      const payload: ExpenseUpdate = {
        category,
        amount: Number(amount),
        expense_date: expenseDate,
        description,
        notes,
        receipt_document_id: receiptDocumentId,
      }
      await onSubmit(payload)
      toast({ title: 'Updated', description: 'Expense updated.' })
    } catch (e: unknown) {
      toast({ title: 'Failed', description: getErrorMessage(e, 'Could not update expense.'), variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Replace receipt (optional)</Label>
          <Input type="file" onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Description (optional)</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Notes (optional)</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => { void save() }} disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
