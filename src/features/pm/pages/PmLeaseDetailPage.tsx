import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import UploadSignedDialog from "@/features/pm/components/UploadSignedDialog";
import RenewLeaseDialog from "@/features/pm/components/RenewLeaseDialog";
import TerminateLeaseDialog from "@/features/pm/components/TerminateLeaseDialog";
import { useGetPmLeaseQuery } from "@/features/pm/api/pmApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getErrorMessage } from "@/lib/errors";

export default function PmLeaseDetailPage() {
  const { leaseId } = useParams();
  const leaseIdNum = Number(leaseId);

  const lease = useGetPmLeaseQuery(leaseIdNum, { skip: !leaseIdNum });

  const canTerminate = lease.data?.status !== "terminated";

  const headerTitle = useMemo(() => {
            if (lease.isLoading) return "Loading…";
    if (!lease.data) return `Lease #${leaseIdNum}`;
    return `Lease #${lease.data.id}`;
  }, [lease.data, lease.isLoading, leaseIdNum]);

  if (!leaseIdNum || Number.isNaN(leaseIdNum)) {
    return <EmptyState title="Invalid lease id" />;
  }

  if (lease.isError) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>{getErrorMessage(lease.error, 'Failed to load lease.')}</span>
        <Button variant="outline" size="sm" onClick={() => { void lease.refetch(); }}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{headerTitle}</h1>
          <p className="text-sm text-muted-foreground">
            Property #{lease.data?.property_id} &bull; Owner #{lease.data?.owner_id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lease.data ? <Badge variant="secondary">{lease.data.status}</Badge> : null}
          {lease.data ? (
            <UploadSignedDialog
              leaseId={lease.data.id}
              ownerId={lease.data.owner_id}
              propertyId={lease.data.property_id}
            />
          ) : null}
          {lease.data ? (
            <RenewLeaseDialog leaseId={lease.data.id} />
          ) : null}
          <TerminateLeaseDialog
            leaseId={leaseIdNum}
            tenantName={lease.data?.tenant_name ?? undefined}
            canTerminate={canTerminate}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {lease.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : lease.data ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tenant</span>
                  <span className="font-medium">
                    {lease.data.tenant_name || lease.data.tenant_phone || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Term</span>
                  <span className="font-medium">
                    {new Date(lease.data.start_date).toLocaleDateString()} →{" "}
                    {new Date(lease.data.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly rent</span>
                  <span className="font-medium">
                    ₹{lease.data.monthly_rent.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Security deposit</span>
                  <span className="font-medium">
                    ₹{lease.data.security_deposit.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due day</span>
                  <span className="font-medium">{lease.data.payment_due_day}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Grace period</span>
                  <span className="font-medium">{lease.data.grace_period_days} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lease document</span>
                  {lease.data.lease_document_id ? (
                    <span className="font-medium">Document #{lease.data.lease_document_id}</span>
                  ) : (
                    <span className="text-muted-foreground">Not uploaded</span>
                  )}
                </div>
              </>
            ) : (
              <EmptyState title="Lease not found" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lease.data ? (
              <>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to={`/pm/properties/${lease.data.property_id}`}>Open property</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/pm/rent-ledger">Open rent ledger</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/pm/documents">Open documents</Link>
                </Button>
              </>
            ) : (
              <EmptyState title="No quick links" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
