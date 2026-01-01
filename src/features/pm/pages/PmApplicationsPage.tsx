import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Copy, FileSearch, Plus } from "lucide-react";
import OwnerScopeGate from "@/features/pm/components/OwnerScopeGate";
import { useUserRole } from "@/hooks/useUserRole";
import { useAppSelector } from "@/hooks/redux";
import { selectSelectedOwnerId } from "@/features/pm/slices/pmSlice";
import { useDebounce } from "@/hooks/useDebounce";
import {
  type RentalApplication,
  type RentalApplicationForm,
  type RentalApplicationFormCreate,
  type TenantStatus,
  useCreateApplicationFormMutation,
  useDecideApplicationMutation,
  useListApplicationFormsQuery,
  useListApplicationsQuery,
  useListPmPropertiesQuery,
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
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";

const buildPublicFormUrl = (slug: string) => {
  const apiBase =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    "http://localhost:8000/api/v1";
  return `${apiBase}/pm/public/applications/${slug}`;
};

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

  const formColumns = useMemo<ColumnDef<RentalApplicationForm>[]>(() => {
    return [
      {
        accessorKey: "title",
        header: "Form",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.title}</div>
            <div className="truncate text-xs text-muted-foreground">
              Slug: {row.original.slug}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "property_id",
        header: "Property",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.property_id ? `#${row.original.property_id}` : "Any"}
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Active",
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "outline"}>
            {row.original.is_active ? "yes" : "no"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <Link
                to={`/pm/applications?tab=inbox&form_id=${row.original.id}`}
              >
                Inbox
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = buildPublicFormUrl(row.original.slug);
                void navigator.clipboard.writeText(url);
                toast({
                  title: "Copied",
                  description: "Public form URL copied.",
                });
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy link
            </Button>
          </div>
        ),
      },
    ];
  }, [toast]);

  const appColumns = useMemo<ColumnDef<RentalApplication>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "Application",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">#{row.original.id}</div>
            <div className="truncate text-xs text-muted-foreground">
              Form #{row.original.form_id} • Property #
              {row.original.property_id}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.status}</Badge>
        ),
      },
      {
        id: "applicant",
        header: "Applicant",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate">
              {row.original.applicant_full_name || "—"}
            </div>
            <div className="truncate text-xs text-muted-foreground">
                            {row.original.applicant_phone ||
                row.original.applicant_email ||
                "—"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "submitted_at",
        header: "Submitted",
        cell: ({ row }) =>
          row.original.submitted_at
            ? new Date(row.original.submitted_at).toLocaleString()
            : "—",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/pm/applications/${row.original.id}`}>View</Link>
            </Button>
            <Button
              size="sm"
              disabled={
                decideState.isLoading || row.original.status === "approved"
              }
              onClick={() => openConfirmDialog("approve", row.original)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={
                decideState.isLoading || row.original.status === "rejected"
              }
              onClick={() => openConfirmDialog("reject", row.original)}
            >
              Reject
            </Button>
          </div>
        ),
      },
    ];
  }, [decideState.isLoading, openConfirmDialog]);

  // Create form modal
  const properties = useListPmPropertiesQuery(
    { owner_id: ownerId, limit: 200, offset: 0 },
    { skip: role === "agent" && !ownerId },
  );
  const [createForm, createState] = useCreateApplicationFormMutation();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("Rental Application");
  const [description, setDescription] = useState("");
  const [propertyId, setPropertyId] = useState<string>("");
  const [applicationFeeAmount, setApplicationFeeAmount] = useState("");
  const [questionsJson, setQuestionsJson] = useState("{}");

  const submitCreateForm = async () => {
    let questions: Record<string, unknown> | undefined;
    try {
      questions = questionsJson
        ? (JSON.parse(questionsJson) as Record<string, unknown>)
        : undefined;
    } catch {
      toast({
        title: "Invalid JSON",
        description: "Questions must be valid JSON.",
        variant: "destructive",
      });
      return;
    }

    const selectedPropertyOwnerId = (properties.data || []).find(
      (p) => String(p.id) === String(propertyId),
    )?.owner_id;
    const effectiveOwnerId = ownerId ?? selectedPropertyOwnerId ?? null;
    if (!effectiveOwnerId) {
      toast({
        title: "Select an owner",
        description: "Choose an owner from the top bar or pick a property.",
        variant: "destructive",
      });
      return;
    }

    const payload: RentalApplicationFormCreate = {
      owner_id: effectiveOwnerId,
      property_id: propertyId ? Number(propertyId) : undefined,
      title,
      description: description || undefined,
      application_fee_amount: applicationFeeAmount
        ? Number(applicationFeeAmount)
        : undefined,
      questions,
    };

    try {
      await createForm(payload).unwrap();
      toast({ title: "Created", description: "Application form created." });
      setCreateOpen(false);
    } catch (e: unknown) {
      toast({
        title: "Failed",
        description: getErrorMessage(e, "Could not create form."),
        variant: "destructive",
      });
    }
  };

  const formsCanPrev = formsOffset > 0;
  const formsCanNext = (forms.data?.length ?? 0) >= formsLimit;
  const appsCanPrev = appsOffset > 0;
  const appsCanNext = (applications.data?.length ?? 0) >= appsLimit;

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
            <p className="text-sm text-muted-foreground">
              Create forms, share links, and process submissions.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create form
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create application form</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description (optional)</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Property (optional)</Label>
                  <Select value={propertyId || "any"} onValueChange={(v) => setPropertyId(v === "any" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {(properties.data || []).map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          #{p.id} • {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Application fee (optional)</Label>
                  <Input
                    value={applicationFeeAmount}
                    onChange={(e) => setApplicationFeeAmount(e.target.value)}
                    placeholder="e.g. 500"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Questions (JSON)</Label>
                  <Textarea
                    value={questionsJson}
                    onChange={(e) => setQuestionsJson(e.target.value)}
                    rows={10}
                  />
                  <div className="text-xs text-muted-foreground">
                    MVP stores answers JSON only. Build UI templates in Phase 2.
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    void submitCreateForm();
                  }}
                  disabled={createState.isLoading}
                >
                  {createState.isLoading ? "Creating…" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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

        {tab === "forms" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Application Forms</CardTitle>
              <Badge variant="secondary" className="h-fit">
                <FileSearch className="mr-1 h-3 w-3" />
                {forms.data?.length ?? 0} shown
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  value={formsQ}
                  onChange={(e) => {
                    setFormsQ(e.target.value);
                    setFormsOffset(0);
                  }}
                  placeholder="Search title…"
                />
                <Select
                  value={String(formsLimit)}
                  onValueChange={(v) => {
                    setFormsLimit(Number(v));
                    setFormsOffset(0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {forms.isLoading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : forms.isError ? (
                <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Failed to load forms.</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { void forms.refetch() }}
                  >
                    Retry
                  </Button>
                </div>
              ) : forms.data?.length ? (
                <>
                  <DataTable columns={formColumns} data={forms.data} />
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-muted-foreground">
                      Offset {formsOffset} • Limit {formsLimit}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!formsCanPrev}
                        onClick={() =>
                          setFormsOffset(Math.max(0, formsOffset - formsLimit))
                        }
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!formsCanNext}
                        onClick={() => setFormsOffset(formsOffset + formsLimit)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="No forms"
                  description="Create an application form to start collecting submissions."
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Applications Inbox</CardTitle>
              <Badge variant="secondary" className="h-fit">
                {applications.data?.length ?? 0} shown
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Select
                  value={status || "all"}
                  onValueChange={(v) => {
                    setStatus(v === "all" ? "" : (v as TenantStatus));
                    setAppsOffset(0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="applicant">submitted</SelectItem>
                    <SelectItem value="approved">approved</SelectItem>
                    <SelectItem value="rejected">rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={String(appsLimit)}
                  onValueChange={(v) => {
                    setAppsLimit(Number(v));
                    setAppsOffset(0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {applications.isLoading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : applications.isError ? (
                <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Failed to load applications.</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { void applications.refetch() }}
                  >
                    Retry
                  </Button>
                </div>
              ) : applications.data?.length ? (
                <>
                  <DataTable columns={appColumns} data={applications.data} />
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-muted-foreground">
                      Offset {appsOffset} • Limit {appsLimit}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!appsCanPrev}
                        onClick={() =>
                          setAppsOffset(Math.max(0, appsOffset - appsLimit))
                        }
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!appsCanNext}
                        onClick={() => setAppsOffset(appsOffset + appsLimit)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="No applications"
                  description="Submissions will show up here."
                />
              )}
            </CardContent>
          </Card>
        )}
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
