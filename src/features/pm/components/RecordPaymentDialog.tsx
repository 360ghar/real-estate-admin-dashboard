import { useState } from "react";
import type { DocumentType, RentChargeWithTotals, RentPaymentCreate } from "@/types/pm";
import {
  useListRentChargesQuery,
  useRecordRentPaymentMutation,
  useUploadPmDocumentMutation,
} from "@/features/pm/api/pmApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";
import { PAYMENT_METHODS } from "@/features/pm/constants";

interface RecordPaymentDialogProps {
  ownerId: number | null;
  charge: RentChargeWithTotals | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RecordPaymentDialog({
  ownerId,
  charge,
  open,
  onOpenChange,
}: RecordPaymentDialogProps) {
  const { toast } = useToast();
  const [recordPayment, recordState] = useRecordRentPaymentMutation();
  const [uploadDoc, uploadDocState] = useUploadPmDocumentMutation();

  const charges = useListRentChargesQuery(
    { owner_id: ownerId, limit: 50, offset: 0 },
    { skip: !ownerId },
  );

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);

  const chargeId = charge?.charge.id ?? null;

  const submit = async () => {
    if (!chargeId) return;
    if (!amount) {
      toast({ title: "Missing amount", description: "Enter an amount.", variant: "destructive" });
      return;
    }
    try {
      let receiptDocumentId: number | undefined;
      if (receipt) {
        const c = charges.data?.find((item) => item.charge.id === chargeId)?.charge;
        const fd = new FormData();
        fd.append("file", receipt);
        fd.append("document_type", "receipt" satisfies DocumentType);
        fd.append("title", `Rent receipt • charge #${chargeId}`);
        if (c?.owner_id) fd.append("owner_id", String(c.owner_id));
        else if (ownerId) fd.append("owner_id", String(ownerId));
        if (c?.property_id) fd.append("property_id", String(c.property_id));
        if (c?.lease_id) fd.append("lease_id", String(c.lease_id));
        fd.append("shared_with_agent", "true");
        fd.append("shared_with_tenant", "true");
        const doc = await uploadDoc(fd).unwrap();
        receiptDocumentId = doc.id;
      }

      const payload: RentPaymentCreate = {
        charge_id: chargeId,
        amount_paid: Number(amount),
        payment_method: method,
        reference: reference || undefined,
        notes: notes || undefined,
        receipt_document_id: receiptDocumentId,
      };
      await recordPayment(payload).unwrap();
      toast({ title: "Recorded", description: "Payment recorded." });
      onOpenChange(false);
    } catch (e: unknown) {
      toast({ title: "Failed", description: getErrorMessage(e, "Could not record payment."), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Charge #{chargeId}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reference (optional)</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Receipt file (optional)</Label>
              <Input type="file" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notes (optional)</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => { void submit(); }}
              disabled={recordState.isLoading || uploadDocState.isLoading}
            >
              {recordState.isLoading || uploadDocState.isLoading ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
