import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PAGE_SIZES, TENANT_STATUSES } from "@/features/pm/constants";import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RentalApplication, TenantStatus } from "@/types/pm";

interface InboxTabProps {
  applicationsData?: RentalApplication[];
  applicationsIsLoading: boolean;
  applicationsIsError: boolean;
  applicationsRefetch: () => void;
  appsOffset: number;
  appsLimit: number;
  appsCanPrev: boolean;
  appsCanNext: boolean;
  onAppsPrev: () => void;
  onAppsNext: () => void;
  status: TenantStatus | "";
  onStatusChange: (status: TenantStatus | "") => void;
  appsLimitValue: number;
  onAppsLimitChange: (limit: number) => void;
  decideIsLoading: boolean;
  onApprove: (application: RentalApplication) => void;
  onReject: (application: RentalApplication) => void;
}

export default function InboxTab({
  applicationsData,
  applicationsIsLoading,
  applicationsIsError,
  applicationsRefetch,
  appsOffset,
  appsLimit,
  appsCanPrev,
  appsCanNext,
  onAppsPrev,
  onAppsNext,
  status,
  onStatusChange,
  appsLimitValue,
  onAppsLimitChange,
  decideIsLoading,
  onApprove,
  onReject,
}: InboxTabProps) {
  const appColumns = useMemo<ColumnDef<RentalApplication>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "Application",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">#{row.original.id}</div>
            <div className="truncate text-xs text-muted-foreground">
              Form #{row.original.form_id} &bull; Property #{row.original.property_id}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.status}</Badge>
        ),
      },
      {
        id: "applicant",
        header: "Applicant",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate">{row.original.applicant_full_name || "—"}</div>
            <div className="truncate text-xs text-muted-foreground">
              {row.original.applicant_phone || row.original.applicant_email || "—"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "submitted_at",
        header: "Submitted",
        cell: ({ row }) =>
          row.original.submitted_at ? new Date(row.original.submitted_at).toLocaleString() : "—",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/pm/applications/${row.original.id}`}>View</Link>
            </Button>
            <Button
              size="sm"
              disabled={decideIsLoading || row.original.status === "approved"}
              onClick={() => onApprove(row.original)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={decideIsLoading || row.original.status === "rejected"}
              onClick={() => onReject(row.original)}
            >
              Reject
            </Button>
          </div>
        ),
      },
    ];
  }, [decideIsLoading, onApprove, onReject]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Applications Inbox</CardTitle>
        <Badge variant="secondary" className="h-fit">
          {applicationsData?.length ?? 0} shown
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            value={status || "all"}
            onValueChange={(v) => onStatusChange(v === "all" ? "" : (v as TenantStatus))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {TENANT_STATUSES.filter((s) => ["applicant", "approved", "rejected"].includes(s.value)).map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(appsLimitValue)}
            onValueChange={(v) => onAppsLimitChange(Number(v))}
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

        {applicationsIsLoading ? (
          <LoadingState type="spinner" />
        ) : applicationsIsError ? (
          <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load applications.</span>
            <Button variant="outline" size="sm" onClick={() => { void applicationsRefetch(); }}>
              Retry
            </Button>
          </div>
        ) : applicationsData?.length ? (
          <>
            <DataTable columns={appColumns} data={applicationsData} />
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-muted-foreground">
                Offset {appsOffset} &bull; Limit {appsLimit}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!appsCanPrev} onClick={onAppsPrev}>
                  Prev
                </Button>
                <Button variant="outline" size="sm" disabled={!appsCanNext} onClick={onAppsNext}>
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState title="No applications" description="Submissions will show up here." />
        )}
      </CardContent>
    </Card>
  );
}
