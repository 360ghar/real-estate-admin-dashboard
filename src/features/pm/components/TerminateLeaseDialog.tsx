import { useCallback, useState } from "react";
import { useTerminatePmLeaseMutation } from "@/features/pm/api/pmApi";
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
import { ShieldX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";

interface TerminateLeaseDialogProps {
  leaseId: number;
  tenantName: string | undefined;
  canTerminate: boolean;
}

export default function TerminateLeaseDialog({
  leaseId,
  tenantName,
  canTerminate,
}: TerminateLeaseDialogProps) {
  const { toast } = useToast();
  const [terminateLease, terminateState] = useTerminatePmLeaseMutation();
  const [open, setOpen] = useState(false);

  const handleConfirm = useCallback(async () => {
    try {
      await terminateLease(leaseId).unwrap();
      toast({ title: "Terminated", description: "Lease terminated." });
    } catch (e: unknown) {
      toast({ title: "Failed", description: getErrorMessage(e, "Could not terminate lease."), variant: "destructive" });
    } finally {
      setOpen(false);
    }
  }, [leaseId, terminateLease, toast]);

  return (
    <>
      <Button
        variant="destructive"
        disabled={!canTerminate || terminateState.isLoading}
        onClick={() => setOpen(true)}
      >
        <ShieldX className="mr-2 h-4 w-4" />
        Terminate
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate Lease</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to terminate this lease? This action will
              end the lease agreement for {tenantName || "the current tenant"} and cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={terminateState.isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirm()}
              disabled={terminateState.isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {terminateState.isLoading ? "Terminating…" : "Terminate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
