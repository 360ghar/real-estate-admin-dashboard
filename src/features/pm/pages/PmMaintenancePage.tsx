import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertCircle, Plus, Wrench } from 'lucide-react'
import {
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_REQUEST_STATUSES,
  MAINTENANCE_URGENCIES,
  PAGE_SIZES,
  WORK_ORDER_STATUSES,
} from '@/features/pm/constants'
import OwnerScopeGate from '@/features/pm/components/OwnerScopeGate'
import { useUserRole } from '@/hooks/useUserRole'
import { useAppSelector } from '@/hooks/redux'
import { selectSelectedOwnerId } from '@/features/pm/slices/pmSlice'
import {
  type MaintenanceCategory,
  type MaintenanceRequest,
  type MaintenanceRequestCreate,
  type MaintenanceRequestStatus,
  type MaintenanceRequestUpdate,
  type MaintenanceUrgency,
  type WorkOrderStatus,
  useCreateMaintenanceRequestMutation,
  useListMaintenanceRequestsQuery,
  useListPmPropertiesQuery,
  useUpdateMaintenanceRequestMutation,
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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/errors'
import { localInputToServerTimestamp, serverTimestampToLocalInput } from '@/lib/dateTime'

export default function PmMaintenancePage() {
  const { role, user } = useUserRole()
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId)
  const { toast } = useToast()

  const ownerId = selectedOwnerId

  const [requestStatus, setRequestStatus] = useState<MaintenanceRequestStatus | ''>('')
  const [workOrderStatus, setWorkOrderStatus] = useState<WorkOrderStatus | ''>('')
  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)

  const requests = useListMaintenanceRequestsQuery(
    {
      owner_id: ownerId,
      request_status: requestStatus || undefined,
      work_order_status: workOrderStatus || undefined,
      limit,
      offset,
    },
    { skip: role === 'agent' && !ownerId },
  )

  const properties = useListPmPropertiesQuery(
    { owner_id: ownerId, limit: 200, offset: 0 },
    { skip: role === 'agent' && !ownerId },
  )

  const [createRequest, createState] = useCreateMaintenanceRequestMutation()
  const [updateRequest, updateState] = useUpdateMaintenanceRequestMutation()

  const columns = useMemo<ColumnDef<MaintenanceRequest>[]>(() => {
    return [
      {
        accessorKey: 'title',
        header: 'Request',
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.title}</div>
            <div className="truncate text-xs text-muted-foreground">
              #{row.original.id} • Property #{row.original.property_id} • {row.original.category}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'urgency',
        header: 'Urgency',
        cell: ({ row }) => <Badge variant={row.original.urgency === 'emergency' ? 'destructive' : 'secondary'}>{row.original.urgency}</Badge>,
      },
      {
        accessorKey: 'request_status',
        header: 'Request status',
        cell: ({ row }) => <Badge variant="outline">{row.original.request_status}</Badge>,
      },
      {
        accessorKey: 'work_order_status',
        header: 'Work order',
        cell: ({ row }) => <Badge variant="secondary">{row.original.work_order_status || '—'}</Badge>,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Update maintenance request</DialogTitle>
                </DialogHeader>
                <MaintenanceUpdateForm
                  request={row.original}
                  defaultAssignedAgentId={user?.agent_id ?? null}
                  onSubmit={async (payload) => {
                    try {
                      await updateRequest({ request_id: row.original.id, payload }).unwrap()
                      toast({ title: 'Updated', description: 'Maintenance request updated.' })
                    } catch (e: unknown) {
                      toast({ title: 'Failed', description: getErrorMessage(e, 'Could not update request.'), variant: 'destructive' })
                    }
                  }}
                  isSubmitting={updateState.isLoading}
                />
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ]
  }, [toast, updateRequest, updateState.isLoading, user?.agent_id])

  // Create modal
  const [createOpen, setCreateOpen] = useState(false)
  const [propertyId, setPropertyId] = useState('')
  const [category, setCategory] = useState<MaintenanceCategory>('plumbing')
  const [urgency, setUrgency] = useState<MaintenanceUrgency>('medium')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [preferredContactMethod, setPreferredContactMethod] = useState('')
  const [availabilityNotes, setAvailabilityNotes] = useState('')

  const resetCreateForm = useCallback(() => {
    setPropertyId('')
    setCategory('plumbing')
    setUrgency('medium')
    setTitle('')
    setDescription('')
    setPreferredContactMethod('')
    setAvailabilityNotes('')
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
    if (!propertyId || !title) {
      toast({ title: 'Missing fields', description: 'Property and title are required.', variant: 'destructive' })
      return
    }
    if (isNaN(Number(propertyId))) {
      toast({ title: 'Invalid property', description: 'Please select a valid property.', variant: 'destructive' })
      return
    }
    const payload: MaintenanceRequestCreate = {
      property_id: Number(propertyId),
      category,
      urgency,
      title,
      description: description || undefined,
      preferred_contact_method: preferredContactMethod || undefined,
      availability_notes: availabilityNotes || undefined,
    }
    try {
      await createRequest(payload).unwrap()
      toast({ title: 'Created', description: 'Maintenance request created.' })
      setCreateOpen(false)
    } catch (e: unknown) {
      toast({ title: 'Failed', description: getErrorMessage(e, 'Could not create request.'), variant: 'destructive' })
    }
  }

  const canPrev = offset > 0
  const canNext = (requests.data?.length ?? 0) >= limit

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
            <p className="text-sm text-muted-foreground">Triage requests and manage work orders (no vendors).</p>
          </div>
          <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create maintenance request</DialogTitle>
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
                  <Select value={category} onValueChange={(v) => setCategory(v as MaintenanceCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select value={urgency} onValueChange={(v) => setUrgency(v as MaintenanceUrgency)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_URGENCIES.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description (optional)</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Preferred contact (optional)</Label>
                  <Input value={preferredContactMethod} onChange={(e) => setPreferredContactMethod(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Availability notes (optional)</Label>
                  <Input value={availabilityNotes} onChange={(e) => setAvailabilityNotes(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => { void submitCreate() }} disabled={createState.isLoading}>
                  {createState.isLoading ? 'Creating…' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Maintenance Queue</CardTitle>
            <Badge variant="secondary" className="h-fit">
              <Wrench className="mr-1 h-3 w-3" />
              {requests.data?.length ?? 0} shown
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Select value={requestStatus || "all"} onValueChange={(v) => { setRequestStatus(v === "all" ? "" : (v as MaintenanceRequestStatus)); setOffset(0) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Request status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {MAINTENANCE_REQUEST_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={workOrderStatus || "all"} onValueChange={(v) => { setWorkOrderStatus(v === "all" ? "" : (v as WorkOrderStatus)); setOffset(0) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Work order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {WORK_ORDER_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {requests.isError ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  Failed to load maintenance requests
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { void requests.refetch() }}
                >
                  Retry
                </Button>
              </div>
            ) : requests.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : requests.data?.length ? (
              <>
                <DataTable columns={columns} data={requests.data} />
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
              <EmptyState title="No maintenance requests" description="New requests will show up here." />
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerScopeGate>
  )
}

function MaintenanceUpdateForm({
  request,
  defaultAssignedAgentId,
  onSubmit,
  isSubmitting,
}: {
  request: MaintenanceRequest
  defaultAssignedAgentId: number | null
  onSubmit: (payload: MaintenanceRequestUpdate) => Promise<void>
  isSubmitting: boolean
}) {
  const [reqStatus, setReqStatus] = useState<MaintenanceRequestStatus>(request.request_status)
  const [woStatus, setWoStatus] = useState<WorkOrderStatus | ''>(request.work_order_status || '')
  const [priority, setPriority] = useState(request.priority || '')
  const [estimatedCost, setEstimatedCost] = useState(request.estimated_cost?.toString() || '')
  const [actualCost, setActualCost] = useState(request.actual_cost?.toString() || '')
  const [scheduledFor, setScheduledFor] = useState(serverTimestampToLocalInput(request.scheduled_for))
  const [completionNotes, setCompletionNotes] = useState(request.completion_notes || '')
  const [assignToMe, setAssignToMe] = useState(defaultAssignedAgentId ? 'yes' : 'no')

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Request status</Label>
          <Select value={reqStatus} onValueChange={(v) => setReqStatus(v as MaintenanceRequestStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_REQUEST_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Work order status</Label>
          <Select value={woStatus || "none"} onValueChange={(v) => setWoStatus(v === "none" ? "" : (v as WorkOrderStatus))}>
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {WORK_ORDER_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Assign to me</Label>
          <Select value={assignToMe} onValueChange={(v) => setAssignToMe(v as 'yes' | 'no')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority (optional)</Label>
          <Input value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="e.g. P1" />
        </div>
        <div className="space-y-2">
          <Label>Estimated cost (optional)</Label>
          <Input value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Actual cost (optional)</Label>
          <Input value={actualCost} onChange={(e) => setActualCost(e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Scheduled for (optional)</Label>
          <Input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Completion notes (optional)</Label>
          <Textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} rows={3} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          onClick={() => {
            const payload: MaintenanceRequestUpdate = {
              request_status: reqStatus,
              work_order_status: woStatus || undefined,
              assigned_agent_id: assignToMe === 'yes' ? defaultAssignedAgentId ?? undefined : undefined,
              priority: priority || undefined,
              estimated_cost: estimatedCost ? Number(estimatedCost) : undefined,
              actual_cost: actualCost ? Number(actualCost) : undefined,
              scheduled_for: localInputToServerTimestamp(scheduledFor) ?? undefined,
              completion_notes: completionNotes || undefined,
            }
            void onSubmit(payload)
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
