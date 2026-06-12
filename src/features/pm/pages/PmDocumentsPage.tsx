import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FolderOpen } from "lucide-react";
import OwnerScopeGate from "@/features/pm/components/OwnerScopeGate";
import UploadDocumentDialog from "@/features/pm/components/UploadDocumentDialog";
import DocumentEditForm from "@/features/pm/components/DocumentEditForm";
import { useUserRole } from "@/hooks/useUserRole";
import { useAppSelector } from "@/hooks/redux";
import { selectSelectedOwnerId } from "@/features/pm/slices/pmSlice";
import type { Document, DocumentType } from "@/types/pm";
import {
  useListPmDocumentsQuery,
  useUpdatePmDocumentMutation,
} from "@/features/pm/api/pmApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { DOCUMENT_TYPES, PAGE_SIZES } from "@/features/pm/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";

export default function PmDocumentsPage() {
  const { role } = useUserRole();
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId);
  const { toast } = useToast();

  const ownerId = selectedOwnerId;
  const canUpload = role !== "admin" || Boolean(ownerId);

  const [docTypeFilter, setDocTypeFilter] = useState<DocumentType | "">("");
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const docs = useListPmDocumentsQuery(
    { owner_id: ownerId, document_type: docTypeFilter || undefined, limit, offset },
    { skip: role === "agent" && !ownerId },
  );

  const [updateDoc, updateDocState] = useUpdatePmDocumentMutation();

  const columns = useMemo<ColumnDef<Document>[]>(() => {
    return [
      {
        accessorKey: "title",
        header: "Document",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.title}</div>
            <div className="truncate text-xs text-muted-foreground">{row.original.document_type} • Doc #{row.original.id}</div>
          </div>
        ),
      },
      {
        id: "linked",
        header: "Linked",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            {row.original.property_id ? `P#${row.original.property_id} ` : ""}
            {row.original.lease_id ? `L#${row.original.lease_id} ` : ""}
            {row.original.user_id ? `U#${row.original.user_id} ` : ""}
          </div>
        ),
      },
      {
        id: "sharing",
        header: "Sharing",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge variant={row.original.shared_with_agent ? "default" : "outline"}>agent</Badge>
            <Badge variant={row.original.shared_with_tenant ? "default" : "outline"}>tenant</Badge>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={row.original.file_url} target="_blank" rel="noreferrer">
                View
              </a>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Edit</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Edit document</DialogTitle>
                </DialogHeader>
                <DocumentEditForm
                  doc={row.original}
                  onSubmit={async (payload) => {
                    try {
                      await updateDoc({ document_id: row.original.id, payload }).unwrap();
                      toast({ title: "Updated", description: "Document updated." });
                    } catch (e: unknown) {
                      toast({ title: "Failed", description: getErrorMessage(e, "Could not update document."), variant: "destructive" });
                    }
                  }}
                  isSubmitting={updateDocState.isLoading}
                />
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ];
  }, [toast, updateDoc, updateDocState.isLoading]);

  const canPrev = offset > 0;
  const canNext = (docs.data?.length ?? 0) >= limit;

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-sm text-muted-foreground">Upload, link, and manage sharing for documents.</p>
          </div>
          <UploadDocumentDialog ownerId={ownerId} canUpload={canUpload} />
        </div>
        {role === "admin" && !ownerId ? (
          <div className="text-sm text-muted-foreground">
            Select an owner from the top bar to upload documents into the correct portfolio.
          </div>
        ) : null}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Document Vault</CardTitle>
            <Badge variant="secondary" className="h-fit">
              <FolderOpen className="mr-1 h-3 w-3" />
              {docs.data?.length ?? 0} shown
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Select value={docTypeFilter} onValueChange={(v) => { setDocTypeFilter(v as DocumentType | ""); setOffset(0); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {DOCUMENT_TYPES.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setOffset(0); }}>
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

            {docs.isLoading ? (
              <LoadingState type="spinner" />
            ) : docs.data?.length ? (
              <>
                <DataTable columns={columns} data={docs.data} />
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    Offset {offset} &bull; Limit {limit}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={!canPrev} onClick={() => setOffset(Math.max(0, offset - limit))}>
                      Prev
                    </Button>
                    <Button variant="outline" size="sm" disabled={!canNext} onClick={() => setOffset(offset + limit)}>
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState title="No documents" description="Upload a document to get started." />
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerScopeGate>
  );
}
