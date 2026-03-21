import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, FileText, Plus } from "lucide-react";
import { LEASE_STATUSES, PAGE_SIZES } from "@/features/pm/constants";
import OwnerScopeGate from "@/features/pm/components/OwnerScopeGate";
import { useUserRole } from "@/hooks/useUserRole";
import { useAppSelector } from "@/hooks/redux";
import { selectSelectedOwnerId } from "@/features/pm/slices/pmSlice";
import {
  type Lease,
  type LeaseCreate,
  type LeaseStatus,
  useCreatePmLeaseMutation,
  useListPmLeasesQuery,
  useListPmPropertiesQuery,
} from "@/features/pm/api/pmApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";

const leaseBadgeVariant = (status: LeaseStatus) => {
  if (status === "active") return "default";
  if (status === "terminated" || status === "expired") return "outline";
  return "secondary";
};

export default function PmLeasesPage() {
  const { role } = useUserRole();
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId);
  const { toast } = useToast();

  const [status, setStatus] = useState<LeaseStatus | "">("");
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const ownerId = selectedOwnerId;

  const leases = useListPmLeasesQuery(
    { owner_id: ownerId, status: status || undefined, limit, offset },
    { skip: role === "agent" && !ownerId },
  );

  const properties = useListPmPropertiesQuery(
    { owner_id: ownerId, limit: 200, offset: 0 },
    { skip: role === "agent" && !ownerId },
  );

  const [createLease, createState] = useCreatePmLeaseMutation();

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

  // Create lease modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [propertyId, setPropertyId] = useState<string>("");
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [leaseStatus, setLeaseStatus] = useState<LeaseStatus>("draft");

  const resetCreateForm = useCallback(() => {
    setPropertyId("");
    setTenantName("");
    setTenantPhone("");
    setTenantEmail("");
    setStartDate("");
    setEndDate("");
    setMonthlyRent("");
    setSecurityDeposit("");
    setLeaseStatus("draft");
  }, []);

  const handleCreateOpenChange = useCallback(
    (open: boolean) => {
      setCreateOpen(open);
      if (!open) {
        resetCreateForm();
      }
    },
    [resetCreateForm],
  );

  const submitCreate = async () => {
    if (
      !propertyId ||
      !startDate ||
      !endDate ||
      !monthlyRent ||
      !securityDeposit
    ) {
      toast({
        title: "Missing fields",
        description: "Fill required fields.",
        variant: "destructive",
      });
      return;
    }

    const rentNum = Number(monthlyRent);
    const depositNum = Number(securityDeposit);
    if (isNaN(rentNum) || rentNum <= 0) {
      toast({
        title: "Invalid rent",
        description: "Monthly rent must be a positive number.",
        variant: "destructive",
      });
      return;
    }
    if (isNaN(depositNum) || depositNum <= 0) {
      toast({
        title: "Invalid deposit",
        description: "Security deposit must be a positive number.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    const selectedPropertyOwnerId = (properties.data || []).find(
      (p) => String(p.id) === String(propertyId),
    )?.owner_id;

    const payload: LeaseCreate = {
      owner_id: ownerId ?? selectedPropertyOwnerId ?? undefined,
      property_id: Number(propertyId),
      tenant_name: tenantName || undefined,
      tenant_phone: tenantPhone || undefined,
      tenant_email: tenantEmail || undefined,
      status: leaseStatus,
      start_date: startDate,
      end_date: endDate,
      monthly_rent: rentNum,
      security_deposit: depositNum,
    };
    try {
      await createLease(payload).unwrap();
      toast({ title: "Created", description: "Lease created." });
      setCreateOpen(false);
    } catch (e: unknown) {
      toast({
        title: "Failed",
        description: getErrorMessage(e, "Could not create lease."),
        variant: "destructive",
      });
    }
  };

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
          <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Lease
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create lease</DialogTitle>
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
                  <Label>Status</Label>
                  <Select
                    value={leaseStatus}
                    onValueChange={(v) => setLeaseStatus(v as LeaseStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEASE_STATUSES.filter((s) =>
                        ['draft', 'pending_signature', 'active'].includes(s.value)
                      ).map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tenant name</Label>
                  <Input
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tenant phone</Label>
                  <Input
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tenant email</Label>
                  <Input
                    value={tenantEmail}
                    onChange={(e) => setTenantEmail(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly rent</Label>
                  <Input
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    placeholder="e.g. 25000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Security deposit</Label>
                  <Input
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    void submitCreate();
                  }}
                  disabled={createState.isLoading}
                >
                  {createState.isLoading ? "Creating…" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
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
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {leases.isError ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  Failed to load leases
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { void leases.refetch() }}
                >
                  Retry
                </Button>
              </div>
            ) : leases.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : leases.data?.length ? (
              <>
                <DataTable columns={columns} data={leases.data} />
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
              <EmptyState
                title="No leases"
                description="Create your first lease to start rent operations."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerScopeGate>
  );
}
