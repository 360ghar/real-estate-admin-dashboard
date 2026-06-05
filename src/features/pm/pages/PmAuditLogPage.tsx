import { useState } from 'react'
import { Activity } from 'lucide-react'
import { formatINR } from '@/features/pm/utils'
import { useGetPmDashboardActivityQuery } from '@/features/pm/api/pmApi'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

export default function PmAuditLogPage() {
  const [ownerIdRaw, setOwnerIdRaw] = useState('')
  const ownerId = ownerIdRaw && !isNaN(Number(ownerIdRaw)) ? Number(ownerIdRaw) : null

  const activity = useGetPmDashboardActivityQuery({ owner_id: ownerId || null, limit: 50 })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-sm text-muted-foreground">MVP activity feed (payments, leases, maintenance).</p>
        </div>
        <Badge variant="secondary" className="h-fit">
          <Activity className="mr-1 h-3 w-3" />
          {activity.data?.length ?? 0} events
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Owner ID (optional)</Label>
            <Input type="number" value={ownerIdRaw} onChange={(e) => setOwnerIdRaw(e.target.value)} placeholder="e.g. 123" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : activity.data?.length ? (
            <div className="space-y-2">
              {activity.data.map((a, idx) => (
                <div key={`${a.type}-${a.at}-${idx}`} className="flex items-center justify-between gap-4 text-sm">
                  <div className="min-w-0">
                    <span className="font-medium">{a.type}</span>
                    {a.status ? <span className="text-muted-foreground"> • {a.status}</span> : null}
                    {a.amount ? <span className="text-muted-foreground"> • {formatINR(a.amount)}</span> : null}
                    {a.property_id ? <span className="text-muted-foreground"> • P#{a.property_id}</span> : null}
                    {a.lease_id ? <span className="text-muted-foreground"> • L#{a.lease_id}</span> : null}
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {new Date(a.at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Activity className="h-12 w-12" />}
              title="No activity found"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
