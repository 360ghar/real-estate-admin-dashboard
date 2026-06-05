import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Building2 } from "lucide-react";
import OwnerScopeGate from "@/features/pm/components/OwnerScopeGate";
import PropertyCreateDialog from "@/features/pm/components/PropertyCreateDialog";
import PropertyFilters from "@/features/pm/components/PropertyFilters";
import { useUserRole } from "@/hooks/useUserRole";
import { useAppSelector } from "@/hooks/redux";
import { selectSelectedOwnerId } from "@/features/pm/slices/pmSlice";
import { useDebounce } from "@/hooks/useDebounce";
import type { ManagedPropertyStatus, PmProperty } from "@/types/pm";
import { useListPmPropertiesQuery } from "@/features/pm/api/pmApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { getErrorMessage } from "@/lib/errors";

const statusBadgeVariant = (status?: ManagedPropertyStatus | null) => {
  if (status === "active") return "default";
  if (status === "draft") return "secondary";
  if (status === "archived") return "outline";
  return "outline";
};

export default function PmPropertiesPage() {
  const { role } = useUserRole();
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId);

  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const [occupancy, setOccupancy] = useState<"occupied" | "vacant" | "">("");
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const ownerId = selectedOwnerId;

  const properties = useListPmPropertiesQuery(
    {
      owner_id: ownerId,
      occupancy: occupancy || undefined,
      q: debouncedQ || undefined,
      limit,
      offset,
    },
    { skip: role === "agent" && !ownerId },
  );

  const columns = useMemo<ColumnDef<PmProperty>[]>(() => {
    return [
      {
        accessorKey: "title",
        header: "Property",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.title}</div>
            <div className="truncate text-xs text-muted-foreground">
              {row.original.locality ||
                row.original.city ||
                row.original.full_address ||
                "—"}
            </div>
          </div>
        ),
      },
      {
        id: "occupancy",
        header: "Occupancy",
        cell: ({ row }) => (
          <Badge
            variant={row.original.current_lease_id ? "default" : "outline"}
          >
            {row.original.current_lease_id ? "occupied" : "vacant"}
          </Badge>
        ),
      },
      {
        accessorKey: "management_status",
        header: "Management",
        cell: ({ row }) => (
          <Badge variant={statusBadgeVariant(row.original.management_status)}>
            {row.original.management_status || "—"}
          </Badge>
        ),
      },
      {
        accessorKey: "payment_due_day",
        header: "Due Day",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.payment_due_day ?? "—"}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button asChild variant="outline" size="sm">
              <Link to={`/pm/properties/${row.original.id}`}>View</Link>
            </Button>
          </div>
        ),
      },
    ];
  }, []);

  const canPrev = offset > 0;
  const canNext = (properties.data?.length ?? 0) >= limit;

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Managed Properties
            </h1>
            <p className="text-sm text-muted-foreground">
              {role === "admin"
                ? "All managed properties."
                : "Managed properties for the selected owner."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PropertyCreateDialog
              ownerId={ownerId}
              disabled={role === "admin" && !ownerId}
            />
            <Badge variant="secondary" className="h-fit">
              <Building2 className="mr-1 h-3 w-3" />
              {properties.data?.length ?? 0} shown
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PropertyFilters
              q={q}
              onQChange={setQ}
              occupancy={occupancy}
              onOccupancyChange={setOccupancy}
              limit={limit}
              onLimitChange={(l) => {
                setLimit(l);
                setOffset(0);
              }}
            />

            {properties.isLoading ? (
              <LoadingState type="spinner" />
            ) : properties.isError ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  {getErrorMessage(properties.error, 'Failed to load properties')}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void properties.refetch();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : properties.data?.length ? (
              <>
                <DataTable columns={columns} data={properties.data} />
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    Offset {offset} &bull; Limit {limit}
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
              <EmptyState
                title="No managed properties"
                description="Try adjusting filters."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerScopeGate>
  );
}
