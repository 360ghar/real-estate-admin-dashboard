import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight, Building2, IndianRupee, Wrench } from 'lucide-react'
import { useUserRole } from '@/hooks/useUserRole'
import { useAppSelector } from '@/hooks/redux'
import { selectSelectedOwner } from '@/features/pm/slices/pmSlice'
import { useGetPmDashboardActivityQuery, useGetPmDashboardOverviewQuery } from '@/features/pm/api/pmApi'
import { formatINR } from '@/features/pm/utils'
import { getErrorMessage } from '@/lib/errors'
import { EmptyState } from '@/components/ui/empty-state'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function PmDashboardPage() {
  const { role } = useUserRole()
  const selectedOwner = useAppSelector(selectSelectedOwner)

  const ownerId = selectedOwner?.id ?? null

  const overview = useGetPmDashboardOverviewQuery({ owner_id: ownerId })
  const activity = useGetPmDashboardActivityQuery({ owner_id: ownerId, limit: 20 })

  const scopeLabel =
    selectedOwner ? selectedOwner.label : role === 'admin' ? 'All portfolios' : 'All assigned owners'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">PM Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Operational overview for <span className="font-medium">{scopeLabel}</span>.
          </p>
        </div>
        <Badge variant="secondary">{role === 'admin' ? 'Admin' : 'Agent'}</Badge>
      </div>

      {overview.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {getErrorMessage(overview.error, 'Failed to load dashboard overview.')}
            <Button variant="outline" size="sm" onClick={() => void overview.refetch()}>Retry</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Managed Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overview.isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{overview.data?.total_properties ?? 0}</div>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Occupied: {overview.data?.occupied_properties ?? 0}</span>
              <span>•</span>
              <span>Vacant: {overview.data?.vacant_properties ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Rent</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overview.isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {formatINR(overview.data?.outstanding_rent_total ?? 0)}
              </div>
            )}
            <div className="mt-2">
              <Button asChild variant="link" className="h-auto p-0 text-xs">
                <Link to="/pm/rent-ledger">
                  Open rent ledger <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overview.isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {formatINR(overview.data?.monthly_revenue_current ?? 0)}
              </div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              Prev month: {formatINR(overview.data?.monthly_revenue_previous ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overview.isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{overview.data?.under_maintenance_properties ?? 0}</div>
            )}
            <div className="mt-2">
              <Button asChild variant="link" className="h-auto p-0 text-xs">
                <Link to="/pm/maintenance">
                  Open maintenance <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          {role === 'admin' ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/pm/audit">View audit</Link>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {activity.isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                {getErrorMessage(activity.error, 'Failed to load activity.')}
                <Button variant="outline" size="sm" onClick={() => void activity.refetch()}>Retry</Button>
              </AlertDescription>
            </Alert>
          ) : activity.isLoading ? (
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
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {new Date(a.at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No recent activity" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
