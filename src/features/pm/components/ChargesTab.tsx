import { useMemo } from "react";
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
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import CursorPager from "@/components/ui/cursor-pager";
import { RENT_CHARGE_STATUSES, PAGE_SIZES } from "@/features/pm/constants";

interface ChargesTabProps {
  charges: {
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
    data?: RentChargeWithTotals[];
  };
  chargeColumns: ColumnDef<RentChargeWithTotals>[];
  chargeStatus: RentChargeStatus | "";
  onChargeStatusChange: (status: RentChargeStatus | "") => void;
  limit: number;
  onLimitChange: (limit: number) => void;
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
  canPrev,
  canNext,
  onPrev,
  onNext,
  onRecordPayment,
}: ChargesTabProps) {
  const columnsWithActions = useMemo<ColumnDef<RentChargeWithTotals>[]>(() => [
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
  ], [chargeColumns, onRecordPayment]);

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <Select
          value={chargeStatus || 'all'}
          onValueChange={(v) => {
            onChargeStatusChange(v === 'all' ? '' : v as RentChargeStatus);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
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

      {charges.isError ? (
        <ErrorState error={charges.error} onRetry={charges.refetch} />
      ) : charges.isLoading ? (
        <LoadingState type="spinner" />
      ) : charges.data?.length ? (
        <>
          <ResponsiveDataTable columns={columnsWithActions} data={charges.data} />
          <CursorPager canPrev={canPrev} hasMore={canNext} onPrev={onPrev} onNext={onNext} />
        </>
      ) : (
        <EmptyState title="No charges" description="Generate charges or adjust filters." />
      )}
    </>
  );
}
