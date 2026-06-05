import type { ColumnDef } from "@tanstack/react-table";
import type { RentPayment } from "@/types/pm";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

interface PaymentsTabProps {
  payments: { isLoading: boolean; data?: RentPayment[] };
  paymentColumns: ColumnDef<RentPayment>[];
  offset: number;
  limit: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function PaymentsTab({
  payments,
  paymentColumns,
  offset,
  limit,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: PaymentsTabProps) {
  return (
    <>
      {payments.isLoading ? (
        <LoadingState type="spinner" />
      ) : payments.data?.length ? (
        <>
          <DataTable columns={paymentColumns} data={payments.data} />
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
        <EmptyState title="No payments" description="Record a payment to see it here." />
      )}
    </>
  );
}
