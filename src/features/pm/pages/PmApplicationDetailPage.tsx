import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, FileText, ShieldCheck, ShieldX } from "lucide-react";
import DecisionAlertDialog from "@/features/pm/components/DecisionAlertDialog";
import {
  useGetApplicationQuery,
  useListPmDocumentsQuery,
} from "@/features/pm/api/pmApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getErrorMessage } from "@/lib/errors";

export default function PmApplicationDetailPage() {
  const { applicationId } = useParams();
  const applicationIdNum = Number(applicationId);

  const application = useGetApplicationQuery(applicationIdNum, {
    skip: !applicationIdNum,
  });

  const docs = useListPmDocumentsQuery(
    {
      owner_id: application.data?.owner_id ?? undefined,
      rental_application_id: applicationIdNum,
      limit: 50,
      offset: 0,
    },
    { skip: !application.data?.owner_id },
  );

  const decisionDialog = DecisionAlertDialog({
    applicationId: applicationIdNum,
    applicantName: application.data?.applicant_full_name ?? undefined,
  });

  const answersJson = useMemo(() => {
    if (!application.data?.answers) return null;
    try {
      return JSON.stringify(application.data.answers, null, 2);
    } catch {
      return null;
    }
  }, [application.data?.answers]);

  if (!applicationIdNum || Number.isNaN(applicationIdNum)) {
    return <EmptyState title="Invalid application id" />;
  }

  if (application.isError) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>{getErrorMessage(application.error, 'Failed to load application.')}</span>
        <Button variant="outline" size="sm" onClick={() => { void application.refetch(); }}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {application.isLoading ? "Loading…" : `Application #${application.data?.id ?? applicationIdNum}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Form #{application.data?.form_id} &bull; Property #{application.data?.property_id}
          </p>
        </div>
        {application.data ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{application.data.status}</Badge>
            <Button
              size="sm"
              disabled={decisionDialog.isLoading || application.data.status === "approved"}
              onClick={decisionDialog.openApprove}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={decisionDialog.isLoading || application.data.status === "rejected"}
              onClick={decisionDialog.openReject}
            >
              <ShieldX className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Applicant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {application.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : application.data ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{application.data.applicant_full_name || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{application.data.applicant_phone || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{application.data.applicant_email || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium">
                    {application.data.submitted_at ? new Date(application.data.submitted_at).toLocaleString() : "—"}
                  </span>
                </div>
              </>
            ) : (
              <EmptyState title="Application not found" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/pm/leases">Create lease</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to={`/pm/properties/${application.data?.property_id ?? ""}`}>
                Open property
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Answers (JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          {application.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : answersJson ? (
            <pre className="max-h-[520px] overflow-auto rounded-md bg-muted p-4 text-xs">
              {answersJson}
            </pre>
          ) : (
            <EmptyState title="No answers" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {docs.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : docs.data?.length ? (
            <div className="space-y-2">
              {docs.data.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{d.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {d.document_type} &bull; Doc #{d.id}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={d.file_url} target="_blank" rel="noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No documents linked" />
          )}
        </CardContent>
      </Card>

      {decisionDialog.renderDialog()}
    </div>
  );
}
