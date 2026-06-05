import { useState } from "react";
import type { MaintenanceRequest, MaintenanceRequestStatus, MaintenanceRequestUpdate, WorkOrderStatus } from "@/types/pm";
import { MAINTENANCE_REQUEST_STATUSES, WORK_ORDER_STATUSES } from "@/features/pm/constants";
import { Button } from "@/components/ui/button";
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
import { serverTimestampToLocalInput, localInputToServerTimestamp } from "@/lib/dateTime";

interface MaintenanceUpdateFormProps {
  request: MaintenanceRequest;
  defaultAssignedAgentId: number | null;
  onSubmit: (payload: MaintenanceRequestUpdate) => Promise<void>;
  isSubmitting: boolean;
}

export default function MaintenanceUpdateForm({
  request,
  defaultAssignedAgentId,
  onSubmit,
  isSubmitting,
}: MaintenanceUpdateFormProps) {
  const [reqStatus, setReqStatus] = useState<MaintenanceRequestStatus>(request.request_status);
  const [woStatus, setWoStatus] = useState<WorkOrderStatus | "">(request.work_order_status || "");
  const [priority, setPriority] = useState(request.priority || "");
  const [estimatedCost, setEstimatedCost] = useState(request.estimated_cost?.toString() || "");
  const [actualCost, setActualCost] = useState(request.actual_cost?.toString() || "");
  const [scheduledFor, setScheduledFor] = useState(serverTimestampToLocalInput(request.scheduled_for));
  const [completionNotes, setCompletionNotes] = useState(request.completion_notes || "");
  const [assignToMe, setAssignToMe] = useState(defaultAssignedAgentId ? "yes" : "no");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Request status</Label>
          <Select value={reqStatus} onValueChange={(v) => setReqStatus(v as MaintenanceRequestStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_REQUEST_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Work order status</Label>
          <Select value={woStatus || "none"} onValueChange={(v) => setWoStatus(v === "none" ? "" : (v as WorkOrderStatus))}>
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {WORK_ORDER_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Assign to me</Label>
          <Select value={assignToMe} onValueChange={(v) => setAssignToMe(v as "yes" | "no")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority (optional)</Label>
          <Input value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="e.g. P1" />
        </div>
        <div className="space-y-2">
          <Label>Estimated cost (optional)</Label>
          <Input value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Actual cost (optional)</Label>
          <Input value={actualCost} onChange={(e) => setActualCost(e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Scheduled for (optional)</Label>
          <Input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Completion notes (optional)</Label>
          <Textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} rows={3} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          onClick={() => {
            const payload: MaintenanceRequestUpdate = {
              request_status: reqStatus,
              work_order_status: woStatus || undefined,
              assigned_agent_id: assignToMe === "yes" ? defaultAssignedAgentId ?? undefined : undefined,
              priority: priority || undefined,
              estimated_cost: estimatedCost ? Number(estimatedCost) : undefined,
              actual_cost: actualCost ? Number(actualCost) : undefined,
              scheduled_for: localInputToServerTimestamp(scheduledFor) ?? undefined,
              completion_notes: completionNotes || undefined,
            };
            void onSubmit(payload);
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
