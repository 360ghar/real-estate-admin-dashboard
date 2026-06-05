import type { ColumnDef } from "@tanstack/react-table";
import type { RentChargeWithTotals, RentChargeStatus } from "@/types/pm";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { RENT_CHARGE_STATUSES, PAGE_SIZES } from "@/features/pm/constants";

interface ChargesTabProps {
  charges: {
    isLoading: boolean;
    data?: RentChargeWithTotals[];
  };
  chargeColumns: ColumnDef<RentChargeWithTotals>[];
  chargeStatus: RentChargeStatus | "";
  onChargeStatusChange: (status: RentChargeStatus | "") => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  offset: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onRecordPayment: (charge: RentChargeWithTotals) => void;
}

export default function ChargesTab({
  charges,
  chargeColumns,
  chargeStatus,
  onChargeStatusChange,
  limit,
  onLimitChange,
  offset,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onRecordPayment,
}: ChargesTabProps) {
  const columnsWithActions: ColumnDef<RentChargeWithTotals>[] = [
    ...chargeColumns.filter((c) => c.id !== "actions"),
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            onClick={() => onRecordPayment(row.original)}
            disabled={row.original.outstanding <= 0}
          >
            Record payment
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <Select
          value={chargeStatus}
          onValueChange={(v) => {
            onChargeStatusChange(v as RentChargeStatus | "");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            {RENT_CHARGE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(limit)}
          onValueChange={(v) => onLimitChange(Number(v))}
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

      {charges.isLoading ? (
        <LoadingState type="spinner" />
      ) : charges.data?.length ? (
        <>
          <DataTable columns={columnsWithActions} data={charges.data} />
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Offset {offset} &bull; Limit {limit}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!canPrev} onClick={onPrev}>
                Prev
              </Button>
              <Button variant="outline" size="sm" disabled={!canNext} onClick={onNext}>
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState title="No charges" description="Generate charges or adjust filters." />
      )}
    </>
  );
}
