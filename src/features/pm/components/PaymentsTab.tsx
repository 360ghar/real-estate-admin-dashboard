import type { ColumnDef } from "@tanstack/react-table";
import type { RentPayment } from "@/types/pm";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import CursorPager from "@/components/ui/cursor-pager";

interface PaymentsTabProps {
  payments: { isLoading: boolean; isError: boolean; error: unknown; refetch: () => void; data?: RentPayment[] };
  paymentColumns: ColumnDef<RentPayment>[];
  limit: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function PaymentsTab({
  payments,
  paymentColumns,
  limit: _limit,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: PaymentsTabProps) {
  return (
    <>
      {payments.isError ? (
        <ErrorState error={payments.error} onRetry={payments.refetch} />
      ) : payments.isLoading ? (
        <LoadingState type="spinner" />
      ) : payments.data?.length ? (
        <>
          <ResponsiveDataTable columns={paymentColumns} data={payments.data} />
          <CursorPager canPrev={canPrev} hasMore={canNext} onPrev={onPrev} onNext={onNext} />
        </>
      ) : (
        <EmptyState title="No payments" description="Record a payment to see it here." />
      )}
    </>
  );
}
