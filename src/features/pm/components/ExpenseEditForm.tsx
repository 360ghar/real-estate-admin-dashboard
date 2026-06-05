import { useState } from "react";
import type { Expense, ExpenseCategory, ExpenseUpdate } from "@/types/pm";
import { EXPENSE_CATEGORIES } from "@/features/pm/constants";
import { Button } from "@/components/ui/button";
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

interface ExpenseEditFormProps {
  expense: Expense;
  onUploadReceipt: (file: File) => Promise<number>;
  onSubmit: (payload: ExpenseUpdate) => Promise<void>;
  isSubmitting: boolean;
}

export default function ExpenseEditForm({
  expense,
  onUploadReceipt,
  onSubmit,
  isSubmitting,
}: ExpenseEditFormProps) {
  const { toast } = useToast();
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [amount, setAmount] = useState(String(expense.amount));
  const [expenseDate, setExpenseDate] = useState(expense.expense_date);
  const [description, setDescription] = useState(expense.description || "");
  const [notes, setNotes] = useState(expense.notes || "");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const save = async () => {
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: "Invalid amount", description: "Amount must be a positive number.", variant: "destructive" });
      return;
    }
    try {
      let receiptDocumentId: number | undefined;
      if (receiptFile) {
        receiptDocumentId = await onUploadReceipt(receiptFile);
      }
      const payload: ExpenseUpdate = {
        category,
        amount: amountNum,
        expense_date: expenseDate,
        description,
        notes,
        receipt_document_id: receiptDocumentId,
      };
      await onSubmit(payload);
      toast({ title: "Updated", description: "Expense updated." });
    } catch (e: unknown) {
      toast({ title: "Failed", description: getErrorMessage(e, "Could not update expense."), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
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
          <Label>Date</Label>
          <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Replace receipt (optional)</Label>
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
      <div className="flex justify-end">
        <Button onClick={() => { void save(); }} disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
