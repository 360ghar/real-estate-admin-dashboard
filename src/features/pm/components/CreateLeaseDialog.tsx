import { useCallback, useState } from "react";
import type { LeaseCreate, LeaseStatus } from "@/types/pm";
import { useCreatePmLeaseMutation, useListPmPropertiesQuery } from "@/features/pm/api/pmApi";
import { LEASE_STATUSES } from "@/features/pm/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";

interface CreateLeaseDialogProps {
  ownerId: number | null;
}

export default function CreateLeaseDialog({ ownerId }: CreateLeaseDialogProps) {
  const { role } = useUserRole();
  const { toast } = useToast();
  const [createLease, createState] = useCreatePmLeaseMutation();

  const properties = useListPmPropertiesQuery(
    { owner_id: ownerId, limit: 200, offset: 0 },
    { skip: role === "agent" && !ownerId },
  );

  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState<string>("");
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [leaseStatus, setLeaseStatus] = useState<LeaseStatus>("draft");

  const resetForm = useCallback(() => {
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

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetForm();
      }
    },
    [resetForm],
  );

  const submit = async () => {
    if (!propertyId || !startDate || !endDate || !monthlyRent || !securityDeposit) {
      toast({ title: "Missing fields", description: "Fill required fields.", variant: "destructive" });
      return;
    }

    const rentNum = Number(monthlyRent);
    const depositNum = Number(securityDeposit);
    if (isNaN(rentNum) || rentNum <= 0) {
      toast({ title: "Invalid rent", description: "Monthly rent must be a positive number.", variant: "destructive" });
      return;
    }
    if (isNaN(depositNum) || depositNum <= 0) {
      toast({ title: "Invalid deposit", description: "Security deposit must be a positive number.", variant: "destructive" });
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast({ title: "Invalid dates", description: "End date must be after start date.", variant: "destructive" });
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
      setOpen(false);
    } catch (e: unknown) {
      toast({ title: "Failed", description: getErrorMessage(e, "Could not create lease."), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <Select value={leaseStatus} onValueChange={(v) => setLeaseStatus(v as LeaseStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEASE_STATUSES.filter((s) =>
                  ["draft", "pending_signature", "active"].includes(s.value),
                ).map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tenant name</Label>
            <Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label>Tenant phone</Label>
            <Input value={tenantPhone} onChange={(e) => setTenantPhone(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label>Tenant email</Label>
            <Input value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>End date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Monthly rent</Label>
            <Input value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} placeholder="e.g. 25000" />
          </div>
          <div className="space-y-2">
            <Label>Security deposit</Label>
            <Input value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} placeholder="e.g. 50000" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => { void submit(); }} disabled={createState.isLoading}>
            {createState.isLoading ? "Creating…" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
