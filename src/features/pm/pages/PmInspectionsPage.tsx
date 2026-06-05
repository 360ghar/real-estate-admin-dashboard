import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertCircle, ClipboardCheck, Plus } from 'lucide-react'
import { INSPECTION_TYPES, PAGE_SIZES } from '@/features/pm/constants'
import OwnerScopeGate from '@/features/pm/components/OwnerScopeGate'
import { useUserRole } from '@/hooks/useUserRole'
import { useAppSelector } from '@/hooks/redux'
import { selectSelectedOwnerId } from '@/features/pm/slices/pmSlice'
import type { InspectionChecklist, InspectionChecklistCreate, InspectionType } from '@/types/pm'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { localInputToServerTimestamp, parseServerTimestamp } from '@/lib/dateTime'

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

  // Create modal
  const [createOpen, setCreateOpen] = useState(false)
  const [leaseId, setLeaseId] = useState('')
  const [inspectionType, setInspectionType] = useState<InspectionType>('routine')
  const [conductedAt, setConductedAt] = useState('')
  const [roomsJson, setRoomsJson] = useState('{}')
  const [overallNotes, setOverallNotes] = useState('')

  const resetCreateForm = useCallback(() => {
    setLeaseId('')
    setInspectionType('routine')
    setConductedAt('')
    setRoomsJson('{}')
    setOverallNotes('')
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
    if (!leaseId) {
      toast({ title: 'Missing fields', description: 'Lease is required.', variant: 'destructive' })
      return
    }
    const selectedLease = (leases.data || []).find((l) => String(l.id) === String(leaseId))
    if (!selectedLease) {
      toast({ title: 'Lease not found', description: 'Selected lease could not be found. Please refresh and try again.', variant: 'destructive' })
      return
    }
    const selectedLeaseOwnerId = selectedLease.owner_id
    let roomsData: Record<string, unknown> | undefined
    try {
      roomsData = roomsJson ? (JSON.parse(roomsJson) as Record<string, unknown>) : undefined
    } catch {
      toast({ title: 'Invalid JSON', description: 'Rooms JSON must be valid.', variant: 'destructive' })
      return
    }
    const payload: InspectionChecklistCreate = {
      owner_id: ownerId ?? selectedLeaseOwnerId ?? undefined,
      lease_id: Number(leaseId),
      inspection_type: inspectionType,
      rooms_data: roomsData,
      overall_notes: overallNotes || undefined,
      conducted_at: localInputToServerTimestamp(conductedAt) ?? undefined,
    }
    try {
      await createInspection(payload).unwrap()
      toast({ title: 'Created', description: 'Inspection created.' })
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
            <h1 className="text-3xl font-bold tracking-tight">Inspections</h1>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Lease</Label>
                  <Select value={leaseId} onValueChange={setLeaseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lease…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(leases.data || []).map((l) => (
                        <SelectItem key={l.id} value={String(l.id)}>
                          #{l.id} • Property #{l.property_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={inspectionType} onValueChange={(v) => setInspectionType(v as InspectionType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INSPECTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Conducted at (optional)</Label>
                  <Input type="datetime-local" value={conductedAt} onChange={(e) => setConductedAt(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Rooms data (JSON)</Label>
                  <Textarea value={roomsJson} onChange={(e) => setRoomsJson(e.target.value)} rows={8} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Overall notes (optional)</Label>
                  <Input value={overallNotes} onChange={(e) => setOverallNotes(e.target.value)} />
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
            <CardTitle className="text-base">Inspection List</CardTitle>
            <Badge variant="secondary" className="h-fit">
              <ClipboardCheck className="mr-1 h-3 w-3" />
              {inspections.data?.length ?? 0} shown
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
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

            {inspections.isError ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  {getErrorMessage(inspections.error, 'Failed to load inspections')}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { void inspections.refetch() }}
                >
                  Retry
                </Button>
              </div>
            ) : inspections.isLoading ? (
              <LoadingState type="spinner" />
            ) : inspections.data?.length ? (
              <>
                <DataTable columns={columns} data={inspections.data} />
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    Offset {offset} • Limit {limit}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={!canPrev} onClick={() => setOffset(Math.max(0, offset - limit))}>
                      Prev
                    </Button>
                    <Button variant="outline" size="sm" disabled={!canNext} onClick={() => setOffset(offset + limit)}>
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState title="No inspections" description="Create an inspection checklist to get started." />
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerScopeGate>
  )
}
