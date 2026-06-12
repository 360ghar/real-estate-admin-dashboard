import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Download } from "lucide-react";
import { EXPENSE_CATEGORIES, PAGE_SIZES } from "@/features/pm/constants";
import { formatINR, downloadCsv } from "@/features/pm/utils";
import OwnerScopeGate from "@/features/pm/components/OwnerScopeGate";
import CreateExpenseDialog from "@/features/pm/components/CreateExpenseDialog";
import ExpenseEditForm from "@/features/pm/components/ExpenseEditForm";
import { useUserRole } from "@/hooks/useUserRole";
import { useAppSelector } from "@/hooks/redux";
import { selectSelectedOwnerId } from "@/features/pm/slices/pmSlice";
import type { DocumentType, Expense, ExpenseCategory } from "@/types/pm";
import {
  useListPmExpensesQuery,
  useUpdatePmExpenseMutation,
  useUploadPmDocumentMutation,
} from "@/features/pm/api/pmApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { getErrorMessage } from "@/lib/errors";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PmExpensesPage() {
  const { role } = useUserRole();
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId);

  const ownerId = selectedOwnerId;

  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const validDateRange = !startDate || !endDate || startDate <= endDate;

  const expenses = useListPmExpensesQuery(
    {
      owner_id: ownerId,
      category: category || undefined,
      start_date: validDateRange && startDate ? startDate : undefined,
      end_date: validDateRange && endDate ? endDate : undefined,
      limit,
      offset,
    },
    { skip: role === "agent" && !ownerId },
  );

  const [updateExpense, updateState] = useUpdatePmExpenseMutation();
  const [uploadDoc, uploadDocState] = useUploadPmDocumentMutation();

  const columns = useMemo<ColumnDef<Expense>[]>(() => {
    return [
      {
        accessorKey: "expense_date",
        header: "Date",
        cell: ({ row }) => new Date(row.original.expense_date).toLocaleDateString(),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatINR(row.original.amount),
      },
      {
        accessorKey: "property_id",
        header: "Property",
        cell: ({ row }) => <span className="text-sm">#{row.original.property_id}</span>,
      },
      {
        id: "receipt",
        header: "Receipt",
        cell: ({ row }) =>
          row.original.receipt_document_id ? (
            <Badge variant="outline">Doc #{row.original.receipt_document_id}</Badge>
          ) : (
            "—"
          ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Edit</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit expense</DialogTitle>
                </DialogHeader>
                <ExpenseEditForm
                  expense={row.original}
                  onUploadReceipt={async (file) => {
                    const fd = new FormData();
                    fd.append("file", file);
                    fd.append("document_type", "receipt" satisfies DocumentType);
                    fd.append("title", `Expense receipt • #${row.original.id}`);
                    fd.append("owner_id", String(row.original.owner_id));
                    fd.append("property_id", String(row.original.property_id));
                    fd.append("shared_with_agent", "true");
                    const doc = await uploadDoc(fd).unwrap();
                    return doc.id;
                  }}
                  onSubmit={async (payload) => {
                    await updateExpense({ expense_id: row.original.id, payload }).unwrap();
                  }}
                  isSubmitting={updateState.isLoading || uploadDocState.isLoading}
                />
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ];
  }, [updateExpense, updateState.isLoading, uploadDoc, uploadDocState.isLoading]);

  const canPrev = offset > 0;
  const canNext = (expenses.data?.length ?? 0) >= limit;

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-sm text-muted-foreground">Track expenses and attach receipts.</p>
          </div>
          <div className="flex items-center gap-2">
            <CreateExpenseDialog ownerId={ownerId} />
            <Button
              variant="outline"
              onClick={() => {
                const rows = (expenses.data || []).map((e) => ({
                  id: e.id,
                  expense_date: e.expense_date,
                  category: e.category,
                  amount: e.amount,
                  property_id: e.property_id,
                  receipt_document_id: e.receipt_document_id,
                  description: e.description,
                  notes: e.notes,
                }));
                downloadCsv(`expenses_${new Date().toISOString().slice(0, 10)}.csv`, rows);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Expense List</CardTitle>
            <Badge variant="secondary" className="h-fit">
              {expenses.data?.length ?? 0} shown
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Select
                value={category || "all"}
                onValueChange={(v) => {
                  setCategory(v === "all" ? "" : (v as ExpenseCategory));
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setOffset(0); }} />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setOffset(0); }}
                className={!validDateRange ? "border-destructive" : ""}
              />
              {!validDateRange && <span className="text-xs text-destructive">End date must be after start date</span>}
              <Select
                value={String(limit)}
                onValueChange={(v) => { setLimit(Number(v)); setOffset(0); }}
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

            {expenses.isError ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">{getErrorMessage(expenses.error, 'Failed to load expenses')}</p>
                <Button variant="outline" size="sm" onClick={() => { void expenses.refetch(); }}>
                  Retry
                </Button>
              </div>
            ) : expenses.isLoading ? (
              <LoadingState type="spinner" />
            ) : expenses.data?.length ? (
              <>
                <DataTable columns={columns} data={expenses.data} />
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    Offset {offset} &bull; Limit {limit}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={!canPrev} onClick={() => setOffset(Math.max(0, offset - limit))}>
                      Prev
                    </Button>
                    <Button variant="outline" size="sm" disabled={!canNext} onClick={() => setOffset(offset + limit)}>
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState title="No expenses" description="Add an expense to track costs." />
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerScopeGate>
  );
}
