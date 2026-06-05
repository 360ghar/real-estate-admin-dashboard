import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, FileText } from "lucide-react";
import { LEASE_STATUSES, PAGE_SIZES } from "@/features/pm/constants";
import OwnerScopeGate from "@/features/pm/components/OwnerScopeGate";
import CreateLeaseDialog from "@/features/pm/components/CreateLeaseDialog";
import { useUserRole } from "@/hooks/useUserRole";
import { useAppSelector } from "@/hooks/redux";
import { selectSelectedOwnerId } from "@/features/pm/slices/pmSlice";
import type { Lease, LeaseStatus } from "@/types/pm";
import { useListPmLeasesQuery } from "@/features/pm/api/pmApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { getErrorMessage } from "@/lib/errors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const leaseBadgeVariant = (status: LeaseStatus) => {
  if (status === "active") return "default";
  if (status === "terminated" || status === "expired") return "outline";
  return "secondary";
};

export default function PmLeasesPage() {
  const { role } = useUserRole();
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId);

  const [status, setStatus] = useState<LeaseStatus | "">("");
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const ownerId = selectedOwnerId;

  const leases = useListPmLeasesQuery(
    { owner_id: ownerId, status: status || undefined, limit, offset },
    { skip: role === "agent" && !ownerId },
  );

  const columns = useMemo<ColumnDef<Lease>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "Lease",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">#{row.original.id}</div>
            <div className="truncate text-xs text-muted-foreground">
              Property #{row.original.property_id}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={leaseBadgeVariant(row.original.status)}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "tenant",
        header: "Tenant",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate">
              {row.original.tenant_name || row.original.tenant_phone || "—"}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {row.original.tenant_email || "—"}
            </div>
          </div>
        ),
      },
      {
        id: "term",
        header: "Term",
        cell: ({ row }) => (
          <span className="text-sm">
            {new Date(row.original.start_date).toLocaleDateString()} →{" "}
            {new Date(row.original.end_date).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button asChild variant="outline" size="sm">
              <Link to={`/pm/leases/${row.original.id}`}>View</Link>
            </Button>
          </div>
        ),
      },
    ];
  }, []);

  const canPrev = offset > 0;
  const canNext = (leases.data?.length ?? 0) >= limit;

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Leases</h1>
            <p className="text-sm text-muted-foreground">
              Create, renew, terminate, and upload signed lease documents.
            </p>
          </div>
          <CreateLeaseDialog ownerId={ownerId} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Lease List</CardTitle>
            <Badge variant="secondary" className="h-fit">
              <FileText className="mr-1 h-3 w-3" />
              {leases.data?.length ?? 0} shown
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Select
                value={status || "all"}
                onValueChange={(v) => {
                  setStatus(v === "all" ? "" : (v as LeaseStatus));
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {LEASE_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  setLimit(Number(v));
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {leases.isError ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">{getErrorMessage(leases.error, 'Failed to load leases')}</p>
                <Button variant="outline" size="sm" onClick={() => { void leases.refetch(); }}>
                  Retry
                </Button>
              </div>
            ) : leases.isLoading ? (
              <LoadingState type="spinner" />
            ) : leases.data?.length ? (
              <>
                <DataTable columns={columns} data={leases.data} />
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    Offset {offset} &bull; Limit {limit}
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
              <EmptyState title="No leases" description="Create your first lease to start rent operations." />
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerScopeGate>
  );
}
