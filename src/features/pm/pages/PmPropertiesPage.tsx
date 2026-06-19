import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Building2, Trash2 } from "lucide-react";
import OwnerScopeGate from "@/features/pm/components/OwnerScopeGate";
import PropertyCreateDialog from "@/features/pm/components/PropertyCreateDialog";
import PropertyFilters from "@/features/pm/components/PropertyFilters";
import { useUserRole } from "@/hooks/useUserRole";
import { useAppSelector } from "@/hooks/redux";
import { selectSelectedOwnerId } from "@/features/pm/slices/pmSlice";
import { useDebounce } from "@/hooks/useDebounce";
import type { ManagedPropertyStatus, PmProperty } from "@/types/pm";
import { useDeletePmPropertyMutation, useListPmPropertiesQuery } from "@/features/pm/api/pmApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmAlertDialog } from "@/components/ui/confirm-alert-dialog";
import CursorPager from "@/components/ui/cursor-pager";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const [occupancy, setOccupancy] = useState<"occupied" | "vacant" | "">("");
  const [limit, setLimit] = useState(50);

  const ownerId = selectedOwnerId;

  const pager = useCursorPagination();
  useEffect(() => { pager.reset() }, [pager, debouncedQ, occupancy, limit]);

  const properties = useListPmPropertiesQuery(
    {
      owner_id: ownerId,
      occupancy: occupancy || undefined,
      q: debouncedQ || undefined,
      limit,
      cursor: pager.cursor,
    },
    { skip: role === "agent" && !ownerId },
  );

  const displayData = properties.data?.items;

  const [deleteProperty, deletePropertyState] = useDeletePmPropertyMutation();

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
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/pm/properties/${row.original.id}`}>View</Link>
            </Button>
            <ConfirmAlertDialog
              title="Delete Property"
              description={`Are you sure you want to delete "${row.original.title}"? This action cannot be undone.`}
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={async () => {
                try {
                  await deleteProperty(row.original.id).unwrap();
                  toast({ title: "Deleted", description: "Property deleted." });
                } catch (e: unknown) {
                  toast({ title: "Failed", description: getErrorMessage(e, "Could not delete property."), variant: "destructive" });
                }
              }}
            >
              {(openDialog) => (
                <Button variant="destructive" size="sm" onClick={openDialog} disabled={deletePropertyState.isLoading}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </ConfirmAlertDialog>
          </div>
        ),
      },
    ];
  }, [deleteProperty, deletePropertyState.isLoading, toast]);

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
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
              {displayData?.length ?? 0} shown
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
              onLimitChange={setLimit}
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
            ) : displayData?.length ? (
              <>
                <ResponsiveDataTable columns={columns} data={displayData} />
                <CursorPager
                  canPrev={pager.canPrev}
                  hasMore={properties.data?.has_more ?? false}
                  loading={properties.isFetching}
                  onPrev={pager.prev}
                  onNext={() => properties.data && pager.next(properties.data.next_cursor)}
                />
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
