import { useState } from "react";
import type { RentChargeGenerateRequest } from "@/types/pm";
import {
  useGenerateRentChargesMutation,
  useListPmLeasesQuery,
} from "@/features/pm/api/pmApi";
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
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";

interface GenerateChargesDialogProps {
  ownerId: number | null;
}

export default function GenerateChargesDialog({
  ownerId,
}: GenerateChargesDialogProps) {
  const { role } = useUserRole();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<"owner" | "lease">("owner");
  const [leaseId, setLeaseId] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [months, setMonths] = useState("1");
  const [generateCharges, generateState] = useGenerateRentChargesMutation();

  const leases = useListPmLeasesQuery(
    { owner_id: ownerId, status: "active", limit: 200, offset: 0 },
    { skip: role === "agent" && !ownerId },
  );

  const submit = async () => {
    const payload: RentChargeGenerateRequest = {
      owner_id: scope === "owner" ? ownerId || undefined : undefined,
      lease_id: scope === "lease" ? Number(leaseId) : undefined,
      start_month: startMonth || undefined,
      months: Number(months),
    };
    try {
      const res = await generateCharges(payload).unwrap();
      toast({ title: "Generated", description: `Created ${res.created}, skipped ${res.skipped}.` });
      setOpen(false);
    } catch (e: unknown) {
      toast({ title: "Failed", description: getErrorMessage(e, "Could not generate charges."), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Generate charges
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Generate rent charges</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as "owner" | "lease")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner (all active leases)</SelectItem>
                <SelectItem value="lease">Specific lease</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {scope === "lease" ? (
            <div className="space-y-2">
              <Label>Lease</Label>
              <Select value={leaseId} onValueChange={setLeaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lease…" />
                </SelectTrigger>
                <SelectContent>
                  {(leases.data || []).map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      #{l.id} • Property #{l.property_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start month</Label>
              <Input type="date" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} />
              <div className="text-xs text-muted-foreground">Pick any day; backend uses month start.</div>
            </div>
            <div className="space-y-2">
              <Label>Months</Label>
              <Input value={months} onChange={(e) => setMonths(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                void submit();
              }}
              disabled={generateState.isLoading || (scope === "lease" && !leaseId)}
            >
              {generateState.isLoading ? "Generating…" : "Generate"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
