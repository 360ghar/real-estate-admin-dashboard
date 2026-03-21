import { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, FileText, ShieldCheck, ShieldX } from "lucide-react";
import {
  useDecideApplicationMutation,
  useGetApplicationQuery,
  useListPmDocumentsQuery,
} from "@/features/pm/api/pmApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";

export default function PmApplicationDetailPage() {
  const { applicationId } = useParams();
  const applicationIdNum = Number(applicationId);
  const { toast } = useToast();

  const application = useGetApplicationQuery(applicationIdNum, {
    skip: !applicationIdNum,
  });
  const [decide, decideState] = useDecideApplicationMutation();

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
  }>({ open: false, type: "approve" });

  const handleDecisionConfirm = useCallback(async () => {
    if (!application.data) return;
    const decision = confirmDialog.type === "approve" ? "approved" : "rejected";
    try {
      await decide({
        application_id: application.data.id,
        payload: { decision },
      }).unwrap();
      toast({
        title: confirmDialog.type === "approve" ? "Approved" : "Rejected",
        description: `Application ${decision}.`,
      });
    } catch (e: unknown) {
      toast({
        title: "Failed",
        description: getErrorMessage(
          e,
          `Could not ${confirmDialog.type} application.`,
        ),
        variant: "destructive",
      });
    } finally {
      setConfirmDialog({ open: false, type: "approve" });
    }
  }, [application.data, confirmDialog.type, decide, toast]);

  const docs = useListPmDocumentsQuery(
    {
      owner_id: application.data?.owner_id ?? undefined,
      rental_application_id: applicationIdNum,
      limit: 50,
      offset: 0,
    },
    { skip: !application.data?.owner_id },
  );

  const answersJson = useMemo(() => {
    if (!application.data?.answers) return null;
    try {
      return JSON.stringify(application.data.answers, null, 2);
    } catch {
      return null;
    }
  }, [application.data?.answers]);

  if (!applicationIdNum || Number.isNaN(applicationIdNum)) {
    return (
      <div className="text-sm text-muted-foreground">
        Invalid application id.
      </div>
    );
  }

  if (application.isError) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>Failed to load application.</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { void application.refetch() }}
        >
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
            {application.isLoading
              ? "Loading…"
              : `Application #${application.data?.id ?? applicationIdNum}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Form #{application.data?.form_id} • Property #
            {application.data?.property_id}
          </p>
        </div>
        {application.data ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{application.data.status}</Badge>
            <Button
              size="sm"
              disabled={
                decideState.isLoading || application.data.status === "approved"
              }
              onClick={() => setConfirmDialog({ open: true, type: "approve" })}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={
                decideState.isLoading || application.data.status === "rejected"
              }
              onClick={() => setConfirmDialog({ open: true, type: "reject" })}
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
                  <span className="font-medium">
                    {application.data.applicant_full_name || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">
                    {application.data.applicant_phone || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">
                    {application.data.applicant_email || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium">
                    {application.data.submitted_at
                      ? new Date(application.data.submitted_at).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">Not found.</div>
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
              <Link
                to={`/pm/properties/${application.data?.property_id ?? ""}`}
              >
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
            <div className="text-sm text-muted-foreground">No answers.</div>
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
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{d.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {d.document_type} • Doc #{d.id}
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
            <div className="text-muted-foreground">No documents linked.</div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Approve/Reject */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ open: false, type: "approve" });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === "approve"
                ? "Approve Application"
                : "Reject Application"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === "approve"
                ? `Are you sure you want to approve this application for "${application.data?.applicant_full_name || "this applicant"}"?`
                : `Are you sure you want to reject this application? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={decideState.isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDecisionConfirm()}
              disabled={decideState.isLoading}
              className={
                confirmDialog.type === "reject"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {decideState.isLoading
                ? confirmDialog.type === "approve"
                  ? "Approving…"
                  : "Rejecting…"
                : confirmDialog.type === "approve"
                  ? "Approve"
                  : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
