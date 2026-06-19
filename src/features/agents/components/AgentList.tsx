import { useEffect, useMemo, useState } from 'react'
import { useListAgentsQuery } from '@/features/agents/api/agentsApi'
import { useGetWorkloadQuery } from '@/features/core/api/systemApi'
import { useAssignAgentMutation, useGetUsersQuery } from '@/features/users/api/usersApi'
import { Card } from '@/components/ui/card'
import { DataTable, SortableHeader } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { LoadingState } from '@/components/ui/loading-state'
import CursorPager from '@/components/ui/cursor-pager'
import { useCursorPagination } from '@/hooks/useCursorPagination'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Edit, BarChart3, Users, Search, Download, Scale } from 'lucide-react'
import {
  ColumnDef,
} from '@tanstack/react-table'
import { useDebounce } from '@/hooks/useDebounce'
import { useFilterPersistence } from '@/hooks/useFilterPersistence'
import { AgentSummary } from '@/features/agents/api/agentsApi'
import { downloadCsv, csvFilename } from '@/lib/csv'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

type Agent = AgentSummary

const AgentList = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const { filters, setFilters } = useFilterPersistence({
    key: 'agents',
    defaultValue: { q: '', status: 'all' },
  })

  const [q, setQ] = useState(filters.q || '')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>(filters.status === 'active' || filters.status === 'inactive' ? filters.status : 'all')

  useEffect(() => {
    setFilters({ q, status })
  }, [q, status, setFilters])

  const dq = useDebounce(q, 300)

  const [pageSize, setPageSize] = useState(20)
  const pager = useCursorPagination()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { pager.reset() }, [pager.reset, dq, status])

  const includeInactive = status === 'all' || status === 'inactive'
  const { data, isFetching, isLoading, error, refetch } = useListAgentsQuery({ include_inactive: includeInactive, cursor: pager.cursor, limit: pageSize })
  const { data: workload } = useGetWorkloadQuery()
  const [assignAgent, { isLoading: assigning }] = useAssignAgentMutation()
  const { data: unassignedUsers } = useGetUsersQuery({ limit: 100 })

  // Auto-assign dialog state
  const [autoAssignOpen, setAutoAssignOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const workloadByAgent = useMemo(() => {
    const map = new Map<number, { utilization: number; currentUsers: number }>()
    ;(workload ?? []).forEach((w) => {
      map.set(w.agent_id, { utilization: w.utilization_percentage, currentUsers: w.current_users })
    })
    return map
  }, [workload])

  // Client-side search filter (API doesn't expose q)
  const filteredResults = useMemo(() => {
    const all = data?.items ?? []
    if (!dq) return all
    const needle = dq.toLowerCase()
    return all.filter(
      (a) =>
        a.name?.toLowerCase().includes(needle) ||
        a.contact_number?.toLowerCase().includes(needle),
    )
  }, [data?.items, dq])

  const columns = useMemo<ColumnDef<Agent>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    },
    {
      accessorKey: 'contact_number',
      header: 'Contact',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('is_active')
        return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>
      },
    },
    {
      accessorKey: 'total_users_assigned',
      header: ({ column }) => <SortableHeader column={column}>Users Assigned</SortableHeader>,
    },
    {
      accessorKey: 'user_satisfaction_rating',
      header: ({ column }) => <SortableHeader column={column}>Satisfaction</SortableHeader>,
    },
    {
      id: 'workload',
      header: 'Workload',
      cell: ({ row }) => {
        const w = workloadByAgent.get(row.original.id)
        if (!w) return <span className="text-muted-foreground">—</span>
        const tone = w.utilization > 80 ? 'text-red-600 dark:text-red-400' : w.utilization > 60 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
        return (
          <div className="flex flex-col">
            <span className={cn('font-medium', tone)}>{Math.round(w.utilization)}%</span>
            <span className="text-xs text-muted-foreground">{w.currentUsers} users</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const agent = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to={`/agents/${agent.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/agents/${agent.id}/stats`}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Stats
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [workloadByAgent])

  const handleExport = () => {
    const rows = filteredResults.map((a) => {
      const w = workloadByAgent.get(a.id)
      return {
        id: a.id,
        name: a.name,
        contact_number: a.contact_number,
        is_active: a.is_active,
        is_available: a.is_available,
        total_users_assigned: a.total_users_assigned,
        user_satisfaction_rating: a.user_satisfaction_rating,
        agent_type: a.agent_type,
        utilization_percentage: w?.utilization ?? '',
      }
    })
    downloadCsv(csvFilename('agents'), rows)
  }

  // Users without an agent assignment (best-effort client filter)
  const assignableUsers = useMemo(() => {
    return (unassignedUsers?.items ?? []).filter((u) => !u.agent_id && u.is_active)
  }, [unassignedUsers])

  // Find the least-loaded active agent
  const leastLoadedAgent = useMemo(() => {
    const active = filteredResults.filter((a) => a.is_active)
    if (!active.length) return null
    return active.reduce((min, a) => {
      const wMin = workloadByAgent.get(min.id)?.utilization ?? Infinity
      const wA = workloadByAgent.get(a.id)?.utilization ?? Infinity
      return wA < wMin ? a : min
    })
  }, [filteredResults, workloadByAgent])

  const handleAutoAssign = async () => {
    if (!selectedUserId || !leastLoadedAgent) return
    try {
      await assignAgent({ userId: selectedUserId, agentId: leastLoadedAgent.id }).unwrap()
      toast({ title: 'Assigned', description: `User #${selectedUserId} assigned to ${leastLoadedAgent.name} (least loaded).` })
      setAutoAssignOpen(false)
      setSelectedUserId(null)
    } catch (e: unknown) {
      toast({ title: 'Assignment failed', description: getErrorMessage(e, 'Could not assign agent'), variant: 'destructive' })
    }
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agent name or contact"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10"
            aria-label="Search agents"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as 'all' | 'active' | 'inactive')}>
          <SelectTrigger aria-label="Filter by status"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)) }}>
          <SelectTrigger aria-label="Page size"><SelectValue placeholder="Rows" /></SelectTrigger>
          <SelectContent>
            {[10, 20, 50].map((n) => (<SelectItem key={n} value={String(n)}>{n} / page</SelectItem>))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={isFetching || isLoading} className="gap-2">
          <Download className="h-4 w-4" />Export
        </Button>
      </div>

      <div className="mb-4 flex justify-end">
        <Dialog open={autoAssignOpen} onOpenChange={setAutoAssignOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2" disabled={!leastLoadedAgent}>
              <Scale className="h-4 w-4" />
              Auto-Assign to Least Loaded
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Auto-assign user</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Target agent: <span className="font-medium text-foreground">{leastLoadedAgent?.name}</span>
                {workloadByAgent.get(leastLoadedAgent?.id ?? 0) ? ` (${Math.round(workloadByAgent.get(leastLoadedAgent!.id)!.utilization)}% loaded)` : ''}
              </p>
              <div className="space-y-2">
                <Label htmlFor="auto-assign-user">Select a user without an agent</Label>
                <Select value={selectedUserId ? String(selectedUserId) : ''} onValueChange={(v) => setSelectedUserId(Number(v))}>
                  <SelectTrigger id="auto-assign-user"><SelectValue placeholder="Choose user…" /></SelectTrigger>
                  <SelectContent>
                    {assignableUsers.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.full_name || u.email} {u.phone ? `(${u.phone})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignableUsers.length === 0 && (
                  <p className="text-xs text-muted-foreground">No unassigned active users found in the current sample.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAutoAssignOpen(false)}>Cancel</Button>
              <Button onClick={() => void handleAutoAssign()} disabled={!selectedUserId || assigning}>
                {assigning ? 'Assigning…' : 'Assign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <ErrorState title="Failed to load agents" error={error} onRetry={() => { void refetch() }} />
      ) : isLoading ? (
        <LoadingState type="card" rows={5} />
      ) : (!isFetching && filteredResults.length === 0) ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title={q || status !== 'all' ? 'No agents match your filters' : 'No agents found'}
          description={q || status !== 'all' ? 'Try adjusting search or filters.' : 'Get started by creating your first agent.'}
          action={{ label: 'Create Agent', onClick: () => navigate('/agents/new') }}
        />
      ) : (
        <div className="space-y-4">
          <DataTable columns={columns} data={filteredResults} enableSorting />
          <CursorPager
            canPrev={pager.canPrev}
            hasMore={data?.has_more ?? false}
            loading={isFetching || isLoading}
            onPrev={pager.prev}
            onNext={() => data && pager.next(data.next_cursor)}
          />
        </div>
      )}
    </Card>
  )
}

export default AgentList
