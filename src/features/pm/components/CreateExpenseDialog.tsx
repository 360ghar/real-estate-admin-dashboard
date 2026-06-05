import { useCallback, useState } from "react";
import type { DocumentType, ExpenseCategory, ExpenseCreate } from "@/types/pm";
import {
  useCreatePmExpenseMutation,
  useListPmPropertiesQuery,
  useUploadPmDocumentMutation,
} from "@/features/pm/api/pmApi";
import { EXPENSE_CATEGORIES } from "@/features/pm/constants";
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

interface CreateExpenseDialogProps {
  ownerId: number | null;
}

export default function CreateExpenseDialog({ ownerId }: CreateExpenseDialogProps) {
  const { role } = useUserRole();
  const { toast } = useToast();
  const [createExpense, createState] = useCreatePmExpenseMutation();
  const [uploadDoc, uploadDocState] = useUploadPmDocumentMutation();

  const properties = useListPmPropertiesQuery(
    { owner_id: ownerId, limit: 200, offset: 0 },
    { skip: role === "agent" && !ownerId },
  );

  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("maintenance");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const resetForm = useCallback(() => {
    setPropertyId("");
    setCategory("maintenance");
    setAmount("");
    setExpenseDate("");
    setDescription("");
    setNotes("");
    setReceiptFile(null);
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
    if (!propertyId || !amount || !expenseDate) {
      toast({ title: "Missing fields", description: "Property, amount, and date are required.", variant: "destructive" });
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: "Invalid amount", description: "Amount must be a positive number.", variant: "destructive" });
      return;
    }

    try {
      const selectedPropertyOwnerId = (properties.data || []).find(
        (p) => String(p.id) === String(propertyId),
      )?.owner_id;
      const effectiveOwnerId = ownerId ?? selectedPropertyOwnerId ?? null;

      let receiptDocumentId: number | undefined;
      if (receiptFile) {
        const fd = new FormData();
        fd.append("file", receiptFile);
        fd.append("document_type", "receipt" satisfies DocumentType);
        fd.append("title", description || `Expense receipt • ${expenseDate}`);
        if (effectiveOwnerId) fd.append("owner_id", String(effectiveOwnerId));
        fd.append("property_id", propertyId);
        fd.append("shared_with_agent", "true");
        const doc = await uploadDoc(fd).unwrap();
        receiptDocumentId = doc.id;
      }

      const payload: ExpenseCreate = {
        owner_id: effectiveOwnerId || undefined,
        property_id: Number(propertyId),
        category,
        amount: amountNum,
        expense_date: expenseDate,
        description: description || undefined,
        notes: notes || undefined,
        receipt_document_id: receiptDocumentId,
      };
      await createExpense(payload).unwrap();
      toast({ title: "Added", description: "Expense added." });
      handleOpenChange(false);
    } catch (e: unknown) {
      toast({ title: "Failed", description: getErrorMessage(e, "Could not add expense."), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add expense
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
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
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Expense date</Label>
            <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1200" />
          </div>
          <div className="space-y-2">
            <Label>Receipt (optional)</Label>
            <Input type="file" onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description (optional)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Notes (optional)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => { void submit(); }} disabled={createState.isLoading || uploadDocState.isLoading}>
            {createState.isLoading || uploadDocState.isLoading ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
