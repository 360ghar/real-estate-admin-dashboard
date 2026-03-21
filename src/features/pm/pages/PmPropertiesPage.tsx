import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Building2 } from "lucide-react";
import OwnerScopeGate from "@/features/pm/components/OwnerScopeGate";
import { useUserRole } from "@/hooks/useUserRole";
import { useAppSelector } from "@/hooks/redux";
import { selectSelectedOwnerId } from "@/features/pm/slices/pmSlice";
import { useDebounce } from "@/hooks/useDebounce";
import {
  type ManagedPropertyStatus,
  type PmProperty,
  type PropertyCreate,
  useCreatePmPropertyMutation,
  useListPmPropertiesQuery,
  useUpdatePmPropertyMutation,
} from "@/features/pm/api/pmApi";
import { PAGE_SIZES, VALIDATION } from "@/features/pm/constants";
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
import { Textarea } from "@/components/ui/textarea";
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
  const [offset, setOffset] = useState(0);

  const ownerId = selectedOwnerId;

  const [createProperty, createState] = useCreatePmPropertyMutation();
  const [updateProperty] = useUpdatePmPropertyMutation();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState<
    "apartment" | "house" | "builder_floor" | "room"
  >("apartment");
  const [purpose, setPurpose] = useState<"rent" | "buy" | "short_stay">("rent");
  const [basePrice, setBasePrice] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [managementStatus, setManagementStatus] =
    useState<ManagedPropertyStatus>("active");
  const [paymentDueDay, setPaymentDueDay] = useState("1");
  const [graceDays, setGraceDays] = useState("5");
  const [lateFeePolicyJson, setLateFeePolicyJson] = useState(
    '{"type":"fixed","amount":0}',
  );

  const resetCreateForm = useCallback(() => {
    setTitle("");
    setPropertyType("apartment");
    setPurpose("rent");
    setBasePrice("");
    setCity("");
    setLocality("");
    setFullAddress("");
    setManagementStatus("active");
    setPaymentDueDay("1");
    setGraceDays("5");
    setLateFeePolicyJson('{"type":"fixed","amount":0}');
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
    if (!ownerId) {
      toast({
        title: "Select an owner",
        description: "Choose an owner from the top bar.",
        variant: "destructive",
      });
      return;
    }
    if (!title || !basePrice) {
      toast({
        title: "Missing fields",
        description: "Title and base price are required.",
        variant: "destructive",
      });
      return;
    }
    const dueDayNum = Number(paymentDueDay);
    if (
      isNaN(dueDayNum) ||
      dueDayNum < VALIDATION.PAYMENT_DUE_DAY_MIN ||
      dueDayNum > VALIDATION.PAYMENT_DUE_DAY_MAX
    ) {
      toast({
        title: "Invalid due day",
        description: `Payment due day must be between ${VALIDATION.PAYMENT_DUE_DAY_MIN} and ${VALIDATION.PAYMENT_DUE_DAY_MAX}.`,
        variant: "destructive",
      });
      return;
    }
    const graceDaysNum = Number(graceDays);
    if (isNaN(graceDaysNum) || graceDaysNum < 0 || graceDaysNum > 30) {
      toast({
        title: "Invalid grace period",
        description: "Grace period must be between 0 and 30 days.",
        variant: "destructive",
      });
      return;
    }
    const basePriceNum = Number(basePrice);
    if (isNaN(basePriceNum) || basePriceNum <= 0) {
      toast({
        title: "Invalid price",
        description: "Base price must be a positive number.",
        variant: "destructive",
      });
      return;
    }
    let lateFeePolicy: Record<string, unknown> | undefined;
    try {
      lateFeePolicy = lateFeePolicyJson
        ? (JSON.parse(lateFeePolicyJson) as Record<string, unknown>)
        : undefined;
    } catch {
      toast({
        title: "Invalid JSON",
        description: "Late fee policy must be valid JSON.",
        variant: "destructive",
      });
      return;
    }

    const data: PropertyCreate = {
      title,
      property_type: propertyType,
      purpose,
      base_price: Number(basePrice),
      city: city || undefined,
      locality: locality || undefined,
      full_address: fullAddress || undefined,
      monthly_rent: purpose === "rent" ? Number(basePrice) : undefined,
    };

    try {
      const created = await createProperty({
        data,
        owner_id: ownerId,
        management_status: managementStatus,
        payment_due_day: Number(paymentDueDay),
        grace_period_days: Number(graceDays),
      }).unwrap();
      try {
        await updateProperty({
          property_id: created.id,
          payload: { late_fee_policy: lateFeePolicy },
        }).unwrap();
      } catch {
        toast({
          title: "Partial success",
          description: "Property created, but late fee policy could not be saved. Please update it manually.",
          variant: "destructive",
        });
        handleCreateOpenChange(false);
        return;
      }
      toast({ title: "Created", description: "Managed property created." });
      handleCreateOpenChange(false);
    } catch (e: unknown) {
      toast({
        title: "Failed",
        description: getErrorMessage(e, "Could not create property."),
        variant: "destructive",
      });
    }
  };

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
            <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
              <DialogTrigger asChild>
                <Button disabled={role === "admin" && !ownerId}>Create</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create managed property</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 2BHK in Indiranagar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Property type</Label>
                    <Select
                      value={propertyType}
                      onValueChange={(v) =>
                        setPropertyType(v as typeof propertyType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">apartment</SelectItem>
                        <SelectItem value="house">house</SelectItem>
                        <SelectItem value="builder_floor">
                          builder_floor
                        </SelectItem>
                        <SelectItem value="room">room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose</Label>
                    <Select
                      value={purpose}
                      onValueChange={(v) => setPurpose(v as typeof purpose)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">rent</SelectItem>
                        <SelectItem value="buy">buy</SelectItem>
                        <SelectItem value="short_stay">short_stay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Base price (₹)</Label>
                    <Input
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="e.g. 25000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City (optional)</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Locality (optional)</Label>
                    <Input
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Full address (optional)</Label>
                    <Input
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Management status</Label>
                    <Select
                      value={managementStatus}
                      onValueChange={(v) =>
                        setManagementStatus(v as ManagedPropertyStatus)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">draft</SelectItem>
                        <SelectItem value="active">active</SelectItem>
                        <SelectItem value="archived">archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment due day (1-28)</Label>
                    <Input
                      value={paymentDueDay}
                      onChange={(e) => setPaymentDueDay(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grace period days</Label>
                    <Input
                      value={graceDays}
                      onChange={(e) => setGraceDays(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Late fee policy (JSON)</Label>
                    <Textarea
                      value={lateFeePolicyJson}
                      onChange={(e) => setLateFeePolicyJson(e.target.value)}
                      rows={6}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCreateOpenChange(false)}
                  >
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
                {role === "admin" && !ownerId ? (
                  <div className="text-sm text-muted-foreground">
                    Select an owner from the top bar to create a managed
                    property in the correct portfolio.
                  </div>
                ) : null}
              </DialogContent>
            </Dialog>
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
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title/address…"
              />
              <Select
                value={occupancy || "all"}
                onValueChange={(v) => setOccupancy(v === "all" ? "" : (v as "occupied" | "vacant"))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Occupancy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="vacant">Vacant</SelectItem>
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

            {properties.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : properties.isError ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  Failed to load properties
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { void properties.refetch() }}
                >
                  Retry
                </Button>
              </div>
            ) : properties.data?.length ? (
              <>
                <DataTable columns={columns} data={properties.data} />
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
