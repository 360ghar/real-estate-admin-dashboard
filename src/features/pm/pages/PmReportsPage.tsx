import { useMemo, useState } from 'react'
import { Download, FileBarChart } from 'lucide-react'
import { formatINR, downloadCsv } from '@/features/pm/utils'
import OwnerScopeGate from '@/features/pm/components/OwnerScopeGate'
import { useUserRole } from '@/hooks/useUserRole'
import { useAppSelector } from '@/hooks/redux'
import { selectSelectedOwnerId } from '@/features/pm/slices/pmSlice'
import {
  useGetExpenseReportQuery,
  useGetIncomeReportQuery,
  useGetMaintenanceReportQuery,
  useGetOccupancyReportQuery,
  useGetPnLReportQuery,
  useGetRentRollReportQuery,
} from '@/features/pm/api/pmApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'


export default function PmReportsPage() {
  const { role } = useUserRole()
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId)
  const { toast } = useToast()

  const ownerId = selectedOwnerId

  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const rentRoll = useGetRentRollReportQuery({ owner_id: ownerId })
  const income = useGetIncomeReportQuery({ owner_id: ownerId, start: start || undefined, end: end || undefined })
  const expenses = useGetExpenseReportQuery({ owner_id: ownerId, start: start || undefined, end: end || undefined })
  const pnl = useGetPnLReportQuery({ owner_id: ownerId, start: start || undefined, end: end || undefined })
  const occupancy = useGetOccupancyReportQuery({ owner_id: ownerId })
  const maintenance = useGetMaintenanceReportQuery({ owner_id: ownerId })

  const rentRollCsvRows = useMemo(
    () =>
      (rentRoll.data || []).map((r) => ({
        property_id: r.property_id,
        title: r.title,
        occupancy: r.occupancy,
        tenant_user_id: r.tenant_user_id,
        monthly_rent: r.monthly_rent,
        lease_end_date: r.lease_end_date,
      })),
    [rentRoll.data],
  )

  return (
    <OwnerScopeGate allowAllOwners>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground">Generate operational reports and export CSV.</p>
          </div>
          <Badge variant="secondary" className="h-fit">
            <FileBarChart className="mr-1 h-3 w-3" />
            {role === 'admin'
              ? ownerId
                ? `Owner #${ownerId}`
                : 'All portfolios'
              : ownerId
                ? `Owner #${ownerId}`
                : 'All assigned owners'}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Date range</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatINR(income.data?.total_income ?? 0)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {start || end ? 'Filtered' : 'All time'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatINR(expenses.data?.total_expenses ?? 0)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {start || end ? 'Filtered' : 'All time'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Net Income (P&amp;L)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatINR(pnl.data?.net_income ?? 0)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Income − Expenses
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Occupancy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">Total: <span className="font-medium">{occupancy.data?.total ?? 0}</span></div>
              <div className="text-sm">Occupied: <span className="font-medium">{occupancy.data?.occupied ?? 0}</span></div>
              <div className="text-sm">Vacant: <span className="font-medium">{occupancy.data?.vacant ?? 0}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">Total requests: <span className="font-medium">{maintenance.data?.total_requests ?? 0}</span></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Rent Roll</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!rentRollCsvRows.length) {
                  toast({ title: 'Nothing to export', description: 'Rent roll is empty.' })
                  return
                }
                downloadCsv(`rent_roll_${new Date().toISOString().slice(0, 10)}.csv`, rentRollCsvRows)
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {rentRoll.isLoading ? (
              <LoadingState type="spinner" />
            ) : rentRoll.data?.length ? (
              <div className="space-y-2">
                {rentRoll.data.slice(0, 15).map((r) => (
                  <div key={r.property_id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{r.title}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        Property #{r.property_id} • {r.occupancy}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-medium">{r.monthly_rent ? formatINR(r.monthly_rent) : '—'}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.lease_end_date ? `Ends ${new Date(r.lease_end_date).toLocaleDateString()}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
                {rentRoll.data.length > 15 ? (
                  <div className="text-xs text-muted-foreground">Showing first 15 rows… export CSV for full list.</div>
                ) : null}
              </div>
            ) : (
              <EmptyState title="No rent roll data" />
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerScopeGate>
  )
}
