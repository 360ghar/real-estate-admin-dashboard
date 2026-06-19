import { useCallback, useState } from "react";
import type { DocumentType } from "@/types/pm";
import {
  useUploadPmDocumentMutation,
  useUploadSignedPmLeaseMutation,
} from "@/features/pm/api/pmApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";

interface UploadSignedDialogProps {
  leaseId: number;
  ownerId: number;
  propertyId: number;
}

export default function UploadSignedDialog({
  leaseId,
  ownerId,
  propertyId,
}: UploadSignedDialogProps) {
  const { toast } = useToast();
  const [uploadDoc, uploadDocState] = useUploadPmDocumentMutation();
  const [uploadSigned, uploadSignedState] = useUploadSignedPmLeaseMutation();

  const [open, setOpen] = useState(false);
  const [signedFile, setSignedFile] = useState<File | null>(null);
  const [signedByOwner, setSignedByOwner] = useState<"yes" | "no">("yes");
  const [signedByTenant, setSignedByTenant] = useState<"yes" | "no">("no");
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSignedFile(null);
      setSignedByOwner("yes");
      setSignedByTenant("no");
      setFileInputKey((k) => k + 1);
    }
  }, []);

  const submit = async () => {
    if (!signedFile) {
      toast({ title: "Missing file", description: "Choose a signed lease PDF.", variant: "destructive" });
      return;
    }
    if (signedFile.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "File must be under 10MB.", variant: "destructive" });
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", signedFile);
      fd.append("document_type", "lease_agreement" satisfies DocumentType);
      fd.append("title", `Signed lease #${leaseId}`);
      fd.append("owner_id", String(ownerId));
      fd.append("property_id", String(propertyId));
      fd.append("lease_id", String(leaseId));
      fd.append("shared_with_agent", "true");
      fd.append("shared_with_tenant", "true");

      const doc = await uploadDoc(fd).unwrap();
      await uploadSigned({
        lease_id: leaseId,
        payload: {
          lease_document_id: doc.id,
          signed_by_owner: signedByOwner === "yes",
          signed_by_tenant: signedByTenant === "yes",
        },
      }).unwrap();
      toast({ title: "Uploaded", description: "Signed lease attached." });
      setOpen(false);
      setSignedFile(null);
    } catch (e: unknown) {
      toast({ title: "Upload failed", description: getErrorMessage(e, "Please try again."), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          Upload signed
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload signed lease</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>PDF file</Label>
            <Input
              key={fileInputKey}
              type="file"
              accept="application/pdf"
              onChange={(e) => setSignedFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Signed by owner</Label>
              <Select value={signedByOwner} onValueChange={(v) => setSignedByOwner(v as "yes" | "no")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Signed by tenant</Label>
              <Select value={signedByTenant} onValueChange={(v) => setSignedByTenant(v as "yes" | "no")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                void submit();
              }}
              disabled={uploadDocState.isLoading || uploadSignedState.isLoading || !signedFile}
            >
              {uploadDocState.isLoading || uploadSignedState.isLoading ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
