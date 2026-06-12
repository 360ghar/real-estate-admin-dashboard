import { useCallback, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAppSelector } from "@/hooks/redux";
import { selectSelectedOwnerId } from "@/features/pm/slices/pmSlice";
import { useDebounce } from "@/hooks/useDebounce";
import type { RentalApplication, TenantStatus } from "@/types/pm";
import {
  useDecideApplicationMutation,
  useListApplicationFormsQuery,
  useListApplicationsQuery,
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";
import OwnerScopeGate from "@/features/pm/components/OwnerScopeGate";
import { ApplicationTable } from "@/features/pm/components/ApplicationTable";
import { CreateApplicationFormDialog } from "@/features/pm/components/CreateApplicationFormDialog";

export default function PmApplicationsPage() {
  const { role } = useUserRole();
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId);
  const { toast } = useToast();

  const ownerId = selectedOwnerId;

  const [tab, setTab] = useState<"forms" | "inbox">("forms");

  // Forms list
  const [formsQ, setFormsQ] = useState("");
  const debouncedFormsQ = useDebounce(formsQ, 300);
  const [formsLimit, setFormsLimit] = useState(50);
  const [formsOffset, setFormsOffset] = useState(0);
  const forms = useListApplicationFormsQuery(
    {
      owner_id: ownerId,
      q: debouncedFormsQ || undefined,
      limit: formsLimit,
      offset: formsOffset,
    },
    { skip: role === "agent" && !ownerId },
  );

  // Inbox list
  const [status, setStatus] = useState<TenantStatus | "">("");
  const [appsLimit, setAppsLimit] = useState(50);
  const [appsOffset, setAppsOffset] = useState(0);
  const applications = useListApplicationsQuery(
    {
      owner_id: ownerId,
      status: status || undefined,
      limit: appsLimit,
      offset: appsOffset,
    },
    { skip: role === "agent" && !ownerId },
  );

  const [decideApplication, decideState] = useDecideApplicationMutation();

  // Confirmation dialog state for approve/reject actions
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    applicationId: number | null;
    applicantName: string;
  }>({ open: false, type: "approve", applicationId: null, applicantName: "" });

  const handleDecisionConfirm = useCallback(async () => {
    if (!confirmDialog.applicationId) return;
    const decision = confirmDialog.type === "approve" ? "approved" : "rejected";
    try {
      await decideApplication({
        application_id: confirmDialog.applicationId,
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
      setConfirmDialog({
        open: false,
        type: "approve",
        applicationId: null,
        applicantName: "",
      });
    }
  }, [
    confirmDialog.applicationId,
    confirmDialog.type,
    decideApplication,
    toast,
  ]);

  const openConfirmDialog = useCallback(
    (type: "approve" | "reject", application: RentalApplication) => {
      setConfirmDialog({
        open: true,
        type,
        applicationId: application.id,
        applicantName:
          application.applicant_full_name || `Application #${application.id}`,
      });
    },
    [],
  );

  const formsCanPrev = formsOffset > 0;
  const formsCanNext = (forms.data?.length ?? 0) >= formsLimit;
  const appsCanPrev = appsOffset > 0;
  const appsCanNext = (applications.data?.length ?? 0) >= appsLimit;

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Applications</h1>
            <p className="text-sm text-muted-foreground">
              Create forms, share links, and process submissions.
            </p>
          </div>
          <CreateApplicationFormDialog
            ownerId={ownerId}
            isAgentWithoutOwner={role === "agent" && !ownerId}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={tab === "forms" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("forms")}
          >
            Forms
          </Button>
          <Button
            variant={tab === "inbox" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("inbox")}
          >
            Inbox
          </Button>
        </div>

        <ApplicationTable
          tab={tab}
          formsData={forms.data}
          formsIsLoading={forms.isLoading}
          formsIsError={forms.isError}
          formsRefetch={() => { void forms.refetch() }}
          formsOffset={formsOffset}
          formsLimit={formsLimit}
          formsCanPrev={formsCanPrev}
          formsCanNext={formsCanNext}
          onFormsPrev={() => setFormsOffset(Math.max(0, formsOffset - formsLimit))}
          onFormsNext={() => setFormsOffset(formsOffset + formsLimit)}
          formsQ={formsQ}
          onFormsQChange={(q) => { setFormsQ(q); setFormsOffset(0) }}
          formsLimitValue={formsLimit}
          onFormsLimitChange={(l) => { setFormsLimit(l); setFormsOffset(0) }}
          toast={toast}
          applicationsData={applications.data}
          applicationsIsLoading={applications.isLoading}
          applicationsIsError={applications.isError}
          applicationsRefetch={() => { void applications.refetch() }}
          appsOffset={appsOffset}
          appsLimit={appsLimit}
          appsCanPrev={appsCanPrev}
          appsCanNext={appsCanNext}
          onAppsPrev={() => setAppsOffset(Math.max(0, appsOffset - appsLimit))}
          onAppsNext={() => setAppsOffset(appsOffset + appsLimit)}
          status={status}
          onStatusChange={(s) => { setStatus(s); setAppsOffset(0) }}
          appsLimitValue={appsLimit}
          onAppsLimitChange={(l) => { setAppsLimit(l); setAppsOffset(0) }}
          decideIsLoading={decideState.isLoading}
          onApprove={(app) => openConfirmDialog("approve", app)}
          onReject={(app) => openConfirmDialog("reject", app)}
        />
      </div>

      {/* Confirmation Dialog for Approve/Reject */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog({
              open: false,
              type: "approve",
              applicationId: null,
              applicantName: "",
            });
          }
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
                ? `Are you sure you want to approve "${confirmDialog.applicantName}"? This will mark the applicant as approved.`
                : `Are you sure you want to reject "${confirmDialog.applicantName}"? This action cannot be undone.`}
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
    </OwnerScopeGate>
  );
}
