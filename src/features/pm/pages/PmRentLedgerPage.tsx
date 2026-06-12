import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { formatINR, downloadCsv } from "@/features/pm/utils";
import OwnerScopeGate from "@/features/pm/components/OwnerScopeGate";
import GenerateChargesDialog from "@/features/pm/components/GenerateChargesDialog";
import ChargesTab from "@/features/pm/components/ChargesTab";
import PaymentsTab from "@/features/pm/components/PaymentsTab";
import RecordPaymentDialog from "@/features/pm/components/RecordPaymentDialog";
import { useUserRole } from "@/hooks/useUserRole";
import { useAppSelector } from "@/hooks/redux";
import { selectSelectedOwnerId } from "@/features/pm/slices/pmSlice";
import type { RentChargeWithTotals, RentPayment, RentChargeStatus } from "@/types/pm";
import {
  useListRentChargesQuery,
  useListRentPaymentsQuery,
} from "@/features/pm/api/pmApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PmRentLedgerPage() {
  const { role } = useUserRole();
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId);
  const ownerId = selectedOwnerId;

  const [tab, setTab] = useState<"charges" | "payments">("charges");
  const [chargeStatus, setChargeStatus] = useState<RentChargeStatus | "">("");
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<RentChargeWithTotals | null>(null);

  const openPayment = (charge: RentChargeWithTotals) => {
    setSelectedCharge(charge);
    setPaymentOpen(true);
  };

  const charges = useListRentChargesQuery(
    { owner_id: ownerId, status: chargeStatus || undefined, limit, offset },
    { skip: role === "agent" && !ownerId },
  );

  const payments = useListRentPaymentsQuery(
    { owner_id: ownerId, limit, offset },
    { skip: role === "agent" && !ownerId },
  );

  const chargeColumns = useMemo<ColumnDef<RentChargeWithTotals>[]>(() => {
    return [
      {
        id: "billing",
        header: "Billing Month",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-medium">
              {new Date(row.original.charge.billing_month).toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Due {new Date(row.original.charge.due_date).toLocaleDateString()}
            </div>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.charge.status}</Badge>
        ),
      },
      {
        id: "due",
        header: "Due",
        cell: ({ row }) => (
          <span className="text-sm">{formatINR(row.original.amount_due_total)}</span>
        ),
      },
      {
        id: "paid",
        header: "Paid",
        cell: ({ row }) => (
          <span className="text-sm">{formatINR(row.original.amount_paid_total)}</span>
        ),
      },
      {
        id: "outstanding",
        header: "Outstanding",
        cell: ({ row }) => (
          <span className={row.original.outstanding > 0 ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
            {formatINR(row.original.outstanding)}
          </span>
        ),
      },
    ];
  }, []);

  const paymentColumns = useMemo<ColumnDef<RentPayment>[]>(() => {
    return [
      {
        accessorKey: "paid_at",
        header: "Paid at",
        cell: ({ row }) => new Date(row.original.paid_at).toLocaleString(),
      },
      {
        accessorKey: "amount_paid",
        header: "Amount",
        cell: ({ row }) => formatINR(row.original.amount_paid),
      },
      {
        accessorKey: "payment_method",
        header: "Method",
        cell: ({ row }) => row.original.payment_method || "—",
      },
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ row }) => row.original.reference || "—",
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
    ];
  }, []);

  const canPrev = offset > 0;
  const canNextCharges = (charges.data?.length ?? 0) >= limit;
  const canNextPayments = (payments.data?.length ?? 0) >= limit;

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Rent Ledger</h1>
            <p className="text-sm text-muted-foreground">
              Generate charges and record manual payments + receipts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <GenerateChargesDialog ownerId={ownerId} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant={tab === "charges" ? "default" : "outline"} size="sm" onClick={() => setTab("charges")}>
            Charges
          </Button>
          <Button variant={tab === "payments" ? "default" : "outline"} size="sm" onClick={() => setTab("payments")}>
            Payments
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{tab === "charges" ? "Charges" : "Payments"}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (tab === "charges") {
                  const rows = (charges.data || []).map((c) => ({
                    charge_id: c.charge.id,
                    billing_month: c.charge.billing_month,
                    due_date: c.charge.due_date,
                    status: c.charge.status,
                    amount_due_total: c.amount_due_total,
                    amount_paid_total: c.amount_paid_total,
                    outstanding: c.outstanding,
                    property_id: c.charge.property_id,
                    lease_id: c.charge.lease_id,
                  }));
                  downloadCsv(`rent_charges_${new Date().toISOString().slice(0, 10)}.csv`, rows);
                } else {
                  const rows = (payments.data || []).map((p) => ({
                    payment_id: p.id,
                    paid_at: p.paid_at,
                    amount_paid: p.amount_paid,
                    method: p.payment_method,
                    reference: p.reference,
                    notes: p.notes,
                    charge_id: p.charge_id,
                    lease_id: p.lease_id,
                    property_id: p.property_id,
                    receipt_document_id: p.receipt_document_id,
                  }));
                  downloadCsv(`rent_payments_${new Date().toISOString().slice(0, 10)}.csv`, rows);
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {tab === "charges" ? (
              <ChargesTab
                charges={charges}
                chargeColumns={chargeColumns}
                chargeStatus={chargeStatus}
                onChargeStatusChange={(s) => {
                  setChargeStatus(s);
                  setOffset(0);
                }}
                limit={limit}
                onLimitChange={(l) => {
                  setLimit(l);
                  setOffset(0);
                }}
                offset={offset}
                canPrev={canPrev}
                canNext={canNextCharges}
                onPrev={() => setOffset(Math.max(0, offset - limit))}
                onNext={() => setOffset(offset + limit)}
                onRecordPayment={openPayment}
              />
            ) : (
              <PaymentsTab
                payments={payments}
                paymentColumns={paymentColumns}
                offset={offset}
                limit={limit}
                canPrev={canPrev}
                canNext={canNextPayments}
                onPrev={() => setOffset(Math.max(0, offset - limit))}
                onNext={() => setOffset(offset + limit)}
              />
            )}
          </CardContent>
        </Card>

        <RecordPaymentDialog
          ownerId={ownerId}
          charge={selectedCharge}
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
        />
      </div>
    </OwnerScopeGate>
  );
}
