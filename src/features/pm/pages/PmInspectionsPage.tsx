import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertCircle, ClipboardCheck, Plus } from 'lucide-react'
import { INSPECTION_TYPES, PAGE_SIZES } from '@/features/pm/constants'
import OwnerScopeGate from '@/features/pm/components/OwnerScopeGate'
import { useUserRole } from '@/hooks/useUserRole'
import { useAppSelector } from '@/hooks/redux'
import { selectSelectedOwnerId } from '@/features/pm/slices/pmSlice'
import type { InspectionChecklist, InspectionChecklistCreate } from '@/types/pm'
import {
  useCreatePmInspectionMutation,
  useListPmInspectionsQuery,
  useListPmLeasesQuery,
} from '@/features/pm/api/pmApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import { getErrorMessage } from '@/lib/errors'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { localInputToServerTimestamp, parseServerTimestamp } from '@/lib/dateTime'
import { pmInspectionCreateSchema, type PmInspectionCreateForm } from '@/features/pm/validations'

export default function PmInspectionsPage() {
  const { role } = useUserRole()
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId)
  const { toast } = useToast()

  const ownerId = selectedOwnerId

  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)

  const inspections = useListPmInspectionsQuery(
    { owner_id: ownerId, limit, offset },
    { skip: role === 'agent' && !ownerId },
  )

  const leases = useListPmLeasesQuery(
    { owner_id: ownerId, limit: 200, offset: 0 },
    { skip: role === 'agent' && !ownerId },
  )

  const [createInspection, createState] = useCreatePmInspectionMutation()

  const columns = useMemo<ColumnDef<InspectionChecklist>[]>(() => {
    return [
      {
        id: 'inspection',
        header: 'Inspection',
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">#{row.original.id}</div>
            <div className="truncate text-xs text-muted-foreground">
              {row.original.inspection_type} • Lease #{row.original.lease_id} • Property #{row.original.property_id}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'conducted_at',
        header: 'Conducted',
        cell: ({ row }) => parseServerTimestamp(row.original.conducted_at)?.toLocaleString() ?? '—',
      },
      {
        id: 'signed',
        header: 'Signed',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge variant={row.original.signed_by_owner_at ? 'default' : 'outline'}>owner</Badge>
            <Badge variant={row.original.signed_by_tenant_at ? 'default' : 'outline'}>tenant</Badge>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button asChild variant="outline" size="sm">
              <Link to={`/pm/inspections/${row.original.id}`}>View</Link>
            </Button>
          </div>
        ),
      },
    ]
  }, [])

  // Create form
  const [createOpen, setCreateOpen] = useState(false)

  const form = useForm<PmInspectionCreateForm>({
    resolver: zodResolver(pmInspectionCreateSchema),
    defaultValues: {
      lease_id: '',
      inspection_type: 'routine',
      conducted_at: '',
      rooms_json: '{}',
      overall_notes: '',
    },
  })

  const handleCreateOpenChange = useCallback(
    (open: boolean) => {
      setCreateOpen(open)
      if (!open) form.reset()
    },
    [form],
  )

  const submitCreate = async (values: PmInspectionCreateForm) => {
    const selectedLease = (leases.data || []).find((l) => String(l.id) === values.lease_id)
    if (!selectedLease) {
      toast({ title: 'Lease not found', description: 'Selected lease could not be found. Please refresh and try again.', variant: 'destructive' })
      return
    }
    const selectedLeaseOwnerId = selectedLease.owner_id
    let roomsData: Record<string, unknown> | undefined
    try {
      roomsData = values.rooms_json ? (JSON.parse(values.rooms_json) as Record<string, unknown>) : undefined
    } catch {
      toast({ title: 'Invalid JSON', description: 'Rooms JSON must be valid.', variant: 'destructive' })
      return
    }
    const payload: InspectionChecklistCreate = {
      owner_id: ownerId ?? selectedLeaseOwnerId ?? undefined,
      lease_id: Number(values.lease_id),
      inspection_type: values.inspection_type,
      rooms_data: roomsData,
      overall_notes: values.overall_notes || undefined,
      conducted_at: localInputToServerTimestamp(values.conducted_at) ?? undefined,
    }
    try {
      await createInspection(payload).unwrap()
      toast({ title: 'Created', description: 'Inspection created.' })
      form.reset()
      setCreateOpen(false)
    } catch (e: unknown) {
      toast({ title: 'Failed', description: getErrorMessage(e, 'Could not create inspection.'), variant: 'destructive' })
    }
  }

  const canPrev = offset > 0
  const canNext = (inspections.data?.length ?? 0) >= limit

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inspections</h1>
            <p className="text-sm text-muted-foreground">Create and track inspection checklists (JSON-based).</p>
          </div>
          <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New inspection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create inspection</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={(e) => void form.handleSubmit(submitCreate)(e)} className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="lease_id"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Lease</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lease…" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(leases.data || []).map((l) => (
                              <SelectItem key={l.id} value={String(l.id)}>
                                #{l.id} • Property #{l.property_id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inspection_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INSPECTION_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="conducted_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conducted at (optional)</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rooms_json"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Rooms data (JSON)</FormLabel>
                        <FormControl><Textarea rows={8} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="overall_notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Overall notes (optional)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-2 md:col-span-2">
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createState.isLoading}>
                      {createState.isLoading ? 'Creating…' : 'Create'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {inspections.isError && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2 text-destructive">
                <AlertCircle className="h-8 w-8" />
                <p className="text-sm">{getErrorMessage(inspections.error, 'Failed to load inspections.')}</p>
                <Button variant="outline" size="sm" onClick={() => void inspections.refetch()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {inspections.isLoading && <LoadingState />}

        {inspections.data && inspections.data.length === 0 && (
          <EmptyState
            icon={<ClipboardCheck className="h-12 w-12" />}
            title="No inspections"
            description="Create your first inspection to get started."
          />
        )}

        {inspections.data && inspections.data.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Inspection List</CardTitle>
              <Badge variant="secondary" className="h-fit">
                <ClipboardCheck className="mr-1 h-3 w-3" />
                {inspections.data.length} shown
              </Badge>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={inspections.data} />
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page</span>
                  <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setOffset(0) }}>
                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map((s) => (
                        <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={!canPrev} onClick={() => setOffset(Math.max(0, offset - limit))}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={!canNext} onClick={() => setOffset(offset + limit)}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </OwnerScopeGate>
  )
}
