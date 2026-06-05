import { useCallback, useState } from "react";
import type { MaintenanceCategory, MaintenanceRequestCreate, MaintenanceUrgency } from "@/types/pm";
import { useCreateMaintenanceRequestMutation, useListPmPropertiesQuery } from "@/features/pm/api/pmApi";
import { MAINTENANCE_CATEGORIES, MAINTENANCE_URGENCIES } from "@/features/pm/constants";
import { useUserRole } from "@/hooks/useUserRole";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";

interface CreateRequestDialogProps {
  ownerId: number | null;
}

export default function CreateRequestDialog({ ownerId }: CreateRequestDialogProps) {
  const { role } = useUserRole();
  const { toast } = useToast();
  const [createRequest, createState] = useCreateMaintenanceRequestMutation();

  const properties = useListPmPropertiesQuery(
    { owner_id: ownerId, limit: 200, offset: 0 },
    { skip: role === "agent" && !ownerId },
  );

  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const [category, setCategory] = useState<MaintenanceCategory>("plumbing");
  const [urgency, setUrgency] = useState<MaintenanceUrgency>("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");

  const resetForm = useCallback(() => {
    setPropertyId("");
    setCategory("plumbing");
    setUrgency("medium");
    setTitle("");
    setDescription("");
    setPreferredContactMethod("");
    setAvailabilityNotes("");
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetForm();
      }
    },
    [resetForm],
  );

  const submit = async () => {
    if (!propertyId || !title) {
      toast({ title: "Missing fields", description: "Property and title are required.", variant: "destructive" });
      return;
    }
    if (isNaN(Number(propertyId))) {
      toast({ title: "Invalid property", description: "Please select a valid property.", variant: "destructive" });
      return;
    }
    const payload: MaintenanceRequestCreate = {
      property_id: Number(propertyId),
      category,
      urgency,
      title,
      description: description || undefined,
      preferred_contact_method: preferredContactMethod || undefined,
      availability_notes: availabilityNotes || undefined,
    };
    try {
      await createRequest(payload).unwrap();
      toast({ title: "Created", description: "Maintenance request created." });
      setOpen(false);
    } catch (e: unknown) {
      toast({ title: "Failed", description: getErrorMessage(e, "Could not create request."), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create maintenance request</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Property</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select property…" />
              </SelectTrigger>
              <SelectContent>
                {(properties.data || []).map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    #{p.id} • {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MaintenanceCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MAINTENANCE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Urgency</Label>
            <Select value={urgency} onValueChange={(v) => setUrgency(v as MaintenanceUrgency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MAINTENANCE_URGENCIES.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description (optional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Preferred contact (optional)</Label>
            <Input value={preferredContactMethod} onChange={(e) => setPreferredContactMethod(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Availability notes (optional)</Label>
            <Input value={availabilityNotes} onChange={(e) => setAvailabilityNotes(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => { void submit(); }} disabled={createState.isLoading}>
            {createState.isLoading ? "Creating…" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
