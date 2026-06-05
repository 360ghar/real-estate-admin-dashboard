import { useCallback, useState } from "react";
import type { ManagedPropertyStatus, PmPropertyCreate } from "@/types/pm";
import {
  useCreatePmPropertyMutation,
  useUpdatePmPropertyMutation,
} from "@/features/pm/api/pmApi";
import { VALIDATION } from "@/features/pm/constants";
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
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";

interface PropertyCreateDialogProps {
  ownerId: number | null;
  disabled: boolean;
}

export default function PropertyCreateDialog({
  ownerId,
  disabled,
}: PropertyCreateDialogProps) {
  const { toast } = useToast();
  const [createProperty, createState] = useCreatePmPropertyMutation();
  const [updateProperty] = useUpdatePmPropertyMutation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState<
    "apartment" | "house" | "builder_floor" | "room"
  >("apartment");
  const [purpose, setPurpose] = useState<"rent" | "buy" | "short_stay">("rent");
  const [basePrice, setBasePrice] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [managementStatus, setManagementStatus] =
    useState<ManagedPropertyStatus>("active");
  const [paymentDueDay, setPaymentDueDay] = useState("1");
  const [graceDays, setGraceDays] = useState("5");
  const [lateFeePolicyJson, setLateFeePolicyJson] = useState(
    '{"type":"fixed","amount":0}',
  );

  const resetForm = useCallback(() => {
    setTitle("");
    setPropertyType("apartment");
    setPurpose("rent");
    setBasePrice("");
    setCity("");
    setLocality("");
    setFullAddress("");
    setManagementStatus("active");
    setPaymentDueDay("1");
    setGraceDays("5");
    setLateFeePolicyJson('{"type":"fixed","amount":0}');
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

  const submitCreate = async () => {
    if (!ownerId) {
      toast({
        title: "Select an owner",
        description: "Choose an owner from the top bar.",
        variant: "destructive",
      });
      return;
    }
    if (!title || !basePrice) {
      toast({
        title: "Missing fields",
        description: "Title and base price are required.",
        variant: "destructive",
      });
      return;
    }
    const dueDayNum = Number(paymentDueDay);
    if (
      isNaN(dueDayNum) ||
      dueDayNum < VALIDATION.PAYMENT_DUE_DAY_MIN ||
      dueDayNum > VALIDATION.PAYMENT_DUE_DAY_MAX
    ) {
      toast({
        title: "Invalid due day",
        description: `Payment due day must be between ${VALIDATION.PAYMENT_DUE_DAY_MIN} and ${VALIDATION.PAYMENT_DUE_DAY_MAX}.`,
        variant: "destructive",
      });
      return;
    }
    const graceDaysNum = Number(graceDays);
    if (isNaN(graceDaysNum) || graceDaysNum < 0 || graceDaysNum > 30) {
      toast({
        title: "Invalid grace period",
        description: "Grace period must be between 0 and 30 days.",
        variant: "destructive",
      });
      return;
    }
    const basePriceNum = Number(basePrice);
    if (isNaN(basePriceNum) || basePriceNum <= 0) {
      toast({
        title: "Invalid price",
        description: "Base price must be a positive number.",
        variant: "destructive",
      });
      return;
    }
    let lateFeePolicy: Record<string, unknown> | undefined;
    try {
      lateFeePolicy = lateFeePolicyJson
        ? (JSON.parse(lateFeePolicyJson) as Record<string, unknown>)
        : undefined;
    } catch {
      toast({
        title: "Invalid JSON",
        description: "Late fee policy must be valid JSON.",
        variant: "destructive",
      });
      return;
    }

    const data: PmPropertyCreate = {
      title,
      property_type: propertyType,
      purpose,
      base_price: Number(basePrice),
      city: city || undefined,
      locality: locality || undefined,
      full_address: fullAddress || undefined,
      monthly_rent: purpose === "rent" ? Number(basePrice) : undefined,
    };

    try {
      const created = await createProperty({
        data,
        owner_id: ownerId,
        management_status: managementStatus,
        payment_due_day: Number(paymentDueDay),
        grace_period_days: Number(graceDays),
      }).unwrap();
      try {
        await updateProperty({
          property_id: created.id,
          payload: { late_fee_policy: lateFeePolicy },
        }).unwrap();
      } catch {
        toast({
          title: "Partial success",
          description: "Property created, but late fee policy could not be saved. Please update it manually.",
          variant: "destructive",
        });
        handleOpenChange(false);
        return;
      }
      toast({ title: "Created", description: "Managed property created." });
      handleOpenChange(false);
    } catch (e: unknown) {
      toast({
        title: "Failed",
        description: getErrorMessage(e, "Could not create property."),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>Create</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create managed property</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2BHK in Indiranagar"
            />
          </div>
          <div className="space-y-2">
            <Label>Property type</Label>
            <Select
              value={propertyType}
              onValueChange={(v) =>
                setPropertyType(v as typeof propertyType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">apartment</SelectItem>
                <SelectItem value="house">house</SelectItem>
                <SelectItem value="builder_floor">builder_floor</SelectItem>
                <SelectItem value="room">room</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Purpose</Label>
            <Select
              value={purpose}
              onValueChange={(v) => setPurpose(v as typeof purpose)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">rent</SelectItem>
                <SelectItem value="buy">buy</SelectItem>
                <SelectItem value="short_stay">short_stay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Base price (₹)</Label>
            <Input
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="e.g. 25000"
            />
          </div>
          <div className="space-y-2">
            <Label>City (optional)</Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Locality (optional)</Label>
            <Input
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Full address (optional)</Label>
            <Input
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Management status</Label>
            <Select
              value={managementStatus}
              onValueChange={(v) =>
                setManagementStatus(v as ManagedPropertyStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">draft</SelectItem>
                <SelectItem value="active">active</SelectItem>
                <SelectItem value="archived">archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment due day (1-28)</Label>
            <Input
              value={paymentDueDay}
              onChange={(e) => setPaymentDueDay(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Grace period days</Label>
            <Input
              value={graceDays}
              onChange={(e) => setGraceDays(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Late fee policy (JSON)</Label>
            <Textarea
              value={lateFeePolicyJson}
              onChange={(e) => setLateFeePolicyJson(e.target.value)}
              rows={6}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              void submitCreate();
            }}
            disabled={createState.isLoading}
          >
            {createState.isLoading ? "Creating…" : "Create"}
          </Button>
        </div>
        {disabled ? (
          <div className="text-sm text-muted-foreground">
            Select an owner from the top bar to create a managed
            property in the correct portfolio.
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
